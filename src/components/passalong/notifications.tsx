import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Bell, BellRing, CalendarDays, Check, HandHelping, Heart, Moon, Package, Settings, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/passalong/data';
import { frequencies, inboxItems, overrideOptions, tierOptions, weeklyEstimate, type Frequency, type InboxItem } from '@/lib/passalong/notifications';
import { usePassalong } from './state';

const kindIcon = { drop: CalendarDays, match: Heart, claim: Package, queue: Shuffle, help: HandHelping };

export function FrequencyCards({ value, onChange }: { value: Frequency; onChange: (v: Frequency) => void }) {
  return <div className="frequency-cards" role="radiogroup" aria-label="Notification frequency">
    {frequencies.map(f => <button key={f.id} type="button" role="radio" aria-checked={value === f.id} className={`frequency-card ${value === f.id ? 'frequency-selected' : ''}`} onClick={() => onChange(f.id)}>
      <span className="frequency-dot">{value === f.id && <Check size={12} />}</span>
      <span><strong>{f.label}{f.id === 'drop' && <em>Calm</em>}</strong><small>{f.description}</small></span>
    </button>)}
  </div>;
}

export function useUnreadCount() { const s = usePassalong(); return inboxItems.filter(n => !s.readNotifs.includes(n.id)).length; }

export function NotificationsInbox() {
  const state = usePassalong(); const navigate = useNavigate();
  function open(n: InboxItem) {
    state.markRead(n.id);
    if (n.to === 'offer') { const o = state.offers.find(x => x.title.toLowerCase().includes(n.offerMatch ?? '')); if (o) { navigate({ to: '/item/$id', params: { id: o.id } }); return; } navigate({ to: '/' }); return; }
    if (n.to === '/drop') state.setDropLive(true);
    navigate({ to: n.to });
  }
  const unread = inboxItems.filter(n => !state.readNotifs.includes(n.id)).length;
  return <div className="notif-page">
    <Link to="/" className="back-link"><ArrowLeft size={17} /> Back to good things</Link>
    <div className="notif-head"><div><span className="eyebrow">YOUR LITTLE UPDATES</span><h1>Notifications</h1><p>{unread ? `${unread} new` : 'You’re all caught up'} · {frequencies.find(f => f.id === state.notifPrefs.frequency)?.label}</p></div>
      <Button asChild variant="outline" size="icon" aria-label="Notification settings"><Link to="/notifications/settings"><Settings /></Link></Button></div>
    {unread > 0 && <Button variant="ghost" className="notif-markall" onClick={() => state.markAllRead()}><Check /> Mark all as read</Button>}
    {(['Today', 'This week', 'Earlier'] as const).map(g => <section key={g} className="notif-group"><h2>{g}</h2>
      {inboxItems.filter(n => n.group === g).map(n => { const Icon = kindIcon[n.kind]; const isNew = !state.readNotifs.includes(n.id); return <button key={n.id} className={`notif-row ${isNew ? 'notif-unread' : ''}`} onClick={() => open(n)}>
        <span className={`notif-icon notif-${n.kind}`}><Icon size={18} /></span>
        <span className="notif-text"><strong>{n.text}</strong><small>{n.detail} · {n.time}</small></span>
        {isNew ? <i className="notif-dot" aria-label="Unread" /> : <ArrowRight size={15} />}
      </button>; })}
    </section>)}
    <div className="notif-calm"><Moon size={16} /><p>Quiet hours {fmt(state.notifPrefs.quietStart)}–{fmt(state.notifPrefs.quietEnd)}. We keep it calm: mostly one big moment a week.</p></div>
  </div>;
}

function fmt(t: string) { const [h = 0, m = 0] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; const hh = h % 12 || 12; return m ? `${hh}:${String(m).padStart(2, '0')}${ap}` : `${hh}${ap}`; }
const toggle = (list: string[], v: string) => list.includes(v) ? list.filter(x => x !== v) : [...list, v];

export function NotificationSettings() {
  const state = usePassalong(); const p = state.notifPrefs; const set = (patch: Partial<typeof p>) => state.setNotifPrefs({ ...p, ...patch });
  const est = weeklyEstimate(p);
  return <div className="notif-page">
    <Link to="/notifications" className="back-link"><ArrowLeft size={17} /> Notifications</Link>
    <div className="notif-head"><div><span className="eyebrow">CALM BY DESIGN</span><h1>Notification settings</h1><p>No spam. Mostly one big moment a week.</p></div></div>
    <section className="settings-block"><h2>How often</h2><FrequencyCards value={p.frequency} onChange={frequency => set({ frequency })} /></section>
    <section className="settings-block"><h2>Always notify me about</h2><p className="settings-hint">These come through no matter how often you chose above.</p>
      {overrideOptions.map(o => <label key={o.id} className="settings-switch"><span>{o.label}</span><input type="checkbox" role="switch" checked={p.overrides.includes(o.id)} onChange={() => set({ overrides: toggle(p.overrides, o.id) })} /></label>)}</section>
    <section className="settings-block"><h2>Who I hear from</h2>
      {tierOptions.map(t => <label key={t} className="settings-check"><input type="checkbox" checked={p.tiers.includes(t)} onChange={() => set({ tiers: toggle(p.tiers, t) })} /><span>{t}</span></label>)}</section>
    <section className="settings-block"><h2>Categories</h2><div className="settings-chips">
      {categories.map(([name, emoji]) => <button key={name} type="button" aria-pressed={p.categories.includes(name)} className={`category-chip ${p.categories.includes(name) ? 'category-active' : ''}`} onClick={() => set({ categories: toggle(p.categories, name) })}>{emoji} {name}</button>)}</div></section>
    <section className="settings-block"><h2><Moon size={16} /> Quiet hours</h2><div className="quiet-range">
      <label>From<input type="time" className="text-input" value={p.quietStart} onChange={e => set({ quietStart: e.target.value })} /></label>
      <label>To<input type="time" className="text-input" value={p.quietEnd} onChange={e => set({ quietEnd: e.target.value })} /></label></div></section>
    <div className="notif-preview" aria-live="polite"><BellRing size={20} /><div><strong>This week you’d get about {est} notification{est === 1 ? '' : 's'}</strong><small>{est <= 3 ? 'Lovely and calm.' : est <= 9 ? 'A gentle trickle.' : 'A lively week — you can always dial it back.'} Silent {fmt(p.quietStart)}–{fmt(p.quietEnd)}.</small></div></div>
    <Button className="w-full h-12 mt-4" onClick={() => state.notify('Notification settings saved.')}>Save settings <Bell /></Button>
  </div>;
}
