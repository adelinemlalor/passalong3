// Browser-safe dummy data for calm notifications. No real delivery or timers.
export type Frequency = 'drop' | 'daily' | 'instant';
export const frequencies: { id: Frequency; label: string; description: string }[] = [
  { id: 'drop', label: 'Sunday Drop only', description: 'One notification a week when the drop goes live.' },
  { id: 'daily', label: 'Daily digest', description: 'One summary each evening.' },
  { id: 'instant', label: 'Instant', description: 'Every match and claim as it happens.' },
];
export const overrideOptions = [
  { id: 'wishlist', label: 'Direct matches from my wishlist' },
  { id: 'claimed', label: 'Someone claimed my item' },
  { id: 'friendsUrgent', label: 'Time-sensitive items from friends' },
  { id: 'help', label: 'Offers of help (services)' },
] as const;
export const tierOptions = ['Friends', 'Friends of friends', 'In your circles'] as const;

export type NotifPrefs = {
  frequency: Frequency;
  overrides: string[];
  tiers: string[];
  categories: string[];
  quietStart: string;
  quietEnd: string;
};
export const defaultPrefs: NotifPrefs = {
  frequency: 'drop',
  overrides: ['wishlist', 'claimed'],
  tiers: ['Friends', 'Friends of friends', 'In your circles'],
  categories: ['Pets', 'Puzzles & games', 'Beauty', 'Kids', 'Garden', 'Food', 'Household', 'Services'],
  quietStart: '21:00',
  quietEnd: '08:00',
};

/** Fake weekly estimate — plausible numbers, not a real model. */
export function weeklyEstimate(p: NotifPrefs): number {
  const base = p.frequency === 'drop' ? 1 : p.frequency === 'daily' ? 7 : 18;
  const reach = (p.tiers.length / 3) * (p.categories.length / 8);
  if (p.frequency === 'instant') return Math.max(p.tiers.length && p.categories.length ? 1 : 0, Math.round(base * reach) + p.overrides.length);
  const extras = { wishlist: 1, claimed: 1, friendsUrgent: p.tiers.includes('Friends') ? 1 : 0, help: p.categories.includes('Services') ? 1 : 0 } as Record<string, number>;
  return base + Math.round(p.overrides.reduce((s, o) => s + (extras[o] ?? 0), 0) * 0.5 * Math.max(reach, 0.34));
}

export type InboxItem = {
  id: string;
  group: 'Today' | 'This week' | 'Earlier';
  kind: 'drop' | 'match' | 'claim' | 'queue' | 'help';
  text: string;
  detail: string;
  time: string;
  /** Where tapping goes: a path, or an offer title fragment to look up. */
  to: '/drop' | '/profile' | '/wishlist' | 'offer';
  offerMatch?: string;
};
export const inboxItems: InboxItem[] = [
  { id: 'n1', group: 'Today', kind: 'drop', text: 'The Sunday Drop is live · 31 new items, 4 match your wishlist', detail: 'Sunday Drop', time: '10:00am', to: '/drop' },
  { id: 'n2', group: 'Today', kind: 'match', text: 'New match: crinkle tunnel cat toy from Demo A (friend), 0.2 mi', detail: 'Matches your wishlist: cat toys', time: '9:12am', to: 'offer', offerMatch: 'crinkle tunnel' },
  { id: 'n3', group: 'This week', kind: 'claim', text: 'Demo B claimed your puzzle · arrange pickup', detail: 'Your offers', time: 'Thu', to: '/profile' },
  { id: 'n4', group: 'This week', kind: 'queue', text: 'Your moisturizer moved to the next person in line', detail: 'Your offers', time: 'Wed', to: 'offer', offerMatch: 'moistur' },
  { id: 'n5', group: 'Earlier', kind: 'help', text: 'Demo A offered to help move a couch Saturday · Friend of a friend', detail: 'Offer of help', time: 'Sep 29', to: 'offer', offerMatch: 'move furniture' },
];
