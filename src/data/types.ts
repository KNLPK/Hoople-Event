/** Domain types for the two things Hoople sells, and what people book. */

/** One-time (concert, seminar, market fest) vs recurring (yoga, run club, class). */
export type ExperienceKind = 'EVENT' | 'ACTIVITY';

export type BadgeKind = 'NEW' | 'FEATURED' | 'TRENDING' | 'POPULAR';

export interface Venue {
  name: string;
  area: string;
  city: string;
  address: string;
  /** Getting-there notes shown on the location card. */
  notes: string[];
}

export interface SessionTemplate {
  id: string;
  name: string;
  start: string;
  end: string;
  durationMin: number;
  coach: string;
  level: string;
  room: string;
  capacity: number;
  slotsLeft: number;
  price: number;
  /** Weekdays (0 = Sunday) this template runs on. */
  weekdays: number[];
  popular?: boolean;
}

/** A concrete, bookable session: a template resolved onto a calendar date. */
export interface Session extends Omit<SessionTemplate, 'weekdays'> {
  date: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** One line in an event's run of show. */
export interface ScheduleItem {
  time: string;
  label: string;
}

export interface Review {
  author: string;
  stars: number;
  when: string;
  body: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface BringItem {
  title: string;
  detail: string;
}

export interface Activity {
  slug: string;
  title: string;
  host: string;
  kind: ExperienceKind;
  /** Uppercase label shown on the detail hero, e.g. POTTERY. */
  categoryLabel: string;
  /** Quick-filter category on the Activities page. */
  category: string;
  badge?: BadgeKind;
  summary: string;
  description: string;
  rating: number;
  reviewCount: number;
  joined: string;
  priceFrom: number;
  level: string;
  duration: string;
  learn: string;
  includes: string;
  language: string;
  classSize: string;
  /** Human-readable recurrence, e.g. "Every Monday, Wednesday, Friday". */
  recurrence: string;
  recurrenceTime: string;
  tags: string[];
  highlights: string[];
  photoHint: string;
  galleryHints: string[];
  extraPhotos: number;
  venue: Venue;
  sessions: SessionTemplate[];
  /** Weekdays with no sessions at all (0 = Sunday). */
  closedWeekdays: number[];
  bring: BringItem[];
  faqs: FaqItem[];
  reviews: Review[];
}

export interface EventItem {
  slug: string;
  title: string;
  host: string;
  kind: 'EVENT';
  category: string;
  badge?: BadgeKind;
  date: string;
  start: string;
  end: string;
  price: number;
  venueName: string;
  area: string;
  photoHint: string;
  summary: string;
  /** Attendance so far, e.g. "780 going". */
  going: string;
  /** Run of show, in order. */
  schedule: ScheduleItem[];
  faqs: FaqItem[];
}

export interface Community {
  slug: string;
  name: string;
  focus: string;
  members: string;
  area: string;
  photoHint: string;
}

export interface Participant {
  name: string;
  email: string;
  phone: string;
}

export type BookingStatus = 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  orderId: string;
  ticketId: string;
  slug: string;
  title: string;
  host: string;
  kind: ExperienceKind;
  ticketType: string;
  date: string;
  start: string;
  end: string;
  venueName: string;
  venueArea: string;
  venueCity: string;
  photoHint: string;
  participants: Participant[];
  buyer: Participant;
  status: BookingStatus;
  paymentMethod: string;
  paidAt: string;
  subtotal: number;
  platformFee: number;
  gatewayFee: number;
  total: number;
}
