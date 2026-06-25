import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { t as Card } from "./card-CfEwGGLW.mjs";
import { P as useRouter, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as FileText, n as Trash2, t as Upload } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as useServerFn, i as listMyInvoices, n as deleteDraftInvoice } from "./invoices.functions-Cl7e6r5k.mjs";
import { n as Skeleton, t as InvoiceStatusBadge } from "./InvoiceStatusBadge-BC9Mx6RF.mjs";
import { t as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vendor.index-D3b9Xj0A.js
var import_jsx_runtime = require_jsx_runtime();
function fmtMoney(n) {
	if (n == null) return "—";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(Number(n));
}
function VendorHome() {
	const router = useRouter();
	const qc = useQueryClient();
	const list = useServerFn(listMyInvoices);
	const del = useServerFn(deleteDraftInvoice);
	const { data, isLoading } = useQuery({
		queryKey: ["myInvoices"],
		queryFn: () => list()
	});
	const delMut = useMutation({
		mutationFn: (id) => del({ data: { invoiceId: id } }),
		onSuccess: () => {
			toast.success("Draft deleted");
			qc.invalidateQueries({ queryKey: ["myInvoices"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const counts = (data ?? []).reduce((acc, i) => {
		acc.total++;
		if (i.status === "DRAFT") acc.draft++;
		else if (i.status === "SUBMITTED" || i.status === "UNDER_REVIEW") acc.pending++;
		else if (i.status === "APPROVED" || i.status === "PAID") acc.approved++;
		return acc;
	}, {
		total: 0,
		draft: 0,
		pending: 0,
		approved: 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold tracking-tight",
					children: "My invoices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Upload an invoice, review the AI-extracted fields, then submit for approval."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => router.navigate({ to: "/vendor/upload" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-2" }), " Upload invoice"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total",
						value: counts.total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Drafts",
						value: counts.draft,
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "In review",
						value: counts.pending
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Approved",
						value: counts.approved
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/50 text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Invoice #" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Vendor" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Issued" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Due" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
										className: "text-right",
										children: "Total"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { className: "w-12" })
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y",
							children: [
								isLoading && Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 7,
									className: "p-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-full" })
								}) }, i)),
								!isLoading && (data?.length ?? 0) === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 7,
									className: "p-12 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-10 mx-auto text-muted-foreground/50 mb-3" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: "No invoices yet"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground mt-1",
											children: "Upload your first invoice to get started."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											className: "mt-4",
											onClick: () => router.navigate({ to: "/vendor/upload" }),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-2" }), " Upload invoice"]
										})
									]
								}) }),
								data?.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/vendor/invoices/$id",
											params: { id: inv.id },
											className: "font-medium hover:underline",
											children: inv.invoice_number || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Pending…"
											})
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: inv.vendor_name || "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: inv.issue_date ? format(new Date(inv.issue_date), "MMM d, yyyy") : "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
											className: "text-right font-mono tabular-nums",
											children: fmtMoney(inv.total)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceStatusBadge, { status: inv.status }) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: inv.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											onClick: () => {
												if (confirm("Delete this draft?")) delMut.mutate(inv.id);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-muted-foreground" })
										}) })
									]
								}, inv.id))
							]
						})]
					})
				})
			})
		]
	});
}
function Stat({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-2 font-display text-3xl font-semibold tabular-nums ${accent ? "text-accent-foreground" : ""}`,
			children: value
		})]
	});
}
function Th({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `px-4 py-3 text-xs font-medium uppercase tracking-wide ${className}`,
		children
	});
}
function Td({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `px-4 py-3 ${className}`,
		children
	});
}
//#endregion
export { VendorHome as component };
