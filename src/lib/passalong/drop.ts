import { offers, type Offer } from './data';
import { travelPhotos } from './media';

/** This coming Sunday at 10am local time (today if today is Sunday before 10am, otherwise the next one). */
export function nextSunday(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(10, 0, 0, 0);
  const add = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + add);
  if (add === 0 && now.getTime() >= d.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** e.g. "Oct 25" — this coming Sunday. */
export const dropDate = fmtDate(nextSunday());

/** e.g. "2d 14h" — time from now until Sunday 10am. */
export function dropCountdown(now = new Date()): string {
  const ms = Math.max(0, nextSunday(now).getTime() - now.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export const dropOffers: Offer[] = offers.map((offer, index) => ({ ...offer, id: `drop-${index + 1}`, title: index === 16 ? 'Can help with a jumpstart next week' : index === 15 ? 'Can help move furniture next Saturday' : offer.title, image: index === 16 ? travelPhotos['Jumpstart'] ?? offer.image : offer.image, time: `Sunday Drop · ${dropDate}`, drop: true, lineCount: index < 4 ? [5, 4, 3, 6][index] ?? 3 : index % 3 }));

const pastStats = [
  { items: 47, weight: 112, people: 36 },
  { items: 39, weight: 94, people: 28 },
  { items: 52, weight: 126, people: 41 },
];
/** The three previous Sundays, relative to today. */
export const pastDrops = pastStats.map((s, i) => {
  const d = nextSunday();
  d.setDate(d.getDate() - 7 * (i + 1));
  return { date: fmtDate(d), ...s };
});

/** A date N days from today, formatted like "Oct 30". */
export function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

export function isOfferAvailable(offer: Offer, live: boolean) { return !(offer.held || offer.drop) || live; }
export function watcherCount(category: string) { return category === 'Puzzles & games' ? 12 : category === 'Services' ? 8 : category === 'Pets' ? 16 : 10; }
export function watcherLabel(category: string) { return category === 'Puzzles & games' ? 'puzzles' : category.toLowerCase(); }
