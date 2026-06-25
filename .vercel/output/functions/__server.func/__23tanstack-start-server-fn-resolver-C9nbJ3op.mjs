//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-C9nbJ3op.js
var manifest = {
	"0899724275be050508dc15401672ca3000bd1121daf79f5971fc6a1a340c1000": {
		functionName: "getMyRole_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"54d89f8e39712e9db36b65babac89e76cda523260aa8845a75724bdcc634dd4f": {
		functionName: "getInvoice_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"61462a395f87d81077b88308cf90a0c3c27d7e0cd057e89be1a8abf63dd5a1b4": {
		functionName: "deleteDraftInvoice_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"b3923eef7fb65a03a2a75c29202b4c28a9b8378409005c1e0c27784187a39a8b": {
		functionName: "saveInvoiceDraft_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"b870f179598724ed9b1a4b497cd144461fdb678e90e20c08ef34d392853e2cf8": {
		functionName: "listMyInvoices_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"c974ef5f4aee6a3b6e676860cc44d7e19356c5afe3eec74ab9d4d46b864c9996": {
		functionName: "submitInvoice_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"ca1aa07c28297ca1acfb284deed4f5cd15045a7f537dc5109b6968606546e390": {
		functionName: "createInvoiceUpload_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	},
	"e773993163210d22643b9630893baa55966815fbdeb51a2c82379ea9daf97423": {
		functionName: "runExtraction_createServerFn_handler",
		importer: () => import("./_ssr/invoices.functions-gWT-MM73.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
