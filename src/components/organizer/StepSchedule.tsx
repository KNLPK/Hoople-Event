import { Checkbox, FieldHead, SelectInput } from './WizardFields';
import { ScheduleCalendar } from './ScheduleCalendar';
import { Calendar, Check, Clock, Globe } from '@/components/ui/icons';
import { compactDate } from '@/lib/format';
import { TIMEZONE_OPTIONS, WEEKDAYS, type ActivityDraft, type Weekday } from '@/data/builder';

/** 2.2 — the window the activity runs in, and which dates inside it it runs on. */
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

  const skipped = draft.skippedDates.length;
  const picked = draft.pickedDates.length;

  return (
    <>
      <p className="wiz-section__lede">
        Set the period your activity runs in, then choose the dates inside it.
      </p>

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <FieldHead
            label="Effective Period"
            hint="The window your activity is bookable in. Dates outside it cannot be selected."
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
          <FieldHead
            label="Availability"
            required
            hint="Pick the dates your activity runs on, or let it repeat on the same days each week."
          />

          <div className="mb-4">
            <Checkbox
              checked={draft.repeatWeekly}
              label="Repeat every week"
              onChange={(checked) => set('repeatWeekly')(checked)}
            />
          </div>

          {/* Weekdays only mean anything when there is a weekly pattern. */}
          {draft.repeatWeekly ? (
            <div className="mb-4.5">
              <span className="block text-[13.5px] font-semibold text-ink mb-2.5">
                Operating Days<span className="text-danger"> *</span>
              </span>
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
          ) : null}

          <ScheduleCalendar
            repeatWeekly={draft.repeatWeekly}
            startDate={draft.startDate}
            endDate={draft.noEndDate ? '' : draft.endDate}
            operatingDays={draft.operatingDays}
            skippedDates={draft.skippedDates}
            pickedDates={draft.pickedDates}
            onSkippedChange={set('skippedDates')}
            onPickedChange={set('pickedDates')}
          />

          <p className="text-[12.5px] text-grey mt-3">
            {draft.repeatWeekly
              ? skipped === 0
                ? 'Click a date to take it out — a public holiday, or a day the space is booked.'
                : `${skipped} date${skipped === 1 ? '' : 's'} taken out of the weekly pattern.`
              : picked === 0
                ? 'Click the dates this activity runs on. Nothing repeats until you turn that on.'
                : `Runs on ${picked} date${picked === 1 ? '' : 's'}${
                    picked > 0 ? `, starting ${compactDate([...draft.pickedDates].sort()[0])}` : ''
                  }.`}
          </p>
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
              Participants will see the available sessions based on the dates and time you set in
              the next step. You can always update this schedule anytime.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
