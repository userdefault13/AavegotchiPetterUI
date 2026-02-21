import { d as defineEventHandler_1, c as createError_1, b as getRouterParam_1 } from '../../../nitro/nitro.mjs';
import { p as proxyToPetter } from '../../../_/petterProxy.mjs';
import { c as checkAuth } from '../../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'viem';

const _hash__get = defineEventHandler_1(async (event) => {
  if (!checkAuth(event)) {
    throw createError_1({ statusCode: 401, message: "Unauthorized" });
  }
  const hash = getRouterParam_1(event, "hash");
  if (!hash) {
    throw createError_1({ statusCode: 400, message: "Transaction hash required" });
  }
  return proxyToPetter(event, `/api/transactions/${hash}`, { method: "GET" });
});

export { _hash__get as default };
//# sourceMappingURL=_hash_.get.mjs.map
