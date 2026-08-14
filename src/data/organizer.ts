/**
 * The organizer console's own data.
 *
 * Hoople ships as two products against one platform: the participant site and
 * this host console. Both are served from this prototype so a reviewer only
 * needs one link.
 */

export interface Workspace {
  name: string;
  category: string;
  role: string;
  owner: { name: string; role: string };
  plan: 'Starter' | 'Pro' | 'Enterprise';
}

export const WORKSPACE: Workspace = {
  name: 'Waktu Luang',
  category: 'Community & Lifestyle',
  role: 'Host',
  owner: { name: 'Adriani Ajeng', role: 'Owner' },
  plan: 'Starter',
};

/** `Waktu Luang` → `WL`, for the sidebar tile. */
export const WORKSPACE_INITIALS = WORKSPACE.name
  .split(' ')
  .map((word) => word[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

export interface OrgStat {
  key: string;
  label: string;
  value: string;
  /** Growth line under the value, e.g. "20% vs last month". */
  delta?: string;
  note?: string;
  icon: 'experiences' | 'events' | 'activities' | 'registrations' | 'revenue' | 'sessions';
}

export const ORG_STATS: OrgStat[] = [
  { key: 'experiences', label: 'Total Experiences', value: '24', delta: '20% vs last month', icon: 'experiences' },
  { key: 'events', label: 'Active Events', value: '8', delta: '14% vs last month', icon: 'events' },
  { key: 'activities', label: 'Active Activities', value: '16', delta: '33% vs last month', icon: 'activities' },
  { key: 'registrations', label: 'Total Registrations', value: '1,248', delta: '18% vs last month', icon: 'registrations' },
  { key: 'revenue', label: 'Revenue (IDR)', value: 'Rp 128.450.000', delta: '22% vs last month', icon: 'revenue' },
  { key: 'sessions', label: 'Upcoming Sessions', value: '35', note: 'Next 7 days', icon: 'sessions' },
];

/** Whether the listing is visible to participants. */
export type PublishState = 'Published' | 'Draft' | 'Cancelled';

/** Where the experience sits in its own life. */
export type Lifecycle = 'Upcoming' | 'Completed' | 'Draft' | 'Cancelled';

export interface OrgExperience {
  id: string;
  title: string;
  kind: 'EVENT' | 'ACTIVITY';
  publishState: PublishState;
  lifecycle: Lifecycle;
  /** Context line under the status pill, e.g. "Starts in 3 days". */
  note: string;
  category: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  registered: number;
  capacity: number;
  revenue: number;
  photoHint: string;
}

/** Terse constructor — publish state follows from the lifecycle. */
function exp(
  id: string,
  title: string,
  kind: OrgExperience['kind'],
  category: string,
  date: string,
  start: string,
  end: string,
  venue: string,
  registered: number,
  capacity: number,
  revenue: number,
  photoHint: string,
  lifecycle: Lifecycle,
  note: string,
): OrgExperience {
  const publishState: PublishState =
    lifecycle === 'Draft' ? 'Draft' : lifecycle === 'Cancelled' ? 'Cancelled' : 'Published';
  return {
    id,
    title,
    kind,
    publishState,
    lifecycle,
    note,
    category,
    date,
    start,
    end,
    venue,
    registered,
    capacity,
    revenue,
    photoHint,
  };
}

/** 24 experiences — 8 events and 16 activities, matching the workspace KPIs. */
export const ORG_EXPERIENCES: OrgExperience[] = [
  exp('yoga-jul21', 'Morning Yoga Class', 'ACTIVITY', 'Health & Wellness', '2026-07-21', '07:00', '08:00', 'Hoople Studio, Jakarta', 24, 30, 2_450_000, 'Yoga class', 'Upcoming', 'Starts in 1 day'),
  exp('indie-jul24', 'Indie Music Night', 'EVENT', 'Music', '2026-07-24', '19:00', '23:00', 'Live House, Kemang', 156, 200, 18_760_000, 'Concert crowd', 'Upcoming', 'Starts in 4 days'),
  exp('pottery-jul25', 'Pottery Workshop', 'ACTIVITY', 'Art & Craft', '2026-07-25', '14:00', '16:00', 'Clayhouse Studio, Jakarta', 12, 15, 1_200_000, 'Pottery wheel', 'Upcoming', 'Starts in 5 days'),
  exp('flower-jul31', 'Flower Arrangement Workshop', 'ACTIVITY', 'Lifestyle', '2026-07-31', '10:00', '12:00', 'Waktu Luang Studio, Jakarta', 0, 20, 0, 'Flower arrangement', 'Draft', 'Last edited 2 days ago'),
  exp('startup-jul10', 'Startup Talk: Build & Grow', 'EVENT', 'Business', '2026-07-10', '13:00', '17:00', 'Hoople Space, Jakarta', 88, 100, 9_350_000, 'Talk on stage', 'Cancelled', 'Cancelled on 5 Jul 2026'),
  exp('latte-jul26', 'Latte Art Workshop', 'ACTIVITY', 'Food & Drink', '2026-07-26', '10:00', '12:00', 'Kopi Karya, Senopati', 6, 6, 1_080_000, 'Latte art', 'Upcoming', 'Starts in 6 days'),
  exp('design-aug01', 'Design Thinking Masterclass', 'EVENT', 'Education', '2026-08-01', '09:00', '16:00', 'Lingua Space, Menteng', 21, 24, 9_450_000, 'Workshop room', 'Upcoming', 'Starts in 12 days'),
  exp('cooking-aug02', 'Healthy Cooking Class', 'ACTIVITY', 'Food & Drink', '2026-08-02', '10:00', '12:00', 'GreenBite Kitchen, PIK', 5, 10, 1_100_000, 'Cooking class', 'Upcoming', 'Starts in 13 days'),
  exp('run-jul28', 'Evening Run Club', 'ACTIVITY', 'Sport', '2026-07-28', '18:30', '19:30', 'GBK Gate 7, Senayan', 42, 60, 0, 'Running club', 'Upcoming', 'Starts in 8 days'),
  exp('market-aug15', 'Pasar Kreatif Kemang', 'EVENT', 'Lifestyle', '2026-08-15', '11:00', '20:00', 'Waktu Luang Studio, Kemang', 0, 400, 0, 'Creative market', 'Draft', 'Last edited 5 days ago'),
  exp('tufting-aug08', 'Tufting Workshop', 'ACTIVITY', 'Art & Craft', '2026-08-08', '13:00', '17:00', 'Waktu Luang Studio, Kemang', 3, 8, 1_050_000, 'Tufting', 'Upcoming', 'Starts in 19 days'),
  exp('supper-aug09', 'GreenBite Supper Club', 'EVENT', 'Food & Drink', '2026-08-09', '18:00', '21:30', 'GreenBite Kitchen, PIK', 17, 20, 6_715_000, 'Supper club table', 'Cancelled', 'Cancelled on 12 Jul 2026'),

  exp('candle-jul05', 'Candle Making Class', 'ACTIVITY', 'Art & Craft', '2026-07-05', '15:00', '17:00', 'Waktu Luang Studio, Kemang', 12, 12, 2_400_000, 'Candle making', 'Completed', 'Ended 15 days ago'),
  exp('yoga-jul04', 'Morning Yoga Class', 'ACTIVITY', 'Health & Wellness', '2026-07-04', '07:00', '08:00', 'Hoople Studio, Jakarta', 28, 30, 3_360_000, 'Yoga class', 'Completed', 'Ended 16 days ago'),
  exp('english-jul04', 'English Conversation Club', 'ACTIVITY', 'Education', '2026-07-04', '16:00', '17:30', 'Lingua Space, Menteng', 14, 16, 1_050_000, 'Conversation table', 'Completed', 'Ended 16 days ago'),
  exp('coffee-jun28', 'Jakarta Coffee Week', 'EVENT', 'Food & Drink', '2026-06-28', '10:00', '21:00', 'Senayan Park, Jakarta', 380, 400, 28_500_000, 'Coffee festival', 'Completed', 'Ended 22 days ago'),
  exp('cooking-jun28', 'Healthy Cooking Class', 'ACTIVITY', 'Food & Drink', '2026-06-28', '10:00', '12:00', 'GreenBite Kitchen, PIK', 10, 10, 2_200_000, 'Cooking class', 'Completed', 'Ended 22 days ago'),
  exp('strength-jun23', 'Strength Training', 'ACTIVITY', 'Sport', '2026-06-23', '18:00', '19:00', 'Strive Gym, SCBD', 8, 8, 1_200_000, 'Gym floor', 'Completed', 'Ended 27 days ago'),
  exp('watercolor-jun20', 'Watercolor Basics', 'ACTIVITY', 'Art & Craft', '2026-06-20', '10:00', '11:30', 'Artify Studio, Tebet', 11, 12, 1_760_000, 'Watercolour', 'Completed', 'Ended 30 days ago'),
  exp('latte-jun16', 'Latte Art Workshop', 'ACTIVITY', 'Food & Drink', '2026-06-16', '10:00', '12:00', 'Kopi Karya, Senopati', 6, 6, 1_080_000, 'Latte art', 'Completed', 'Ended 34 days ago'),
  exp('jazz-jun13', 'Sunset Rooftop Jazz', 'EVENT', 'Music', '2026-06-13', '17:00', '22:00', 'Lantai Atas, SCBD', 210, 240, 24_150_000, 'Rooftop concert', 'Completed', 'Ended 37 days ago'),
  exp('kpop-jun07', 'K-Pop Dance Class', 'ACTIVITY', 'Music', '2026-06-07', '16:00', '17:00', 'Move Studio, Kuningan', 20, 20, 3_000_000, 'Dance studio', 'Completed', 'Ended 43 days ago'),
  exp('hatha-may31', 'Hatha Yoga for All Levels', 'ACTIVITY', 'Health & Wellness', '2026-05-31', '07:00', '08:00', 'Namaste Studio, Cipete', 16, 16, 1_600_000, 'Yoga studio', 'Completed', 'Ended 50 days ago'),
  exp('retreat-may24', 'Namaste Sunrise Retreat', 'EVENT', 'Health & Wellness', '2026-05-24', '05:30', '11:00', 'Sentul Highlands, Bogor', 54, 60, 18_360_000, 'Sunrise retreat', 'Completed', 'Ended 57 days ago'),
];

/** The count tiles above the Experiences list. */
export const EXPERIENCE_TILES = [
  { key: 'all', label: 'All Experiences', tone: 'brand' },
  { key: 'published', label: 'Published', tone: 'green' },
  { key: 'upcoming', label: 'Upcoming', tone: 'violet' },
  { key: 'completed', label: 'Completed', tone: 'blue' },
  { key: 'draft', label: 'Draft', tone: 'amber' },
  { key: 'cancelled', label: 'Cancelled', tone: 'rose' },
] as const;

export type ExperienceTileKey = (typeof EXPERIENCE_TILES)[number]['key'];

/** Counts are derived, so the tiles can never drift from the list below them. */
export function countExperiences(key: ExperienceTileKey): number {
  if (key === 'all') return ORG_EXPERIENCES.length;
  if (key === 'published') {
    return ORG_EXPERIENCES.filter((item) => item.publishState === 'Published').length;
  }
  const lifecycle = (key[0].toUpperCase() + key.slice(1)) as Lifecycle;
  return ORG_EXPERIENCES.filter((item) => item.lifecycle === lifecycle).length;
}

export const EXPERIENCE_CATEGORIES = [
  ...new Set(ORG_EXPERIENCES.map((experience) => experience.category)),
].sort();

export type RegistrationStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export interface OrgRegistration {
  id: string;
  name: string;
  email: string;
  experience: string;
  status: RegistrationStatus;
  date: string;
  time: string;
  tickets: number;
  amount: number;
  checkedIn: boolean;
}

export const ORG_REGISTRATIONS: OrgRegistration[] = [
  {
    id: 'reg-01',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@gmail.com',
    experience: 'Indie Music Night',
    status: 'Confirmed',
    date: '2026-07-20',
    time: '10:15',
    tickets: 2,
    amount: 300_000,
    checkedIn: false,
  },
  {
    id: 'reg-02',
    name: 'Raka Mahendra',
    email: 'raka.mahendra@gmail.com',
    experience: 'Morning Yoga Class',
    status: 'Confirmed',
    date: '2026-07-20',
    time: '09:42',
    tickets: 1,
    amount: 120_000,
    checkedIn: true,
  },
  {
    id: 'reg-03',
    name: 'Sofia Ananda',
    email: 'sofia.ananda@gmail.com',
    experience: 'Pottery Workshop',
    status: 'Pending',
    date: '2026-07-20',
    time: '09:20',
    tickets: 1,
    amount: 250_000,
    checkedIn: false,
  },
  {
    id: 'reg-04',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    experience: 'Design Thinking Masterclass',
    status: 'Confirmed',
    date: '2026-07-20',
    time: '08:55',
    tickets: 1,
    amount: 450_000,
    checkedIn: false,
  },
  {
    id: 'reg-05',
    name: 'Alya Putri',
    email: 'alya.putri@gmail.com',
    experience: 'Healthy Cooking Class',
    status: 'Cancelled',
    date: '2026-07-20',
    time: '08:30',
    tickets: 1,
    amount: 220_000,
    checkedIn: false,
  },
  {
    id: 'reg-06',
    name: 'Fikri Ramadhan',
    email: 'fikri.r@gmail.com',
    experience: 'Indie Music Night',
    status: 'Confirmed',
    date: '2026-07-19',
    time: '21:04',
    tickets: 4,
    amount: 600_000,
    checkedIn: false,
  },
  {
    id: 'reg-07',
    name: 'Nadia Rahmawati',
    email: 'nadia.rahma@gmail.com',
    experience: 'Latte Art Workshop',
    status: 'Confirmed',
    date: '2026-07-19',
    time: '17:38',
    tickets: 2,
    amount: 360_000,
    checkedIn: true,
  },
  {
    id: 'reg-08',
    name: 'Yudha Firmansyah',
    email: 'yudha.f@gmail.com',
    experience: 'Morning Yoga Class',
    status: 'Pending',
    date: '2026-07-19',
    time: '14:12',
    tickets: 1,
    amount: 120_000,
    checkedIn: false,
  },
  {
    id: 'reg-09',
    name: 'Clara Wijaya',
    email: 'clara.wijaya@gmail.com',
    experience: 'Pottery Workshop',
    status: 'Confirmed',
    date: '2026-07-18',
    time: '11:47',
    tickets: 3,
    amount: 750_000,
    checkedIn: false,
  },
  {
    id: 'reg-10',
    name: 'Marco Tanuwijaya',
    email: 'marco.t@gmail.com',
    experience: 'Design Thinking Masterclass',
    status: 'Confirmed',
    date: '2026-07-18',
    time: '09:05',
    tickets: 1,
    amount: 450_000,
    checkedIn: false,
  },
];

export interface OrgSession {
  id: string;
  experience: string;
  kind: 'EVENT' | 'ACTIVITY';
  date: string;
  start: string;
  end: string;
  coach: string;
  room: string;
  booked: number;
  capacity: number;
}

export const ORG_SESSIONS: OrgSession[] = [
  { id: 'ses-01', experience: 'Morning Yoga Class', kind: 'ACTIVITY', date: '2026-07-21', start: '07:00', end: '08:00', coach: 'Sekar', room: 'Main Studio', booked: 24, capacity: 30 },
  { id: 'ses-02', experience: 'Pottery Workshop', kind: 'ACTIVITY', date: '2026-07-21', start: '14:00', end: '16:00', coach: 'Rani', room: 'Studio A', booked: 9, capacity: 12 },
  { id: 'ses-03', experience: 'Latte Art Workshop', kind: 'ACTIVITY', date: '2026-07-23', start: '10:00', end: '12:00', coach: 'Bagas', room: 'Training Bar', booked: 6, capacity: 6 },
  { id: 'ses-04', experience: 'Indie Music Night', kind: 'EVENT', date: '2026-07-24', start: '19:00', end: '23:00', coach: 'Front of house', room: 'Live House', booked: 156, capacity: 200 },
  { id: 'ses-05', experience: 'Pottery Workshop', kind: 'ACTIVITY', date: '2026-07-25', start: '14:00', end: '16:00', coach: 'Kevin', room: 'Studio B', booked: 12, capacity: 15 },
  { id: 'ses-06', experience: 'Morning Yoga Class', kind: 'ACTIVITY', date: '2026-07-27', start: '07:00', end: '08:00', coach: 'Gita', room: 'Main Studio', booked: 18, capacity: 30 },
  { id: 'ses-07', experience: 'Healthy Cooking Class', kind: 'ACTIVITY', date: '2026-08-02', start: '10:00', end: '12:00', coach: 'Chef Alit', room: 'Main Kitchen', booked: 5, capacity: 10 },
];

export type PayoutStatus = 'Paid' | 'Scheduled' | 'On hold';

export interface Payout {
  id: string;
  experience: string;
  settledOn: string;
  gross: number;
  platformFee: number;
  gatewayFee: number;
  net: number;
  status: PayoutStatus;
}

export const PAYOUTS: Payout[] = [
  { id: 'PO-260719-01', experience: 'Indie Music Night', settledOn: '2026-07-25', gross: 23_400_000, platformFee: 702_000, gatewayFee: 421_200, net: 22_276_800, status: 'Scheduled' },
  { id: 'PO-260718-02', experience: 'Pottery Workshop', settledOn: '2026-07-26', gross: 3_000_000, platformFee: 90_000, gatewayFee: 54_000, net: 2_856_000, status: 'Scheduled' },
  { id: 'PO-260706-03', experience: 'Candle Making Class', settledOn: '2026-07-06', gross: 2_400_000, platformFee: 72_000, gatewayFee: 43_200, net: 2_284_800, status: 'Paid' },
  { id: 'PO-260628-04', experience: 'Jakarta Coffee Week', settledOn: '2026-06-29', gross: 28_500_000, platformFee: 855_000, gatewayFee: 513_000, net: 27_132_000, status: 'Paid' },
  { id: 'PO-260615-05', experience: 'Sunset Rooftop Jazz', settledOn: '2026-06-16', gross: 24_150_000, platformFee: 724_500, gatewayFee: 434_700, net: 22_990_800, status: 'Paid' },
  { id: 'PO-260601-06', experience: 'Design Thinking Masterclass', settledOn: '—', gross: 9_450_000, platformFee: 283_500, gatewayFee: 170_100, net: 8_996_400, status: 'On hold' },
];

/** Six months of registrations and revenue, for the Analytics bars. */
export const ANALYTICS_MONTHS = [
  { month: 'Feb', registrations: 118, revenue: 14_200_000 },
  { month: 'Mar', registrations: 164, revenue: 19_800_000 },
  { month: 'Apr', registrations: 142, revenue: 17_100_000 },
  { month: 'May', registrations: 203, revenue: 24_600_000 },
  { month: 'Jun', registrations: 258, revenue: 27_300_000 },
  { month: 'Jul', registrations: 363, revenue: 25_450_000 },
];

export const TOP_EXPERIENCES = [
  { title: 'Indie Music Night', registrations: 412, share: 100 },
  { title: 'Morning Yoga Class', registrations: 286, share: 69 },
  { title: 'Pottery Workshop', registrations: 214, share: 52 },
  { title: 'Design Thinking Masterclass', registrations: 168, share: 41 },
  { title: 'Latte Art Workshop', registrations: 96, share: 23 },
];

export const TRAFFIC_SOURCES = [
  { source: 'Hoople Discover', share: 42 },
  { source: 'Instagram', share: 27 },
  { source: 'WhatsApp (Connect)', share: 18 },
  { source: 'Direct link', share: 13 },
];
