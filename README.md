# Hoople

All-in-one experience platform for communities in Indonesia.
_Experiences that connect communities, that grow._

This repository is a **clickable UI prototype for stakeholder review**. Every
button works and the whole booking loop holds together, but authentication and
payment are deliberately not verified — see [Prototype
boundaries](#prototype-boundaries).

Hoople is two products against one platform, and both are served from this one
build so a reviewer only needs a single link:

- **Participant site** (`/`) — discover and book experiences.
- **Organizer console** (`/organizer`) — run them. Reachable from the
  **Organizer Console** card at the bottom of every footer.

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
| `/` | Landing |
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

`/booking` accepts `?activity=<slug>&session=<id>&date=<iso>` for an activity
session, or `?event=<slug>` for a one-time event.

## Structure

```
src/
  components/
    layout/    Navbar, MobileNav, BookBar, Footer, Layout, DarkHero
    ui/        Button, Modal, ImageSlot, Rail, FilterBar, FilterPanel, …
    cards/     ActivityCard, SessionCard, RecurringRow, EventCard, MiniCard
    organizer/ OrgLayout, OrgSidebar, OrgTopbar, Step* (activity builder)
               event/     (event builder sections)
  data/        Catalogue, schedule maths, pricing, organizer data, domain types
  lib/         format.ts (Rupiah + dates), motion.ts (reveal, ripple, confetti)
  pages/       One file per route
  store/       bookings.tsx — the booking ledger
  styles/      tokens → base → motion → components → layout → cards → … →
               organizer → eventbuilder → eventpublish → responsive
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

### Console counts are derived

`ORG_EXPERIENCES` holds 24 experiences — 8 events and 16 activities, matching
the dashboard KPIs. Every count tile on the Experiences page
(`countExperiences`) is computed from that array, so the tiles, the list, and
"Showing 1-5 of 24" can never drift apart.

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

Every photo, illustration and QR code renders through `<ImageSlot>` — a
placeholder you fill by dragging an image file onto it (or clicking to browse).
Filled slots persist under their `id` in `localStorage`, so real assets can be
dropped in for a demo without touching layout. No photo is faked with SVG.

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
- **Neither builder writes to the catalogue.** Its draft lives in
  component state for the session. "Save as Draft" and "Publish Activity" both
  confirm and return you to the experience list without adding a row to
  `ORG_EXPERIENCES` — the catalogue is static. Gallery videos are held as object
  URLs, so they play for this page load only.

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
