import { d as defineEventHandler_1 } from '../../../nitro/nitro.mjs';
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

const check_get = defineEventHandler_1(async (event) => {
  const isAuthenticated = checkAuth(event);
  return { authenticated: isAuthenticated };
});

export { check_get as default };
//# sourceMappingURL=check.get.mjs.map
