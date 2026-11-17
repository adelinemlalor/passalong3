import { describe, expect, it } from 'vitest';
import { contacts, circles, selfIndex, visibleWishlist } from '@/lib/passalong/data';
import { initialWishlist } from '@/lib/passalong/matching';

describe('Team profiles', () => {
 it('uses Adeline as the current user with her eight wishes', () => {
  expect(contacts[selfIndex].name).toBe('Demo C');
  expect(contacts[selfIndex].address).toBe('Near campus');
  expect(initialWishlist.map(w=>w.phrase)).toEqual(['dog toys','dog beds','seeds for planting','help jumpstarting car','help moving couch','patio furniture','pots for plants','soccer gear']);
 });
 it('keeps Andrew’s wishlist and South Berkeley membership', () => {
  expect(contacts[0].wishlist).toEqual(['cat toys','puzzles','denim','art (photos or paintings)','records for his record player']);
  expect(contacts[0].circleIds).toEqual(['south-berkeley','ftmba','npd']);
 });
 it('keeps Mary’s wishlist and Marina membership', () => {
  expect(contacts[1].wishlist).toEqual(['dog toys','any home furniture','patio furniture','rugs','art','help moving a couch']);
  expect(contacts[1].circleIds).toEqual(['marina','ftmba','npd']);
 });
 it('keeps Olivia’s wishlist and South Berkeley membership', () => {
  expect(contacts[3].wishlist).toEqual(['lemon squeezer','books','fall/winter jackets','flower vases']);
  expect(contacts[3].circleIds).toEqual(['south-berkeley','ftmba','npd']);
 });
 it('puts all four teammates in New Product Development and Adeline in her four circles', () => {
  expect(contacts.slice(0,4).every(c=>c.circleIds.some(id=>id==='npd'))).toBe(true);
  expect(circles.find(c=>c.id==='npd')?.members).toBe(4);
  expect(contacts[selfIndex].circleIds).toEqual(['soccer','channing','ftmba','npd']);
 });
 it('never exposes another person’s help wishes', () => {
  expect(visibleWishlist(1)).not.toContain('help moving a couch');
  expect(visibleWishlist(1,1)).toContain('help moving a couch');
  expect(visibleWishlist(selfIndex)).toContain('help jumpstarting car');
 });
});