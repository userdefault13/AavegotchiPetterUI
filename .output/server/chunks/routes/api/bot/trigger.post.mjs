import { d as defineEventHandler_1, s as setResponseStatus_1 } from '../../../nitro/nitro.mjs';
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

function toErrorMsg(err) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return String(err);
  } catch {
    return "Unknown error";
  }
}
const trigger_post = defineEventHandler_1(async (event) => {
  try {
    if (!checkAuth(event)) {
      setResponseStatus_1(event, 200);
      return { success: false, error: "Unauthorized" };
    }
    const result = await proxyToPetter(event, "/api/bot/trigger", { method: "POST" });
    setResponseStatus_1(event, 200);
    return { success: true, result };
  } catch (error) {
    const msg = toErrorMsg(error);
    setResponseStatus_1(event, 200);
    return { success: false, error: msg };
  }
});

export { trigger_post as default };
//# sourceMappingURL=trigger.post.mjs.map
