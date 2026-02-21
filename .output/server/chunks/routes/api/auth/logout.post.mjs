import { d as defineEventHandler_1 } from '../../../nitro/nitro.mjs';
import { a as clearSession } from '../../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'viem';

const logout_post = defineEventHandler_1(async (event) => {
  clearSession(event);
  return { success: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
