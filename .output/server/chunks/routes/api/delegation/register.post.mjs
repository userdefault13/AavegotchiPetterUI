import { d as defineEventHandler_1, c as createError_1, g as getCookie_1 } from '../../../nitro/nitro.mjs';
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

const register_post = defineEventHandler_1(async (event) => {
  if (!checkAuth(event)) {
    throw createError_1({ statusCode: 401, message: "Unauthorized" });
  }
  const session = getCookie_1(event, "auth_session");
  if (!session) {
    throw createError_1({ statusCode: 401, message: "Not authenticated" });
  }
  return proxyToPetter(event, "/api/delegation/register", {
    method: "POST",
    body: { ownerAddress: session }
  });
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
