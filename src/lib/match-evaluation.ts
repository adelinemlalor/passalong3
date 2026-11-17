import Papa from "papaparse";
import { matchItemWish, type SynonymGroup } from "./matching";
import { validText, stripMarkup } from "./passalong/safety";
export const CSV_FIELDS = ["item_title", "item_category", "wish_text", "wish_category"] as const;
export function evaluateCsv(csv: string, synonyms: SynonymGroup[]) {
  const parsed = Papa.parse<Record<string,string>>(csv, { header: true, skipEmptyLines: "greedy" });
  if (parsed.errors.length || !CSV_FIELDS.every(k => parsed.meta.fields?.includes(k))) throw new Error("Use the four CSV columns: item_title, item_category, wish_text, wish_category.");
  if (parsed.data.length > 1000) throw new Error("Please use at most 1,000 rows per run.");
  return parsed.data.map((row, index) => {
    const item_title = stripMarkup(row["item_title"] ?? ""), wish_text = stripMarkup(row["wish_text"] ?? "");
    if (!validText(item_title,80) || !validText(wish_text,60)) throw new Error(`Row ${index + 2}: title must be 1–80 characters and wish 1–60.`);
    const input = { item_title, item_category: row["item_category"] ?? "", wish_text, wish_category: row["wish_category"] ?? "" };
    return { ...input, ...matchItemWish({ title: item_title, category: input.item_category },{ text: wish_text, category: input.wish_category },synonyms) };
  });
}
export function resultsCsv(rows: ReturnType<typeof evaluateCsv>) {
  return Papa.unparse(rows, { escapeFormulae: true });
}