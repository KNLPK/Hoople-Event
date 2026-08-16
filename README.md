# Hoople

All-in-one experience platform for communities in Indonesia.
_Experiences that connect communities, that grow._

This repository is a **clickable UI prototype for stakeholder review**. Every
button works and the whole booking loop holds together, but authentication and
payment are deliberately not verified — see [Prototype
boundaries](#prototype-boundaries).

**Live:** https://hoople-event.vercel.app/

Hoople is **three surfaces against one platform**, all served from that one
link. Opening it lands on a chooser rather than any one of them:

- **Hoople** (`/home`) — the participant site. Discover and book experiences.
- **Hoople for Organizers** (`/organizer`) — communities and studios selling to
  the public: listings, ticket sales, the door, payouts.
- **Hoople for Teams** (`/teams`) — a company running events for its own staff:
  the kick-off, the town hall, onboarding, Friday padel. Members only, never
  published.

They share a design system and nothing else — different navigation, different
data, different rules about who may see what. Which one you want is the first
question the product asks, at `/`; it is not a link buried in a footer.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preview` | Serve the production build |

**Stack:** React 18 · TypeScript (strict) · Vite · React Router 6. No UI
framework — the design system is hand-built CSS driven by tokens.

## The flow to demo

```
Activities → Book session → Activity Detail → Book this session
   → Booking (step 1) → payment modal → Payment Successful
   → View My Bookings → View E-Ticket
```

Also wired: nav **My Tickets** → My Bookings, **Log in** → Authentication,
Authentication **Login** → Activities. Every nav and footer link resolves to a
real page — there are no `href="#"` dead ends.

## Routes

| Path | Page |
| --- | --- |
| `/` | The front door — choose participant, organizer or teams |
| `/home` | Landing |
| `/discover` | Discover — search, filters, stacked recommendation rails |
| `/events`, `/events/:slug` | Events index and event detail |
| `/activities`, `/activities/:slug` | Activities index and activity detail |
| `/booking` | Booking → Payment → Confirmation (one route, three steps) |
| `/bookings`, `/bookings/:id` | My Bookings and E-Ticket Details |
| `/saved` | My List — everything you hearted |
| `/auth` | Register → Complete Profile → Login |
| `/communities`, `/communities/:slug` | Communities index and detail |
| `/organizers`, `/how-it-works`, `/pricing`, `/help` | Supporting pages |

### Organizer console

| Path | Page |
| --- | --- |
| `/organizer` | Dashboard — greeting, quick actions, six KPIs, upcoming experiences, recent registrations |
| `/organizer/experiences` | All Experiences — search + type/status/date filters, six count tiles, card or table view, pagination |
| `/organizer/create` | The event-vs-activity fork, with its own focused chrome |
| `/organizer/create/activity` | The activity builder — five steps, live participant preview |
| `/organizer/create/event` | The event builder — step 2 reshapes around offline / online / hybrid |
| `/organizer/events`, `/organizer/activities`, `/organizer/drafts` | The same list, pre-scoped |
| `/organizer/sessions` | Every bookable slot, in date order |
| `/organizer/registrations` | Searchable, status-filterable registration list |
| `/organizer/check-in` | QR scanner panel + tick-off attendee list |
| `/organizer/analytics` | Six-month bars, top experiences, traffic sources |
| `/organizer/payments`, `/organizer/payments/transactions` | Payouts (H+1, net of fees) and the payments behind them |
| `/organizer/settings` | Workspace, payouts and fee handling, plan |

### Hoople for Teams

The internal-events console works **one event at a time**. The open event is
held in `?e=<id>`, so every link in the rail carries it and a reload or a shared
link lands where you left off. `/teams/experiences` is where you switch.

| Path | Page |
| --- | --- |
| `/teams` | Experience Dashboard — the open event's cover, four KPIs, quick actions, member link, status, trend, sessions, activity |
| `/teams/experiences` | Every internal event, filterable by status; click one to open it in the console |
| `/teams/registrations` | Members who registered, with a detail drawer: pass, payment, attendance timeline, QR |
| `/teams/sessions` | The running order, fill per session, and a panel for the selected one |
| `/teams/check-in` | Live scanner, check-in curve, recent check-ins, attendance by session |
| `/teams/analytics` | Invite funnel, passes taken, internal channels, response by department, event score |
| `/teams/orders` | Contributions collected, with an order drawer and fee breakdown |
| `/teams/payments` | Collections, fees, settlement, payout progress |
| `/teams/settings` | Who counts as a member, departments, collections |
| `/teams/profile` | How the organization appears to its own members |

`/booking` accepts `?activity=<slug>&session=<id>&date=<iso>` for an activity
session, or `?event=<slug>` for a one-time event.

## Structure

```
src/
  components/
    layout/    Navbar, MobileNav, BookBar, Footer, Layout, DarkHero
    teams/     TeamsLayout, TeamsSidebar, TeamsTopbar, EventContext, charts
    ui/        Button, Modal, ImageSlot, Rail, FilterBar, FilterPanel, …
    cards/     ActivityCard, SessionCard, RecurringRow, EventCard, MiniCard
    organizer/ OrgLayout, OrgSidebar, OrgTopbar, Step* (activity builder)
               event/     (event builder sections)
  data/        Catalogue, schedule maths, pricing, organizer data, internal
               events (teams.ts), domain types
  lib/         format.ts (Rupiah + dates), motion.ts (reveal, ripple, confetti)
  pages/       One file per route
  store/       bookings.tsx — the booking ledger
  styles/      tokens → base → motion → components → layout → cards → … →
               organizer → eventbuilder → eventpublish → teams → entry →
               responsive
```

### Sessions are derived, not hard-coded

An activity declares weekly `SessionTemplate`s and its `closedWeekdays`.
Everything else — the date strip, the green/grey dots in the calendar modal,
"Today's Sessions", "next session" on a card — is computed in
`src/data/schedule.ts`. Edit one template and every surface updates.

The prototype runs against a fixed `APP_TODAY` (`2026-07-20`) so the calendar
reads identically for every reviewer.

### Bookings

`src/store/bookings.tsx` seeds the ledger with 3 upcoming, 8 completed and 1
cancelled booking, then persists to `localStorage`. Checkout writes into it and
My Bookings / the e-ticket read back out, so a booking made in the demo
survives a reload.

### Who has to sign in, and when

The three surfaces gate differently, on purpose:

- **Participant site** — browsing, searching and filling the checkout form need
  no account. The gate is at **payment**: `Continue to Payment` parks the form
  in `src/store/checkout.ts`, sends you to `/auth?next=…&resume=1`, and on the
  way back restores every field and opens the payment sheet. Nobody fills the
  form twice.
- **Organizer console** — gated at the door by `<RequireAuth>`. `/organizer`
  redirects to `/auth` carrying `next`, so signing in lands on the page that
  was asked for.
- **Hoople for Teams** — gated at the door too, and for a stronger reason:
  there is nothing in an internal workspace a non-member is allowed to see.

### What "internal" changes

Hoople for Teams is not the organizer console with a different logo. Being
members-only pushes through most of the screens:

- **No public page.** An event has a member link
  (`hoople.id/w/<org>/e/<slug>`) that asks for an `@company` sign-in. There is
  no listing, no search, no share-to-Instagram. Visibility tops out at "the
  whole company"; there is no Public.
- **The audience is a directory, not a market.** You invite departments out of
  a known roll of 486 people, so the funnel counts people — invited, opened,
  started, registered — instead of page views and conversion. "Where they came
  from" means email, Slack, intranet or a manager nomination.
- **Money is a whip-round, not a sale.** An internal event is company-paid,
  free, or cost-shared (the padel court fee, split). Passes exist, but they are
  a Full Pass, a Day Pass, a Guest +1 and a free Online Pass, and Hoople takes
  **0%** — the Organization plan is a subscription. Charging a percentage of
  colleagues chipping in for a court would be hard to explain to the people
  chipping in. Only the payment gateway bills per transaction.
- **Attendance is the deliverable.** A hybrid internal event has two doors, so
  check-in splits into scans at the lobby and joins on the livestream, and both
  count as present. A pass is tied to an employee ID, so it cannot be handed to
  someone outside the company — that is what the scanner's "not on the list"
  rejections are.

The mockups this was built from showed a public page, a 15% admin fee and
ticket sales; those three are the parts that contradict "members only, not
published", and they are what changed.

### Signed-out vs signed-in

The navigation has two states, driven by `src/store/session.tsx`:

- **Signed out** — My Tickets · Log in · Create Experience
- **Signed in** — My List (with a saved count) · My Tickets · avatar menu

Completing **Login** on `/auth` flips the state and lands you on Activities.
The avatar menu holds My Tickets, My List, Organizer account, Help Center and
Log out. Nothing is authenticated — see [Prototype
boundaries](#prototype-boundaries).

### My List

Every heart in the app writes to `src/store/saved.tsx` under a namespaced key
(`activity:pottery-class`, `event:jakarta-coffee-week`), so an activity and an
event can never collide on the same slug. `/saved` reads that list back and
renders the saved activities and events in their normal cards.

### The console's data is writable

`src/store/experiences.tsx` is the experience ledger. The catalogue used to be
a frozen array, so publishing had nowhere to go; now every list, tile and count
reads from this store and the builders write into it:

- **Save as Draft** writes a Draft row and keeps the builder payload with it.
- **Edit** on a row reopens `/organizer/create/{activity,event}?id=…` with the
  draft rehydrated, so unfinished work can be picked up.
- **Publish** flips the row to Upcoming; a scheduled publish stays a Draft.
- **Duplicate** copies a row as a fresh draft; **Delete** removes it;
  **Cancel/Restore** moves it between Cancelled and Upcoming.

It persists to `localStorage`, so a demo survives a reload. Cover images are
not stored on the draft — `ImageSlot` already keeps those under its own key.

### Console counts are derived

`ORG_EXPERIENCES` seeds 24 experiences — 8 events and 16 activities, matching
the dashboard KPIs. Every count tile on the Experiences page is computed from
the live store, so the tiles, the list, and "Showing 1-5 of 24" can never drift
apart — including after you add or delete one.

Each experience carries two independent axes: `publishState`
(Published / Draft / Cancelled — is it visible to participants?) and
`lifecycle` (Upcoming / Completed / Draft / Cancelled — where is it in its own
life?). The list shows both.

### The activity builder

`/organizer/create/activity` is a five-step wizard declared once in
`src/data/builder.ts`. Every step names its own sub-sections, and the open
step's parts appear under the rail — so the organizer can see what that step
still wants and jump straight to any of it.

All five steps are built, shown one sub-section at a time:

| Step | Sub-sections |
| --- | --- |
| 1 Basic Information | 1.1 Identity · 1.2 Activity Details · 1.3 Participant Information |
| 2 Sessions | 2.1 Venue · 2.2 Operating Schedule · 2.3 Sessions |
| 3 Pricing & Booking | one screen — a step may declare no sub-sections |
| 4 Host & Experience | 4.1 Host / Instructor · 4.2 Gallery · 4.3 Facilities & Equipment · 4.4 House Rules |
| 5 Review & Publish | 5.1 Summary · 5.2 Preview · 5.3 Publish Settings |

Previous/Next walk a flat trail of every sub-section, so they cross a step
boundary without either end knowing about the other; crossing one names the
step, moving inside one names the part. The sub-section row is centred under the
rail rather than tied to the open step, so it sits in the same place throughout.

The **Activity Preview** on the right sticks under the topbar so it rides along
while the form scrolls, and it renders from the draft rather than from fixed
copy — title, category, summary, venue, difficulty badge, the slots-per-session
range and the whole session list all update as you edit. The cover uploader and
the preview's image share one `ImageSlot` id, so filling either fills both.

Two rules keep the draft from contradicting itself:

- **2.2 wins over 2.3.** A session's days are filtered through the operating
  days (`effectiveDays`), so switching a weekday off in 2.2 immediately drops it
  from the session rows and the preview. Filtering rather than deleting means
  switching the day back on restores the organizer's choice, and a session left
  with no runnable day is flagged in its row.
- **Session tone is derived.** The sun / cloud / moon / calendar icon comes from
  the session's own start time and days, not from a stored field.
- **The cancellation policy preview is the policy.** Each option in
  `CANCELLATION_POLICIES` carries the lines its preview panel renders, so the
  panel cannot describe a rule the option does not set.
- **Step 3 sets a default, not a truth.** "Max Capacity per Session" seeds new
  sessions; 2.3 owns each session's real capacity, and the field says what those
  actually are.
- **The publishing checklist is a test, not a decoration.** `publishChecklist`
  runs five real conditions over the draft; clear the facilities in 4.3 and the
  tick on 5.1 and 5.3 drops. The "You're almost there" panel switches to an
  amber "a few things still need you" until every line passes.
- **5.1 and 5.3 share one Publish Settings component**, so the compact panel
  beside the checklist and the full page cannot disagree. Visibility is the same
  field 1.2 sets.

Step 5 also swaps the right-hand preview for a phone frame — the same draft,
seen as the participant app renders it — and 5.2 offers a **Host Dashboard
View** showing the console row this activity will become.

### The event builder

`/organizer/create/event` is the event-shaped sibling of the activity builder.
It reuses the same shell — the step rail, the field primitives, the sticky
preview — and differs where an event genuinely differs.

| Step | Sub-sections |
| --- | --- |
| 1 Basic Information | 1.1 Identity · 1.2 Experience Details · 1.3 Benefits |
| 2 Date & Location | 2.1 when · 2.2 where · 2.3 Event Schedule |
| 3 Ticket Setup | one screen — ticket types, sales window, payment methods |
| 4 Brand & Host | one screen — logo, banner, colours, host profile |
| 5 Review & Publish | 5.1 Review Summary · 5.2 Publish Settings · 5.3 Final Publish |

**Step 2 changes shape with the event type.** `eventSteps(type)` derives the
map from the draft, so the rail, the Previous/Next trail and the section
registry can never disagree about what step 2 contains:

| Type | 2.1 | 2.2 |
| --- | --- | --- |
| Offline | Date & Location | Venue Details — venue, address, map, access |
| Online | Date & Time | Virtual Event Setup — platform, link, recording |
| Hybrid | Date & Location | Venue Setup — both, side by side |

Switch the type on 2.1 and the two sub-sections after it rename and re-render
immediately; the offline section's "Change" chip sends you back to 2.1, where
the choice actually lives.

**Tickets carry their own arithmetic.** A ticket stores capacity and how many
have gone; `ticketsLeft()` derives "80 left" (or `∞` for unlimited) and
`fromPrice()` picks the cheapest live ticket for the "From Rp…" line on the
discovery card. Nothing is written down twice.

**5.1 edits jump to the owner.** Each numbered row's **Edit** goes straight to
the sub-section that owns those fields — 03's Edit lands on 2.3, 04's on step 3
— so a correction never means re-walking the wizard.

**5.2's previews are the draft.** The Discover card, the search row and the
phone card all render from the same draft, and `eventChecklist()` runs six real
tests over it — the chips and the "Ready to Publish" badge cannot claim
something the organizer never filled in. **Publish Event Now** fires confetti,
confirms, and returns to the experience list.

**2.3 is one schedule builder with two views.** Timeline reads the running
order; List edits it, with drag to reorder. Session start times are never
stored — `timedSessions()` stacks each duration from the event start, so moving
or re-timing one session re-times everything after it. Hybrid adds a delivery
mode (Onsite / Online / Both) per session. The timeline icon comes from the
session's kind and title, not a stored field.

### Fees

One model, applied everywhere a total appears (`src/data/pricing.ts`): a 3%
Hoople platform fee plus a 1.8% payment gateway fee, itemised at checkout.
`Rp250.000 + Rp7.500 + Rp4.500 = IDR 262,000`.

## On a phone

Desktop-first at 1360px, and a real phone build below 900px — not a squeezed
desktop. All of it lives in `src/styles/responsive.css`, loaded last.

**Navigation changes shape.** The seven-link bar collapses to a logo, a saved
shortcut and a **hamburger**; a fixed **tab bar** (Home · Discover · Tickets ·
Saved · Menu) sits within thumb reach. Both the hamburger and the Menu tab open
the same drawer — one piece of state in `Layout`, two ways in — holding the
browse links, your account, the organizer console and Create Experience. The
organizer console's left rail becomes an off-canvas drawer with its own close
button, and its topbar drops the owner's name and the ⌘K hint to make room.

**The builder rail becomes a progress line.** Five labelled steps cannot fit a
390px rail, and a rail you have to swipe hides how far along you are — so on a
phone the dots are replaced by "Step 2 of 5", the step's name and a bar, with
that step's parts underneath as swipeable tabs.

**The primary action follows you.** On an activity or event page the price and
book button ride in a `<BookBar>` pinned above the tab bar, so booking never
means scrolling past six sections to find the aside.

**Sideways scrolling is deliberate, never accidental.** Card rails, filter
chips, detail sub-navs, wide tables and the builder's step rail each get their
own scroll track; the page itself never scrolls horizontally at any width.

Two things caused most of the original overflow, and both are fixed at the
source rather than patched per page:

- A `1fr` grid track will not shrink below its content, because a grid item's
  automatic minimum size is its content. Every layout track is now
  `minmax(0, 1fr)`, and layout items get `min-width: 0` on phones.
- Inline `gridTemplateColumns` beat every media query. Those are now classes
  (`.grid--2`, `.grid--3`, `.grid--split`), so breakpoints can reach them.

Verified by driving a real phone-sized Chromium: 26 routes at 360, 390, 768,
1024 and 1440px with no horizontal overflow and no console errors.

## Images

Every photo, illustration and QR code renders through `<ImageSlot>`. Drag an
image file onto a slot (or click to browse) and it fills, persisting under its
`id` in `localStorage`, so real assets go in without touching layout.

Until then no slot is empty. `src/lib/artwork.ts` draws each one from its own
id: a flat-vector scene in a palette chosen for the subject, generated as an
SVG data URI. Nothing is fetched, so the art works offline, costs no requests
and cannot 404.

- **Scenes** — 22 motifs (pottery, yoga, coffee, dance, gym, running, language,
  cooking, supper, painting, tufting, candle, music, talk, market, workshop,
  flower, craft, campus, photography, sunrise, community), chosen by keyword
  from the slot's id and hint. They share one figure vocabulary, so a wall of
  cards reads as one set rather than twenty unrelated drawings.
- **Heroes** get a wider composition. A hero band is ~2.5:1 against a card's
  1.6:1, and `cover` closes that gap by scaling up — at card size the figures
  came out three times too big. The wide canvas draws the motif at its intended
  size in the middle and dissolves its edges into open sky.
- **Portraits, QR codes, map tiles, logos and mascots** each have their own
  generator.

The art is deterministic: the same id always yields the same picture. That is
what keeps a builder's cover field and its preview panel showing the same thing
without either of them storing it — they share one slot id.

## Motion

Defined once in `src/styles/motion.css` and `src/lib/motion.ts`: staggered
blur-to-sharp scroll reveals, a purple scroll-progress bar, nav shadow on
scroll, card lift with photo zoom, button light-sweep and click ripple, a
pulsing halo on the primary CTA, springing hearts, modals popping in with
overshoot, floating illustrations, and a confetti burst on payment success.
All of it collapses under `prefers-reduced-motion: reduce`.

## Prototype boundaries

- **No authentication.** Register, Complete Profile and Login advance the flow
  without checking anything; social sign-in is stubbed. Login does flip the
  navigation into its signed-in state, and the session persists in
  `localStorage` until you log out.
- **No payment verification.** "I have completed the payment" just advances.
  No gateway is contacted and no money moves.
- **No backend.** The catalogue is static; bookings live in `localStorage`.
  Newsletter, support and organizer forms confirm in the UI and send nothing.
- **Both builders write, but only locally.** Saving or publishing adds a real
  row to the console's ledger in `localStorage` (see "The console's data is
  writable"), and drafts reopen where you left them. Nothing leaves the
  browser, and another device sees none of it. Gallery videos are held as
  object URLs, so they play for this page load only.
- **The QR codes are pictures of QR codes.** They have the right anatomy —
  quiet zone, three finders, timing tracks — but the payload is noise, so no
  scanner will read one. Anything that must actually scan needs a real encoder.

## Design system

Colours, type, radius and elevation live in `src/styles/tokens.css`.

| Token | Value | Used for |
| --- | --- | --- |
| `--brand` / `--brand-deep` | `#6D28FF` / `#5B21F5` | CTAs, links, EVENT badges |
| `--green` | `#16A34A` | ACTIVITY badges, Confirmed, "Join now" |
| `--amber` | `#EA8C00` | Urgency — "2 slots remaining!" |
| `--ink` / `--grey` | `#12121A` / `#6B6A7B` | Text, secondary text |
| `--container` | `1360px` | Centred content width |

Poppins for headings, Inter for body, Caveat for the one script accent per
hero. Desktop-first at 1360px; the phone build starts at 900px — see
[On a phone](#on-a-phone).

© 2026 Hoople.
