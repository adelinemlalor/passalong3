import { stripMarkup } from "./safety";
export const CUSTOM_CATEGORY_LIMIT = 30;
export const BIO_LIMIT = 160;
export const PICKUP_TIMES = ["Weekday mornings", "Weekday evenings", "Weekends", "Flexible"] as const;
export type Category = { id: string; key: string; name: string; position: number };
export function categoryLabel(category: string, custom: string | null | undefined, categories: Category[]) {
  return category.toLowerCase() === "other" ? `Other · ${custom || "General"}` : categories.find(c=>c.key===category)?.name ?? category;
}
export function memberName(name: string) {
  const parts=stripMarkup(name).split(/\s+/).filter(Boolean);
  return parts.length>1 ? `${parts[0]} ${parts.at(-1)?.slice(0,1)}.` : parts[0] ?? "Circle member";
}