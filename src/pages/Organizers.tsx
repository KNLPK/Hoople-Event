import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import { Bolt, Calendar, Chart, Check, Compass, Users, Wallet } from '@/components/ui/icons';

const MODULES = [
  {
    Icon: Calendar,
    name: 'Event',
    body: 'Microsite, registration, ticketing and QR check-in. Everything a door needs on the day.',
  },
  {
    Icon: Compass,
    name: 'Quest',
    body: 'Scavenger hunts and booth missions that get people moving through the whole floor plan.',
  },
  {
    Icon: Bolt,
    name: 'Play',
    body: 'Games, a live leaderboard and a lucky draw — the part that turns attendees into contacts.',
  },
  {
    Icon: Users,
    name: 'Connect',
    body: 'WhatsApp CRM and retargeting, so your next event opens to an audience that already knows you.',
  },
];

const TYPES = [
  'Community or club',
  'Campus / student body',
  'Event organizer or agency',
  'Brand activation',
  'Corporate team',
  'Venue or sport center',
];

/** Organizer landing + a lightweight "create experience" intake. */
export function Organizers() {
  const toast = useToast();
  const [type, setType] = useState(TYPES[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <div className="mx-auto w-full max-w-page to-900:px-gutter page-header">
        <h1>Run your experience on Hoople</h1>
        <p>
          List free, sell tickets with transparent fees, check people in with a QR code, and keep the
          audience afterwards. Built for communities in Indonesia.
        </p>
        <div className="flex items-center" style={{ gap: 22, marginTop: 22, flexWrap: 'wrap', fontSize: 13.5 }}>
          <span className="meta">
            <Check size={15} color="#16A34A" /> No listing fee
          </span>
          <span className="meta">
            <Wallet size={15} color="#16A34A" strokeWidth={2} /> Payout H+1
          </span>
          <span className="meta">
            <Chart size={15} color="#16A34A" strokeWidth={2} /> Attendance analytics included
          </span>
        </div>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="Four modules, one platform"
          subtitle="Turn them on as you grow — Organize → Engage → Capture → Retain"
          moreTo="/how-it-works"
          moreLabel="See how it works →"
        />
        <div className="flow-grid">
          {MODULES.map(({ Icon, name: moduleName, body }, index) => (
            <Reveal key={moduleName} delay={index * 60} className="flow-card lift">
              <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
                <Icon size={22} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <h3>{moduleName}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="split-panels">
          <div className="panel panel--lg">
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Create an experience</h2>
            <p style={{ fontSize: 13.5, color: 'var(--color-grey)', marginBottom: 24 }}>
              Tell us who you are and we'll set your organizer account up within one working day.
            </p>

            {submitted ? (
              <div className="empty" style={{ border: '1px solid var(--color-line)' }}>
                <div className="font-heading text-[17px] font-semibold mb-1.5">Thanks, {name.split(' ')[0] || 'there'} 🎉</div>
                <p className="text-[13.5px] text-grey mb-[18px]">
                  We've got your details. Our team will email {email || 'you'} to finish setting up your{' '}
                  {type.toLowerCase()} account.
                </p>
                <Button as="link" to="/pricing" variant="primary">
                  See what's included
                </Button>
              </div>
            ) : (
              <form
                className="flex flex-col"
                style={{ gap: 20 }}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <label className="field">
                  <span className="field__label">
                    Organization name <span className="text-danger">*</span>
                  </span>
                  <input
                    className="input"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Waktu Luang"
                  />
                </label>

                <label className="field">
                  <span className="field__label">
                    Work email <span className="text-danger">*</span>
                  </span>
                  <input
                    className="input"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@yourcommunity.id"
                  />
                </label>

                <fieldset className="filter-panel__group">
                  <legend>What kind of organizer are you?</legend>
                  <div className="filter-panel__options">
                    {TYPES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`chip chip-motion ${type === option ? 'is-active' : ''}`.trim()}
                        onClick={() => setType(option)}
                        aria-pressed={type === option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Button as="button" type="submit" variant="primary" size="lg" halo>
                  Create Experience
                </Button>
                <p style={{ fontSize: 12.5, color: 'var(--color-grey-soft)' }}>
                  This is a prototype form — nothing is sent anywhere.
                </p>
              </form>
            )}
          </div>

          <div className="bg-brand-tint-strong rounded-3xl py-[26px] px-[30px]" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 21, fontWeight: 600, marginBottom: 10 }}>What you get on day one</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'A microsite for your experience, live in minutes',
                'Ticketing with the fee shown to the buyer up front',
                'QR check-in that works offline at the door',
                'Session-level capacity for recurring activities',
                'Payout to your account H+1 after the event',
              ].map((item) => (
                <li key={item} style={{ display: 'flex', gap: 11, fontSize: 13.5, color: 'var(--color-ink-2)' }}>
                  <Check size={15} color="#16A34A" />
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ height: 170, marginTop: 'auto' }} className="float">
              <ImageSlot id="organizer-art" shape="rounded" radius={14} placeholder="Organizer 3D illustration" />
            </div>
            <Button
              as="button"
              variant="white"
              style={{ marginTop: 22, alignSelf: 'flex-start' }}
              onClick={() => toast('A specialist will WhatsApp you within one working day')}
            >
              Talk to our team
            </Button>
          </div>
        </div>
      </Reveal>
    </>
  );
}
