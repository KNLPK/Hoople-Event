import { EventHead, type EventSectionProps } from './shared';
import {
  Card,
  CheckCircle,
  Chart,
  Globe,
  Mail,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkle,
  Ticket,
} from '@/components/ui/icons';
import { eventChecklist } from '@/data/eventBuilder';
import { compactDate } from '@/lib/format';

const NEXT_STEPS = [
  {
    Icon: Rocket,
    title: 'Event goes live',
    sub: 'Your event page will be published and visible to participants.',
  },
  {
    Icon: Mail,
    title: 'Participants can register',
    sub: 'People can discover your event, register, and get their QR tickets.',
  },
  {
    Icon: Card,
    title: 'Check-in on event day',
    sub: 'Use the Hoople Check-in app to scan QR tickets.',
  },
  {
    Icon: Chart,
    title: 'View real-time data',
    sub: 'Track registrations, check-ins, and transactions in your dashboard.',
  },
];

/** 5.3 — the last look before the event becomes public. */
export function EventFinalPublish({ draft }: EventSectionProps) {
  const checklist = eventChecklist(draft);
  const ready = checklist.every((item) => item.done);
  const live = draft.tickets.filter((ticket) => ticket.active).length;

  const experience = [
    {
      Icon: MapPin,
      text:
        draft.eventType === 'Online'
          ? `Online event via ${draft.platform}`
          : `${draft.eventType} event at ${draft.venueName || 'your venue'}`,
    },
    { Icon: Ticket, text: `${live} ticket type${live === 1 ? '' : 's'} available` },
    {
      Icon: Globe,
      text:
        draft.registrationStatus === 'open'
          ? 'Registration opens now'
          : draft.registrationStatus === 'scheduled'
            ? `Registration opens ${compactDate(draft.publishDate)}`
            : 'Saved as a draft — registration stays closed',
    },
    { Icon: Card, text: 'QR ticket sent instantly after purchase' },
    { Icon: ShieldCheck, text: 'Check-in with QR on event day' },
  ];

  return (
    <>
      <EventHead
        lede={
          ready
            ? 'Everything looks good! Your event is ready to go live.'
            : 'Almost there — a few sections still need you before this can go live.'
        }
        tip="You can still edit after publishing. Changes that affect price or time notify registrants."
      />

      <div className="evt-final">
        <section className="org-card wiz-panel evt-final__ready">
          <span className={`evt-final__seal ${ready ? '' : 'is-waiting'}`.trim()}>
            <Sparkle size={26} color={ready ? '#16A34A' : '#EA8C00'} strokeWidth={1.8} />
          </span>
          <h3>{ready ? "You're ready to publish!" : 'A few things still need you'}</h3>
          <p>
            {ready
              ? "We've checked everything and your event meets all the requirements."
              : 'Finish the unticked items below and this event will be ready to go live.'}
          </p>

          <ul className="evt-final__checks">
            {checklist.map((item) => (
              <li key={item.label} className={item.done ? 'is-done' : ''}>
                <CheckCircle size={17} color={item.done ? '#16A34A' : '#B4B2C0'} strokeWidth={2} />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.sub}</span>
                </div>
              </li>
            ))}
            <li className={ready ? 'is-done' : ''}>
              <CheckCircle size={17} color={ready ? '#16A34A' : '#B4B2C0'} strokeWidth={2} />
              <div>
                <strong>Ready to Publish</strong>
                <span>{ready ? 'Your event is good to go live!' : 'Not yet — see above.'}</span>
              </div>
            </li>
          </ul>

          <div className="evt-final__estimate">
            <strong>Estimated Participant Experience</strong>
            <ul>
              {experience.map(({ Icon, text }) => (
                <li key={text}>
                  <Icon size={14} color="#6D28FF" strokeWidth={1.9} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="wiz-stack">
          <section className="org-card wiz-panel">
            <span className="wiz-field__label">What happens next?</span>
            <ol className="evt-next">
              {NEXT_STEPS.map(({ Icon, title, sub }) => (
                <li key={title}>
                  <span className="evt-next__icon">
                    <Icon size={17} color="#6D28FF" strokeWidth={1.8} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="wiz-note">
            <span className="wiz-note__icon">
              <ShieldCheck size={17} color="#6D28FF" strokeWidth={1.9} />
            </span>
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
              You can still edit your event after publishing. Some changes may affect live
              registrations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
