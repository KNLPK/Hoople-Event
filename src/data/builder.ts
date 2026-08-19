/**
 * The activity builder: its step map and the draft it edits.
 *
 * The wizard is five steps deep. Most steps are split into the sub-sections the
 * organizer fills one screen at a time; a step with no sub-sections is a single
 * screen. Steps 1–4 are built; step 5 declares its shape so the stepper can show
 * what is coming.
 */

import { APP_TODAY } from '@/data/activities';

export interface WizardSubstep {
  id: string;
  label: string;
}

export interface WizardStep {
  /** 1-based, and shown as the number in the stepper dot. */
  id: number;
  label: string;
  substeps: WizardSubstep[];
  /** Steps whose forms are not built yet stay unreachable in the stepper. */
  ready: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    label: 'Basic Information',
    ready: true,
    substeps: [
      { id: 'identity', label: 'Identity' },
      { id: 'details', label: 'Activity Details' },
      { id: 'participant', label: 'Participant Information' },
    ],
  },
  {
    id: 2,
    label: 'Sessions',
    ready: true,
    substeps: [
      { id: 'venue', label: 'Venue' },
      { id: 'operating', label: 'Operating Schedule' },
      { id: 'sessions', label: 'Sessions' },
    ],
  },
  /* One screen, so no sub-sections — the rail shows it as a single step. */
  { id: 3, label: 'Pricing & Booking', ready: true, substeps: [] },
  {
    id: 4,
    label: 'Host & Experience',
    ready: true,
    substeps: [
      { id: 'host', label: 'Instructor' },
      { id: 'gallery', label: 'Gallery' },
      { id: 'facilities', label: 'Facilities & Equipment' },
      { id: 'rules', label: 'House Rules' },
    ],
  },
  {
    id: 5,
    label: 'Review & Publish',
    ready: true,
    substeps: [
      { id: 'summary', label: 'Summary' },
      { id: 'preview', label: 'Preview' },
      { id: 'settings', label: 'Publish Settings' },
    ],
  },
];

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Visibility = 'Public' | 'Unlisted' | 'Private';
export type AgeRule = 'all' | 'range';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** One bookable slot type. Participants pick exactly one of these. */
export interface SessionDraft {
  id: string;
  name: string;
  start: string;
  end: string;
  instructor: string;
  slots: number;
  days: Weekday[];
  active: boolean;
  /**
   * What this one session costs, when it is not the base price from step 3.
   * Left undefined it follows the base, which is what nearly every session
   * does — a Saturday slot that costs more is the exception, so it is the
   * exception that gets stored.
   */
  price?: number;
}

/** Where the pin sits on the map, as a percentage of the frame. */
export interface MapPin {
  x: number;
  y: number;
}

export type PublishWhen = 'now' | 'later';
export type Cancellation = 'Moderate' | 'Flexible' | 'Strict';
export type Confirmation = 'Instant' | 'Manual';
export type Photography = 'Allowed' | 'Ask first' | 'Not allowed';

export interface Instructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
}

/** A gallery video, held as an object URL for this session only. */
export interface VideoAsset {
  id: string;
  name: string;
  url: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface ActivityDraft {
  /* 1.1 Identity */
  cover?: string;
  /* Not asked for any more. Neither 1.1 nor 4.1 puts the question to the
     organizer: the workspace they are signed into is the host, so this is
     seeded from it and only ever read — by the previews and the summary. */
  hostedAs: string;
  title: string;
  category: string;
  summary: string;

  /* 1.2 Activity Details */
  difficulty: Difficulty;
  language: string;
  ageRule: AgeRule;
  minAge: string;
  maxAge: string;
  visibility: Visibility;

  /* 1.3 Participant Information */
  learn: string;
  included: string[];
  bring: string;
  requirements: string;

  /* 2.1 Venue */
  venueName: string;
  address: string;
  pin: MapPin;
  meetingPoint: string;
  parking: string;
  facilitiesNote: string;

  /* 2.2 Operating Schedule */
  startDate: string;
  endDate: string;
  noEndDate: boolean;
  operatingDays: Weekday[];
  /**
   * How the calendar is read.
   *
   * `true` — the weekly pattern: the activity runs on `operatingDays` every
   * week inside the effective period, and `skippedDates` are the individual
   * days taken out of it (a holiday, a studio closure).
   *
   * `false` — no pattern at all: it runs on exactly the dates in
   * `pickedDates` and nothing else.
   *
   * Only one of the two lists is ever in play, which is why they are separate
   * fields rather than one list that means different things.
   */
  repeatWeekly: boolean;
  skippedDates: string[];
  pickedDates: string[];
  timezone: string;

  /* 2.3 Sessions */
  sessions: SessionDraft[];

  /* 3 Pricing & Booking */
  price: number;
  defaultCapacity: number;
  minParticipants: string;
  bookingOpens: string;
  bookingCloses: string;
  maxAdvance: string;
  cancellation: Cancellation;
  confirmation: Confirmation;

  /* 4.1 Instructor */
  instructors: Instructor[];
  website: string;
  instagram: string;
  youtube: string;
  otherLink: string;

  /* 4.2 Gallery */
  gallery: string[];
  videos: VideoAsset[];

  /* 4.3 Facilities & Equipment */
  facilities: string[];
  equipment: EquipmentItem[];

  /* 4.4 House Rules */
  houseRules: string[];
  lateArrival: string;
  noShow: string;
  photography: Photography;
  rulesNotes: string;

  /* 5 Review & Publish — `visibility` is the same field 1.2 sets. */
  publishWhen: PublishWhen;
  publishDate: string;
  publishTime: string;
  showOnDiscovery: boolean;
  allowWaitlist: boolean;
}

export const BUILDER_CATEGORIES = [
  'Classes',
  'Yoga & Wellness',
  'Art & Craft',
  'Cooking',
  'Language',
  'Music',
  'Sports & Fitness',
  'Running Club',
] as const;

export const LANGUAGE_OPTIONS = [
  'Bahasa Indonesia',
  'English',
  'Bahasa Indonesia & English',
] as const;

export const DIFFICULTY_LEVELS: { value: Difficulty; sub: string; badge: string }[] = [
  { value: 'Beginner', sub: 'No experience needed', badge: 'Beginner Friendly' },
  { value: 'Intermediate', sub: 'Basic experience recommended', badge: 'Intermediate Level' },
  { value: 'Advanced', sub: 'For experienced participants', badge: 'Advanced Level' },
];

export const VISIBILITY_OPTIONS: { value: Visibility; sub: string }[] = [
  { value: 'Public', sub: 'Everyone can discover and book' },
  { value: 'Unlisted', sub: 'Only people with the link can access' },
  { value: 'Private', sub: 'Only invited participants can access' },
];


export const INCLUDED_SUGGESTIONS = [
  'All pottery materials',
  'Tools & equipment',
  'Apron',
  'Firing & glazing',
  'Refreshments',
  'Finished piece (up to 1 item)',
  'Photo documentation',
  'Certificate',
];

export const TIMEZONE_OPTIONS = [
  'Asia/Jakarta (GMT+7)',
  'Asia/Makassar (GMT+8)',
  'Asia/Jayapura (GMT+9)',
] as const;

export const SUMMARY_LIMIT = 160;
export const LEARN_LIMIT = 500;
export const BRING_LIMIT = 300;
export const REQUIREMENTS_LIMIT = 300;
export const VENUE_NAME_LIMIT = 100;
export const ADDRESS_LIMIT = 300;
export const MEETING_POINT_LIMIT = 100;
export const PARKING_LIMIT = 100;
export const FACILITIES_NOTE_LIMIT = 150;

export const BOOKING_OPENS = [
  '30 days before session',
  '14 days before session',
  '7 days before session',
  'As soon as it is published',
] as const;

export const BOOKING_CLOSES = [
  '24 hours before session',
  '2 hours before session',
  '30 minutes before session',
  'When the session starts',
] as const;

export const MAX_ADVANCE = ['30 days', '60 days', '90 days', 'No limit'] as const;

/** Each policy carries the lines its preview panel shows — one source, no drift. */
export const CANCELLATION_POLICIES: {
  value: Cancellation;
  sub: string;
  preview: string[];
}[] = [
  {
    value: 'Moderate',
    sub: 'Full refund up to 24 hours before the session. No refund after that.',
    preview: [
      'Full refund up to 24 hours before the session',
      'No refund for cancellations made less than 24 hours before',
    ],
  },
  {
    value: 'Flexible',
    sub: 'Full refund up to 7 days before the session.',
    preview: [
      'Full refund up to 7 days before the session',
      'Half refund within 7 days of the session',
    ],
  },
  {
    value: 'Strict',
    sub: 'No refund for cancellations.',
    preview: [
      'Bookings are final once payment clears',
      'Participants can transfer their seat to someone else',
    ],
  },
];

export const CONFIRMATION_OPTIONS: { value: Confirmation; title: string; sub: string }[] = [
  {
    value: 'Instant',
    title: 'Instant Confirmation',
    sub: 'Participants will get confirmed instantly after booking.',
  },
  {
    value: 'Manual',
    title: 'Manual Approval',
    sub: 'You will review and approve each booking request manually.',
  },
];

export const EXPERTISE_SUGGESTIONS = [
  'Handbuilding',
  'Wheel Throwing',
  'Glazing',
  'Ceramic Design',
  'Kiln Firing',
  'Surface Decoration',
];

export const FACILITY_OPTIONS = [
  'Parking',
  'Restroom',
  'Wi-Fi',
  'Accessible',
  'Air Conditioning',
  'Locker',
  'Prayer Room',
  'Cafe / F&B',
  'Smoking Area',
  'Other',
] as const;

export const EQUIPMENT_UNITS = ['units', 'pcs', 'sets'] as const;

export const HOUSE_RULE_SUGGESTIONS = [
  'Arrive 10 minutes before the session starts',
  'Wear clothes you do not mind staining',
  'Respect the tools and the shared space',
  'No outside food or drink in the studio',
  'Children under 12 must be accompanied',
  'Clean your station before leaving',
];

export const LATE_ARRIVAL_OPTIONS = [
  'Late arrivals may join within 15 minutes',
  'Late arrivals may join within 30 minutes',
  'Late arrivals may not join once the session starts',
] as const;

export const NO_SHOW_OPTIONS = [
  'No-shows forfeit the session',
  'No-shows may reschedule once',
  'No-shows are charged in full',
] as const;

export const PHOTOGRAPHY_OPTIONS: { value: Photography; sub: string }[] = [
  { value: 'Allowed', sub: 'Participants may take and share photos freely.' },
  { value: 'Ask first', sub: 'Check with the host and other participants before shooting.' },
  { value: 'Not allowed', sub: 'Keep cameras away to protect everyone’s privacy.' },
];

export const INSTRUCTOR_BIO_LIMIT = 300;
export const RULES_NOTES_LIMIT = 300;
export const GALLERY_PHOTO_MAX = 20;
export const GALLERY_VIDEO_MAX = 3;

export const ABOUT_SESSIONS = [
  'Create multiple sessions in a day or across different days.',
  'You can assign different instructors and capacity for each session.',
  'Participants can only book one session at a time.',
];

/**
 * A new draft starts empty where the organizer must decide (title, category,
 * cover) and pre-filled where Hoople can offer a sensible starting point they
 * only need to edit.
 */
export const DRAFT_SEED: ActivityDraft = {
  hostedAs: 'Waktu Luang',
  title: '',
  category: '',
  summary: '',

  difficulty: 'Beginner',
  language: 'Bahasa Indonesia',
  ageRule: 'all',
  minAge: '',
  maxAge: '',
  visibility: 'Public',

  learn: [
    '• Basic pottery techniques',
    '• Hand-building and shaping skills',
    '• Glazing and finishing process',
    '• Tips to continue your pottery journey at home',
  ].join('\n'),
  included: [
    'All pottery materials',
    'Tools & equipment',
    'Apron',
    'Firing & glazing',
    'Refreshments',
    'Finished piece (up to 1 item)',
  ],
  bring: [
    '• Comfortable clothes',
    '• Closed-toe shoes',
    '• Hair tie (if you have long hair)',
    '• Notebook (optional)',
  ].join('\n'),
  requirements:
    'No prior experience needed. Just come ready to have fun and get your hands dirty!',

  venueName: '',
  address: '',
  pin: { x: 30, y: 46 },
  meetingPoint: '',
  parking: '',
  facilitiesNote: '',

  startDate: APP_TODAY,
  endDate: '',
  noEndDate: true,
  operatingDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
  repeatWeekly: true,
  skippedDates: [],
  pickedDates: [],
  timezone: TIMEZONE_OPTIONS[0],

  sessions: [
    { id: 's1', name: 'Morning Session', start: '09:00', end: '11:00', instructor: 'Instructor Rani', slots: 10, days: ['Mon', 'Wed', 'Fri'], active: true },
    { id: 's2', name: 'Afternoon Session', start: '14:00', end: '16:00', instructor: 'Instructor Budi', slots: 12, days: ['Mon', 'Wed', 'Fri'], active: true },
    { id: 's3', name: 'Evening Session', start: '18:00', end: '20:00', instructor: 'Instructor Dita', slots: 10, days: ['Mon', 'Wed', 'Fri'], active: true },
    { id: 's4', name: 'Saturday Session', start: '10:00', end: '12:00', instructor: 'Instructor Rani', slots: 15, days: ['Sat'], active: true },
  ],

  price: 250000,
  defaultCapacity: 10,
  minParticipants: '3',
  bookingOpens: BOOKING_OPENS[1],
  bookingCloses: BOOKING_CLOSES[1],
  maxAdvance: MAX_ADVANCE[1],
  cancellation: 'Moderate',
  confirmation: 'Instant',

  instructors: [
    {
      id: 'i1',
      name: 'Rani Putri',
      role: 'Pottery Instructor',
      bio: 'Certified pottery instructor with 5+ years of experience. Rani loves sharing the joy of ceramics and believes everyone can create something beautiful.',
      expertise: ['Handbuilding', 'Wheel Throwing', 'Glazing', 'Ceramic Design'],
    },
  ],
  website: '',
  instagram: '@waktuluang',
  youtube: '',
  otherLink: '',

  gallery: ['g1', 'g2', 'g3', 'g4', 'g5'],
  videos: [],

  facilities: ['Parking', 'Restroom', 'Wi-Fi', 'Accessible', 'Air Conditioning'],
  equipment: [
    { id: 'e1', name: 'Pottery Wheel', quantity: 10, unit: 'units' },
    { id: 'e2', name: 'Apron', quantity: 15, unit: 'pcs' },
    { id: 'e3', name: 'Clay & Tools Set', quantity: 15, unit: 'sets' },
    { id: 'e4', name: 'Glazing Materials', quantity: 10, unit: 'sets' },
    { id: 'e5', name: 'Firing Kiln (Shared)', quantity: 2, unit: 'units' },
  ],

  houseRules: [
    'Arrive 10 minutes before the session starts',
    'Wear clothes you do not mind staining',
    'Respect the tools and the shared space',
  ],
  lateArrival: LATE_ARRIVAL_OPTIONS[0],
  noShow: NO_SHOW_OPTIONS[0],
  photography: 'Allowed',
  rulesNotes: '',

  publishWhen: 'now',
  publishDate: APP_TODAY,
  publishTime: '09:00',
  showOnDiscovery: true,
  allowWaitlist: true,
};

/**
 * The go-live checklist. Every line is a real test against the draft, so the
 * ticks cannot claim something is done that the organizer never filled in.
 */
export function publishChecklist(draft: ActivityDraft): { label: string; done: boolean }[] {
  return [
    {
      label: 'Basic information is complete',
      done: draft.title.trim() !== '' && draft.category !== '' && draft.summary.trim() !== '',
    },
    {
      label: 'Sessions are created and scheduled',
      done: draft.sessions.some((session) => session.active) && draft.operatingDays.length > 0,
    },
    {
      label: 'Pricing and booking settings are configured',
      done: draft.price > 0 && draft.defaultCapacity > 0,
    },
    {
      /* Instructors are optional — plenty of activities are run by the host
         alone — so this asks only for the gallery, which every listing needs. */
      label: 'Gallery photos are added',
      done: draft.gallery.length > 0,
    },
    {
      label: 'Facilities, equipment, and house rules are set',
      done:
        draft.facilities.length > 0 && draft.equipment.length > 0 && draft.houseRules.length > 0,
    },
  ];
}

/** A venue line reads better with its city; fall back to the placeholder. */
export function venueLine(draft: ActivityDraft): string {
  return draft.venueName || PREVIEW_FALLBACK.venue;
}

/** What the participant-facing card shows before the organizer types anything. */
export const PREVIEW_FALLBACK = {
  title: 'Pottery Class for Beginners',
  category: 'Classes',
  venue: 'Ceramic Studio, Jakarta',
} as const;

/**
 * A session only really runs on days the activity operates, so 2.2 always wins
 * over a stale day left on a session. Filtering rather than pruning keeps the
 * organizer's choice if they switch an operating day back on.
 */
export function effectiveDays(session: SessionDraft, operatingDays: Weekday[]): Weekday[] {
  return session.days.filter((day) => operatingDays.includes(day));
}

/** What one session costs: its own price when it has one, else the base. */
export function sessionPrice(session: SessionDraft, draft: ActivityDraft): number {
  return session.price ?? draft.price;
}

/**
 * The lowest price a participant can pay, and whether any session costs more.
 * A card says "from Rp 120.000" only when that "from" is doing some work.
 */
export function priceSpread(draft: ActivityDraft): { low: number; varies: boolean } {
  const active = draft.sessions.filter((session) => session.active);
  if (active.length === 0) return { low: draft.price, varies: false };
  const prices = active.map((session) => sessionPrice(session, draft));
  const low = Math.min(...prices);
  return { low, varies: Math.max(...prices) !== low };
}

/** `10` or `10–15`, from the capacity the organizer set per session. */
export function slotsPerSession(sessions: SessionDraft[]): string {
  const counts = sessions.filter((session) => session.active).map((session) => session.slots);
  if (counts.length === 0) return '0';
  const low = Math.min(...counts);
  const high = Math.max(...counts);
  return low === high ? `${low}` : `${low}–${high}`;
}

/** Morning, afternoon, evening or weekend — read off the session itself. */
export type SessionTone = 'morning' | 'afternoon' | 'evening' | 'weekend';

export function sessionTone(session: SessionDraft): SessionTone {
  const weekendOnly =
    session.days.length > 0 && session.days.every((day) => day === 'Sat' || day === 'Sun');
  if (weekendOnly) return 'weekend';
  const hour = Number(session.start.slice(0, 2));
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/** Keeps ids stable and unique as rows are added and removed. */
export function nextId(prefix: string, existing: { id: string }[]): string {
  const highest = existing.reduce(
    (max, item) => Math.max(max, Number(item.id.replace(/\D/g, '')) || 0),
    0,
  );
  return `${prefix}${highest + 1}`;
}
