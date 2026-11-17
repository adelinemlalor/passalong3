import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, PackageOpen, X, ArrowRight, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mainWord } from "@/lib/passalong/live-rules";
import { categoryLabel } from "@/lib/passalong/category-rules";
import { endingSoon, greeting, postedAgo, FOUND_HOME_LIMIT } from "@/lib/passalong/home-rules";
import { CategoryPicker } from "./category-picker";
import { useLive, type LiveItem } from "./context";
export function available(item: LiveItem) {
  return item.status === "available" && new Date(item.expires_at).getTime() > Date.now();
}
export function ItemCard({ item, reason }: { item: LiveItem; reason?: string | undefined }) {
  const {data}=useLive();
  return (
    <article className="offer-card">
      <Link to="/i/$id" params={{ id: item.id }} className="live-photo">
        <img src={item.photo_url} alt={item.title} />
        <span className="photo-tag">
          {available(item) ? "Available" : item.status.replace("_", " ")}
        </span>
      </Link>
      <div className="live-card-body">
        <span className="text-xs text-muted-foreground">{categoryLabel(item.category,item.custom_category,data.categories)}</span>
        <span className="text-xs text-muted-foreground">{item.condition}</span>
        <h3>
          <Link to="/i/$id" params={{ id: item.id }}>
            {item.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">
          {item.pickup_style && `${item.pickup_style} · `}{item.pickup_area}
        </p>
        <p className="text-xs text-muted-foreground">The giver shares the exact spot in the chat after you claim, if they choose.</p>
        <p className="text-xs text-muted-foreground">{data.circles.filter(c=>item.circle_ids.includes(c.id)).map(c=>c.name).join(" · ")}</p>
        <p className="text-xs text-muted-foreground">{postedAgo(item.created_at)}</p>
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
  const { data, circleId, circleFilter, setCircleId } = useLive();
  const navigate=useNavigate();
  const [search, setSearch] = useState(""),
    [localCategory, setCategory] = useState("All");
  const category=initialCategory ?? localCategory;
  const scoped=(ids:string[])=>!circleFilter||ids.includes(circleFilter);
  const completed=data.homeActivity.completed.filter(row=>scoped(row.circle_ids));
  const found=completed.slice(0,FOUND_HOME_LIMIT).flatMap(row=>{const item=data.items.find(i=>i.id===row.id);return item?[item]:[];});
  const month=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit"});
  const passedThisMonth=completed.filter(row=>row.picked_up_at&&month.format(new Date(row.picked_up_at))===month.format(new Date())).length;
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
  return (
    <div className="live-feed">
      <div className="live-heading">
        <div>
          <p className="eyebrow">{circle?.name ?? "All my circles"}</p>
          <h1>{browse ? "Browse your circles" : greeting(data.profile?.display_name??"")}</h1>
          <p>
            {browse ? `${items.length} good things waiting for a second chapter` : "A little less clutter. A little more connection."}
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
      {!browse && !matched.length && <section className="live-section empty-state"><h2>Matched for you</h2><Heart size={32}/><p>Your next good find is still on its way. Add a wish, or take a look around.</p><div className="flex flex-wrap justify-center gap-3 mt-4"><Button asChild><Link to="/browse">Browse</Link></Button><Button asChild variant="outline"><Link to="/wishlist">Edit wishlist</Link></Button></div></section>}
      {!browse && <nav aria-label="Browse categories" className="category-scroll home-categories">{data.categories.map(c=><Button key={c.key} variant="outline" className="category-chip" onClick={()=>navigate({to:"/browse",search:{category:c.key}})}>{c.name}</Button>)}</nav>}
      <section className="live-section">
        <div className="section-label">
          <h2>{browse ? "Available items" : "New in your circles"}</h2>
          <Button asChild variant="link">
            <Link to="/wishlist">
              <Heart />
              My wishes
            </Link>
          </Button>
        </div>
        {browse && <><label className="live-search">
          <Search size={18} />
          <input
            aria-label="Search items"
            placeholder="Search items"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="category-scroll">
          {[{key:"All",name:"All"}, ...data.categories].map((c) => (
            <Button
              key={c.key}
              variant="outline"
              aria-pressed={c.key===category}
              className={`category-chip ${c.key === category ? "category-active" : ""}`}
              onClick={() => { setCategory(c.key); void navigate({to:"/browse",search:{category:c.key}}); }}
            >
              {c.name}
            </Button>
          ))}
        </div>
        </>}
        {items.length === 0 ? (
          <EmptyCircle />
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Search size={32}/><h3>Nothing here just yet</h3><p>Try another category or clear your search.</p><Button variant="outline" onClick={()=>{setSearch("");setCategory("All");void navigate({to:"/browse",search:{category:"All"}});}}>Show all items</Button></div>
        ) : (
          <div className={browse?"live-grid":"live-grid home-grid"}>
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
      {!browse && <>
        <ClearoutPrompt />
        <section className="live-section"><h2>Ending soon</h2><p className="section-intro">One last look before these good things move on.</p>{items.some(i=>endingSoon(i))?<div className="live-grid home-grid">{items.filter(i=>endingSoon(i)).map(item=><ItemCard item={item} key={item.id}/>)}</div>:<div className="empty-state"><PackageOpen size={32}/><p>Nothing is ending soon. There’s still time to find your next good thing.</p><Button asChild variant="outline"><Link to="/browse">Take a look around</Link></Button></div>}</section>
        <section className="live-section"><h2>Recently found a home</h2><p className="section-intro">Small things, new chapters.</p>{found.length?<div className="found-grid">{found.map(item=><article key={item.id} className="found-card"><img src={item.photo_url} alt={item.title}/><h3>{item.title} found a new home</h3></article>)}</div>:<div className="empty-state"><Heart size={32}/><p>The first new home is still to come.</p><Button asChild variant="outline"><Link to="/post">Pass something along</Link></Button></div>}</section>
        <section className="live-section"><h2>This month in your circles</h2><dl className="month-counts"><div><dd>{data.homeActivity.posted.filter(row=>scoped(row.circle_ids)).length}</dd><dt>Items posted</dt></div><div><dd>{passedThisMonth}</dd><dt>Items passed along</dt></div><div><dd>{data.homeActivity.members.filter(row=>scoped(row.circle_ids)).length}</dd><dt>Members</dt></div></dl></section>
        <section className="live-section post-invitation"><PackageOpen size={36}/><div><h2>Have something to pass along?</h2><p>A little space for you. A good find for someone else.</p></div><Button asChild><Link to="/post"><Plus size={16}/>Post</Link></Button></section>
      </>}
    </div>
  );
}
export function Swipe() {
  const { data, circleId, circleFilter, act, busy } = useLive(),
    navigate = useNavigate();
  const [sheet, setSheet] = useState(false),
    [missed, setMissed] = useState<LiveItem | null>(null),
    [start, setStart] = useState<number | null>(null);
  const [swipeCategory,setSwipeCategory]=useState("All");
  const items = rank(
    data.items.filter(
      (i) =>
        (!circleFilter || i.circle_ids.includes(circleFilter)) &&
        (swipeCategory === "All" || i.category === swipeCategory) &&
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
    await act("wish", { circle_id: circleId, category: item.category,custom_category:item.custom_category, text: mainWord(item.title) });
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
      <div className="mb-5"><CategoryPicker label="Swipe category" categories={[{id:"all",key:"All",name:"All",position:-1},...data.categories]} value={swipeCategory} onChange={setSwipeCategory} required={false}/></div>
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

function ClearoutPrompt() {
  const { data, act } = useLive();
  const key = `passalong-clearout-answered-${data.userId}`;
  const [answered, setAnswered] = useState(false);
  const [open, setOpen] = useState(false);
  const [thanks, setThanks] = useState(false);
  useEffect(() => { if (sessionStorage.getItem(key)) setAnswered(true); }, [key]);
  const everAnswered = data.profile?.clearout_choice != null;
  if ((answered || everAnswered) && !open) return null;
  const answer = async (choice: boolean) => {
    try { await act("clearout", { choice }); } catch { toast.error("That didn’t save. Please try again."); return; }
    sessionStorage.setItem(key, "1");
    setAnswered(true);
    if (choice) setThanks(true); else setOpen(false);
  };
  return <>
    <div className="clearout-prompt"><Button variant="outline" size="sm" onClick={() => { setOpen(true); setThanks(false); void act("clearout_tap").catch(() => {}); }}>📦 Moving soon? Get notified about clear-out help</Button></div>
    {open && <div className="modal-backdrop" onClick={() => setOpen(false)}><section className="modal-panel clearout-sheet" role="dialog" aria-modal="true" aria-label="Clear-out help, circle first" onClick={e => e.stopPropagation()}>
      <button className="clearout-close" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button>
      {thanks ? <p className="pr-8">Thanks — we'll tell you here in Passalong when it's ready.</p> : <>
        <h2 className="pr-8">Clear-out help, circle first</h2>
        <p className="text-sm text-muted-foreground my-4">Post everything at once, your circle gets first pick, and we arrange pickup of whatever's left. We're thinking about $25. Coming soon. Nothing is charged now.</p>
        <div className="grid gap-3"><Button onClick={() => answer(true)}>Notify me when it's ready</Button><Button variant="outline" onClick={() => answer(false)}>Not for me at $25</Button></div>
      </>}
    </section></div>}
  </>;
}
