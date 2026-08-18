import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Button } from "@/components/ui/Button";
import {
  Card,
  Close,
  Chart,
  CheckCircle,
  ChevronDown,
  Crown,
  ExternalLink,
  Gear,
  Home,
  IdCard,
  Info,
  Layers,
  Logo,
  Ticket,
} from "@/components/ui/icons";
import { WORKSPACE, WORKSPACE_INITIALS } from "@/data/organizer";

/** Left rail of the organizer console — a drawer once the console is narrow. */
export function OrgSidebar({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const [experiencesOpen, setExperiencesOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(
    pathname.startsWith("/organizer/payments"),
  );

  return (
    <aside className="org-side">
      <Link
        to="/organizer"
        className="org-side__brand"
        aria-label="Hoople organizer console"
      >
        <span className="org-side__logo">
          <Logo size={26} color="#6D28FF" />
        </span>
        <span className="org-side__wordmark">hoople</span>
      </Link>

      {/* Phone only: the drawer needs a way out that is not the scrim. */}
      <button
        type="button"
        className="org-side__close"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <Close size={18} color="#3C3A4A" />
      </button>

      <div className="org-side__scroll">
        <Link to="/organizer/settings" className="org-workspace">
          <span className="org-workspace__avatar">{WORKSPACE_INITIALS}</span>
          <span className="org-workspace__text">
            <span className="org-workspace__name">
              {WORKSPACE.name}
              <span className="org-workspace__badge">{WORKSPACE.role}</span>
            </span>
            <span className="org-workspace__category">
              {WORKSPACE.category}
            </span>
          </span>
          <ChevronDown size={16} color="#8B8A99" />
        </Link>

        <nav className="org-nav">
          <NavLink to="/organizer" end className={navClass}>
            <Home size={18} strokeWidth={1.9} />
            Dashboard
          </NavLink>

          <button
            type="button"
            className="org-nav__link org-nav__group"
            onClick={() => setExperiencesOpen((open) => !open)}
            aria-expanded={experiencesOpen}
          >
            <Layers size={18} strokeWidth={1.9} />
            Experiences
            <ChevronDown
              size={15}
              color="#8B8A99"
              className={experiencesOpen ? "" : "is-flipped"}
              style={{ marginLeft: "auto" }}
            />
          </button>
          {experiencesOpen ? (
            <div className="org-nav__children">
              <NavLink to="/organizer/experiences" className={navClass}>
                All Experiences
              </NavLink>
              <NavLink to="/organizer/events" className={navClass}>
                Events
              </NavLink>
              <NavLink to="/organizer/activities" className={navClass}>
                Activities
              </NavLink>
              <NavLink to="/organizer/drafts" className={navClass}>
                Drafts
              </NavLink>
            </div>
          ) : null}

          <NavLink to="/organizer/sessions" className={navClass}>
            <Ticket size={18} strokeWidth={1.9} />
            Sessions
          </NavLink>
          <NavLink to="/organizer/registrations" className={navClass}>
            <IdCard size={18} strokeWidth={1.9} />
            Registrations
          </NavLink>
          <NavLink to="/organizer/check-in" className={navClass}>
            <CheckCircle size={18} strokeWidth={1.9} />
            Check-in
          </NavLink>
          <NavLink to="/organizer/analytics" className={navClass}>
            <Chart size={18} strokeWidth={1.9} />
            Analytics
          </NavLink>

          <button
            type="button"
            className="org-nav__link org-nav__group"
            onClick={() => setPaymentsOpen((open) => !open)}
            aria-expanded={paymentsOpen}
          >
            <Card size={18} strokeWidth={1.9} />
            Payments
            <ChevronDown
              size={15}
              color="#8B8A99"
              className={paymentsOpen ? "" : "is-flipped"}
              style={{ marginLeft: "auto" }}
            />
          </button>
          {paymentsOpen ? (
            <div className="org-nav__children">
              <NavLink to="/organizer/payments" end className={navClass}>
                Payouts
              </NavLink>
              <NavLink
                to="/organizer/payments/transactions"
                className={navClass}
              >
                Transactions
              </NavLink>
            </div>
          ) : null}

          <NavLink to="/organizer/settings" className={navClass}>
            <Gear size={18} strokeWidth={1.9} />
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="org-side__foot">
        <div className="org-upgrade">
          <div className="org-upgrade__head">
            <Crown size={18} color="#6D28FF" />
            <span>Go Pro, unlock more!</span>
          </div>
          <p>Unlock advanced tools, custom domain, and priority support.</p>
          <div className="org-upgrade__art">
            <ImageSlot
              id="org-upgrade-art"
              shape="rounded"
              radius={12}
              placeholder="Mascot"
            />
          </div>
          <Button as="link" to="/pricing" variant="outline" size="sm" block>
            Upgrade Now →
          </Button>
        </div>

        <Link to="/help" className="org-side__help">
          <Info size={16} color="#5C5B6B" strokeWidth={1.9} />
          Help Center
          <ExternalLink
            size={15}
            color="#8B8A99"
            strokeWidth={1.9}
            style={{ marginLeft: "auto" }}
          />
        </Link>
      </div>
    </aside>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  return `org-nav__link ${isActive ? "is-active" : ""}`;
}
