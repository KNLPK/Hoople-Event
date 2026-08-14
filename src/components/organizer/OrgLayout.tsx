import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { OrgSidebar } from './OrgSidebar';
import { OrgTopbar, type OrgTopbarProps } from './OrgTopbar';

/** Focused flows swap the topbar's search for their own chrome. */
const TOPBAR_CHROME: Record<string, OrgTopbarProps> = {
  '/organizer/create': {
    back: { label: 'Back to Experiences', to: '/organizer/experiences' },
  },
  '/organizer/create/activity': {
    heading: { title: 'Create Activity', sub: "Let's build an amazing activity experience." },
  },
  '/organizer/create/event': {
    heading: { title: 'Create Event', sub: "Let's build an amazing experience for your community." },
  },
};

/**
 * The organizer console shell. It deliberately shares Hoople's palette and
 * type with the participant site, but none of its chrome — this is the other
 * half of the platform, not another page of the same site.
 */
export function OrgLayout() {
  const { pathname } = useLocation();
  /* On phones the rail is an off-canvas drawer; on desktop it is always there. */
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.dataset.surface = 'console';
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-locked');
    };
  }, [navOpen]);

  return (
    <div className={`org ${navOpen ? 'is-nav-open' : ''}`.trim()}>
      <OrgSidebar onClose={() => setNavOpen(false)} />
      {navOpen ? (
        <button
          type="button"
          className="org__scrim"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        />
      ) : null}

      <div className="org__main">
        <OrgTopbar {...TOPBAR_CHROME[pathname]} onOpenNav={() => setNavOpen(true)} />
        <div className="org__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
