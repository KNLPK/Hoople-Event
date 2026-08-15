import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import {
  Bag,
  Calendar,
  Card,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Close,
  Copy,
  Grid,
  Pencil,
  Trash,
  Layers,
  MapPin,
  Plus,
  Search,
  Sliders,
  Star,
} from '@/components/ui/icons';
import { EXPERIENCE_TILES, type ExperienceTileKey } from '@/data/organizer';
import { useExperiences, type StoredExperience } from '@/store/experiences';
import { compactDate, rupiah } from '@/lib/format';

export type ExperienceScope = 'all' | 'events' | 'activities' | 'drafts';

const SCOPE_COPY: Record<ExperienceScope, { title: string; blurb: string }> = {
  all: { title: 'Experiences', blurb: 'Manage all your events and activities in one place.' },
  events: { title: 'Events', blurb: 'One-time experiences — concerts, seminars, workshops and market fests.' },
  activities: { title: 'Activities', blurb: 'Recurring experiences sold per session, with capacity per slot.' },
  drafts: { title: 'Drafts', blurb: 'Not published yet. Nobody can find or book these until you take them live.' },
};

const TILE_ICON: Record<ExperienceTileKey, typeof Layers> = {
  all: Bag,
  published: Star,
  upcoming: Clock,
  completed: CheckCircle,
  draft: Layers,
  cancelled: Close,
};

/* A scoped list knows what it makes, so it skips the event-or-activity fork. */
const CREATE_TO: Record<ExperienceScope, string> = {
  all: '/organizer/create',
  events: '/organizer/create/event',
  activities: '/organizer/create/activity',
  drafts: '/organizer/create',
};

const CREATE_LABEL: Record<ExperienceScope, string> = {
  all: 'Create Experience',
  events: 'Create Event',
  activities: 'Create Activity',
  drafts: 'Create Experience',
};

const TYPES = ['All Types', 'Event', 'Activity'] as const;
const STATUSES = ['All Status', 'Upcoming', 'Completed', 'Draft', 'Cancelled'] as const;
const DATES = ['All Dates', 'This month', 'Next 30 days', 'Past'] as const;
const PAGE_SIZE = 5;

export function OrgExperiences({ scope }: { scope: ExperienceScope }) {
  const toast = useToast();
  const copy = SCOPE_COPY[scope];
  const { experiences, categories, count, remove, duplicate, setLifecycle } = useExperiences();

  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>(TYPES[0]);
  const [status, setStatus] = useState<string>(STATUSES[0]);
  const [dateRange, setDateRange] = useState<string>(DATES[0]);
  const [category, setCategory] = useState('All categories');
  const [moreOpen, setMoreOpen] = useState(false);
  const [view, setView] = useState<'card' | 'table'>('card');
  const [tile, setTile] = useState<ExperienceTileKey>('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return experiences.filter((item) => {
      if (scope === 'events' && item.kind !== 'EVENT') return false;
      if (scope === 'activities' && item.kind !== 'ACTIVITY') return false;
      if (scope === 'drafts' && item.lifecycle !== 'Draft') return false;

      if (tile === 'published' && item.publishState !== 'Published') return false;
      if (tile !== 'all' && tile !== 'published') {
        const wanted = tile[0].toUpperCase() + tile.slice(1);
        if (item.lifecycle !== wanted) return false;
      }

      if (type !== 'All Types' && item.kind !== type.toUpperCase()) return false;
      if (status !== 'All Status' && item.lifecycle !== status) return false;
      if (category !== 'All categories' && item.category !== category) return false;

      if (dateRange === 'Past' && item.lifecycle !== 'Completed') return false;
      if (dateRange === 'This month' && !item.date.startsWith('2026-07')) return false;
      if (dateRange === 'Next 30 days' && item.lifecycle !== 'Upcoming') return false;

      if (needle && !`${item.title} ${item.venue} ${item.category}`.toLowerCase().includes(needle)) {
        return false;
      }
      return true;
    });
  }, [experiences, scope, query, type, status, dateRange, category, tile]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const shown = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstIndex = rows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  /** Reopen a row in the builder that made it, carrying its id. */
  function editExperience(experience: StoredExperience) {
    const path =
      experience.draft?.kind === 'event' || experience.kind === 'EVENT'
        ? '/organizer/create/event'
        : '/organizer/create/activity';
    navigate(`${path}?id=${experience.id}`);
  }

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Header banner */}
      <Reveal className="org-page-hero">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.blurb}</p>
        </div>
        <div className="org-page-hero__art float">
          <ImageSlot id="org-experiences-art" shape="rounded" radius={14} placeholder="Mascot + checklist" />
        </div>
        <div className="org-split-btn">
          <Button as="link" to={CREATE_TO[scope]} variant="primary">
            <Plus size={16} strokeWidth={2} />
            {CREATE_LABEL[scope]}
          </Button>
          <button
            type="button"
            className="org-split-btn__caret"
            onClick={() => toast('Duplicate an existing experience, or import from CSV')}
            aria-label="More create options"
          >
            <ChevronDown size={15} color="#fff" />
          </button>
        </div>
      </Reveal>

      {/* Filter bar */}
      <Reveal className="org-card org-filterbar" delay={60}>
        <label className="field">
          <span className="field__label">Search</span>
          <span className="org-search" style={{ width: '100%' }}>
            <Search size={16} color="#8B8A99" strokeWidth={2} />
            <input
              value={query}
              onChange={(event) => resetPage(setQuery)(event.target.value)}
              placeholder="Search experience..."
            />
          </span>
        </label>

        <Select label="Type" value={type} options={TYPES} onChange={resetPage(setType)} />
        <Select label="Status" value={status} options={STATUSES} onChange={resetPage(setStatus)} />
        <Select label="Date" value={dateRange} options={DATES} onChange={resetPage(setDateRange)} />

        <button
          type="button"
          className={`org-morefilters ${moreOpen ? 'is-on' : ''}`.trim()}
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
        >
          <Sliders size={16} color="#5C5B6B" strokeWidth={2} />
          More Filters
        </button>

        <div className="view-toggle org-filterbar__view" role="group" aria-label="Result view">
          <button
            type="button"
            className={view === 'card' ? 'is-on' : ''}
            onClick={() => setView('card')}
            aria-pressed={view === 'card'}
          >
            <Grid size={14} color={view === 'card' ? '#6D28FF' : 'currentColor'} strokeWidth={2} />
            Card
          </button>
          <button
            type="button"
            className={view === 'table' ? 'is-on' : ''}
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
          >
            <Card size={14} color={view === 'table' ? '#6D28FF' : 'currentColor'} strokeWidth={2} />
            Table
          </button>
        </div>

        {moreOpen ? (
          <div className="org-filterbar__more">
            <span className="field__label" style={{ marginBottom: 0 }}>
              Category
            </span>
            {['All categories', ...categories].map((option) => (
              <button
                key={option}
                type="button"
                className={`chip chip-motion ${category === option ? 'is-active' : ''}`.trim()}
                onClick={() => resetPage(setCategory)(option)}
                aria-pressed={category === option}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </Reveal>

      {/* Count tiles */}
      <Reveal className="org-tiles" delay={120}>
        {EXPERIENCE_TILES.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`org-tile ${tile === item.key ? 'is-active' : ''}`.trim()}
            onClick={() => {
              setTile(item.key);
              setPage(1);
            }}
            aria-pressed={tile === item.key}
          >
            <span className={`org-tile__icon org-tile__icon--${item.tone}`}>
              {(() => {
                const Icon = TILE_ICON[item.key];
                return <Icon size={17} strokeWidth={1.9} />;
              })()}
            </span>
            <span>
              <span className="org-tile__label">{item.label}</span>
              <span className="org-tile__value">{count(item.key)}</span>
            </span>
          </button>
        ))}
      </Reveal>

      {/* Results */}
      <Reveal className="org-card" delay={180}>
        {shown.length === 0 ? (
          <div style={{ padding: 44, textAlign: 'center' }}>
            <div className="empty__title">No experiences match</div>
            <p className="empty__body">Try a different search, or reset the filters.</p>
            <Button
              as="button"
              variant="neutral"
              onClick={() => {
                setQuery('');
                setType(TYPES[0]);
                setStatus(STATUSES[0]);
                setDateRange(DATES[0]);
                setCategory('All categories');
                setTile('all');
                setPage(1);
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : view === 'card' ? (
          shown.map((experience) => (
            <ExperienceCardRow
              key={experience.id}
              experience={experience}
              onEdit={() => editExperience(experience)}
              onDuplicate={() => {
                duplicate(experience.id);
                toast(`Duplicated "${experience.title}" as a draft`);
              }}
              onDelete={() => {
                remove(experience.id);
                toast(`"${experience.title}" deleted`);
              }}
              onCancel={() => {
                const next = experience.lifecycle === 'Cancelled' ? 'Upcoming' : 'Cancelled';
                setLifecycle(experience.id, next);
                toast(next === 'Cancelled' ? 'Experience cancelled' : 'Experience restored');
              }}
            />
          ))
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Experience</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Registrations</th>
                  <th className="org-table__num">Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((experience) => (
                  <tr key={experience.id}>
                    <td>
                      <span className="org-table__title">{experience.title}</span>
                      <span className="org-table__sub">{experience.venue}</span>
                    </td>
                    <td>
                      <span className={`org-pill org-pill--${experience.kind.toLowerCase()}`}>
                        {experience.kind === 'EVENT' ? 'Event' : 'Activity'}
                      </span>
                    </td>
                    <td>
                      {compactDate(experience.date)}
                      <span className="org-table__sub">
                        {experience.start} - {experience.end}
                      </span>
                    </td>
                    <td>
                      {experience.registered} / {experience.capacity}
                    </td>
                    <td className="org-table__num">
                      {experience.revenue === 0 ? '—' : rupiah(experience.revenue)}
                    </td>
                    <td>
                      <span className={`org-pill org-pill--${experience.lifecycle.toLowerCase()}`}>
                        {experience.lifecycle}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 ? (
          <div className="org-pagination">
            <span>
              Showing {firstIndex}-{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}{' '}
              experiences
            </span>
            <div className="org-pagination__pages">
              <button
                type="button"
                className="org-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={15} color="#5C5B6B" />
              </button>
              {pageNumbers(currentPage, pageCount).map((entry, index) =>
                entry === '…' ? (
                  <span key={`gap-${index}`} className="org-page-gap">
                    …
                  </span>
                ) : (
                  <button
                    key={entry}
                    type="button"
                    className={`org-page-btn ${entry === currentPage ? 'is-active' : ''}`.trim()}
                    onClick={() => setPage(entry)}
                    aria-current={entry === currentPage ? 'page' : undefined}
                  >
                    {entry}
                  </button>
                ),
              )}
              <button
                type="button"
                className="org-page-btn"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={15} color="#5C5B6B" />
              </button>
            </div>
          </div>
        ) : null}
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ExperienceCardRow({
  experience,
  onEdit,
  onDuplicate,
  onDelete,
  onCancel,
}: {
  experience: StoredExperience;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const fill = experience.capacity ? experience.registered / experience.capacity : 0;
  const percent = Math.round(fill * 100);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="org-xp-row">
      <div className="org-xp-row__media zoom">
        <ImageSlot
          id={`org-xp-${experience.id}`}
          shape="rounded"
          radius={10}
          placeholder={experience.photoHint}
        />
      </div>

      <div className="org-xp-row__chips">
        <span className={`org-pill org-pill--${experience.kind.toLowerCase()}`}>
          {experience.kind === 'EVENT' ? 'Event' : 'Activity'}
        </span>
        <span className={`org-pill org-pill--${experience.publishState.toLowerCase()}`}>
          {experience.publishState}
        </span>
      </div>

      <div>
        <Link to="/organizer/registrations" className="org-xp-row__title">
          {experience.title}
        </Link>
        <div className="org-xp-row__meta">
          <span>
            <Calendar size={13} color="#8B8A99" strokeWidth={1.9} />
            {compactDate(experience.date)} • {experience.start} - {experience.end}
          </span>
          <span>
            <MapPin size={13} color="#8B8A99" strokeWidth={1.9} />
            {experience.venue}
          </span>
          <span>
            <Bag size={13} color="#8B8A99" strokeWidth={1.9} />
            {experience.category}
          </span>
        </div>
      </div>

      <div className="org-xp-row__stat">
        <span className="org-xp-row__stat-label">Registrations</span>
        <strong>
          {experience.registered} / {experience.capacity}
        </strong>
        <div className="org-xp-row__progress">
          <div className="org-meter" style={{ width: '100%', marginTop: 0 }}>
            <div
              className={`org-meter__fill ${percent >= 100 ? 'org-meter__fill--full' : ''}`.trim()}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span>{percent}%</span>
        </div>
      </div>

      <div className="org-xp-row__stat">
        <span className="org-xp-row__stat-label">Revenue</span>
        <strong className="org-xp-row__revenue">{rupiah(experience.revenue)}</strong>
      </div>

      <div className="org-xp-row__stat">
        <span className="org-xp-row__stat-label">Status</span>
        <span className={`org-pill org-pill--${experience.lifecycle.toLowerCase()}`}>
          {experience.lifecycle}
        </span>
        <span className="org-xp-row__note">{experience.note}</span>
      </div>

      <div className="org-xp-row__menu" ref={menuRef}>
        <button
          type="button"
          className="org-xp-row__more"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`More actions for ${experience.title}`}
        >
          •••
        </button>

        {menuOpen ? (
          <div className="nav-user__menu org-rowmenu" role="menu">
            <button type="button" role="menuitem" className="nav-user__item" onClick={onEdit}>
              <Pencil size={15} color="#5C5B6B" strokeWidth={1.9} />
              Edit
            </button>
            <button type="button" role="menuitem" className="nav-user__item" onClick={onDuplicate}>
              <Copy size={15} color="#5C5B6B" strokeWidth={1.9} />
              Duplicate
            </button>
            <button type="button" role="menuitem" className="nav-user__item" onClick={onCancel}>
              <Close size={15} color="#5C5B6B" strokeWidth={1.9} />
              {experience.lifecycle === 'Cancelled' ? 'Restore' : 'Cancel'}
            </button>
            <button
              type="button"
              role="menuitem"
              className="nav-user__item nav-user__item--danger"
              onClick={onDelete}
            >
              <Trash size={15} color="#E11D48" strokeWidth={1.9} />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <span className="org-select">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown size={15} color="#8B8A99" />
      </span>
    </label>
  );
}

/** `1 2 3 … 8` style pagination, collapsing the middle when there are many pages. */
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, '…', total];
  if (current >= total - 2) return [1, '…', total - 2, total - 1, total];
  return [1, '…', current, '…', total];
}
