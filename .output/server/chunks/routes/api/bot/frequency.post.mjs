import { d as defineEventHandler_1, c as createError_1 } from '../../../nitro/nitro.mjs';
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

const frequency_post = defineEventHandler_1(async (event) => {
  if (!checkAuth(event)) {
    throw createError_1({ statusCode: 401, message: "Unauthorized" });
  }
  return proxyToPetter(event, "/api/bot/frequency", { method: "POST" });
});

export { frequency_post as default };
//# sourceMappingURL=frequency.post.mjs.map
