import { Link, Navigate, useParams } from 'react-router-dom';
import { BookBar } from '@/components/layout/BookBar';
import { DarkHero } from '@/components/layout/DarkHero';
import { EventCard } from '@/components/cards/EventCard';
import { Button } from '@/components/ui/Button';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { HeartButton } from '@/components/ui/HeartButton';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Rail } from '@/components/ui/Rail';
import { Reveal } from '@/components/ui/Reveal';
import { Schedule } from '@/components/ui/Schedule';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  Headset,
  Info,
  MapPin,
  ShieldCheck,
  Users,
} from '@/components/ui/icons';
import { EVENTS, EVENT_BY_SLUG } from '@/data/events';
import { priceBreakdown } from '@/data/pricing';
import { compactDate, idr, longDate, rupiah, timeRange } from '@/lib/format';

/** Detail + checkout entry for a one-time event. */
export function EventDetail() {
  const { slug } = useParams();
  const toast = useToast();
  const event = slug ? EVENT_BY_SLUG.get(slug) : undefined;

  if (!event) return <Navigate to="/events" replace />;

  const money = priceBreakdown(event.price, 1);
  const related = EVENTS.filter((item) => item.slug !== event.slug);

  return (
    <>
      <DarkHero slotId={`event-hero-${event.slug}`} photoHint={event.photoHint}>
        <div className="detail-hero detail-hero__copy">
          <Link to="/events" className="detail-hero__back">
            <ArrowLeft size={18} color="#fff" />
            Back to events
          </Link>
          <div>
            <span className="badge">{event.category}</span>
          </div>
          <h1>{event.title}</h1>
          <div className="font-heading text-[24px] font-semibold mb-[18px] to-900:text-[19px]">by {event.host}</div>
          <div className="flex items-center gap-3.5 text-[15px] font-medium mb-[26px] flex-wrap">
            <span className="flex items-center" style={{ gap: 8 }}>
              <Calendar size={17} color="#fff" strokeWidth={1.9} />
              {longDate(event.date)}
            </span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span className="flex items-center" style={{ gap: 8 }}>
              <Users size={17} color="#fff" />
              {event.going}
            </span>
          </div>
          <p className="detail-hero__summary">{event.summary}</p>
          <div className="flex items-center" style={{ gap: 14, flexWrap: 'wrap' }}>
            <Button as="link" to={`/booking?event=${event.slug}`} variant="primary" size="xl" halo>
              {event.price === 0 ? 'Register free' : `Get tickets — ${rupiah(event.price)}`}
            </Button>
            <HeartButton kind="event" slug={event.slug} label={event.title} />
          </div>
        </div>
      </DarkHero>

      <div className="mx-auto w-full max-w-page px-gutter ticket-layout" style={{ paddingTop: 38 }}>
        <div className="flex flex-col" style={{ gap: 22 }}>
          <Reveal className="panel panel--lg">
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>About this event</h2>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--color-ink-3)', marginBottom: 26 }}>
              {event.summary} Doors open 30 minutes before the start time — bring your QR e-ticket and a photo
              ID matching the name on the booking.
            </p>

            <div className="grid grid--3" style={{ gap: 24 }}>
              <div className="flex gap-[13px]">
                <span className="icon-tile">
                  <Calendar size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold mb-[5px]">Date</div>
                  <div className="text-[12.5px] text-grey leading-[1.6]">{longDate(event.date)}</div>
                </div>
              </div>
              <div className="flex gap-[13px]">
                <span className="icon-tile">
                  <Clock size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold mb-[5px]">Time</div>
                  <div className="text-[12.5px] text-grey leading-[1.6]">{timeRange(event.start, event.end)}</div>
                </div>
              </div>
              <div className="flex gap-[13px]">
                <span className="icon-tile">
                  <MapPin size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold mb-[5px]">Venue</div>
                  <div className="text-[12.5px] text-grey leading-[1.6]">
                    {event.venueName}, {event.area}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="panel panel--lg" delay={60}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>Schedule</h2>
              <span style={{ fontSize: 13, color: 'var(--color-grey)' }}>
                {timeRange(event.start, event.end)}
              </span>
            </div>
            <Schedule items={event.schedule} />
          </Reveal>

          <Reveal className="panel panel--lg" delay={120}>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Location</h2>
            <div className="border border-[#eae7f3] rounded-xl overflow-hidden bg-[#fff]">
              <div className="h-[170px]">
                <ImageSlot id={`event-map-${event.slug}`} shape="rect" placeholder="Map screenshot" />
              </div>
              <div className="p-5">
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  {event.venueName}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--color-ink-muted)', marginBottom: 16 }}>{event.area}</div>
                <Button
                  as="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${event.venueName} ${event.area}`,
                  )}`}
                  variant="outline"
                >
                  Get directions
                  <ArrowUpRight size={15} />
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal className="panel panel--lg" delay={180}>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>FAQ</h2>
            <FaqAccordion items={event.faqs} />

            <button
              type="button"
              className="bg-surface-panel rounded-lg py-4 px-[18px]"
              style={{
                marginTop: 12,
                width: '100%',
                border: 0,
                background: 'var(--color-brand-tint-solid)',
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
              onClick={() => toast('Our team replies on WhatsApp within 10 minutes')}
            >
              <Headset size={24} color="#5B21F5" strokeWidth={1.7} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>
                  Still have questions?
                </span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--color-brand-deep)', marginTop: 2 }}>
                  Chat with our team
                </span>
              </span>
              <ChevronRight size={17} color="#5B21F5" />
            </button>
          </Reveal>
        </div>

        <aside className="flex flex-col gap-[22px] sticky top-6 to-1100:static">
          <div className="panel">
            <div className="panel__title">Ticket</div>
            <div className="price-row">
              <span className="flex items-center gap-[7px] text-ink-2">General Admission</span>
              <span className="font-medium whitespace-nowrap">{event.price === 0 ? 'Free' : idr(event.price)}</span>
            </div>
            <div className="price-row">
              <span className="flex items-center gap-[7px] text-ink-2">
                Hoople Platform Fee <Info size={14} color="#B4B2C0" strokeWidth={1.9} />
              </span>
              <span className="font-medium whitespace-nowrap">{idr(money.platformFee)}</span>
            </div>
            <div className="price-row">
              <span className="flex items-center gap-[7px] text-ink-2">
                Payment Gateway Fee <Info size={14} color="#B4B2C0" strokeWidth={1.9} />
              </span>
              <span className="font-medium whitespace-nowrap">{idr(money.gatewayFee)}</span>
            </div>
            <div className="divider divider--dashed" style={{ margin: '20px 0 16px' }} />
            <div className="price-total">
              <span>Total</span>
              <span>{idr(money.total)}</span>
            </div>

            <Button
              as="link"
              to={`/booking?event=${event.slug}`}
              variant="primary"
              size="lg"
              block
              style={{ marginTop: 20 }}
            >
              {event.price === 0 ? 'Register free' : 'Get tickets'}
            </Button>

            <div className="bg-surface-panel rounded-lg py-4 px-[18px]" style={{ marginTop: 18, display: 'flex', gap: 13 }}>
              <ShieldCheck size={20} color="#6D28FF" strokeWidth={1.8} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>Full Refund Available</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-grey)', lineHeight: 1.6 }}>
                  Refundable up to 24 hours before the event starts.
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel__title panel__title--sm">Hosted by {event.host}</div>
            <p style={{ fontSize: 13, color: 'var(--color-grey)', lineHeight: 1.7, marginBottom: 18 }}>
              {event.host} runs experiences on Hoople every month. Follow to hear about the next one first.
            </p>
            <Button as="button" variant="ghost" block onClick={() => toast(`Following ${event.host}`)}>
              Follow {event.host}
            </Button>
          </div>
        </aside>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          size="sm"
          title="More events you might like"
          moreTo="/events"
          moreLabel="View all events →"
        />
        <Rail perView={4} label="More events">
          {related.map((item) => (
            <EventCard key={item.slug} event={item} />
          ))}
        </Rail>
      </Reveal>

      {/* Phone only: the ticket action follows the reader down the page. */}
      <BookBar
        price={event.price}
        unit="ticket"
        note={compactDate(event.date)}
        to={`/booking?event=${event.slug}`}
        cta={event.price === 0 ? 'Register free' : 'Get tickets'}
      />
    </>
  );
}
