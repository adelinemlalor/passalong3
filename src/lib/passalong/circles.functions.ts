import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface CircleSummary {
  id: string; name: string; type: string; description: string; general_area: string;
  photo_url: string; photo: string; join_rule: string; email_domain: string | null;
  required_email_domain: string | null; owner_id: string | null; is_test: boolean;
  members_can_invite: boolean; invite_token: string | null; my_role: string;
  member_count: number; membership_status?: string | null;
}
export const getCircleMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: members, error } = await context.supabase.rpc("circle_members_detail", { circle: data.id });
    if (error) throw new Error("This circle is private.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return Promise.all((members ?? []).map(async member => {
      const photo = member.avatar_url?.startsWith(`${member.id}/`) ? await supabaseAdmin.storage.from("item-photos").createSignedUrl(member.avatar_url, 3600) : null;
      return { ...member, photo: photo?.data?.signedUrl ?? "" };
    }));
  });
export const getDiscoverCircles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("find_circles");
    if (error) throw new Error("Circles could not be loaded. Try again.");
    const circles = (data ?? []) as unknown as CircleSummary[];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return Promise.all(circles.map(async circle => {
      const photo = circle.photo_url ? await supabaseAdmin.storage.from("item-photos").createSignedUrl(circle.photo_url, 3600) : null;
      return { ...circle, photo: photo?.data?.signedUrl ?? "" };
    }));
  });
export const circleAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ action: z.enum(["create", "edit", "join", "leave", "approve", "decline", "transfer", "rotate_invite", "remove_member", "search_opened"]), payload: z.record(z.union([z.string().max(2000), z.boolean()])).default({}) }))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("circle_action", data);
    if (error) throw new Error(error.message);
    return result as { id?: string; status?: string };
  });