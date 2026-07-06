export const PASSWORD_MIN_LENGTH = 10;

const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

export type PasswordIssue =
  | "min_length"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special";

export function getPasswordIssues(password: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) issues.push("min_length");
  if (!HAS_UPPER.test(password)) issues.push("uppercase");
  if (!HAS_LOWER.test(password)) issues.push("lowercase");
  if (!HAS_NUMBER.test(password)) issues.push("number");
  if (!HAS_SPECIAL.test(password)) issues.push("special");
  return issues;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordIssues(password).length === 0;
}

const MESSAGES = {
  en: {
    min_length: `At least ${PASSWORD_MIN_LENGTH} characters`,
    uppercase: "At least one uppercase letter",
    lowercase: "At least one lowercase letter",
    number: "At least one number",
    special: "At least one special character",
    summary: "Password must include uppercase, lowercase, a number, and a special character.",
  },
  ro: {
    min_length: `Minim ${PASSWORD_MIN_LENGTH} caractere`,
    uppercase: "Cel puțin o literă mare",
    lowercase: "Cel puțin o literă mică",
    number: "Cel puțin o cifră",
    special: "Cel puțin un caracter special",
    summary:
      "Parola trebuie să aibă litere mari și mici, o cifră și un caracter special.",
  },
} as const;

export function passwordRequirementLabels(lang: "en" | "ro" = "ro"): string[] {
  const m = MESSAGES[lang];
  return [m.min_length, m.uppercase, m.lowercase, m.number, m.special];
}

export function passwordValidationError(
  password: string,
  lang: "en" | "ro" = "en"
): string | null {
  const issues = getPasswordIssues(password);
  if (issues.length === 0) return null;
  const m = MESSAGES[lang];
  if (issues.length === 1) return m[issues[0]!];
  return m.summary;
}
