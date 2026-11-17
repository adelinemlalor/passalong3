import { describe, it, expect } from "vitest";
import { matchItemWish } from "@/lib/matching";
import { evaluateCsv, resultsCsv } from "@/lib/match-evaluation";
import { eligibleEmail, stripMarkup, validText, TITLE_LIMIT, WISH_LIMIT } from "@/lib/passalong/safety";
describe("Part 5 rules", () => {
  it("limits titles to 80 characters",()=>{expect(TITLE_LIMIT).toBe(80);expect(validText("a".repeat(80),80)).toBe(true);expect(validText("a".repeat(81),80)).toBe(false);});
  it("limits wishes to 60 characters",()=>{expect(WISH_LIMIT).toBe(60);expect(validText("a".repeat(60),60)).toBe(true);expect(validText("a".repeat(61),60)).toBe(false);});
  it("strips HTML and script while preserving emoji",()=>expect(stripMarkup('<b>Plant 🌱</b><script>alert(1)</script>')).toBe("Plant 🌱"));
  it("requires Berkeley's exact email domain",()=>{expect(eligibleEmail("Member@BERKELEY.EDU","berkeley.edu")).toBe(true);expect(eligibleEmail("member@fakeberkeley.edu","berkeley.edu")).toBe(false);expect(eligibleEmail("member@berkeley.edu.evil.test","berkeley.edu")).toBe(false);});
  it("returns the author's private wish as the reason",()=>expect(matchItemWish({title:"Plant pots",category:"Garden"},{text:"pots",category:"Garden"},[])).toEqual({match:true,reason:"Matches your wishlist: pots"}));
  it("bulk cases invoke the same rule including quoted CSV and categories",()=>{const rows=evaluateCsv('item_title,item_category,wish_text,wish_category\n"Pots, small",Garden,pot,Garden\nPothos,Garden,pots,Garden\nDog,other:toys,dog,Pets',[]);expect(rows.map(r=>r.match)).toEqual([true,false,false]);expect(evaluateCsv(resultsCsv(rows),[]).map(r=>r.match)).toEqual([true,false,false]);});
  it("protects CSV downloads from spreadsheet formulas",()=>{const rows=evaluateCsv('item_title,item_category,wish_text,wish_category\n=pot,Garden,pot,Garden',[]);expect(resultsCsv(rows)).toContain("'=pot");});
});