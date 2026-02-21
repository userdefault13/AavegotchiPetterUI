import { d as defineEventHandler_1, c as createError_1, g as getCookie_1 } from '../../../nitro/nitro.mjs';
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

const me_get = defineEventHandler_1((event) => {
  if (!checkAuth(event)) {
    throw createError_1({
      statusCode: 401,
      message: "Unauthorized"
    });
  }
  const address = getCookie_1(event, "auth_session");
  return { address: address || null };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
