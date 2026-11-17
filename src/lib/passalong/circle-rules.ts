import { words } from "@/lib/matching";
import { stripMarkup } from "./safety";

export const CIRCLE_NAME_LIMIT = 50;
export const CIRCLE_DESCRIPTION_LIMIT = 200;
export const OWNED_CIRCLE_LIMIT = 5;
export const CIRCLE_TYPES = ["Class", "Friend group", "Building or street", "Club or team", "Workplace", "Other"] as const;
export const JOIN_RULES = ["open", "request", "invite_only"] as const;
export function generalArea(value: string): boolean {
  const text = stripMarkup(value);
  return text.length > 0 && text.length <= 80 && !/\d|\b(?:apt|apartment|unit|suite)\b/i.test(text);
}
export function orderedCircles<T extends { name: string; general_area: string; member_count: number }>(circles: T[], area: string, search = ""): T[] {
  const mine = words(area);
  const near = (circle: T) => words(circle.general_area).some(word => mine.includes(word));
  return circles.filter(circle => circle.name.toLowerCase().includes(search.toLowerCase())).sort((a,b) => Number(near(b)) - Number(near(a)) || b.member_count - a.member_count || a.name.localeCompare(b.name));
}
export function sharesItemCircle(itemCircles: string[], memberships: string[]): boolean {
  return itemCircles.some(id => memberships.includes(id));
}