import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { createInvoiceUpload, runExtraction, saveInvoiceDraft, submitInvoice } from "@/lib/invoices.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/upload")({
  head: () => ({ meta: [{ title: "Upload invoice — Ledgerly" }] }),
  component: UploadPage,
});

type Stage = "idle" | "uploading" | "extracting" | "review" | "submitting";

const ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_BYTES = 25 * 1024 * 1024;

function UploadPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [fields, setFields] = useState({
    invoiceNumber: "",
    vendorName: "",
    issueDate: "",
    dueDate: "",
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const createUploadFn = useServerFn(createInvoiceUpload);
  const extractFn = useServerFn(runExtraction);
  const saveFn = useServerFn(saveInvoiceDraft);
  const submitFn = useServerFn(submitInvoice);

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!invoiceId) throw new Error("No invoice");
      await saveFn({ data: { invoiceId, ...fields } });
      await submitFn({ data: { invoiceId } });
    },
    onSuccess: () => {
      toast.success("Invoice submitted for approval");
      router.navigate({ to: "/vendor" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!ACCEPT.includes(file.type)) {
        setError("Only PDF, JPG, or PNG files are supported.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("File is over 25 MB.");
        return;
      }

      try {
        setStage("uploading");
        setProgress(15);

        const { invoiceId: id, path, token } = await createUploadFn({
          data: { fileName: file.name, fileMime: file.type as any, fileSize: file.size },
        });
        setInvoiceId(id);
        setProgress(35);

        const { error: upErr } = await supabase.storage
          .from("invoices")
          .uploadToSignedUrl(path, token, file, { contentType: file.type });
        if (upErr) throw new Error(upErr.message);

        setProgress(60);
        setStage("extracting");

        const { extracted } = await extractFn({ data: { invoiceId: id } });
        setProgress(100);
        setFields({
          invoiceNumber: extracted.invoiceNumber ?? "",
          vendorName: extracted.vendorName ?? "",
          issueDate: extracted.issueDate ?? "",
          dueDate: extracted.dueDate ?? "",
          subtotal: extracted.subtotal ?? 0,
          tax: extracted.tax ?? 0,
          total: extracted.total ?? 0,
        });
        setStage("review");
      } catch (e: any) {
        setError(e?.message || "Upload failed");
        setStage("idle");
        setProgress(0);
      }
    },
    [createUploadFn, extractFn],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Upload invoice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, JPG, or PNG up to 25 MB. We'll extract the fields automatically.
        </p>
      </div>

      {stage !== "review" && (
        <Card>
          <CardContent className="p-0">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => stage === "idle" && fileRef.current?.click()}
              className={`relative grid place-items-center text-center border-2 border-dashed rounded-lg m-2 p-12 cursor-pointer transition-colors ${
                drag ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
              } ${stage !== "idle" ? "cursor-default" : ""}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />

              {stage === "idle" && (
                <div className="space-y-3">
                  <div className="size-14 mx-auto rounded-full bg-primary/10 text-primary grid place-items-center">
                    <UploadCloud className="size-7" />
                  </div>
                  <div className="font-medium">Drop a file here or click to browse</div>
                  <div className="text-xs text-muted-foreground">PDF · JPG · PNG · max 25 MB</div>
                </div>
              )}

              {(stage === "uploading" || stage === "extracting") && (
                <div className="space-y-4 w-full max-w-sm">
                  <div className="size-14 mx-auto rounded-full bg-accent/15 text-accent-foreground grid place-items-center">
                    {stage === "uploading" ? (
                      <Loader2 className="size-7 animate-spin" />
                    ) : (
                      <Sparkles className="size-7" />
                    )}
                  </div>
                  <div className="font-medium">
                    {stage === "uploading" ? "Uploading file…" : "AI is reading your invoice…"}
                  </div>
                  <Progress value={progress} />
                  <div className="text-xs text-muted-foreground">
                    {stage === "uploading" ? "Encrypting and transferring securely." : "Extracting fields and line items."}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mx-4 mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5" /> {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stage === "review" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-[oklch(0.62_0.16_155)]" />
              <CardTitle className="font-display">Review extracted fields</CardTitle>
            </div>
            <CardDescription>
              Verify and correct anything our AI missed, then submit for approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Invoice number" value={fields.invoiceNumber} onChange={(v) => setFields((f) => ({ ...f, invoiceNumber: v }))} />
              <Field label="Vendor name" value={fields.vendorName} onChange={(v) => setFields((f) => ({ ...f, vendorName: v }))} />
              <Field label="Issue date" type="date" value={fields.issueDate} onChange={(v) => setFields((f) => ({ ...f, issueDate: v }))} />
              <Field label="Due date" type="date" value={fields.dueDate} onChange={(v) => setFields((f) => ({ ...f, dueDate: v }))} />
              <NumField label="Subtotal" value={fields.subtotal} onChange={(v) => setFields((f) => ({ ...f, subtotal: v }))} />
              <NumField label="Tax" value={fields.tax} onChange={(v) => setFields((f) => ({ ...f, tax: v }))} />
              <NumField label="Total" value={fields.total} onChange={(v) => setFields((f) => ({ ...f, total: v }))} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => router.navigate({ to: "/vendor" })}
                disabled={submitMut.isPending}
              >
                Save draft & exit
              </Button>
              <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
                {submitMut.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Submit for approval
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage !== "idle" && invoiceId && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <FileText className="size-3.5" /> Invoice ID: <span className="font-mono">{invoiceId.slice(0, 8)}</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="font-mono tabular-nums"
      />
    </div>
  );
}
