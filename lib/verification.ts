import crypto from "crypto";

export const INVALID_VERIFICATION_CODE_MESSAGE =
  "Invalid or expired verification code.";

export const MAX_VERIFICATION_ATTEMPTS = 5;
export const RESEND_MIN_INTERVAL_MS = 60_000;

export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1_000_000).toString();
}
