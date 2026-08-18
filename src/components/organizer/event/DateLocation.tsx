import { SelectInput, Toggle } from '../WizardFields';
import { EventTypeTiles } from './Identity';
import { EventHead, type EventSectionProps } from './shared';
import { ArrowRight, Calendar, Clock, Info } from '@/components/ui/icons';
import { EVENT_TIMEZONES } from '@/data/eventBuilder';

const PLACE_NOTE: Record<string, string> = {
  Offline: 'You can set venue details in the next section.',
  Online: 'You can set the meeting platform and link in the next section.',
  Hybrid: 'You can set both the venue and the meeting link in the next section.',
};

/** 2.1 — when the event runs, and which shape it takes. */
export function EventDateLocation({ draft, set }: EventSectionProps) {
  return (
    <>
      <EventHead
        lede="Set when and where your event will take place."
        tip="Choosing the right date, time, and location helps maximize attendance."
      />

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <span className="wiz-field__label">Date &amp; Time</span>
          <span className="wiz-field__hint">Choose the date and time for your event.</span>

          <div className="evt-when">
            <label className="evt-when__field">
              <span>Start Date</span>
              <span className="wiz-date">
                <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="date"
                  value={draft.startDate}
                  aria-label="Start date"
                  onChange={(event) => set('startDate')(event.target.value)}
                />
              </span>
            </label>

            <label className="evt-when__field">
              <span>Start Time</span>
              <span className={`wiz-date ${draft.allDay ? 'is-off' : ''}`.trim()}>
                <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="time"
                  value={draft.startTime}
                  disabled={draft.allDay}
                  aria-label="Start time"
                  onChange={(event) => set('startTime')(event.target.value)}
                />
              </span>
            </label>

            <span className="evt-when__arrow" aria-hidden="true">
              <ArrowRight size={15} color="#B4B2C0" strokeWidth={2} />
            </span>

            <label className="evt-when__field">
              <span>End Date</span>
              <span className="wiz-date">
                <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="date"
                  value={draft.endDate}
                  min={draft.startDate}
                  aria-label="End date"
                  onChange={(event) => set('endDate')(event.target.value)}
                />
              </span>
            </label>

            <label className="evt-when__field">
              <span>End Time</span>
              <span className={`wiz-date ${draft.allDay ? 'is-off' : ''}`.trim()}>
                <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="time"
                  value={draft.endTime}
                  disabled={draft.allDay}
                  aria-label="End time"
                  onChange={(event) => set('endTime')(event.target.value)}
                />
              </span>
            </label>
          </div>
        </div>

        <div className="wiz-field">
          <span className="wiz-field__label">Time Zone</span>
          <SelectInput
            ariaLabel="Time zone"
            value={draft.timezone}
            options={EVENT_TIMEZONES}
            onChange={set('timezone')}
          />
        </div>

        <div className="wiz-field">
          <Toggle
            checked={draft.allDay}
            onChange={set('allDay')}
            label="All-day event"
            hint="Display this as an all-day event without specific start and end time."
          />
        </div>

        <div className="wiz-field wiz-field--ruled">
          <span className="wiz-field__label">Event Type</span>
          <span className="wiz-field__hint">Choose how your event will be hosted.</span>
          <EventTypeTiles draft={draft} set={set} />

          {/* Changing the type here rewrites the next two sub-sections. */}
          <div className="wiz-note" style={{ marginTop: 16 }}>
            <span className="wiz-note__icon">
              <Info size={16} color="#6D28FF" strokeWidth={1.9} />
            </span>
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{PLACE_NOTE[draft.eventType]}</p>
          </div>
        </div>
      </div>
    </>
  );
}
