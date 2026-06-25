import "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./button-DRsC1qZi.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var STYLES = {
	DRAFT: "bg-muted text-muted-foreground border-border",
	SUBMITTED: "bg-[oklch(0.93_0.05_240)] text-[oklch(0.32_0.1_250)] border-transparent",
	UNDER_REVIEW: "bg-[oklch(0.94_0.08_75)] text-[oklch(0.35_0.12_60)] border-transparent",
	APPROVED: "bg-[oklch(0.92_0.09_155)] text-[oklch(0.32_0.13_155)] border-transparent",
	REJECTED: "bg-[oklch(0.93_0.08_27)] text-[oklch(0.42_0.18_27)] border-transparent",
	PAID: "bg-primary text-primary-foreground border-transparent"
};
var LABELS = {
	DRAFT: "Draft",
	SUBMITTED: "Submitted",
	UNDER_REVIEW: "Under review",
	APPROVED: "Approved",
	REJECTED: "Rejected",
	PAID: "Paid"
};
function InvoiceStatusBadge({ status, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		className: cn("font-medium tracking-tight", STYLES[status], className),
		children: LABELS[status]
	});
}
//#endregion
export { Skeleton as n, InvoiceStatusBadge as t };
