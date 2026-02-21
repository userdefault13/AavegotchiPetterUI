import { d as defineEventHandler_1, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { c as checkAuth } from '../../../_/auth.mjs';
import { a as getPetterBaseUrl, g as getPetterSecret } from '../../../_/petterProxy.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'viem';

const trigger_get = defineEventHandler_1(async (event) => {
  const authenticated = checkAuth(event);
  if (!authenticated) {
    return { success: false, error: "Unauthorized", hint: "Connect wallet and sign in first" };
  }
  const config = useRuntimeConfig();
  const petterUrl = getPetterBaseUrl();
  const hasSecret = !!getPetterSecret();
  let petterOk = false;
  try {
    const res = await fetch(`${petterUrl}/api/bot/status`, {
      headers: { "X-Report-Secret": getPetterSecret() }
    });
    petterOk = res.ok;
  } catch {
    petterOk = false;
  }
  const issues = [];
  if (!hasSecret) {
    issues.push("PETTER_API_SECRET not set in .env");
  }
  if (!petterOk) {
    issues.push("Petter API unreachable - is Aavegotchi-Petter running? Check PETTER_API_URL");
  }
  return {
    success: true,
    diagnostic: {
      petterUrl: petterUrl.slice(0, 50) + "...",
      hasSecret,
      petterOk,
      petterAddress: config.petterAddress || "0x9a3E95f448f3daB367dd9213D4554444faa272F1",
      baseRpcUrl: (config.baseRpcUrl || "https://mainnet.base.org").slice(0, 50) + "...",
      readyToTrigger: hasSecret && petterOk,
      issues: issues.length > 0 ? issues : null
    }
  };
});

export { trigger_get as default };
//# sourceMappingURL=trigger.get.mjs.map
