import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import {
  ArrowRight,
  Bolt,
  Calendar,
  Chart,
  Check,
  Clock,
  Compass,
  Heart,
  Layers,
  MapPin,
  Sparkle4,
  Star,
  Users,
  Wallet,
} from '@/components/ui/icons';
import { ACTIVITIES } from '@/data/activities';
import { EVENTS } from '@/data/events';
import { compactDate, rupiah, shortDate } from '@/lib/format';
import { nextSession } from '@/data/schedule';

const TRUSTED_BY = [
  'Waktu Luang',
  'Kopi Karya',
  'Flow with Me',
  'Namaste Studio',
  'Strive Gym SCBD',
  'Lingua Space',
  'GreenBite Kitchen',
];

const WHY = [
  {
    Icon: Layers,
    title: 'All-in-one Platform',
    body: 'Event, Quest, Play and Connect in one place. Stop stitching four tools together for one activation.',
  },
  {
    Icon: Bolt,
    title: 'Seamless Experience',
    body: 'Microsite, registration, ticketing and QR check-in — one flow from the first click to the door.',
  },
  {
    Icon: Chart,
    title: 'Smart Analytics',
    body: 'See who registered, who actually showed up, and what they did once they were inside.',
  },
  {
    Icon: Wallet,
    title: 'Get Paid Fast',
    body: 'Payout lands H+1 after your event, with the admin and gateway fee shown to every buyer up front.',
  },
  {
    Icon: Heart,
    title: 'Community First',
    body: 'Built for communities in Indonesia — your members, your WhatsApp list, your repeat sessions.',
  },
];

const PERSONAS = [
  {
    slug: 'communities',
    title: 'Communities & Clubs',
    body: 'Run a weekly run club or a monthly meetup. Sell per session, and keep the same people coming back.',
    photoHint: 'Community meetup',
    to: '/communities',
  },
  {
    slug: 'campus',
    title: 'Campus & Student Bodies',
    body: 'Seminars, festivals and orientation days — with registration, QR check-in and attendance in one place.',
    photoHint: 'Campus event',
    to: '/organizers',
  },
  {
    slug: 'eo',
    title: 'Event Organizers & Agencies',
    body: 'Brand activations that need Quest missions, Play leaderboards, and data you can hand to the client.',
    photoHint: 'Brand activation',
    to: '/organizers',
  },
  {
    slug: 'venues',
    title: 'Venues & Sport Centers',
    body: 'Fill recurring class slots, manage capacity per room, and let members book a single session.',
    photoHint: 'Sport centre',
    to: '/pricing',
  },
];

/** The Organize → Engage → Capture → Retain loop, one card per module. */
const VALUE_FLOW = [
  {
    step: '01 · Organize',
    title: 'Event',
    body: 'Microsite, registration, ticketing and QR check-in in one setup.',
    Icon: Calendar,
  },
  {
    step: '02 · Engage',
    title: 'Quest',
    body: 'Scavenger hunts and booth missions that move people around the room.',
    Icon: Compass,
  },
  {
    step: '03 · Capture',
    title: 'Play',
    body: 'Games, a live leaderboard, and a lucky draw that collects real contacts.',
    Icon: Bolt,
  },
  {
    step: '04 · Retain',
    title: 'Connect',
    body: 'WhatsApp CRM and retargeting so the next event starts with an audience.',
    Icon: Users,
  },
];

/** `Every Monday, Wednesday, Friday` -> `Mon, Wed, Fri`, to hold the row to one line. */
function shortDays(recurrence: string): string {
  return recurrence
    .replace('Every ', '')
    .split(', ')
    .map((day) => day.slice(0, 3))
    .join(', ');
}

export function Landing() {
  /* The hero shows one of each kind: the biggest event, and a weekly class. */
  const heroEvent = EVENTS.find((event) => event.slug === 'jakarta-coffee-week') ?? EVENTS[0];
  const activity = ACTIVITIES[1];
  const activitySession = nextSession(activity);

  return (
    <>
      {/* Hero */}
      <section className="landing-hero">
        <div className="mx-auto w-full max-w-page px-gutter landing-hero__grid">
          <div className="landing-hero__copy">
            <span className="hero-eyebrow">
              <Sparkle4 size={14} color="#6D28FF" />
              All-in-one Experience Platform for Community
            </span>
            <h1>
              Experiences that connect communities,{' '}
              <span className="script">
                that grow.
                {/* Hand-drawn swoop. Sits under the words as a separate layer so
                    the text keeps its own line box and never shifts. */}
                <svg className="script__rule" viewBox="0 0 240 20" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M4 13c46-9 128-11 232-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M212 4c9 2.6 17 4.6 24 6-6.6 2-13.4 3.4-20 4.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="landing-hero__lede">
              From one-time events to recurring activities, Hoople helps communities create, join, and grow
              unforgettable experiences.
            </p>
            <div className="landing-hero__ctas">
              <Button as="link" to="/discover" variant="primary" size="xl" halo>
                Explore Experiences
                <ArrowRight size={17} strokeWidth={2.2} />
              </Button>
              <Button as="link" to="/organizers" variant="outline" size="xl">
                Create Experience
              </Button>
            </div>
          </div>

          {/* The collage: two experiences and the ticket they end in. */}
          <div className="hero-stage">
            <div className="hero-stage__inner">
              {/* Drawn first so the thread and its pins sit behind every card. */}
              {/* One loop around the whole collage. The cards cover its middle,
                  so it reads as a line ducking behind them and back out. */}
              <svg className="hero-thread" viewBox="0 0 620 540" fill="none" aria-hidden="true">
                <path
                  d="M310 18c160 0 290 113 290 252S470 522 310 522 20 409 20 270 150 18 310 18Z"
                  stroke="var(--color-brand-border)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="1 8"
                />
              </svg>
              {[
                { top: 270, left: 20 },
                { top: 18, left: 310 },
                { top: 270, left: 600 },
                { top: 522, left: 310 },
              ].map((pin) => (
                <span key={`${pin.top}-${pin.left}`} className="hero-pin" style={{ top: pin.top, left: pin.left }}>
                  <MapPin size={13} color="#6D28FF" strokeWidth={2.2} />
                </span>
              ))}

              <Sparkle4 className="hero-spark top-2 left-[356px]" size={18} color="#C9BEF5" />
              <Sparkle4 className="hero-spark top-[430px] left-[104px]" size={13} color="#D8CCF8" />
              <Sparkle4 className="hero-spark top-[158px] left-2" size={22} color="#C9BEF5" />

              {/* The event: a photo, then the details that sell it. */}
              <div className="hero-photo hero-photo--event float">
                <ImageSlot id="landing-card-event" shape="rect" placeholder={heroEvent.photoHint} />
                <span className="badge absolute top-3.5 left-3.5">EVENT</span>
              </div>
              <div className="hero-note hero-note--event float" style={{ animationDelay: '0.5s' }}>
                <div className="hero-note__row">
                  <Calendar size={15} color="#6D28FF" strokeWidth={1.9} />
                  {compactDate(heroEvent.date)} ({shortDate(heroEvent.date).slice(0, 3)}) ·{' '}
                  {heroEvent.start.replace(':', '.')} – {heroEvent.end.replace(':', '.')}
                </div>
                <div className="hero-note__row">
                  <MapPin size={15} color="#6D28FF" strokeWidth={1.9} />
                  {heroEvent.venueName} · {heroEvent.area.split(', ').pop()}
                </div>
                <div className="flex items-center gap-[9px] mt-[3px]">
                  <span className="avatar-stack avatar-stack--sm" style={{ filter: 'none' }}>
                    {[1, 2, 3].map((index) => (
                      <div key={index} style={{ borderColor: '#fff' }}>
                        <ImageSlot id={`landing-avatar-${index}`} shape="circle" placeholder="" interactive={false} />
                      </div>
                    ))}
                  </span>
                  <span className="text-[12.5px] font-semibold text-grey mr-auto whitespace-nowrap">{heroEvent.going}</span>
                  <Link to={`/events/${heroEvent.slug}`} className="hero-note__cta">
                    Get Tickets
                  </Link>
                </div>
              </div>

              {/* Where every booking ends up. */}
              <div className="hero-ticket float" style={{ animationDelay: '1s' }}>
                <div className="hero-ticket__head">
                  <span className="text-[13px] font-semibold text-ink-2">Your QR Ticket</span>
                </div>
                <div className="hero-ticket__body">
                  <span className="block w-[84px] h-[84px] flex-none">
                    <ImageSlot id="landing-card-qr" shape="rounded" radius={8} placeholder="QR code" interactive={false} />
                  </span>
                  <span className="tag tag--status flex-none">
                    Confirmed <Check size={12} />
                  </span>
                </div>
              </div>

              {/* The recurring half of the catalogue. */}
              <div className="hero-photo hero-photo--activity float" style={{ animationDelay: '1.5s' }}>
                <ImageSlot id="landing-card-activity" shape="rect" placeholder={activity.photoHint} />
                <span className="badge badge--green absolute top-3.5 left-3.5">ACTIVITY</span>
              </div>
              <div className="hero-note hero-note--activity float" style={{ animationDelay: '2s' }}>
                <div className="font-heading text-[17px] font-bold tracking-[-0.02em]">{activity.title}</div>
                <div className="hero-note__row">
                  <Clock size={15} color="#6D28FF" strokeWidth={1.9} />
                  {shortDays(activity.recurrence)} · {activity.recurrenceTime}
                </div>
                <div className="hero-note__row">
                  <MapPin size={15} color="#6D28FF" strokeWidth={1.9} />
                  {activity.venue.name}, {activity.venue.area}
                </div>
                <div className="flex items-center gap-[9px] mt-[3px]">
                  <span className="avatar-stack avatar-stack--sm" style={{ filter: 'none' }}>
                    {[4, 5, 6].map((index) => (
                      <div key={index} style={{ borderColor: '#fff' }}>
                        <ImageSlot id={`landing-avatar-${index}`} shape="circle" placeholder="" interactive={false} />
                      </div>
                    ))}
                  </span>
                  <span className="text-[12.5px] font-semibold text-grey mr-auto whitespace-nowrap">{activitySession?.slotsLeft ?? 12} slots left</span>
                  <Link to={`/activities/${activity.slug}`} className="hero-note__cta hero-note__cta--green">
                    Book Session
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by — centred under the hero, the way a proof line reads best. */}
      <Reveal className="mx-auto w-full max-w-page px-gutter trust">
        <p className="text-[14px] font-medium text-ink-3 mb-[22px]">Trusted by community builders and organizers across Indonesia</p>
        <div className="trust__row">
          {TRUSTED_BY.map((name) => (
            <span key={name} className="trust__mark">
              {name}
            </span>
          ))}
          <span className="text-[14px] text-grey-soft whitespace-nowrap">And 500+ more</span>
        </div>
      </Reveal>

      {/* Why Hoople */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="Why choose Hoople"
          subtitle="Four connected modules — Event, Quest, Play, Connect — behind one simple flow."
        />
        <div className="why-grid">
          {WHY.map(({ Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 60} className="why-card lift">
              <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
                <Icon size={22} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Popular right now */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="Popular right now"
          subtitle="What people in Jakarta are booking this week"
          moreTo="/discover"
        />
        <div className="grid grid--4">
          {ACTIVITIES.slice(0, 4).map((item) => (
            <Link key={item.slug} to={`/activities/${item.slug}`} className="card lift activity-card">
              <div className="relative h-[150px] flex-none zoom">
                <ImageSlot id={`landing-popular-${item.slug}`} shape="rect" placeholder={item.photoHint} />
                {item.badge ? (
                  <span className={`badge activity-card__badge ${item.badge === 'TRENDING' ? 'badge--green' : ''}`}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <div className="pt-4 px-4 pb-3.5 flex flex-col flex-1">
                <span className="activity-card__title">{item.title}</span>
                <span className="text-[12.5px] text-grey-soft mt-1">by {item.host}</span>
                <div className="flex flex-col" style={{ gap: 7, marginTop: 12 }}>
                  <span className="meta meta--sm">
                    <MapPin size={14} color="#8B8A99" strokeWidth={2} />
                    {item.venue.area}, {item.venue.city}
                  </span>
                  <span className="meta meta--sm">
                    <Star size={14} />
                    {item.rating} ({item.reviewCount} reviews)
                  </span>
                </div>
                <div className="text-[15px] font-bold mt-[15px] mx-0 mb-[13px] mt-auto pt-[15px]">
                  {item.priceFrom === 0 ? 'Free' : `From ${rupiah(item.priceFrom)}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Personas */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="Built for every kind of community"
          subtitle="From a running club of forty to a brand activation of four thousand."
        />
        <div className="persona-grid">
          {PERSONAS.map((persona, index) => (
            <Reveal key={persona.slug} delay={index * 60} className="persona-card lift">
              <div className="h-[150px] flex-none zoom">
                <ImageSlot id={`persona-${persona.slug}`} shape="rect" placeholder={persona.photoHint} />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3>{persona.title}</h3>
                <p>{persona.body}</p>
                <Link to={persona.to} className="link-more" style={{ marginTop: 'auto' }}>
                  Learn more →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Value flow */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="How the flow works"
          subtitle="Organize → Engage → Capture → Retain"
          moreTo="/how-it-works"
          moreLabel="See how it works →"
        />
        <div className="flow-grid">
          {VALUE_FLOW.map(({ step, title, body, Icon }, index) => (
            <Reveal key={step} delay={index * 60} className="flow-card lift">
              <div className="text-[11px] font-bold tracking-[0.1em] text-brand mb-3">{step}</div>
              <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
                <Icon size={22} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Closing CTA */}
      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="cta-banner">
          <div>
            <h2>Ready to run your next experience?</h2>
            <p>
              List free, keep your fees transparent, and get paid H+1. Start with ticketing and QR check-in,
              add Connect when your community grows.
            </p>
            <div className="flex items-center" style={{ gap: 22, marginTop: 22, flexWrap: 'wrap', fontSize: 13.5 }}>
              <span className="flex items-center" style={{ gap: 8 }}>
                <Check size={15} color="#fff" /> No listing fee
              </span>
              <span className="flex items-center" style={{ gap: 8 }}>
                <Clock size={15} color="#fff" strokeWidth={2} /> Live in under an hour
              </span>
              <span className="flex items-center" style={{ gap: 8 }}>
                <Wallet size={15} color="#fff" strokeWidth={2} /> Payout H+1
              </span>
            </div>
          </div>
          <div className="flex gap-3.5 flex-wrap">
            <Button as="link" to="/organizers" variant="white" size="xl">
              Create Experience
            </Button>
            <Button as="link" to="/pricing" variant="onDark" size="xl">
              See pricing
            </Button>
          </div>
        </div>
      </Reveal>
    </>
  );
}
