import { PublishSettings } from './PublishSettings';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Pencil,
  Shield,
  Tag,
  Tools,
  User,
  Users,
  Wallet,
} from '@/components/ui/icons';
import {
  CANCELLATION_POLICIES,
  DIFFICULTY_LEVELS,
  PREVIEW_FALLBACK,
  publishChecklist,
  slotsPerSession,
  venueLine,
  type ActivityDraft,
} from '@/data/builder';
import { WORKSPACE_INITIALS } from '@/data/organizer';
import { rupiah } from '@/lib/format';

/** 5.1 — everything the organizer built, in one glance, before it goes live. */
export function StepSummary({
  draft,
  set,
  onEdit,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
  onEdit: () => void;
}) {
  const toast = useToast();

  const live = draft.sessions.filter((session) => session.active);
  const policy = CANCELLATION_POLICIES.find((item) => item.value === draft.cancellation);
  const lead = draft.instructors.find((person) => person.name.trim() !== '');
  const badge = DIFFICULTY_LEVELS.find((level) => level.value === draft.difficulty)?.badge;
  const checklist = publishChecklist(draft);

  /* Every tile reads the draft — nothing here is written down twice. */
  const facts = [
    { Icon: Calendar, label: 'Sessions', value: `${live.length} session${live.length === 1 ? '' : 's'}` },
    { Icon: Wallet, label: 'Price per Session', value: rupiah(draft.price) },
    { Icon: Users, label: 'Max Participants', value: `${draft.defaultCapacity} participants` },
    { Icon: Clock, label: 'Booking Window', value: draft.bookingOpens },
    { Icon: Shield, label: 'Cancellation Policy', value: draft.cancellation, note: policy?.preview[0] },
    {
      Icon: User,
      label: 'Instructor',
      value: lead?.name ?? 'Not set',
      note: lead?.role,
    },
    {
      Icon: MapPin,
      label: 'Facilities',
      value: `${draft.facilities.length} facilit${draft.facilities.length === 1 ? 'y' : 'ies'}`,
      note: draft.facilities.join(', '),
    },
    {
      Icon: Tools,
      label: 'Equipment',
      value: `${draft.equipment.length} equipment item${draft.equipment.length === 1 ? '' : 's'}`,
      note: draft.equipment.map((item) => item.name).filter(Boolean).join(', '),
    },
  ];

  return (
    <>
      <p className="wiz-section__lede">Review your activity details before publishing.</p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <span className="wiz-field__label">Activity Summary</span>
            <button type="button" className="wiz-addsession" onClick={onEdit}>
              <Pencil size={13} color="#6D28FF" strokeWidth={2} />
              Edit
            </button>
          </div>

          <div className="wiz-sum">
            <div className="wiz-sum__media">
              <ImageSlot
                id="builder-cover"
                src={draft.cover}
                onChange={set('cover')}
                interactive={false}
                shape="rect"
                placeholder="Activity cover"
              />
              <span className="wiz-pv__category">{draft.category || PREVIEW_FALLBACK.category}</span>
            </div>

            <div>
              <h3 className="wiz-sum__title">{draft.title || PREVIEW_FALLBACK.title}</h3>
              <ul className="wiz-sum__meta">
                <li>
                  <MapPin size={14} color="#6D28FF" strokeWidth={1.9} />
                  {venueLine(draft)}
                </li>
                <li>
                  <Users size={14} color="#6D28FF" strokeWidth={1.9} />
                  {slotsPerSession(draft.sessions)} slots per session
                </li>
                <li>
                  <Clock size={14} color="#6D28FF" strokeWidth={1.9} />
                  {live.length > 1 ? 'Multiple sessions available' : 'One session per week'}
                </li>
                <li>
                  <Tag size={14} color="#6D28FF" strokeWidth={1.9} />
                  {badge}
                </li>
              </ul>
              <div className="wiz-pv__host">
                <span className="wiz-pv__avatar">{WORKSPACE_INITIALS}</span>
                by {draft.hostedAs}
              </div>
            </div>
          </div>

          <div className="wiz-facts">
            {facts.map(({ Icon, label, value, note }) => (
              <div key={label} className="wiz-fact">
                <span className="wiz-fact__head">
                  <Icon size={15} color="#6D28FF" strokeWidth={1.8} />
                  {label}
                </span>
                <strong>{value}</strong>
                {note ? (
                  <button
                    type="button"
                    className="wiz-fact__note"
                    onClick={() => toast(note)}
                    title={note}
                  >
                    {note}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <div className="wiz-pair">
          <section className="org-card wiz-panel">
            <span className="wiz-field__label">Publishing Checklist</span>
            <span className="wiz-field__hint">Make sure everything is ready to go live.</span>
            <ul className="wiz-checklist">
              {checklist.map((item) => (
                <li key={item.label} className={item.done ? 'is-done' : ''}>
                  <CheckCircle
                    size={16}
                    color={item.done ? '#16A34A' : '#B4B2C0'}
                    strokeWidth={2}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </section>

          <section className="org-card wiz-panel">
            <span className="wiz-field__label">Publish Settings</span>
            <span className="wiz-field__hint">
              Choose how and when your activity will be published.
            </span>
            {/* The same controls 5.3 owns, so the two screens cannot disagree. */}
            <PublishSettings draft={draft} set={set} compact />
          </section>
        </div>
      </div>
    </>
  );
}
