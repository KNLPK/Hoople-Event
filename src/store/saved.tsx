import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * The heart / save-for-later list behind "My List".
 *
 * Keys are namespaced (`activity:pottery-class`) so an activity and an event
 * can never collide on the same slug.
 */

const STORAGE_KEY = 'hoople.saved';

export type SavedKind = 'activity' | 'event';
export type SavedKey = `${SavedKind}:${string}`;

export function savedKey(kind: SavedKind, slug: string): SavedKey {
  return `${kind}:${slug}`;
}

export function parseSavedKey(key: SavedKey): { kind: SavedKind; slug: string } {
  const separator = key.indexOf(':');
  return {
    kind: key.slice(0, separator) as SavedKind,
    slug: key.slice(separator + 1),
  };
}

interface SavedValue {
  saved: SavedKey[];
  count: number;
  isSaved: (key: SavedKey) => boolean;
  toggle: (key: SavedKey) => void;
}

const SavedContext = createContext<SavedValue | null>(null);

export function useSaved(): SavedValue {
  const value = useContext(SavedContext);
  if (!value) throw new Error('useSaved must be used inside <SavedProvider>');
  return value;
}

function readStored(): SavedKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedKey[]) : [];
  } catch {
    return [];
  }
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedKey[]>(readStored);

  const toggle = useCallback((key: SavedKey) => {
    setSaved((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [key, ...current];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* Storage is optional. */
      }
      return next;
    });
  }, []);

  const value = useMemo<SavedValue>(
    () => ({
      saved,
      count: saved.length,
      isSaved: (key) => saved.includes(key),
      toggle,
    }),
    [saved, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}
