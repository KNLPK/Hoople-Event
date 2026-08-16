import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import { Bell, ChevronDown, Gear, Grid, Menu } from '@/components/ui/icons';
import { ORG_ADMIN, ORGANIZATION } from '@/data/teams';

const NOTIFICATIONS = 3;

/**
 * The console's top strip. No search field: this console is scoped to one
 * event at a time, and everything inside it is a list you can already filter.
 */
export function TeamsTopbar({
  title,
  sub,
  eventId,
  onOpenNav,
}: {
  title: string;
  sub?: string;
  eventId: string;
  onOpenNav?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="org-top">
      <button type="button" className="org-burger" onClick={onOpenNav} aria-label="Open navigation">
        <Menu size={20} color="#3C3A4A" strokeWidth={2} />
      </button>

      <div className="org-top__heading">
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>

      <div className="org-top__actions">
        <button
          type="button"
          className="org-icon-btn"
          onClick={() => toast(`${NOTIFICATIONS} unread notifications`)}
          aria-label={`Notifications, ${NOTIFICATIONS} unread`}
        >
          <Bell size={19} color="#5C5B6B" strokeWidth={1.8} />
          <span className="org-icon-btn__badge">{NOTIFICATIONS}</span>
        </button>

        <div className="org-user" ref={menuRef}>
          <button
            type="button"
            className="org-user__trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="org-user__avatar">
              <ImageSlot id="tm-admin-avatar" shape="circle" placeholder="" interactive={false} />
            </span>
            <span className="org-user__text">
              <span className="org-user__name">{ORG_ADMIN.name}</span>
              <span className="org-user__role">{ORG_ADMIN.role}</span>
            </span>
            <ChevronDown size={16} color="#5C5B6B" className={menuOpen ? 'is-flipped' : undefined} />
          </button>

          {menuOpen ? (
            <div className="nav-user__menu" role="menu">
              <div className="nav-user__identity">
                <div className="nav-user__name">{ORG_ADMIN.name}</div>
                <div className="nav-user__email">
                  {ORG_ADMIN.role} · {ORGANIZATION.name}
                </div>
              </div>
              <Link
                to={`/teams/settings?e=${eventId}`}
                role="menuitem"
                className="nav-user__item"
                onClick={() => setMenuOpen(false)}
              >
                <Gear size={16} color="#5C5B6B" strokeWidth={1.9} />
                Organization settings
              </Link>
              {/* Surfaces are chosen at the front door, not swapped mid-flight. */}
              <Link to="/" role="menuitem" className="nav-user__item" onClick={() => setMenuOpen(false)}>
                <Grid size={16} color="#5C5B6B" strokeWidth={1.9} />
                Choose a different Hoople
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
