import { SelectInput } from '../WizardFields';
import { EventHead, type EventSetter } from './shared';
import { Globe, LinkChain, Lock, Palette } from '@/components/ui/icons';
import {
  AGE_RESTRICTIONS,
  AUDIENCES,
  EVENT_LANGUAGES,
  EVENT_THEMES,
  EVENT_VISIBILITY,
  type EventDraft,
  type EventVisibility,
} from '@/data/eventBuilder';

const VISIBILITY_ICON: Record<EventVisibility, React.ReactNode> = {
  Public: <Globe size={19} color="#6D28FF" strokeWidth={1.8} />,
  Unlisted: <LinkChain size={19} color="#5C5B6B" strokeWidth={1.8} />,
  Private: <Lock size={19} color="#5C5B6B" strokeWidth={1.8} />,
};


/** 1.2 — the details that help the right people find the event. */
export function EventExperience({ draft, set }: { draft: EventDraft; set: EventSetter }) {
  return (
    <>
      <EventHead
        lede="Add details to help people find and understand your event better."
        tip="The more details you provide, the easier it is for the right participants to discover your event."
      />

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <span className="wiz-field__label">Event Theme</span>
          <span className="wiz-field__hint">Choose a theme that best represents your event.</span>
          <SelectInput
            ariaLabel="Event theme"
            value={draft.theme}
            options={EVENT_THEMES}
            onChange={set('theme')}
            leading={<Palette size={16} color="#8B8A99" strokeWidth={1.8} />}
          />
        </div>

        <div className="wiz-triple">
          <div>
            <span className="wiz-field__label">Audience</span>
            <span className="wiz-field__hint">Who is this event for?</span>
            <SelectInput
              ariaLabel="Audience"
              value={draft.audience}
              options={AUDIENCES}
              onChange={set('audience')}
            />
          </div>
          <div>
            <span className="wiz-field__label">Language</span>
            <span className="wiz-field__hint">Primary language</span>
            <SelectInput
              ariaLabel="Language"
              value={draft.language}
              options={EVENT_LANGUAGES}
              onChange={set('language')}
            />
          </div>
          <div>
            <span className="wiz-field__label">Age Restriction</span>
            <span className="wiz-field__hint">Minimum age to join</span>
            <SelectInput
              ariaLabel="Age restriction"
              value={draft.ageRestriction}
              options={AGE_RESTRICTIONS}
              onChange={set('ageRestriction')}
            />
          </div>
        </div>

        <div className="wiz-field">
          <span className="wiz-field__label">Visibility</span>
          <span className="wiz-field__hint">Choose who can see and access your event.</span>
          <div className="wiz-vis">
            {EVENT_VISIBILITY.map((option) => (
              <label
                key={option.value}
                className={`wiz-vistile ${draft.visibility === option.value ? 'is-on' : ''}`.trim()}
              >
                <input
                  type="radio"
                  name="event-visibility"
                  className="sr-only"
                  checked={draft.visibility === option.value}
                  onChange={() => set('visibility')(option.value)}
                />
                <span className="wiz-vistile__top">
                  <span className="wiz-tile__radio" aria-hidden="true" />
                  {VISIBILITY_ICON[option.value]}
                  <span className="wiz-tile__title">{option.value}</span>
                </span>
                <span className="wiz-tile__sub">{option.sub}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
