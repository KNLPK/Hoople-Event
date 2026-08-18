import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Calendar, Lock, MapPin, Plus, Repeat, Search, Users } from '@/components/ui/icons';
import { FormatIcon, statusTone } from '@/components/teams/EventContext';
import { Meter } from '@/components/ui/charts';
import { TEAM_EVENTS, collected, eventTotals, type EventStatus, type TeamEvent } from '@/data/teams';
import { rupiah } from '@/lib/format';

type Scope = 'All' | EventStatus;

const SCOPES: Scope[] = ['All', 'Ongoing', 'Published', 'Draft', 'Ended', 'Cancelled'];

/**
 * Every internal event in one place, and the way you switch which one the rest
 * of the console is looking at.
 */
export function TeamsExperiences() {
  const active = useOutletContext<TeamEvent>();
  const navigate = useNavigate();
  const toast = useToast();
  const [scope, setScope] = useState<Scope>('All');
  const [query, setQuery] = useState('');

  const totals = eventTotals();
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEAM_EVENTS.filter((event) => {
      if (scope !== 'All' && event.status !== scope) return false;
      if (!needle) return true;
      return `${event.title} ${event.venue} ${event.organiser} ${event.audience.join(' ')}`
        .toLowerCase()
        .includes(needle);
    });
  }, [scope, query]);

  function open(event: TeamEvent) {
    navigate(`/teams?e=${event.id}`);
  }

  return (
    <>
      <Reveal className="org-page-hero tm-pagehero">
        <div>
          <h2>Internal experiences</h2>
          <p>
            {totals.all} events for {totals.registered.toLocaleString('id-ID')} registrations across the organization.
            None of them appear on Hoople's public site.
          </p>
        </div>
        <Button as="button" variant="primary" onClick={() => toast('The internal event builder opens here')}>
          <Plus size={16} strokeWidth={2.2} />
          Create internal event
        </Button>
      </Reveal>

      <div className="org-filters">
        <label className="org-search" style={{ width: 300 }}>
          <Search size={17} color="#8B8A99" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, venue or department"
            aria-label="Search internal events"
          />
        </label>
        {SCOPES.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip chip-motion ${scope === option ? 'is-active' : ''}`.trim()}
            onClick={() => setScope(option)}
            aria-pressed={scope === option}
          >
            {option}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-grey)' }}>
          {rows.length} of {TEAM_EVENTS.length}
        </span>
      </div>

      {rows.length ? (
        <div className="flex flex-col gap-3.5">
          {rows.map((event, index) => (
            <Reveal
              key={event.id}
              delay={index * 40}
              className={`org-card tm-expcard ${event.id === active.id ? 'is-open' : ''}`.trim()}
            >
              <button type="button" className="tm-expcard__hit" onClick={() => open(event)}>
                <span className="block h-[120px] rounded-[12px] overflow-hidden bg-surface-chip">
                  <ImageSlot
                    id={`tm-cover-${event.id}`}
                    shape="rounded"
                    radius={12}
                    placeholder={event.photoHint}
                    interactive={false}
                  />
                </span>

                <span className="flex flex-col gap-[7px] min-w-0">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className={`org-pill org-pill--${statusTone(event.status)}`}>{event.status}</span>
                    <span className="tm-private">
                      <Lock size={12} color="#5B21F5" strokeWidth={2} />
                      {event.audience.includes('All members') ? 'All members' : event.audience.join(' · ')}
                    </span>
                    {event.recurring ? (
                      <span className="inline-flex items-center gap-[5px] py-[3px] px-[9px] rounded-pill bg-surface-chip text-ink-3 text-[11.5px] font-semibold">
                        <Repeat size={12} color="#6B6A7B" strokeWidth={2} />
                        {event.recurring}
                      </span>
                    ) : null}
                    {event.id === active.id ? <span className="py-[3px] px-[9px] rounded-pill bg-green-tint text-green-deep text-[11px] font-bold not-italic">Open in console</span> : null}
                  </span>

                  <span className="font-heading text-[16.5px] font-semibold tracking-[-0.015em]">{event.title}</span>
                  <span className="text-[13px] leading-[1.6] text-ink-3">{event.summary}</span>

                  <span className="tm-ctx__meta">
                    <span>
                      <Calendar size={15} color="#6B6A7B" strokeWidth={1.9} />
                      {event.dateLabel}
                    </span>
                    <span>
                      <MapPin size={15} color="#6B6A7B" strokeWidth={1.9} />
                      {event.venue}
                    </span>
                    <span>
                      <FormatIcon format={event.format} />
                      {event.format}
                    </span>
                  </span>
                </span>

                <span className="tm-expcard__stats">
                  <span className="tm-expstat">
                    <em>Registered</em>
                    <strong>
                      {event.registered} <i>/ {event.capacity}</i>
                    </strong>
                    <Meter value={event.registered} max={event.capacity} />
                  </span>
                  <span className="tm-expstat">
                    <em>Cost</em>
                    <strong>{event.costModel === 'Free' ? 'Free' : event.costModel}</strong>
                    <i className="not-italic text-[11.5px] text-grey">
                      {collected(event) > 0 ? rupiah(collected(event)) : 'No contribution'}
                    </i>
                  </span>
                  <span className="tm-expstat">
                    <em>Organiser</em>
                    <strong>
                      <Users size={14} color="#6B6A7B" strokeWidth={1.9} />
                      {event.organiser}
                    </strong>
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal className="org-card">
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="font-heading text-[17px] font-semibold mb-1.5">Nothing matches</div>
            <p className="text-[13.5px] text-grey mb-[18px]">Try a different search, or clear the status filter.</p>
          </div>
        </Reveal>
      )}
    </>
  );
}
