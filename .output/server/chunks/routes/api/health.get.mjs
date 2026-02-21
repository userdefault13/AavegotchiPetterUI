import { d as defineEventHandler_1 } from '../../nitro/nitro.mjs';
import { p as proxyToPetter } from '../../_/petterProxy.mjs';
import { c as checkAuth } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'viem';

const health_get = defineEventHandler_1(async (event) => {
  if (!checkAuth(event)) {
    return {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "aavegotchi-petter-dashboard",
      message: "Login for full health stats"
    };
  }
  return proxyToPetter(event, "/api/health", { method: "GET" });
});

export { health_get as default };
//# sourceMappingURL=health.get.mjs.map
