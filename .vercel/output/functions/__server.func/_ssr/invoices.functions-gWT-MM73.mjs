import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-DZO41X7i.mjs";
import { a as stringType, i as objectType, n as literalType, r as numberType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices.functions-gWT-MM73.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var uploadHits = /* @__PURE__ */ new Map();
function rateLimitUploads(userId, max = 10, windowMs = 6e4) {
	const now = Date.now();
	const arr = (uploadHits.get(userId) ?? []).filter((t) => now - t < windowMs);
	if (arr.length >= max) throw new Error("Too many uploads. Try again in a minute.");
	arr.push(now);
	uploadHits.set(userId, arr);
}
var CreateInvoiceInput = objectType({
	fileName: stringType().min(1).max(255),
	fileMime: enumType([
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/jpg"
	]),
	fileSize: numberType().int().positive().max(25 * 1024 * 1024, "Max 25MB")
});
/**
* Step 1: create an invoice row in DRAFT/pending and return a signed upload URL.
* Storage path: invoices/{userId}/{year}/{month}/{invoiceId}/{fileName}
*/
var createInvoiceUpload_createServerFn_handler = createServerRpc({
	id: "ca1aa07c28297ca1acfb284deed4f5cd15045a7f537dc5109b6968606546e390",
	name: "createInvoiceUpload",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => createInvoiceUpload.__executeServer(opts));
var createInvoiceUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => CreateInvoiceInput.parse(d)).handler(createInvoiceUpload_createServerFn_handler, async ({ data, context }) => {
	rateLimitUploads(context.userId);
	const { supabase, userId } = context;
	const id = crypto.randomUUID();
	const now = /* @__PURE__ */ new Date();
	const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
	const path = `${userId}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${id}/${safeName}`;
	const { data: signed, error: sErr } = await supabase.storage.from("invoices").createSignedUploadUrl(path);
	if (sErr || !signed) throw new Error(sErr?.message || "Could not create upload URL");
	const { error: iErr } = await supabase.from("invoices").insert({
		id,
		uploaded_by: userId,
		storage_path: path,
		file_name: data.fileName,
		file_mime: data.fileMime,
		file_size: data.fileSize,
		status: "DRAFT",
		extraction_status: "pending"
	});
	if (iErr) throw new Error(iErr.message);
	return {
		invoiceId: id,
		uploadUrl: signed.signedUrl,
		token: signed.token,
		path
	};
});
var runExtraction_createServerFn_handler = createServerRpc({
	id: "e773993163210d22643b9630893baa55966815fbdeb51a2c82379ea9daf97423",
	name: "runExtraction",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => runExtraction.__executeServer(opts));
var runExtraction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(runExtraction_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: inv, error: gErr } = await supabase.from("invoices").select("id, storage_path, file_mime, uploaded_by, status").eq("id", data.invoiceId).single();
	if (gErr || !inv) throw new Error("Invoice not found");
	if (inv.uploaded_by !== userId) throw new Error("Forbidden");
	if (inv.status !== "DRAFT") throw new Error("Only draft invoices can be re-extracted");
	await supabase.from("invoices").update({
		extraction_status: "processing",
		extraction_error: null
	}).eq("id", inv.id);
	try {
		const { data: blob, error: dErr } = await supabase.storage.from("invoices").download(inv.storage_path);
		if (dErr || !blob) throw new Error(dErr?.message || "Could not download file");
		const buf = new Uint8Array(await blob.arrayBuffer());
		let binary = "";
		const chunk = 32768;
		for (let i = 0; i < buf.length; i += chunk) binary += String.fromCharCode(...buf.subarray(i, i + chunk));
		const base64 = btoa(binary);
		const { extractInvoiceFromFile } = await import("./ai-gateway.server-BXTUySJa.mjs");
		const extracted = await extractInvoiceFromFile({
			base64,
			mimeType: inv.file_mime
		});
		await supabase.from("invoices").update({
			extracted_data: extracted,
			invoice_number: extracted.invoiceNumber || null,
			vendor_name: extracted.vendorName || null,
			issue_date: extracted.issueDate || null,
			due_date: extracted.dueDate || null,
			subtotal: extracted.subtotal || null,
			tax: extracted.tax || null,
			total: extracted.total || null,
			extraction_status: "complete"
		}).eq("id", inv.id);
		return {
			ok: true,
			extracted
		};
	} catch (e) {
		await supabase.from("invoices").update({
			extraction_status: "failed",
			extraction_error: e?.message ?? "Extraction failed"
		}).eq("id", inv.id);
		throw e;
	}
});
var SaveDraftInput = objectType({
	invoiceId: stringType().uuid(),
	invoiceNumber: stringType().max(100),
	vendorName: stringType().max(255),
	issueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).or(literalType("")),
	dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).or(literalType("")),
	subtotal: numberType().nonnegative(),
	tax: numberType().nonnegative(),
	total: numberType().nonnegative()
});
var saveInvoiceDraft_createServerFn_handler = createServerRpc({
	id: "b3923eef7fb65a03a2a75c29202b4c28a9b8378409005c1e0c27784187a39a8b",
	name: "saveInvoiceDraft",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => saveInvoiceDraft.__executeServer(opts));
var saveInvoiceDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => SaveDraftInput.parse(d)).handler(saveInvoiceDraft_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { error } = await supabase.from("invoices").update({
		invoice_number: data.invoiceNumber || null,
		vendor_name: data.vendorName || null,
		issue_date: data.issueDate || null,
		due_date: data.dueDate || null,
		subtotal: data.subtotal,
		tax: data.tax,
		total: data.total
	}).eq("id", data.invoiceId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var submitInvoice_createServerFn_handler = createServerRpc({
	id: "c974ef5f4aee6a3b6e676860cc44d7e19356c5afe3eec74ab9d4d46b864c9996",
	name: "submitInvoice",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => submitInvoice.__executeServer(opts));
var submitInvoice = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(submitInvoice_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: inv, error: gErr } = await supabase.from("invoices").select("id, status, vendor_name, total, invoice_number").eq("id", data.invoiceId).single();
	if (gErr || !inv) throw new Error("Invoice not found");
	if (!["DRAFT", "REJECTED"].includes(inv.status)) throw new Error(`Cannot submit an invoice in status ${inv.status}`);
	if (!inv.vendor_name || !inv.total) throw new Error("Please fill in vendor and total before submitting");
	const { error } = await supabase.from("invoices").update({ status: "SUBMITTED" }).eq("id", data.invoiceId);
	if (error) throw new Error(error.message);
	await supabase.from("audit_log").insert({
		user_id: userId,
		action: "INVOICE_SUBMITTED",
		entity_type: "invoice",
		entity_id: data.invoiceId,
		metadata: { invoice_number: inv.invoice_number }
	});
	return { ok: true };
});
var listMyInvoices_createServerFn_handler = createServerRpc({
	id: "b870f179598724ed9b1a4b497cd144461fdb678e90e20c08ef34d392853e2cf8",
	name: "listMyInvoices",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => listMyInvoices.__executeServer(opts));
var listMyInvoices = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMyInvoices_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("invoices").select("id, invoice_number, vendor_name, issue_date, due_date, total, status, extraction_status, created_at").eq("uploaded_by", userId).order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getInvoice_createServerFn_handler = createServerRpc({
	id: "54d89f8e39712e9db36b65babac89e76cda523260aa8845a75724bdcc634dd4f",
	name: "getInvoice",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => getInvoice.__executeServer(opts));
var getInvoice = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(getInvoice_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: inv, error } = await supabase.from("invoices").select("*").eq("id", data.invoiceId).single();
	if (error || !inv) throw new Error(error?.message || "Invoice not found");
	const { data: signed } = await supabase.storage.from("invoices").createSignedUrl(inv.storage_path, 900);
	return {
		invoice: inv,
		fileUrl: signed?.signedUrl ?? null
	};
});
var deleteDraftInvoice_createServerFn_handler = createServerRpc({
	id: "61462a395f87d81077b88308cf90a0c3c27d7e0cd057e89be1a8abf63dd5a1b4",
	name: "deleteDraftInvoice",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => deleteDraftInvoice.__executeServer(opts));
var deleteDraftInvoice = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(deleteDraftInvoice_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: inv } = await supabase.from("invoices").select("id, status, uploaded_by, storage_path").eq("id", data.invoiceId).single();
	if (!inv) throw new Error("Not found");
	if (inv.uploaded_by !== userId || inv.status !== "DRAFT") throw new Error("Cannot delete");
	await supabase.storage.from("invoices").remove([inv.storage_path]);
	await supabase.from("invoices").delete().eq("id", data.invoiceId);
	return { ok: true };
});
var getMyRole_createServerFn_handler = createServerRpc({
	id: "0899724275be050508dc15401672ca3000bd1121daf79f5971fc6a1a340c1000",
	name: "getMyRole",
	filename: "src/lib/invoices.functions.ts"
}, (opts) => getMyRole.__executeServer(opts));
var getMyRole = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyRole_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
	const roles = (data ?? []).map((r) => r.role);
	return {
		roles,
		primary: roles.includes("ADMIN") ? "ADMIN" : roles.includes("FINANCE") ? "FINANCE" : "VENDOR"
	};
});
//#endregion
export { createInvoiceUpload_createServerFn_handler, deleteDraftInvoice_createServerFn_handler, getInvoice_createServerFn_handler, getMyRole_createServerFn_handler, listMyInvoices_createServerFn_handler, runExtraction_createServerFn_handler, saveInvoiceDraft_createServerFn_handler, submitInvoice_createServerFn_handler };
