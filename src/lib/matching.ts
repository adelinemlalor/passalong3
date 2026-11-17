export type SynonymGroup = { category: string; words: string[] };
export function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(word =>
    word.endsWith("s") && word.length > 3 && !word.endsWith("ss") ? word.slice(0, -1) : word);
}
/** The sole live matching rule, shared by saved matches and the evaluator. */
export function matchItemWish(
  item: { title: string; category: string },
  wish: { text: string; category: string },
  synonyms: SynonymGroup[],
): { match: boolean; reason: string } {
  if (item.category !== wish.category) return { match: false, reason: "Different categories" };
  const title = words(item.title), phrase = words(wish.text);
  const match = title.some(a => phrase.some(b => a === b || synonyms.some(group => {
    const normalized = group.words.flatMap(words);
    return group.category === item.category && normalized.includes(a) && normalized.includes(b);
  })));
  return { match, reason: match ? `Matches your wishlist: ${wish.text}` : "No shared whole word or category synonym" };
}