import { contacts } from './data';
// Browser-safe dummy gamification data. Warm and community-minded; no real scoring engine.
export const levels = [
  { name: 'Newcomer', min: 0 },
  { name: 'Regular', min: 100 },
  { name: 'Giver', min: 250 },
  { name: 'Circle Regular', min: 400 },
  { name: 'Circle Pillar', min: 700 },
] as const;

export const pointRules = [
  { label: 'Passing an item along (hand-off complete)', pts: 10 },
  { label: 'Helping with a service (hand-off complete)', pts: 20 },
  { label: 'Receiving an item (hand-off complete)', pts: 5 },
  { label: 'A thank-you note from your circle', pts: 15 },
];

export const startingPoints = 340;

export function levelFor(points: number) {
  let i = 0;
  levels.forEach((l, n) => { if (points >= l.min) i = n; });
  const current = levels[i]!;
  const next = levels[i + 1];
  const progress = next ? (points - current.min) / (next.min - current.min) : 1;
  return { index: i, current, next, progress, toNext: next ? next.min - points : 0 };
}

export type BadgeId = 'first-pass' | 'zero-waste' | 'plant-parent' | 'pet-pal' | 'helping-hand' | 'steady-giver' | 'trusted' | 'moving-hero';
export type Badge = { id: BadgeId; name: string; emoji: string; description: string; howTo: string; earned?: string; story?: string };

export const badges: Badge[] = [
  { id: 'first-pass', name: 'First Pass', emoji: '🎁', description: 'Gave away your first item', howTo: 'Pass along your first item.', earned: 'Mar 12, 2025', story: 'You gave Demo B a puzzle on Mar 12 — the first of many good things.' },
  { id: 'zero-waste', name: 'Zero Waste Week', emoji: '♻️', description: 'Passed along 3+ items in one week', howTo: 'Pass along 3 items in a single week.' },
  { id: 'plant-parent', name: 'Plant Parent', emoji: '🌱', description: 'Shared seedlings, cuttings, or produce', howTo: 'Share seedlings, cuttings, or produce.', earned: 'Sep 21, 2026', story: 'You shared 6 tomato seedlings with Demo D on Sep 21.' },
  { id: 'pet-pal', name: 'Pet Pal', emoji: '🐾', description: 'Passed along pet supplies', howTo: 'Pass along pet toys, treats, or gear.', earned: 'Aug 30, 2026', story: 'You gave Demo A a crinkle tunnel her cat now loves on Aug 30.' },
  { id: 'helping-hand', name: 'Helping Hand', emoji: '🤝', description: 'Helped someone in your circle with a service', howTo: 'Help someone in your circle with a service.', earned: 'Jul 19, 2026', story: 'You watered Alex’s plants for a week while he was away, Jul 19.' },
  { id: 'steady-giver', name: 'Steady Giver', emoji: '🌿', description: 'Passed something along 4 weeks in a row', howTo: 'Pass something along 4 weeks in a row. You’re at 3 of 4.' },
  { id: 'trusted', name: 'Trusted', emoji: '🛡️', description: 'Received 5 vouches', howTo: 'Receive 5 vouches from your circles.', earned: 'Oct 4, 2026', story: 'Demo B’s vouch on Oct 4 was your fifth. Your circles trust you.' },
  { id: 'moving-hero', name: 'Moving Day Helper', emoji: '📦', description: 'Helped someone move', howTo: 'Help someone in your circle move furniture or boxes.' },
];

export const impact = { passed: 18, received: 12, services: 4, lbs: 64, saved: 285 };
export const streak = { weeks: 4, atRisk: true };

export const neighborBoard = [
  {name:contacts[0].name,photo:0,items:21},
  {name:contacts[2].name,photo:2,items:18,you:true},
  {name:contacts[1].name,photo:1,items:15},
  {name:contacts[3].name,photo:3,items:12},
  {name:contacts[4].name,photo:4,items:5},
];
export const circleBoard = [
  { name: 'The Ashby building', items: 412, members: 138 },
  { name: 'Design studio class', items: 386, members: 121 },
  { name: 'Friday dinner crew', items: 341, members: 109 },
  { name: 'The corner book club', items: 298, members: 164 },
];

/** Demo celebration after a hand-off: +10 pass, +5 smooth bonus, ~2 lbs. */
export const handoffReward = { pts: 10, bonus: 5, lbs: 2, badge: 'zero-waste' as BadgeId };
