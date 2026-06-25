import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DHZ-_xSp.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { P as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DE1DjtAv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IndexRedirect() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (!data.user) {
				router.navigate({
					to: "/auth",
					replace: true
				});
				return;
			}
			router.navigate({
				to: "/vendor",
				replace: true
			});
		})();
	}, [router]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center text-sm text-muted-foreground",
		children: "Loading…"
	});
}
//#endregion
export { IndexRedirect as component };
