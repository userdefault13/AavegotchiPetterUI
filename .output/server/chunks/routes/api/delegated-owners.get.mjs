import { d as defineEventHandler_1, a as getHeader_1, c as createError_1 } from '../../nitro/nitro.mjs';
import { g as getPetterSecret, p as proxyToPetter } from '../../_/petterProxy.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const delegatedOwners_get = defineEventHandler_1(async (event) => {
  const secret = getPetterSecret();
  const header = getHeader_1(event, "x-report-secret");
  if (!secret || header !== secret) {
    throw createError_1({ statusCode: 401, message: "Unauthorized" });
  }
  return proxyToPetter(event, "/api/delegated-owners", { method: "GET" });
});

export { delegatedOwners_get as default };
//# sourceMappingURL=delegated-owners.get.mjs.map
