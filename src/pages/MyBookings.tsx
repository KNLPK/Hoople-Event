import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import {
  Bolt,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Funnel,
  Grid,
  MapPin,
  Ticket,
} from '@/components/ui/icons';
import { longDate, timeRange } from '@/lib/format';
import { useBookings } from '@/store/bookings';
import type { Booking, BookingStatus } from '@/data/types';

const TABS: BookingStatus[] = ['Confirmed', 'Completed', 'Cancelled'];
const TAB_LABEL: Record<BookingStatus, string> = {
  Confirmed: 'Upcoming',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

const PAGE_SIZE = 3;

const SORTS = ['Soonest first', 'Most recent booking', 'Price: high to low'] as const;

export function MyBookings() {
  const { byStatus } = useBookings();
  const [tab, setTab] = useState<BookingStatus>('Confirmed');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<string>(SORTS[0]);

  const inTab = [...byStatus(tab)].sort((a, b) => {
    if (sort === 'Price: high to low') return b.total - a.total;
    if (sort === 'Most recent booking') return b.orderId.localeCompare(a.orderId);
    return a.date.localeCompare(b.date);
  });
  const shown = inTab.slice(0, visible);

  function switchTab(next: BookingStatus) {
    setTab(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="container bookings-layout" style={{ paddingTop: 36 }}>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 18 }}>
          My Bookings
        </h1>

        <div
          className="row row--between"
          style={{ borderBottom: '1px solid var(--line)', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}
        >
          <div className="tabs">
            {TABS.map((status) => (
              <button
                key={status}
                type="button"
                className={`tabs__tab ${tab === status ? 'is-active' : ''}`.trim()}
                onClick={() => switchTab(status)}
              >
                {TAB_LABEL[status]} ({byStatus(status).length})
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Button
              as="button"
              variant="neutral"
              style={{ height: 40 }}
              onClick={() => setFilterOpen((open) => !open)}
            >
              <Funnel size={16} color="#5C5B6B" strokeWidth={1.9} />
              {sort}
              <ChevronDown size={14} color="#8B8A99" className={filterOpen ? 'is-flipped' : undefined} />
            </Button>
            {filterOpen ? (
              <div
                className="panel"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 46,
                  zIndex: 20,
                  padding: 8,
                  width: 220,
                  boxShadow: 'var(--sh-panel)',
                  animation: 'hp-pop .2s ease both',
                }}
              >
                {SORTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSort(option);
                      setFilterOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      border: 0,
                      background: option === sort ? 'var(--brand-tint)' : 'transparent',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontFamily: 'inherit',
                      fontSize: 13.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {option}
                    {option === sort ? <Check size={14} color="#6D28FF" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, marginBottom: 14 }}>
          {TAB_LABEL[tab]} Bookings
        </div>

        {shown.length ? (
          shown.map((booking, index) => (
            <Reveal key={booking.id} delay={Math.min(index, 3) * 50}>
              <BookingCard booking={booking} />
            </Reveal>
          ))
        ) : (
          <div className="empty">
            <div className="empty__title">Nothing here yet</div>
            <p className="empty__body">
              You have no {TAB_LABEL[tab].toLowerCase()} bookings. Find something worth showing up for.
            </p>
            <Button as="link" to="/activities" variant="primary">
              Explore activities
            </Button>
          </div>
        )}

        {visible < inTab.length ? (
          <div className="row" style={{ justifyContent: 'center', marginTop: 26 }}>
            <Button as="button" variant="neutral" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
              Load More
              <ChevronDown size={15} color="#8B8A99" strokeWidth={2} />
            </Button>
          </div>
        ) : null}
      </div>

      <aside className="stack" style={{ gap: 22 }}>
        <div className="panel">
          <div className="panel__title panel__title--sm">Booking Summary</div>
          {TABS.map((status) => (
            <button key={status} type="button" className="summary-row" onClick={() => switchTab(status)}>
              <span className="summary-row__label">{TAB_LABEL[status]}</span>
              <span className="summary-row__value">
                {byStatus(status).length}
                <ChevronRight size={14} color="#B4B2C0" strokeWidth={2} />
              </span>
            </button>
          ))}

          <div className="tint-panel--soft" style={{ marginTop: 18, display: 'flex', gap: 13 }}>
            <Calendar size={22} color="#6D28FF" strokeWidth={1.7} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>
                Need help with your booking?
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--grey)', lineHeight: 1.6 }}>
                Visit our Help Center or contact our support team.
              </div>
              <Link
                to="/help"
                className="link-more"
                style={{ fontSize: 12.5, marginTop: 9, display: 'inline-flex' }}
              >
                Go to Help Center →
              </Link>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__title panel__title--sm">Quick Tips</div>
          {[
            {
              Icon: Clock,
              tone: '',
              colour: '#6D28FF',
              title: 'Arrive on time',
              body: 'We recommend arriving 15 minutes before the experience starts.',
            },
            {
              Icon: Grid,
              tone: 'icon-tile--green',
              colour: '#16A34A',
              title: 'Bring your ticket',
              body: 'Show your QR code to the staff for check-in.',
            },
            {
              Icon: Bolt,
              tone: 'icon-tile--amber',
              colour: '#EA8C00',
              title: 'Have fun!',
              body: "Enjoy your experience and don't forget to share your moments!",
            },
          ].map(({ Icon, tone, colour, title, body }) => (
            <div key={title} className="feature" style={{ marginBottom: 18 }}>
              <span className={`icon-tile ${tone}`.trim()}>
                <Icon size={17} color={colour} strokeWidth={1.8} />
              </span>
              <div>
                <div className="feature__title">{title}</div>
                <div className="feature__body">{body}</div>
              </div>
            </div>
          ))}
          <Button as="link" to="/activities" variant="neutral" block style={{ height: 48, justifyContent: 'space-between' }}>
            Explore More Experiences
            <ChevronRight size={16} color="#8B8A99" strokeWidth={2} />
          </Button>
        </div>
      </aside>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const isActivity = booking.kind === 'ACTIVITY';
  return (
    <article className="booking-card">
      <div className="booking-card__media zoom">
        <ImageSlot
          id={`booking-${booking.id}`}
          shape="rounded"
          radius={12}
          placeholder={booking.photoHint}
        />
      </div>

      <div>
        <span className={`tag ${isActivity ? 'tag--green' : ''}`.trim()}>
          {isActivity ? 'Activity' : 'Event'}
        </span>
        <Link to={`/activities/${booking.slug}`} className="booking-card__title">
          {booking.title}
        </Link>
        <div className="booking-card__host">Hosted by {booking.host}</div>
        <div className="stack" style={{ gap: 9 }}>
          <span className="meta">
            <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
            {longDate(booking.date)}
          </span>
          <span className="meta">
            <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
            {timeRange(booking.start, booking.end)}
          </span>
          <span className="meta">
            <MapPin size={15} color="#8B8A99" strokeWidth={1.9} />
            {booking.venueName}, {booking.venueArea}, {booking.venueCity}
          </span>
        </div>
      </div>

      <div className="booking-card__side">
        <StatusPill status={booking.status} />

        <div className="ticket-block">
          <Ticket size={18} color="#5C5B6B" strokeWidth={1.8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              {booking.participants.length}{' '}
              {booking.participants.length === 1 ? 'Ticket' : 'Tickets'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey)', marginTop: 2 }}>{booking.ticketType}</div>
          </div>
          <ChevronRight size={15} color="#B4B2C0" strokeWidth={2} />
        </div>

        {booking.status === 'Confirmed' ? (
          <Button as="link" to={`/bookings/${booking.id}`} variant="outline" style={{ height: 44 }}>
            View E-Ticket
            <Grid size={16} strokeWidth={2} />
          </Button>
        ) : null}

        <Link
          to={`/activities/${booking.slug}`}
          className="link-more"
          style={{ alignSelf: 'flex-end', marginTop: 'auto', fontSize: 13.5 }}
        >
          View Details
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  if (status === 'Confirmed') {
    return (
      <span className="tag tag--status" style={{ alignSelf: 'flex-start' }}>
        Confirmed <Check size={13} />
      </span>
    );
  }
  if (status === 'Completed') {
    return (
      <span
        className="tag"
        style={{
          alignSelf: 'flex-start',
          background: 'var(--surface-chip)',
          color: 'var(--ink-2)',
          fontSize: 12,
          padding: '6px 12px',
        }}
      >
        Completed <Check size={13} />
      </span>
    );
  }
  return (
    <span
      className="tag"
      style={{
        alignSelf: 'flex-start',
        background: '#FDECEF',
        color: '#B4123B',
        fontSize: 12,
        padding: '6px 12px',
      }}
    >
      Cancelled
    </span>
  );
}
