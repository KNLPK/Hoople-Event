import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, Building, Check, Compass, Layers, Lock } from '@/components/ui/icons';

/**
 * The front door.
 *
 * Hoople is three surfaces, not one site with a role switch: people looking
 * for something to do, communities selling to the public, and companies
 * running events for their own staff. They share a design system and nothing
 * else — different navigation, different data, different rules about who can
 * see what. Choosing up front is more honest than a link buried in a footer,
 * and it means each surface can keep its own chrome once you are inside it.
 */

const SURFACES = [
  {
    key: 'participant',
    eyebrow: 'For everyone',
    title: 'Hoople',
    tagline: 'Find something worth showing up for.',
    body: 'Browse events and recurring activities across Jakarta, book a seat, pay in Rupiah, and keep the QR e-ticket in your pocket.',
    points: ['Discover events and activities', 'Book and pay in a few taps', 'QR e-ticket and booking history'],
    to: '/home',
    cta: 'Browse Hoople',
    icon: <Compass size={20} color="#6D28FF" strokeWidth={1.9} />,
    slot: 'entry-participant',
    hint: 'Community meetup',
    tone: 'brand' as const,
    note: 'No account needed until you pay.',
  },
  {
    key: 'organizer',
    eyebrow: 'For communities and studios',
    title: 'Hoople for Organizers',
    tagline: 'Sell to the public, run the door.',
    body: 'Build an event or a recurring activity, put it in front of Jakarta, take registrations and money, and check people in at the door.',
    points: ['Public listing and ticket sales', 'Registrations, sessions and QR check-in', 'Analytics and H+1 payouts'],
    to: '/organizer',
    cta: 'Open the console',
    icon: <Layers size={20} color="#16A34A" strokeWidth={1.9} />,
    slot: 'entry-organizer',
    hint: 'Workshop room',
    tone: 'green' as const,
    note: 'Sign-in required.',
  },
  {
    key: 'teams',
    eyebrow: 'For companies and organizations',
    title: 'Hoople for Teams',
    tagline: 'Events for your own people only.',
    body: 'The kick-off, the town hall, onboarding, Friday padel. Invite by department, split the cost, and take attendance — without any of it appearing on the public site.',
    points: ['Members-only, never published', 'Invite by department, RSVP and approve', 'Attendance reporting and cost sharing'],
    to: '/teams',
    cta: 'Open the workspace',
    icon: <Building size={20} color="#EA8C00" strokeWidth={1.9} />,
    slot: 'entry-teams',
    hint: 'Company town hall on stage',
    tone: 'amber' as const,
    note: 'Private to one organization.',
  },
];

export function Entry() {
  return (
    <main className="entry">
      <div className="entry__inner">
        <Reveal className="entry__head">
          <span className="entry__logo" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M12 3a9 9 0 1 0 8.5 6" stroke="#6D28FF" strokeWidth="2.6" strokeLinecap="round" />
              <path
                d="M15 2.5l6 1.2-1.2 6"
                stroke="#6D28FF"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>hoople</span>
          </span>
          <h1>
            Three ways in, <em>one platform.</em>
          </h1>
          <p>
            Pick the side of Hoople you want to see. Each one is its own site — you can come back here any time from
            the account menu.
          </p>
        </Reveal>

        <div className="entry__grid">
          {SURFACES.map((surface, index) => (
            <Reveal key={surface.key} delay={index * 90} className={`entry-card is-${surface.tone}`}>
              <Link to={surface.to} className="entry-card__hit">
                <span className="entry-card__media">
                  <ImageSlot
                    id={surface.slot}
                    shape="rect"
                    placeholder={surface.hint}
                    interactive={false}
                  />
                </span>

                <span className="entry-card__body">
                  <span className="entry-card__eyebrow">
                    {surface.icon}
                    {surface.eyebrow}
                  </span>
                  <span className="entry-card__title">{surface.title}</span>
                  <span className="entry-card__tagline">{surface.tagline}</span>
                  <span className="entry-card__text">{surface.body}</span>

                  <span className="entry-card__points">
                    {surface.points.map((point) => (
                      <span key={point}>
                        <Check size={14} strokeWidth={2.4} />
                        {point}
                      </span>
                    ))}
                  </span>

                  <span className="entry-card__foot">
                    <span className="entry-card__cta">
                      {surface.cta}
                      <ArrowRight size={16} />
                    </span>
                    <span className="entry-card__note">
                      {surface.key === 'teams' ? <Lock size={12} strokeWidth={2} /> : null}
                      {surface.note}
                    </span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="entry__foot" delay={280}>
          <p>
            Hoople is a prototype. Nothing is really authenticated, no money moves, and every photo is drawn rather
            than shot — but every screen is clickable.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
