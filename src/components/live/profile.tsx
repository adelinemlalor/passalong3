import { Bell, Heart, PackageOpen } from "lucide-react";
import { useState } from "react";
import { Link,useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PICKUP_TIMES } from "@/lib/passalong/category-rules";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { PhotoPicker } from "@/components/passalong/photo-picker";
import { useLive } from "./context";
import { ItemCard } from "./feed";
export function Profile() {
  const { data, act, busy } = useLive(),
    [name, setName] = useState(data.profile?.display_name ?? ""),
    [bio, setBio] = useState(data.profile?.bio ?? ""),
    [area, setArea] = useState(data.profile?.general_area ?? ""),
    [avatar, setAvatar] = useState(""),
    [saving, setSaving] = useState(false),
    [notificationsOn, setNotificationsOn] = useState(data.profile?.match_notifications ?? true);
  const [times,setTimes]=useState(data.profile?.pickup_times??[]),[claimEmails,setClaimEmails]=useState(data.profile?.claim_emails??true),[messageEmails,setMessageEmails]=useState(data.profile?.message_emails??true),[failure,setFailure]=useState("");
  const navigate=useNavigate(),q=useQueryClient();
  const history = data.claims.filter((c) => ["picked_up", "thanked"].includes(c.status)),
    own = data.items.filter((i) => i.giver_id === data.userId);
  async function save() {
    setSaving(true);
    try {
      let avatar_url = data.profile?.avatar_url ?? "";
      if (avatar) {
        const file = await fetch(avatar).then((r) => r.blob());
        if (file.size > 10 * 1024 * 1024)
          throw new Error("Please choose a photo smaller than 10 MB.");
        const path = `${data.userId}/avatar-${crypto.randomUUID()}.jpg`;
        const upload = await supabase.storage
          .from("item-photos")
          .upload(path, file, { contentType: file.type });
        if (upload.error) throw upload.error;
        avatar_url = path;
      }
      await act("profile", { display_name: name, avatar_url, bio, general_area:area,pickup_times:times });
      setFailure("");
      setAvatar("");
      toast.success("Profile saved.");
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Profile could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="live-profile">
      <p className="eyebrow">YOUR CIRCLE</p>
      {data.avatarPhoto && <img className="avatar mb-4" src={data.avatarPhoto} alt="Your profile photo" />}
      <h1>{data.profile?.display_name ?? "Your profile"}</h1>
      <form
        className="live-profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="form-label">
          Display name
          <input
            required
            maxLength={80}
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="form-label">Bio<textarea className="text-input" maxLength={160} rows={3} placeholder="A line about you, e.g. Second-year, always growing something on my windowsill." value={bio} onChange={e=>setBio(e.target.value)}/></label>
        <label className="form-label">General area<input className="text-input" maxLength={80} value={area} placeholder="South Berkeley" onChange={e=>setArea(e.target.value)}/><span className="text-sm text-muted-foreground">A neighborhood or landmark, not your address.</span></label>
        <details>
          <summary className="text-sm cursor-pointer">Change profile photo (optional)</summary>
          <div className="mt-3">
            <PhotoPicker image={avatar || data.avatarPhoto} onChange={setAvatar} />
          </div>
        </details>
        <fieldset><legend className="form-label mb-3">Good times to pick up from me</legend><div className="flex flex-wrap gap-2">{PICKUP_TIMES.map(time=><Button type="button" variant={times.includes(time)?"default":"outline"} aria-pressed={times.includes(time)} key={time} onClick={()=>setTimes(old=>old.includes(time)?old.filter(t=>t!==time):[...old,time])}>{time}</Button>)}</div></fieldset>
        {failure&&<p role="alert">{failure}</p>}
        <Button disabled={busy || saving} type="submit">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
      <section className="live-section"><h2>Match notifications</h2><label className="flex items-center gap-3 mt-4"><Switch aria-label="Match notifications" checked={notificationsOn} disabled={busy} onCheckedChange={enabled=>{setNotificationsOn(enabled);void act("notification_setting",{enabled}).catch(()=>setNotificationsOn(!enabled));}} /><span>{notificationsOn ? "On" : "Off"}</span></label><p className="text-sm text-muted-foreground mt-3">Quiet hours: 9 pm–8 am.</p><Button className="mt-4" variant="link" asChild><Link to="/how-it-works">How Passalong works & what we record</Link></Button></section>
      <section className="live-section"><h2>Email notifications</h2><label className="flex gap-3 items-center mt-4"><Switch aria-label="Claim emails" checked={claimEmails} disabled={busy} onCheckedChange={enabled=>{setClaimEmails(enabled);void act("profile",{claim_emails:enabled}).catch(()=>setClaimEmails(!enabled));}}/>Claim emails · {claimEmails?"On":"Off"}</label><label className="flex gap-3 items-center mt-4"><Switch aria-label="Message emails" checked={messageEmails} disabled={busy} onCheckedChange={enabled=>{setMessageEmails(enabled);void act("profile",{message_emails:enabled}).catch(()=>setMessageEmails(!enabled));}}/>Message emails · {messageEmails?"On":"Off"}</label></section>
      <section className="live-section"><h2>Kind words</h2>{data.kindWords.length?data.kindWords.map(note=><blockquote className="border-b py-4" key={note.id}><p>{note.text}</p>{note.photo&&<img className="w-full max-w-xs rounded mt-3" src={note.photo} alt="Thank-you photo"/>}<p className="text-sm text-muted-foreground mt-2">{data.people.find(p=>p.id===note.writer_id)?.display_name??"Circle member"}</p></blockquote>):<p className="text-muted-foreground mt-4">No shared thank-you notes yet.</p>}</section>
      <section className="live-section">
        <div className="section-label">
          <h2>My circles</h2>
          {data.isAdmin && (
            <Button asChild variant="link">
              <Link to="/admin">Admin</Link>
            </Button>
          )}
        </div>
        <Button asChild variant="outline" className="mt-4"><Link to="/circles">View my circles</Link></Button>
        {data.circles.map((c) => (
          <div key={c.id} className="border-b py-4 last:border-b-0">
            <div className="live-wish-row">
              <strong>{c.name}</strong>
              <Button asChild variant="outline" size="sm"><Link to="/c/$id" params={{id:c.id}}>Open</Link></Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {data.people
                .filter((p) => p.circle_id === c.id)
                .map((p) => p.display_name)
                .join(" · ") || "Just you so far — share the invite link."}
            </p>
          </div>
        ))}
      </section>
      <section className="live-section">
        <div className="section-label">
          <h2>My wishlist</h2>
          <Button asChild variant="link">
            <Link to="/wishlist">Edit wishes</Link>
          </Button>
        </div>
        <div className="wishlist-tags">
          {data.wishes.map((w) => (
            <span key={w.id} className="wishlist-tag">
              {w.text}
            </span>
          ))}
        </div>
      </section>
      <section className="live-section">
        <h2 className="mb-4 font-semibold">Passed along</h2>
        {!history.length ? (
          <div className="empty-state"><Heart size={32}/><p>Your first new home is still ahead. Picked-up items will appear here.</p><Button asChild variant="outline"><Link to="/browse">Find something useful</Link></Button></div>
        ) : (
          <div className="live-grid">
            {history.map((c) => {
              const item = data.items.find((i) => i.id === c.item_id);
              return item ? (
                <div key={c.id}>
                  <p className="text-sm text-primary mb-2">
                    {item.giver_id === data.userId ? "Given" : "Received"}
                  </p>
                  <ItemCard item={item} />
                </div>
              ) : null;
            })}
          </div>
        )}
      </section>
      <section className="live-section">
        <h2 className="mb-4 font-semibold">My posts</h2>
        {!own.length&&<div className="empty-state"><PackageOpen size={32}/><p>A good thing in your cupboard could be someone’s next find.</p><Button asChild><Link to="/post">Post your first item</Link></Button></div>}
        <div className="live-grid">
          {own.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <Button className="mt-6" variant="outline" onClick={async()=>{await q.cancelQueries();q.clear();await supabase.auth.signOut();await navigate({to:"/auth",search:{next:"/home"}});}}>Sign out</Button>
    </div>
  );
}
export function Notifications() {
  const { data, circleId, act, busy } = useLive();
  return (
    <div className="notif-page">
      <div className="live-heading">
        <h1>Notifications</h1>
        {circleId && (
          <Button
            disabled={busy}
            variant="link"
            onClick={() => act("read_notifications", { circle_id: circleId })}
          >
            Mark all read
          </Button>
        )}
      </div>
      {!data.notifications.length ? (
        <div className="empty-state">
          <Bell size={32}/><h3>All quiet for now</h3><p>Your circle’s good news will show up here.</p><Button asChild variant="outline"><Link to="/browse">See what’s new</Link></Button>
        </div>
      ) : (
        data.notifications.map((n) => {
          const item = data.items.find((i) => i.id === n.item_id);
          const actor=data.people.find(p=>p.id===n.actor_id)?.display_name??"Circle member";
          const alerts:Record<string,string>={claimed:`${actor} claimed your ${item?.title??"item"}.`,message:`${actor} sent you a message`,times:`${actor} suggested pickup times`,confirmed:"Pickup time confirmed",picked_up:"Item picked up",thanks:`${actor} thanked you`};
          return (
            <div className={`live-notification ${n.read_at ? "" : "live-unread"}`} key={n.id}>
              <div>
                <strong>
                  {alerts[n.kind] ?? (n.kind === "match"
                    ? "A wishlist match"
                    : n.kind === "renew"
                      ? "Your item expires soon"
                      : "It's available again")}
                </strong>
                <p className="text-sm text-muted-foreground">{item?.title ?? "Item"}</p>
                {item && data.claims.some(c=>c.item_id===item.id && c.status==="expired") && n.kind==="free_again" && <p className="mt-2">{item.giver_id===data.userId ? `${item.title} wasn't picked up, so it's available again.` : `Your claim on ${item.title} expired, so it's been offered again.`}</p>}
                <small>{new Date(n.created_at).toLocaleString()}</small>
              </div>
              {n.claim_id ? <Button variant="outline" asChild><Link to="/messages/$id" params={{id:n.claim_id}}>Open chat</Link></Button> : n.item_id && (
                <Button variant="outline" asChild>
                  <Link to="/i/$id" params={{ id: n.item_id }}>
                    View item
                  </Link>
                </Button>
              )}
              {(n.kind === "renew" || n.kind === "free_again" && item?.giver_id === data.userId && item.status === "available") && n.item_id && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    disabled={busy}
                    size="sm"
                    onClick={() => act("renew", { item_id: n.item_id ?? "" })}
                  >
                    Renew for 7 days
                  </Button>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    size="sm"
                    onClick={() => act("donate", { item_id: n.item_id ?? "" })}
                  >
                    Mark as donated
                  </Button>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    size="sm"
                    onClick={() => act("remove", { item_id: n.item_id ?? "" })}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
