import { r as __toESM } from "../_runtime.mjs";
import { s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { P as useRouter, T as isRedirect } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-DZO41X7i.mjs";
import { a as stringType, i as objectType, n as literalType, r as numberType, t as enumType } from "../_libs/zod.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-C9nbJ3op.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices.functions-Cl7e6r5k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var CreateInvoiceInput = objectType({
	fileName: stringType().min(1).max(255),
	fileMime: enumType([
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/jpg"
	]),
	fileSize: numberType().int().positive().max(25 * 1024 * 1024, "Max 25MB")
});
/**
* Step 1: create an invoice row in DRAFT/pending and return a signed upload URL.
* Storage path: invoices/{userId}/{year}/{month}/{invoiceId}/{fileName}
*/
var createInvoiceUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => CreateInvoiceInput.parse(d)).handler(createSsrRpc("ca1aa07c28297ca1acfb284deed4f5cd15045a7f537dc5109b6968606546e390"));
/**
* Step 2: after browser PUTs the file, run AI extraction and persist the parsed fields.
*/
var runExtraction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(createSsrRpc("e773993163210d22643b9630893baa55966815fbdeb51a2c82379ea9daf97423"));
var SaveDraftInput = objectType({
	invoiceId: stringType().uuid(),
	invoiceNumber: stringType().max(100),
	vendorName: stringType().max(255),
	issueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).or(literalType("")),
	dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).or(literalType("")),
	subtotal: numberType().nonnegative(),
	tax: numberType().nonnegative(),
	total: numberType().nonnegative()
});
var saveInvoiceDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => SaveDraftInput.parse(d)).handler(createSsrRpc("b3923eef7fb65a03a2a75c29202b4c28a9b8378409005c1e0c27784187a39a8b"));
var submitInvoice = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(createSsrRpc("c974ef5f4aee6a3b6e676860cc44d7e19356c5afe3eec74ab9d4d46b864c9996"));
var listMyInvoices = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b870f179598724ed9b1a4b497cd144461fdb678e90e20c08ef34d392853e2cf8"));
var getInvoice = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(createSsrRpc("54d89f8e39712e9db36b65babac89e76cda523260aa8845a75724bdcc634dd4f"));
var deleteDraftInvoice = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ invoiceId: stringType().uuid() }).parse(d)).handler(createSsrRpc("61462a395f87d81077b88308cf90a0c3c27d7e0cd057e89be1a8abf63dd5a1b4"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("0899724275be050508dc15401672ca3000bd1121daf79f5971fc6a1a340c1000"));
//#endregion
export { runExtraction as a, useServerFn as c, listMyInvoices as i, deleteDraftInvoice as n, saveInvoiceDraft as o, getInvoice as r, submitInvoice as s, createInvoiceUpload as t };
