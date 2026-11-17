import {describe,it,expect} from 'vitest';
import {endingSoon,moreLike,FOUND_HOME_LIMIT,GIVER_REPLY_HOURS,greeting} from '@/lib/passalong/home-rules';
describe('real circle Home rules',()=>{
 const now=new Date('2026-11-17T18:00:00Z');
 it('ending soon includes the next two days only',()=>{expect(endingSoon({status:'available',expires_at:'2026-11-19T18:00:00Z'},now)).toBe(true);expect(endingSoon({status:'available',expires_at:'2026-11-19T18:00:01Z'},now)).toBe(false);expect(endingSoon({status:'available',expires_at:now.toISOString()},now)).toBe(false);expect(endingSoon({status:'claimed',expires_at:'2026-11-18T18:00:00Z'},now)).toBe(false);});
 it('shows at most six recent new homes',()=>expect(FOUND_HOME_LIMIT).toBe(6));
 it('reply reporting uses a 24-hour window',()=>expect(GIVER_REPLY_HOURS).toBe(24));
 it('similar items must share both category and a circle',()=>{const item={id:'a',category:'Beauty',circle_ids:['one'],status:'available',expires_at:'2026-11-20T18:00:00Z'};expect(moreLike(item,[item,{...item,id:'b'},{...item,id:'c',circle_ids:['two']},{...item,id:'d',category:'Books'},{...item,id:'e',status:'picked_up'}],now).map(i=>i.id)).toEqual(['b']);});
 it('greets using local time and first name only',()=>expect(greeting('Example Member',now)).toBe('Good morning, Example'));
});