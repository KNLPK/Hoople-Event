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
      <Link to={`/teams${qs}`} className="flex items-center gap-[9px] py-0 px-2 text-ink" aria-label="Hoople for Teams">
        <span className="flex">
          <Logo size={26} color="#6D28FF" />
        </span>
        <span className="tm-brand">
          <span className="font-heading font-semibold text-[22px] tracking-[-0.02em]">hoople</span>
          <span className="text-[11px] font-semibold tracking-[0.02em] text-brand">Event Builder</span>
        </span>
      </Link>

      <button type="button" className="org-side__close" onClick={onClose} aria-label="Close navigation">
        <Close size={18} color="#3C3A4A" />
      </button>

      <div className="org-side__scroll">
        <Link to={`/teams/settings${qs}`} className="org-workspace">
          <span className="w-9 h-9 rounded-md flex-none bg-brand text-[#fff] flex items-center justify-center font-heading text-[13px] font-bold tracking-[0.02em]">{ORGANIZATION.initials}</span>
          <span className="org-workspace__text">
            <span className="flex items-center gap-[7px] text-[14px] font-semibold">{ORGANIZATION.name}</span>
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

      <div className="flex-none flex flex-col gap-2">
        <div className="org-upgrade tm-support">
          <div className="flex items-center gap-[9px] text-[13.5px] font-semibold mb-2">
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
