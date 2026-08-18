import { ACTIVITIES } from '@/data/activities';
import { COMMUNITIES, EVENTS } from '@/data/events';

/**
 * What the browser tab says.
 *
 * Forty-odd routes shared one title, so three open tabs of the prototype were
 * indistinguishable and every bookmark came out named the same thing. Each
 * surface signs its own suffix, which is also the quickest way to tell the
 * participant site apart from the two consoles.
 */

const SITE = 'Hoople';
const ORGANIZER = 'Hoople for Organizers';
const TEAMS = 'Hoople for Teams';

/** The participant site. */
const PAGES: Record<string, string> = {
  '/': 'Hoople — Experiences that connect communities',
  '/home': 'Hoople — Experiences that connect communities',
  '/discover': 'Discover',
  '/events': 'Events',
  '/activities': 'Activities',
  '/communities': 'Communities',
  '/organizers': 'For organizers',
  '/how-it-works': 'How it works',
  '/pricing': 'Pricing',
  '/help': 'Help centre',
  '/saved': 'My list',
  '/bookings': 'My bookings',
  '/booking': 'Checkout',
  '/auth': 'Sign in',
};

/** The organizer console. */
const ORGANIZER_PAGES: Record<string, string> = {
  '/organizer': 'Dashboard',
  '/organizer/experiences': 'Experiences',
  '/organizer/create': 'Create an experience',
  '/organizer/create/activity': 'New activity',
  '/organizer/create/event': 'New event',
  '/organizer/events': 'Events',
  '/organizer/activities': 'Activities',
  '/organizer/drafts': 'Drafts',
  '/organizer/sessions': 'Sessions',
  '/organizer/registrations': 'Registrations',
  '/organizer/check-in': 'Check-in',
  '/organizer/analytics': 'Analytics',
  '/organizer/payments': 'Payouts',
  '/organizer/payments/transactions': 'Transactions',
  '/organizer/settings': 'Settings',
};

/** The internal-events console. */
const TEAMS_PAGES: Record<string, string> = {
  '/teams': 'Dashboard',
  '/teams/experiences': 'Experiences',
  '/teams/registrations': 'Registrations',
  '/teams/sessions': 'Sessions',
  '/teams/check-in': 'Check-in',
  '/teams/analytics': 'Analytics',
  '/teams/orders': 'Orders',
  '/teams/payments': 'Payments',
  '/teams/settings': 'Settings',
  '/teams/profile': 'Profile',
};

function trim(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function titleForPath(pathname: string): string {
  const path = trim(pathname);

  /* Detail pages are named after the thing you are looking at. */
  const event = path.startsWith('/events/') && EVENTS.find((e) => e.slug === path.slice(8));
  if (event) return `${event.title} · ${SITE}`;

  const activity = path.startsWith('/activities/') && ACTIVITIES.find((a) => a.slug === path.slice(12));
  if (activity) return `${activity.title} · ${SITE}`;

  const community = path.startsWith('/communities/') && COMMUNITIES.find((c) => c.slug === path.slice(13));
  if (community) return `${community.name} · ${SITE}`;

  if (/^\/bookings\/.+/.test(path)) return `Your e-ticket · ${SITE}`;

  const organizer = ORGANIZER_PAGES[path];
  if (organizer) return `${organizer} · ${ORGANIZER}`;

  const teams = TEAMS_PAGES[path];
  if (teams) return `${teams} · ${TEAMS}`;

  const page = PAGES[path];
  if (page) return page.startsWith(SITE) ? page : `${page} · ${SITE}`;

  return `${SITE} — Experiences that connect communities`;
}
