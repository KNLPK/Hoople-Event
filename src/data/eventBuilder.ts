/**
 * The event builder: its step map and the draft it edits.
 *
 * Unlike the activity builder, step 2 changes shape with the event type — an
 * offline event needs a venue, an online one needs a meeting link, a hybrid one
 * needs both. `eventSteps()` derives the map from the draft so the rail, the
 * Previous/Next trail and the section registry all stay in agreement.
 */

import { APP_TODAY } from '@/data/activities';
import type { WizardStep } from '@/data/builder';

export type EventType = 'Offline' | 'Online' | 'Hybrid';
/* One setting, shown in 1.2 and again in 5.2 — the same three choices both times. */
export type EventVisibility = 'Public' | 'Unlisted' | 'Private';
export type RegistrationStatus = 'open' | 'scheduled' | 'draft';
export type SessionKind = 'Presentation' | 'Activity' | 'Break' | 'Networking';
export type DeliveryMode = 'Onsite' | 'Online' | 'Both';
export type ScheduleView = 'timeline' | 'list';

export interface EventSession {
  id: string;
  title: string;
  description: string;
  kind: SessionKind;
  speaker: string;
  /** Minutes. Start times are derived by stacking these from the event start. */
  minutes: number;
  /** Hybrid only — who a session is for. */
  delivery: DeliveryMode;
}

/** A thing a participant can buy. Capacity `null` means unlimited. */
export interface TicketType {
  id: string;
  name: string;
  mode: DeliveryMode;
  description: string;
  perks: string[];
  price: number;
  earlyBird?: number;
  capacity: number | null;
  sold: number;
  active: boolean;
}

export interface EventDraft {
  /* 1.1 Identity */
  cover?: string;
  hostedAs: string;
  title: string;
  category: string;
  eventType: EventType;
  summary: string;

  /* 1.2 Experience Details */
  tags: string[];
  theme: string;
  audience: string;
  language: string;
  ageRestriction: string;
  visibility: EventVisibility;

  /* 1.3 Benefits */
  highlights: string[];
  benefits: string[];

  /* 2.1 Date & Location */
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  allDay: boolean;

  /* 2.2 Venue (offline + hybrid) */
  venueName: string;
  address: string;
  meetingPoint: string;
  parking: string;
  accessibility: string;
  venueContact: string;

  /* 2.2 Virtual (online + hybrid) */
  platform: string;
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  hostEmail: string;
  joinInstructions: string;
  supportContact: string;
  waitingRoom: boolean;
  recording: string;
  recordingAccess: string;
  recordingAvailability: string;

  /* 2.3 Event Schedule */
  sessions: EventSession[];
  scheduleView: ScheduleView;

  /* 3 Ticket Setup */
  tickets: TicketType[];
  salesStart: string;
  salesStartTime: string;
  salesEnd: string;
  salesEndTime: string;
  currency: string;
  refundPolicy: string;
  transferPolicy: string;
  paymentMethods: string[];

  /* 4 Brand & Host */
  brandColor: string;
  fontStyle: string;
  hostName: string;
  hostType: string;
  hostDescription: string;
  contactEmail: string;
  contactPhone: string;
  hostWebsite: string;

  /* 5.2 Publish Settings */
  registrationStatus: RegistrationStatus;
  publishDate: string;
  publishTime: string;
  showOnDiscover: boolean;
  categoryRecommendation: boolean;
  notifyFollowers: boolean;
  notifyCommunity: boolean;
  sendReminder: boolean;
  shareSlug: string;
}

/* ---------- Step map ---------- */

/** 2.1 is named for what it actually asks: an online event has no location. */
const DATE_LABEL: Record<EventType, string> = {
  Offline: 'Date & Location',
  Online: 'Date & Time',
  Hybrid: 'Date & Location',
};

const PLACE_LABEL: Record<EventType, string> = {
  Offline: 'Venue Details',
  Online: 'Virtual Event Setup',
  Hybrid: 'Venue Setup',
};

export function eventSteps(type: EventType): WizardStep[] {
  return [
    {
      id: 1,
      label: 'Basic Information',
      ready: true,
      substeps: [
        { id: 'identity', label: 'Identity' },
        /* Branding and the host sat in a step of their own, three screens
           away from the name and category they belong with. */
        { id: 'brand', label: 'Brand & Host' },
        { id: 'experience', label: 'Experience Details' },
        { id: 'benefits', label: 'Benefits' },
      ],
    },
    {
      id: 2,
      label: type === 'Online' ? 'Date & Setup' : 'Date & Location',
      ready: true,
      substeps: [
        { id: 'when', label: DATE_LABEL[type] },
        { id: 'place', label: PLACE_LABEL[type] },
        { id: 'schedule', label: 'Event Schedule' },
      ],
    },
    { id: 3, label: 'Ticket Setup', ready: true, substeps: [] },
    {
      id: 4,
      label: 'Review & Publish',
      ready: true,
      substeps: [
        { id: 'review', label: 'Review Summary' },
        { id: 'publish', label: 'Publish Settings' },
        { id: 'final', label: 'Final Publish' },
      ],
    },
  ];
}

/* ---------- Option lists ---------- */

export const EVENT_HOSTS = [
  'Waktu Luang (My Organization)',
  'Adriani Ajeng (Personal)',
] as const;

export const EVENT_CATEGORIES = [
  'Seminar',
  'Workshop',
  'Conference',
  'Concert',
  'Market & Fest',
  'Talk & Meetup',
] as const;

export const EVENT_TYPES: { value: EventType; sub: string }[] = [
  { value: 'Offline', sub: 'In-person event at a physical venue.' },
  { value: 'Online', sub: 'Virtual event on the internet.' },
  { value: 'Hybrid', sub: 'Combination of offline and online.' },
];

export const EVENT_THEMES = [
  'Business & Professional',
  'Creative & Design',
  'Health & Wellness',
  'Technology',
  'Community & Lifestyle',
] as const;

export const AUDIENCES = [
  'Professionals, Managers',
  'Students & Fresh Graduates',
  'Founders & Business Owners',
  'Anyone',
] as const;

export const EVENT_LANGUAGES = ['Bahasa Indonesia', 'English', 'Bahasa Indonesia & English'] as const;

export const AGE_RESTRICTIONS = ['All ages', '13+', '17+', '18+', '21+'] as const;

export const EVENT_VISIBILITY: { value: EventVisibility; sub: string }[] = [
  { value: 'Public', sub: 'Everyone can discover this event.' },
  { value: 'Unlisted', sub: 'Only people with the link can access.' },
  { value: 'Private', sub: 'Invitation only.' },
];

export const REGISTRATION_STATUS: { value: RegistrationStatus; title: string; sub: string }[] = [
  { value: 'open', title: 'Open Registration', sub: 'Participants can register and buy tickets now.' },
  { value: 'scheduled', title: 'Scheduled Publish', sub: 'Choose a future date and time to publish.' },
  { value: 'draft', title: 'Save as Draft', sub: 'Keep editing and publish later.' },
];

export const CURRENCIES = ['IDR - Indonesian Rupiah (Rp)', 'USD - US Dollar ($)'] as const;

export const REFUND_POLICIES = [
  'No refund',
  'Full refund up to 7 days before',
  'Full refund up to 24 hours before',
] as const;

export const TRANSFER_POLICIES = ['Allowed', 'Allowed with approval', 'Not allowed'] as const;

export const PAYMENT_METHOD_OPTIONS = ['VISA', 'MC', 'QRIS', 'OVO', 'GoPay', 'DANA', 'BCA VA'] as const;

export const TICKET_PERKS = [
  'Venue Access',
  'Lunch & Coffee Break',
  'Networking',
  'Event Kit',
  'Live Access',
  'Q&A Online',
  'Recording Access',
  'Everything in Onsite',
  'Everything in Online',
];

export const HOST_TYPES = [
  'Community / Organization',
  'Company',
  'Individual',
  'Government / Institution',
] as const;

export const FONT_STYLES = ['Poppins', 'Inter', 'Plus Jakarta Sans'] as const;

/** The swatch row in step 4 — brand purple first, then five accents. */
export const BRAND_COLORS = ['#6D28FF', '#12121A', '#2563EB', '#0E9F87', '#EC4899', '#F97316'];

export const HIGHLIGHT_OPTIONS = [
  'Certificate',
  'Networking',
  'Lunch Included',
  'Workshop Kit',
  'Expert Speaker',
  'Recording Access',
  'Door Prize',
  'Community Access',
];

export const BENEFIT_SUGGESTIONS = [
  'Understand the latest trends and their impact on the future of work',
  'Learn practical leadership strategies for the AI era',
  'Network with industry leaders and professionals',
  'Gain actionable insights to future-proof your career',
  'Access exclusive materials and workshop resources',
  'Take home a certificate of attendance',
];

export const EVENT_TIMEZONES = [
  '(GMT+07:00) Jakarta, Indonesia',
  '(GMT+08:00) Makassar, Indonesia',
  '(GMT+09:00) Jayapura, Indonesia',
] as const;

export const ACCESSIBILITY_OPTIONS = [
  'Wheelchair accessible',
  'Step-free entrance',
  'Accessible restroom nearby',
  'Not accessible',
] as const;

export const MEETING_PLATFORMS = ['Zoom', 'Google Meet', 'Microsoft Teams', 'YouTube Live'] as const;

export const RECORDING_OPTIONS = ['Yes, record the event', 'No, do not record'] as const;

export const RECORDING_ACCESS = [
  'Registered participants only',
  'Anyone with the link',
  'Organizer only',
] as const;

export const RECORDING_AVAILABILITY = [
  '7 days after the event',
  '30 days after the event',
  'Available indefinitely',
] as const;

export const SESSION_KINDS: { value: SessionKind; colour: string }[] = [
  { value: 'Presentation', colour: '#2563EB' },
  { value: 'Activity', colour: '#6D28FF' },
  { value: 'Break', colour: '#16A34A' },
  { value: 'Networking', colour: '#EA8C00' },
];

export const DELIVERY_MODES: DeliveryMode[] = ['Onsite', 'Online', 'Both'];

export const EVENT_TITLE_LIMIT = 100;
export const EVENT_SUMMARY_LIMIT = 200;
export const VENUE_NAME_LIMIT = 100;
export const EVENT_ADDRESS_LIMIT = 150;
export const VENUE_FIELD_LIMIT = 100;
export const SESSION_TITLE_LIMIT = 100;
export const SESSION_DESC_LIMIT = 200;
export const JOIN_INSTRUCTIONS_LIMIT = 500;
export const HIGHLIGHT_MAX = 6;
export const BENEFIT_MAX = 6;

/* ---------- Seed ---------- */

export const EVENT_DRAFT_SEED: EventDraft = {
  hostedAs: EVENT_HOSTS[0],
  title: '',
  category: '',
  eventType: 'Offline',
  summary: '',

  tags: ['Leadership', 'AI', 'Seminar', 'Future of Work', 'Networking'],
  theme: EVENT_THEMES[0],
  audience: AUDIENCES[0],
  language: EVENT_LANGUAGES[0],
  ageRestriction: '18+',
  visibility: 'Public',

  highlights: ['Certificate', 'Networking', 'Lunch Included', 'Workshop Kit', 'Expert Speaker'],
  benefits: BENEFIT_SUGGESTIONS.slice(0, 5),

  startDate: APP_TODAY,
  startTime: '09:00',
  endDate: APP_TODAY,
  endTime: '16:30',
  timezone: EVENT_TIMEZONES[0],
  allDay: false,

  venueName: 'The Kasablanka Hall, Jakarta',
  address:
    'Mall Kota Kasablanka, Lantai 3, Jl. Casablanca Raya Kav. 88, Jakarta Selatan 12870, Indonesia',
  meetingPoint: 'Main Lobby, Lantai 1',
  parking: 'Available at Mall Parking P2 & P3',
  accessibility: ACCESSIBILITY_OPTIONS[0],
  venueContact: '+62 812 3456 7890 (Venue Manager)',

  platform: MEETING_PLATFORMS[0],
  meetingUrl: 'https://zoom.us/j/1234567890',
  meetingId: '123 456 7890',
  passcode: 'HoopleEvent2025',
  hostEmail: 'hello@waktuluang.com',
  joinInstructions: [
    'Please join 15 minutes before the event starts.',
    'Make sure your name is visible for check-in.',
    'For the best experience, use a stable internet connection and headphones.',
  ].join('\n'),
  supportContact: '812 3456 7890 (WhatsApp Support)',
  waitingRoom: true,
  recording: RECORDING_OPTIONS[0],
  recordingAccess: RECORDING_ACCESS[0],
  recordingAvailability: RECORDING_AVAILABILITY[0],

  tickets: [
    {
      id: 't1',
      name: 'Onsite Pass',
      mode: 'Onsite',
      description: 'Access to the physical venue and onsite activities.',
      perks: ['Venue Access', 'Lunch & Coffee Break', 'Networking', 'Event Kit'],
      price: 500000,
      earlyBird: 450000,
      capacity: 300,
      sold: 220,
      active: true,
    },
    {
      id: 't2',
      name: 'Online Pass',
      mode: 'Online',
      description: 'Access to live stream and online sessions.',
      perks: ['Live Access', 'Q&A Online', 'Recording Access'],
      price: 150000,
      earlyBird: 125000,
      capacity: null,
      sold: 0,
      active: true,
    },
    {
      id: 't3',
      name: 'Hybrid Pass',
      mode: 'Both',
      description: 'Access to both onsite venue and online sessions.',
      perks: ['Everything in Onsite', 'Everything in Online', 'Recording Access'],
      price: 650000,
      earlyBird: 600000,
      capacity: 200,
      sold: 155,
      active: true,
    },
  ],
  salesStart: APP_TODAY,
  salesStartTime: '10:00',
  salesEnd: '',
  salesEndTime: '23:59',
  currency: CURRENCIES[0],
  refundPolicy: REFUND_POLICIES[0],
  transferPolicy: TRANSFER_POLICIES[0],
  paymentMethods: ['VISA', 'MC', 'QRIS', 'OVO', 'GoPay', 'DANA', 'BCA VA'],

  brandColor: BRAND_COLORS[0],
  fontStyle: FONT_STYLES[0],
  hostName: 'Waktu Luang',
  hostType: HOST_TYPES[0],
  hostDescription:
    'Waktu Luang is a community that brings people together to learn, share, and grow. We create meaningful events and experiences that inspire better connections and positive impact.',
  contactEmail: 'hello@waktuluang.id',
  contactPhone: '+62 812 3456 7890',
  hostWebsite: 'https://www.waktuluang.id',

  registrationStatus: 'open',
  publishDate: APP_TODAY,
  publishTime: '09:00',
  showOnDiscover: true,
  categoryRecommendation: true,
  notifyFollowers: true,
  notifyCommunity: true,
  sendReminder: true,
  shareSlug: 'future-of-work',

  sessions: [
    { id: 'e1', title: 'Registration & Welcome Coffee', description: 'Check-in, collect nametag, and enjoy welcome coffee.', kind: 'Activity', speaker: '', minutes: 30, delivery: 'Both' },
    { id: 'e2', title: 'Opening Remarks', description: 'Welcome remarks and event introduction.', kind: 'Presentation', speaker: 'Waktu Luang Team', minutes: 15, delivery: 'Both' },
    { id: 'e3', title: 'The Future of Work: Trends & Insights', description: 'Exploring how AI and technology are shaping the future of work.', kind: 'Presentation', speaker: 'Dewi Lestari', minutes: 60, delivery: 'Both' },
    { id: 'e4', title: 'Coffee Break', description: 'Short break for participants.', kind: 'Break', speaker: '', minutes: 15, delivery: 'Onsite' },
    { id: 'e5', title: 'Leadership in The AI Era', description: 'Practical leadership strategies for a fast-moving field.', kind: 'Presentation', speaker: 'Dewi Lestari', minutes: 60, delivery: 'Both' },
    { id: 'e6', title: 'Networking Lunch', description: 'Lunch & networking for onsite participants.', kind: 'Networking', speaker: '', minutes: 60, delivery: 'Onsite' },
  ],
  scheduleView: 'timeline',
};

/* ---------- Derived ---------- */

/** `09:00` + 75 → `10:15`. Times wrap within a day; events do not run past one. */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export interface TimedSession extends EventSession {
  start: string;
  end: string;
}

/** Start times are never stored — they stack from the event start, in order. */
export function timedSessions(draft: EventDraft): TimedSession[] {
  let cursor = draft.startTime;
  return draft.sessions.map((session) => {
    const start = cursor;
    const end = addMinutes(start, session.minutes);
    cursor = end;
    return { ...session, start, end };
  });
}

/** `4h 15m` across the whole schedule. */
export function totalDuration(draft: EventDraft): string {
  const minutes = draft.sessions.reduce((sum, session) => sum + session.minutes, 0);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours ? `${hours}h` : '', rest ? `${rest}m` : ''].filter(Boolean).join(' ') || '0m';
}

/** `(GMT+07:00) Jakarta, Indonesia` → `WIB`, for the preview's one-line summary. */
export function timezoneShort(timezone: string): string {
  if (timezone.startsWith('(GMT+07')) return 'WIB';
  if (timezone.startsWith('(GMT+08')) return 'WITA';
  if (timezone.startsWith('(GMT+09')) return 'WIT';
  return '';
}

export function nextEventId(sessions: EventSession[]): string {
  const highest = sessions.reduce((max, s) => Math.max(max, Number(s.id.slice(1)) || 0), 0);
  return `e${highest + 1}`;
}

export function nextTicketId(tickets: TicketType[]): string {
  const highest = tickets.reduce((max, t) => Math.max(max, Number(t.id.slice(1)) || 0), 0);
  return `t${highest + 1}`;
}

/** How many seats are left — never stored, always capacity minus what has gone. */
export function ticketsLeft(ticket: TicketType): string {
  return ticket.capacity === null ? '\u221E' : `${Math.max(0, ticket.capacity - ticket.sold)} left`;
}

/** The cheapest live ticket, for the "From Rp…" line on a discovery card. */
export function fromPrice(draft: EventDraft): number {
  const live = draft.tickets.filter((ticket) => ticket.active);
  if (live.length === 0) return 0;
  return Math.min(...live.map((ticket) => ticket.earlyBird ?? ticket.price));
}

/**
 * The go-live checklist. Every line is a real test against the draft, so a tick
 * cannot claim something the organizer never filled in.
 */
export function eventChecklist(draft: EventDraft): { label: string; sub: string; done: boolean }[] {
  const needsVenue = draft.eventType !== 'Online';
  const needsLink = draft.eventType !== 'Offline';
  const live = draft.tickets.filter((ticket) => ticket.active).length;
  return [
    {
      label: 'Basic Information',
      sub: 'Event details have been added',
      done: draft.title.trim() !== '' && draft.category !== '' && draft.summary.trim() !== '',
    },
    {
      label: 'Date & Location',
      sub: needsVenue ? 'Venue and time are set' : 'Meeting link and time are set',
      done:
        draft.startDate !== '' &&
        (!needsVenue || draft.venueName.trim() !== '') &&
        (!needsLink || draft.meetingUrl.trim() !== ''),
    },
    {
      label: 'Event Schedule',
      sub: `${draft.sessions.length} sessions have been scheduled`,
      done: draft.sessions.length > 0,
    },
    {
      label: 'Ticket Setup',
      sub: `${live} ticket types configured`,
      done: live > 0,
    },
    {
      label: 'Brand & Host',
      sub: 'Event branding and host info completed',
      done:
        draft.hostName.trim() !== '' &&
        draft.hostDescription.trim() !== '' &&
        draft.contactEmail.trim() !== '',
    },
    {
      label: 'Publish Settings',
      sub: 'Visibility, discovery, and notifications set',
      done: draft.registrationStatus !== 'draft',
    },
  ];
}
