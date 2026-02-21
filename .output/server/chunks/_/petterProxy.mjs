import { u as useRuntimeConfig, c as createError_1, h as getMethod_1, i as getQuery_1, r as readBody_1 } from '../nitro/nitro.mjs';

function getPetterBaseUrl() {
  const config = useRuntimeConfig();
  const url = config.petterApiUrl || "http://localhost:3001";
  return String(url).replace(/\/$/, "");
}
function getPetterSecret() {
  const config = useRuntimeConfig();
  return String(config.petterApiSecret || "");
}
async function proxyToPetter(event, path, options) {
  const baseUrl = getPetterBaseUrl();
  const secret = getPetterSecret();
  if (!secret) {
    throw createError_1({ statusCode: 500, message: "PETTER_API_SECRET not configured" });
  }
  const method = options?.method || getMethod_1(event);
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const query = getQuery_1(event);
  const queryStr = Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : "";
  const headers = {
    "Content-Type": "application/json",
    "X-Report-Secret": secret
  };
  let body;
  if (options?.body !== void 0) {
    body = JSON.stringify(options.body);
  } else if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      const raw = await readBody_1(event);
      body = raw ? JSON.stringify(raw) : void 0;
    } catch {
    }
  }
  const res = await fetch(`${url}${queryStr}`, {
    method,
    headers,
    body
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Invalid response" };
  }
  if (!res.ok) {
    const err = data;
    throw createError_1({
      statusCode: res.status,
      message: err?.error || res.statusText || "Petter API error"
    });
  }
  return data;
}

export { getPetterBaseUrl as a, getPetterSecret as g, proxyToPetter as p };
//# sourceMappingURL=petterProxy.mjs.map
