import {describe,it,expect} from "vitest";
import {suggestedTimes,calendarFile,PICKUP_STYLES,GIVER_REPLIES,RECEIVER_REPLIES,THANK_LIMIT} from "@/lib/passalong/pickup-rules";
describe("explicit pickup rules",()=>{
 it("supports the four giver-selected styles",()=>expect(PICKUP_STYLES).toEqual(["Porch pickup","Hand-off at my place","Meet up nearby","I can drop it off"]));
 it("offers the five fallback slots without booking",()=>expect(suggestedTimes(new Date("2026-11-17T18:15:00Z"),[])).toEqual(["2026-11-17T21:00:00.000Z","2026-11-18T03:00:00.000Z","2026-11-18T17:00:00.000Z","2026-11-18T20:30:00.000Z","2026-11-21T18:00:00.000Z"]));
 it("excludes passed slots and produces five future slots at night",()=>{const now=new Date("2026-11-18T06:00:00Z");const slots=suggestedTimes(now,[]);expect(slots).toHaveLength(5);expect(slots.every(s=>new Date(s)>now)).toBe(true);});
 it("uses the giver's weekday morning preference",()=>{const slots=suggestedTimes(new Date("2026-11-17T18:15:00Z"),["Weekday mornings"]);expect(slots[0]).toBe("2026-11-18T17:00:00.000Z");expect(slots).toHaveLength(5);});
 it("respects Los Angeles daylight saving",()=>expect(suggestedTimes(new Date("2027-07-12T14:00:00Z"),["Weekday mornings"])[0]).toBe("2027-07-12T16:00:00.000Z"));
 it("exports only a title and time, never a location",()=>{const ics=calendarFile("Book\nLOCATION:private","2026-11-18T17:00:00Z");expect(ics).toContain("DTSTART:20261118T170000Z");expect(ics).not.toMatch(/\r\nLOCATION:/);expect(ics).toContain("SUMMARY:Book\\nLOCATION:private");});
 it("limits optional thanks to 200 characters",()=>expect(THANK_LIMIT).toBe(200));
 it("keeps four receiver replies and style-specific giver replies",()=>{expect(RECEIVER_REPLIES).toHaveLength(4);expect(GIVER_REPLIES["Porch pickup"]).toContain("I'll leave it on my porch 📦");expect(GIVER_REPLIES["I can drop it off"]).toContain("I can drop it off — where's good?");});
});