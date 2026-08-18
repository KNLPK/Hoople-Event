import { useState } from 'react';
import { CounterInput, SelectInput } from '../WizardFields';
import { EventHead, type EventSectionProps } from './shared';
import { useToast } from '@/components/ui/Toast';
import {
  Cafe,
  Card,
  Clock,
  DotsVertical,
  Flag,
  Gift,
  Grid,
  Grip,
  Info,
  Mic,
  Monitor,
  Plus,
  Sparkle,
  Trash,
  Users,
} from '@/components/ui/icons';
import {
  DELIVERY_MODES,
  SESSION_KINDS,
  SESSION_DESC_LIMIT,
  SESSION_TITLE_LIMIT,
  nextEventId,
  timedSessions,
  totalDuration,
  type DeliveryMode,
  type EventSession,
  type SessionKind,
} from '@/data/eventBuilder';

/** The timeline icon comes from the session's kind and title, never a stored field. */
function sessionIcon(session: EventSession) {
  const text = session.title.toLowerCase();
  if (session.kind === 'Break') return { Icon: Cafe, colour: '#EA8C00', tint: 'amber' };
  if (session.kind === 'Networking') return { Icon: Users, colour: '#EA8C00', tint: 'amber' };
  if (text.includes('registration') || text.includes('waiting')) {
    return { Icon: Clock, colour: '#6D28FF', tint: 'violet' };
  }
  if (text.includes('closing') || text.includes('next steps')) {
    return { Icon: Flag, colour: '#DB2777', tint: 'pink' };
  }
  if (text.includes('opening') || text.includes('welcome')) {
    return { Icon: Sparkle, colour: '#16A34A', tint: 'green' };
  }
  if (text.includes('demo') || text.includes('showcase') || text.includes('product')) {
    return { Icon: Monitor, colour: '#2563EB', tint: 'blue' };
  }
  if (text.includes('q&a') || text.includes('ama')) {
    return { Icon: Users, colour: '#DB2777', tint: 'pink' };
  }
  if (text.includes('prize') || text.includes('gift')) {
    return { Icon: Gift, colour: '#DB2777', tint: 'pink' };
  }
  return { Icon: Mic, colour: '#2563EB', tint: 'blue' };
}

const DELIVERY_LABEL: Record<DeliveryMode, string> = {
  Onsite: 'Onsite Only',
  Online: 'Online Only',
  Both: 'Onsite + Online',
};

/** 2.3 — the running order. Timeline reads it; list edits it. */
export function EventSchedule({ draft, set }: EventSectionProps) {
  const toast = useToast();
  const [dragId, setDragId] = useState<string | null>(null);

  const hybrid = draft.eventType === 'Hybrid';
  const schedule = timedSessions(draft);

  function update(id: string, patch: Partial<EventSession>) {
    set('sessions')(
      draft.sessions.map((session) => (session.id === id ? { ...session, ...patch } : session)),
    );
  }

  function add(kind: SessionKind, minutes: number, title: string) {
    set('sessions')([
      ...draft.sessions,
      {
        id: nextEventId(draft.sessions),
        title,
        description: '',
        kind,
        speaker: '',
        minutes,
        delivery: 'Both',
      },
    ]);
    set('scheduleView')('list');
  }

  function reorder(target: string) {
    if (!dragId || dragId === target) return;
    const rest = draft.sessions.filter((session) => session.id !== dragId);
    const moved = draft.sessions.find((session) => session.id === dragId);
    if (!moved) return;
    rest.splice(rest.findIndex((session) => session.id === target), 0, moved);
    set('sessions')(rest);
  }

  return (
    <>
      <EventHead
        lede="Build your event timeline. Add sessions, breaks, and activities."
        tip={
          hybrid
            ? 'Use delivery mode to define whether the session is Onsite, Online, or both.'
            : 'A well-structured schedule keeps participants engaged and informed.'
        }
      />

      <div className="org-card wiz-card">
        <div className="evt-sched__bar">
          <div className="view-toggle" role="group" aria-label="Schedule view">
            <button
              type="button"
              className={draft.scheduleView === 'timeline' ? 'is-on' : ''}
              onClick={() => set('scheduleView')('timeline')}
              aria-pressed={draft.scheduleView === 'timeline'}
            >
              <Grid size={14} color={draft.scheduleView === 'timeline' ? '#6D28FF' : 'currentColor'} strokeWidth={2} />
              Timeline View
            </button>
            <button
              type="button"
              className={draft.scheduleView === 'list' ? 'is-on' : ''}
              onClick={() => set('scheduleView')('list')}
              aria-pressed={draft.scheduleView === 'list'}
            >
              <Card size={14} color={draft.scheduleView === 'list' ? '#6D28FF' : 'currentColor'} strokeWidth={2} />
              List View
            </button>
          </div>

          <div className="evt-sched__actions">
            {hybrid ? (
              <button
                type="button"
                className="wiz-addsession"
                onClick={() =>
                  toast('Bulk actions set delivery mode across several sessions at once')
                }
              >
                <Sparkle size={14} color="#6D28FF" strokeWidth={2} />
                Bulk Actions
              </button>
            ) : null}
            <button
              type="button"
              className="wiz-addsession"
              onClick={() => add('Presentation', 30, `Session ${draft.sessions.length + 1}`)}
            >
              <Plus size={14} color="#6D28FF" strokeWidth={2} />
              Add Session
            </button>
          </div>
        </div>

        {draft.sessions.length === 0 ? (
          <p className="wiz-sessions__empty">
            No sessions yet. Add one so participants know how the day runs.
          </p>
        ) : draft.scheduleView === 'timeline' ? (
          <div className="evt-timeline">
            {schedule.map((session) => {
              const { Icon, colour, tint } = sessionIcon(session);
              return (
                <div key={session.id} className="evt-tl">
                  <div className="evt-tl__when">
                    <span className="evt-tl__dot" aria-hidden="true" />
                    <strong>{session.start}</strong>
                    <em>{session.end}</em>
                  </div>

                  <div className="evt-tl__body">
                    <span className={`wiz-sess__tone evt-tl__icon--${tint}`}>
                      <Icon size={16} color={colour} strokeWidth={1.9} />
                    </span>
                    <div>
                      <strong>{session.title}</strong>
                      {session.description ? <span>{session.description}</span> : null}
                    </div>
                  </div>

                  {/* Chips, speaker and length share one row that wraps under the
                      title when the column runs out of room. */}
                  <div className="evt-tl__meta">
                    {hybrid ? (
                      <span className={`evt-mode evt-mode--${session.delivery.toLowerCase()}`}>
                        {DELIVERY_LABEL[session.delivery]}
                      </span>
                    ) : session.kind !== 'Break' ? (
                      <span className="evt-kind">{session.kind}</span>
                    ) : null}

                    {session.speaker ? (
                      <span className="evt-tl__who">
                        <Users size={13} color="#8B8A99" strokeWidth={1.9} />
                        {session.speaker}
                      </span>
                    ) : null}

                    <span className="evt-tl__mins">{session.minutes} min</span>
                  </div>

                  <button
                    type="button"
                    className="wiz-iconbtn wiz-iconbtn--ghost"
                    onClick={() => {
                      set('scheduleView')('list');
                      toast(`Editing "${session.title}"`);
                    }}
                    aria-label={`Edit ${session.title}`}
                  >
                    <DotsVertical size={15} color="#8B8A99" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="evt-rows">
            {schedule.map((session) => (
              <div
                key={session.id}
                className={`evt-row ${dragId === session.id ? 'is-dragging' : ''}`.trim()}
                draggable
                onDragStart={() => setDragId(session.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorder(session.id)}
              >
                <div className="evt-row__time">
                  <span className="evt-row__grip" aria-hidden="true">
                    <Grip size={14} color="#C3C1CE" />
                  </span>
                  <div>
                    <strong>{session.start}</strong>
                    <em>{session.end}</em>
                  </div>
                </div>

                <div className="evt-row__fields">
                  <div className="wiz-pair">
                    <div>
                      <span className="wiz-field__label">
                        Session Title<span className="field__req"> *</span>
                      </span>
                      <CounterInput
                        ariaLabel="Session title"
                        value={session.title}
                        onChange={(value) => update(session.id, { title: value })}
                        limit={SESSION_TITLE_LIMIT}
                        placeholder="e.g., Opening Remarks"
                      />
                    </div>
                    <div className="evt-row__pair">
                      <div>
                        <span className="wiz-field__label">Type</span>
                        <SelectInput
                          ariaLabel="Session type"
                          value={session.kind}
                          options={SESSION_KINDS.map((kind) => kind.value)}
                          onChange={(value) => update(session.id, { kind: value as SessionKind })}
                          leading={
                            <span
                              className="evt-dot"
                              style={{
                                background: SESSION_KINDS.find((k) => k.value === session.kind)?.colour,
                              }}
                            />
                          }
                        />
                      </div>
                      <div>
                        <span className="wiz-field__label">Duration</span>
                        <span className="wiz-affix">
                          <input
                            value={session.minutes}
                            inputMode="numeric"
                            aria-label="Duration in minutes"
                            onChange={(event) =>
                              update(session.id, {
                                minutes: Number(event.target.value.replace(/\D/g, '')) || 0,
                              })
                            }
                          />
                          <span className="wiz-affix__suffix">min</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="wiz-pair">
                    <div>
                      <span className="wiz-field__label">
                        Description <span className="wiz-field__optional">(Optional)</span>
                      </span>
                      <CounterInput
                        ariaLabel="Session description"
                        value={session.description}
                        onChange={(value) => update(session.id, { description: value })}
                        limit={SESSION_DESC_LIMIT}
                        placeholder="What happens in this session?"
                      />
                    </div>
                    <div>
                      <span className="wiz-field__label">
                        Speaker <span className="wiz-field__optional">(Optional)</span>
                      </span>
                      <CounterInput
                        ariaLabel="Speaker"
                        value={session.speaker}
                        onChange={(value) => update(session.id, { speaker: value })}
                        limit={SESSION_TITLE_LIMIT}
                        placeholder="e.g., Dewi Lestari"
                      />
                    </div>
                  </div>

                  {hybrid ? (
                    <div>
                      <span className="wiz-field__label">Delivery Mode</span>
                      <div className="evt-modes">
                        {DELIVERY_MODES.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            className={`evt-mode evt-mode--${mode.toLowerCase()} ${
                              session.delivery === mode ? 'is-on' : ''
                            }`.trim()}
                            onClick={() => update(session.id, { delivery: mode })}
                            aria-pressed={session.delivery === mode}
                          >
                            {DELIVERY_LABEL[mode]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="wiz-iconbtn wiz-iconbtn--danger"
                  onClick={() => {
                    set('sessions')(draft.sessions.filter((item) => item.id !== session.id));
                    toast(`"${session.title}" removed`);
                  }}
                  aria-label={`Remove ${session.title}`}
                >
                  <Trash size={15} color="#E11D48" strokeWidth={1.9} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="evt-addbreak"
          onClick={() => add('Break', 15, 'Break')}
        >
          <Plus size={15} color="#6D28FF" strokeWidth={2} />
          Add Break
        </button>

        <div className="evt-sched__foot">
          <span>
            <Info size={15} color="#8B8A99" strokeWidth={1.9} />
            Total duration: <strong>{totalDuration(draft)}</strong> · All times are in{' '}
            {draft.timezone}
          </span>
        </div>
      </div>
    </>
  );
}
