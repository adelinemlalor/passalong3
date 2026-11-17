import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Plus, Search, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PhotoPicker } from "@/components/passalong/photo-picker";
import { supabase } from "@/integrations/supabase/client";
import { circleAction, getCircleMembers, getMemberProfile, getDiscoverCircles, type CircleSummary } from "@/lib/passalong/circles.functions";
import { CIRCLE_TYPES, generalArea, orderedCircles } from "@/lib/passalong/circle-rules";
import { liveQueryKey, useLive } from "./context";
import { ItemCard, available } from "./feed";
import { Failure } from "./failure";

function useCircleActions() {
  const run = useServerFn(circleAction), q = useQueryClient();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function act(action: Parameters<typeof circleAction>[0]["data"]["action"], payload: Record<string,string|boolean> = {}) {
    setBusy(true); setError("");
    try {
      const result = await run({ data: { action, payload } });
      await Promise.all([q.invalidateQueries({queryKey:liveQueryKey}),q.invalidateQueries({queryKey:["circle-members"]}),q.invalidateQueries({queryKey:["discover-circles"]})]);
      return result;
    } catch(e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); return null; }
    finally { setBusy(false); }
  }
  return { act, busy, error };
}
function CircleImage({ circle }: { circle: CircleSummary }) {
  return circle.photo ? <img className="circle-image" src={circle.photo} alt={circle.name} /> : <div className="circle-image circle-initial" aria-hidden="true">{circle.name.slice(0,1)}</div>;
}
async function copyInvite(circle: CircleSummary, group = false) {
  if (!circle.invite_token) return;
  const link = `${window.location.origin}/join/${circle.invite_token}`;
  try { await navigator.clipboard.writeText(group ? `Join my circle ${circle.name} on Passalong: ${link}` : link); toast.success(group ? "Group message copied." : "Invite link copied."); }
  catch { toast.error("The link could not be copied. Try again."); }
}
export function MyCircles() {
  const { data, setCircleId } = useLive(), { act, busy, error } = useCircleActions();
  const [leaving,setLeaving] = useState<CircleSummary|null>(null);
  return <div><div className="live-heading"><div><p className="eyebrow">YOUR PEOPLE</p><h1>My circles</h1></div><Users className="text-primary" size={32}/></div>
    <div className="flex flex-wrap gap-3 mb-6"><Button asChild><Link to="/start-circle"><Plus/>Start a circle</Link></Button><Button asChild variant="outline"><Link to="/find-circles"><Search/>Find circles near you</Link></Button></div>
    {error && <p role="alert" className="live-notice mb-4">{error}</p>}
    {!data.circles.length && <p className="empty-state">No circles yet. Start one or join your people.</p>}
    <div className="circle-grid">{data.circles.map(circle=><article className="circle-card" key={circle.id}><div className="flex gap-4"><CircleImage circle={circle}/><div className="min-w-0"><h2>{circle.name}</h2><p className="text-sm text-muted-foreground">{circle.type} · {circle.member_count} members</p><p className="text-sm mt-1">{circle.general_area}</p><p className="text-sm text-primary mt-1">{circle.my_role === "owner" ? "Owner" : "Member"}</p></div></div><div className="flex flex-wrap gap-2 mt-5"><Button asChild onClick={()=>setCircleId(circle.id)}><Link to="/c/$id" params={{id:circle.id}}>Open<ArrowRight/></Link></Button>{circle.invite_token && <Button variant="outline" onClick={()=>copyInvite(circle)}><Copy/>Copy invite link</Button>}<Button variant="ghost" onClick={()=>setLeaving(circle)}>Leave</Button></div></article>)}</div>
    {leaving && <div className="modal-backdrop"><section className="modal-panel" role="dialog" aria-modal="true" aria-label="Leave circle"><h2>Leave {leaving.name}?</h2><p className="mt-3">{leaving.my_role === "owner" ? "Hand ownership to another member before leaving." : "You will no longer see this circle’s items or members."}</p><div className="flex gap-3 mt-5">{leaving.my_role !== "owner" && <Button disabled={busy} onClick={async()=>{if(await act("leave",{circle_id:leaving.id}))setLeaving(null);}}>Confirm leave</Button>}<Button variant="outline" onClick={()=>setLeaving(null)}>Cancel</Button></div></section></div>}
  </div>;
}
export function CircleForm({ circle }: { circle?: CircleSummary }) {
  const {data} = useLive(), {act,busy,error} = useCircleActions(), navigate = useNavigate();
  const [name,setName]=useState(circle?.name??""),[description,setDescription]=useState(circle?.description??""),[type,setType]=useState(circle?.type??"Class"),[area,setArea]=useState(circle?.general_area??""),[joinRule,setJoinRule]=useState(circle?.join_rule??"invite_only"),[domain,setDomain]=useState(circle?.email_domain??""),[invites,setInvites]=useState(circle?.members_can_invite??true),[image,setImage]=useState(""),[uploading,setUploading]=useState(false),[photoError,setPhotoError]=useState("");
  async function save() {
    setPhotoError(""); if(!generalArea(area)){setPhotoError("Use a neighborhood or landmark, not an address.");return;}
    setUploading(true);
    try {
      let photo_url=circle?.photo_url??"";
      if(image){const file=await fetch(image).then(r=>r.blob());if(file.size>10*1024*1024)throw new Error("Choose a photo smaller than 10 MB.");const path=`${data.userId}/circle-${crypto.randomUUID()}.jpg`;const upload=await supabase.storage.from("item-photos").upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;photo_url=path;}
      const result=await act(circle?"edit":"create",{...(circle?{circle_id:circle.id}:{}),name,description,type,general_area:area,join_rule:joinRule,email_domain:domain,photo_url,members_can_invite:invites});
      if(result?.id)await navigate({to:"/c/$id",params:{id:result.id},search:{created:!circle}});
    }catch {setPhotoError("Your photo didn't upload. Try again or choose another photo.");}finally{setUploading(false);}
  }
  return <div className="flow-page live-form"><p className="eyebrow">YOUR PEOPLE, YOUR CIRCLE</p><h1>{circle?"Edit circle":"Start a circle"}</h1><PhotoPicker image={image||circle?.photo||""} onChange={setImage}/>{(error||photoError)&&<p role="alert" className="live-notice mt-4">{error||photoError}</p>}<form className="grid gap-5 mt-6" onSubmit={e=>{e.preventDefault();void save();}}>
    <label className="form-label">Circle name<input className="text-input" required maxLength={50} value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="form-label">Short description<textarea className="text-input" rows={3} maxLength={200} value={description} onChange={e=>setDescription(e.target.value)}/></label>
    <label className="form-label">Circle type<select className="text-input" value={type} onChange={e=>setType(e.target.value)}>{CIRCLE_TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
    <label className="form-label">General area<input className="text-input" required maxLength={80} placeholder="South Berkeley" value={area} onChange={e=>setArea(e.target.value)}/><span className="text-sm text-muted-foreground">A neighborhood or landmark, not your address.</span></label>
    <fieldset className="grid gap-3"><legend className="form-label mb-3">Who can join?</legend>{[["open","Anyone nearby can join"],["request","People ask to join"],["invite_only","Invite link only"]].map(([value,label])=><label className="flex gap-3 items-center" key={value}><input type="radio" name="join-rule" value={value} checked={joinRule===value} onChange={()=>setJoinRule(value??"invite_only")}/>{label}</label>)}</fieldset>
    <label className="form-label">Only people with an email ending in (optional)<input className="text-input" maxLength={100} placeholder="@berkeley.edu" disabled={Boolean(circle?.required_email_domain)} value={domain} onChange={e=>setDomain(e.target.value)}/></label>
    <label className="flex items-center gap-3"><input type="checkbox" checked={invites} onChange={e=>setInvites(e.target.checked)}/>Members can copy invite links</label>
    <Button type="submit" disabled={busy||uploading}>{busy||uploading?"Saving…":circle?"Save circle":"Create circle"}</Button>
  </form></div>;
}
export function CirclePage({id,created=false}:{id:string;created?:boolean}) {
  const {data,setCircleId}=useLive(),{act,busy,error}=useCircleActions(), fetchMembers=useServerFn(getCircleMembers);
  const circle=data.circles.find(c=>c.id===id),[tab,setTab]=useState("items"),[confirm,setConfirm]=useState<{action:"remove_member"|"transfer"|"rotate_invite";user_id?:string;name:string}|null>(null);
  const members=useQuery({queryKey:["circle-members",id],queryFn:()=>fetchMembers({data:{id}}),enabled:Boolean(circle)});
  if(!circle)return <div className="empty-state"><h1>This circle is private</h1><Button asChild className="mt-4"><Link to="/circles">My circles</Link></Button></div>;
  const owner=circle.my_role==="owner",active=members.data?.filter(m=>m.status==="active")??[],pending=members.data?.filter(m=>m.status==="pending")??[];
  return <div><div className="circle-heading"><CircleImage circle={circle}/><div><p className="eyebrow">{circle.type}</p><h1>{circle.name}</h1><p className="text-muted-foreground">{circle.general_area} · {circle.member_count} members</p><p className="mt-3">{circle.description}</p></div></div>
    {created&&<section className="live-section"><h2>Your circle is ready</h2>{circle.invite_token&&<p className="circle-link mt-3">{typeof window!=="undefined"?`${window.location.origin}/join/${circle.invite_token}`:""}</p>}<div className="flex flex-wrap gap-3 mt-4"><Button onClick={()=>copyInvite(circle)}><Copy/>Copy</Button><Button variant="outline" onClick={()=>copyInvite(circle,true)}>Share to group chat</Button></div></section>}
    <div className="flex flex-wrap gap-3 my-6">{circle.invite_token&&<Button variant="outline" onClick={()=>copyInvite(circle)}><Copy/>Copy invite link</Button>}{owner&&<><Button variant="outline" onClick={()=>setConfirm({action:"rotate_invite",name:"Regenerate invite link? The old link will stop working."})}>Regenerate invite link</Button><Button asChild variant="outline"><Link to="/c/$id/edit" params={{id}}>Edit circle</Link></Button></>}</div>
    {error&&<p role="alert" className="live-notice">{error}</p>}
    {owner&&pending.length>0&&<section className="live-section"><h2>Pending join requests</h2>{pending.map(m=><div className="live-wish-row" key={m.id}><span>{m.display_name}</span><div className="flex gap-2"><Button disabled={busy} onClick={()=>act("approve",{circle_id:id,user_id:m.id})}>Approve</Button><Button disabled={busy} variant="outline" onClick={()=>act("decline",{circle_id:id,user_id:m.id})}>Decline</Button></div></div>)}</section>}
    <div role="tablist" aria-label="Circle views" className="flex gap-2 border-b pb-3"><Button role="tab" aria-selected={tab==="items"} variant={tab==="items"?"default":"ghost"} onClick={()=>{setTab("items");setCircleId(id);}}>Items</Button><Button role="tab" aria-selected={tab==="members"} variant={tab==="members"?"default":"ghost"} onClick={()=>setTab("members")}>Members</Button></div>
    {tab==="items"?<section className="live-section"><div className="live-grid">{data.items.filter(item=>item.circle_ids.includes(id)&&available(item)).map(item=><ItemCard item={item} key={item.id}/>)}</div>{!data.items.some(item=>item.circle_ids.includes(id)&&available(item))&&<p className="empty-state">No available items yet.</p>}<Button asChild className="mt-4"><Link to="/post">Post an item</Link></Button></section>:<section className="live-section">{members.isPending?<p>Loading members…</p>:members.error?<Failure retry={()=>{void members.refetch();}}/>:active.map(member=><div key={member.id} className="circle-member"><Link to="/c/$id/member/$memberId" params={{id,memberId:member.id}} className="flex gap-4 min-w-0">{member.photo?<img className="avatar" src={member.photo} alt={member.display_name}/>:<Users className="text-primary shrink-0"/>}<div className="min-w-0"><h3>{member.display_name}</h3><p className="text-sm text-muted-foreground break-words">{member.bio.split("\n")[0]}</p><p className="text-sm">{member.general_area}</p><p className="text-xs text-muted-foreground">Joined {new Date(member.joined_at).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</p></div></Link>{owner&&member.id!==data.userId&&<div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={()=>setConfirm({action:"transfer",user_id:member.id,name:`Hand ownership to ${member.display_name}?`})}>Make owner</Button><Button variant="ghost" disabled={busy} onClick={()=>setConfirm({action:"remove_member",user_id:member.id,name:`Remove ${member.display_name}?`})}>Remove member</Button></div>}</div>)}</section>}
    {confirm&&<div className="modal-backdrop"><section className="modal-panel" role="dialog" aria-modal="true" aria-label="Confirm circle change"><h2>{confirm.name}</h2><div className="flex gap-3 mt-5"><Button disabled={busy} onClick={async()=>{if(await act(confirm.action,{circle_id:id,...(confirm.user_id?{user_id:confirm.user_id}:{})}))setConfirm(null);}}>Confirm</Button><Button variant="outline" onClick={()=>setConfirm(null)}>Cancel</Button></div></section></div>}
  </div>;
}
export function CircleMember({id,memberId}:{id:string;memberId:string}) {
  const {data}=useLive(),fetchMember=useServerFn(getMemberProfile);
  const isMember=data.circles.some(c=>c.id===id);
  const result=useQuery({queryKey:["member-profile",id,memberId],queryFn:()=>fetchMember({data:{id,memberId}}),enabled:isMember}),member=isMember?result.data:undefined;
  if(!isMember)return <p>This profile is private or unavailable.</p>;
  return <div className="flow-page"><Button asChild variant="link"><Link to="/c/$id" params={{id}}>Back to circle</Link></Button>{result.isPending?<p>Loading member…</p>:!member?<p>This profile is private or unavailable.</p>:<>{member.photo&&<img className="avatar my-5" src={member.photo} alt={member.display_name}/>}<h1>{member.display_name}</h1><p className="mt-4 whitespace-pre-line break-words">{member.bio}</p><p className="text-muted-foreground mt-4">{member.general_area}</p><p className="text-sm mt-3">{member.passed_along} items passed along</p><section className="live-section"><h2>Circles we share</h2><div className="flex flex-wrap gap-3 mt-4">{member.shared_circles.map(circle=><Button variant="outline" asChild key={circle.id}><Link to="/c/$id" params={{id:circle.id}}>{circle.name}</Link></Button>)}</div></section><section className="live-section"><h2>Kind words</h2>{member.kind_words.length?member.kind_words.map(note=><blockquote className="py-4 border-b" key={note.id}><p>{note.text}</p><p className="text-muted-foreground text-sm mt-2">{note.writer_name}</p></blockquote>):<p className="text-muted-foreground mt-4">No shared thank-you notes yet.</p>}</section></>}</div>;
}
export function FindCircles() {
  const {data,act:profileAct,busy:profileBusy}=useLive(),fetchCircles=useServerFn(getDiscoverCircles),{act,busy,error}=useCircleActions();
  const [area,setArea]=useState(data.profile?.general_area??""),[search,setSearch]=useState(""),[areaError,setAreaError]=useState("");
  const circles=useQuery({queryKey:["discover-circles"],queryFn:()=>fetchCircles()});
  useEffect(()=>{void act("search_opened");},[]);
  const results=orderedCircles(circles.data??[],data.profile?.general_area??"",search);
  return <div><div className="live-heading"><div><p className="eyebrow">FIND YOUR PEOPLE</p><h1>Find circles near you</h1></div><Button asChild variant="outline"><Link to="/start-circle"><Plus/>Start a circle</Link></Button></div>
    <form className="flex flex-wrap gap-3 items-end mb-5" onSubmit={async e=>{e.preventDefault();if(!generalArea(area)){setAreaError("Use a neighborhood or city, not an address.");return;}setAreaError("");try{await profileAct("profile",{general_area:area});}catch{}}}><label className="form-label flex-1">Your general area<input required className="text-input" maxLength={80} value={area} placeholder="South Berkeley" onChange={e=>setArea(e.target.value)}/><span className="text-sm text-muted-foreground">A neighborhood or landmark, not your address.</span></label><Button disabled={profileBusy}>Save area</Button></form>
    {(areaError||error)&&<p role="alert" className="live-notice mb-4">{areaError||error}</p>}<label className="live-search"><Search size={18}/><input aria-label="Search circles" placeholder="Search circles by name" value={search} onChange={e=>setSearch(e.target.value)}/></label>
    {circles.isPending?<p>Loading circles…</p>:circles.error?<Failure retry={()=>{void circles.refetch();}}/>:!results.length?<div className="empty-state"><p>No circles near you yet. Start one for your building, class or team.</p><Button asChild className="mt-4"><Link to="/start-circle">Start a circle</Link></Button></div>:<div className="circle-grid mt-6">{results.map(circle=><article className="circle-card" key={circle.id}><div className="flex gap-4"><CircleImage circle={circle}/><div className="min-w-0"><h2>{circle.name}</h2><p className="text-sm text-muted-foreground">{circle.type} · {circle.member_count} members</p><p className="text-sm mt-1">{circle.general_area}</p></div></div><p className="my-4 break-words">{circle.description}</p>{circle.email_domain&&<p className="text-sm text-primary mb-3">Requires an @{circle.email_domain} email</p>}{circle.membership_status==="active"?<Button asChild variant="outline"><Link to="/c/$id" params={{id:circle.id}}>Open</Link></Button>:<Button disabled={busy||circle.membership_status==="pending"} onClick={()=>act("join",{circle_id:circle.id})}>{circle.membership_status==="pending"?"Request pending":circle.join_rule==="request"?"Ask to join":"Join"}</Button>}</article>)}</div>}
  </div>;
}