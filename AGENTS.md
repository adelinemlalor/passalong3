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
- Keep real member data in Lovable Cloud and use authenticated server functions plus RLS; browser state is never an authority for access or claims.
- Use the `_authenticated` layout for private screens and one top-level leaf per public invite/item preview; this preserves safe deep links and metadata.
- Use database transactional actions and row locks for claims and hand-off transitions; this prevents races and privilege escalation.
- Keep user roles separate from profiles, with no client role writes; profile edits must never grant privileges.
- Keep word matching and match lifecycle in PostgreSQL with browser-safe reference rules and tests; no external model or dummy pairing drives the live app.
- Use a single root auth subscriber, query cache teardown on sign-out, and scoped live query keys; this prevents stale protected screens.
- Keep deferred prototype modules behind off-by-default feature flags and do not mount their state provider in the live app; this preserves the original work without exposing sample records.
- Use private photo storage and signed links; public signing is authorized by a narrow safe-preview RPC, never an arbitrary client-supplied path.
- Keep global visual roles in semantic CSS tokens and reuse the Button component; this preserves theming and the familiar visual style.
- Keep expiration, reminders and quiet-hour match delivery in one authenticated hourly job, while claim checks enforce exact deadlines transactionally; this bounds scheduled work.
- Keep analytics columns limited to event type, actor, item, circle and timestamp; this makes private text impossible to attach to an event.
