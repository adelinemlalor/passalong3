export const TITLE_LIMIT = 80;
export const WISH_LIMIT = 60;
export function stripMarkup(text: string): string {
  return text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<[^>]*>/g, "").trim();
}
export function validText(text: string, max: number): boolean {
  const clean = stripMarkup(text);
  return clean.length > 0 && Array.from(clean).length <= max;
}
export function eligibleEmail(email: string, domain: string | null): boolean {
  return !domain || email.trim().toLowerCase().split("@").length === 2 && email.trim().toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}