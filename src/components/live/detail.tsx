import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Copy, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/passalong/live-rules";
import { useLive } from "./context";
import { available } from "./feed";
import { ConditionDisclosure, InvalidLink } from "./failure";
export function MemberDetail({ id }: { id: string }) {
  const { data, act, busy } = useLive(),
    navigate = useNavigate();
  const item = data.items.find((i) => i.id === id),
    seen = useRef(false);
  const [editing, setEditing] = useState(false),
    [title, setTitle] = useState(item?.title ?? ""),
    [category, setCategory] = useState(item?.category ?? ""),
    [missed, setMissed] = useState(false);
  useEffect(() => {
    if (item && !seen.current) {
      seen.current = true;
      void act("event", { item_id: id, name: "item_link_opened" });
    }
  }, [id, item, act]);
  if (!item || ["removed", "donated", "expired"].includes(item.status) && item.giver_id !== data.userId)
    return (
      <InvalidLink />
    );
  const own = item.giver_id === data.userId,
    claim = data.claims.find((c) => c.item_id === id && c.status !== "expired"),
    person = data.people.find((p) => p.id === item.giver_id),
    watching = data.watchers.some((w) => w.item_id === id);
  async function share() {
    await navigator.clipboard.writeText(
      `Giving this away on Passalong: ${item?.title}\n${window.location.origin}/i/${id}`,
    );
    await act("event", { item_id: id, name: "item_shared" });
    toast.success("Link and message copied.");
  }
  async function claimItem() {
    try {
      const result = await act("claim", { item_id: id });
      if (result.id) await navigate({ to: "/messages/$id", params: { id: result.id } });
    } catch (e) { if (e instanceof Error && e.message.includes("Just missed it")) setMissed(true); }
  }
  return (
    <div className="detail-page">
      <Link className="back-link" to="/home">
        ← Back to your circle
      </Link>
      <div className="detail-grid">
        <div className="detail-photo">
          <img src={item.photo_url} alt={item.title} />
        </div>
        <section className="detail-info">
          <p className="eyebrow">{data.circles.find((c) => c.id === item.circle_id)?.name}</p>
          <h1>{item.title}</h1>
          <p className="text-sm text-muted-foreground">
            {item.condition} · {item.category}
          </p>
          <ConditionDisclosure />
          {item.description && <p className="detail-description">{item.description}</p>}
          <div className="detail-facts">
            <div>
              <MapPin />
              <span>
                <small>General pickup area</small>
                {item.pickup_area}
              </span>
            </div>
            <div>
              <span>
                <small>Given by</small>
                {own ? "You" : (person?.display_name ?? "Circle member")}
              </span>
            </div>
          </div>
          <div className="grid gap-3 mt-6">
            {own ? (
              <>
                <strong>{item.status.replace("_", " ")}</strong>
                {["available", "expired"].includes(item.status) && (
                  <>
                    <Button
                      disabled={busy}
                      variant="outline"
                      onClick={() => act("renew", { item_id: id })}
                    >
                      Renew for 7 days
                    </Button>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled={busy} variant="ghost" onClick={() => setEditing(!editing)}>
                        Edit title & category
                      </Button>
                      <Button
                        disabled={busy}
                        variant="ghost"
                        onClick={() => act("donate", { item_id: id })}
                      >
                        Mark as donated
                      </Button>
                      <Button
                        disabled={busy}
                        variant="ghost"
                        onClick={() => act("remove", { item_id: id })}
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                )}
                {claim && (
                  <Button asChild>
                    <Link to="/messages/$id" params={{ id: claim.id }}>
                      Open pickup chat
                    </Link>
                  </Button>
                )}
              </>
            ) : available(item) && !missed ? (
              <Button className="claim-button" disabled={busy} onClick={claimItem}>
                Claim it
              </Button>
            ) : claim && claim.receiver_id === data.userId ? (
              <Button asChild>
                <Link to="/messages/$id" params={{ id: claim.id }}>
                  Open pickup chat
                </Link>
              </Button>
            ) : (
              <>
                <strong>
                  {missed ? "Just missed it — someone claimed this a moment ago." : item.status === "claimed" ? "Someone already claimed this." : item.status.replace("_", " ")}
                </strong>
                {(item.status === "claimed" || missed) && (
                  <Button
                    disabled={busy || watching}
                    variant="outline"
                    onClick={() => act("watch", { item_id: id })}
                  >
                    {watching ? "We'll notify you" : "Notify me if it's free again"}
                  </Button>
                )}
                <Button variant="outline" asChild><Link to="/browse" search={{ category: item.category }}>See similar items</Link></Button>
              </>
            )}
            {!["removed", "expired", "donated"].includes(item.status) && (
              <Button variant="outline" onClick={share}>
                <Copy />
                Share to group chat
              </Button>
            )}
          </div>
          {editing && (
            <form
              className="grid gap-3 mt-5"
              onSubmit={async (e) => {
                e.preventDefault();
                await act("edit_item", { item_id: id, title, category });
                setEditing(false);
              }}
            >
              <label className="form-label">
                Title
                <input
                  required
                  maxLength={80}
                  className="text-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="form-label">
                Category
                <select
                  className="text-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <Button type="submit" disabled={busy}>
                Save changes
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
