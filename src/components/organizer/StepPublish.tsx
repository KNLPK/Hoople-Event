import { Checkbox, RadioRow } from './WizardFields';
import {
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  LinkChain,
  Lock,
  Sparkle,
} from '@/components/ui/icons';
import {
  VISIBILITY_OPTIONS,
  publishChecklist,
  type ActivityDraft,
  type Visibility,
} from '@/data/builder';

const VISIBILITY_ICON: Record<Visibility, React.ReactNode> = {
  Public: <Globe size={19} color="#6D28FF" strokeWidth={1.8} />,
  Unlisted: <LinkChain size={19} color="#5C5B6B" strokeWidth={1.8} />,
  Private: <Lock size={19} color="#5C5B6B" strokeWidth={1.8} />,
};

/** 5.3 — who can see it, when it goes live, and the last look before it does. */
export function StepPublish({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const checklist = publishChecklist(draft);
  const ready = checklist.every((item) => item.done);

  return (
    <>
      <p className="wiz-section__lede">Choose how and when your activity will be published.</p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <span className="block text-[13.5px] font-semibold text-ink">Visibility</span>
          <span className="wiz-field__hint">Control who can discover and book this activity.</span>
          <div className="wiz-vis">
            {VISIBILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`wiz-vistile ${draft.visibility === option.value ? 'is-on' : ''}`.trim()}
              >
                <input
                  type="radio"
                  name="visibility-final"
                  className="sr-only"
                  checked={draft.visibility === option.value}
                  onChange={() => set('visibility')(option.value)}
                />
                <span className="wiz-vistile__top">
                  {VISIBILITY_ICON[option.value]}
                  <span className="wiz-tile__radio" aria-hidden="true" />
                </span>
                <span className="wiz-tile__title">{option.value}</span>
                <span className="block text-[12px] text-grey mt-[3px] leading-[1.45]">{option.sub}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="org-card wiz-panel">
          <span className="block text-[13.5px] font-semibold text-ink">Publish Date &amp; Time</span>
          <span className="wiz-field__hint">Choose when your activity goes live.</span>
          <div className="wiz-schedule">
            <div>
              <RadioRow
                name="when-final"
                checked={draft.publishWhen === 'now'}
                onSelect={() => set('publishWhen')('now')}
                title="Publish now"
                sub="Make this activity live immediately."
              />
              <RadioRow
                name="when-final"
                checked={draft.publishWhen === 'later'}
                onSelect={() => set('publishWhen')('later')}
                title="Schedule for later"
                sub="Set a future date and time to publish."
              />
            </div>
            <div className={`wiz-when ${draft.publishWhen === 'now' ? 'is-off' : ''}`.trim()}>
              <span className="wiz-date">
                <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="date"
                  value={draft.publishDate}
                  disabled={draft.publishWhen === 'now'}
                  aria-label="Publish date"
                  onChange={(event) => set('publishDate')(event.target.value)}
                />
              </span>
              <span className="wiz-date">
                <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="time"
                  value={draft.publishTime}
                  disabled={draft.publishWhen === 'now'}
                  aria-label="Publish time"
                  onChange={(event) => set('publishTime')(event.target.value)}
                />
              </span>
            </div>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <span className="block text-[13.5px] font-semibold text-ink">Additional Settings</span>
          <div className="wiz-extrasettings">
            <div>
              <Checkbox
                checked={draft.showOnDiscovery}
                onChange={set('showOnDiscovery')}
                label="Show activity on Hoople discovery"
              />
              <span className="wiz-field__hint">Make your activity visible on the Hoople platform.</span>
            </div>
            <div>
              <Checkbox
                checked={draft.allowWaitlist}
                onChange={set('allowWaitlist')}
                label="Allow waitlist when session is full"
              />
              <span className="wiz-field__hint">
                Participants can join the waitlist if a session is fully booked.
              </span>
            </div>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <span className="block text-[13.5px] font-semibold text-ink">Before you publish</span>
          <div className="wiz-before">
            <ul className="wiz-checklist">
              {checklist.map((item) => (
                <li key={item.label} className={item.done ? 'is-done' : ''}>
                  <CheckCircle size={16} color={item.done ? '#16A34A' : '#B4B2C0'} strokeWidth={2} />
                  {item.label}
                </li>
              ))}
            </ul>

            <aside className={`wiz-almost ${ready ? '' : 'is-waiting'}`.trim()}>
              <span className="flex-none flex mt-px">
                <Sparkle size={18} color={ready ? '#16A34A' : '#EA8C00'} strokeWidth={1.9} />
              </span>
              <div>
                <strong>{ready ? "You're almost there!" : 'A few things still need you'}</strong>
                <p>
                  {ready
                    ? 'Once published, participants will be able to discover and book your activity.'
                    : 'Finish the unticked items above and this activity will be ready to go live.'}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
