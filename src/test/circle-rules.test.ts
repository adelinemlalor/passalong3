import { describe,it,expect } from "vitest";
import { CIRCLE_NAME_LIMIT,CIRCLE_DESCRIPTION_LIMIT,OWNED_CIRCLE_LIMIT,orderedCircles,generalArea,sharesItemCircle } from "@/lib/passalong/circle-rules";
describe("Part 6A circle rules",()=>{
  it("limits circle names to 50 characters",()=>expect(CIRCLE_NAME_LIMIT).toBe(50));
  it("limits circle descriptions to 200 characters",()=>expect(CIRCLE_DESCRIPTION_LIMIT).toBe(200));
  it("limits owned circles to five",()=>expect(OWNED_CIRCLE_LIMIT).toBe(5));
  it("sorts whole-word nearby areas before larger other circles",()=>expect(orderedCircles([{name:"Away",general_area:"Oakland",member_count:99},{name:"Near",general_area:"South Berkeley",member_count:2}],"Berkeley").map(c=>c.name)).toEqual(["Near","Away"]));
  it("never treats partial area words as nearby",()=>expect(orderedCircles([{name:"Partial",general_area:"Berkeleyshire",member_count:9},{name:"Whole",general_area:"Berkeley",member_count:1}],"Berkeley").map(c=>c.name)).toEqual(["Whole","Partial"]));
  it("sorts circles with equal proximity by member count",()=>expect(orderedCircles([{name:"Small",general_area:"Berkeley",member_count:2},{name:"Large",general_area:"Berkeley",member_count:5}],"Berkeley").map(c=>c.name)).toEqual(["Large","Small"]));
  it("searches circle names",()=>expect(orderedCircles([{name:"Garden club",general_area:"Berkeley",member_count:2},{name:"Class",general_area:"Berkeley",member_count:3}],"Berkeley","GARDEN").map(c=>c.name)).toEqual(["Garden club"]));
  it("accepts general areas but rejects numbered addresses",()=>{expect(generalArea("Near campus")).toBe(true);expect(generalArea("123 Example Street")).toBe(false);});
  it("allows access through any posted circle and rejects outsiders",()=>{expect(sharesItemCircle(["a","b"],["b"])).toBe(true);expect(sharesItemCircle(["a","b"],["c"])).toBe(false);});
});