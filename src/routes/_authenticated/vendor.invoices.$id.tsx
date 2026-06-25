import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getInvoice } from "@/lib/invoices.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge, type InvoiceStatus } from "@/components/InvoiceStatusBadge";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/vendor/invoices/$id")({
  head: () => ({ meta: [{ title: "Invoice — Ledgerly" }] }),
  component: InvoiceDetail,
});

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

function InvoiceDetail() {
  const { id } = Route.useParams();
  const get = useServerFn(getInvoice);
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => get({ data: { invoiceId: id } }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-sm text-destructive">Failed to load invoice.</div>;
  }

  const inv = data.invoice;
  const extracted = (inv.extracted_data as any) ?? null;
  const lineItems: any[] = Array.isArray(extracted?.lineItems) ? extracted.lineItems : [];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/vendor" className="text-sm text-muted-foreground inline-flex items-center hover:text-foreground">
          <ArrowLeft className="size-4 mr-1" /> Back to invoices
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {inv.invoice_number || "Pending invoice"}
            </h1>
            <InvoiceStatusBadge status={inv.status as InvoiceStatus} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{inv.vendor_name || "Vendor pending extraction"}</p>
        </div>
        {data.fileUrl && (
          <Button variant="outline" asChild>
            <a href={data.fileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4 mr-2" /> Open original
            </a>
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display">Summary</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <Row label="Issue date" value={inv.issue_date ? format(new Date(inv.issue_date), "PPP") : "—"} />
              <Row label="Due date" value={inv.due_date ? format(new Date(inv.due_date), "PPP") : "—"} />
              <Row label="Subtotal" value={fmtMoney(inv.subtotal as any)} mono />
              <Row label="Tax" value={fmtMoney(inv.tax as any)} mono />
              <Row label="Total" value={fmtMoney(inv.total as any)} mono large />
              <Row label="Extraction" value={inv.extraction_status} />
            </CardContent>
          </Card>

          {lineItems.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="font-display">Line items</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-4 py-2.5 text-xs uppercase tracking-wide">Description</th>
                      <th className="px-4 py-2.5 text-xs uppercase tracking-wide text-right">Qty</th>
                      <th className="px-4 py-2.5 text-xs uppercase tracking-wide text-right">Unit</th>
                      <th className="px-4 py-2.5 text-xs uppercase tracking-wide text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lineItems.map((li, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5">{li.description}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{li.quantity}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{fmtMoney(li.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{fmtMoney(li.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Status timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <TimelineStep done label="Uploaded" date={format(new Date(inv.created_at), "PPP p")} />
              <TimelineStep
                done={["complete"].includes(inv.extraction_status)}
                failed={inv.extraction_status === "failed"}
                label="AI extracted"
              />
              <TimelineStep done={["SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED","PAID"].includes(inv.status)} label="Submitted" />
              <TimelineStep done={["APPROVED","PAID"].includes(inv.status)} failed={inv.status === "REJECTED"} label="Approved" />
              <TimelineStep done={inv.status === "PAID"} label="Paid" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">File</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="truncate">{inv.file_name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{(inv.file_size / 1024).toFixed(0)} KB · {inv.file_mime}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, large }: { label: string; value: React.ReactNode; mono?: boolean; large?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 ${mono ? "font-mono tabular-nums" : ""} ${large ? "text-xl font-semibold" : ""}`}>{value}</div>
    </div>
  );
}

function TimelineStep({ done, failed, label, date }: { done?: boolean; failed?: boolean; label: string; date?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-1 size-2 rounded-full ${
          failed ? "bg-destructive" : done ? "bg-[oklch(0.62_0.16_155)]" : "bg-muted-foreground/30"
        }`}
      />
      <div>
        <div className={`text-sm ${done || failed ? "" : "text-muted-foreground"}`}>{label}</div>
        {date && <div className="text-xs text-muted-foreground">{date}</div>}
      </div>
    </div>
  );
}
