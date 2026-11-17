import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Copy, HeartHandshake, Lock, Share2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contacts } from '@/lib/passalong/data';
import { badges, impact, levelFor, levels, neighborBoard, circleBoard, pointRules, streak, type BadgeId } from '@/lib/passalong/rewards';
import { usePassalong } from './state';
import { Modal } from './shell';

function useBadges() {
  const s = usePassalong();
  return badges.map(b => { const n = s.newBadges[b.id]; return n ? { ...b, earned: n.date, story: n.story } : b; });
}

export function LevelCard() {
  const s = usePassalong(); const l = levelFor(s.points); const [how, setHow] = useState(false);
  return <section className="reward-card level-card">
    <div className="level-top"><span className="level-icon">🏡</span><div><span className="eyebrow">YOUR GOOD IS GROWING</span><h2>{l.current.name}</h2><p>{l.current.name} · {s.points} pts{l.next ? ` · ${l.toNext} pts to ${l.next.name}` : ''}</p></div></div>
    <div className="level-progress" role="progressbar" aria-valuenow={Math.round(l.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress to ${l.next?.name ?? 'top level'}`}><span style={{ width: `${l.progress * 100}%` }} /></div>
    <ol className="level-steps">{levels.map((v, i) => <li key={v.name} className={i <= l.index ? 'reached' : ''}>{v.name}</li>)}</ol>
    <Button variant="ghost" className="level-how" onClick={() => setHow(!how)}>{how ? 'Hide' : 'How points grow'}</Button>
    {how && <ul className="point-rules">{pointRules.map(r => <li key={r.label}><span>{r.label}</span><strong>+{r.pts}</strong></li>)}</ul>}
  </section>;
}

export function StreakCard({ compact }: { compact?: boolean }) {
  const s = usePassalong(); const safe = s.handedOff.length > 0 || !streak.atRisk;
  return <section className={`reward-card streak-card ${compact ? 'streak-compact' : ''}`}>
    <span className="streak-flame" aria-hidden>🔥</span>
    <div><strong>{streak.weeks}-week giving streak</strong><p>{safe ? 'You passed something along this week. Lovely.' : `${streak.weeks} weeks of passing things along. Nice.`}</p></div>
    <div className="streak-weeks" aria-hidden>{[0, 1, 2, 3, 4].map(i => <i key={i} className={i < streak.weeks || (i === 4 && safe) ? 'on' : ''} />)}</div>
  </section>;
}

export function BadgeGrid() {
  const list = useBadges(); const [open, setOpen] = useState<BadgeId | null>(null); const b = list.find(x => x.id === open);
  return <section className="reward-card"><div className="section-label"><h2>Badges</h2><span>{list.filter(x => x.earned).length} of {list.length}</span></div>
    <div className="badge-grid">{list.map(x => <button key={x.id} className={`badge-tile ${x.earned ? '' : 'badge-locked'}`} onClick={() => setOpen(x.id)} aria-label={`${x.name}${x.earned ? '' : ', locked'}`}>
      <span className="badge-emoji">{x.emoji}{!x.earned && <Lock size={11} className="badge-lock" />}</span><strong>{x.name}</strong>{!x.earned && <small>{x.howTo}</small>}</button>)}</div>
    {b && <Modal title={b.name} onClose={() => setOpen(null)}><div className="badge-detail"><span className={`badge-emoji badge-emoji-lg ${b.earned ? '' : 'badge-locked'}`}>{b.emoji}</span><p className="badge-desc">{b.description}</p>
      {b.earned ? <><span className="badge-date">Earned {b.earned}</span><p className="badge-story">“{b.story}”</p></> : <p className="badge-story">Not yet. {b.howTo}</p>}</div></Modal>}
  </section>;
}

export function ImpactStats() {
  const s = usePassalong(); const [share, setShare] = useState(false); const extra = s.handedOff.length;
  const stats = [[impact.passed + extra, 'Items passed along'], [impact.received, 'Items received'], [impact.services, 'Services given'], [`${impact.lbs + extra * 2} lbs`, 'Kept out of landfill'], [`$${impact.saved + extra * 15}`, 'Saved by your circles']] as const;
  return <section className="reward-card"><div className="section-label"><h2>Your impact</h2><Button variant="outline" size="sm" onClick={() => setShare(true)}><Share2 /> Share your impact</Button></div>
    {s.conversations.some(c=>c.stage===3&&c.kind!=='receiving')&&<div className="passed-list"><span>Recently passed along</span>{s.conversations.filter(c=>c.stage===3&&c.kind!=='receiving').map(c=><Link key={c.id} to="/messages/$id" params={{id:c.id}} className="passed-chip"><img src={c.image} alt=""/>{c.item.split(' · ')[0]} → {c.name}</Link>)}</div>}<div className="impact-grid">{stats.map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
    {share && <Modal title="Share your impact" onClose={() => setShare(false)}><div className="share-card"><div className="share-brand"><HeartHandshake size={18} /> passalong</div><span className="eyebrow">EMMA IN THE ASHBY BUILDING · 2026</span><h3>{impact.passed + extra} good things passed along</h3>
      <div className="share-stats"><div><strong>{impact.lbs + extra * 2}</strong><span>lbs kept out of landfill</span></div><div><strong>${impact.saved + extra * 15}</strong><span>saved by your circles</span></div><div><strong>{impact.services}</strong><span>helping hands</span></div></div>
      <p>🔥 {streak.weeks}-week giving streak · {levelFor(s.points).current.name}</p></div>
      <div className="share-actions"><Button onClick={() => { setShare(false); s.notify('Impact card shared — demo only.'); }}><Share2 /> Share</Button><Button variant="outline" onClick={() => { setShare(false); s.notify('Link copied — demo only.'); }}><Copy /> Copy link</Button></div></Modal>}
  </section>;
}

export function Celebrations() {
  const s = usePassalong(); const b = badges.find(x => x.id === s.badgeModal); const story = s.badgeModal ? s.newBadges[s.badgeModal]?.story : '';
  return <>
    {s.celebration && <div className="celebrate" role="dialog" aria-label="Hand-off complete" onClick={s.closeCelebration}>
      <div className="confetti" aria-hidden>{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.07}s`, ['--r' as string]: `${(i * 47) % 360}deg` }} className={`c${i % 4}`} />)}</div>
      <div className="celebrate-card" onClick={e => e.stopPropagation()}><span className="celebrate-emoji">🎉</span><h2>+{s.celebration.pts} pts</h2><p>You kept {s.celebration.lbs} lbs out of landfill.</p><small>+10 for passing it along · +5 smooth pickup bonus</small><Button className="w-full mt-4" onClick={s.closeCelebration}>Lovely <ArrowRight /></Button></div>
    </div>}
    {b && <Modal title="New badge!" onClose={() => s.setBadgeModal(null)}><div className="badge-detail"><span className="badge-emoji badge-emoji-lg badge-pop">{b.emoji}</span><h3>{b.name}</h3><p className="badge-desc">{b.description}</p><p className="badge-story">“{story}”</p>
      <Button className="w-full mt-4" onClick={() => { s.setBadgeModal(null); s.notify('Badge shared with your circle — demo only.'); }}><Share2 /> Share</Button></div></Modal>}
  </>;
}

export function Leaderboard() {
  const s = usePassalong(); const [tab, setTab] = useState<'People' | 'Circles'>('People'); const max = circleBoard[0]!.items;
  return <div className="notif-page">
    <Link to="/profile" className="back-link"><ArrowLeft size={17} /> Your profile</Link>
    <div className="notif-head"><div><span className="eyebrow">OCTOBER · {s.circle.toUpperCase()}</span><h1>Circle heroes</h1><p>Celebrating everyone who passes good things along.</p></div><Trophy className="text-primary" /></div>
    <div className="browse-toggle board-tabs">{(['People', 'Circles'] as const).map(t => <button key={t} className={tab === t ? 'selected' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'People' ? <ol className="board-list">{neighborBoard.map((n, i) => <li key={n.name} className={n.you ? 'board-you' : ''}><span className="board-rank">{i + 1}</span><img className="avatar avatar-small" src={contacts[n.photo]?.photo} alt="" /><strong>{n.you ? `You (${n.name})` : n.name}</strong><span>{n.items} things given</span></li>)}</ol>
      : <ol className="board-list">{circleBoard.map((n, i) => <li key={n.name} className={n.name === s.circle ? 'board-you' : ''}><span className="board-rank">{i + 1}</span><div className="board-hood"><strong>{n.name}{n.name === s.circle ? ' · your circle' : ''}</strong><div className="board-bar"><span style={{ width: `${(n.items / max) * 100}%` }} /></div><small>{n.members} members sharing</small></div><span>{n.items} items</span></li>)}</ol>}
    <p className="board-note">Everyone who gives is a hero here. Rankings reset each month.</p>
  </div>;
}
