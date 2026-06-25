import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Simple in-memory rate limiter (per-process). Sufficient for a single Worker;
// for stronger guarantees, move to a DB-backed limiter.
const uploadHits = new Map<string, number[]>();
function rateLimitUploads(userId: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = (uploadHits.get(userId) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) throw new Error("Too many uploads. Try again in a minute.");
  arr.push(now);
  uploadHits.set(userId, arr);
}

const CreateInvoiceInput = z.object({
  fileName: z.string().min(1).max(255),
  fileMime: z.enum(["application/pdf", "image/jpeg", "image/png", "image/jpg"]),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024, "Max 25MB"),
});

/**
 * Step 1: create an invoice row in DRAFT/pending and return a signed upload URL.
 * Storage path: invoices/{userId}/{year}/{month}/{invoiceId}/{fileName}
 */
export const createInvoiceUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInvoiceInput.parse(d))
  .handler(async ({ data, context }) => {
    rateLimitUploads(context.userId);
    const { supabase, userId } = context;

    const id = crypto.randomUUID();
    const now = new Date();
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
    const path = `${userId}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${id}/${safeName}`;

    const { data: signed, error: sErr } = await supabase.storage
      .from("invoices")
      .createSignedUploadUrl(path);
    if (sErr || !signed) throw new Error(sErr?.message || "Could not create upload URL");

    const { error: iErr } = await supabase.from("invoices").insert({
      id,
      uploaded_by: userId,
      storage_path: path,
      file_name: data.fileName,
      file_mime: data.fileMime,
      file_size: data.fileSize,
      status: "DRAFT",
      extraction_status: "pending",
    });
    if (iErr) throw new Error(iErr.message);

    return { invoiceId: id, uploadUrl: signed.signedUrl, token: signed.token, path };
  });

/**
 * Step 2: after browser PUTs the file, run AI extraction and persist the parsed fields.
 */
export const runExtraction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ invoiceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: inv, error: gErr } = await supabase
      .from("invoices")
      .select("id, storage_path, file_mime, uploaded_by, status")
      .eq("id", data.invoiceId)
      .single();
    if (gErr || !inv) throw new Error("Invoice not found");
    if (inv.uploaded_by !== userId) throw new Error("Forbidden");
    if (inv.status !== "DRAFT") throw new Error("Only draft invoices can be re-extracted");

    await supabase
      .from("invoices")
      .update({ extraction_status: "processing", extraction_error: null })
      .eq("id", inv.id);

    try {
      const { data: blob, error: dErr } = await supabase.storage
        .from("invoices")
        .download(inv.storage_path);
      if (dErr || !blob) throw new Error(dErr?.message || "Could not download file");

      const buf = new Uint8Array(await blob.arrayBuffer());
      // base64 encode
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) {
        binary += String.fromCharCode(...buf.subarray(i, i + chunk));
      }
      const base64 = btoa(binary);

      const { extractInvoiceFromFile } = await import("@/lib/ai-gateway.server");
      const extracted = await extractInvoiceFromFile({ base64, mimeType: inv.file_mime });

      await supabase
        .from("invoices")
        .update({
          extracted_data: extracted as any,
          invoice_number: extracted.invoiceNumber || null,
          vendor_name: extracted.vendorName || null,
          issue_date: extracted.issueDate || null,
          due_date: extracted.dueDate || null,
          subtotal: extracted.subtotal || null,
          tax: extracted.tax || null,
          total: extracted.total || null,
          extraction_status: "complete",
        })
        .eq("id", inv.id);

      return { ok: true, extracted };
    } catch (e: any) {
      await supabase
        .from("invoices")
        .update({ extraction_status: "failed", extraction_error: e?.message ?? "Extraction failed" })
        .eq("id", inv.id);
      throw e;
    }
  });

const SaveDraftInput = z.object({
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string().max(100),
  vendorName: z.string().max(255),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const saveInvoiceDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveDraftInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("invoices")
      .update({
        invoice_number: data.invoiceNumber || null,
        vendor_name: data.vendorName || null,
        issue_date: data.issueDate || null,
        due_date: data.dueDate || null,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
      })
      .eq("id", data.invoiceId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ invoiceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: inv, error: gErr } = await supabase
      .from("invoices")
      .select("id, status, vendor_name, total, invoice_number")
      .eq("id", data.invoiceId)
      .single();
    if (gErr || !inv) throw new Error("Invoice not found");
    if (!["DRAFT", "REJECTED"].includes(inv.status)) {
      throw new Error(`Cannot submit an invoice in status ${inv.status}`);
    }
    if (!inv.vendor_name || !inv.total) {
      throw new Error("Please fill in vendor and total before submitting");
    }

    const { error } = await supabase
      .from("invoices")
      .update({ status: "SUBMITTED" })
      .eq("id", data.invoiceId);
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      user_id: userId,
      action: "INVOICE_SUBMITTED",
      entity_type: "invoice",
      entity_id: data.invoiceId,
      metadata: { invoice_number: inv.invoice_number } as any,
    });

    return { ok: true };
  });

export const listMyInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, vendor_name, issue_date, due_date, total, status, extraction_status, created_at")
      .eq("uploaded_by", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ invoiceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: inv, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", data.invoiceId)
      .single();
    if (error || !inv) throw new Error(error?.message || "Invoice not found");

    const { data: signed } = await supabase.storage
      .from("invoices")
      .createSignedUrl(inv.storage_path, 60 * 15);

    return { invoice: inv, fileUrl: signed?.signedUrl ?? null };
  });

export const deleteDraftInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ invoiceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: inv } = await supabase
      .from("invoices")
      .select("id, status, uploaded_by, storage_path")
      .eq("id", data.invoiceId)
      .single();
    if (!inv) throw new Error("Not found");
    if (inv.uploaded_by !== userId || inv.status !== "DRAFT") throw new Error("Cannot delete");

    await supabase.storage.from("invoices").remove([inv.storage_path]);
    await supabase.from("invoices").delete().eq("id", data.invoiceId);
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as "ADMIN" | "FINANCE" | "VENDOR");
    const primary = roles.includes("ADMIN")
      ? "ADMIN"
      : roles.includes("FINANCE")
        ? "FINANCE"
        : "VENDOR";
    return { roles, primary };
  });
