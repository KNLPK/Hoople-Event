import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from './Navbar';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import {
  Calendar,
  Chart,
  Close,
  Compass,
  Grid,
  Headset,
  Heart,
  Home,
  Logo,
  User,
} from '@/components/ui/icons';
import { useSaved } from '@/store/saved';
import { useSession } from '@/store/session';

/**
 * Phone navigation. A thumb-reachable tab bar carries the four places people
 * actually go, and everything else lives one tap away in the drawer — so the
 * desktop bar's seven links never have to squeeze onto a 390px screen.
 */

interface Tab {
  label: string;
  to: string;
  Icon: typeof Home;
  /** Home would otherwise match every route. */
  exact?: boolean;
}

const TABS: Tab[] = [
  { label: 'Home', to: '/', Icon: Home, exact: true },
  { label: 'Discover', to: '/discover', Icon: Compass },
  { label: 'Tickets', to: '/bookings', Icon: Calendar },
  { label: 'Saved', to: '/saved', Icon: Heart },
];

interface MobileNavProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function MobileNav({ open, onOpen, onClose }: MobileNavProps) {
  const { count } = useSaved();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-locked');
    };
  }, [open, onClose]);

  return (
    <>
      <nav className="tabbar" aria-label="Primary">
        {TABS.map(({ label, to, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `tabbar__tab ${isActive ? 'is-active' : ''}`}
          >
            <span className="tabbar__icon">
              <Icon size={21} strokeWidth={1.9} />
              {label === 'Saved' && count > 0 ? <span className="tabbar__dot" /> : null}
            </span>
            {label}
          </NavLink>
        ))}

        <button
          type="button"
          className={`tabbar__tab ${open ? 'is-active' : ''}`.trim()}
          onClick={onOpen}
          aria-expanded={open}
        >
          <span className="tabbar__icon">
            <Grid size={21} strokeWidth={1.9} />
          </span>
          Menu
        </button>
      </nav>

      {open ? <MobileDrawer onClose={onClose} /> : null}
    </>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { isSignedIn, user, signOut } = useSession();
  const { count } = useSaved();
  const navigate = useNavigate();

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className="drawer__scrim" onClick={onClose} aria-label="Close menu" />

      <div className="drawer__panel">
        <div className="drawer__head">
          <Link to="/home" className="nav__brand" onClick={onClose}>
            <Logo size={24} color="#12121A" />
            <span>hoople</span>
          </Link>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close menu">
            <Close size={18} color="#3C3A4A" />
          </button>
        </div>

        {isSignedIn ? (
          <Link to="/saved" className="drawer__identity" onClick={onClose}>
            <span className="drawer__avatar">
              <ImageSlot id="nav-avatar" shape="circle" placeholder="" interactive={false} />
            </span>
            <span>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </span>
          </Link>
        ) : (
          <div className="drawer__signin">
            <p>Log in to keep your tickets and saved experiences in one place.</p>
            <Button as="link" to="/auth" variant="primary" block onClick={onClose}>
              Log in or sign up
            </Button>
          </div>
        )}

        <div className="drawer__section">
          <span className="drawer__label">Browse</span>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`}
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="drawer__section">
          <span className="drawer__label">You</span>
          <Link to="/bookings" className="drawer__link" onClick={onClose}>
            <Calendar size={17} color="#5C5B6B" strokeWidth={1.9} />
            My Tickets
          </Link>
          <Link to="/saved" className="drawer__link" onClick={onClose}>
            <Heart size={17} color="#5C5B6B" strokeWidth={1.9} />
            My List
            {count > 0 ? <span className="drawer__count">{count}</span> : null}
          </Link>
          <Link to="/help" className="drawer__link" onClick={onClose}>
            <Headset size={17} color="#5C5B6B" strokeWidth={1.9} />
            Help Center
          </Link>
        </div>

        <div className="drawer__section">
          <span className="drawer__label">Organizing</span>
          <Link to="/organizers" className="drawer__link" onClick={onClose}>
            <User size={17} color="#5C5B6B" strokeWidth={1.9} />
            For Organizers
          </Link>
          <Link to="/organizer" className="drawer__link" onClick={onClose}>
            <Chart size={17} color="#5C5B6B" strokeWidth={1.9} />
            Organizer Console
          </Link>
        </div>

        <div className="drawer__foot">
          <Button as="link" to="/organizers" variant="primary" block onClick={onClose}>
            Create Experience
          </Button>
          {isSignedIn ? (
            <button
              type="button"
              className="drawer__link drawer__link--danger"
              onClick={() => {
                onClose();
                signOut();
                navigate('/');
              }}
            >
              Log out
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
