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
export interface MemberProfile {id:string;display_name:string;avatar_url:string|null;photo:string;bio:string;general_area:string;passed_along:number;shared_circles:{id:string;name:string}[];kind_words:{id:string;text:string;writer_name:string;photo?:string}[]}
export const getMemberProfile=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),memberId:z.string().uuid()})).handler(async({data,context})=>{
  const result=await context.supabase.rpc("member_profile",{member:data.memberId,circle:data.id});if(result.error)throw new Error("This profile is private.");if(!result.data)return null;
  const profile=result.data as unknown as MemberProfile;
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const photo=profile.avatar_url?.startsWith(`${profile.id}/`)?await supabaseAdmin.storage.from("item-photos").createSignedUrl(profile.avatar_url,3600):null;
  const notes=await context.supabase.from("kind_words").select("id,photo_path").eq("giver_id",data.memberId).eq("show_on_profile",true);
  if(notes.error)throw new Error("Shared thank-you notes could not be loaded.");
  const kind_words=await Promise.all(profile.kind_words.map(async note=>{const path=notes.data?.find(n=>n.id===note.id)?.photo_path;const signed=path?await context.supabase.storage.from("item-photos").createSignedUrl(path,3600):null;return {...note,photo:signed?.data?.signedUrl??""};}));
  return {...profile,kind_words,photo:photo?.data?.signedUrl??""};
});