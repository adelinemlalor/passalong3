export const CATEGORIES = [
  "Household",
  "Furniture",
  "Books",
  "Puzzles & games",
  "Garden",
  "Pets",
  "Clothing",
  "Sports",
  "Electronics",
  "Other",
] as const;
export const CONDITIONS = ["New", "Like new", "Good", "Fair"] as const;
export const PICKUP_AREAS = [
  "Near campus",
  "Downtown Berkeley",
  "North Berkeley",
  "South Berkeley",
  "West Berkeley",
  "Elmwood",
  "Other general area",
] as const;
export const ITEM_LIFETIME_DAYS = 7;
export const RENEWAL_NOTICE_DAYS = 2;
export const CLAIM_LIFETIME_HOURS = 48;
export const CLEAROUT_PRICE = 25;
export const EVENT_NAMES = [
  "circle_link_opened",
  "item_link_opened",
  "signed_up",
  "joined_circle",
  "wish_added",
  "item_posted",
  "post_nudge_shown",
  "item_shared",
  "match_created",
  "match_notification_sent",
  "swipe_right",
  "swipe_left",
  "item_claimed",
  "pickup_arranged",
  "picked_up",
  "thanked",
  "claim_expired",
  "item_expired",
  "item_renewed",
  "item_marked_donated",
  "notify_me_tapped",
  "clearout_interest_yes",
  "clearout_interest_no",
  "circle_created",
  "circle_search_opened",
  "circle_join_requested",
  "circle_join_approved",
  "circle_joined_from_search",
  "circle_left",
  "member_removed",
  "profile_updated",
  "custom_category_used",
  "category_promoted",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];
import { matchItemWish, words } from "@/lib/matching";
export { words } from "@/lib/matching";
export function matchesWish(
  item: { title: string; category: string },
  wish: { text: string; category: string },
  synonyms: { category: string; words: string[] }[],
): boolean {
  return matchItemWish(item, wish, synonyms).match;
}
export function mainWord(title: string) {
  return (
    words(title).find(
      (word) => !["a", "an", "the", "for", "with", "and", "my", "of"].includes(word),
    ) ??
    words(title)[0] ??
    ""
  );
}
export function quietHours(now: Date): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
  return hour >= 21 || hour < 8;
}
export function safeNext(value: unknown): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/";
}
export function liveHead(
  title: string,
  description = "Give useful items a new home with your Haas FTMBA 2027 circle.",
) {
  const full = `${title} · Passalong`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
