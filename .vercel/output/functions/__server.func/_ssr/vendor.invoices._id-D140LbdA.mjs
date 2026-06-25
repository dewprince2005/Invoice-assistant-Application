import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CfEwGGLW.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as FileText, o as ExternalLink, s as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as Route } from "./vendor.invoices._id-BVAsA1U9.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as useServerFn, r as getInvoice } from "./invoices.functions-Cl7e6r5k.mjs";
import { n as Skeleton, t as InvoiceStatusBadge } from "./InvoiceStatusBadge-BC9Mx6RF.mjs";
import { t as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vendor.invoices._id-D140LbdA.js
var import_jsx_runtime = require_jsx_runtime();
function fmtMoney(n) {
	if (n == null) return "—";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(Number(n));
}
function InvoiceDetail() {
	const { id } = Route.useParams();
	const get = useServerFn(getInvoice);
	const { data, isLoading, error } = useQuery({
		queryKey: ["invoice", id],
		queryFn: () => get({ data: { invoiceId: id } })
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full" })]
	});
	if (error || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-destructive",
		children: "Failed to load invoice."
	});
	const inv = data.invoice;
	const extracted = inv.extracted_data ?? null;
	const lineItems = Array.isArray(extracted?.lineItems) ? extracted.lineItems : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/vendor",
				className: "text-sm text-muted-foreground inline-flex items-center hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-1" }), " Back to invoices"]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: inv.invoice_number || "Pending invoice"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceStatusBadge, { status: inv.status })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: inv.vendor_name || "Vendor pending extraction"
				})] }), data.fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: data.fileUrl,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 mr-2" }), " Open original"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display",
						children: "Summary"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid sm:grid-cols-2 gap-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Issue date",
								value: inv.issue_date ? format(new Date(inv.issue_date), "PPP") : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Due date",
								value: inv.due_date ? format(new Date(inv.due_date), "PPP") : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Subtotal",
								value: fmtMoney(inv.subtotal),
								mono: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Tax",
								value: fmtMoney(inv.tax),
								mono: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Total",
								value: fmtMoney(inv.total),
								mono: true,
								large: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Extraction",
								value: inv.extraction_status
							})
						]
					})] }), lineItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display",
						children: "Line items"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/50 text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "text-left",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-xs uppercase tracking-wide",
											children: "Description"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-xs uppercase tracking-wide text-right",
											children: "Qty"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-xs uppercase tracking-wide text-right",
											children: "Unit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-xs uppercase tracking-wide text-right",
											children: "Total"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y",
								children: lineItems.map((li, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: li.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right font-mono tabular-nums",
										children: li.quantity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right font-mono tabular-nums",
										children: fmtMoney(li.unitPrice)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right font-mono tabular-nums",
										children: fmtMoney(li.total)
									})
								] }, i))
							})]
						})
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display text-base",
						children: "Status timeline"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineStep, {
								done: true,
								label: "Uploaded",
								date: format(new Date(inv.created_at), "PPP p")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineStep, {
								done: ["complete"].includes(inv.extraction_status),
								failed: inv.extraction_status === "failed",
								label: "AI extracted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineStep, {
								done: [
									"SUBMITTED",
									"UNDER_REVIEW",
									"APPROVED",
									"REJECTED",
									"PAID"
								].includes(inv.status),
								label: "Submitted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineStep, {
								done: ["APPROVED", "PAID"].includes(inv.status),
								failed: inv.status === "REJECTED",
								label: "Approved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineStep, {
								done: inv.status === "PAID",
								label: "Paid"
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display text-base",
						children: "File"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: inv.file_name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground mt-1",
							children: [
								(inv.file_size / 1024).toFixed(0),
								" KB · ",
								inv.file_mime
							]
						})]
					})] })]
				})]
			})
		]
	});
}
function Row({ label, value, mono, large }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs uppercase tracking-wide text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `mt-1 ${mono ? "font-mono tabular-nums" : ""} ${large ? "text-xl font-semibold" : ""}`,
		children: value
	})] });
}
function TimelineStep({ done, failed, label, date }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mt-1 size-2 rounded-full ${failed ? "bg-destructive" : done ? "bg-[oklch(0.62_0.16_155)]" : "bg-muted-foreground/30"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-sm ${done || failed ? "" : "text-muted-foreground"}`,
			children: label
		}), date && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: date
		})] })]
	});
}
//#endregion
export { InvoiceDetail as component };
