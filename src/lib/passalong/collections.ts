import { contacts } from './data';
import { movingPhotos, gardenPhotos, travelPhotos } from './media';
// Browser-safe dummy data for themed life-event collections. No backend, no timers.
import { inDays } from './drop';
import movingCover from '@/assets/col-moving.jpg';
import gardenCover from '@/assets/col-garden.jpg';
import travelCover from '@/assets/col-travel.jpg';
import seedlings from '@/assets/item-5.jpg';
import pantry from '@/assets/item-6.jpg';
import plant from '@/assets/item-8.jpg';
import mugs from '@/assets/more-0.jpg';
import blanket from '@/assets/more-1.jpg';
import bike from '@/assets/more-2.jpg';
import jars from '@/assets/more-3.jpg';
import lamp from '@/assets/more-4.jpg';
import books from '@/assets/item-7.jpg';

export type CollectionId = 'moving' | 'garden' | 'travel';
export const collections: { id: CollectionId; title: string; header: string; blurb: string; image: string; count: number }[] = [
  { id: 'moving', title: 'Moving Out', header: 'Moving? Pass it all along in one go.', blurb: 'Whole-home bundles, one pickup', image: movingCover, count: 14 },
  { id: 'garden', title: 'Garden Swap', header: 'Extra seedlings, cuttings, and harvests from your circles.', blurb: 'Seedlings, cuttings & harvests', image: gardenCover, count: 10 },
  { id: 'travel', title: 'Before You Travel', header: 'Leaving town? Don’t let good food go to waste.', blurb: 'Fresh food, picked up today', image: travelCover, count: 8 },
];

export const moveTags = ['Furniture', 'Kitchen', 'Decor', 'Cleaning supplies', 'Pantry'] as const;
export type BundleItem = { id: string; title: string; tag: string; image: string };
export type MoveBundle = { id: string; giver: string; photo: string; trust: number; moveDate: string; pickup: string; circle: string; distance: string; items: BundleItem[] };

const priyaItems: [string, string, string][] = [
  ['Little desk lamp', 'Decor', lamp], ['Set of 4 ceramic mugs', 'Kitchen', mugs], ['Picnic blanket', 'Decor', blanket],
  ['Glass storage jars (6)', 'Kitchen', gardenPhotos[6] ?? jars], ['Wooden balance bike', 'Furniture', bike], ['Shelf of paperbacks', 'Decor', books],
  ['Pothos in a pot', 'Decor', plant], ['Opened pantry staples', 'Pantry', pantry], ['Rice, lentils & oats', 'Pantry', gardenPhotos[7] ?? jars],
  ['Bistro chair', 'Furniture', movingPhotos[0] ?? lamp], ['Mop, bucket & sprays', 'Cleaning supplies', movingPhotos[1] ?? jars], ['Dish rack & drying mat', 'Kitchen', movingPhotos[2] ?? mugs],
  ['Linen curtains', 'Decor', movingPhotos[3] ?? blanket], ['Spice rack, half full', 'Pantry', movingPhotos[8] ?? pantry], ['Small side table', 'Furniture', movingPhotos[4] ?? books],
  ['Vacuum, works great', 'Cleaning supplies', movingPhotos[5] ?? lamp], ['Cast iron skillet', 'Kitchen', movingPhotos[6] ?? mugs], ['Framed prints (3)', 'Decor', movingPhotos[7] ?? books],
];
export const initialBundles: MoveBundle[] = [
  { id: 'priya', giver: contacts[1].name, photo: contacts[1].photo, trust: 1, moveDate: inDays(5), pickup: 'Pickup within 5 days', circle: 'New Product Development', distance: '0.3 mi', items: priyaItems.map(([title, tag, image], i) => ({ id: `priya-${i}`, title, tag, image })) },
];

export type CollectionPost = { id: string; collection: CollectionId; title: string; giver: string; photo: string; image: string; trust: number; distance: string; sub?: string; fresh?: string; service?: boolean; request?: boolean; pickupBy?: string; hoursLeft?: number };

export const gardenSubs = ['Seedlings', 'Cuttings', 'Seeds', 'Produce', 'Tools', 'A helping hand'] as const;
export const gardenPosts: CollectionPost[] = [
  { id: 'g1', collection: 'garden', title: 'Six tomato seedlings', giver: contacts[2].name, photo: contacts[2].photo, image: seedlings, trust: 0, distance: '0.2 mi', sub: 'Seedlings', fresh: 'Ready to transplant' },
  { id: 'g2', collection: 'garden', title: 'Rooted pothos cuttings', giver: contacts[3].name, photo: contacts[3].photo, image: gardenPhotos[8] ?? plant, trust: 1, distance: '0.5 mi', sub: 'Cuttings', fresh: 'Rooted this week' },
  { id: 'g3', collection: 'garden', title: 'Meyer lemons, a big bag', giver: contacts[0].name, photo: contacts[0].photo, image: gardenPhotos[0] ?? plant, trust: 0, distance: '0.4 mi', sub: 'Produce', fresh: 'Picked today' },
  { id: 'g4', collection: 'garden', title: 'Saved heirloom bean seeds', giver: contacts[0].name, photo: contacts[0].photo, image: gardenPhotos[1] ?? jars, trust: 2, distance: '0.9 mi', sub: 'Seeds' },
  { id: 'g5', collection: 'garden', title: 'Zucchini — too many again', giver: contacts[4].name, photo: contacts[4].photo, image: gardenPhotos[2] ?? pantry, trust: 1, distance: '0.6 mi', sub: 'Produce', fresh: 'Picked today' },
  { id: 'g6', collection: 'garden', title: 'Basil & kale starts', giver: contacts[1].name, photo: contacts[1].photo, image: gardenPhotos[3] ?? seedlings, trust: 1, distance: '0.3 mi', sub: 'Seedlings', fresh: 'Ready to transplant' },
  { id: 'g7', collection: 'garden', title: 'Spare trowel & hand rake', giver: contacts[0].name, photo: contacts[0].photo, image: gardenPhotos[4] ?? lamp, trust: 0, distance: '0.4 mi', sub: 'Tools' },
  { id: 'g8', collection: 'garden', title: 'Succulent cuttings in jars', giver: contacts[2].name, photo: contacts[2].photo, image: gardenPhotos[5] ?? plant, trust: 2, distance: '0.8 mi', sub: 'Cuttings' },
  { id: 'g9', collection: 'garden', title: 'Can water your garden while you’re away', giver: contacts[3].name, photo: contacts[3].photo, image: contacts[3].photo, trust: 1, distance: '0.5 mi', sub: 'A helping hand', service: true },
  { id: 'g10', collection: 'garden', title: 'Can help prune fruit trees', giver: contacts[0].name, photo: contacts[0].photo, image: contacts[0].photo, trust: 2, distance: '0.9 mi', sub: 'A helping hand', service: true },
];

export const travelChecklist = ['Milk', 'Eggs', 'Produce', 'Bread', 'Leftovers', 'Opened pantry items'] as const;
export const travelPosts: CollectionPost[] = [
  { id: 't1', collection: 'travel', title: 'Half gallon of milk, opened today', giver: contacts[0].name, photo: contacts[0].photo, image: travelPhotos['Milk'] ?? pantry, trust: 0, distance: '0.3 mi', pickupBy: '2pm today', hoursLeft: 2 },
  { id: 't2', collection: 'travel', title: 'Dozen eggs + butter', giver: contacts[3].name, photo: contacts[3].photo, image: travelPhotos['Eggs'] ?? jars, trust: 1, distance: '0.5 mi', pickupBy: '4pm today', hoursLeft: 4 },
  { id: 't3', collection: 'travel', title: 'Fresh produce drawer: greens, peppers, carrots', giver: contacts[2].name, photo: contacts[2].photo, image: travelPhotos['Produce'] ?? seedlings, trust: 0, distance: '0.2 mi', pickupBy: '6pm today', hoursLeft: 6 },
  { id: 't4', collection: 'travel', title: 'Sourdough loaf, baked yesterday', giver: contacts[4].name, photo: contacts[4].photo, image: travelPhotos['Bread'] ?? pantry, trust: 1, distance: '0.7 mi', pickupBy: '8pm today', hoursLeft: 8 },
  { id: 't5', collection: 'travel', title: 'Opened pantry: pasta, rice, oats', giver: contacts[0].name, photo: contacts[0].photo, image: travelPhotos['Opened pantry items'] ?? jars, trust: 2, distance: '1.1 mi', pickupBy: '9am tomorrow', hoursLeft: 21 },
  { id: 't6', collection: 'travel', title: 'Leftover lasagna, feeds 4', giver: contacts[1].name, photo: contacts[1].photo, image: travelPhotos['Leftovers'] ?? pantry, trust: 1, distance: '0.3 mi', pickupBy: '7pm today', hoursLeft: 7 },
  { id: 't7', collection: 'travel', title: 'Happy to grab your packages this week', giver: contacts[0].name, photo: contacts[0].photo, image: contacts[0].photo, trust: 0, distance: '0.3 mi', service: true, pickupBy: 'Starting tomorrow', hoursLeft: 24 },
  { id: 't8', collection: 'travel', title: `Can water your plants ${inDays(2)}–${inDays(9)}`, giver: contacts[3].name, photo: contacts[3].photo, image: contacts[3].photo, trust: 1, distance: '0.5 mi', service: true, pickupBy: `Starts ${inDays(2)}`, hoursLeft: 120 },
];

export const moveHelpTitle = 'Need 2 people to help load a truck Saturday';
