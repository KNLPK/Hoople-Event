import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Booking, BookingStatus, Participant } from '@/data/types';
import { priceBreakdown } from '@/data/pricing';

/**
 * The booking ledger.
 *
 * This is a stakeholder prototype: nothing is verified server-side. Checkout
 * writes straight in here, and My Bookings and the e-ticket read back out, so
 * the whole Activities → Book → Pay → Ticket loop holds together across
 * reloads.
 */

const STORAGE_KEY = 'hoople.bookings';

const BUYER: Participant = {
  name: 'Adriani Ajeng',
  email: 'adriani.ajeng@gmail.com',
  phone: '+62 812 3456 7890',
};

function seedBooking(
  id: string,
  slug: string,
  title: string,
  host: string,
  kind: Booking['kind'],
  date: string,
  start: string,
  end: string,
  venueName: string,
  venueArea: string,
  venueCity: string,
  photoHint: string,
  unitPrice: number,
  status: BookingStatus,
  paidAt: string,
): Booking {
  const money = priceBreakdown(unitPrice, 1);
  const shortCode = id.slice(-4);
  return {
    id,
    orderId: id,
    ticketId: `TKT-${shortCode}-01`,
    slug,
    title,
    host,
    kind,
    ticketType: 'Regular Ticket',
    date,
    start,
    end,
    venueName,
    venueArea,
    venueCity,
    photoHint,
    participants: [BUYER],
    buyer: BUYER,
    status,
    paymentMethod: 'QRIS',
    paidAt,
    ...money,
  };
}

const SEED_BOOKINGS: Booking[] = [
  seedBooking(
    'HOOP-260719-8KZ7',
    'pottery-class',
    'Pottery Class',
    'Waktu Luang',
    'ACTIVITY',
    '2026-07-20',
    '14:00',
    '16:00',
    'Waktu Luang Studio',
    'Kemang',
    'Jakarta Selatan',
    'Pottery',
    250_000,
    'Confirmed',
    '19 Jul 2026, 14:32 WIB',
  ),
  seedBooking(
    'HOOP-260718-3QM2',
    'latte-art-workshop',
    'Latte Art Workshop',
    'Kopi Karya',
    'ACTIVITY',
    '2026-07-25',
    '10:00',
    '12:00',
    'Kopi Karya',
    'Senopati',
    'Jakarta Selatan',
    'Latte art',
    180_000,
    'Confirmed',
    '18 Jul 2026, 09:04 WIB',
  ),
  seedBooking(
    'HOOP-260717-5TW9',
    'morning-yoga-flow',
    'Morning Yoga Flow',
    'Flow with Me',
    'ACTIVITY',
    '2026-08-03',
    '07:00',
    '08:00',
    'Flow with Me Studio',
    'Senopati',
    'Jakarta Selatan',
    'Yoga',
    120_000,
    'Confirmed',
    '17 Jul 2026, 20:11 WIB',
  ),

  seedBooking(
    'HOOP-260705-1AB4',
    'english-conversation-club',
    'English Conversation Club',
    'Lingua Space Menteng',
    'ACTIVITY',
    '2026-07-04',
    '16:00',
    '17:30',
    'Lingua Space Menteng',
    'Menteng',
    'Jakarta Pusat',
    'Conversation',
    75_000,
    'Completed',
    '3 Jul 2026, 11:20 WIB',
  ),
  seedBooking(
    'HOOP-260628-9PL1',
    'healthy-cooking-class',
    'Healthy Cooking Class',
    'GreenBite Kitchen PIK',
    'ACTIVITY',
    '2026-06-28',
    '10:00',
    '12:00',
    'GreenBite Kitchen PIK',
    'PIK',
    'Jakarta Utara',
    'Cooking',
    220_000,
    'Completed',
    '26 Jun 2026, 08:45 WIB',
  ),
  seedBooking(
    'HOOP-260620-4KD8',
    'strength-training',
    'Strength Training',
    'Strive Gym SCBD',
    'ACTIVITY',
    '2026-06-23',
    '18:00',
    '19:00',
    'Strive Gym SCBD',
    'SCBD',
    'Jakarta Selatan',
    'Gym',
    150_000,
    'Completed',
    '20 Jun 2026, 19:02 WIB',
  ),
  seedBooking(
    'HOOP-260614-7RN3',
    'candle-making-class',
    'Candle Making Class',
    'Waktu Luang',
    'ACTIVITY',
    '2026-06-14',
    '15:00',
    '17:00',
    'Waktu Luang Studio',
    'Kemang',
    'Jakarta Selatan',
    'Candles',
    200_000,
    'Completed',
    '12 Jun 2026, 13:38 WIB',
  ),
  seedBooking(
    'HOOP-260607-2XC6',
    'watercolor-basics',
    'Watercolor Basics',
    'Artify Studio',
    'ACTIVITY',
    '2026-06-06',
    '10:00',
    '11:30',
    'Artify Studio',
    'Tebet',
    'Jakarta Selatan',
    'Watercolour',
    160_000,
    'Completed',
    '5 Jun 2026, 16:50 WIB',
  ),
  seedBooking(
    'HOOP-260530-8HG5',
    'evening-run-club',
    'Evening Run Club',
    'Waktu Luang Run',
    'ACTIVITY',
    '2026-05-29',
    '18:30',
    '19:30',
    'GBK Main Stadium — Gate 7',
    'Senayan',
    'Jakarta Pusat',
    'Running',
    0,
    'Completed',
    '29 May 2026, 12:15 WIB',
  ),
  seedBooking(
    'HOOP-260523-6VB2',
    'kpop-dance-class',
    'K-Pop Dance Class',
    'Move Studio',
    'ACTIVITY',
    '2026-05-24',
    '16:00',
    '17:00',
    'Move Studio',
    'Kuningan',
    'Jakarta Selatan',
    'Dance',
    150_000,
    'Completed',
    '23 May 2026, 10:07 WIB',
  ),
  seedBooking(
    'HOOP-260516-3ZQ7',
    'hatha-yoga',
    'Hatha Yoga for All Levels',
    'Namaste Studio',
    'ACTIVITY',
    '2026-05-18',
    '07:00',
    '08:00',
    'Namaste Studio',
    'Cipete',
    'Jakarta Selatan',
    'Yoga',
    100_000,
    'Completed',
    '16 May 2026, 21:30 WIB',
  ),

  seedBooking(
    'HOOP-260702-0MN9',
    'tufting-workshop',
    'Tufting Workshop',
    'Waktu Luang',
    'ACTIVITY',
    '2026-07-11',
    '13:00',
    '17:00',
    'Waktu Luang Studio',
    'Kemang',
    'Jakarta Selatan',
    'Tufting',
    350_000,
    'Cancelled',
    '2 Jul 2026, 15:12 WIB',
  ),
];

/** Everything checkout needs to know to write a booking. */
export interface NewBookingInput {
  slug: string;
  title: string;
  host: string;
  kind: Booking['kind'];
  ticketType: string;
  date: string;
  start: string;
  end: string;
  venueName: string;
  venueArea: string;
  venueCity: string;
  photoHint: string;
  unitPrice: number;
  participants: Participant[];
  buyer: Participant;
  paymentMethod: string;
}

interface BookingsValue {
  bookings: Booking[];
  byStatus: (status: BookingStatus) => Booking[];
  getBooking: (id: string | undefined) => Booking | undefined;
  createBooking: (input: NewBookingInput) => Booking;
  cancelBooking: (id: string) => void;
}

const BookingsContext = createContext<BookingsValue | null>(null);

export function useBookings(): BookingsValue {
  const value = useContext(BookingsContext);
  if (!value) throw new Error('useBookings must be used inside <BookingsProvider>');
  return value;
}

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeOrderId(): string {
  const now = new Date();
  const stamp = [
    `${now.getFullYear()}`.slice(2),
    `${now.getMonth() + 1}`.padStart(2, '0'),
    `${now.getDate()}`.padStart(2, '0'),
  ].join('');
  const suffix = Array.from(
    { length: 4 },
    () => ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)],
  ).join('');
  return `HOOP-${stamp}-${suffix}`;
}

function readStored(): Booking[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : null;
  } catch {
    return null;
  }
}

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => readStored() ?? SEED_BOOKINGS);

  const persist = useCallback((next: Booking[]) => {
    setBookings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Storage is optional — the session still works without it. */
    }
  }, []);

  const createBooking = useCallback(
    (input: NewBookingInput): Booking => {
      const orderId = makeOrderId();
      const money = priceBreakdown(input.unitPrice, input.participants.length);
      const now = new Date();
      const booking: Booking = {
        id: orderId,
        orderId,
        ticketId: `TKT-${orderId.slice(-4)}-01`,
        slug: input.slug,
        title: input.title,
        host: input.host,
        kind: input.kind,
        ticketType: input.ticketType,
        date: input.date,
        start: input.start,
        end: input.end,
        venueName: input.venueName,
        venueArea: input.venueArea,
        venueCity: input.venueCity,
        photoHint: input.photoHint,
        participants: input.participants,
        buyer: input.buyer,
        status: 'Confirmed',
        paymentMethod: input.paymentMethod,
        paidAt: `${now.getDate()} ${now.toLocaleString('en-GB', { month: 'short' })} ${now.getFullYear()}, ${now
          .toTimeString()
          .slice(0, 5)} WIB`,
        ...money,
      };
      persist([booking, ...bookings]);
      return booking;
    },
    [bookings, persist],
  );

  const cancelBooking = useCallback(
    (id: string) => {
      persist(
        bookings.map((booking) =>
          booking.id === id ? { ...booking, status: 'Cancelled' as BookingStatus } : booking,
        ),
      );
    },
    [bookings, persist],
  );

  const value = useMemo<BookingsValue>(
    () => ({
      bookings,
      byStatus: (status) => bookings.filter((booking) => booking.status === status),
      getBooking: (id) => (id ? bookings.find((booking) => booking.id === id) : undefined),
      createBooking,
      cancelBooking,
    }),
    [bookings, createBooking, cancelBooking],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}
