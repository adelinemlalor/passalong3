import { expect, it } from 'vitest';
import { contacts, offers } from '@/lib/passalong/data';
import { initialBundles, gardenPosts, travelPosts } from '@/lib/passalong/collections';
import { initialConversations } from '@/lib/passalong/messages';
import { neighborBoard } from '@/lib/passalong/rewards';
import { travelPhotos } from '@/lib/passalong/media';
it('keeps named givers and conversation portraits tied to their profiles',()=>{
 for(const entry of [...initialBundles,...gardenPosts,...travelPosts]){
  const person=contacts.find(p=>p.name===entry.giver);
  expect(person).toBeDefined();expect(entry.photo).toBe(person?.photo);
 }
 for(const chat of initialConversations)expect(chat.photo).toBe(contacts.find(p=>p.name===chat.name)?.photo);
 for(const row of neighborBoard)expect(row.name).toBe(contacts[row.photo]?.name);
});
it('shows the actual helper rather than another person on service cards',()=>{
 for(const offer of offers.filter(o=>o.service))expect(offer.image).toBe(contacts[offer.giver]?.photo);
 for(const post of [...gardenPosts,...travelPosts].filter(p=>p.service))expect(post.image).toBe(post.photo);
});
it('uses literal food photographs for travel quick posts',()=>{
 expect(travelPosts.find(p=>p.id==='t1')?.image).toBe(travelPhotos['Milk']);
 expect(travelPosts.find(p=>p.id==='t2')?.image).toBe(travelPhotos['Eggs']);
 expect(travelPosts.find(p=>p.id==='t3')?.image).toBe(travelPhotos['Produce']);
 expect(travelPhotos['Milk']).not.toBe(travelPhotos['Produce']);
});
