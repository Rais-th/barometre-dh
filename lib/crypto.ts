import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.CASE_ENCRYPTION_KEY;
  if (!raw) {
    // Build-time fallback. At runtime, refuse to operate without a real key.
    if (process.env.NODE_ENV === "production") {
      throw new Error("CASE_ENCRYPTION_KEY is required in production");
    }
    return createHash("sha256").update("dev-only-insecure-key").digest();
  }
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length !== 32) {
    throw new Error("CASE_ENCRYPTION_KEY must be 32 bytes (base64 encoded)");
  }
  return decoded;
}

export function encryptJSON(value: unknown): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Envelope: v1.<iv>.<authTag>.<ciphertext>, each part base64url
  return [
    "v1",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptJSON<T = unknown>(envelope: string): T {
  const key = getKey();
  const parts = envelope.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error("Invalid ciphertext envelope");
  }
  const iv = Buffer.from(parts[1], "base64url");
  const authTag = Buffer.from(parts[2], "base64url");
  const ciphertext = Buffer.from(parts[3], "base64url");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export function generateCaseCode(): string {
  // Human-readable case code: DH-YYMM-XXXX (random, non-sequential to avoid counting victims publicly)
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const rnd = randomBytes(3).toString("hex").toUpperCase();
  return `DH-${yy}${mm}-${rnd}`;
}
