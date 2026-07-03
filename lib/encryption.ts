import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return buf;
}

// Returns "iv:authTag:ciphertext" (all hex)
export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

// Returns null if ciphertext is not in our encrypted format or decryption fails.
function decryptToken(ciphertext: string): string | null {
  try {
    const key = getKey();
    const parts = ciphertext.split(":");
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
  } catch {
    return null;
  }
}

// Handles both encrypted tokens (new) and legacy plain-text tokens (old rows).
// A value in our iv:tag:ciphertext format that fails to decrypt is a
// configuration error (wrong/rotated TOKEN_ENCRYPTION_KEY) — throw instead of
// silently passing the ciphertext blob downstream as a bearer token.
export function readToken(dbValue: string): string {
  const looksEncrypted = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(dbValue);
  if (!looksEncrypted) return dbValue; // legacy plain-text row
  const decrypted = decryptToken(dbValue);
  if (decrypted === null) {
    throw new Error(
      "Token decryption failed: TOKEN_ENCRYPTION_KEY is wrong or was rotated without re-encrypting stored tokens."
    );
  }
  return decrypted;
}
