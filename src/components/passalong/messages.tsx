import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Ban, CalendarClock, Check, Flag, HandHeart, MapPin, MoreVertical, Send, ShieldCheck, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { quickReplies, stages, statusChip, timeSlots, type Conversation, type Msg } from '@/lib/passalong/messages';
import { TrustBadge } from './home';
import { usePassalong } from './state';
import { Modal } from './shell';

const order = { 'Waiting on you': 0, 'Pickup today': 1, Claimed: 2, Done: 3 } as const;
const chipClass = (s: string) => `status-chip status-${s.split(' ')[0]!.toLowerCase()}`;

export function useWaitingCount() { return usePassalong().conversations.filter(c => statusChip(c) === 'Waiting on you' && !c.blocked).length; }

export function MessagesList() {
  const s = usePassalong(); const [filter, setFilter] = useState('All');
  const list = s.conversations.filter(c => !c.blocked).filter(c => filter === 'All' || (filter === 'Giving' && c.kind === 'giving') || (filter === 'Receiving' && c.kind === 'receiving') || (filter === 'Services' && c.kind === 'service'))
    .sort((a, b) => order[statusChip(a)] - order[statusChip(b)]);
  return <div className="notif-page">
    <div className="notif-head"><div><span className="eyebrow">TWO OR THREE MESSAGES, NOT TWENTY</span><h1>Messages</h1><p>{list.filter(c => statusChip(c) === 'Waiting on you').length} waiting on you</p></div></div>
    <div className="category-scroll">{['All', 'Giving', 'Receiving', 'Services'].map(f => <Button key={f} variant="outline" className={`category-chip ${filter === f ? 'category-active' : ''}`} onClick={() => setFilter(f)}>{f}</Button>)}</div>
    <div className="convo-list">{list.map(c => { const last = c.messages.at(-1); const chip = statusChip(c); return <Link key={c.id} to="/messages/$id" params={{ id: c.id }} className={`convo-row ${chip === 'Waiting on you' ? 'convo-action' : ''}`}>
      <img className="avatar" src={c.photo} alt={c.name} />
      <div className="convo-main"><div className="convo-top"><strong>{c.name}</strong><TrustBadge trust={c.trust} /></div>
        <p className="convo-item">{c.kind === 'service' ? '🤝 ' : c.bundle ? '📦 ' : ''}{c.item}</p><p className="convo-last">{last?.from === 'me' ? 'You: ' : ''}{last?.kind === 'slots' ? 'Suggested 3 times' : last?.text}</p></div>
      <div className="convo-side"><img src={c.image} alt="" /><span className={chipClass(chip)}>{chip}</span></div></Link>; })}
      {!list.length && <div className="empty-state"><Users /><h3>No conversations here</h3><p>Claim something and say hello.</p></div>}</div>
  </div>;
}

export function ConversationView({ id }: { id: string }) {
  const s = usePassalong(); const navigate = useNavigate(); const c = s.conversations.find(x => x.id === id);
  const [text, setText] = useState(''); const [menu, setMenu] = useState(false); const [picker, setPicker] = useState(false); const [slots, setSlots] = useState<string[]>([]); const [wrap, setWrap] = useState(false); const [note, setNote] = useState(''); const [vouched, setVouched] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [c?.messages.length]);
  if (!c) return <div className="empty-state"><Users /><h3>Conversation not found</h3><Button asChild><Link to="/messages">Back to messages</Link></Button></div>;
  const chip = statusChip(c); const service = c.kind === 'service'; const confirmed = c.stage >= 1;
  const upd = (fn: (v: Conversation) => Conversation) => s.updateConversation(c.id, fn);
  const send = (t: string, extra: Partial<Msg> = {}, advance = false) => upd(v => ({ ...v, waitingOnYou: false, stage: advance && v.stage < 1 ? 1 : v.stage, messages: [...v.messages, { id: `u${Date.now()}`, from: 'me', text: t, ...extra }] }));
  const arranging = /porch|anytime|come by|drop it off|grab it|works|I can help/i;
  function pickSlot(m: Msg, slot: string) { upd(v => ({ ...v, stage: v.stage < 1 ? 1 : v.stage, waitingOnYou: false, pickupToday: slot.startsWith('Today'), messages: [...v.messages.map(x => x.id === m.id ? { ...x, picked: slot } : x), { id: `u${Date.now()}`, from: m.from === 'me' ? 'them' : 'me', text: `${slot} works!` }] })); }
  function finish() {
    upd(v => ({ ...v, stage: 3, waitingOnYou: false, ...(note ? { thanks: note } : {}), messages: note ? [...v.messages, { id: `u${Date.now()}`, from: 'me', text: note, kind: 'note' }] : v.messages }));
    setWrap(false); if (vouched) s.notify(`You vouched for ${c!.name}. +15 pts for them!`); s.completeHandoff(`convo-${c!.id}`);
  }
  const doneLabel = service ? 'Mark help as done' : c.kind === 'receiving' ? 'Picked up' : `Demo: ${c.name} picked it up`;
  return <div className="convo-page">
    <header className="convo-header"><Button variant="ghost" size="icon" aria-label="Back to messages" onClick={() => navigate({ to: '/messages' })}><ArrowLeft /></Button><img className="avatar avatar-small" src={c.photo} alt="" /><div><strong>{c.name}</strong><TrustBadge trust={c.trust} /></div>
      <div className="convo-menu"><Button variant="ghost" size="icon" aria-label="Conversation options" onClick={() => setMenu(!menu)}><MoreVertical /></Button>{menu && <div className="menu-pop" role="menu"><button role="menuitem" onClick={() => { setMenu(false); s.notify(`Thanks — we’ll take a look. ${c.name} won’t know you reported.`); }}><Flag size={15} /> Report</button><button role="menuitem" className="danger" onClick={() => { upd(v => ({ ...v, blocked: true })); s.notify(`You blocked ${c.name}. They can’t message you.`); navigate({ to: '/messages' }); }}><Ban size={15} /> Block {c.name}</button></div>}</div></header>
    {c.via && <p className="via-note"><Users size={13} /> You’re connected through {c.via}.</p>}
    <section className="pinned-card"><img src={c.image} alt={c.item} /><div><span className={chipClass(chip)}>{chip}</span><strong>{c.item}</strong><p><MapPin size={12} /> {c.pickup}</p><p className="pin-address">{confirmed ? <><ShieldCheck size={12} /> {c.spot} · exact address shared</> : <><ShieldCheck size={12} /> Exact address shared after claim is confirmed</>}</p></div></section>
    <ol className="handoff-tracker" aria-label="Hand-off status">{stages.map((st, i) => <li key={st} className={i <= c.stage ? 'done' : ''}><span>{i < c.stage || c.stage === 3 ? <Check size={11} /> : i + 1}</span>{service ? ['Asked', 'Time set', 'Helped', 'Thanked'][i] : st}</li>)}</ol>
    <div className="msg-thread">{c.messages.map(m => <div key={m.id} className={`msg msg-${m.from} ${m.kind ? 'msg-' + m.kind : ''}`}>
      {m.kind === 'spot' ? <div className="spot-card"><MapPin size={16} /><div><strong>Pickup spot</strong><span>{m.text}</span></div></div>
        : m.kind === 'slots' ? <div><p>{m.text}</p><div className="slot-chips">{m.slots?.map(sl => <button key={sl} className={m.picked === sl ? 'picked' : ''} disabled={!!m.picked} onClick={() => pickSlot(m, sl)}>{m.picked === sl && <Check size={12} />}{sl}</button>)}</div>{!m.picked && m.from === 'me' && <small>Demo: tap a time to answer for {c.name}</small>}</div>
          : m.kind === 'note' ? <div className="note-card"><HandHeart size={15} /><span>{m.text}</span></div> : m.text}</div>)}<div ref={end} /></div>
    {c.stage === 3 ? <div className="done-banner"><Check /> Passed along · {c.thanks ? 'thank-you note shared' : 'all wrapped up'}</div> : <div className="composer">
      {c.stage < 2 && (c.kind === 'receiving' || c.stage >= 1) && <Button className="w-full mb-2" variant={c.kind === 'receiving' ? 'default' : 'outline'} onClick={() => { upd(v => ({ ...v, stage: 2 })); setWrap(true); }}><Truck /> {doneLabel}</Button>}
      {c.stage === 2 && <Button className="w-full mb-2" onClick={() => setWrap(true)}><HandHeart /> Wrap up & say thanks</Button>}
      <div className="quick-replies">{quickReplies(c).map(q => <button key={q} onClick={() => send(q, {}, arranging.test(q))}>{q}</button>)}</div>
      <div className="composer-tools"><Button variant="ghost" size="sm" onClick={() => setPicker(true)}><CalendarClock /> Suggest a time</Button><Button variant="ghost" size="sm" onClick={() => send(`${c.spot} · ${confirmed ? 'exact address shared' : 'exact address shared after claim'}`, { kind: 'spot' })}><MapPin /> Share pickup spot</Button></div>
      <form className="composer-input" onSubmit={e => { e.preventDefault(); if (text.trim()) { send(text.trim(), {}, arranging.test(text)); setText(''); } }}><input className="text-input" placeholder={`Message ${c.name}…`} value={text} onChange={e => setText(e.target.value)} aria-label="Message" /><Button size="icon" type="submit" aria-label="Send" disabled={!text.trim()}><Send /></Button></form>
    </div>}
    {picker && <Modal title="Suggest a time" onClose={() => setPicker(false)}><p className="text-sm text-muted-foreground mt-3">Pick up to 3 — {c.name} taps one and you’re set.</p><div className="grid gap-2 mt-4">{timeSlots.map(t => <Button key={t} variant="outline" className={`justify-between h-11 ${slots.includes(t) ? 'option-selected' : ''}`} disabled={!slots.includes(t) && slots.length >= 3} onClick={() => setSlots(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t])}>{t}{slots.includes(t) && <Check />}</Button>)}</div>
      <Button className="w-full mt-4" disabled={!slots.length} onClick={() => { send('Pick a time that works:', { kind: 'slots', slots }); setSlots([]); setPicker(false); }}>Send {slots.length || ''} time{slots.length === 1 ? '' : 's'} <Send /></Button></Modal>}
    {wrap && <Modal title={service ? 'Thanks for helping!' : 'Hand-off complete!'} onClose={() => setWrap(false)}><div className="wrap-card"><img src={c.image} alt="" /><p><strong>{c.item}</strong> {service ? 'is done' : 'found a new home'}. A quick wrap-up for you and {c.name}:</p></div>
      <label className="form-label mt-4">Thank-you note <span className="text-muted-foreground font-normal">(optional)</span><textarea className="text-input h-20" placeholder={`Thanks so much, ${c.name}!`} value={note} onChange={e => setNote(e.target.value)} /></label>
      <Button variant={vouched ? 'secondary' : 'outline'} className="w-full mt-3" onClick={() => setVouched(!vouched)}>{vouched ? <><Check /> Vouched for {c.name}</> : <><ShieldCheck /> Vouch for {c.name}</>}</Button>
      <Button className="w-full mt-3 h-12" onClick={finish}>Finish & celebrate <HandHeart /></Button></Modal>}
  </div>;
}
