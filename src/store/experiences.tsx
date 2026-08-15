import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  ORG_EXPERIENCES,
  type ExperienceTileKey,
  type Lifecycle,
  type OrgExperience,
  type PublishState,
} from '@/data/organizer';
import type { ActivityDraft } from '@/data/builder';
import type { EventDraft } from '@/data/eventBuilder';
import { APP_TODAY } from '@/data/activities';

/**
 * The experience ledger — the console's own writable data.
 *
 * The catalogue used to be a frozen array, so publishing an experience had
 * nowhere to go. Everything the console lists now reads from here: the
 * builders write into it, the list and its count tiles read back out, and a
 * draft keeps the builder payload that made it so it can be reopened and
 * finished later. It persists to `localStorage`, so a demo survives a reload.
 */

const STORAGE_KEY = 'hoople.experiences';

/** What a Draft row needs to reopen in the builder that created it. */
export type StoredDraft =
  | { kind: 'activity'; payload: ActivityDraft }
  | { kind: 'event'; payload: EventDraft };

export interface StoredExperience extends OrgExperience {
  draft?: StoredDraft;
  /** ISO date of the last write — the source of the "Last edited" note. */
  updatedAt?: string;
}

interface ExperiencesValue {
  experiences: StoredExperience[];
  categories: string[];
  count: (key: ExperienceTileKey) => number;
  get: (id: string) => StoredExperience | undefined;
  /** Writes a draft row and returns its id, so the builder can keep editing it. */
  saveActivity: (draft: ActivityDraft, options: WriteOptions) => string;
  saveEvent: (draft: EventDraft, options: WriteOptions) => string;
  remove: (id: string) => void;
  duplicate: (id: string) => string;
  setLifecycle: (id: string, lifecycle: Lifecycle) => void;
}

export interface WriteOptions {
  /** Omit to create; pass to update the row already being edited. */
  id?: string;
  /** `Draft` keeps it private; `Upcoming` publishes it. */
  lifecycle: Lifecycle;
}

const ExperiencesContext = createContext<ExperiencesValue | null>(null);

/* ---------- Persistence ---------- */

function read(): StoredExperience[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ORG_EXPERIENCES;
    const parsed = JSON.parse(raw) as StoredExperience[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ORG_EXPERIENCES;
  } catch {
    return ORG_EXPERIENCES;
  }
}

function write(experiences: StoredExperience[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(experiences));
  } catch {
    /* Quota exceeded — the session still works, it just will not survive a reload. */
  }
}

/* ---------- Draft payloads ---------- */

/**
 * Cover images and videos are data URLs and object URLs; both are far too
 * large (or meaningless) to persist. The image itself already lives in
 * `ImageSlot`'s own store, so the draft only has to remember the fields.
 */
function slimActivity(draft: ActivityDraft): ActivityDraft {
  return { ...draft, cover: undefined, videos: [] };
}

function slimEvent(draft: EventDraft): EventDraft {
  return { ...draft, cover: undefined };
}

/* ---------- Derived row fields ---------- */

function publishStateFor(lifecycle: Lifecycle): PublishState {
  if (lifecycle === 'Draft') return 'Draft';
  if (lifecycle === 'Cancelled') return 'Cancelled';
  return 'Published';
}

/** `Last edited just now`, `Last edited 2 days ago`, `Starts in 3 days`. */
function noteFor(lifecycle: Lifecycle, date: string, updatedAt: string): string {
  if (lifecycle === 'Draft') {
    const days = daysBetween(updatedAt, APP_TODAY);
    if (days <= 0) return 'Last edited just now';
    return `Last edited ${days} day${days === 1 ? '' : 's'} ago`;
  }
  if (lifecycle === 'Cancelled') return 'Cancelled';
  if (lifecycle === 'Completed') return 'Completed';
  const days = daysBetween(APP_TODAY, date);
  if (days < 0) return 'In progress';
  if (days === 0) return 'Starts today';
  return `Starts in ${days} day${days === 1 ? '' : 's'}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = Date.parse(fromISO);
  const to = Date.parse(toISO);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

function nextId(existing: StoredExperience[], prefix: string): string {
  const highest = existing.reduce((max, item) => {
    const digits = Number(item.id.replace(/\D/g, ''));
    return Number.isNaN(digits) ? max : Math.max(max, digits);
  }, 0);
  return `${prefix}${highest + 1}`;
}

/** An activity draft, seen as a row in the experience list. */
function activityRow(
  draft: ActivityDraft,
  id: string,
  lifecycle: Lifecycle,
  updatedAt: string,
): StoredExperience {
  const live = draft.sessions.filter((session) => session.active);
  const first = live[0];
  const capacity = live.reduce((total, session) => total + session.slots, 0);
  return {
    id,
    title: draft.title || 'Untitled activity',
    kind: 'ACTIVITY',
    publishState: publishStateFor(lifecycle),
    lifecycle,
    note: noteFor(lifecycle, draft.startDate, updatedAt),
    category: draft.category || 'Uncategorised',
    date: draft.startDate,
    start: first?.start ?? '09:00',
    end: first?.end ?? '11:00',
    venue: draft.venueName || 'Venue not set',
    registered: 0,
    capacity,
    revenue: 0,
    photoHint: draft.title || 'Activity cover',
    draft: { kind: 'activity', payload: slimActivity(draft) },
    updatedAt,
  };
}

/** An event draft, seen as a row in the experience list. */
function eventRow(
  draft: EventDraft,
  id: string,
  lifecycle: Lifecycle,
  updatedAt: string,
): StoredExperience {
  const capacity = draft.tickets
    .filter((ticket) => ticket.active)
    .reduce((total, ticket) => total + (ticket.capacity ?? 0), 0);
  return {
    id,
    title: draft.title || 'Untitled event',
    kind: 'EVENT',
    publishState: publishStateFor(lifecycle),
    lifecycle,
    note: noteFor(lifecycle, draft.startDate, updatedAt),
    category: draft.category || 'Uncategorised',
    date: draft.startDate,
    start: draft.startTime,
    end: draft.endTime,
    venue: draft.eventType === 'Online' ? 'Online event' : draft.venueName || 'Venue not set',
    registered: 0,
    capacity,
    revenue: 0,
    photoHint: draft.title || 'Event cover',
    draft: { kind: 'event', payload: slimEvent(draft) },
    updatedAt,
  };
}

/* ---------- Provider ---------- */

export function ExperiencesProvider({ children }: { children: React.ReactNode }) {
  const [experiences, setExperiences] = useState<StoredExperience[]>(read);

  const commit = useCallback((next: StoredExperience[]) => {
    setExperiences(next);
    write(next);
  }, []);

  /** New rows go to the top so the organizer sees what they just made. */
  const upsert = useCallback(
    (row: StoredExperience, isNew: boolean) => {
      setExperiences((current) => {
        const next = isNew
          ? [row, ...current]
          : current.map((item) => (item.id === row.id ? row : item));
        write(next);
        return next;
      });
      return row.id;
    },
    [],
  );

  const saveActivity = useCallback(
    (draft: ActivityDraft, { id, lifecycle }: WriteOptions) => {
      const rowId = id ?? nextId(experiences, 'x');
      return upsert(activityRow(draft, rowId, lifecycle, APP_TODAY), !id);
    },
    [experiences, upsert],
  );

  const saveEvent = useCallback(
    (draft: EventDraft, { id, lifecycle }: WriteOptions) => {
      const rowId = id ?? nextId(experiences, 'x');
      return upsert(eventRow(draft, rowId, lifecycle, APP_TODAY), !id);
    },
    [experiences, upsert],
  );

  const remove = useCallback(
    (id: string) => commit(experiences.filter((item) => item.id !== id)),
    [commit, experiences],
  );

  const duplicate = useCallback(
    (id: string) => {
      const source = experiences.find((item) => item.id === id);
      if (!source) return id;
      const copy: StoredExperience = {
        ...source,
        id: nextId(experiences, 'x'),
        title: `${source.title} (copy)`,
        lifecycle: 'Draft',
        publishState: 'Draft',
        note: 'Last edited just now',
        registered: 0,
        revenue: 0,
        updatedAt: APP_TODAY,
      };
      commit([copy, ...experiences]);
      return copy.id;
    },
    [commit, experiences],
  );

  const setLifecycle = useCallback(
    (id: string, lifecycle: Lifecycle) =>
      commit(
        experiences.map((item) =>
          item.id === id
            ? {
                ...item,
                lifecycle,
                publishState: publishStateFor(lifecycle),
                note: noteFor(lifecycle, item.date, item.updatedAt ?? APP_TODAY),
              }
            : item,
        ),
      ),
    [commit, experiences],
  );

  const value = useMemo<ExperiencesValue>(
    () => ({
      experiences,
      categories: [...new Set(experiences.map((item) => item.category))].sort(),
      count: (key) => {
        if (key === 'all') return experiences.length;
        if (key === 'published') {
          return experiences.filter((item) => item.publishState === 'Published').length;
        }
        const lifecycle = (key[0].toUpperCase() + key.slice(1)) as Lifecycle;
        return experiences.filter((item) => item.lifecycle === lifecycle).length;
      },
      get: (id) => experiences.find((item) => item.id === id),
      saveActivity,
      saveEvent,
      remove,
      duplicate,
      setLifecycle,
    }),
    [experiences, saveActivity, saveEvent, remove, duplicate, setLifecycle],
  );

  return <ExperiencesContext.Provider value={value}>{children}</ExperiencesContext.Provider>;
}

export function useExperiences(): ExperiencesValue {
  const value = useContext(ExperiencesContext);
  if (!value) throw new Error('useExperiences must be used inside <ExperiencesProvider>');
  return value;
}
