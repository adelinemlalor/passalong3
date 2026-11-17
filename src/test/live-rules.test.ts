import { describe, it, expect } from "vitest";
import {
  matchesWish,
  words,
  quietHours,
  safeNext,
  ITEM_LIFETIME_DAYS,
  RENEWAL_NOTICE_DAYS,
  CLAIM_LIFETIME_HOURS,
  CLEAROUT_PRICE,
  EVENT_NAMES,
} from "@/lib/passalong/live-rules";
import { features } from "@/lib/passalong/features";
describe("Real Passalong rules", () => {
  it("matches whole words with simple plurals", () =>
    expect(
      matchesWish(
        { title: "Plant pots", category: "Garden" },
        { text: "pot", category: "Garden" },
        [],
      ),
    ).toBe(true));
  it("never matches pots to pothos", () =>
    expect(
      matchesWish(
        { title: "Pothos plant", category: "Garden" },
        { text: "pots", category: "Garden" },
        [],
      ),
    ).toBe(false));
  it("requires the same category", () =>
    expect(
      matchesWish({ title: "Dog toys", category: "Pets" }, { text: "dog", category: "Garden" }, []),
    ).toBe(false));
  it("matches category synonyms", () =>
    expect(
      matchesWish(
        { title: "Seedlings", category: "Garden" },
        { text: "seeds", category: "Garden" },
        [{ category: "Garden", words: ["seeds", "seedlings"] }],
      ),
    ).toBe(true));
  it("does not use synonyms from another category", () =>
    expect(
      matchesWish({ title: "Puppy toy", category: "Pets" }, { text: "dog", category: "Pets" }, [
        { category: "Garden", words: ["dog", "puppy"] },
      ]),
    ).toBe(false));
  it("splits punctuation and lowercases", () =>
    expect(words("POTS, seeds!")).toEqual(["pot", "seed"]));
  it("expires items in 7 days", () => expect(ITEM_LIFETIME_DAYS).toBe(7));
  it("notifies two days before expiry", () => expect(RENEWAL_NOTICE_DAYS).toBe(2));
  it("requires pickup within 48 hours", () => expect(CLAIM_LIFETIME_HOURS).toBe(48));
  it("tests a $25 price without payments", () => expect(CLEAROUT_PRICE).toBe(25));
  it("defers all listed prototype features by default", () =>
    expect(Object.values(features).every((v) => v === false)).toBe(true));
  it("holds notifications from 9 pm", () =>
    expect(quietHours(new Date("2026-11-17T05:00:00Z"))).toBe(true));
  it("ends quiet hours at 8 am", () =>
    expect(quietHours(new Date("2026-11-17T16:00:00Z"))).toBe(false));
  it("rejects an external return URL", () => expect(safeNext("//evil.example")).toBe("/"));
  it("preserves same-origin item paths", () => expect(safeNext("/i/123")).toBe("/i/123"));
  it("retains original events and adds circle and profile category events", () => expect(EVENT_NAMES).toHaveLength(33));
});
