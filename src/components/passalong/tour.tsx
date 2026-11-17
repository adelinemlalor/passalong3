import { useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePassalong } from './state';

type Step = { to: '/' | '/browse' | '/post' | '/drop' | '/messages' | '/messages/$id' | '/profile' | '/wishlist' | '/notifications' | '/leaderboard' | '/collections/$id'; params?: { id: string }; title: string; body: string; tip: string; target?: string; live?: boolean };
const steps: Step[] = [
  { to: '/', title: 'Welcome to Passalong', body: 'An exchange inside your circles for things too useful to toss but not worth selling. This tour visits every tab in about three minutes.', tip: 'Use Next and Back, or exit any time.' },
  { to: '/', title: 'For you: offered to you', body: 'Home leads with what people are offering you. When someone passes something your way, it lands here first — Claim or Pass in one tap.', tip: 'Several offers stack like cards.', target: '.receiver-offers' },
  { to: '/', title: 'For you: matched for you', body: 'Things on your wishlist find you. Each match says why it matched and how you know the giver.', tip: 'Scroll sideways to see more matches.', target: '.matched-section' },
  { to: '/', title: 'For you: roundup and streak', body: 'A small reminder of the Sunday roundup, plus your giving streak — it only grows when something actually reaches someone.', tip: 'No points for opening the app.', target: '.drop-banner' },
  { to: '/', title: 'For you: collections', body: 'Collections cover life’s big moments: moving out, garden swaps, and clearing the fridge before a trip.', tip: 'Tap a photo to open a collection.', target: '.collections-section' },
  { to: '/collections/$id', params: { id: 'garden' }, title: 'A collection up close', body: 'Garden Swap gathers seedlings, cuttings and helping hands, with freshness tags so nothing wilts waiting.', tip: 'Collection posts always go live right away.' },
  { to: '/browse', title: 'Browse', body: 'Want to look around? Browse everything in your circles — swipe one at a time or scroll the full list.', tip: 'Switch between Swipe and Scroll at the top.' },
  { to: '/browse', title: 'Browse: circles and trust', body: 'Pick a circle to narrow things down. Every card shows how you’re connected: Friend, Friend of a friend, or In your circle.', tip: 'Only things from your circles show here.', target: '.card-photo' },
  { to: '/drop', title: 'The Sunday roundup', body: 'Once a week: what was passed along, what’s still looking for a home, and new things matching your wishlist.', tip: 'One calm moment a week, instead of constant pings.', live: true },
  { to: '/post', title: 'Pass it on', body: 'Add a photo, a title and a category. It goes live right away — or save it for Sunday’s roundup.', tip: 'A useful thing or a helping hand, ready for its next chapter.' },
  { to: '/post', title: 'Pass it on: your photo', body: 'Take a photo with your phone’s camera, or upload one from your camera roll or computer. Your chosen photo appears in the preview.', tip: 'Photos stay in this prototype — nothing is sent. Sample photos work too.', target: '.photo-actions' },
  { to: '/post', title: 'Pass it on: friends first', body: 'You choose who sees it first: friends, then friends of friends, then your circles. People whose wishlist matches line up automatically.', tip: 'You can reorder the suggested queue.' },
  { to: '/messages', title: 'Messages', body: 'Every hand-off has its own chat with a status chip, so you can see what’s waiting on you at a glance.', tip: 'Filter by Waiting on you or Pickup today.' },
  { to: '/messages/$id', params: { id: 'sam' }, title: 'The hand-off', body: 'The item stays pinned on top, and a tracker shows where things stand: agreed, time set, on the way, done.', tip: 'Watch the tracker move as you go.', target: '.handoff-tracker' },
  { to: '/messages/$id', params: { id: 'sam' }, title: 'Hand-off: quick replies', body: 'Pickups take two or three taps: quick replies, a suggested time, a pickup spot. Tap “Picked up” to wrap up.', tip: 'Finish to see the thank-you, vouch, and confetti.', target: '.quick-replies' },
  { to: '/notifications', title: 'Notifications', body: 'A calm inbox grouped by Today, This week and Earlier. By default you only hear about the Sunday roundup and direct matches.', tip: 'Tap any notification to jump to it.' },
  { to: '/profile', title: 'Your profile', body: 'Your circles, wishlist, badges and level — everything here is earned by passing things along.', tip: 'Long-press the logo for test settings.' },
  { to: '/profile', title: 'Profile: my circles', body: 'Circles grow only by invite link — no contacts uploaded. Copy a link, leave a circle, or start a new one.', tip: 'Try “Start a circle”.', target: '.my-circles' },
  { to: '/profile', title: 'Profile: badges', body: 'Badges celebrate real hand-offs, like Steady Giver for passing something along 4 weeks in a row.', tip: 'Tap a badge to read its story.', target: '.badge-grid' },
  { to: '/wishlist', title: 'Your wishlist', body: 'Add things — or help, like moving a couch. Help wishes stay private to you and arrive as offers, never public asks.', tip: 'Add a wish and watch matches update.' },
  { to: '/leaderboard', title: 'Circle heroes', body: 'A friendly look at who’s been passing the most along this month — people and whole circles.', tip: 'Can be switched off in test settings.' },
];

export function TourButton() {
  const s = usePassalong();
  return <Button variant="ghost" size="sm" className="tour-button" onClick={() => s.setTourStep(0)} aria-label="Start guided demo"><Play size={14} /><span>Demo</span></Button>;
}

export function Tour() {
  const s = usePassalong(); const navigate = useNavigate(); const path = useRouterState({ select: r => r.location.pathname }); const i = s.tourStep; const step = i === null ? null : steps[i];
  const [, force] = useState(0); const [pos, setPos] = useState<'top' | 'bottom'>('bottom');
  useEffect(() => {
    if (!step) return;
    if (step.live) s.setDropLive(true);
    navigate({ to: step.to, params: step.params as never }).then(() => {
      window.setTimeout(() => { const el = step.target ? document.querySelector(step.target) : null; if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 76; window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); window.setTimeout(() => { const r = el.getBoundingClientRect(); setPos(r.top + r.height / 2 > window.innerHeight * 0.55 ? 'top' : 'bottom'); }, 600); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); setPos('bottom'); } force(n => n + 1); }, 150);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  if (!step || i === null) return null;
  const last = i === steps.length - 1;
  return <aside className={`tour-card tour-pos-${pos}`} role="dialog" aria-label="Guided demo" data-path={path}>
    <div className="tour-top"><span className="eyebrow">GUIDED DEMO · {i + 1} OF {steps.length}</span><Button variant="ghost" size="icon" aria-label="Exit demo" onClick={() => s.setTourStep(null)}><X /></Button></div>
    <h3>{step.title}</h3><p>{step.body}</p><small>{step.tip}</small>
    <div className="tour-dots" aria-hidden>{steps.map((_, n) => <i key={n} className={n === i ? 'on' : n < i ? 'past' : ''} />)}</div>
    <div className="tour-actions">{i > 0 ? <Button variant="outline" onClick={() => s.setTourStep(i - 1)}><ArrowLeft /> Back</Button> : <Button variant="ghost" onClick={() => s.setTourStep(null)}>Skip</Button>}
      <Button onClick={() => { if (last) { s.setTourStep(null); s.notify('That’s Passalong! Explore freely — every button works.'); } else s.setTourStep(i + 1); }}>{last ? 'Finish' : i === 0 ? 'Start' : 'Next'} <ArrowRight /></Button></div>
  </aside>;
}
