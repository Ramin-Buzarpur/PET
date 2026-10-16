"use client";

/**
 * رمزنگاری سمت کاربر برای دفتر پیشرفت خصوصی.
 * یک «کلید داده» تصادفی تولید می‌شود که همهٔ یادداشت‌ها را رمز می‌کند.
 * همین کلید داده دوبار «پیچیده» (wrap) می‌شود: یک‌بار با کلیدی از عبارت عبور
 * و یک‌بار با کلیدی از کد بازیابی — هرکدام کافی است برای باز کردن دفتر.
 * سرور فقط salt و دو نسخهٔ wrapped را می‌بیند، هرگز خود کلید را.
 */

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function deriveKeyFromSecret(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations: 150000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

function randomRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون حروف/اعداد شبیه‌به‌هم
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if ((i + 1) % 5 === 0 && i !== bytes.length - 1) out += "-";
  }
  return out;
}

async function wrapKey(dataKey: CryptoKey, wrapWith: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", dataKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapWith, raw);
  return `${toBase64(iv.buffer)}.${toBase64(cipher)}`;
}

async function unwrapKey(wrapped: string, wrapWith: CryptoKey): Promise<CryptoKey> {
  const [ivB64, cipherB64] = wrapped.split(".");
  const iv = fromBase64(ivB64);
  const cipher = fromBase64(cipherB64);
  const raw = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, wrapWith, cipher);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

export type JournalSetupResult = {
  salt: string;
  wrappedKeyByPassphrase: string;
  wrappedKeyByRecovery: string;
  recoveryCode: string;
  dataKey: CryptoKey;
};

export async function setupJournal(passphrase: string): Promise<JournalSetupResult> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const dataKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const recoveryCode = randomRecoveryCode();

  const passKey = await deriveKeyFromSecret(passphrase, salt);
  const recKey = await deriveKeyFromSecret(recoveryCode, salt);

  return {
    salt: toBase64(salt.buffer),
    wrappedKeyByPassphrase: await wrapKey(dataKey, passKey),
    wrappedKeyByRecovery: await wrapKey(dataKey, recKey),
    recoveryCode,
    dataKey,
  };
}

export async function unlockWithPassphrase(
  passphrase: string,
  salt: string,
  wrappedKeyByPassphrase: string
): Promise<CryptoKey | null> {
  try {
    const key = await deriveKeyFromSecret(passphrase, fromBase64(salt));
    return await unwrapKey(wrappedKeyByPassphrase, key);
  } catch {
    return null;
  }
}

export async function unlockWithRecoveryCode(
  recoveryCode: string,
  salt: string,
  wrappedKeyByRecovery: string
): Promise<CryptoKey | null> {
  try {
    const key = await deriveKeyFromSecret(recoveryCode.trim().toUpperCase(), fromBase64(salt));
    return await unwrapKey(wrappedKeyByRecovery, key);
  } catch {
    return null;
  }
}

export async function encryptText(dataKey: CryptoKey, plaintext: string): Promise<{ cipher: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    dataKey,
    new TextEncoder().encode(plaintext)
  );
  return { cipher: toBase64(cipher), iv: toBase64(iv.buffer) };
}

export async function decryptText(dataKey: CryptoKey, cipher: string, iv: string): Promise<string> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    dataKey,
    fromBase64(cipher)
  );
  return new TextDecoder().decode(plain);
}
