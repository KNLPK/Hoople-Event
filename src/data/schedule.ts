import { parseISODate, toISODate } from '@/lib/format';
import { ACTIVITIES, APP_TODAY } from './activities';
import type { Activity, Session } from './types';

/**
 * Sessions are stored as weekly templates. Everything the UI shows — the date
 * strip, the calendar dots, "Today's Sessions" — is derived here so a single
 * template edit updates every surface.
 */

const TODAY = parseISODate(APP_TODAY);

function isPast(iso: string): boolean {
  return parseISODate(iso).getTime() < TODAY.getTime();
}

/** Concrete sessions an activity runs on `iso`. Empty for past or closed days. */
export function sessionsOn(activity: Activity, iso: string): Session[] {
  if (isPast(iso)) return [];
  const weekday = parseISODate(iso).getDay();
  if (activity.closedWeekdays.includes(weekday)) return [];
  return activity.sessions
    .filter((template) => template.weekdays.includes(weekday))
    .map(({ weekdays: _weekdays, ...template }) => ({ ...template, date: iso }));
}

export function sessionCountOn(activity: Activity, iso: string): number {
  return sessionsOn(activity, iso).length;
}

/** The next running session on or after `fromIso`, looking up to 120 days ahead. */
export function nextSession(activity: Activity, fromIso = APP_TODAY): Session | undefined {
  const cursor = parseISODate(fromIso);
  for (let i = 0; i < 120; i += 1) {
    const iso = toISODate(cursor);
    const [first] = sessionsOn(activity, iso);
    if (first) return first;
    cursor.setDate(cursor.getDate() + 1);
  }
  return undefined;
}

/** The next `count` calendar days starting at `startIso`, for the date strip. */
export function dateStrip(activity: Activity, startIso: string, count = 7) {
  const cursor = parseISODate(startIso);
  return Array.from({ length: count }, () => {
    const iso = toISODate(cursor);
    const sessions = sessionsOn(activity, iso);
    cursor.setDate(cursor.getDate() + 1);
    return { iso, sessions, count: sessions.length };
  });
}

export interface CalendarCell {
  iso: string | null;
  day: number | null;
  available: boolean;
}

/** A 7-column month grid, leading-padded so the 1st lands on the right weekday. */
export function monthGrid(activity: Activity, year: number, monthIndex: number): CalendarCell[] {
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: CalendarCell[] = Array.from({ length: leadingBlanks }, () => ({
    iso: null,
    day: null,
    available: false,
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toISODate(new Date(year, monthIndex, day));
    cells.push({ iso, day, available: sessionCountOn(activity, iso) > 0 });
  }
  return cells;
}

export interface DatedSession {
  activity: Activity;
  session: Session;
}

/** Every session running on `iso`, across the whole catalogue. */
export function sessionsAcrossCatalogue(iso: string): DatedSession[] {
  return ACTIVITIES.flatMap((activity) =>
    sessionsOn(activity, iso).map((session) => ({ activity, session })),
  ).sort((a, b) => a.session.start.localeCompare(b.session.start));
}

/** Sessions running today — the "Today's Sessions" rail. */
export function todaysSessions(limit = 5): DatedSession[] {
  return sessionsAcrossCatalogue(APP_TODAY).slice(0, limit);
}

/** Activities with at least one session on Saturday or Sunday of the current week. */
export function weekendActivities(): Activity[] {
  const cursor = parseISODate(APP_TODAY);
  const weekend: string[] = [];
  for (let i = 0; i < 7 && weekend.length < 2; i += 1) {
    const weekday = cursor.getDay();
    if (weekday === 6 || weekday === 0) weekend.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return ACTIVITIES.filter((activity) => weekend.some((iso) => sessionCountOn(activity, iso) > 0));
}
