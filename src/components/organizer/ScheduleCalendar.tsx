import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { monthLabel, parseISODate, toISODate, WEEKDAY_LABELS } from '@/lib/format';
import { WEEKDAYS, type Weekday } from '@/data/builder';

/**
 * The month calendar in 2.2, in both of its moods.
 *
 * Weekly: the pattern from Operating Days is painted across the month and a
 * click lifts one date out of it — the public holiday, the day the studio is
 * booked for something else. The pattern stays intact underneath, so switching
 * the weekday back on does not lose the exception.
 *
 * Exact dates: nothing is painted until the organizer picks it. A short course
 * that runs on four specific Saturdays is not a weekly pattern and should not
 * have to be described as one.
 *
 * Either way a date outside the effective period is not offered at all — the
 * period is the outer bound, and a calendar that let you pick past it would be
 * lying about what is bookable.
 */

const MS_DAY = 86_400_000;

export interface ScheduleCalendarProps {
  /** Weekly pattern, or exact dates. */
  repeatWeekly: boolean;
  startDate: string;
  /** Empty when the activity has no end date. */
  endDate: string;
  operatingDays: Weekday[];
  /** Dates lifted out of the weekly pattern. */
  skippedDates: string[];
  /** The only dates that run, when not repeating weekly. */
  pickedDates: string[];
  onSkippedChange: (dates: string[]) => void;
  onPickedChange: (dates: string[]) => void;
}

/** `Date.getDay()` is Sunday-first; the design's week starts on Monday. */
const WEEKDAY_OF: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toggle(list: string[], iso: string): string[] {
  return list.includes(iso) ? list.filter((item) => item !== iso) : [...list, iso].sort();
}

export function ScheduleCalendar({
  repeatWeekly,
  startDate,
  endDate,
  operatingDays,
  skippedDates,
  pickedDates,
  onSkippedChange,
  onPickedChange,
}: ScheduleCalendarProps) {
  const anchor = parseISODate(startDate || toISODate(new Date()));
  const [view, setView] = useState({ year: anchor.getFullYear(), month: anchor.getMonth() });

  const from = startDate ? parseISODate(startDate) : null;
  const to = endDate ? parseISODate(endDate) : null;

  /* Monday-first grid, padded out so the first of the month lands in its
     column and the last row is complete. */
  const first = new Date(view.year, view.month, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.year, view.month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function step(by: number) {
    setView((current) => {
      const next = new Date(current.year, current.month + by, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="wiz-cal">
      <div className="wiz-cal__head">
        <button
          type="button"
          className="wiz-iconbtn wiz-iconbtn--ghost"
          onClick={() => step(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} color="#8B8A99" strokeWidth={2} />
        </button>
        <strong>{monthLabel(view.year, view.month)}</strong>
        <button
          type="button"
          className="wiz-iconbtn wiz-iconbtn--ghost"
          onClick={() => step(1)}
          aria-label="Next month"
        >
          <ChevronRight size={16} color="#8B8A99" strokeWidth={2} />
        </button>
      </div>

      <div className="wiz-cal__grid" role="grid" aria-label="Availability calendar">
        {WEEKDAYS.map((day) => (
          <span key={day} className="wiz-cal__dow" aria-hidden="true">
            {day.slice(0, 2)}
          </span>
        ))}

        {rows.flat().map((date, index) => {
          if (!date) return <span key={`pad-${index}`} className="wiz-cal__pad" aria-hidden="true" />;

          const iso = toISODate(date);
          const beforeStart = from ? date.getTime() < from.getTime() - MS_DAY / 2 : false;
          const afterEnd = to ? date.getTime() > to.getTime() + MS_DAY / 2 : false;
          const outside = beforeStart || afterEnd;

          const weekday = WEEKDAY_OF[date.getDay()];
          const inPattern = operatingDays.includes(weekday);
          const skipped = skippedDates.includes(iso);
          const picked = pickedDates.includes(iso);

          const on = repeatWeekly ? inPattern && !skipped && !outside : picked && !outside;
          /* A skipped day still shows where the pattern would have run. */
          const ghost = repeatWeekly && inPattern && skipped && !outside;

          const label = date.getDate();
          const state = outside
            ? 'is-outside'
            : on
              ? 'is-on'
              : ghost
                ? 'is-skipped'
                : '';

          return (
            <button
              key={iso}
              type="button"
              className={`wiz-cal__day ${state}`.trim()}
              disabled={outside}
              aria-pressed={on}
              aria-label={`${WEEKDAY_LABELS[date.getDay()]} ${label} ${monthLabel(view.year, view.month)}${
                outside ? ' — outside the effective period' : ''
              }`}
              onClick={() =>
                repeatWeekly
                  ? onSkippedChange(toggle(skippedDates, iso))
                  : onPickedChange(toggle(pickedDates, iso))
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="wiz-cal__key">
        <span>
          <i className="wiz-cal__swatch wiz-cal__swatch--on" />
          Available
        </span>
        {repeatWeekly ? (
          <span>
            <i className="wiz-cal__swatch wiz-cal__swatch--skipped" />
            Skipped
          </span>
        ) : null}
        <span>
          <i className="wiz-cal__swatch wiz-cal__swatch--off" />
          Not running
        </span>
      </div>
    </div>
  );
}
