/**
 * Hoople for Teams — the internal-events console.
 *
 * The third surface of the platform. An organisation runs events for its own
 * people: a kick-off, a town hall, Friday padel. Nothing here is discoverable
 * from the participant site, nothing has a public page, and only members of the
 * organisation can see or join. That is the whole difference from the organizer
 * console, and it decides a lot downstream — the audience is a member
 * directory rather than a market, "visibility" tops out at the whole company,
 * and money is a whip-round among colleagues rather than ticket sales.
 *
 * Totals are derived from the rows below wherever one row implies another, so
 * a number can't drift out of step with the list it summarises.
 */

/* ---------- The organisation ---------- */

export const ORGANIZATION = {
  name: 'Sinar Nusantara',
  legalName: 'PT Sinar Nusantara Digital',
  initials: 'SN',
  handle: 'sinar-nusantara',
  domain: 'sinarnusantara.co.id',
  plan: 'Organization',
  members: 486,
  city: 'Jakarta Selatan',
} as const;

export const ORG_ADMIN = {
  name: 'Adriani Ajeng',
  role: 'People Ops Lead',
  email: 'adriani.ajeng@sinarnusantara.co.id',
  phone: '+62 812 3456 7890',
} as const;

/** Departments — how an internal audience actually gets picked. */
export interface Department {
  name: string;
  headcount: number;
}

export const DEPARTMENTS: Department[] = [
  { name: 'Engineering', headcount: 164 },
  { name: 'Product & Design', headcount: 78 },
  { name: 'Sales & Growth', headcount: 96 },
  { name: 'Operations', headcount: 74 },
  { name: 'People Ops', headcount: 38 },
  { name: 'Finance & Legal', headcount: 36 },
];

/* ---------- Events ---------- */

export type EventStatus = 'Published' | 'Draft' | 'Ongoing' | 'Ended' | 'Cancelled';
export type EventFormat = 'Onsite' | 'Online' | 'Hybrid';
/**
 * Who foots the bill. Internal events rarely sell tickets — they are paid by
 * the company, split between whoever turns up, or simply free.
 */
export type CostModel = 'Company-paid' | 'Cost-shared' | 'Free';

export interface PassType {
  id: string;
  name: string;
  note: string;
  price: number;
  sold: number;
  quota: number;
  /** Online passes are joined, not scanned. */
  onsite: boolean;
}

export interface TeamEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: EventStatus;
  format: EventFormat;
  costModel: CostModel;
  /** Departments invited, or the whole company. */
  audience: string[];
  recurring?: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  venue: string;
  room: string;
  createdOn: string;
  code: string;
  capacity: number;
  registered: number;
  /** Onsite scans plus online joins. */
  checkedIn: number;
  onsiteScans: number;
  passes: PassType[];
  organiser: string;
  /** Names the scene its cover art should be drawn from. */
  photoHint: string;
}

export const TEAM_EVENTS: TeamEvent[] = [
  {
    id: 'kickoff-2026',
    slug: 'annual-kick-off-2026',
    title: 'Annual Kick-off 2026',
    summary:
      'Two days of direction-setting for the whole company — strategy, roadmap, breakouts by department, and the awards night.',
    status: 'Ongoing',
    format: 'Hybrid',
    costModel: 'Cost-shared',
    audience: ['All members'],
    startDate: '2026-07-20',
    endDate: '2026-07-21',
    dateLabel: '20–21 July 2026',
    venue: 'Hotel Mulia Senayan',
    room: 'Main Ballroom',
    createdOn: '2026-06-12',
    code: 'EVT-2026-0824',
    capacity: 200,
    registered: 168,
    checkedIn: 142,
    onsiteScans: 112,
    organiser: 'People Ops',
    photoHint: 'Conference stage',
    passes: [
      { id: 'full', name: 'Full Pass', note: 'Both days, onsite', price: 350_000, sold: 90, quota: 110, onsite: true },
      { id: 'day', name: 'Day Pass', note: 'One day, onsite', price: 200_000, sold: 28, quota: 40, onsite: true },
      { id: 'guest', name: 'Guest Pass', note: 'Bring a partner (+1)', price: 600_000, sold: 12, quota: 20, onsite: true },
      { id: 'online', name: 'Online Pass', note: 'Livestream, no cost', price: 0, sold: 38, quota: 200, onsite: false },
    ],
  },
  {
    id: 'padel-friday',
    slug: 'padel-friday',
    title: 'Padel Friday',
    summary: 'Four courts booked every Friday evening. Court fee split between whoever plays that week.',
    status: 'Published',
    format: 'Onsite',
    costModel: 'Cost-shared',
    audience: ['All members'],
    recurring: 'Every Friday',
    startDate: '2026-07-24',
    endDate: '2026-07-24',
    dateLabel: 'Fri, 24 July 2026',
    venue: 'Rally Padel Club, Kemang',
    room: 'Court 1–4',
    createdOn: '2026-03-02',
    code: 'EVT-2026-0311',
    capacity: 24,
    registered: 21,
    checkedIn: 0,
    onsiteScans: 0,
    organiser: 'Operations',
    photoHint: 'Padel court',
    passes: [
      { id: 'play', name: 'Playing slot', note: 'Court fee split 4 ways', price: 75_000, sold: 21, quota: 24, onsite: true },
    ],
  },
  {
    id: 'townhall-q3',
    slug: 'town-hall-q3',
    title: 'Town Hall Q3',
    summary: 'Quarterly numbers, what shipped, and an open floor for questions. Recorded for anyone who cannot make it.',
    status: 'Published',
    format: 'Hybrid',
    costModel: 'Company-paid',
    audience: ['All members'],
    startDate: '2026-07-31',
    endDate: '2026-07-31',
    dateLabel: 'Fri, 31 July 2026',
    venue: 'HQ, Menara Sinar',
    room: 'Auditorium, Lt. 12',
    createdOn: '2026-07-01',
    code: 'EVT-2026-0741',
    capacity: 400,
    registered: 312,
    checkedIn: 0,
    onsiteScans: 0,
    organiser: 'People Ops',
    photoHint: 'HQ campus auditorium',
    passes: [
      { id: 'seat', name: 'Seat', note: 'Auditorium', price: 0, sold: 186, quota: 240, onsite: true },
      { id: 'stream', name: 'Livestream', note: 'Join from your desk', price: 0, sold: 126, quota: 400, onsite: false },
    ],
  },
  {
    id: 'onboarding-12',
    slug: 'onboarding-batch-12',
    title: 'Onboarding — Batch 12',
    summary: 'Three days for new joiners: how we work, who does what, and the tools you will live in.',
    status: 'Published',
    format: 'Onsite',
    costModel: 'Company-paid',
    audience: ['All members'],
    startDate: '2026-08-03',
    endDate: '2026-08-05',
    dateLabel: '3–5 August 2026',
    venue: 'HQ, Menara Sinar',
    room: 'Training Room A',
    createdOn: '2026-07-08',
    code: 'EVT-2026-0755',
    capacity: 30,
    registered: 26,
    checkedIn: 0,
    onsiteScans: 0,
    organiser: 'People Ops',
    photoHint: 'Training workshop room',
    passes: [{ id: 'seat', name: 'Seat', note: 'New joiners only', price: 0, sold: 26, quota: 30, onsite: true }],
  },
  {
    id: 'eng-guild',
    slug: 'engineering-guild-night',
    title: 'Engineering Guild Night',
    summary: 'Internal talks, one demo per squad, pizza after. Engineering and Product & Design only.',
    status: 'Published',
    format: 'Onsite',
    costModel: 'Company-paid',
    audience: ['Engineering', 'Product & Design'],
    recurring: 'Monthly',
    startDate: '2026-07-29',
    endDate: '2026-07-29',
    dateLabel: 'Wed, 29 July 2026',
    venue: 'HQ, Menara Sinar',
    room: 'Innovation Lab, Lt. 9',
    createdOn: '2026-06-30',
    code: 'EVT-2026-0698',
    capacity: 120,
    registered: 84,
    checkedIn: 0,
    onsiteScans: 0,
    organiser: 'Engineering',
    photoHint: 'Craft demo bench',
    passes: [{ id: 'seat', name: 'Seat', note: 'Guild members', price: 0, sold: 84, quota: 120, onsite: true }],
  },
  {
    id: 'family-day',
    slug: 'family-day-2026',
    title: 'Family Day 2026',
    summary: 'A Saturday out for members and their families. Headcount drives the catering order, so RSVP closes early.',
    status: 'Draft',
    format: 'Onsite',
    costModel: 'Cost-shared',
    audience: ['All members'],
    startDate: '2026-09-12',
    endDate: '2026-09-12',
    dateLabel: 'Sat, 12 September 2026',
    venue: 'Taman Bhinneka, Bogor',
    room: 'Lapangan Utama',
    createdOn: '2026-07-14',
    code: 'EVT-2026-0802',
    capacity: 500,
    registered: 0,
    checkedIn: 0,
    onsiteScans: 0,
    organiser: 'People Ops',
    photoHint: 'Family picnic community',
    passes: [
      { id: 'member', name: 'Member', note: 'Subsidised', price: 50_000, sold: 0, quota: 300, onsite: true },
      { id: 'family', name: 'Family member', note: 'Per extra head', price: 120_000, sold: 0, quota: 200, onsite: true },
    ],
  },
  {
    id: 'security-drill',
    slug: 'security-drill-h2',
    title: 'Security & Fire Drill H2',
    summary: 'Mandatory building drill. Attendance is reported to Facilities, so check-in is the point of the whole thing.',
    status: 'Ended',
    format: 'Onsite',
    costModel: 'Company-paid',
    audience: ['All members'],
    startDate: '2026-07-03',
    endDate: '2026-07-03',
    dateLabel: 'Fri, 3 July 2026',
    venue: 'HQ, Menara Sinar',
    room: 'Assembly Point B',
    createdOn: '2026-06-18',
    code: 'EVT-2026-0664',
    capacity: 486,
    registered: 486,
    checkedIn: 441,
    onsiteScans: 441,
    organiser: 'Operations',
    photoHint: 'Assembly point, running',
    passes: [{ id: 'all', name: 'All members', note: 'Mandatory', price: 0, sold: 486, quota: 486, onsite: true }],
  },
  {
    id: 'sales-offsite',
    slug: 'sales-offsite-bandung',
    title: 'Sales Offsite — Bandung',
    summary: 'Cancelled after the Q3 target moved. Everyone who paid has been refunded in full.',
    status: 'Cancelled',
    format: 'Onsite',
    costModel: 'Cost-shared',
    audience: ['Sales & Growth'],
    startDate: '2026-07-10',
    endDate: '2026-07-11',
    dateLabel: '10–11 July 2026',
    venue: 'Padma Hotel, Bandung',
    room: 'Meeting Room 2',
    createdOn: '2026-06-05',
    code: 'EVT-2026-0621',
    capacity: 60,
    registered: 44,
    checkedIn: 0,
    onsiteScans: 0,
    organiser: 'Sales & Growth',
    photoHint: 'Offsite supper table',
    passes: [{ id: 'seat', name: 'Seat', note: 'Refunded', price: 250_000, sold: 44, quota: 60, onsite: true }],
  },
];

/** The event the console opens on. */
export const DEFAULT_EVENT_ID = 'kickoff-2026';

export function getTeamEvent(id: string | null | undefined): TeamEvent {
  return TEAM_EVENTS.find((event) => event.id === id) ?? TEAM_EVENTS[0];
}

/* ---------- Money, derived from the passes ---------- */

/** What members contributed. Free passes add nothing, so they cost nothing. */
export function collected(event: TeamEvent): number {
  return event.passes.reduce((sum, pass) => sum + pass.price * pass.sold, 0);
}

/** Orders only exist where money changed hands. */
export function paidOrders(event: TeamEvent): number {
  return event.passes.filter((pass) => pass.price > 0).reduce((sum, pass) => sum + pass.sold, 0);
}

export function onsiteRegistrations(event: TeamEvent): number {
  return event.passes.filter((pass) => pass.onsite).reduce((sum, pass) => sum + pass.sold, 0);
}

/**
 * The Organization plan is a subscription, so Hoople takes nothing off an
 * internal whip-round. Only the payment gateway charges per transaction.
 */
export const GATEWAY_RATE = 0.0395;
export const GATEWAY_FLAT = 4_000;
export const PLATFORM_RATE = 0;

export interface Settlement {
  gross: number;
  platformFee: number;
  gatewayFee: number;
  net: number;
  orders: number;
}

export function settlement(event: TeamEvent): Settlement {
  const gross = collected(event);
  const orders = paidOrders(event);
  const gatewayFee = Math.round(gross * GATEWAY_RATE + orders * GATEWAY_FLAT);
  const platformFee = Math.round(gross * PLATFORM_RATE);
  return { gross, platformFee, gatewayFee, net: gross - platformFee - gatewayFee, orders };
}

/* ---------- Sessions ---------- */

export type SessionState = 'Upcoming' | 'Ongoing' | 'Ended';

export interface TeamSession {
  id: string;
  title: string;
  room: string;
  date: string;
  start: string;
  end: string;
  capacity: number;
  booked: number;
  waitlist: number;
  checkedIn: number;
  noShow: number;
  state: SessionState;
  lead: string;
  /** Shown on the session panel — what this hour is actually for. */
  note: string;
}

export const TEAM_SESSIONS: Record<string, TeamSession[]> = {
  'kickoff-2026': [
    {
      id: 's1',
      title: 'Opening & CEO Address',
      room: 'Main Ballroom',
      date: '2026-07-20',
      start: '09:00',
      end: '10:30',
      capacity: 150,
      booked: 130,
      waitlist: 0,
      checkedIn: 124,
      noShow: 6,
      state: 'Ended',
      lead: 'Bramantyo Wijaya, CEO',
      note: 'Where we landed in H1 and the one thing we are betting on next.',
    },
    {
      id: 's2',
      title: 'Product Roadmap 2027',
      room: 'Main Ballroom',
      date: '2026-07-20',
      start: '11:00',
      end: '12:30',
      capacity: 150,
      booked: 118,
      waitlist: 4,
      checkedIn: 96,
      noShow: 0,
      state: 'Ongoing',
      lead: 'Kirana Dewanti, VP Product',
      note: 'The roadmap, the cuts we made to get there, and what each squad owns.',
    },
    {
      id: 's3',
      title: 'Engineering Breakout',
      room: 'Workshop Room A',
      date: '2026-07-20',
      start: '13:00',
      end: '14:30',
      capacity: 50,
      booked: 45,
      waitlist: 7,
      checkedIn: 38,
      noShow: 0,
      state: 'Ongoing',
      lead: 'Rizky Pratama, Head of Engineering',
      note: 'Platform migration, on-call rotation, and the hiring plan for Q4.',
    },
    {
      id: 's4',
      title: 'Sales & Growth Breakout',
      room: 'Workshop Room B',
      date: '2026-07-20',
      start: '15:00',
      end: '16:30',
      capacity: 40,
      booked: 32,
      waitlist: 0,
      checkedIn: 0,
      noShow: 0,
      state: 'Upcoming',
      lead: 'Nadia Putri, Sales Director',
      note: 'Pipeline review by region and the new commission structure.',
    },
    {
      id: 's5',
      title: 'Awards Night & Dinner',
      room: 'Hall Area',
      date: '2026-07-20',
      start: '19:00',
      end: '21:00',
      capacity: 150,
      booked: 128,
      waitlist: 12,
      checkedIn: 0,
      noShow: 0,
      state: 'Upcoming',
      lead: 'People Ops',
      note: 'Long-service awards, squad of the year, then dinner and the band.',
    },
    {
      id: 's6',
      title: 'Closing & Group Photo',
      room: 'Main Ballroom',
      date: '2026-07-21',
      start: '10:00',
      end: '11:00',
      capacity: 120,
      booked: 96,
      waitlist: 0,
      checkedIn: 0,
      noShow: 0,
      state: 'Upcoming',
      lead: 'Bramantyo Wijaya, CEO',
      note: 'Commitments for the quarter, then everyone on the ballroom steps.',
    },
  ],
};

export function sessionsFor(eventId: string): TeamSession[] {
  return TEAM_SESSIONS[eventId] ?? [];
}

/* ---------- Members and their registrations ---------- */

export type AttendanceState = 'Checked in' | 'Not checked in' | 'No show';
export type PaymentState = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Covered';

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  title: string;
  passId: string;
  orderId: string;
  quantity: number;
  payment: PaymentState;
  amount: number;
  attendance: AttendanceState;
  registeredOn: string;
  registeredAt: string;
  paidAt: string;
  checkedInAt: string;
  method: string;
  /** How this member came to register — the internal funnel, not ad traffic. */
  source: string;
}

export const REGISTRATIONS: Registration[] = [
  {
    id: 'r1', name: 'Adriani Ajeng', email: 'adriani.ajeng@sinarnusantara.co.id', phone: '+62 812 3456 7890',
    employeeId: 'SN-0042', department: 'People Ops', title: 'People Ops Lead',
    passId: 'guest', orderId: '#ORD-260719-001', quantity: 2, payment: 'Paid', amount: 1_200_000,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '08:45', paidAt: '08:50',
    checkedInAt: '09:15', method: 'BCA Virtual Account', source: 'Email invite',
  },
  {
    id: 'r2', name: 'Rizky Pratama', email: 'rizky.pratama@sinarnusantara.co.id', phone: '+62 812 8765 4321',
    employeeId: 'SN-0117', department: 'Engineering', title: 'Head of Engineering',
    passId: 'full', orderId: '#ORD-260719-002', quantity: 1, payment: 'Paid', amount: 350_000,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '08:50', paidAt: '08:52',
    checkedInAt: '09:20', method: 'GoPay', source: 'Slack broadcast',
  },
  {
    id: 'r3', name: 'Dewi Larasati', email: 'dewi.larasati@sinarnusantara.co.id', phone: '+62 812 9988 1122',
    employeeId: 'SN-0233', department: 'Product & Design', title: 'Senior Product Designer',
    passId: 'day', orderId: '#ORD-260719-003', quantity: 1, payment: 'Paid', amount: 200_000,
    attendance: 'Not checked in', registeredOn: '2026-07-19', registeredAt: '09:05', paidAt: '09:07',
    checkedInAt: '', method: 'QRIS', source: 'Email invite',
  },
  {
    id: 'r4', name: 'Bima Setiawan', email: 'bima.setiawan@sinarnusantara.co.id', phone: '+62 812 3344 5666',
    employeeId: 'SN-0308', department: 'Sales & Growth', title: 'Account Executive',
    passId: 'full', orderId: '#ORD-260719-004', quantity: 1, payment: 'Pending', amount: 350_000,
    attendance: 'Not checked in', registeredOn: '2026-07-19', registeredAt: '09:10', paidAt: '',
    checkedInAt: '', method: 'BCA Virtual Account', source: 'Manager nomination',
  },
  {
    id: 'r5', name: 'Siti Nurhaliza', email: 'siti.nurhaliza@sinarnusantara.co.id', phone: '+62 813 2233 4455',
    employeeId: 'SN-0091', department: 'Finance & Legal', title: 'Finance Manager',
    passId: 'guest', orderId: '#ORD-260719-005', quantity: 2, payment: 'Failed', amount: 1_200_000,
    attendance: 'Not checked in', registeredOn: '2026-07-19', registeredAt: '09:12', paidAt: '',
    checkedInAt: '', method: 'Credit Card', source: 'Email invite',
  },
  {
    id: 'r6', name: 'Andi Wijaya', email: 'andi.wijaya@sinarnusantara.co.id', phone: '+62 813 6677 8899',
    employeeId: 'SN-0155', department: 'Engineering', title: 'Staff Engineer',
    passId: 'full', orderId: '#ORD-260719-006', quantity: 1, payment: 'Paid', amount: 350_000,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '09:20', paidAt: '09:22',
    checkedInAt: '09:35', method: 'GoPay', source: 'Slack broadcast',
  },
  {
    id: 'r7', name: 'Nadia Putri', email: 'nadia.putri@sinarnusantara.co.id', phone: '+62 815 2211 3344',
    employeeId: 'SN-0064', department: 'Sales & Growth', title: 'Sales Director',
    passId: 'day', orderId: '#ORD-260719-007', quantity: 1, payment: 'Refunded', amount: 200_000,
    attendance: 'Not checked in', registeredOn: '2026-07-19', registeredAt: '09:25', paidAt: '09:26',
    checkedInAt: '', method: 'QRIS', source: 'Email invite',
  },
  {
    id: 'r8', name: 'Fauzan Hakim', email: 'fauzan.hakim@sinarnusantara.co.id', phone: '+62 812 1122 9988',
    employeeId: 'SN-0402', department: 'Operations', title: 'Facilities Coordinator',
    passId: 'full', orderId: '#ORD-260719-008', quantity: 1, payment: 'Paid', amount: 350_000,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '09:40', paidAt: '09:42',
    checkedInAt: '09:45', method: 'BCA Virtual Account', source: 'Intranet',
  },
  {
    id: 'r9', name: 'Jessica Nathania', email: 'jessica.nathania@sinarnusantara.co.id', phone: '+62 811 4455 6677',
    employeeId: 'SN-0276', department: 'Product & Design', title: 'Product Manager',
    passId: 'online', orderId: '', quantity: 1, payment: 'Covered', amount: 0,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '10:02', paidAt: '',
    checkedInAt: '09:12', method: 'Livestream join', source: 'Slack broadcast',
  },
  {
    id: 'r10', name: 'Raka Mahendra', email: 'raka.mahendra@sinarnusantara.co.id', phone: '+62 819 7788 1010',
    employeeId: 'SN-0349', department: 'Engineering', title: 'Engineering Manager',
    passId: 'online', orderId: '', quantity: 1, payment: 'Covered', amount: 0,
    attendance: 'No show', registeredOn: '2026-07-19', registeredAt: '10:15', paidAt: '',
    checkedInAt: '', method: 'Livestream join', source: 'Manager nomination',
  },
  {
    id: 'r11', name: 'Putri Anggraini', email: 'putri.anggraini@sinarnusantara.co.id', phone: '+62 817 3131 2020',
    employeeId: 'SN-0188', department: 'People Ops', title: 'Talent Partner',
    passId: 'full', orderId: '#ORD-260719-009', quantity: 1, payment: 'Paid', amount: 350_000,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '10:28', paidAt: '10:30',
    checkedInAt: '09:02', method: 'QRIS', source: 'Email invite',
  },
  {
    id: 'r12', name: 'Yoga Prasetya', email: 'yoga.prasetya@sinarnusantara.co.id', phone: '+62 812 5050 6060',
    employeeId: 'SN-0421', department: 'Operations', title: 'Logistics Lead',
    passId: 'day', orderId: '#ORD-260719-010', quantity: 1, payment: 'Paid', amount: 200_000,
    attendance: 'Checked in', registeredOn: '2026-07-19', registeredAt: '10:44', paidAt: '10:46',
    checkedInAt: '09:28', method: 'GoPay', source: 'Intranet',
  },
];

export function passOf(event: TeamEvent, passId: string): PassType | undefined {
  return event.passes.find((pass) => pass.id === passId);
}

/* ---------- The internal funnel ---------- */

/**
 * A public event measures page views; an internal one measures whether the
 * invite landed. Every step below is a count of people, out of a known roll.
 */
export interface FunnelStep {
  label: string;
  note: string;
  count: number;
}

export function funnel(event: TeamEvent): FunnelStep[] {
  const invited = event.audience.includes('All members')
    ? ORGANIZATION.members
    : DEPARTMENTS.filter((d) => event.audience.includes(d.name)).reduce((sum, d) => sum + d.headcount, 0);
  const opened = Math.round(invited * 0.7);
  const started = Math.round(event.registered * 1.24);
  return [
    { label: 'Invited', note: 'Members who got the invite', count: invited },
    { label: 'Opened', note: 'Opened the invite', count: opened },
    { label: 'Started registering', note: 'Reached the RSVP form', count: started },
    { label: 'Registered', note: 'Seat confirmed', count: event.registered },
  ];
}

/**
 * How the registrations split across departments.
 *
 * Derived rather than stored, and apportioned by largest remainder, so the
 * rows always add up to exactly the event's registration count no matter how
 * the weights are tuned. Hard-coded percentages drifted out of step with the
 * total the moment either changed.
 */
const RESPONSE_WEIGHT: Record<string, number> = {
  Engineering: 1.15,
  'Product & Design': 1.3,
  'Sales & Growth': 0.8,
  Operations: 0.9,
  'People Ops': 1.5,
  'Finance & Legal': 1,
};

export interface DepartmentResponse {
  name: string;
  headcount: number;
  registered: number;
  /** Percent of that department's headcount. */
  share: number;
}

export function departmentResponse(event: TeamEvent): DepartmentResponse[] {
  const invited = DEPARTMENTS.filter(
    (department) => event.audience.includes('All members') || event.audience.includes(department.name),
  );
  const weights = invited.map((d) => d.headcount * (RESPONSE_WEIGHT[d.name] ?? 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;

  const exact = weights.map((weight) => (weight / total) * event.registered);
  const floors = exact.map(Math.floor);
  let left = event.registered - floors.reduce((sum, n) => sum + n, 0);

  /* Hand the leftover seats to the biggest remainders first. */
  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  const counts = [...floors];
  for (const { index } of order) {
    if (left <= 0) break;
    counts[index] += 1;
    left -= 1;
  }

  return invited.map((department, index) => {
    const registered = Math.min(counts[index], department.headcount);
    return {
      name: department.name,
      headcount: department.headcount,
      registered,
      share: Math.round((registered / department.headcount) * 100),
    };
  });
}

export const REGISTRATION_SOURCES = [
  { source: 'Email invite', share: 41 },
  { source: 'Slack broadcast', share: 27 },
  { source: 'Intranet', share: 16 },
  { source: 'Manager nomination', share: 11 },
  { source: 'Direct link', share: 5 },
];

export const DEVICE_SPLIT = [
  { label: 'Mobile', share: 57, tone: '#6D28FF' },
  { label: 'Desktop', share: 29, tone: '#16A34A' },
  { label: 'Tablet', share: 10, tone: '#EA8C00' },
  { label: 'Other', share: 4, tone: '#B4B2C0' },
];

/**
 * Registrations per day over the week before the event, and the contributions
 * that came with them. `count` sums to the event's 168 registrations and
 * `contributed` to its IDR 44.300.000 — a trend that does not add up to the
 * total it is a trend of is worse than no trend.
 */
export const REGISTRATION_TREND = [
  { day: '13 Jul', count: 9, previous: 6, contributed: 2_375_000 },
  { day: '14 Jul', count: 14, previous: 8, contributed: 3_690_000 },
  { day: '15 Jul', count: 22, previous: 11, contributed: 5_800_000 },
  { day: '16 Jul', count: 31, previous: 14, contributed: 8_175_000 },
  { day: '17 Jul', count: 41, previous: 18, contributed: 10_810_000 },
  { day: '18 Jul', count: 32, previous: 15, contributed: 8_440_000 },
  { day: '19 Jul', count: 19, previous: 12, contributed: 5_010_000 },
];

/** Check-ins per hour on the morning of day one. */
export const CHECKIN_CURVE = [
  { hour: '08:00', count: 8 },
  { hour: '09:00', count: 34 },
  { hour: '10:00', count: 62 },
  { hour: '11:00', count: 88 },
  { hour: '12:00', count: 104 },
  { hour: '13:00', count: 126 },
  { hour: '14:00', count: 138 },
  { hour: '15:00', count: 142 },
];

export const SCANNER_STATS = [
  { label: 'Total scans', value: 131, tone: 'ink' as const },
  { label: 'Successful', value: 112, tone: 'green' as const },
  { label: 'Duplicate', value: 12, tone: 'amber' as const },
  { label: 'Not on the list', value: 7, tone: 'danger' as const },
];

/* ---------- Activity feed ---------- */

export interface ActivityItem {
  id: string;
  kind: 'registration' | 'payment' | 'checkin' | 'edit';
  title: string;
  detail: string;
  when: string;
}

export const ACTIVITY: ActivityItem[] = [
  { id: 'a1', kind: 'registration', title: '12 new registrations', detail: 'Mostly Engineering', when: 'Today, 08:45' },
  { id: 'a2', kind: 'payment', title: 'Contributions received', detail: 'IDR 750.000 across 3 orders', when: 'Today, 08:30' },
  { id: 'a3', kind: 'checkin', title: '28 members checked in', detail: 'Main Ballroom door', when: 'Today, 09:15' },
  { id: 'a4', kind: 'edit', title: 'You updated a session', detail: 'Engineering Breakout moved to 13:00', when: 'Yesterday, 22:10' },
];

/* ---------- Payout ---------- */

export interface PayoutStep {
  label: string;
  when: string;
  state: 'done' | 'current' | 'todo';
}

export function payoutSteps(event: TeamEvent): PayoutStep[] {
  const ended = event.status === 'Ended';
  return [
    { label: 'Event completed', when: ended ? '3 Jul 2026, 17:00' : '21 Jul 2026, 12:00', state: ended ? 'done' : 'todo' },
    { label: 'Collection closed', when: ended ? '3 Jul 2026, 17:30' : '21 Jul 2026, 12:30', state: ended ? 'done' : 'todo' },
    { label: 'Finance review', when: ended ? '3 Jul 2026, 18:00' : 'Awaiting event end', state: ended ? 'done' : 'todo' },
    { label: 'Transfer scheduled', when: ended ? '4 Jul 2026, 09:00' : 'H+1 after the event', state: ended ? 'done' : 'todo' },
    { label: 'Transfer sent', when: ended ? '4 Jul 2026, 09:20' : '—', state: ended ? 'done' : 'todo' },
  ];
}

export const PAYOUT_ACCOUNT = {
  bank: 'BCA',
  masked: '•••• 1234',
  holder: 'PT Sinar Nusantara Digital',
  method: 'Midtrans disbursement',
} as const;

/* ---------- Board-level summaries ---------- */

/** Everything the console is running, for the events list and the switcher. */
export function eventTotals() {
  const live = TEAM_EVENTS.filter((e) => e.status === 'Published' || e.status === 'Ongoing');
  return {
    all: TEAM_EVENTS.length,
    live: live.length,
    drafts: TEAM_EVENTS.filter((e) => e.status === 'Draft').length,
    ended: TEAM_EVENTS.filter((e) => e.status === 'Ended').length,
    cancelled: TEAM_EVENTS.filter((e) => e.status === 'Cancelled').length,
    registered: TEAM_EVENTS.reduce((sum, e) => sum + e.registered, 0),
  };
}
