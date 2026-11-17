<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Use a shared React context for all Passalong prototype state; in-memory data keeps the mock-up fully interactive without backend services.
- Keep shareable screens as TanStack leaf routes and reuse the app shell; this preserves deep links and screen-specific metadata.
- Store hardcoded offers and bundled photo imports in a browser-safe data module; this avoids external APIs and makes SSR safe.
- Define visual roles in global semantic CSS tokens; this keeps the friendly design consistent across all screens.
- Centralize Sunday Drop availability in a shared predicate and release flag; discovery, profile lists, and claims must agree while the weekly ritual is simulated without timers or a backend.
- Keep explicit dummy wishlist pairings and queue transitions in a browser-safe matching module, with wishlist and recipient queues in shared context; this synchronizes editable matches and giver/receiver states without real algorithms or timers.
- Recipient queues begin only after confirmation and availability; Sunday-held posts cannot advance or be claimed before release.
- Keep gamification levels, badges, impact and leaderboard data in a browser-safe rewards module, with points and celebrations in shared context; this keeps rewards consistent across screens without a scoring backend.
- Keep themed collections (move bundles, garden and travel posts) in a browser-safe collections module, with bundles, posts and claims in shared context; collection posts are always immediate and never enter the Sunday Drop.
- Keep dummy conversations, hand-off stages and status-dependent quick replies in a browser-safe messages module, with conversations in shared context; completing a hand-off reuses the shared rewards celebration.
- The guided demo is a step list in tour.tsx driven by tourStep in shared context and rendered once in the app shell; it navigates real screens instead of mock copies so the tour never drifts from the app.
- Circles replace neighborhoods: circle data lives in the browser-safe data module, membership/switcher/Nearby flag in shared context; copy must never say "neighborhood".

- Keep prototype team identities, portrait pointers, circle memberships and wishlist phrases in the browser-safe data module; preserve selfIndex for offer ownership and filter help wishes from other people’s profiles.

- Resolve sample giver names and portraits from the canonical contacts data, and keep literal collection item photos in the shared media module; this prevents identity and quick-post photo mismatches.
- Keep camera capture and file selection in a shared photo picker, reading selected photos as in-memory data URLs; this supports posted previews without uploads or short-lived object URLs.
