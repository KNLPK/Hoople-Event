import { ChoiceTile, CounterArea, CounterInput, SelectInput } from '../WizardFields';
import { EventHead, type EventSetter } from './shared';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Building, Camera, Monitor, Users } from '@/components/ui/icons';
import {
  EVENT_CATEGORIES,
  EVENT_SUMMARY_LIMIT,
  EVENT_TITLE_LIMIT,
  EVENT_TYPES,
  type EventDraft,
  type EventType,
} from '@/data/eventBuilder';

export const TYPE_ICON: Record<EventType, React.ReactNode> = {
  Offline: <Building size={18} color="#6D28FF" strokeWidth={1.8} />,
  Online: <Monitor size={18} color="#5C5B6B" strokeWidth={1.8} />,
  Hybrid: <Users size={18} color="#5C5B6B" strokeWidth={1.8} />,
};

/** 1.1 — what the event is called and what it looks like on a card. */
export function EventIdentity({ draft, set }: { draft: EventDraft; set: EventSetter }) {
  return (
    <>
      <EventHead
        lede="Tell us the basic identity of your event."
        tip="A clear title and cover image will attract more participants!"
      />

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <span className="wiz-field__label">
            Cover Image<span className="field__req"> *</span>
          </span>
          <span className="wiz-field__hint">This will be the main image on your event page.</span>

          <div className="evt-cover">
            {/* Both halves fill the same slot, so either one sets the cover. */}
            <div className="evt-cover__drop">
              <ImageSlot
                id="event-cover"
                src={draft.cover}
                onChange={set('cover')}
                radius={12}
                placeholder="Upload cover image"
                hint="JPG, PNG • Recommended 16:9 (1920x1080)"
              />
              <span className="evt-cover__browse">Browse File</span>
            </div>

            <div className="evt-cover__preview">
              <ImageSlot
                id="event-cover"
                src={draft.cover}
                onChange={set('cover')}
                radius={12}
                placeholder="Cover preview"
              />
              <span className="evt-cover__change">
                <Camera size={13} color="#12121A" strokeWidth={1.9} />
                Change Image
              </span>
            </div>
          </div>
        </div>

        <div className="wiz-field">
          <span className="wiz-field__label">
            Event Title<span className="field__req"> *</span>
          </span>
          <span className="wiz-field__hint">Write a title that's clear, specific, and catchy.</span>
          <CounterInput
            ariaLabel="Event title"
            value={draft.title}
            onChange={set('title')}
            limit={EVENT_TITLE_LIMIT}
            placeholder="Enter your event title"
          />
        </div>

        <div className="wiz-field">
          <span className="wiz-field__label">
            Event Category<span className="field__req"> *</span>
          </span>
          <span className="wiz-field__hint">
            How it is filed on the discovery pages. Offline, online or hybrid is asked in the next
            section, beside the venue it decides.
          </span>
          <SelectInput
            ariaLabel="Event category"
            value={draft.category}
            options={EVENT_CATEGORIES}
            placeholder="Select a category"
            onChange={set('category')}
          />
        </div>

        <div className="wiz-field">
          <span className="wiz-field__label">
            Short Description<span className="field__req"> *</span>
          </span>
          <span className="wiz-field__hint">Describe your event in a short and engaging way.</span>
          <CounterArea
            ariaLabel="Short description"
            value={draft.summary}
            onChange={set('summary')}
            limit={EVENT_SUMMARY_LIMIT}
            placeholder="Write a short description about your event"
            rows={3}
          />
        </div>
      </div>
    </>
  );
}

/* Keeps the tile shape available to 2.1, which repeats the same three choices. */
export function EventTypeTiles({ draft, set }: { draft: EventDraft; set: EventSetter }) {
  return (
    <div className="wiz-tiles wiz-tiles--3">
      {EVENT_TYPES.map((option) => (
        <ChoiceTile
          key={option.value}
          name="event-type"
          checked={draft.eventType === option.value}
          onSelect={() => set('eventType')(option.value)}
          title={option.value}
          sub={option.sub}
          icon={TYPE_ICON[option.value]}
        />
      ))}
    </div>
  );
}
