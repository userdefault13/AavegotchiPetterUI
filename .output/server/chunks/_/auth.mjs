import { u as useRuntimeConfig, g as getCookie_1, e as deleteCookie_1, f as setCookie_1 } from '../nitro/nitro.mjs';
import { isAddress, verifyMessage } from 'viem';

function ensureRawAddress(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    throw new Error("Address is required");
  }
  if (trimmed.includes(".")) {
    throw new Error("Please use a raw wallet address (0x...). ENS names are not supported on Base.");
  }
  if (!isAddress(trimmed)) {
    throw new Error("Invalid address format. Use a raw wallet address (0x...).");
  }
  return trimmed;
}

const DEFAULT_ALLOWED = "0x2127aa7265d573aa467f1d73554d17890b872e76".toLowerCase();
function parseAllowedAddresses(allowedAddress, allowedAddresses) {
  if (allowedAddresses) {
    return allowedAddresses.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
  }
  if (allowedAddress) {
    return [allowedAddress.toLowerCase()];
  }
  return [DEFAULT_ALLOWED];
}
function isAddressAllowed(address, allowedAddress, allowedAddresses) {
  const list = parseAllowedAddresses(allowedAddress, allowedAddresses);
  return list.includes(address.toLowerCase());
}
async function verifySignature(address, message, signature, allowedAddress, allowedAddresses) {
  try {
    const rawAddr = ensureRawAddress(address);
    const isValid = await verifyMessage({
      address: rawAddr,
      message,
      signature
    });
    return isValid && isAddressAllowed(address, allowedAddress, allowedAddresses);
  } catch {
    return false;
  }
}
function createSession(event, address) {
  const rawAddr = ensureRawAddress(address);
  setCookie_1(event, "auth_session", rawAddr, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7
  });
}
function clearSession(event) {
  deleteCookie_1(event, "auth_session");
}
function checkAuth(event, allowedAddress, allowedAddresses) {
  let allowed = allowedAddress;
  let allowedList = allowedAddresses;
  if (!allowed && !allowedList) {
    try {
      const config = useRuntimeConfig();
      allowed = config.allowedAddress;
      allowedList = config.allowedAddresses;
    } catch {
      allowed = DEFAULT_ALLOWED;
    }
  }
  const session = getCookie_1(event, "auth_session");
  if (!session || session.includes(".")) return false;
  return isAddressAllowed(session, allowed, allowedList);
}

export { clearSession as a, createSession as b, checkAuth as c, ensureRawAddress as e, isAddressAllowed as i, verifySignature as v };
//# sourceMappingURL=auth.mjs.map
