import { describe, expect, it } from 'vitest';
import { offers } from '@/lib/passalong/data';
import { dropOffers } from '@/lib/passalong/drop';
import { advanceQueue, demoMatches, initialQueues, initialWishlist, matchingOffers, suggestedRecipients } from '@/lib/passalong/matching';
const all=[...offers,...dropOffers,...matchingOffers];
describe('Dummy wishlist matching',()=>{
 it('starts with Adeline’s eight wishes and explained great and good matches',()=>{expect(initialWishlist).toHaveLength(8);const matches=demoMatches([...initialWishlist,{id:'demo-puzzle',phrase:'puzzles'}],all,false);expect(matches.some(m=>m.strength==='Great match')).toBe(true);expect(matches.some(m=>m.strength==='Good match')).toBe(true);});
 it('respects distance, trust and the Sunday release gate',()=>{expect(demoMatches([{id:'x',phrase:'puzzles',distance:0.5,trust:0}],all,false).map(m=>m.offer.id)).toEqual(['match-incoming']);expect(demoMatches(initialWishlist,all,false).some(m=>m.offer.drop)).toBe(false);});
 it('honors editable wishes and condition preferences',()=>{expect(demoMatches([],all,false)).toEqual([]);expect(demoMatches([{id:'x',phrase:'unknown wish'}],all,false)).toEqual([]);const opened=all.map(o=>o.id==='1'?{...o,condition:'Opened, barely used'}:o);expect(demoMatches([{id:'x',phrase:'cat toys',opened:false}],opened,false)).toEqual([]);});
 it('suggests four recipients and advances until the queue is exhausted',()=>{expect(suggestedRecipients('Pets')).toHaveLength(4);let queue=initialQueues[0];if(!queue)throw new Error('Missing queue');queue=advanceQueue(queue,'passed');expect(queue.previous).toBe('Demo A');expect(queue.recipients[queue.index]?.name).toBe('Demo B');for(let i=0;i<3;i++)queue=advanceQueue(queue,'expired');expect(queue.status).toBe('finished');expect(advanceQueue(queue,'passed')).toBe(queue);});
 it('never advances an already claimed queue',()=>{const queue=initialQueues[0];if(!queue)throw new Error('Missing queue');expect(advanceQueue({...queue,status:'claimed'},'expired').index).toBe(0);});
});