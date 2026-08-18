import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import {
  Bulb,
  Calendar,
  Clock,
  Close,
  Doc,
  DotsVertical,
  Grip,
  Lock,
  Pencil,
  Plus,
  Search,
  Users,
} from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import { Meter } from '@/components/ui/charts';
import { sessionsFor, type SessionState, type TeamEvent, type TeamSession } from '@/data/teams';
import { compactDate } from '@/lib/format';

const TABS: (SessionState | 'All')[] = ['All', 'Upcoming', 'Ongoing', 'Ended'];

function stateTone(state: SessionState): string {
  return state === 'Ongoing' ? 'live' : state === 'Ended' ? 'ended' : 'upcoming';
}

/** The running order, and how full each hour of it is. */
export function TeamsSessions() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();
  const all = sessionsFor(event.id);

  const [tab, setTab] = useState<SessionState | 'All'>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<TeamSession | null>(all[1] ?? all[0] ?? null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return all.filter((session) => {
      if (tab !== 'All' && session.state !== tab) return false;
      if (!needle) return true;
      return `${session.title} ${session.room} ${session.lead}`.toLowerCase().includes(needle);
    });
  }, [all, tab, query]);

  const capacity = all.reduce((sum, s) => sum + s.capacity, 0);
  const booked = all.reduce((sum, s) => sum + s.booked, 0);
  const occupancy = capacity ? Math.round((booked / capacity) * 1000) / 10 : 0;

  return (
    <>
      <EventContext event={event}>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Session duplicated')}>
          <Doc size={15} strokeWidth={1.9} />
          Duplicate session
        </Button>
        <Button as="button" variant="primary" size="sm" onClick={() => toast('New session added to the running order')}>
          <Plus size={15} strokeWidth={2.2} />
          Add session
        </Button>
      </EventContext>

      <div className={`tm-work ${selected ? 'has-aside' : ''}`.trim()}>
        <div className="flex flex-col" style={{ gap: 18 }}>
          <Reveal className="org-stats org-stats--4">
            <Stat
              label="Total sessions"
              value={String(all.length)}
              note={`${all.filter((s) => s.state === 'Upcoming').length} upcoming · ${all.filter((s) => s.state === 'Ongoing').length} ongoing · ${all.filter((s) => s.state === 'Ended').length} ended`}
            />
            <Stat label="Seats booked" value={String(booked)} note={`${occupancy}% of total capacity`} />
            <Stat label="Total capacity" value={String(capacity)} note={`${capacity - booked} seats still open`} />
            <Stat
              label="Waitlisted"
              value={String(all.reduce((sum, s) => sum + s.waitlist, 0))}
              note="Members queued for a full session"
            />
          </Reveal>

          <div className="org-filters">
            {TABS.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip chip-motion ${tab === option ? 'is-active' : ''}`.trim()}
                onClick={() => setTab(option)}
                aria-pressed={tab === option}
              >
                {option}
                {option !== 'All' ? ` (${all.filter((s) => s.state === option).length})` : ` (${all.length})`}
              </button>
            ))}
            <label className="org-search" style={{ width: 260, marginLeft: 'auto' }}>
              <Search size={17} color="#8B8A99" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search session"
                aria-label="Search sessions"
              />
            </label>
          </div>

          <Reveal className="org-card">
            {rows.length ? (
              <div className="org-table-wrap">
                <table className="org-table tm-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Session</th>
                      <th>Date &amp; time</th>
                      <th className="org-table__num">Capacity</th>
                      <th>Booked</th>
                      <th>Status</th>
                      <th className="org-table__num">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((session) => (
                      <tr
                        key={session.id}
                        className={selected?.id === session.id ? 'is-selected' : undefined}
                        onClick={() => setSelected(session)}
                      >
                        <td className="tm-table__grip">
                          <Grip size={16} color="#C3C1CE" />
                        </td>
                        <td className="tm-cell-main">
                          <div className="tm-person">
                            <i className={`tm-dot is-${session.state === 'Ongoing' ? 'amber' : session.state === 'Ended' ? 'grey' : 'green'}`} />
                            <span>
                              <span className="org-table__title">{session.title}</span>
                              <span className="org-table__sub">{session.room}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center" style={{ gap: 6 }}>
                            <Calendar size={14} color="#8B8A99" strokeWidth={1.9} />
                            {compactDate(session.date)}
                          </div>
                          <div className="org-table__sub">
                            {session.start} – {session.end} WIB
                          </div>
                        </td>
                        <td className="org-table__num">
                          {session.booked} / {session.capacity}
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <Meter
                            value={session.booked}
                            max={session.capacity}
                            tone={session.booked / session.capacity > 0.85 ? 'amber' : 'green'}
                          />
                          <span className="org-table__sub">
                            {Math.round((session.booked / session.capacity) * 100)}%
                          </span>
                        </td>
                        <td>
                          <span className={`org-pill org-pill--${stateTone(session.state)}`}>{session.state}</span>
                        </td>
                        <td className="org-table__num">
                          <div className="flex items-center" style={{ gap: 4, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="org-icon-btn"
                              aria-label={`Edit ${session.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toast(`Editing ${session.title}`);
                              }}
                            >
                              <Pencil size={16} color="#5C5B6B" strokeWidth={1.9} />
                            </button>
                            <button
                              type="button"
                              className="org-icon-btn"
                              aria-label={`More actions for ${session.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toast(`Actions for ${session.title}`);
                              }}
                            >
                              <DotsVertical size={17} color="#5C5B6B" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 44, textAlign: 'center' }}>
                <div className="font-heading text-[17px] font-semibold mb-1.5">No sessions here</div>
                <p className="text-[13.5px] text-grey mb-[18px]">Try another tab, or add the first session of the running order.</p>
              </div>
            )}
          </Reveal>
        </div>

        {selected ? (
          <aside className="tm-aside">
            <button type="button" className="tm-aside__close" onClick={() => setSelected(null)} aria-label="Close session details">
              <Close size={17} color="#5C5B6B" />
            </button>

            <div className="tm-aside__body">
              {/* Room on the right for the close button that floats over this row. */}
              <div className="flex items-center" style={{ gap: 8, marginBottom: 12, paddingRight: 34 }}>
                <span className={`org-pill org-pill--${stateTone(selected.state)}`}>{selected.state}</span>
                <span className="text-[12.5px] text-grey" style={{ marginLeft: 'auto' }}>
                  {selected.state === 'Ongoing' ? 'Running now' : selected.state === 'Ended' ? 'Finished' : 'Not started'}
                </span>
              </div>

              <h3 className="font-heading text-[17px] font-semibold tracking-[-0.02em] mb-1.5">{selected.title}</h3>
              <p className="text-[12.5px] text-grey" style={{ lineHeight: 1.65, marginBottom: 14 }}>
                {selected.note}
              </p>

              <div className="tm-aside__line">
                <Calendar size={14} color="#8B8A99" strokeWidth={1.9} />
                {compactDate(selected.date)}
              </div>
              <div className="tm-aside__line">
                <Clock size={14} color="#8B8A99" strokeWidth={1.9} />
                {selected.start} – {selected.end} WIB
              </div>
              <div className="tm-aside__line">
                <Users size={14} color="#8B8A99" strokeWidth={1.9} />
                {selected.booked} / {selected.capacity} booked
              </div>
              <div className="tm-aside__line">
                <Lock size={14} color="#8B8A99" strokeWidth={1.9} />
                {selected.lead}
              </div>

              <div style={{ margin: '14px 0 20px' }}>
                <Meter value={selected.booked} max={selected.capacity} />
              </div>

              <div className="flex flex-col" style={{ gap: 8 }}>
                <Button as="button" variant="outline" size="sm" block onClick={() => toast(`Editing ${selected.title}`)}>
                  <Pencil size={15} strokeWidth={1.9} />
                  Edit session
                </Button>
                <Button
                  as="button"
                  variant="outline"
                  size="sm"
                  block
                  onClick={() => toast(`Booking closed for ${selected.title}`)}
                  className="tm-danger-btn"
                >
                  Close booking
                </Button>
              </div>

              <section className="mb-[22px]" style={{ marginTop: 20 }}>
                <div className="tm-asection__head">
                  <h3>Session summary</h3>
                </div>
                <Row label="Total capacity" value={String(selected.capacity)} />
                <Row
                  label="Booked"
                  value={`${selected.booked} (${Math.round((selected.booked / selected.capacity) * 100)}%)`}
                />
                <Row label="Available" value={String(selected.capacity - selected.booked)} />
                <Row label="Waitlist" value={String(selected.waitlist)} />
                <Row label="Checked in" value={String(selected.checkedIn)} />
                <Row label="No show" value={String(selected.noShow)} />
              </section>

              <div className="tm-tipbox">
                <Bulb size={16} color="#EA8C00" strokeWidth={1.9} />
                <div>
                  <strong>Tip</strong>
                  <p>
                    Closing booking keeps the seat count honest for catering. Members already on the waitlist stay
                    queued in case someone drops out.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="tm-arow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="org-stat">
      <div className="text-[12.5px] text-grey font-medium leading-[1.35]" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div className="org-stat__value">{value}</div>
      <div className="org-stat__note">{note}</div>
    </div>
  );
}
