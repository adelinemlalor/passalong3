import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
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
    [avatar, setAvatar] = useState(""),
    [saving, setSaving] = useState(false),
    [notificationsOn, setNotificationsOn] = useState(data.profile?.match_notifications ?? true);
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
      await act("profile", { display_name: name, avatar_url });
      setAvatar("");
      toast.success("Profile saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Profile could not be saved.");
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
        <details>
          <summary className="text-sm cursor-pointer">Change profile photo (optional)</summary>
          <div className="mt-3">
            <PhotoPicker image={avatar || data.avatarPhoto} onChange={setAvatar} />
          </div>
        </details>
        <Button disabled={busy || saving} type="submit">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
      <section className="live-section"><h2>Match notifications</h2><label className="flex items-center gap-3 mt-4"><Switch aria-label="Match notifications" checked={notificationsOn} disabled={busy} onCheckedChange={enabled=>{setNotificationsOn(enabled);void act("notification_setting",{enabled}).catch(()=>setNotificationsOn(!enabled));}} /><span>{notificationsOn ? "On" : "Off"}</span></label><p className="text-sm text-muted-foreground mt-3">Quiet hours: 9 pm–8 am.</p><Button className="mt-4" variant="link" asChild><Link to="/how-it-works">How Passalong works & what we record</Link></Button></section>
      <section className="live-section">
        <div className="section-label">
          <h2>My circles</h2>
          {data.isAdmin && (
            <Button asChild variant="link">
              <Link to="/admin">Admin</Link>
            </Button>
          )}
        </div>
        {data.circles.map((c) => (
          <div key={c.id} className="border-b py-4 last:border-b-0">
            <div className="live-wish-row">
              <strong>{c.name}</strong>
              <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/join/${c.invite_token}`,
                );
                toast.success("Invite link copied.");
              }}
            >
              <Copy />
               Invite link
            </Button>
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
          <p className="text-muted-foreground text-sm">Your picked-up items will appear here.</p>
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
        <div className="live-grid">
          {own.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
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
          <h3>All quiet for now</h3>
        </div>
      ) : (
        data.notifications.map((n) => {
          const item = data.items.find((i) => i.id === n.item_id);
          return (
            <div className={`live-notification ${n.read_at ? "" : "live-unread"}`} key={n.id}>
              <div>
                <strong>
                  {n.kind === "match"
                    ? "A wishlist match"
                    : n.kind === "renew"
                      ? "Your item expires soon"
                      : "It's available again"}
                </strong>
                <p className="text-sm text-muted-foreground">{item?.title ?? "Item"}</p>
                {item && data.claims.some(c=>c.item_id===item.id && c.status==="expired") && n.kind==="free_again" && <p className="mt-2">{item.giver_id===data.userId ? `${item.title} wasn't picked up, so it's available again.` : `Your claim on ${item.title} expired, so it's been offered again.`}</p>}
                <small>{new Date(n.created_at).toLocaleString()}</small>
              </div>
              {n.item_id && (
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
