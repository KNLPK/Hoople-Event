import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Compass,
  ExternalLink,
  Gear,
  Gift,
  Menu,
  Search,
} from '@/components/ui/icons';
import { WORKSPACE } from '@/data/organizer';

const NOTIFICATIONS = 6;

export interface OrgTopbarProps {
  /** Replaces the search field with a back link — used by focused flows. */
  back?: { label: string; to: string };
  /** Replaces the search field with the page's own title, as the builder does. */
  heading?: { title: string; sub: string };
}

/** Search, notifications and account across the top of the console. */
export function OrgTopbar({
  back,
  heading,
  onOpenNav,
}: OrgTopbarProps & { onOpenNav?: () => void }) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

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

      {heading ? (
        <div className="org-top__heading">
          <h1>{heading.title}</h1>
          <p>{heading.sub}</p>
        </div>
      ) : back ? (
        <Link to={back.to} className="org-back">
          <ChevronLeft size={16} color="#3C3A4A" />
          {back.label}
        </Link>
      ) : (
        <form
          className="org-search"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(`/organizer/registrations?q=${encodeURIComponent(query)}`);
          }}
        >
          <Search size={18} color="#8B8A99" strokeWidth={2} />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search experiences by name, location, or tag..."
            aria-label="Search the console"
          />
          <kbd className="font-body text-[11px] text-grey bg-surface-toggle rounded-[5px] py-[3px] px-[7px] flex-none to-1000:hidden">⌘ K</kbd>
        </form>
      )}

      <div className="org-top__actions">
        <button
          type="button"
          className="org-icon-btn"
          onClick={() => toast('Referral rewards are coming to Hoople soon')}
          aria-label="Referral rewards"
        >
          <Gift size={19} color="#5C5B6B" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          className="org-icon-btn"
          onClick={() => toast(`${NOTIFICATIONS} unread notifications`)}
          aria-label={`Notifications, ${NOTIFICATIONS} unread`}
        >
          <Bell size={19} color="#5C5B6B" strokeWidth={1.8} />
          <span className="absolute top-1 right-1 min-w-[16px] h-4 py-0 px-1 rounded-pill bg-brand text-[#fff] text-[10px] font-bold flex items-center justify-center">{NOTIFICATIONS}</span>
        </button>

        <div className="org-user" ref={menuRef}>
          <button
            type="button"
            className="org-user__trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="w-9 h-9 rounded-[50%] overflow-hidden flex-none bg-brand-tint-strong">
              <ImageSlot id="org-owner-avatar" shape="circle" placeholder="" interactive={false} />
            </span>
            <span className="org-user__text">
              <span className="block text-[13.5px] font-semibold">{WORKSPACE.owner.name}</span>
              <span className="block text-[12px] text-grey">{WORKSPACE.owner.role}</span>
            </span>
            <ChevronDown size={16} color="#5C5B6B" className={menuOpen ? 'is-flipped' : undefined} />
          </button>

          {menuOpen ? (
            <div className="nav-user__menu" role="menu">
              <div className="pt-2.5 px-3 pb-3 border-b border-b-line-faint mb-1.5">
                <div className="text-[14px] font-semibold">{WORKSPACE.owner.name}</div>
                <div className="text-[12.5px] text-grey mt-[3px] overflow-hidden text-ellipsis">
                  {WORKSPACE.owner.role} · {WORKSPACE.name}
                </div>
              </div>
              <Link
                to="/organizer/settings"
                role="menuitem"
                className="nav-user__item"
                onClick={() => setMenuOpen(false)}
              >
                <Gear size={16} color="#5C5B6B" strokeWidth={1.9} />
                Workspace settings
              </Link>
              <Link to="/discover" role="menuitem" className="nav-user__item" onClick={() => setMenuOpen(false)}>
                <Compass size={16} color="#5C5B6B" strokeWidth={1.9} />
                Switch to participant site
                <ExternalLink size={14} color="#8B8A99" strokeWidth={1.9} style={{ marginLeft: 'auto' }} />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
