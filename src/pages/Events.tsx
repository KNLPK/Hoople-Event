import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkHero } from '@/components/layout/DarkHero';
import { EventCard } from '@/components/cards/EventCard';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Newsletter } from '@/components/ui/Newsletter';
import { Rail } from '@/components/ui/Rail';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import { Bell, Calendar, ChevronDown, Clock, Dice, MapPin, Users } from '@/components/ui/icons';
import { EVENTS, EVENT_CATEGORIES } from '@/data/events';
import { parseISODate, rupiah, shortDate } from '@/lib/format';
import { APP_TODAY } from '@/data/activities';

const PAGE_SIZE = 4;

/** Weekend of the current app week, used by the "This Weekend" rail. */
function isThisWeekend(iso: string): boolean {
  const date = parseISODate(iso);
  const today = parseISODate(APP_TODAY);
  const daysAway = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  const weekday = date.getDay();
  return daysAway >= 0 && daysAway <= 13 && (weekday === 6 || weekday === 0);
}

export function Events() {
  const navigate = useNavigate();
  const toast = useToast();
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (category === 'All events') return EVENTS;
    if (category === 'Free') return EVENTS.filter((event) => event.price === 0);
    return EVENTS.filter((event) => event.category === category);
  }, [category]);

  const featured = EVENTS.filter((event) => event.badge);
  const weekend = EVENTS.filter((event) => isThisWeekend(event.date));
  const upcoming = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <DarkHero slotId="events-hero" photoHint="Drop hero photo — concert crowd">
        <div className="activities-hero__copy" style={{ padding: '104px 0 132px' }}>
          <h1>
            One-time experiences.
            <br />
            Unforgettable moments.
          </h1>
          <p className="dark-hero__lede">
            Concerts, seminars, workshops and market fests across Indonesia —{' '}
            <span className="script">book once, remember it for years.</span>
          </p>
          <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
            <Button as="link" to="/discover" variant="primary" size="lg">
              Browse all events
            </Button>
            <Button as="link" to="/activities" variant="onDark" size="lg">
              Looking for recurring activities?
            </Button>
          </div>
        </div>
      </DarkHero>

      <div className="mx-auto w-full max-w-page px-gutter" style={{ paddingTop: 26 }}>
        <div className="chip-row">
          {EVENT_CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip chip-motion ${category === option ? 'is-active' : ''}`.trim()}
              onClick={() => {
                setCategory(option);
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={category === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="Featured Events"
          subtitle="Handpicked by the Hoople team this month"
          moreTo="/discover"
        />
        <Rail perView={4} label="Featured Events">
          {featured.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </Rail>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section" delay={60}>
        <SectionHead title="This Weekend" subtitle="Saturday and Sunday, ready to book" moreTo="/discover" />
        {weekend.length ? (
          <Rail perView={4} label="This Weekend">
            {weekend.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </Rail>
        ) : (
          <div className="empty">
            <div className="empty__title">Nothing on this weekend yet</div>
            <p className="empty__body">New events go live every Tuesday. Get notified when they do.</p>
            <Button as="button" variant="primary" onClick={() => toast("You'll be the first to know")}>
              Notify me
            </Button>
          </div>
        )}
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section" delay={120}>
        <div className="bookings-layout">
          <div>
            <SectionHead
              size="sm"
              title="Upcoming"
              subtitle={`${upcoming.length} ${upcoming.length === 1 ? 'event' : 'events'} in ${category === 'All events' ? 'every category' : category}`}
            />
            <div className="recurring-list">
              {upcoming.slice(0, visible).map((event) => (
                <div key={event.slug} className="recurring-row">
                  <div className="recurring-row__media zoom">
                    <ImageSlot
                      id={`upcoming-${event.slug}`}
                      shape="rounded"
                      radius={10}
                      placeholder={event.photoHint}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="recurring-row__title"
                      style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                      onClick={() => navigate(`/events/${event.slug}`)}
                    >
                      {event.title}
                    </button>
                    <div className="recurring-row__host">{event.host}</div>
                    <div className="recurring-row__level">{event.category}</div>
                  </div>
                  <div className="stack" style={{ gap: 6 }}>
                    <span className="meta meta--sm">
                      <Calendar size={14} color="#8B8A99" strokeWidth={2} />
                      {shortDate(event.date)}
                    </span>
                    <span className="meta meta--sm">
                      <Clock size={14} color="#8B8A99" strokeWidth={2} />
                      {event.start.replace(':', '.')} – {event.end.replace(':', '.')}
                    </span>
                    <span className="meta meta--sm">
                      <MapPin size={14} color="#8B8A99" strokeWidth={2} />
                      {event.area}
                    </span>
                  </div>
                  <div className="recurring-row__price">
                    {event.price === 0 ? 'Free' : rupiah(event.price)}
                  </div>
                  <Button as="link" to={`/events/${event.slug}`} variant="primary" size="sm">
                    {event.price === 0 ? 'Register' : 'Get tickets'}
                  </Button>
                  <span className="meta meta--sm meta--green" style={{ whiteSpace: 'nowrap' }}>
                    <Users size={14} color="#16A34A" strokeWidth={2} />
                    {event.going}
                  </span>
                </div>
              ))}
            </div>

            {visible < upcoming.length ? (
              <div className="row" style={{ justifyContent: 'center', marginTop: 26 }}>
                <Button as="button" variant="neutral" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                  Load more
                  <ChevronDown size={15} color="#8B8A99" strokeWidth={2} />
                </Button>
              </div>
            ) : null}
          </div>

          <aside className="stack" style={{ gap: 22 }}>
            <div className="surprise" style={{ gridTemplateColumns: '1fr', textAlign: 'left', padding: '24px 26px' }}>
              <div className="surprise__art float" style={{ width: 92, height: 78 }}>
                <ImageSlot id="events-surprise-art" shape="rounded" radius={12} placeholder="Dice 3D" />
              </div>
              <div>
                <h3>Surprise me</h3>
                <p>Not sure what you're in the mood for? Let us pick.</p>
              </div>
              <Button
                as="button"
                variant="primary"
                onClick={() => navigate(`/events/${EVENTS[Math.floor(Math.random() * EVENTS.length)].slug}`)}
              >
                <Dice size={17} strokeWidth={1.8} />
                Pick an event for me
              </Button>
            </div>

            <div className="panel">
              <div className="panel__title panel__title--sm">Never miss an event</div>
              <p style={{ fontSize: 13, color: 'var(--color-grey)', lineHeight: 1.7, marginBottom: 18 }}>
                Turn on alerts and we'll message you the moment a new event opens in your categories.
              </p>
              <Button
                as="button"
                variant="ghost"
                block
                onClick={() => toast("Alerts on — we'll WhatsApp you when new events land")}
              >
                <Bell size={17} strokeWidth={1.9} />
                Turn on event alerts
              </Button>
            </div>
          </aside>
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <Newsletter slotId="events-mail" title="Stay in the loop" />
      </Reveal>
    </>
  );
}
