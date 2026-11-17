import { matchItemWish } from "@/lib/matching";
import { supabaseAdmin as s } from "@/integrations/supabase/client.server";
export async function synchronizeMatches() {
  for (let attempt = 0; attempt < 3; attempt++) {
    const revision = await s.from("match_revision").select("*").maybeSingle();
    if (revision.error) throw new Error("Matches could not be updated. Try again.");
    if (!revision.data || revision.data.revision === revision.data.applied) return;
    const [items, wishes, groups, members] = await Promise.all([
      s.from("items").select("id,title,category,circle_id,giver_id").eq("status", "available").gt("expires_at", new Date().toISOString()),
      s.from("wishes").select("id,text,category,circle_id,user_id"),
      s.from("synonyms").select("category,words"),
      s.from("circle_members").select("circle_id,user_id"),
    ]);
    if ([items, wishes, groups, members].some(r => r.error)) throw new Error("Matches could not be updated. Try again.");
    const pairs = (items.data ?? []).flatMap(item => (wishes.data ?? []).filter(wish =>
      wish.circle_id === item.circle_id && wish.user_id !== item.giver_id &&
      members.data?.some(m => m.circle_id === item.circle_id && m.user_id === wish.user_id) &&
      matchItemWish(item, wish, groups.data ?? []).match,
    ).map(wish => ({ item_id: item.id, wish_id: wish.id, user_id: wish.user_id })));
    const result = await s.rpc("apply_matches", { expected: revision.data.revision, pairs });
    if (result.error) throw new Error("Matches could not be updated. Try again.");
    if (result.data) return;
  }
  throw new Error("Your circle changed while updating matches. Try again.");
}