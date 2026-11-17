export type SynonymGroup = { category: string; words: string[] };
export function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(word =>
    word.endsWith("s") && word.length > 3 && !word.endsWith("ss") ? word.slice(0, -1) : word);
}
export function customCategoryKey(text: string): string {
  return text.trim().toLowerCase().split(/\s+/).filter(Boolean).map(word=>word.endsWith("s") && word.length>3 && !word.endsWith("ss") ? word.slice(0,-1) : word).join(" ");
}
export function parseCategory(category: string, custom?: string | null) {
  const other=category.toLowerCase()==="other" || category.toLowerCase().startsWith("other:");
  return { category: other ? "other" : category, custom: customCategoryKey(custom ?? (category.includes(":") ? category.slice(category.indexOf(":")+1) : "")) };
}
/** The sole live matching rule, shared by saved matches and the evaluator. */
export function matchItemWish(
  item: { title: string; category: string; custom_category?: string | null },
  wish: { text: string; category: string; custom_category?: string | null },
  synonyms: SynonymGroup[],
): { match: boolean; reason: string } {
  const aCategory=parseCategory(item.category,item.custom_category), bCategory=parseCategory(wish.category,wish.custom_category);
  if (aCategory.category !== bCategory.category || aCategory.category === "other" && (!aCategory.custom || aCategory.custom !== bCategory.custom)) return { match: false, reason: "Different categories" };
  const title = words(item.title), phrase = words(wish.text);
  const match = title.some(a => phrase.some(b => a === b || synonyms.some(group => {
    const normalized = group.words.flatMap(words);
    return group.category === item.category && normalized.includes(a) && normalized.includes(b);
  })));
  return { match, reason: match ? `Matches your wishlist: ${wish.text}` : "No shared whole word or category synonym" };
}