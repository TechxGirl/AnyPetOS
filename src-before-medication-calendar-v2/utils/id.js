// =====================================================
// 🟢 Safe ID Helpers
//
// crypto.randomUUID() only works in secure browser contexts.
// localhost usually works, deployed HTTPS works, but local network
// testing over http://192.168.x.x may not.
// These helpers keep beta/local testing from breaking.
// =====================================================

export function createRandomString(byteCount = 16) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  try {
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.getRandomValues) {
      const values = cryptoApi.getRandomValues(new Uint8Array(byteCount));
      return Array.from(values)
        .map((value) => alphabet[value % alphabet.length])
        .join("");
    }
  } catch {
    // Fall through to non-crypto fallback below.
  }

  let fallback = "";
  for (let index = 0; index < byteCount; index += 1) {
    fallback += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return fallback;
}

export function createId(prefix = "id") {
  try {
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.randomUUID) {
      return cryptoApi.randomUUID();
    }
  } catch {
    // Fall through to portable fallback below.
  }

  const time = Date.now().toString(36);
  const random = createRandomString(18);
  return `${prefix}-${time}-${random}`;
}
