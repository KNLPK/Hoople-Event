import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Who is signed in.
 *
 * Nothing is authenticated — this is a prototype. The store exists so the
 * navigation, My List and the avatar menu can show the real signed-in
 * experience once someone completes the Login step.
 */

const STORAGE_KEY = 'hoople.session';

export interface SessionUser {
  name: string;
  email: string;
}

/** The demo account every booking in the prototype belongs to. */
const DEMO_USER: SessionUser = {
  name: 'Adriani Ajeng',
  email: 'adriani.ajeng@gmail.com',
};

interface SessionValue {
  user: SessionUser | null;
  isSignedIn: boolean;
  signIn: (overrides?: Partial<SessionUser>) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

function readStored(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readStored);

  const signIn = useCallback((overrides?: Partial<SessionUser>) => {
    const next = { ...DEMO_USER, ...overrides };
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Storage is optional. */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Storage is optional. */
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, isSignedIn: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
