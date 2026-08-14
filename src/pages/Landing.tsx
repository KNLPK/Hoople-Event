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
  Star,
  Users,
  Wallet,
} from '@/components/ui/icons';
import { ACTIVITIES } from '@/data/activities';
import { rupiah, shortDate } from '@/lib/format';
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

export function Landing() {
  const featured = ACTIVITIES[0];
  const activity = ACTIVITIES[1];
  const featuredSession = nextSession(featured);
  const activitySession = nextSession(activity);

  return (
    <>
      {/* Hero */}
      <section className="landing-hero">
        <div className="container landing-hero__grid">
          <div>
            <h1>
              Experiences that connect communities,{' '}
              <span className="script">that grow.</span>
            </h1>
            <p className="landing-hero__lede">
              Hoople is the all-in-one platform for events and activities in Indonesia. Discover something
              worth showing up for — or run your own, from registration to QR check-in.
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
            <div className="landing-hero__proof">
              <div className="avatar-stack" style={{ filter: 'none' }}>
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} style={{ borderColor: '#fff' }}>
                    <ImageSlot id={`landing-avatar-${index}`} shape="circle" placeholder="" />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
                10,000+ people joined a Hoople experience this week
              </span>
            </div>
          </div>

          {/* Floating card previews */}
          <div className="float-stack">
            <div className="float-card float-card--event float">
              <div style={{ height: 120 }}>
                <ImageSlot id="landing-card-event" shape="rect" placeholder={featured.photoHint} />
              </div>
              <div style={{ padding: 16 }}>
                <span className="badge">EVENT</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, marginTop: 10 }}>
                  {featured.title}
                </div>
                <div className="meta meta--sm" style={{ marginTop: 8 }}>
                  <Calendar size={13} color="#8B8A99" strokeWidth={2} />
                  {featuredSession ? shortDate(featuredSession.date) : 'New dates soon'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>
                  {rupiah(featured.priceFrom)}
                </div>
              </div>
            </div>

            <div
              className="float-card float-card--ticket float"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="row row--between" style={{ marginBottom: 14 }}>
                <span className="tag tag--status">
                  Confirmed <Check size={13} />
                </span>
                <span style={{ fontSize: 11, color: 'var(--grey-soft)' }}>TKT-8KZ7-01</span>
              </div>
              <div style={{ height: 128, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                <ImageSlot id="landing-card-qr" shape="rounded" radius={12} placeholder="QR code" />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--grey)', textAlign: 'center' }}>
                Scan at the door to check in
              </div>
            </div>

            <div className="float-card float-card--activity float" style={{ animationDelay: '1.6s' }}>
              <div style={{ height: 110 }}>
                <ImageSlot id="landing-card-activity" shape="rect" placeholder={activity.photoHint} />
              </div>
              <div style={{ padding: 16 }}>
                <span className="badge badge--green">ACTIVITY</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, marginTop: 10 }}>
                  {activity.title}
                </div>
                <div className="meta meta--sm meta--amber" style={{ marginTop: 8 }}>
                  <Bolt size={13} color="#EA8C00" strokeWidth={2} />
                  {activitySession?.slotsLeft ?? 0} slots remaining!
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10, color: 'var(--green)' }}>
                  {rupiah(activity.priceFrom)} / session
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <Reveal className="container section--tight">
        <div className="logo-strip">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey)' }}>
            Trusted by communities running experiences every week
          </span>
          {TRUSTED_BY.map((name) => (
            <span key={name} className="logo-strip__mark">
              {name}
            </span>
          ))}
        </div>
      </Reveal>

      {/* Why Hoople */}
      <Reveal className="container section">
        <SectionHead
          title="Why choose Hoople"
          subtitle="Four connected modules — Event, Quest, Play, Connect — behind one simple flow."
        />
        <div className="why-grid">
          {WHY.map(({ Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 60} className="why-card lift">
              <span className="why-card__icon">
                <Icon size={22} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Popular right now */}
      <Reveal className="container section">
        <SectionHead
          title="Popular right now"
          subtitle="What people in Jakarta are booking this week"
          moreTo="/discover"
        />
        <div className="grid grid--4">
          {ACTIVITIES.slice(0, 4).map((item) => (
            <Link key={item.slug} to={`/activities/${item.slug}`} className="card lift activity-card">
              <div className="activity-card__media zoom">
                <ImageSlot id={`landing-popular-${item.slug}`} shape="rect" placeholder={item.photoHint} />
                {item.badge ? (
                  <span className={`badge activity-card__badge ${item.badge === 'TRENDING' ? 'badge--green' : ''}`}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <div className="activity-card__body">
                <span className="activity-card__title">{item.title}</span>
                <span className="activity-card__host">by {item.host}</span>
                <div className="stack" style={{ gap: 7, marginTop: 12 }}>
                  <span className="meta meta--sm">
                    <MapPin size={14} color="#8B8A99" strokeWidth={2} />
                    {item.venue.area}, {item.venue.city}
                  </span>
                  <span className="meta meta--sm">
                    <Star size={14} />
                    {item.rating} ({item.reviewCount} reviews)
                  </span>
                </div>
                <div className="activity-card__price">
                  {item.priceFrom === 0 ? 'Free' : `From ${rupiah(item.priceFrom)}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Personas */}
      <Reveal className="container section">
        <SectionHead
          title="Built for every kind of community"
          subtitle="From a running club of forty to a brand activation of four thousand."
        />
        <div className="persona-grid">
          {PERSONAS.map((persona, index) => (
            <Reveal key={persona.slug} delay={index * 60} className="persona-card lift">
              <div className="persona-card__media zoom">
                <ImageSlot id={`persona-${persona.slug}`} shape="rect" placeholder={persona.photoHint} />
              </div>
              <div className="persona-card__body">
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
      <Reveal className="container section">
        <SectionHead
          title="How the flow works"
          subtitle="Organize → Engage → Capture → Retain"
          moreTo="/how-it-works"
          moreLabel="See how it works →"
        />
        <div className="flow-grid">
          {VALUE_FLOW.map(({ step, title, body, Icon }, index) => (
            <Reveal key={step} delay={index * 60} className="flow-card lift">
              <div className="flow-card__step">{step}</div>
              <span className="why-card__icon">
                <Icon size={22} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Closing CTA */}
      <Reveal className="container section">
        <div className="cta-banner">
          <div>
            <h2>Ready to run your next experience?</h2>
            <p>
              List free, keep your fees transparent, and get paid H+1. Start with ticketing and QR check-in,
              add Connect when your community grows.
            </p>
            <div className="row" style={{ gap: 22, marginTop: 22, flexWrap: 'wrap', fontSize: 13.5 }}>
              <span className="row" style={{ gap: 8 }}>
                <Check size={15} color="#fff" /> No listing fee
              </span>
              <span className="row" style={{ gap: 8 }}>
                <Clock size={15} color="#fff" strokeWidth={2} /> Live in under an hour
              </span>
              <span className="row" style={{ gap: 8 }}>
                <Wallet size={15} color="#fff" strokeWidth={2} /> Payout H+1
              </span>
            </div>
          </div>
          <div className="cta-banner__actions">
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
