import { contacts } from './data';
// Browser-safe dummy conversations for the hand-off messages flow. No real messaging.
import tunnel from '@/assets/item-0.jpg';
import treats from '@/assets/item-1.jpg';
import puzzle from '@/assets/item-2.jpg';
import beauty from '@/assets/item-3.jpg';
import jacket from '@/assets/item-4.jpg';
import seedlings from '@/assets/item-5.jpg';
import lamp from '@/assets/more-4.jpg';

export type Msg = { id: string; from: 'me' | 'them'; text: string; kind?: 'text' | 'slots' | 'spot' | 'note'; slots?: string[]; picked?: string };
export type Kind = 'giving' | 'receiving' | 'service';
export type Conversation = {
  id: string; name: string; photo: string; trust: number; via?: string;
  kind: Kind; bundle?: boolean; item: string; image: string; pickup: string; spot: string;
  stage: 0 | 1 | 2 | 3; waitingOnYou: boolean; pickupToday?: boolean; blocked?: boolean; thanks?: string; messages: Msg[];
};
export const stages = ['Claimed', 'Pickup arranged', 'Picked up', 'Thanked'] as const;

let n = 0; const m = (from: Msg['from'], text: string, extra: Partial<Msg> = {}): Msg => ({ id: `m${++n}`, from, text, ...extra });

export const initialConversations: Conversation[] = [
  { id: 'sam', name: contacts[0].name, photo: contacts[0].photo, trust: 0, kind: 'receiving', item: 'Crinkle tunnel cat toy', image: tunnel, pickup: 'Porch pickup · 0.2 mi', spot: 'Porch on 61st St, The Ashby building', stage: 1, waitingOnYou: false, pickupToday: true,
    messages: [m('me', 'Hi Andrew! I claimed the crinkle tunnel 🙂'), m('them', 'Yay! Left it on my porch 📦'), m('them', 'Porch on 61st St, The Ashby building · exact address shared after claim', { kind: 'spot' })] },
  { id: 'maya', name: contacts[1].name, photo: contacts[1].photo, trust: 0, kind: 'giving', item: '1000-piece puzzle', image: puzzle, pickup: 'Hand-off · your place', spot: 'Front steps on Lawton Ave, The Ashby building', stage: 0, waitingOnYou: true,
    messages: [m('them', 'Hi! I claimed your puzzle — so excited.'), m('them', 'When can I grab it?')] },
  { id: 'jordan', name: contacts[0].name, photo: contacts[0].photo, trust: 1, via: 'Mary and Olivia', kind: 'service', item: 'Help moving a couch · Sat 10am', image: contacts[0].photo, pickup: 'Sat 10am · 0.9 mi', spot: 'Building lobby on Shafter Ave, The Ashby building', stage: 0, waitingOnYou: true,
    messages: [m('them', 'Hey! Saw you might be up for helping move a couch Saturday?'), m('them', 'It’s a 3-seater, second floor, no elevator 😅')] },
  { id: 'priya', name: contacts[1].name, photo: contacts[1].photo, trust: 1, via: 'Adeline and Andrew', kind: 'receiving', bundle: true, item: 'Little desk lamp · from Mary’s move', image: lamp, pickup: 'Pickup within 5 days', spot: 'Garage on Broadway Terrace, The Ashby building', stage: 0, waitingOnYou: false,
    messages: [m('me', 'Claimed the desk lamp from your move bundle!'), m('them', 'Perfect — I’ll set it aside with your name on it.')] },
  { id: 'marcus', name: contacts[3].name, photo: contacts[3].photo, trust: 0, kind: 'giving', item: 'Tomato seedlings', image: seedlings, pickup: 'Porch pickup', spot: 'Porch on 61st St, The Ashby building', stage: 3, waitingOnYou: false, thanks: 'Planted all six this morning. Thank you, Adeline! 🍅',
    messages: [m('them', 'Grabbing the seedlings at 5!'), m('me', 'Grab it anytime today'), m('them', 'Got it, thank you!'), m('them', 'Planted all six this morning. Thank you, Adeline! 🍅', { kind: 'note' })] },
  { id: 'sophie', name: contacts[3].name, photo: contacts[3].photo, trust: 1, via: 'Adeline and Mary', kind: 'receiving', item: 'Half-used bag of cat treats', image: treats, pickup: 'Can drop it off', spot: 'Mailbox on College Ave, The Ashby building', stage: 2, waitingOnYou: true,
    messages: [m('them', 'Dropped them in your mailbox!'), m('me', 'Got them — thank you!')] },
  { id: 'alex', name: contacts[4].name, photo: contacts[4].photo, trust: 2, via: 'Andrew and Mary', kind: 'giving', item: 'Moisturizer, tried once', image: beauty, pickup: 'Hand-off', spot: 'Café corner at Claremont & College', stage: 1, waitingOnYou: false,
    messages: [m('them', 'Could we meet tomorrow?'), m('me', 'Pick a time that works:', { kind: 'slots', slots: ['Tomorrow 9am', 'Tomorrow 12:30pm', 'Tomorrow 6pm'] }), m('them', 'Tomorrow 6pm works!')] },
  { id: 'lena', name: contacts[1].name, photo: contacts[1].photo, trust: 2, via: 'Olivia and Alex', kind: 'giving', item: 'Size 2T winter jacket', image: jacket, pickup: 'Porch pickup', spot: 'Porch on 61st St, The Ashby building', stage: 3, waitingOnYou: false, thanks: 'Fits perfectly — my little one loves it.',
    messages: [m('them', 'Got it, thank you!'), m('them', 'Fits perfectly — my little one loves it.', { kind: 'note' })] },
];

export function statusChip(c: Conversation): 'Done' | 'Waiting on you' | 'Pickup today' | 'Claimed' {
  if (c.stage === 3) return 'Done';
  if (c.waitingOnYou) return 'Waiting on you';
  if (c.pickupToday || c.stage === 1) return 'Pickup today';
  return 'Claimed';
}

export function quickReplies(c: Conversation): string[] {
  if (c.kind === 'service') return c.stage === 0 ? ['I can help!', 'What time works?', 'How long will it take?'] : ['On my way!', 'Running 5 min late', 'All done — happy to help!'];
  if (c.stage >= 2) return ['Got it, thank you!', 'My cats love it already 🐱'];
  if (c.kind === 'giving') return ['Left it on my porch 📦', 'Grab it anytime today', 'Can you come by 6?'];
  return ['When can I grab it?', 'Porch pickup works for me', 'Can you drop it off?'];
}

export const timeSlots = ['Today 5pm', 'Today 7pm', 'Tomorrow 9am', 'Tomorrow 12:30pm', 'Sat 10am'];
