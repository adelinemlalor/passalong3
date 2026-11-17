import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Camera, Check, Clock, HandHelping, Heart, Leaf, MapPin, Plane, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { travelPhotos } from '@/lib/passalong/media';
import { contacts } from '@/lib/passalong/data';
import { collections, gardenSubs, moveHelpTitle, moveTags, travelChecklist, type CollectionId, type CollectionPost, type MoveBundle } from '@/lib/passalong/collections';
import { TrustBadge } from './home';
import { usePassalong } from './state';
import { Modal } from './shell';



export function CollectionsRow() {
  const s = usePassalong();
  const count = (id: CollectionId) => id === 'moving' ? s.bundles.reduce((n, b) => n + b.items.length, 0) - 4 : s.collectionPosts.filter(p => p.collection === id).length;
  return <section className="collections-section" aria-label="Collections"><div className="section-label"><h2>Collections</h2><span>For life’s big pass-along moments</span></div>
    <div className="collections-row">{collections.map(c => <Link key={c.id} to="/collections/$id" params={{ id: c.id }} className="collection-card">
      <img src={c.image} alt="" loading="lazy" width={1024} height={768} /><div className="collection-overlay"><strong>{c.title}</strong><span>{count(c.id)} items in your circles</span><small>{c.blurb}</small></div></Link>)}</div>
    {s.bundles[0] && <BundleCard bundle={s.bundles[0]} />}
  </section>;
}

export function BundleCard({ bundle }: { bundle: MoveBundle }) {
  return <Link to="/move/$id" params={{ id: bundle.id }} className="bundle-card">
    <div className="bundle-mosaic">{bundle.items.slice(0, 4).map(i => <img key={i.id} src={i.image} alt="" loading="lazy" />)}<span className="photo-tag"><Truck size={11} /> Move bundle</span></div>
    <div className="bundle-body"><div className="card-person"><img className="avatar avatar-small" src={bundle.photo} alt="" /><span><strong>{bundle.giver} is moving</strong> · {bundle.items.length} items · pickup by {bundle.moveDate}</span></div>
      <div className="bundle-meta"><TrustBadge trust={bundle.trust} /><span><MapPin size={12} /> {bundle.distance}</span><span className="detail-link">See all <ArrowRight size={12} /></span></div></div>
  </Link>;
}

function PostCard({ post }: { post: CollectionPost }) {
  const s = usePassalong(); const claimed = s.collectionClaims.includes(post.id);
  return <article className="offer-card cpost-card">
    <div className="card-photo"><img src={post.image} alt={post.title} loading="lazy" />{post.fresh && <span className="photo-tag fresh-tag"><Leaf size={11} /> {post.fresh}</span>}{post.pickupBy && <span className={`photo-tag countdown-tag ${(post.hoursLeft ?? 99) <= 4 ? 'urgent' : ''}`}><Clock size={11} /> {post.service ? post.pickupBy : `Pickup by ${post.pickupBy}`}</span>}</div>
    <div className="card-body"><div className="card-eyebrow"><span>{post.service ? 'A helping hand' : post.sub ?? 'Post now'}</span><span>{post.distance}</span></div><h3>{post.title}</h3>
      <div className="card-person"><img className="avatar avatar-small" src={post.photo} alt="" /><span>{post.giver}</span><TrustBadge trust={post.trust} /></div>
      <Button className="w-full mb-3" variant={claimed ? 'secondary' : 'default'} onClick={() => { s.claimCollection(post.id); if (!claimed) s.notify(`You’re #1 in line. ${post.giver} will reach out.`); }}>{claimed ? <><Check /> You’re in line</> : post.service ? <><HandHelping /> I’d love a hand</> : <><Heart /> I want this</>}</Button></div>
  </article>;
}

export function CollectionPage({ id }: { id: CollectionId }) {
  const s = usePassalong(); const c = collections.find(x => x.id === id); const [sub, setSub] = useState<string>('All'); const [sort, setSort] = useState<'soon' | 'near'>('soon'); const [flow, setFlow] = useState(false);
  if (!c) return null;
  let posts = s.collectionPosts.filter(p => p.collection === id);
  if (id === 'garden' && sub !== 'All') posts = posts.filter(p => p.sub === sub);
  if (id === 'travel') posts = [...posts].sort((a, b) => sort === 'soon' ? (a.hoursLeft ?? 99) - (b.hoursLeft ?? 99) : parseFloat(a.distance) - parseFloat(b.distance));
  return <div className="collection-page">
    <Link to="/" className="back-link"><ArrowLeft size={17} /> Back to good things</Link>
    <header className="collection-hero"><img src={c.image} alt="" width={1024} height={768} /><div><span className="eyebrow">COLLECTION</span><h1>{c.title}</h1><p>{c.header}</p></div></header>
    {id === 'moving' && <><div className="collection-actions"><Button onClick={() => setFlow(true)}><Camera /> Post a move</Button><Button variant="outline" onClick={() => { if (!s.wishlist.some(w => w.phrase === moveHelpTitle)) s.setWishlist([...s.wishlist, { id: `wish-${Date.now()}`, phrase: moveHelpTitle, distance: 3, trust: 2 }]); s.notify('Added to your wishlist — we’ll tell you when someone offers a hand.'); }}><Truck /> Need help moving?</Button></div>
      <div className="section-label"><h2>Moves near you</h2><span>{s.bundles.length} active</span></div><div className="bundle-list">{s.bundles.map(b => <BundleCard key={b.id} bundle={b} />)}</div>
      {s.collectionPosts.some(p => p.collection === 'moving') && <><div className="section-label mt-6"><h2>Moving help</h2></div><div className="feed-grid">{s.collectionPosts.filter(p => p.collection === 'moving').map(p => <PostCard key={p.id} post={p} />)}</div></>}</>}
    {id === 'garden' && <div className="category-scroll">{['All', ...gardenSubs].map(g => <Button key={g} variant="outline" className={`category-chip ${sub === g ? 'category-active' : ''}`} onClick={() => setSub(g)}>{g}</Button>)}</div>}
    {id === 'travel' && <><div className="collection-actions"><Button onClick={() => setFlow(true)}><Plane /> Quick-post before you go</Button></div>
      <div className="travel-sort"><span className="post-now-pill"><Clock size={12} /> Always posted now · skips the Sunday Drop</span><div className="browse-toggle"><button className={sort === 'soon' ? 'selected' : ''} onClick={() => setSort('soon')}>Expires soon</button><button className={sort === 'near' ? 'selected' : ''} onClick={() => setSort('near')}>Nearest</button></div></div></>}
    {id !== 'moving' && (posts.length ? <div className="feed-grid">{posts.map(p => <PostCard key={p.id} post={p} />)}</div> : <div className="empty-state"><Leaf /><h3>Nothing here yet</h3><p>Try another filter.</p></div>)}
    {flow && id === 'moving' && <MoveFlow onClose={() => setFlow(false)} />}
    {flow && id === 'travel' && <TravelFlow onClose={() => setFlow(false)} />}
  </div>;
}

function MoveFlow({ onClose }: { onClose: () => void }) {
  const s = usePassalong(); const navigate = useNavigate(); const [step, setStep] = useState(0); const [date, setDate] = useState('2026-10-18'); const [photos, setPhotos] = useState<{ img: string; tag: string; title:string }[]>([]); const [win, setWin] = useState('before');
  const pretty = new Date(date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const windows: [string, string][] = [['before', `Anytime before ${pretty}`], ['weekend', 'This weekend, 9am–5pm'], ['evenings', 'Weekday evenings']];
  function finish() {
    const b: MoveBundle = { id: `you-${Date.now()}`, giver: 'You', photo: contacts[2].photo, trust: 0, moveDate: pretty, pickup: windows.find(w => w[0] === win)?.[1] ?? windows[0]?.[1] ?? '', circle: s.circle, distance: '0 mi', items: photos.map((p, i) => ({ id: `you-${i}-${Date.now()}`, title: p.title, tag: p.tag, image: p.img })) };
    s.addBundle(b); s.notify(`Your move bundle is live · ${photos.length} items · pickup by ${pretty}`); onClose(); navigate({ to: '/move/$id', params: { id: b.id } });
  }
  return <Modal title="Post a move" onClose={onClose}><div className="step-indicators mt-3">{[0, 1, 2].map(n => <span key={n} className={n <= step ? 'done' : ''} />)}</div>
    {step === 0 && <div className="mt-4 grid gap-3"><label className="form-label">Move-out date<input type="date" className="text-input" value={date} onChange={e => setDate(e.target.value)} /></label><p className="text-sm text-muted-foreground">Everything goes out at once, straight away — moves skip the Sunday Drop.</p></div>}
    {step === 1 && <div className="mt-4"><Button variant="outline" className="w-full h-12" onClick={() => setPhotos(p => { const samples=s.bundles[0]?.items ?? []; return [...p, ...Array.from({ length: Math.min(6,samples.length) }, (_,i)=>samples[(p.length+i)%samples.length]).flatMap(item=>item?[{img:item.image,tag:item.tag,title:item.title}]:[])]; })}><Camera /> Snap photos ({photos.length})</Button>
      <div className="snap-grid">{photos.map((p, i) => <div key={i} className="snap-tile"><img src={p.img} alt="" /><select aria-label={`Tag photo ${i + 1}`} value={p.tag} onChange={e => setPhotos(v => v.map((x, j) => j === i ? { ...x, tag: e.target.value } : x))}>{moveTags.map(t => <option key={t}>{t}</option>)}</select></div>)}</div></div>}
    {step === 2 && <div className="mt-4 grid gap-2"><p className="form-label">Pickup window</p>{windows.map(([k, l]) => <Button key={k} variant="outline" className={`justify-between h-12 ${win === k ? 'option-selected' : ''}`} onClick={() => setWin(k)}>{l}{win === k && <Check />}</Button>)}</div>}
    <Button className="w-full mt-5 h-12" disabled={step === 1 && photos.length === 0} onClick={() => step < 2 ? setStep(step + 1) : finish()}>{step < 2 ? 'Continue' : `Post ${photos.length} items as a bundle`} <ArrowRight /></Button></Modal>;
}

function TravelFlow({ onClose }: { onClose: () => void }) {
  const s = usePassalong(); const [leave, setLeave] = useState('18:00'); const [picked, setPicked] = useState<string[]>(['Milk', 'Produce']);
  const fmt = (t: string) => { const [h = 0, m = 0] = t.split(':').map(Number); return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h >= 12 ? 'pm' : 'am'}`; };
  function post() {
    const [h = 0] = leave.split(':').map(Number); const hours = Math.max(1, h - 13);
    picked.forEach((item, i) => s.addCollectionPost({ id: `trip-${Date.now()}-${i}`, collection: 'travel', title: `${item} — leaving town`, giver: 'You', photo: contacts[2].photo, image: travelPhotos[item] ?? collections[2]?.image ?? '', trust: 0, distance: '0 mi', pickupBy: `${fmt(leave)} today`, hoursLeft: hours }));
    s.notify(`${picked.length} items posted now · pickup by ${fmt(leave)} today`); onClose();
  }
  return <Modal title="Before you travel" onClose={onClose}><div className="mt-4 grid gap-4"><label className="form-label">When are you leaving?<input type="time" className="text-input" value={leave} onChange={e => setLeave(e.target.value)} /></label>
    <div><p className="form-label">Tap what you’re leaving behind</p><div className="checklist-grid">{travelChecklist.map(t => <Button key={t} variant="outline" className={picked.includes(t) ? 'option-selected' : ''} onClick={() => setPicked(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t])}>{picked.includes(t) ? <Check /> : <Plus />} {t}</Button>)}</div></div>
    <p className="post-now-pill"><Clock size={12} /> Posts right now · skips the Sunday Drop</p>
    <Button className="h-12" disabled={!picked.length} onClick={post}>Post {picked.length} item{picked.length === 1 ? '' : 's'} now <ArrowRight /></Button></div></Modal>;
}

export function BundlePage({ id }: { id: string }) {
  const s = usePassalong(); const b = s.bundles.find(x => x.id === id); const [tag, setTag] = useState('All');
  if (!b) return <div className="empty-state"><Truck /><h3>This move has wrapped up</h3><p>Everything found a new home.</p><Button asChild><Link to="/collections/$id" params={{ id: 'moving' }}>See other moves</Link></Button></div>;
  const items = tag === 'All' ? b.items : b.items.filter(i => i.tag === tag);
  return <div className="collection-page"><Link to="/collections/$id" params={{ id: 'moving' }} className="back-link"><ArrowLeft size={17} /> Moving Out</Link>
    <header className="bundle-head"><img className="avatar" src={b.photo} alt="" /><div><h1>{b.giver === 'You' ? 'Your move' : `${b.giver} is moving`}</h1><p>{b.items.length} items · pickup: {b.pickup} · {b.circle}</p><TrustBadge trust={b.trust} /></div></header>
    <div className="category-scroll">{['All', ...moveTags].map(t => <Button key={t} variant="outline" className={`category-chip ${tag === t ? 'category-active' : ''}`} onClick={() => setTag(t)}>{t}</Button>)}</div>
    <div className="bundle-grid">{items.map(i => { const c = s.collectionClaims.includes(i.id); return <div key={i.id} className="bundle-item"><img src={i.image} alt={i.title} loading="lazy" /><div><span>{i.tag}</span><strong>{i.title}</strong></div>
      {b.giver !== 'You' && <Button size="sm" variant={c ? 'secondary' : 'default'} onClick={() => s.claimCollection(i.id)} aria-label={`${c ? 'Unclaim' : 'Claim'} ${i.title}`}>{c ? <Check /> : <Heart />}{c ? 'Claimed' : 'Claim'}</Button>}</div>; })}</div>
    {b.giver !== 'You' && <p className="bundle-foot">{b.items.filter(i => s.collectionClaims.includes(i.id)).length} claimed · one pickup for everything you choose</p>}
  </div>;
}
