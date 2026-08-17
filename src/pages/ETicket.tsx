import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { MiniCard } from '@/components/cards/MiniCard';
import { Rail } from '@/components/ui/Rail';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowRight,
  Bag,
  Calendar,
  Card,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Headset,
  Info,
  Lock,
  MapPin,
  Share,
  ShieldCheck,
  Ticket,
  Users,
} from '@/components/ui/icons';
import { ACTIVITIES, getActivity } from '@/data/activities';
import { useBookings } from '@/store/bookings';
import { compactDate, longDate, timeRange } from '@/lib/format';
import { copyText } from '@/lib/clipboard';

/** Full e-ticket, reached from My Bookings → View E-Ticket. */
export function ETicket() {
  const { id } = useParams();
  const { getBooking } = useBookings();
  const toast = useToast();

  const booking = getBooking(id);
  if (!booking) return <Navigate to="/bookings" replace />;

  const activity = getActivity(booking.slug);
  const suggestions = ACTIVITIES.filter((item) => item.slug !== booking.slug).slice(0, 3);

  return (
    <>
      <div className="container" style={{ paddingTop: 28 }}>
        <div className="row row--between" style={{ gap: 16, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 12, fontSize: 13.5, color: 'var(--grey)' }}>
            <Link to="/bookings" style={{ fontWeight: 500 }}>
              My Bookings
            </Link>
            <ChevronRight size={14} color="#B4B2C0" strokeWidth={2} />
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>E-Ticket Details</span>
          </div>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 13,
              color: 'var(--ink-muted)',
              border: 0,
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={() => {
              void copyText(booking.orderId);
              toast('Booking ID copied');
            }}
          >
            Booking ID: <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{booking.orderId}</strong>
            <Copy size={15} color="#8B8A99" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 22 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 14 }}>
          E-Ticket Details
        </h1>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          <span className="tag tag--status" style={{ fontSize: 12.5, padding: '6px 13px' }}>
            {booking.status} <Check size={13} />
          </span>
          <span style={{ fontSize: 13.5, color: 'var(--ink-muted)' }}>
            You're all set! Show this e-ticket at the entrance.
          </span>
        </div>
      </div>

      <div className="container ticket-layout" style={{ paddingTop: 24 }}>
        <Reveal className="panel panel--flush">
          <div className="ticket-head">
            <div className="ticket-head__media zoom">
              <ImageSlot
                id={`eticket-photo-${booking.id}`}
                shape="rounded"
                radius={12}
                placeholder={booking.photoHint}
              />
            </div>

            <div>
              <span className="tag tag--caps">{booking.kind}</span>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  margin: '12px 0 6px',
                }}
              >
                {booking.title}
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 18 }}>
                Hosted by {booking.host}
              </div>
              <div className="stack" style={{ gap: 11 }}>
                <span className="meta" style={{ fontSize: 13.5 }}>
                  <Calendar size={16} color="#8B8A99" strokeWidth={1.9} />
                  {longDate(booking.date)}
                </span>
                <span className="meta" style={{ fontSize: 13.5 }}>
                  <Clock size={16} color="#8B8A99" strokeWidth={1.9} />
                  {timeRange(booking.start, booking.end)}
                </span>
                <span className="meta meta--top" style={{ fontSize: 13.5 }}>
                  <MapPin size={16} color="#8B8A99" strokeWidth={1.9} style={{ marginTop: 2 }} />
                  <span style={{ lineHeight: 1.6 }}>
                    {booking.venueName}, {booking.venueArea}
                    <br />
                    {booking.venueCity}
                  </span>
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${booking.venueName} ${booking.venueArea} ${booking.venueCity}`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="link-more"
                style={{ marginTop: 14, fontSize: 13.5 }}
              >
                View Location
                <ChevronRight size={14} strokeWidth={2} />
              </a>
            </div>

            <div className="ticket-head__qr">
              <div style={{ fontSize: 12.5, color: 'var(--grey)', marginBottom: 12 }}>
                Scan this QR code for check-in
              </div>
              <div className="ticket-head__qr-frame">
                <ImageSlot id={`eticket-qr-${booking.id}`} shape="rounded" radius={12} placeholder="QR code" />
              </div>
            </div>
          </div>

          <div className="ticket-section">
            <div className="row row--between" style={{ marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
              <div className="eyebrow">Ticket Information</div>
              <span
                className="row"
                style={{
                  gap: 9,
                  border: '1.5px solid var(--brand-border)',
                  color: 'var(--brand-deep)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 15px',
                  borderRadius: 9,
                }}
              >
                <Ticket size={15} strokeWidth={1.8} />
                {booking.participants.length} of {booking.participants.length}{' '}
                {booking.participants.length === 1 ? 'Ticket' : 'Tickets'}
              </span>
            </div>
            <div className="definition-grid">
              <dl className="definition">
                <dt>Ticket Type</dt>
                <dd>{booking.ticketType}</dd>
              </dl>
              <dl className="definition">
                <dt>Total Paid</dt>
                <dd>{booking.total === 0 ? 'Free' : `IDR ${booking.total.toLocaleString('en-US')}`}</dd>
              </dl>
              <dl className="definition">
                <dt>Ticket ID</dt>
                <dd>{booking.ticketId}</dd>
              </dl>
              <dl className="definition">
                <dt>Order ID</dt>
                <dd>{booking.orderId}</dd>
              </dl>
              <dl className="definition">
                <dt>Purchase Date</dt>
                <dd>{booking.paidAt}</dd>
              </dl>
              <dl className="definition">
                <dt>Payment Method</dt>
                <dd>{booking.paymentMethod}</dd>
              </dl>
            </div>
          </div>

          <div className="ticket-section">
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Attendee
            </div>
            <div className="definition-grid">
              <dl className="definition">
                <dt>Name</dt>
                <dd>{booking.participants[0].name}</dd>
              </dl>
              <dl className="definition">
                <dt>Booked by</dt>
                <dd>{booking.buyer.name}</dd>
              </dl>
              <dl className="definition">
                <dt>Email</dt>
                <dd>{booking.participants[0].email || booking.buyer.email}</dd>
              </dl>
              <dl className="definition">
                <dt>Phone</dt>
                <dd>{booking.participants[0].phone || booking.buyer.phone}</dd>
              </dl>
            </div>
            <div
              className="tint-panel--soft"
              style={{
                marginTop: 20,
                background: '#F6F4FD',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                fontSize: 13,
              }}
            >
              <Info size={17} color="#6D28FF" strokeWidth={1.9} />
              Please arrive 15 minutes before the experience starts.
            </div>
          </div>

          <div className="ticket-section">
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              About the {booking.kind === 'EVENT' ? 'Event' : 'Activity'}
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--ink-3)', marginBottom: 22 }}>
              {activity?.summary ??
                'Show this QR code at the entrance and the host will check you in.'}
            </p>
            <div className="grid grid--3" style={{ gap: 24 }}>
              <div className="feature">
                <span className="icon-tile">
                  <Bag size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="feature__title">What to Bring</div>
                  <div className="feature__body">
                    {activity ? `${activity.bring[0].title} ${activity.bring[0].detail}.` : 'Just bring yourself.'}
                  </div>
                </div>
              </div>
              <div className="feature">
                <span className="icon-tile">
                  <Users size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="feature__title">For Any Questions</div>
                  <div className="feature__body">Contact the host or our support team.</div>
                </div>
              </div>
              <div className="feature">
                <span className="icon-tile">
                  <ShieldCheck size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="feature__title">Refund Policy</div>
                  <div className="feature__body">
                    This ticket is refundable up to 24 hours before it starts.
                  </div>
                  <Link to="/help" style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <aside className="stack" style={{ gap: 22 }}>
          <div className="panel">
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Ticket Actions
            </div>
            <button type="button" className="ticket-action" onClick={() => toast('Added to your calendar')}>
              <Calendar size={20} color="#5B21F5" strokeWidth={1.8} />
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Add to Calendar</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--grey)', marginTop: 3 }}>
                  Google Calendar, iCal, Outlook
                </span>
              </span>
            </button>
            <button
              type="button"
              className="ticket-action"
              onClick={() => toast('E-ticket PDF is on its way to your inbox')}
            >
              <Download size={20} color="#5B21F5" strokeWidth={1.8} />
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Download E-Ticket</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--grey)', marginTop: 3 }}>
                  Save as PDF
                </span>
              </span>
            </button>
            <button
              type="button"
              className="ticket-action"
              onClick={() => {
                void copyText(window.location.href);
                toast('Ticket link copied to your clipboard');
              }}
            >
              <Share size={20} color="#5B21F5" strokeWidth={1.8} />
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Share E-Ticket</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--grey)', marginTop: 3 }}>
                  Send to your friends
                </span>
              </span>
            </button>
            <Link to="/bookings" className="ticket-action">
              <Card size={20} color="#5B21F5" strokeWidth={1.8} />
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>View Booking Details</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--grey)', marginTop: 3 }}>
                  See payment and booking info
                </span>
              </span>
            </Link>
          </div>

          <div className="panel">
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Attendee ({booking.participants.length})
            </div>
            <div className="stack" style={{ gap: 14 }}>
              {booking.participants.map((participant, index) => (
                <div key={`${participant.name}-${index}`} className="row" style={{ gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}>
                    <ImageSlot id={`attendee-${booking.id}-${index}`} shape="circle" placeholder="" />
                  </div>
                  <div>
                    <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600 }}>{participant.name}</span>
                      {index === 0 ? (
                        <span className="tag" style={{ fontSize: 10.5, padding: '4px 9px' }}>
                          Primary Attendee
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--grey)', marginTop: 4 }}>
                      {participant.email || booking.buyer.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Need Help?
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.7, marginBottom: 16 }}>
              Visit our Help Center or contact our support team.
            </div>
            <Button as="link" to="/help" variant="ghost" block style={{ height: 46 }}>
              <Headset size={17} strokeWidth={1.8} />
              Go to Help Center →
            </Button>
          </div>
        </aside>
      </div>

      <Reveal className="container section--tight">
        <div className="explore-banner">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}
            >
              Explore More Amazing Experiences
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 20 }}>
              Discover more events and activities that inspire you.
            </div>
            <Button as="link" to="/discover" variant="primary" style={{ height: 46, borderRadius: 11 }}>
              Explore Experiences
              <ArrowRight size={16} strokeWidth={2} />
            </Button>
          </div>
          <Rail perView={4} gap={18} label="More experiences" arrowTop={40}>
            {suggestions.map((item) => (
              <MiniCard
                key={item.slug}
                to={`/activities/${item.slug}`}
                slotId={`eticket-suggest-${item.slug}`}
                photoHint={item.photoHint}
                kicker={item.category}
                title={item.title}
                date={booking.date}
                price={item.priceFrom}
              />
            ))}
          </Rail>
        </div>
      </Reveal>

      <div
        className="container section--tight"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontSize: 13,
          color: 'var(--grey)',
        }}
      >
        <Lock size={15} color="#8B8A99" strokeWidth={1.9} />
        This is a unique e-ticket for {compactDate(booking.date)}. Do not share this QR code with others.
      </div>
    </>
  );
}
