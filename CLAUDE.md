# CLAUDE.md

Operating notes for Claude working in this repository. `README.md` explains the
product and the design decisions; this file explains how to work on it without
breaking things. Read this first, then the part of `README.md` your task touches.

## What this is

Hoople — a clickable UI prototype of an Indonesian community-experience platform,
built for stakeholder review. Live at https://hoople-event.vercel.app/.

**Three surfaces, one codebase, one design system:**

| Surface | Route | Who |
| --- | --- | --- |
| Hoople | `/home` | Participants — discover and book |
| Hoople for Organizers | `/organizer` | Studios and communities selling to the public |
| Hoople for Teams | `/teams` | A company running events for its own staff |

`/` is a chooser between the three, not a landing page. The plan is to split
these into three separate websites, so **do not introduce coupling between
them** — see [Section boundaries](#section-boundaries).

## The one hard constraint

**The rendered design must not change** unless the user explicitly asks for a
visual change. This repo went through a full CSS → Tailwind migration under
that exact constraint, and it holds for everything after it.

If a change could move a pixel, prove it did not. `README.md` §"Proving the
design did not move" documents the screenshot-diff approach used during the
migration. At minimum: run `npm run dev`, look at the affected pages before and
after, and say plainly in your report what you compared.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173, opens automatically
npm run build      # tsc -b, then vite build → dist/
npm run typecheck  # tsc --noEmit
npm run preview    # serve the production build
npm run dto:verify # check dto/ for cross-section contract conflicts
```

There is **no test suite and no linter configured**. `npm run typecheck` is the
only automated gate for code — run it before reporting a code change as done.
`npm run dto:verify` is the gate for the API contract; run it after any change
under `dto/`, since it exits non-zero on a violation. Do not add a test
framework or linter unless asked.

## Layout

```
src/
  main.tsx          entry — mounts App, imports styles/index.css
  App.tsx           every route; the two consoles are React.lazy chunks
  pages/            participant pages at top level, organizer/ and teams/ nested
  components/
    ui/             shared across all three surfaces — the only shared components
    layout/         participant chrome (nav, footer, BookBar, RequireAuth)
    cards/          shared cards
    organizer/      console-only, incl. the two builders
    teams/          console-only
  data/             seeded fixtures + derivation helpers (TypeScript, not JSON)
  store/            React context + localStorage (session, bookings, saved, experiences)
  lib/              format, motion, artwork, clipboard, title, returnTo
  styles/           16 stylesheets, all entered through index.css
dto/                the API contract handed to the backend team — see dto/README.md
scripts/            brand-assets.mjs (favicon/og images), dto-verify.mjs
```

Import alias: `@/` → `src/` (defined in `vite.config.ts`).

Deployment is Vercel, config in `vercel.json`; all routes rewrite to
`index.html` because the router is client-side.

## Section boundaries

The three surfaces are meant to become three websites. Today that boundary is
respected and **must stay respected**:

- `pages/organizer` + `components/organizer` import only from their own folder,
  `components/ui`, `lib`, `data/builder`, `data/eventBuilder`, `data/organizer`,
  and `store/experiences`.
- `pages/teams` + `components/teams` import only from their own folder,
  `components/ui`, `lib`, and `data/teams`.
- Neither console imports the other. Participant pages import neither console.

Before adding an import that crosses those lines, stop and reconsider — the
shared surface is `components/ui`, `lib`, and `store` only. If something must be
shared, put it there rather than reaching sideways.

## Styling: Tailwind v4

`README.md` §Tailwind is the full account. The parts that bite:

**`src/styles/index.css` is the only entry.** It declares the layer order, then
imports Tailwind and all 14 project stylesheets into a single `components` layer.

- **Preflight is deliberately not imported.** `tailwindcss/theme.css` and
  `tailwindcss/utilities.css` are imported separately instead. Importing
  `tailwindcss` wholesale would load the reset and flatten every `h1`–`h4`.
- **All project CSS lives in one layer** so its internal cascade — source order,
  specificity, the few `!important` rules — is untouched. Do not split it.
- Tokens live in `tokens.css` as `@theme`. The namespace (`--color-*`,
  `--radius-*`, `--shadow-*`, `--spacing-*`, …) is what makes Tailwind generate
  a utility from a token, so the prefix matters.

### Traps that have already cost time here

1. **Breakpoints.** Tailwind's `max-[900px]:` means `width < 900`; the project's
   CSS means `max-width: 900px`, which *includes* 900. They are off by one pixel.
   Use the `@custom-variant to-N` variants declared in `index.css`
   (`to-900:`, `to-560:`, …) — never bare `max-[Npx]:`.
2. **Utility names that collide with project selectors.** Tailwind's own
   `container` utility silently widened every page from 1360px to 1536px because
   it sits in a later layer than `.container`. Before using a utility, check that
   the project's CSS does not select on a class of that name — including
   `[class*=…]` substring selectors.
3. **A misspelled utility fails silently.** `bordert-line-faint` compiles fine
   and styles nothing. If you add utilities in bulk, assert they actually exist
   in the built CSS.
4. **Numeric border widths are whole pixels.** `border-1.5` does not exist; use
   `border-[1.5px]`.
5. **Classes assembled at runtime** (`` `org-pill--${kind.toLowerCase()}` ``)
   are invisible to Tailwind's scanner and to any find-and-replace. Never
   rewrite a class you cannot see whole in the source.

## Data and state

Fixtures live in `src/data/*.ts` as typed TypeScript, not JSON, and sessions are
**derived** from a schedule rather than hard-coded — see `README.md`
§"Sessions are derived, not hard-coded". Console counts are derived too; do not
hard-code a number that can be computed from the fixtures.

State is React context plus `localStorage` (`src/store/`). Nothing is verified
server-side — this is a prototype, and `README.md` §"Prototype boundaries" says
exactly which guarantees are absent. Do not describe it as production-ready.

## The API contract (`dto/`)

`dto/` is the handover document for the backend team, written in Indonesian.
`dto/README.md` is authoritative — read it before touching anything in there.

Structure mirrors the planned three-website split:

```
dto/
  shared/       common/ (envelope, pagination, enums, errors), auth/, media/
  participant/  catalog/ bookings/ saved/ payments/ content/
  organizer/
  teams/
```

`shared/` exists because auth, media upload, the error envelope and the enum
registry are needed by all three sites. Duplicating them per section is what
would *cause* drift, not prevent it.

Conventions, in brief — the full list is in `dto/README.md` §1:

- Envelope `{ success, message, data, meta }` on every response; errors add `error`.
- `meta` carries pagination and is `null` otherwise.
- camelCase fields, UUID v4 `id`, separate `slug`, ISO 8601 with `+07:00` offset.
- Money is `{ amount, currency }` in responses, a plain integer in requests.
- Enums are lowercase snake_case; labels belong to the frontend, not the API.
- `roles` is an **array** — one account can be participant, organizer and
  teams_admin at once. Guards must use `roles.includes(...)`, never `===`.

**Rules that keep the three sections from conflicting** — these were established
by audit and are easy to break by accident:

- One organisation = one UUID, whether it appears as `community.id`, `host.id`,
  or `workspace.id`.
- One account = one UUID and one `roles` array, the same in every section.
- If the organizer console owns an experience, the public catalog must show that
  same workspace as its `host`.
- A field name may not carry two different types. `host` is always an object,
  never a bare string. `stats` is always an object of counters; the dashboard's
  card array is `statCards`. Checkout's breakdown is `priceBreakdown`, because
  `pricing` already means the builder's pricing step and `price` already means a
  money object.
- Teams uses `workEmail` for the corporate address; `email` always means the
  Hoople account address.

A Bruno collection generated from these files lives in a **separate repository**:
`https://github.com/aziziabduls/hoople_events_collection_api.git`. It is Bruno
**OpenCollection YAML** (`opencollection.yml`, `folder.yml`, `*.yml`) — *not*
`.bru`. It is derived from `dto/`, so when `dto/` changes the collection needs
regenerating, and it is shared with the backend team — fetch before pushing.

## Where things stand

State at handover (the repo moved to a new machine and a team setup around
2026-08-19). Anything below that is already resolved can be deleted from this
file — it is a snapshot, not a permanent record.

**Done and verified**

- The CSS → Tailwind v4 migration, complete, with the design proven unchanged.
- The activity builder trim: Hosting As, Tags and Age Requirements removed;
  the effective period gained a calendar with a "repeat every week" mode
  (`src/components/organizer/ScheduleCalendar.tsx`); Instructor is no longer
  mandatory.
- `dto/` split into the three sections plus `shared/`, with 10 cross-section
  conflicts found by audit and fixed (findings 9–18 in `dto/README.md` §6).
  `npm run dto:verify` passes on all 95 files.

**Open — do not assume these are finished**

1. **The Bruno collection is out of sync with `dto/`.** It still uses the old
   flat folders and the old field names (`price` for the checkout breakdown,
   `stats` for the dashboard card array, `email` for corporate addresses). It
   needs regenerating from the current `dto/`. The user plans to do this and
   has not asked for help yet — ask before starting.
2. **48 files under `src/` carry an uncommitted change that predates this
   handover**: 183 em-dashes (`—`) replaced with plain hyphens (`-`), including
   in user-visible strings such as the browser tab titles in `src/lib/title.ts`.
   Every other non-ASCII character survived, so this was a deliberate
   find-and-replace rather than a broken copy. The user has been told and has
   not decided whether to keep it. **Do not "fix" or revert it unprompted.**
3. **The event builder has two orphaned fields.** `audience` and `language` in
   `src/data/eventBuilder.ts` are seeded from `AUDIENCES[0]` / `EVENT_LANGUAGES[0]`
   and rendered by `EventPreview`'s "Who should join" block, but no control
   anywhere sets them — so the preview always shows the seed. Either give them
   inputs or drop them from the preview. (The *activity* builder's `language` is
   fine: `StepDetails` still edits it.)
4. **Step 4 of the activity builder is still titled "Host & Experience"** even
   though its host panel was removed. The name no longer describes it.

## Working style

- **Reply in Indonesian.** The user writes in Indonesian; the DTO docs are in
  Indonesian. Source comments and `README.md` are in English — keep them that way.
- **Do not commit or push unless asked.** The user reviews first. Offer a commit
  message; let them run it.
- Commit messages in this repo are sentence-case statements of intent, not
  conventional-commit prefixes: "Make the charts answerable, and clear every
  clipped label".
- Prose in code comments explains *why*, not what. Match the surrounding density
  — this codebase comments deliberately and sparingly.
- When you verify something, say what you actually ran. When you skip something,
  say you skipped it.
