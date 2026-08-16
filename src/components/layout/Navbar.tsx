import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Calendar, ChevronDown, Grid, Headset, Heart, Logo, Menu, User } from '@/components/ui/icons';
import { useSaved } from '@/store/saved';
import { useSession } from '@/store/session';

/** The primary navigation — a solid white bar that gains a shadow once scrolled. */

export const NAV_LINKS = [
  { label: 'Discover', to: '/discover' },
  { label: 'Events', to: '/events' },
  { label: 'Activities', to: '/activities' },
  { label: 'Communities', to: '/communities' },
  { label: 'For Organizers', to: '/organizers' },
  { label: 'How it Works', to: '/how-it-works' },
  { label: 'Pricing', to: '/pricing' },
] as const;

export function Navbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useSession();
  const { count } = useSaved();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav-shell ${scrolled ? 'is-scrolled' : ''}`.trim()}>
      <div className="container">
        <nav className="nav">
          <Link to="/home" className="nav__brand" aria-label="Hoople home">
            <Logo size={26} color="#12121A" />
            <span>hoople</span>
          </Link>

          <div className="nav__links">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav__actions">
            {isSignedIn ? <SignedInActions /> : <SignedOutActions />}
          </div>

          {/* Phone only: the same menu the tab bar opens, within reach of the
              hand already holding the top of the screen. */}
          <div className="nav__mobile">
            <Link to="/saved" className="nav__icon-btn" aria-label={`My List, ${count} saved`}>
              <Heart size={20} strokeWidth={1.9} />
              {count > 0 ? <span className="nav__icon-dot" /> : null}
            </Link>
            <button
              type="button"
              className="nav__icon-btn"
              onClick={onOpenMenu}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function SignedOutActions() {
  return (
    <>
      <Button as="link" to="/bookings" variant="neutral" size="nav">
        <Grid size={16} strokeWidth={2} />
        My Tickets
      </Button>
      <Button as="link" to="/auth" variant="neutral" size="nav">
        Log in
      </Button>
      <Button as="link" to="/organizers" variant="primary" size="nav">
        Create Experience
      </Button>
    </>
  );
}

function SignedInActions() {
  const { count } = useSaved();

  return (
    <>
      <Button as="link" to="/saved" variant="neutral" size="nav">
        <Heart size={16} strokeWidth={2} />
        My List
        {count > 0 ? <span className="nav__count">{count}</span> : null}
      </Button>
      <Button as="link" to="/bookings" variant="neutral" size="nav">
        <Calendar size={16} strokeWidth={2} />
        My Tickets
      </Button>
      <AccountMenu />
    </>
  );
}

/** Avatar + chevron, opening the account menu. */
function AccountMenu() {
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="nav-user" ref={ref}>
      <button
        type="button"
        className="nav-user__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user?.name ?? 'your account'}`}
      >
        <span className="nav-user__avatar">
          <ImageSlot id="nav-avatar" shape="circle" placeholder="" interactive={false} />
        </span>
        <ChevronDown size={15} color="#5C5B6B" className={open ? 'is-flipped' : undefined} />
      </button>

      {open ? (
        <div className="nav-user__menu" role="menu">
          <div className="nav-user__identity">
            <div className="nav-user__name">{user?.name}</div>
            <div className="nav-user__email">{user?.email}</div>
          </div>

          <Link to="/bookings" role="menuitem" className="nav-user__item" onClick={() => setOpen(false)}>
            <Calendar size={16} color="#5C5B6B" strokeWidth={1.9} />
            My Tickets
          </Link>
          <Link to="/saved" role="menuitem" className="nav-user__item" onClick={() => setOpen(false)}>
            <Heart size={16} color="#5C5B6B" strokeWidth={1.9} />
            My List
          </Link>
          <Link to="/organizers" role="menuitem" className="nav-user__item" onClick={() => setOpen(false)}>
            <User size={16} color="#5C5B6B" strokeWidth={1.9} />
            Organizer account
          </Link>
          <Link to="/help" role="menuitem" className="nav-user__item" onClick={() => setOpen(false)}>
            <Headset size={16} color="#5C5B6B" strokeWidth={1.9} />
            Help Center
          </Link>

          <button
            type="button"
            role="menuitem"
            className="nav-user__item nav-user__item--danger"
            onClick={() => {
              setOpen(false);
              signOut();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
