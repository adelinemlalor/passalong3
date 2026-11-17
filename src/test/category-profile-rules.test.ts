import {describe,it,expect} from "vitest";
import {matchItemWish} from "@/lib/matching";
import {evaluateCsv} from "@/lib/match-evaluation";
import {CUSTOM_CATEGORY_LIMIT,BIO_LIMIT,memberName,PICKUP_TIMES} from "@/lib/passalong/category-rules";
describe("Part 6B",()=>{
 it("limits custom labels to 30 characters",()=>expect(CUSTOM_CATEGORY_LIMIT).toBe(30));
 it("limits bios to 160 characters",()=>expect(BIO_LIMIT).toBe(160));
 it("matches other lamp and lamps after trim and lowercase",()=>expect(matchItemWish({title:"Desk lamp",category:"other",custom_category:" Lamps "},{text:"lamp",category:"other",custom_category:"lamp"},[]).match).toBe(true));
 it("requires both custom labels to agree",()=>expect(matchItemWish({title:"Desk lamp",category:"other",custom_category:"lamps"},{text:"lamp",category:"other",custom_category:"lighting"},[]).match).toBe(false));
 it("never matches a custom category to a named category",()=>{expect(matchItemWish({title:"lamp",category:"other",custom_category:"Furniture"},{text:"lamp",category:"Furniture"},[]).match).toBe(false);expect(matchItemWish({title:"lamp",category:"Furniture"},{text:"lamp",category:"other",custom_category:"Furniture"},[]).match).toBe(false);});
 it("still never matches pots to pothos",()=>expect(matchItemWish({title:"pothos",category:"other:plants"},{text:"pots",category:"other:plant"},[]).match).toBe(false));
 it("bulk other:text calls the same matching rule",()=>expect(evaluateCsv('item_title,item_category,wish_text,wish_category\nlamp,other:Lamps,lamp,other:lamp',[])[0]?.match).toBe(true));
 it("abbreviates other member names",()=>expect(memberName("Jordan Kelly")).toBe("Jordan K."));
 it("keeps the four requested pickup preferences",()=>expect(PICKUP_TIMES).toEqual(["Weekday mornings","Weekday evenings","Weekends","Flexible"]));
 for(const [left,right] of [["makeup","cosmetics"],["lotion","moisturizer"],["perfume","fragrance"],["polish","nail polish"]])it(`supports Beauty ${left} and ${right}`,()=>expect(matchItemWish({title:left??"",category:"Beauty"},{text:right??"",category:"Beauty"},[{category:"Beauty",words:[left??"",right??""]}]).match).toBe(true));
});