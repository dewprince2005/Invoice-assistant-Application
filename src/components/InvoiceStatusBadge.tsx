import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type InvoiceStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PAID";

const STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SUBMITTED: "bg-[oklch(0.93_0.05_240)] text-[oklch(0.32_0.1_250)] border-transparent",
  UNDER_REVIEW: "bg-[oklch(0.94_0.08_75)] text-[oklch(0.35_0.12_60)] border-transparent",
  APPROVED: "bg-[oklch(0.92_0.09_155)] text-[oklch(0.32_0.13_155)] border-transparent",
  REJECTED: "bg-[oklch(0.93_0.08_27)] text-[oklch(0.42_0.18_27)] border-transparent",
  PAID: "bg-primary text-primary-foreground border-transparent",
};

const LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
};

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium tracking-tight", STYLES[status], className)}>
      {LABELS[status]}
    </Badge>
  );
}
