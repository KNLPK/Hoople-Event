import { Checkbox, FieldHead, SelectInput } from './WizardFields';
import { Calendar, Check, Clock, Globe } from '@/components/ui/icons';
import { TIMEZONE_OPTIONS, WEEKDAYS, type ActivityDraft, type Weekday } from '@/data/builder';

/** 2.2 — the window the activity runs in, and which weekdays it runs on. */
export function StepSchedule({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  function toggleDay(day: Weekday) {
    const on = draft.operatingDays.includes(day);
    set('operatingDays')(
      on
        ? draft.operatingDays.filter((item) => item !== day)
        : WEEKDAYS.filter((item) => item === day || draft.operatingDays.includes(item)),
    );
  }

  return (
    <>
      <p className="wiz-section__lede">
        Set the days and time range when your activity will be available.
      </p>

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <FieldHead
            label="Effective Period"
            hint="Choose the period when your activity will be available for booking."
          />
          <div className="wiz-period">
            <label className="field">
              <span className="block text-[13.5px] font-semibold text-ink">
                Start Date<span className="text-danger"> *</span>
              </span>
              <span className="wiz-date">
                <Calendar size={16} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="date"
                  value={draft.startDate}
                  aria-label="Start date"
                  onChange={(event) => set('startDate')(event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="block text-[13.5px] font-semibold text-ink">
                End Date <span className="font-normal text-grey">(Optional)</span>
              </span>
              <span className={`wiz-date ${draft.noEndDate ? 'is-off' : ''}`.trim()}>
                <Calendar size={16} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="date"
                  value={draft.endDate}
                  min={draft.startDate}
                  disabled={draft.noEndDate}
                  aria-label="End date"
                  onChange={(event) => set('endDate')(event.target.value)}
                />
              </span>
            </label>
          </div>

          <div className="mt-3.5">
            <Checkbox
              checked={draft.noEndDate}
              label="No end date (available indefinitely)"
              onChange={(checked) => {
                set('noEndDate')(checked);
                if (checked) set('endDate')('');
              }}
            />
          </div>
        </div>

        <div className="wiz-field wiz-field--ruled">
          <FieldHead label="Operating Days" required hint="Select the days when your activity runs." />
          <div className="wiz-days">
            {WEEKDAYS.map((day) => {
              const on = draft.operatingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  className={`wiz-day ${on ? 'is-on' : ''}`.trim()}
                  onClick={() => toggleDay(day)}
                  aria-pressed={on}
                >
                  <span className="wiz-day__mark">
                    {on ? <Check size={11} color="#fff" strokeWidth={3} /> : null}
                  </span>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="wiz-field">
          <FieldHead label="Timezone" hint="Select the timezone for your activity schedule." />
          <SelectInput
            ariaLabel="Timezone"
            value={draft.timezone}
            options={TIMEZONE_OPTIONS}
            onChange={set('timezone')}
            leading={<Globe size={16} color="#8B8A99" strokeWidth={1.9} />}
          />
        </div>

        <div className="wiz-note">
          <span className="flex-none flex mt-px">
            <Clock size={17} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <div>
            <strong>How it works</strong>
            <p>
              Participants will see the available sessions based on the operating days and time you
              set in the next step. You can always update this schedule anytime.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
