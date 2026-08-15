import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/store/session';

/**
 * A signed-in gate.
 *
 * The console is gated at the door — an organizer signs in before they see
 * anything. The participant site is not: people browse freely and only meet
 * this at the payment step, which is why the gate carries `next` so they land
 * back exactly where they were rather than on the home page.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useSession();
  const location = useLocation();

  if (!isSignedIn) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
