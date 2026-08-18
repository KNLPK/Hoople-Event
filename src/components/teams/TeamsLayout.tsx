import { useEffect, useState } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { TeamsSidebar } from './TeamsSidebar';
import { TeamsTopbar } from './TeamsTopbar';
import { DEFAULT_EVENT_ID, getTeamEvent } from '@/data/teams';

/** What the top strip says on each view. */
const TITLES: Record<string, { title: string; sub?: string }> = {
  '/teams': { title: 'Experience Dashboard', sub: 'Overview of your experience performance and activity.' },
  '/teams/experiences': { title: 'Experiences', sub: 'Every event your organization is running internally.' },
  '/teams/registrations': { title: 'Registrations', sub: 'Manage and track members who registered.' },
  '/teams/sessions': { title: 'Sessions', sub: 'Manage your event sessions and capacity.' },
  '/teams/check-in': { title: 'Check-in', sub: 'Monitor real-time check-in and attendance.' },
  '/teams/analytics': { title: 'Analytics', sub: 'Track performance and gain insights about your event.' },
  '/teams/orders': { title: 'Orders', sub: 'Every contribution collected for this event.' },
  '/teams/payments': { title: 'Payments & Payout', sub: 'Track collections, fees, and settlement.' },
  '/teams/settings': { title: 'Settings', sub: 'How this organization runs its internal events.' },
  '/teams/profile': { title: 'Organizer Profile', sub: 'How your organization appears to its members.' },
};

/**
 * Shell for Hoople for Teams — the internal-events console.
 *
 * Reuses the organizer console's chrome and palette on purpose: an admin who
 * knows one should not have to learn the other. What differs is the scope —
 * this console works one event at a time, held in `?e=`, so a reload or a
 * shared link lands on the same event rather than a default.
 */
export function TeamsLayout() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);

  const event = getTeamEvent(params.get('e') ?? DEFAULT_EVENT_ID);

  useEffect(() => {
    window.scrollTo(0, 0);
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.dataset.surface = 'console';
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-locked');
    };
  }, [navOpen]);

  const chrome = TITLES[pathname] ?? TITLES['/teams'];

  return (
    <div className={`org ${navOpen ? 'is-nav-open' : ''}`.trim()}>
      <TeamsSidebar eventId={event.id} onClose={() => setNavOpen(false)} />
      {navOpen ? (
        <button
          type="button"
          className="org__scrim"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        />
      ) : null}

      <div className="min-w-0 flex flex-col">
        <TeamsTopbar {...chrome} eventId={event.id} onOpenNav={() => setNavOpen(true)} />
        <div className="pt-[22px] px-[26px] pb-[46px] min-w-0 to-1000:pt-4 to-1000:px-gutter to-1000:pb-10">
          <Outlet context={event} />
        </div>
      </div>
    </div>
  );
}
