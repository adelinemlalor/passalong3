import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, PackageOpen, X, ArrowRight, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORIES, mainWord } from "@/lib/passalong/live-rules";
import { useLive, type LiveItem } from "./context";
export function available(item: LiveItem) {
  return item.status === "available" && new Date(item.expires_at).getTime() > Date.now();
}
export function ItemCard({ item, reason }: { item: LiveItem; reason?: string | undefined }) {
  return (
    <article className="offer-card">
      <Link to="/i/$id" params={{ id: item.id }} className="live-photo">
        <img src={item.photo_url} alt={item.title} />
        <span className="photo-tag">
          {available(item) ? "Available" : item.status.replace("_", " ")}
        </span>
      </Link>
      <div className="live-card-body">
        <span className="text-xs text-muted-foreground">{item.category}</span>
        <h3>
          <Link to="/i/$id" params={{ id: item.id }}>
            {item.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">
          {item.condition} · {item.pickup_area}
        </p>
        {reason && (
          <p className="live-match">
            <Heart size={14} />
            Matches your wishlist: {reason}
          </p>
        )}
      </div>
    </article>
  );
}
export function EmptyCircle() {
  return (
    <div className="empty-state">
      <PackageOpen size={36} />
      <h3>A little room for the first good thing</h3>
      <p>There are no available items in your circle yet.</p>
      <div className="flex justify-center gap-3 flex-wrap">
        <Button asChild>
          <Link to="/post">
            <Plus />
            Post the first item
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/wishlist">
            <Heart />
            Add a wish
          </Link>
        </Button>
      </div>
    </div>
  );
}
export function NoCircle() {
  return (
    <div className="empty-state">
      <h1>Your circle is waiting</h1>
      <p>Open an invite link from your circle to join.</p>
      <div className="flex flex-wrap justify-center gap-3 mt-5"><Button asChild><Link to="/start-circle">Start a circle</Link></Button><Button asChild variant="outline"><Link to="/find-circles">Find circles near you</Link></Button></div>
    </div>
  );
}
function rank(items: LiveItem[], all: LiveItem[]) {
  const lower = (giver: string) => {
    const last = all
      .filter((i) => i.giver_id === giver)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 5);
    return last.length === 5 && last.every((i) => i.status === "expired");
  };
  return [...items].sort(
    (a, b) =>
      Number(lower(a.giver_id)) - Number(lower(b.giver_id)) ||
      Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}
export function Feed({ browse = false, initialCategory }: { browse?: boolean; initialCategory?: string | undefined }) {
  const { data, circleId, circleFilter, setCircleId, act, busy } = useLive();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(initialCategory ?? "All");
  if (!circleId) return <NoCircle />;
  const circle = data.circles.find((c) => c.id === circleFilter);
  const items = rank(
    data.items.filter((i) => (!circleFilter || i.circle_ids.includes(circleFilter)) && available(i)),
    data.items,
  );
  const filtered = items.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      i.title.toLowerCase().includes(search.toLowerCase()),
  );
  const matched = items
    .map((item) => ({
      item,
      wish: data.wishes.find((w) =>
        data.matches.some((m) => m.item_id === item.id && m.wish_id === w.id),
      ),
    }))
    .filter((x) => x.wish);
  async function choice(value: boolean) {
    await act("clearout", { choice: value });
    toast.success("Thanks — your choice is recorded.");
  }
  return (
    <div className="live-feed">
      <div className="live-heading">
        <div>
          <p className="eyebrow">{circle?.name ?? "All my circles"}</p>
          <h1>{browse ? "Browse your circle" : "Good things, passed along"}</h1>
          <p>
            {items.length} {items.length === 1 ? "thing is" : "things are"} available in your circle
            right now
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={browse ? "/home" : "/browse"}>
            {browse ? "Home" : "Browse all"}
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <label className="form-label mb-5">Circle filter<select className="text-input" aria-label="Filter items by circle" value={circleFilter} onChange={e=>setCircleId(e.target.value)}><option value="">All my circles</option>{data.circles.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      {!browse && data.profile?.clearout_choice === null && (
        <aside className="clearout-card">
          <p>
            Moving out in December? Post everything at once, your circle gets first pick, and we'll
            arrange pickup of whatever's left — $25. <strong>Coming soon.</strong>
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button disabled={busy} size="sm" onClick={() => choice(true)}>
              I'm interested
            </Button>
            <Button disabled={busy} variant="ghost" size="sm" onClick={() => choice(false)}>
              Not for me
            </Button>
          </div>
        </aside>
      )}
      {!browse && matched.length > 0 && (
        <section className="live-section">
          <div className="section-label">
            <h2>Matched for you</h2>
            <Button variant="link" asChild>
              <Link to="/wishlist">My wishes</Link>
            </Button>
          </div>
          <div className="live-grid">
            {matched.map(({ item, wish }) => (
              <ItemCard key={item.id} item={item} reason={wish?.text} />
            ))}
          </div>
        </section>
      )}
      {!browse && !matched.length && <section className="live-section empty-state"><h2>No matches yet</h2><p>Nothing in your circle matches your wishlist yet. New items show up in Browse and Swipe as soon as they're posted.</p><div className="flex flex-wrap justify-center gap-3 mt-4"><Button asChild><Link to="/browse">Browse</Link></Button><Button asChild variant="outline"><Link to="/wishlist">Edit wishlist</Link></Button></div></section>}
      <section className="live-section">
        <div className="section-label">
          <h2>{browse ? "Available items" : "New in your circle"}</h2>
          <Button asChild variant="link">
            <Link to="/wishlist">
              <Heart />
              My wishes
            </Link>
          </Button>
        </div>
        <label className="live-search">
          <Search size={18} />
          <input
            aria-label="Search items"
            placeholder="Search items"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="category-scroll">
          {["All", ...CATEGORIES].map((c) => (
            <Button
              key={c}
              variant="outline"
              className={`category-chip ${c === category ? "category-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        {items.length === 0 ? (
          <EmptyCircle />
        ) : filtered.length === 0 ? (
          <p className="empty-state">No items match your search.</p>
        ) : (
          <div className="live-grid">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
export function Swipe() {
  const { data, circleId, circleFilter, act, busy } = useLive(),
    navigate = useNavigate();
  const [sheet, setSheet] = useState(false),
    [missed, setMissed] = useState<LiveItem | null>(null),
    [start, setStart] = useState<number | null>(null);
  const items = rank(
    data.items.filter(
      (i) =>
        (!circleFilter || i.circle_ids.includes(circleFilter)) &&
        i.giver_id !== data.userId &&
        available(i) &&
        !data.passes.some((p) => p.item_id === i.id),
    ),
    data.items,
  );
  const item = items[0];
  async function right() {
    if (!item) return;
    await act("event", { item_id: item.id, name: "swipe_right" });
    setSheet(true);
  }
  async function pass() {
    if (!item) return;
    await act("pass", { item_id: item.id });
    setSheet(false);
  }
  async function claim() {
    if (!item) return;
    try {
      const result = await act("claim", { item_id: item.id });
      if (result.id) await navigate({ to: "/messages/$id", params: { id: result.id } });
    } catch (e) { if (e instanceof Error && e.message.includes("Just missed it")) { setMissed(item); setSheet(false); } }
  }
  async function more() {
    if (!item) return;
    await act("wish", { circle_id: circleId, category: item.category, text: mainWord(item.title) });
    await pass();
    toast.success("Added to your wishes.");
  }
  if (!circleId) return <NoCircle />;
  return (
    <div className="swipe-area">
      <div className="live-heading">
        <div>
          <p className="eyebrow">YOUR CIRCLE</p>
          <h1>One good thing at a time</h1>
        </div>
      </div>
      {item ? (
        <>
          <div
            className="swipe-card"
            onPointerDown={(e) => setStart(e.clientX)}
            onPointerUp={(e) => {
              if (start === null) return;
              const delta = e.clientX - start;
              setStart(null);
              if (delta > 75) void right();
              else if (delta < -75) void pass();
            }}
          >
            <ItemCard item={item} />
          </div>
          <div className="swipe-actions">
            <Button
              className="swipe-pass"
              variant="outline"
              title="Pass"
              aria-label="Pass"
              disabled={busy}
              onClick={pass}
            >
              <X />
            </Button>
            <span>{items.length} available</span>
            <Button
              className="swipe-want"
              title="Interested"
              aria-label="Interested"
              disabled={busy}
              onClick={right}
            >
              <Heart />
            </Button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Check />
          <h3>You're all caught up</h3>
          <p>New things will appear here as your circle posts them.</p>
          <Button variant="outline" asChild>
            <Link to="/browse">Browse your circle</Link>
          </Button>
        </div>
      )}
      {sheet && item && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Interested in this item"
            className="modal-panel"
          >
            <div className="flex justify-between items-center mb-4">
              <h2>{item.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close"
                onClick={() => setSheet(false)}
              >
                <X />
              </Button>
            </div>
            <div className="grid gap-3">
              <Button disabled={busy} onClick={claim}>
                Claim it
              </Button>
              <Button disabled={busy} variant="outline" className="live-wrap-button" onClick={more}>
                Not this one — show me more like it
              </Button>
            </div>
          </section>
        </div>
      )}
      {missed && <div className="modal-backdrop"><section className="modal-panel" role="dialog" aria-modal="true" aria-label="Item just claimed"><h2>Just missed it — someone claimed this a moment ago.</h2><div className="grid gap-3 mt-5"><Button disabled={busy} onClick={async () => { await act("watch", { item_id: missed.id }); setMissed(null); }}>Notify me if it's free again</Button><Button asChild variant="outline"><Link to="/browse" search={{ category: missed.category }}>See similar items</Link></Button><Button variant="ghost" onClick={() => setMissed(null)}>Continue browsing</Button></div></section></div>}
    </div>
  );
}
