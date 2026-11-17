import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env["SUPABASE_URL"],
    key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("The service is unavailable. Please try again.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
export const getItemPreview = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("item_preview", { item: data.id });
    if (error) throw new Error("This item could not be loaded.");
    const item = rows?.[0];
    if (!item) return null;
    // The narrow public RPC authorizes only these safe columns; sign only its returned photo path.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: photo } = await supabaseAdmin.storage
      .from("item-photos")
      .createSignedUrl(item.photo_path, 3600);
    return {
      id: item.id,
      title: item.title,
      condition: item.condition,
      circle_name: item.circle_name,
      photo_url: photo?.signedUrl ?? "",
    };
  });
export const getInvitePreview = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("invite_preview", { token: data.token });
    if (error) throw new Error("This invite could not be loaded.");
    return rows?.[0] ?? null;
  });
export const getLiveData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = context.supabase;
    const results = await Promise.all([
      s.from("profiles").select("*").eq("id", context.userId).single(),
      s.from("circles").select("*").order("created_at"),
      s.from("items").select("*").order("created_at", { ascending: false }).limit(500),
      s.from("wishes").select("*"),
      s.from("claims").select("*").order("created_at", { ascending: false }),
      s.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
      s.from("item_matches").select("*"),
      s.from("swipe_passes").select("*"),
      s.from("item_watchers").select("*"),
      s.from("user_roles").select("role"),
    ]);
    for (const result of results) if (result.error) throw new Error(result.error.message);
    const [
      profile,
      circles,
      items,
      wishes,
      claims,
      notifications,
      matches,
      passes,
      watchers,
      roles,
    ] = results;
    const circleRows = circles.data ?? [];
    const peopleResults = await Promise.all(
      circleRows.map((c) => s.rpc("member_names", { circle: c.id })),
    );
    const people = peopleResults.flatMap((r) => r.data ?? []);
    const itemRows = items.data ?? [];
    const photos = await s.storage.from("item-photos").createSignedUrls(
      itemRows.map((i) => i.photo_path),
      3600,
    );
    const urls = new Map((photos.data ?? []).map((p) => [p.path, p.signedUrl]));
    const avatarPath = profile.data?.avatar_url;
    const avatar = avatarPath?.startsWith(`${context.userId}/`)
      ? await s.storage.from("item-photos").createSignedUrl(avatarPath, 3600)
      : null;
    return {
      profile: profile.data,
      avatarPhoto: avatar?.data?.signedUrl ?? "",
      circles: circleRows,
      items: itemRows.map((i) => ({ ...i, photo_url: urls.get(i.photo_path) ?? "" })),
      wishes: wishes.data ?? [],
      claims: claims.data ?? [],
      notifications: notifications.data ?? [],
      matches: matches.data ?? [],
      passes: passes.data ?? [],
      watchers: watchers.data ?? [],
      people,
      isAdmin: (roles.data ?? []).some((r) => r.role === "admin"),
      userId: context.userId,
    };
  });
const actionSchema = z.object({
  action: z.enum([
    "join",
    "profile",
    "clearout",
    "create_circle",
    "synonym",
    "message",
    "report",
    "extend",
    "arrange",
    "pickup",
    "thank",
    "post",
    "wish",
    "delete_wish",
    "claim",
    "watch",
    "pass",
    "renew",
    "donate",
    "remove",
    "edit_item",
    "read_notifications",
    "event",
  ]),
  payload: z
    .record(z.union([z.string().max(2000), z.boolean(), z.array(z.string().max(120)).max(30)]))
    .default({}),
});
export const liveAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(actionSchema)
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("passalong_action", {
      action: data.action,
      payload: data.payload,
    });
    if (error) throw new Error(error.message);
    return result as { id?: string };
  });
export const joinItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("join_from_item", { item: data.id });
    if (error) throw new Error(error.message);
    return { success: true };
  });
export const getChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: messages, error } = await context.supabase
      .from("messages")
      .select("*")
      .eq("claim_id", data.id)
      .order("created_at");
    if (error) throw new Error(error.message);
    return messages;
  });
export const getAdminMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_metrics");
    if (error) throw new Error(error.message);
    return data;
  });
export const getSynonyms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("synonyms").select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
