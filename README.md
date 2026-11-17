# Passalong 3

Build a mobile-first web app prototype called "Passalong" — a neighborhood and friends exchange for things too useful to throw away but not valuable enough to sell (finished puzzles, cat toys and treats your pet stopped liking, a beauty product you tried once, outgrown kids' items, extra garden seedlings). People can also offer and request small services (help moving a couch, a jumpstart, watering plants while away).

Core insight: the effort of finding someone who wants a low-value item is bigger than the item's value. The app makes passing something along take under a minute, and it favors people you already trust.

Core values to show in the design: Convenience, Trust & comfort, Gamification.

This is a clickable mock-up only. Use hardcoded dummy data. No backend, no auth, no real AI, no APIs. Every button should navigate somewhere or show a realistic state.

Visual style: warm, friendly, neighborly. Clean, lots of white space, rounded cards, real-looking item photos, one warm accent color. Bottom tab bar navigation.

Screens to build:

1. Onboarding (3 steps): pick your neighborhood (Rockridge, Temescal, Mission, North Berkeley), connect friends (show 5 dummy contacts already on the app), and pick what you'd like to receive (pets, puzzles & games, beauty, kids, garden, food, household, services).

2. Home with a toggle between two ways to browse:
   - Swipe: one item card at a time. Swipe right = "I want it," left = "pass."
   - Scroll: a vertical Instagram-style feed of item cards.
   Every item card shows a trust badge for how you're connected to the giver: "Friend," "Friend of a friend (2 mutuals)," or "Verified neighbor · 0.4 mi."

3. Item detail: photos, condition (e.g. "opened, barely used"), giver profile, trust badge, pickup style (porch pickup / hand-off / I can drop it off), and an "I want this" button that shows "You're #2 in line."

4. Post flow: take photo → title → item or service → category → "Who sees it first?" A tiered list: Friends first → then friends of friends → then neighbors. Show copy explaining that if no one in a tier claims it within 24 hours, it automatically moves down to the next tier.

5. Profile (LinkedIn-style): connections count, mutual friends, vouches from neighbors, items given/received, badges, and a "Good Neighbor" level.

Dummy data: about 15 items and 5 services from Bay Area neighbors with first names. Include examples like a half-used bag of cat treats, a crinkle tunnel cat toy, a finished 1000-piece puzzle, a moisturizer tried once, size 2T winter jacket, tomato seedlings, unopened pantry items before a trip, and "Can help move furniture Saturday."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://passalong3.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/82f64cb0-5740-45d9-a428-e557940a39b0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
