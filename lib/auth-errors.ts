import type { Lang } from "@/lib/i18n";

// Auth API routes return fixed English error strings (see app/api/auth/*).
// This maps the known ones to Romanian for display on the (now bilingual)
// auth pages, without having to thread `lang` through every route response.
// Password-requirement messages aren't here — those routes accept a `lang`
// body field and return the message already localized (see lib/password.ts).
const MAP: Record<string, string> = {
  "Email and password are required.": "Emailul și parola sunt obligatorii.",
  "Invalid email or password.": "Email sau parolă incorecte.",
  "Please verify your email before logging in.": "Te rugăm să-ți verifici emailul înainte de a te autentifica.",
  "Not authenticated.": "Neautentificat.",
  "Current and new password are required.": "Parola actuală și cea nouă sunt obligatorii.",
  "User not found.": "Utilizator negăsit.",
  "Current password is incorrect.": "Parola actuală este incorectă.",
  "Failed to update password. Please try again.": "Actualizarea parolei a eșuat. Încearcă din nou.",
  "Too many requests. Please try again later.": "Prea multe cereri. Încearcă din nou mai târziu.",
  "Email is required.": "Emailul este obligatoriu.",
  "Token and new password are required.": "Token-ul și parola nouă sunt obligatorii.",
  "This reset link is invalid or has expired.": "Acest link de resetare nu este valid sau a expirat.",
  "This verification link is invalid or has expired. Please request a new one.": "Acest link de verificare nu este valid sau a expirat. Solicită unul nou.",
  "Verification failed. Please try again.": "Verificarea a eșuat. Încearcă din nou.",
  "Email and code are required.": "Emailul și codul sunt obligatorii.",
  "Please enter the 6-digit code.": "Introdu codul de 6 cifre.",
  "Invalid or expired verification code.": "Cod de verificare incorect sau expirat.",
  "Too many signup attempts. Please try again later.": "Prea multe încercări de înregistrare. Încearcă din nou mai târziu.",
  "All fields are required.": "Toate câmpurile sunt obligatorii.",
  "Please enter a valid email address.": "Introdu o adresă de email validă.",
  "Passwords do not match.": "Parolele nu coincid.",
  "An account with this email already exists.": "Există deja un cont cu acest email.",
  "Could not send the verification code. Please try again.": "Codul de verificare nu a putut fi trimis. Încearcă din nou.",
  "Account created but we could not send the code. Check server console or use Resend below.": "Contul a fost creat, dar codul nu a putut fi trimis. Folosește butonul de retrimitere.",
  "Something went wrong. Please try again.": "Ceva nu a mers bine. Încearcă din nou.",
};

export function translateAuthError(message: string, lang: Lang): string {
  if (lang === "en") return message;
  return MAP[message] ?? message;
}
