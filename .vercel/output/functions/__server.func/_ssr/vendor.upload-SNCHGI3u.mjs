import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DHZ-_xSp.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CfEwGGLW.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { P as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as FileText, c as Sparkles, d as CircleCheck, f as CircleAlert, l as LoaderCircle, u as CloudUpload } from "../_libs/lucide-react.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as runExtraction, c as useServerFn, o as saveInvoiceDraft, s as submitInvoice, t as createInvoiceUpload } from "./invoices.functions-Cl7e6r5k.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vendor.upload-SNCHGI3u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var ACCEPT = [
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/jpg"
];
var MAX_BYTES = 25 * 1024 * 1024;
function UploadPage() {
	const router = useRouter();
	const [stage, setStage] = (0, import_react.useState)("idle");
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)(null);
	const [invoiceId, setInvoiceId] = (0, import_react.useState)(null);
	const [fields, setFields] = (0, import_react.useState)({
		invoiceNumber: "",
		vendorName: "",
		issueDate: "",
		dueDate: "",
		subtotal: 0,
		tax: 0,
		total: 0
	});
	const [drag, setDrag] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const createUploadFn = useServerFn(createInvoiceUpload);
	const extractFn = useServerFn(runExtraction);
	const saveFn = useServerFn(saveInvoiceDraft);
	const submitFn = useServerFn(submitInvoice);
	const submitMut = useMutation({
		mutationFn: async () => {
			if (!invoiceId) throw new Error("No invoice");
			await saveFn({ data: {
				invoiceId,
				...fields
			} });
			await submitFn({ data: { invoiceId } });
		},
		onSuccess: () => {
			toast.success("Invoice submitted for approval");
			router.navigate({ to: "/vendor" });
		},
		onError: (e) => toast.error(e.message)
	});
	const handleFile = (0, import_react.useCallback)(async (file) => {
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
			const { invoiceId: id, path, token } = await createUploadFn({ data: {
				fileName: file.name,
				fileMime: file.type,
				fileSize: file.size
			} });
			setInvoiceId(id);
			setProgress(35);
			const { error: upErr } = await supabase.storage.from("invoices").uploadToSignedUrl(path, token, file, { contentType: file.type });
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
				total: extracted.total ?? 0
			});
			setStage("review");
		} catch (e) {
			setError(e?.message || "Upload failed");
			setStage("idle");
			setProgress(0);
		}
	}, [createUploadFn, extractFn]);
	function onDrop(e) {
		e.preventDefault();
		setDrag(false);
		const f = e.dataTransfer.files?.[0];
		if (f) handleFile(f);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Upload invoice"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "PDF, JPG, or PNG up to 25 MB. We'll extract the fields automatically."
			})] }),
			stage !== "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onDragOver: (e) => {
						e.preventDefault();
						setDrag(true);
					},
					onDragLeave: () => setDrag(false),
					onDrop,
					onClick: () => stage === "idle" && fileRef.current?.click(),
					className: `relative grid place-items-center text-center border-2 border-dashed rounded-lg m-2 p-12 cursor-pointer transition-colors ${drag ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"} ${stage !== "idle" ? "cursor-default" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileRef,
							type: "file",
							accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
							className: "hidden",
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (f) handleFile(f);
							}
						}),
						stage === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-14 mx-auto rounded-full bg-primary/10 text-primary grid place-items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-7" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: "Drop a file here or click to browse"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "PDF · JPG · PNG · max 25 MB"
								})
							]
						}),
						(stage === "uploading" || stage === "extracting") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 w-full max-w-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-14 mx-auto rounded-full bg-accent/15 text-accent-foreground grid place-items-center",
									children: stage === "uploading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-7 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-7" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: stage === "uploading" ? "Uploading file…" : "AI is reading your invoice…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: stage === "uploading" ? "Encrypting and transferring securely." : "Extracting fields and line items."
								})
							]
						})
					]
				}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-4 mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 mt-0.5" }),
						" ",
						error
					]
				})]
			}) }),
			stage === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-[oklch(0.62_0.16_155)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-display",
					children: "Review extracted fields"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Verify and correct anything our AI missed, then submit for approval." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid sm:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Invoice number",
							value: fields.invoiceNumber,
							onChange: (v) => setFields((f) => ({
								...f,
								invoiceNumber: v
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Vendor name",
							value: fields.vendorName,
							onChange: (v) => setFields((f) => ({
								...f,
								vendorName: v
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Issue date",
							type: "date",
							value: fields.issueDate,
							onChange: (v) => setFields((f) => ({
								...f,
								issueDate: v
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Due date",
							type: "date",
							value: fields.dueDate,
							onChange: (v) => setFields((f) => ({
								...f,
								dueDate: v
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Subtotal",
							value: fields.subtotal,
							onChange: (v) => setFields((f) => ({
								...f,
								subtotal: v
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Tax",
							value: fields.tax,
							onChange: (v) => setFields((f) => ({
								...f,
								tax: v
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Total",
							value: fields.total,
							onChange: (v) => setFields((f) => ({
								...f,
								total: v
							}))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2 border-t",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => router.navigate({ to: "/vendor" }),
						disabled: submitMut.isPending,
						children: "Save draft & exit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => submitMut.mutate(),
						disabled: submitMut.isPending,
						children: [submitMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-2 animate-spin" }), "Submit for approval"]
					})]
				})]
			})] }),
			stage !== "idle" && invoiceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }),
					" Invoice ID: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: invoiceId.slice(0, 8)
					})
				]
			})
		]
	});
}
function Field({ label, value, onChange, type = "text" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type,
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function NumField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			step: "0.01",
			min: "0",
			value: Number.isFinite(value) ? value : 0,
			onChange: (e) => onChange(parseFloat(e.target.value) || 0),
			className: "font-mono tabular-nums"
		})]
	});
}
//#endregion
export { UploadPage as component };
