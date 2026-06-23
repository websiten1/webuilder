/** Minimal cn — joins truthy class strings. Drop-in for clsx/tw-merge for basic use. */
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(" ");
}
