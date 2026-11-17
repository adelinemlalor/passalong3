import { PawPrint, Puzzle, Sparkles, Baby, Sprout, ShoppingBasket, House, HandHeart, type LucideIcon } from 'lucide-react';
import tunnel from '@/assets/item-0.jpg';
import treats from '@/assets/item-1.jpg';
import puzzle from '@/assets/item-2.jpg';
import beauty from '@/assets/item-3.jpg';
import jacket from '@/assets/item-4.jpg';
import seedlings from '@/assets/item-5.jpg';
import pantry from '@/assets/item-6.jpg';
import books from '@/assets/item-7.jpg';
import plant from '@/assets/item-8.jpg';
import mugs from '@/assets/more-0.jpg';
import blanket from '@/assets/more-1.jpg';
import bike from '@/assets/more-2.jpg';
import jars from '@/assets/more-3.jpg';
import lamp from '@/assets/more-4.jpg';
import yarn from '@/assets/more-5.jpg';
import marcus from '@/assets/more-7.jpg';
import adelinePhoto from '@/assets/Adeline_Lalor.jpeg.asset.json';
import andrewPhoto from '@/assets/Andrew_Fullerton.jpeg.asset.json';
import maryPhoto from '@/assets/Mary_Borden.jpeg.asset.json';
import oliviaPhoto from '@/assets/Olivia_Chandler.jpeg.asset.json';
export const selfIndex = 2;
export const teamIndices = [2, 0, 1, 3];
export const contacts = [
 {name:'Andrew',last:'Fullerton',photo:andrewPhoto.url,mutuals:3,location:'South Berkeley',bio:'Cat person, puzzle finisher, and always hunting for a great record. Happy to give useful things another spin.',circleIds:['south-berkeley','ftmba','npd'],wishlist:['cat toys','puzzles','denim','art (photos or paintings)','records for his record player']},
 {name:'Mary',last:'Borden',photo:maryPhoto.url,mutuals:3,location:'San Francisco · near the Marina',bio:'Making a cozy home, one secondhand find at a time. Dog walks, good art, and lending a hand are my kind of weekend.',circleIds:['marina','ftmba','npd'],wishlist:['dog toys','any home furniture','patio furniture','rugs','art','help moving a couch']},
 {name:'Adeline',last:'Lalor',photo:adelinePhoto.url,mutuals:3,location:'Channing Way · Berkeley',address:'1501 Channing Way, Berkeley, CA 94703',bio:'Dog lover, soccer teammate, and growing a little green wherever I can. Always happy to pass something useful along.',circleIds:['soccer','channing','ftmba','npd'],wishlist:['dog toys','dog beds','seeds for planting','help jumpstarting car','help moving couch','patio furniture','pots for plants','soccer gear']},
 {name:'Olivia',last:'Chandler',photo:oliviaPhoto.url,mutuals:3,location:'South Berkeley',bio:'A good book, fresh flowers, and a cozy jacket make my day. Love finding new homes for the things I no longer use.',circleIds:['south-berkeley','ftmba','npd'],wishlist:['lemon squeezer','books','fall/winter jackets','flower vases']},
 {name:'Alex',last:'Rivera',photo:marcus,mutuals:1,location:'Berkeley',bio:'A little less clutter, a little more connection. Happy to share with my circles.',circleIds:['channing'],wishlist:['household essentials']},
] as const;
export function visibleWishlist(index:number,viewerIndex:number=selfIndex):readonly string[]{const person=contacts[index];if(!person)return [];return index===viewerIndex?person.wishlist:person.wishlist.filter(phrase=>!/^help\b/i.test(phrase));}
export const categories: [string,string][] = [ ['Pets','🐾'], ['Puzzles & games','🧩'], ['Beauty','🧴'], ['Kids','🧸'], ['Garden','🌱'], ['Food','🥫'], ['Household','🏡'], ['Services','🤝'] ];
export type Circle = {id:string; name:string; kind:string; members:number};
export const circles: Circle[] = [
 {id:'soccer', name:'soccer crew', kind:'Friend group', members:16},
 {id:'channing', name:'Channing Way', kind:'Street', members:28},
 {id:'ftmba', name:'FTMBA 2027', kind:'Class', members:72},
 {id:'npd', name:'New Product Development', kind:'Class', members:4},
 {id:'south-berkeley', name:'South Berkeley', kind:'Local group', members:41},
 {id:'marina', name:'the Marina', kind:'Local group', members:23},
];
export type Offer = {id:string; title:string; category:string; image:string; giver:number; trust:number; condition:string; pickup:string; description:string; time:string; circle?:number; service?:boolean; request?:boolean; drop?:boolean; held?:boolean; lineCount?:number};
const rows: Array<[string,string,string,string]> = [
 ['Crinkle tunnel, one picky cat','Pets',tunnel,'Barely used'], ['Tomato seedlings, ready to grow','Garden',seedlings,'Healthy & homegrown'], ['A puzzle ready for its next chapter','Puzzles & games',puzzle,'All 1,000 pieces included'], ['Cat treats (the verdict was no)','Pets',treats,'Opened, half a bag left'], ['Moisturizer, tried just once','Beauty',beauty,'Opened, barely used'], ['A cozy winter jacket · size 2T','Kids',jacket,'Gently worn'], ['Pantry extras before our trip','Food',pantry,'Unopened, in date'], ['A little stack of bedtime stories','Kids',books,'Well loved, good condition'], ['A pothos for your sunny corner','Garden',plant,'Happy & healthy'], ['Four mugs looking for a home','Household',mugs,'Good condition'], ['Picnic blanket for park days','Household',blanket,'Freshly washed'], ['Outgrown wooden balance bike','Kids',bike,'A few happy scuffs'], ['Three handy storage jars','Household',jars,'Clean, like new'], ['Little desk lamp','Household',lamp,'Works perfectly'], ['Leftover yarn, lots of possibility','Household',yarn,'Unused yarn'],
];
export const offers:Offer[] = rows.map(([title,category,image,condition],i)=>({id:String(i+1),title,category,image,condition,giver:i%5,trust:i%3,circle:i%3,pickup:['Porch pickup','Hand-off','I can drop it off'][i%3] ?? 'Porch pickup',time:['20 min ago','35 min ago','1 hour ago','2 hours ago'][i%4] ?? 'Just now',description:i===0?"Our cat decided the cardboard box was more exciting. This little crinkle tunnel deserves a cat who appreciates it! Clean, folds flat, and comes with the orange ball.":i===1?"I grew a few too many this spring! Six happy tomato seedlings, ready for a bigger pot or your garden. Would love to see them find a sunny new home.":'Too useful to sit around unused. Hoping someone in the circle can give this a happy second life. Happy to coordinate a convenient pickup.'}));
// Offers, not asks: service cards are always offers of help, never requests.
const services = [ 'Can help move furniture Saturday', 'Happy to water your plants', 'An extra hand assembling a shelf' ];
services.forEach((title,i)=> offers.push({id:String(16+i),title:String(title),category:'Services',image:contacts[i]?.photo ?? contacts[selfIndex].photo,giver:i%5,trust:i%3,circle:i%3,condition:'A little help from your circle',pickup:'Let’s coordinate',description:'I have a little spare time and would love to lend a hand to someone in the circle. Send a note and we can work out the details.',time:'2 hours ago',service:true}));
export function trustLabel(trust:number){return ['Friend','Friend of a friend (2 mutuals)','In your circle · New Product Development'][trust] ?? 'Friend';}
export function pageHead(title:string,description:string){return {meta:[{title:`${title} — Passalong`},{name:'description',content:description},{property:'og:title',content:`${title} — Passalong`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}

export const categoryIcons: Record<string,LucideIcon> = {'Pets':PawPrint,'Puzzles & games':Puzzle,'Beauty':Sparkles,'Kids':Baby,'Garden':Sprout,'Food':ShoppingBasket,'Household':House,'Services':HandHeart};
