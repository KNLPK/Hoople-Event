import { Link, NavLink } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Button } from '@/components/ui/Button';
import {
  Card,
  Chart,
  CheckCircle,
  ChevronDown,
  Close,
  Doc,
  Gear,
  Home,
  IdCard,
  Layers,
  Logo,
  Ticket,
  UserCircle,
} from '@/components/ui/icons';
import { ORGANIZATION } from '@/data/teams';

/**
 * Left rail of the internal-events console.
 *
 * Flat, unlike the organizer console's collapsing groups: this console works
 * one event at a time, so every link is a view of the event you already have
 * open rather than a different corner of a catalogue.
 */
export function TeamsSidebar({ eventId, onClose }: { eventId: string; onClose?: () => void }) {
  /* Every link carries the open event, so switching view never loses it. */
  const qs = `?e=${eventId}`;

  return (
    <aside className="org-side tm-side">
      <Link to={`/teams${qs}`} className="org-side__brand" aria-label="Hoople for Teams">
        <span className="org-side__logo">
          <Logo size={26} color="#6D28FF" />
        </span>
        <span className="tm-brand">
          <span className="org-side__wordmark">hoople</span>
          <span className="tm-brand__sub">Event Builder</span>
        </span>
      </Link>

      <button type="button" className="org-side__close" onClick={onClose} aria-label="Close navigation">
        <Close size={18} color="#3C3A4A" />
      </button>

      <div className="org-side__scroll">
        <Link to={`/teams/settings${qs}`} className="org-workspace">
          <span className="org-workspace__avatar">{ORGANIZATION.initials}</span>
          <span className="org-workspace__text">
            <span className="org-workspace__name">{ORGANIZATION.name}</span>
            <span className="org-workspace__category">{ORGANIZATION.plan}</span>
          </span>
          <ChevronDown size={16} color="#8B8A99" />
        </Link>

        <nav className="org-nav">
          <NavLink to={`/teams${qs}`} end className={navClass}>
            <Home size={18} strokeWidth={1.9} />
            Dashboard
          </NavLink>

          <span className="tm-navlabel">Event management</span>
          <NavLink to={`/teams/experiences${qs}`} className={navClass}>
            <Layers size={18} strokeWidth={1.9} />
            Experiences
          </NavLink>
          <NavLink to={`/teams/registrations${qs}`} className={navClass}>
            <IdCard size={18} strokeWidth={1.9} />
            Registrations
          </NavLink>
          <NavLink to={`/teams/sessions${qs}`} className={navClass}>
            <Ticket size={18} strokeWidth={1.9} />
            Sessions
          </NavLink>
          <NavLink to={`/teams/check-in${qs}`} className={navClass}>
            <CheckCircle size={18} strokeWidth={1.9} />
            Check-in
          </NavLink>
          <NavLink to={`/teams/analytics${qs}`} className={navClass}>
            <Chart size={18} strokeWidth={1.9} />
            Analytics
          </NavLink>
          <NavLink to={`/teams/orders${qs}`} className={navClass}>
            <Doc size={18} strokeWidth={1.9} />
            Orders
          </NavLink>
          <NavLink to={`/teams/payments${qs}`} className={navClass}>
            <Card size={18} strokeWidth={1.9} />
            Payments &amp; Payout
          </NavLink>

          <span className="tm-navlabel">Organization settings</span>
          <NavLink to={`/teams/settings${qs}`} className={navClass}>
            <Gear size={18} strokeWidth={1.9} />
            Settings
          </NavLink>
          <NavLink to={`/teams/profile${qs}`} className={navClass}>
            <UserCircle size={18} strokeWidth={1.9} />
            Organizer Profile
          </NavLink>
        </nav>
      </div>

      <div className="org-side__foot">
        <div className="org-upgrade tm-support">
          <div className="org-upgrade__head">
            <span>Need help?</span>
          </div>
          <p>Our support team is ready to help you 24/7.</p>
          <div className="org-upgrade__art">
            <ImageSlot id="tm-support-mascot" shape="rounded" radius={12} placeholder="Mascot" />
          </div>
          <Button as="link" to="/help" variant="outline" size="sm" block>
            Contact Support →
          </Button>
        </div>

        <Link to="/" className="org-side__help">
          <Close size={16} color="#5C5B6B" strokeWidth={1.9} />
          Log out
        </Link>
      </div>
    </aside>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  return `org-nav__link ${isActive ? 'is-active' : ''}`;
}
