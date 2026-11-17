import { contacts, offers, selfIndex, type Offer } from './data';
import { isOfferAvailable } from './drop';
import babyGate from '@/assets/baby-gate.jpg';

export type Wish = { id:string; phrase:string; distance?:number | undefined; trust?:number | undefined; opened?:boolean | undefined };
export type Recipient = { id:string; name:string; photo:string; trust:number; distance:number; phrase:string };
export type MatchQueue = { offerId:string; role:'giver'|'receiver'; recipients:Recipient[]; index:number; status:'offered'|'claimed'|'finished'; previous?:string | undefined; event?:'passed'|'expired' | undefined };
export const initialWishlist:Wish[] = contacts[selfIndex].wishlist.map((phrase,i)=>({id:`wish-${i+1}`,phrase,trust:2,opened:true}));
const puzzle=offers[2];const tunnel=offers[0];const gate=offers[5];
export const matchingOffers:Offer[] = [
 ...(puzzle?[{...puzzle,id:'match-incoming',title:'1000-piece puzzle, ready for you',giver:3,trust:0}]:[]),
 ...(tunnel?[{...tunnel,id:'match-outgoing',title:'Our spare crinkle tunnel cat toy',giver:2,trust:0}]:[]),
 ...(gate?[{...gate,id:'match-gate',image:babyGate,title:'Baby gate for a little explorer',category:'Kids',giver:1,trust:1,condition:'Gently used',description:'A sturdy pressure-fit baby gate, ready for another little explorer.'}]:[]),
];
export function connectionLabel(tier:number){return ['Friend','Friend of a friend (2 mutuals)','In your circle'][tier]??'In your circle';}
const phrases:Record<string,string> = {'Pets':'cat toys','Puzzles & games':'puzzles','Kids':'baby gate','Garden':'tomato seedlings','Services':'help moving a couch','Beauty':'moisturizer','Food':'pantry extras','Household':'household essentials'};
export function suggestedRecipients(category:string):Recipient[]{
 const phrase=phrases[category]??category.toLowerCase();
 return [contacts[0],contacts[1],contacts[3],contacts[4]].map((person,i)=>({id:`person-${i}`,name:person.name,photo:person.photo,trust:[0,1,1,2][i]??2,distance:[0.2,0.4,0.7,1.2][i]??1.2,phrase}));
}
export const initialQueues:MatchQueue[] = [
 {offerId:'match-outgoing',role:'giver',recipients:suggestedRecipients('Pets'),index:0,status:'offered'},
 {offerId:'match-incoming',role:'receiver',recipients:[{id:'self',name:contacts[selfIndex].name,photo:contacts[2].photo,trust:0,distance:0.3,phrase:'puzzles'},...suggestedRecipients('Puzzles & games')],index:0,status:'offered'},
];
// Explicit demo pairings, not semantic search or an AI matching algorithm.
const pairings:Record<string,Array<{id:string;distance:number}>>={
 'puzzles':[{id:'match-incoming',distance:0.3},{id:'3',distance:0.7},{id:'drop-3',distance:0.4}],
 'baby gate':[{id:'match-gate',distance:0.8}],
 'cat toys':[{id:'1',distance:0.2}],
 'tomato seedlings':[{id:'2',distance:0.4}],
 'help moving a couch':[{id:'16',distance:0.6}],
 'help moving couch':[{id:'16',distance:0.6}],
 'seeds for planting':[{id:'2',distance:0.4}],
 'pots for plants':[{id:'9',distance:0.3}],
};
export function demoMatches(wishlist:Wish[], allOffers:Offer[], live:boolean){
 return wishlist.flatMap(wish=>(pairings[wish.phrase.trim().toLowerCase()]??[]).flatMap(pair=>{
  const offer=allOffers.find(o=>o.id===pair.id);
  if(!offer||!isOfferAvailable(offer,live)||(wish.distance!==undefined&&pair.distance>wish.distance)||(wish.trust!==undefined&&offer.trust>wish.trust)||(wish.opened===false&&/opened|half a bag/i.test(offer.condition)))return [];
  return [{offer,wish,distance:pair.distance,strength:offer.trust===0&&pair.distance<=0.5?'Great match':'Good match'}];
 }));
}
export function advanceQueue(queue:MatchQueue,event:'passed'|'expired'):MatchQueue{
 if(queue.status!=='offered')return queue;
 const next=queue.index+1;
 return {...queue,index:next,previous:queue.recipients[queue.index]?.name,event,status:next<queue.recipients.length?'offered':'finished'};
}