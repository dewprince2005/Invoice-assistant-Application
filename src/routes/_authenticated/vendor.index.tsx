import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyInvoices, deleteDraftInvoice } from "@/lib/invoices.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge, type InvoiceStatus } from "@/components/InvoiceStatusBadge";
import { Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/vendor/")({
  head: () => ({
    meta: [{ title: "My invoices — Ledgerly" }],
  }),
  component: VendorHome,
});

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

function VendorHome() {
  const router = useRouter();
  const qc = useQueryClient();
  const list = useServerFn(listMyInvoices);
  const del = useServerFn(deleteDraftInvoice);
  const { data, isLoading } = useQuery({
    queryKey: ["myInvoices"],
    queryFn: () => list(),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { invoiceId: id } }),
    onSuccess: () => {
      toast.success("Draft deleted");
      qc.invalidateQueries({ queryKey: ["myInvoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const counts = (data ?? []).reduce(
    (acc, i) => {
      acc.total++;
      if (i.status === "DRAFT") acc.draft++;
      else if (i.status === "SUBMITTED" || i.status === "UNDER_REVIEW") acc.pending++;
      else if (i.status === "APPROVED" || i.status === "PAID") acc.approved++;
      return acc;
    },
    { total: 0, draft: 0, pending: 0, approved: 0 },
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload an invoice, review the AI-extracted fields, then submit for approval.
          </p>
        </div>
        <Button onClick={() => router.navigate({ to: "/vendor/upload" })}>
          <Upload className="size-4 mr-2" /> Upload invoice
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total" value={counts.total} />
        <Stat label="Drafts" value={counts.draft} accent />
        <Stat label="In review" value={counts.pending} />
        <Stat label="Approved" value={counts.approved} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <Th>Invoice #</Th>
                <Th>Vendor</Th>
                <Th>Issued</Th>
                <Th>Due</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
              ))}
              {!isLoading && (data?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <FileText className="size-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="font-medium">No invoices yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload your first invoice to get started.</p>
                    <Button className="mt-4" onClick={() => router.navigate({ to: "/vendor/upload" })}>
                      <Upload className="size-4 mr-2" /> Upload invoice
                    </Button>
                  </td>
                </tr>
              )}
              {data?.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <Td>
                    <Link
                      to="/vendor/invoices/$id"
                      params={{ id: inv.id }}
                      className="font-medium hover:underline"
                    >
                      {inv.invoice_number || <span className="text-muted-foreground">Pending…</span>}
                    </Link>
                  </Td>
                  <Td>{inv.vendor_name || "—"}</Td>
                  <Td>{inv.issue_date ? format(new Date(inv.issue_date), "MMM d, yyyy") : "—"}</Td>
                  <Td>{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</Td>
                  <Td className="text-right font-mono tabular-nums">{fmtMoney(inv.total as any)}</Td>
                  <Td><InvoiceStatusBadge status={inv.status as InvoiceStatus} /></Td>
                  <Td>
                    {inv.status === "DRAFT" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this draft?")) delMut.mutate(inv.id);
                        }}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-semibold tabular-nums ${accent ? "text-accent-foreground" : ""}`}>
        {value}
      </div>
    </Card>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-xs font-medium uppercase tracking-wide ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
