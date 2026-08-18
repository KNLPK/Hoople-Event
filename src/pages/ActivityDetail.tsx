import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BookBar } from '@/components/layout/BookBar';
import { DarkHero } from '@/components/layout/DarkHero';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { Button } from '@/components/ui/Button';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { HeartButton } from '@/components/ui/HeartButton';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Modal } from '@/components/ui/Modal';
import { Newsletter } from '@/components/ui/Newsletter';
import { Rail } from '@/components/ui/Rail';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import {
  Accessible,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bottle,
  Box,
  Calendar,
  CalendarDots,
  Chat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Close,
  Headset,
  HeartOutlineLarge,
  Layers,
  Learn,
  Levels,
  Parking,
  Photos,
  Play,
  Room,
  Shirt,
  Star,
  Tools,
  UserCircle,
  Users,
} from '@/components/ui/icons';
import { ACTIVITIES, APP_TODAY, getActivity } from '@/data/activities';
import { dateStrip, monthGrid, nextSession, sessionsOn } from '@/data/schedule';
import {
  longDate,
  monthLabel,
  parseISODate,
  rupiah,
  sessionWindow,
  shortDate,
  toISODate,
  WEEKDAY_LABELS,
} from '@/lib/format';

const TABS = ['Overview', 'Sessions', 'About Host', 'Reviews', 'FAQ'] as const;

const BRING_ICONS = [Shirt, Bottle, Box, HeartOutlineLarge];
const VENUE_NOTE_ICONS = [Users, Parking, Accessible];

/**
 * Remount on every slug change.
 *
 * This page carries a selected date, an open tab, a review position and an
 * expanded description. React keeps all of it when only the route parameter
 * changes, so clicking a related activity at the bottom used to open the next
 * one already scrolled to somebody else's reviews.
 */
export function ActivityDetail() {
  const { slug } = useParams();
  return <ActivityDetailPage key={slug ?? ''} />;
}

function ActivityDetailPage() {
  const { slug } = useParams();
  const activity = getActivity(slug);
  const toast = useToast();

  /*
   * Open on the first day this activity actually runs, not on today. Most of
   * them run two or three weekdays a week, so defaulting to today greeted
   * most visitors with "No sessions on …" — an empty page on the very screen
   * they came to book from. The strip still starts at today when the first
   * open day falls inside its week, so the run of dates stays honest.
   */
  const firstOpen = activity ? (nextSession(activity)?.date ?? APP_TODAY) : APP_TODAY;
  const daysOut =
    (parseISODate(firstOpen).getTime() - parseISODate(APP_TODAY).getTime()) / 86_400_000;

  const [selectedDate, setSelectedDate] = useState(firstOpen);
  const [stripStart, setStripStart] = useState(daysOut < 7 ? APP_TODAY : firstOpen);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const firstOfSelected = parseISODate(selectedDate);
  const [calYear, setCalYear] = useState(firstOfSelected.getFullYear());
  const [calMonth, setCalMonth] = useState(firstOfSelected.getMonth());

  const strip = useMemo(
    () => (activity ? dateStrip(activity, stripStart, 7) : []),
    [activity, stripStart],
  );
  const daySessions = useMemo(
    () => (activity ? sessionsOn(activity, selectedDate) : []),
    [activity, selectedDate],
  );
  const calendarCells = useMemo(
    () => (activity ? monthGrid(activity, calYear, calMonth) : []),
    [activity, calYear, calMonth],
  );

  if (!activity) return <Navigate to="/activities" replace />;

  /* Whatever the phone bar should book: the first session on the chosen day. */
  const bookable = daySessions[0];

  const related = ACTIVITIES.filter(
    (item) => item.slug !== activity.slug && item.category === activity.category,
  ).concat(ACTIVITIES.filter((item) => item.slug !== activity.slug && item.category !== activity.category));

  function shiftStrip(days: number) {
    const cursor = parseISODate(stripStart);
    cursor.setDate(cursor.getDate() + days);
    const next = toISODate(cursor);
    if (parseISODate(next) < parseISODate(APP_TODAY)) return;
    setStripStart(next);
  }

  function stepMonth(direction: 1 | -1) {
    const next = new Date(calYear, calMonth + direction, 1);
    setCalYear(next.getFullYear());
    setCalMonth(next.getMonth());
  }

  function goToSection(next: (typeof TABS)[number]) {
    setTab(next);
    const anchors: Record<string, string> = {
      Overview: 'overview',
      Sessions: 'sessions',
      'About Host': 'host',
      Reviews: 'reviews',
      FAQ: 'faq',
    };
    document.getElementById(anchors[next])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const specs = [
    { icon: Tools, label: 'Level', value: activity.level },
    { icon: Clock, label: 'Duration', value: activity.duration },
    { icon: Learn, label: "What you'll learn", value: activity.learn },
    { icon: Box, label: 'Includes', value: activity.includes },
    { icon: Chat, label: 'Language', value: activity.language },
    { icon: Users, label: 'Class size', value: activity.classSize },
  ];

  return (
    <>
      <DarkHero slotId={`detail-hero-${activity.slug}`} photoHint={activity.photoHint}>
        <div className="detail-hero detail-hero__copy">
          <Link to="/activities" className="detail-hero__back">
            <ArrowLeft size={18} color="#fff" />
            Back to activities
          </Link>
          <div>
            <span className="badge">{activity.categoryLabel}</span>
          </div>
          <h1>{activity.title}</h1>
          <div className="detail-hero__host">by {activity.host}</div>
          <div className="flex items-center gap-3.5 text-[15px] font-medium mb-[26px] flex-wrap">
            <span className="flex items-center" style={{ gap: 8 }}>
              <Star size={17} />
              {activity.rating} ({activity.reviewCount} reviews)
            </span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span className="flex items-center" style={{ gap: 8 }}>
              <Users size={17} color="#fff" />
              {activity.joined}
            </span>
          </div>
          <p className="detail-hero__summary">{activity.summary}</p>
          <div className="flex gap-[34px] flex-wrap">
            {activity.highlights.map((highlight, index) => (
              <div key={highlight} className="detail-hero__feature">
                <span>
                  {index === 0 ? (
                    <UserCircle size={19} color="#fff" strokeWidth={1.7} />
                  ) : index === 1 ? (
                    <Layers size={19} color="#fff" strokeWidth={1.7} />
                  ) : (
                    <Users size={19} color="#fff" strokeWidth={1.7} />
                  )}
                </span>
                <span style={{ maxWidth: 120, lineHeight: 1.35 }}>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </DarkHero>

      <div className="border-b border-b-[#edebf4] bg-[#fff] sticky top-0 z-30">
        <div className="mx-auto w-full max-w-page px-gutter subnav__inner">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              className={`subnav__link ${tab === item ? 'is-active' : ''}`.trim()}
              onClick={() => goToSection(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* About + specs */}
      <Reveal id="overview" className="mx-auto w-full max-w-page px-gutter section">
        <div className="about-grid">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>About this activity</h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.85,
                color: 'var(--color-ink-3)',
                marginBottom: 18,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: expanded ? 'unset' : 4,
                overflow: expanded ? 'visible' : 'hidden',
              }}
            >
              {activity.description}
            </p>
            <button
              type="button"
              className="link-more"
              style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--color-brand)', padding: 0 }}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? 'Read less' : 'Read more'}
              <ChevronDown
                size={15}
                strokeWidth={2.2}
                className={expanded ? 'is-flipped' : undefined}
                color="currentColor"
              />
            </button>
          </div>
          <div className="about-grid__rule" />
          <div className="flex flex-col" style={{ gap: 24 }}>
            {specs.slice(0, 3).map(({ icon: Icon, label, value }) => (
              <div key={label} className="spec">
                <Icon size={21} color="#5B21F5" strokeWidth={1.7} />
                <div>
                  <div className="text-[14px] font-semibold mb-1">{label}</div>
                  <div className="text-[13.5px] text-ink-muted leading-[1.65]">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col" style={{ gap: 24 }}>
            {specs.slice(3).map(({ icon: Icon, label, value }) => (
              <div key={label} className="spec">
                <Icon size={21} color="#5B21F5" strokeWidth={1.7} />
                <div>
                  <div className="text-[14px] font-semibold mb-1">{label}</div>
                  <div className="text-[13.5px] text-ink-muted leading-[1.65]">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Gallery */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Gallery</h2>
        <div className="gallery">
          {activity.galleryHints.map((hint, index) => (
            <div key={hint} className="h-[190px] rounded-lg overflow-hidden relative">
              <ImageSlot
                id={`gallery-${activity.slug}-${index}`}
                shape="rounded"
                radius={12}
                placeholder={hint}
              />
              {index === 0 ? (
                <div className="gallery__play">
                  <span>
                    <Play size={18} color="#12121A" />
                  </span>
                </div>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="gallery__more"
            onClick={() => toast(`${activity.extraPhotos} more photos coming from ${activity.host}`)}
          >
            <Photos size={30} color="#5B21F5" strokeWidth={1.7} />
            <strong>+{activity.extraPhotos}</strong>
            <small>photos</small>
          </button>
        </div>
      </Reveal>

      {/* Available dates */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="flex items-center justify-between" style={{ marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>Available dates</h2>
          <Button as="button" variant="outline" onClick={() => setCalendarOpen(true)} style={{ height: 42 }}>
            <Calendar size={17} strokeWidth={1.9} />
            Pick another date
          </Button>
        </div>

        <div className="date-strip">
          <button
            type="button"
            className="date-strip__nudge"
            onClick={() => shiftStrip(-7)}
            disabled={stripStart === APP_TODAY}
            aria-label="Show earlier dates"
          >
            <ChevronLeft size={16} color="#3C3A4A" />
          </button>
          <div className="date-strip__track">
            {strip.map((day) => {
              const date = parseISODate(day.iso);
              const selected = day.iso === selectedDate;
              return (
                <button
                  key={day.iso}
                  type="button"
                  className={`date-cell ${selected ? 'is-selected' : ''}`.trim()}
                  disabled={day.count === 0}
                  onClick={() => setSelectedDate(day.iso)}
                >
                  <div className="date-cell__dow">{WEEKDAY_LABELS[date.getDay()]}</div>
                  <div className="date-cell__date">{shortDate(day.iso).split(', ')[1]}</div>
                  <div className="date-cell__note">
                    {day.count === 0
                      ? 'No session'
                      : `${day.count} ${day.count === 1 ? 'session' : 'sessions'}`}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="date-strip__nudge"
            onClick={() => shiftStrip(7)}
            aria-label="Show later dates"
          >
            <ChevronRight size={16} color="#3C3A4A" />
          </button>
        </div>

        <div className="nudge">
          <CalendarDots size={30} color="#5B21F5" strokeWidth={1.7} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="text-[15px] font-semibold mb-1">Can't find a date that works for you?</div>
            <div className="text-[13.5px] text-ink-3">
              New sessions are added regularly. Follow this activity to get notified!
            </div>
          </div>
          <Button
            as="button"
            variant="outline"
            onClick={() => {
              setFollowing((on) => !on);
              toast(following ? 'Stopped following this activity' : `Following ${activity.title}`);
            }}
          >
            {following ? 'Following' : 'Follow activity'}
            <Bell size={16} strokeWidth={1.9} />
          </Button>
        </div>
      </Reveal>

      {/* What to bring */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>What you'll need / bring</h2>
        <div className="bring-grid">
          {activity.bring.map((item, index) => {
            const Icon = BRING_ICONS[index % BRING_ICONS.length];
            return (
              <div key={item.title} className="border border-[#eae7f3] rounded-xl py-[22px] px-5 bg-[#fff]">
                <Icon size={26} color="#5B21F5" strokeWidth={1.6} />
                <div className="text-[14.5px] font-semibold mt-3.5 mx-0 mb-[26px] leading-[1.4]">{item.title}</div>
                <div className="text-[13px] text-grey">{item.detail}</div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Sessions */}
      <Reveal id="sessions" className="mx-auto w-full max-w-page px-gutter pt-14">
        <div className="flex items-center justify-between" style={{ marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>
            Available sessions for {shortDate(selectedDate)}
          </h2>
          <div className="flex items-center" style={{ gap: 14 }}>
            <Button as="button" variant="neutral" onClick={() => setCalendarOpen(true)} style={{ height: 40 }}>
              <Calendar size={17} color="#5C5B6B" strokeWidth={1.8} />
              Change date
            </Button>
          </div>
        </div>

        {daySessions.length ? (
          daySessions.map((session, index) => (
            <div key={session.id} className={`session-row ${session.popular ? 'is-featured' : ''}`.trim()}>
              <div className="session-row__media zoom">
                <ImageSlot
                  id={`session-photo-${activity.slug}-${session.id}`}
                  shape="rounded"
                  radius={12}
                  placeholder={`${session.name} photo`}
                />
              </div>

              <div>
                {session.popular ? <span className="tag tag--caps">POPULAR</span> : null}
                <div className="font-heading text-[19px] font-semibold mt-[11px] mx-0 mb-[5px]">{session.name}</div>
                <div className="text-[13.5px] text-ink-muted mb-[18px]">
                  {sessionWindow(session.start, session.end, session.durationMin)}
                </div>
                <div className="session-row__facts">
                  <Fact icon={<Users size={18} color="#8B8A99" strokeWidth={1.8} />} label="Coach" value={session.coach} />
                  <Fact icon={<Levels size={18} color="#8B8A99" strokeWidth={1.8} />} label="Level" value={session.level} />
                  <Fact icon={<Room size={18} color="#8B8A99" strokeWidth={1.8} />} label="Room" value={session.room} />
                  <Fact
                    icon={<Users size={18} color="#8B8A99" strokeWidth={1.8} />}
                    label="Capacity"
                    value={`${session.capacity} participants`}
                  />
                </div>
              </div>

              <div className="session-row__buy">
                <HeartButton
                  kind="activity"
                  slug={activity.slug}
                  label={activity.title}
                  tone="inline"
                  size={20}
                />
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-green)' }}>
                  {session.slotsLeft} slots left!
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {session.price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      {rupiah(session.price)}
                      <span style={{ color: 'var(--color-grey-soft)', fontWeight: 400 }}> / session</span>
                    </>
                  )}
                </div>
                <Button
                  as="link"
                  to={`/booking?activity=${activity.slug}&session=${session.id}&date=${selectedDate}`}
                  variant={index === 0 ? 'primary' : 'outline'}
                  block
                  style={{ height: 46, marginTop: 6 }}
                >
                  Book this session
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <div className="font-heading text-[17px] font-semibold mb-1.5">No sessions on {longDate(selectedDate)}</div>
            <p className="text-[13.5px] text-grey mb-[18px]">
              {activity.title} runs {activity.recurrence.toLowerCase()}. Pick another date to see what's open.
            </p>
            <Button as="button" variant="primary" onClick={() => setCalendarOpen(true)}>
              Pick another date
            </Button>
          </div>
        )}

        <div className="nudge">
          <Clock size={30} color="#5B21F5" strokeWidth={1.8} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="text-[15px] font-semibold mb-1">Can't find a slot that works for you?</div>
            <div className="text-[13.5px] text-ink-3">
              New sessions are added regularly. You can follow this activity to get notified.
            </div>
          </div>
          <Button
            as="button"
            variant="outline"
            onClick={() => {
              setFollowing((on) => !on);
              toast(following ? 'Stopped following this activity' : `Following ${activity.title}`);
            }}
          >
            {following ? 'Following' : 'Follow activity'}
            <Bell size={16} strokeWidth={1.9} />
          </Button>
        </div>
      </Reveal>

      {/* Location + reviews */}
      <Reveal id="host" className="mx-auto w-full max-w-page px-gutter pt-14">
        <div className="detail-split">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Location</h2>
            <div className="border border-[#eae7f3] rounded-xl overflow-hidden bg-[#fff]">
              <div className="h-[170px]">
                <ImageSlot id={`map-${activity.slug}`} shape="rect" placeholder="Map screenshot" />
              </div>
              <div className="p-5">
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  {activity.venue.name}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--color-ink-muted)', marginBottom: 16 }}>
                  {activity.venue.address}
                </div>
                <div className="flex flex-col" style={{ gap: 10, marginBottom: 20 }}>
                  {activity.venue.notes.map((note, index) => {
                    const Icon = VENUE_NOTE_ICONS[index % VENUE_NOTE_ICONS.length];
                    return (
                      <span key={note} className="meta">
                        <Icon size={16} color="#8B8A99" strokeWidth={1.8} />
                        {note}
                      </span>
                    );
                  })}
                </div>
                <div className="flex items-center" style={{ gap: 14 }}>
                  <Button
                    as="a"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activity.venue.name} ${activity.venue.address}`,
                    )}`}
                    variant="outline"
                    style={{ flex: 1 }}
                  >
                    Get directions
                    <ArrowUpRight size={15} />
                  </Button>
                  <Button
                    as="a"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      activity.venue.address,
                    )}`}
                    variant="outline"
                    style={{ flex: 1 }}
                  >
                    View on map
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div id="reviews">
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>What people say</h2>
              <button
                type="button"
                className="link-more"
                style={{ border: 0, background: 'none', color: 'var(--color-brand)', cursor: 'pointer' }}
                onClick={() => toast(`All ${activity.reviewCount} reviews are coming to this page soon`)}
              >
                View all reviews →
              </button>
            </div>
            {activity.reviews.slice(reviewIndex, reviewIndex + 2).map((review) => (
              <article key={review.author} className="review-card">
                <div className="flex items-center" style={{ gap: 12, marginBottom: 12 }}>
                  <span className="text-star text-[14px] tracking-[2px]">{'★'.repeat(review.stars)}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--color-grey-soft)' }}>{review.when}</span>
                </div>
                <p className="text-[14px] leading-[1.75] text-ink-2 mt-3 mx-0 mb-4">{review.body}</p>
                <div className="flex items-center" style={{ gap: 11 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}>
                    <ImageSlot id={`reviewer-${activity.slug}-${review.author}`} shape="circle" placeholder="" />
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{review.author}</span>
                </div>
              </article>
            ))}
            <div className="dots">
              {activity.reviews.map((review, index) => (
                <button
                  key={review.author}
                  type="button"
                  className={index === reviewIndex ? 'is-on' : ''}
                  onClick={() => setReviewIndex(index)}
                  aria-label={`Show review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* FAQ + more like this */}
      <Reveal id="faq" className="mx-auto w-full max-w-page px-gutter pt-14">
        <div className="detail-split detail-split--faq">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>FAQ</h2>
            <FaqAccordion items={activity.faqs} />

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
          </div>

          <div>
            <SectionHead
              size="sm"
              title="More activities you might like"
              moreTo="/activities"
              moreLabel="View all activities →"
            />
            <Rail perView={4} gap={20} label="More activities" arrowTop={130}>
              {related.slice(0, 6).map((item) => (
                <ActivityCard key={item.slug} activity={item} />
              ))}
            </Rail>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <Newsletter slotId={`detail-mail-${activity.slug}`} />
      </Reveal>

      {/* TIX-style date picker */}
      <Modal open={calendarOpen} onClose={() => setCalendarOpen(false)} label="Choose a date">
        <div className="cal-head">
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600 }}>
              Choose a date
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-grey)', marginTop: 3 }}>
              Sessions open up to 3 months ahead
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={() => setCalendarOpen(false)}
            aria-label="Close date picker"
          >
            <Close size={16} color="#3C3A4A" />
          </button>
        </div>

        <div className="pt-5 px-6 pb-2 flex items-center justify-between">
          <button type="button" className="cal-nav__btn" onClick={() => stepMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={16} color="#3C3A4A" />
          </button>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600 }}>
            {monthLabel(calYear, calMonth)}
          </div>
          <button type="button" className="cal-nav__btn" onClick={() => stepMonth(1)} aria-label="Next month">
            <ChevronRight size={16} color="#3C3A4A" />
          </button>
        </div>

        <div className="pt-3.5 px-6 pb-0 grid grid-cols-[repeat(7,_1fr)] gap-1.5 text-[11.5px] font-semibold text-grey-soft text-center">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="cal-grid">
          {calendarCells.map((cell, index) =>
            cell.day === null ? (
              <div key={`blank-${index}`} className="cal-day cal-day--blank" />
            ) : (
              <button
                key={cell.iso}
                type="button"
                className={`cal-day ${cell.iso === selectedDate ? 'is-selected' : ''}`.trim()}
                disabled={!cell.available}
                onClick={() => {
                  if (cell.iso) {
                    setSelectedDate(cell.iso);
                    setStripStart(cell.iso);
                  }
                }}
              >
                <span className="text-[14px] font-semibold leading-[1]">{cell.day}</span>
                <span className={`cal-day__dot ${cell.available ? '' : 'cal-day__dot--off'}`.trim()} />
              </button>
            ),
          )}
        </div>

        <div className="cal-legend">
          <span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green)' }} />
            Sessions available
          </span>
          <span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-line-dashed)' }} />
            Fully booked / closed
          </span>
        </div>

        <div className="pt-4 px-6 pb-[22px] border-t border-t-line-faint flex items-center justify-between gap-4 bg-[#fbfafe] flex-wrap">
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-grey-soft)' }}>Selected date</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, marginTop: 3 }}>
              {longDate(selectedDate)}
            </div>
          </div>
          <Button
            as="button"
            variant="primary"
            onClick={() => {
              setCalendarOpen(false);
              document.getElementById('sessions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{ height: 46, padding: '0 28px' }}
          >
            See sessions
          </Button>
        </div>
      </Modal>

      {/* Phone only: the book action follows the reader down the page. */}
      {bookable ? (
        <BookBar
          price={bookable.price}
          unit="session"
          note={`${shortDate(selectedDate)} · ${bookable.start}`}
          to={`/booking?activity=${activity.slug}&session=${bookable.id}&date=${selectedDate}`}
          cta="Book session"
        />
      ) : null}
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="session-fact">
      {icon}
      <div>
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="text-[13px] text-grey mt-0.5">{value}</div>
      </div>
    </div>
  );
}
