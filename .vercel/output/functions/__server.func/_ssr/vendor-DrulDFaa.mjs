import { t as supabase } from "./client-DHZ-_xSp.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { P as useRouter, d as Outlet, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as FileText, i as LogOut, r as Receipt, t as Upload } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vendor-DrulDFaa.js
var import_jsx_runtime = require_jsx_runtime();
function AppShell({ children, role }) {
	const router = useRouter();
	async function signOut() {
		await supabase.auth.signOut();
		router.navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-16 items-center gap-2 px-6 border-b border-sidebar-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display font-semibold text-lg tracking-tight",
							children: "Ledgerly"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex-1 px-3 py-6 space-y-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
							to: "/vendor",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }),
							children: "My invoices"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
							to: "/vendor/upload",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }),
							children: "Upload"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 border-t border-sidebar-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-3 py-2 text-xs uppercase tracking-wide opacity-60",
							children: role ?? "Vendor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
							onClick: signOut,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 mr-2" }), "Sign out"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur px-4 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 font-display font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4" }), " Ledgerly"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: signOut,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "md:pl-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-4 md:px-8 py-8",
					children
				})
			})
		]
	});
}
function NavLink({ to, icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
		activeProps: { className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" },
		activeOptions: { exact: true },
		children: [icon, children]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
	role: "Vendor",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
});
//#endregion
export { SplitComponent as component };
