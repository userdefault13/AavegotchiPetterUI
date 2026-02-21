import { d as defineEventHandler_1, r as readBody_1, c as createError_1, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { e as ensureRawAddress, i as isAddressAllowed, v as verifySignature, b as createSession } from '../../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'viem';

const verify_post = defineEventHandler_1(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody_1(event);
  const { address, message, signature } = body;
  if (!address || !message || !signature) {
    throw createError_1({
      statusCode: 400,
      message: "Missing required fields"
    });
  }
  try {
    ensureRawAddress(address);
  } catch (addrErr) {
    throw createError_1({
      statusCode: 400,
      message: addrErr?.message || "Invalid address. Use a raw wallet address (0x...). ENS is not supported on Base."
    });
  }
  const allowedAddress = config.allowedAddress;
  const allowedAddresses = config.allowedAddresses;
  if (!isAddressAllowed(address, allowedAddress, allowedAddresses)) {
    throw createError_1({
      statusCode: 403,
      message: "Address not whitelisted"
    });
  }
  const isValid = await verifySignature(address, message, signature, allowedAddress, allowedAddresses);
  if (!isValid) {
    throw createError_1({
      statusCode: 401,
      message: "Invalid signature"
    });
  }
  createSession(event, address);
  return { success: true, address };
});

export { verify_post as default };
//# sourceMappingURL=verify.post.mjs.map
