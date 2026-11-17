import { describe, expect, it } from 'vitest';
import { offers } from '@/lib/passalong/data';
import { dropOffers, fmtDate, isOfferAvailable, nextSunday, pastDrops, watcherCount } from '@/lib/passalong/drop';

describe('Sunday Drop prototype', () => {
  it('contains eighteen weekly offers with services and all trust tiers', () => {
    expect(dropOffers).toHaveLength(18);
    expect(dropOffers.some(o=>o.service)).toBe(true);
    expect(new Set(dropOffers.map(o=>o.trust)).size).toBe(3);
    expect(dropOffers.filter(o=>(o.lineCount??0)>=3)).toHaveLength(4);
  });
  it('holds Sunday offers until the demo release and keeps immediate offers visible', () => {
    for (const offer of dropOffers) {
      expect(isOfferAvailable(offer,false)).toBe(false);
      expect(isOfferAvailable(offer,true)).toBe(true);
    }
    for (const offer of offers) expect(isOfferAvailable(offer,false)).toBe(true);
    const first=offers[0];
    if (!first) throw new Error('Missing fixture');
    expect(isOfferAvailable({...first,held:true},false)).toBe(false);
    expect(isOfferAvailable({...first,held:false},false)).toBe(true);
  });
  it('has category watcher counts and completed archive summaries', () => {
    expect(watcherCount('Puzzles & games')).toBe(12);
    const lastSunday = nextSunday(); lastSunday.setDate(lastSunday.getDate() - 7);
    expect(pastDrops[0]).toMatchObject({ date: fmtDate(lastSunday), items: 47, weight: 112 });
    expect(pastDrops).toHaveLength(3);
  });
});