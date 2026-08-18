import { useState } from 'react';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Bulb,
  CalendarDots,
  Check,
  ChevronDown,
  Clock,
  Cloud,
  Grip,
  Info,
  Moon,
  Pencil,
  Plus,
  Sun,
  Trash,
  Users,
} from '@/components/ui/icons';
import {
  ABOUT_SESSIONS,
  WEEKDAYS,
  effectiveDays,
  nextId,
  sessionTone,
  type ActivityDraft,
  type SessionDraft,
  type SessionTone,
  type Weekday,
} from '@/data/builder';

const TONE_ICON: Record<SessionTone, { Icon: typeof Sun; colour: string }> = {
  morning: { Icon: Sun, colour: '#EA8C00' },
  afternoon: { Icon: Cloud, colour: '#2563EB' },
  evening: { Icon: Moon, colour: '#6D28FF' },
  weekend: { Icon: CalendarDots, colour: '#16A34A' },
};

/** 2.3 — the slots participants actually book. */
export function StepSessions({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const toast = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  function update(id: string, patch: Partial<SessionDraft>) {
    set('sessions')(
      draft.sessions.map((session) => (session.id === id ? { ...session, ...patch } : session)),
    );
  }

  function add() {
    const id = nextId('s', draft.sessions);
    set('sessions')([
      ...draft.sessions,
      {
        id,
        name: `Session ${draft.sessions.length + 1}`,
        start: '09:00',
        end: '11:00',
        instructor: '',
        slots: draft.defaultCapacity,
        days: draft.operatingDays.slice(0, 1),
        active: true,
      },
    ]);
    setOpenId(id);
  }

  function remove(session: SessionDraft) {
    set('sessions')(draft.sessions.filter((item) => item.id !== session.id));
    if (openId === session.id) setOpenId(null);
    toast(`"${session.name}" removed`);
  }

  /** Drop the dragged session in front of the one it was released over. */
  function reorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const rest = draft.sessions.filter((session) => session.id !== dragId);
    const moved = draft.sessions.find((session) => session.id === dragId);
    if (!moved) return;
    const at = rest.findIndex((session) => session.id === targetId);
    rest.splice(at, 0, moved);
    set('sessions')(rest);
  }

  return (
    <>
      <p className="wiz-section__lede">
        Create the sessions for your activity. Participants will choose a session when booking.
      </p>

      <div className="org-card wiz-card">
        <div className="wiz-about">
          <span className="flex mt-px">
            <Info size={17} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <div>
            <strong>About Sessions</strong>
            <ul>
              {ABOUT_SESSIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="wiz-about__art float">
            <ImageSlot
              id="builder-sessions-art"
              radius={10}
              interactive={false}
              placeholder="Calendar + clock"
            />
          </div>
        </div>

        <div className="wiz-sessions__head">
          <h3>Sessions</h3>
          <button type="button" className="wiz-addsession" onClick={add}>
            <Plus size={14} color="#6D28FF" strokeWidth={2} />
            Add Session
          </button>
        </div>

        {draft.sessions.length === 0 ? (
          <p className="text-[13px] text-grey py-[18px] px-0">
            No sessions yet. Add one so participants have something to book.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {draft.sessions.map((session) => {
              const { Icon, colour } = TONE_ICON[sessionTone(session)];
              const open = openId === session.id;
              const days = effectiveDays(session, draft.operatingDays);

              return (
                <div
                  key={session.id}
                  className={`wiz-sess ${open ? 'is-open' : ''} ${dragId === session.id ? 'is-dragging' : ''}`.trim()}
                  draggable
                  onDragStart={() => setDragId(session.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => reorder(session.id)}
                >
                  <div className="wiz-sess__row">
                    <span className="flex cursor-grab" aria-hidden="true">
                      <Grip size={15} color="#C3C1CE" />
                    </span>

                    <span className={`wiz-sess__tone wiz-sess__tone--${sessionTone(session)}`}>
                      <Icon size={18} color={colour} strokeWidth={1.9} />
                    </span>

                    <div className="wiz-sess__main">
                      <div className="flex items-center gap-2.5 text-[13.5px] font-semibold">
                        {session.name}
                        <span className={`org-pill ${session.active ? 'org-pill--live' : 'org-pill--draft'}`}>
                          {session.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="wiz-sess__meta">
                        <span>
                          <Clock size={13} color="#8B8A99" strokeWidth={1.9} />
                          {session.start} – {session.end}
                        </span>
                        <span>
                          <Users size={13} color="#8B8A99" strokeWidth={1.9} />
                          {session.instructor || 'No instructor yet'}
                        </span>
                        <span>{session.slots} slots</span>
                        {/* Only worth saying when 2.2 has left the session unrunnable. */}
                        {days.length === 0 ? (
                          <span className="text-amber-ink font-semibold">Runs on no operating day</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="wiz-sess__actions">
                      <button
                        type="button"
                        className="wiz-iconbtn"
                        onClick={() => setOpenId(open ? null : session.id)}
                        aria-label={`Edit ${session.name}`}
                      >
                        <Pencil size={15} color="#6D28FF" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        className="wiz-iconbtn wiz-iconbtn--danger"
                        onClick={() => remove(session)}
                        aria-label={`Delete ${session.name}`}
                      >
                        <Trash size={15} color="#E11D48" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        className="wiz-iconbtn wiz-iconbtn--ghost"
                        onClick={() => setOpenId(open ? null : session.id)}
                        aria-expanded={open}
                        aria-label={open ? `Collapse ${session.name}` : `Expand ${session.name}`}
                      >
                        <ChevronDown size={16} color="#8B8A99" className={open ? 'is-flipped' : undefined} />
                      </button>
                    </div>
                  </div>

                  {open ? (
                    <div className="wiz-sess__edit">
                      <label className="field">
                        <span className="block text-[13.5px] font-semibold text-ink">Session name</span>
                        <input
                          className="wiz-input"
                          value={session.name}
                          aria-label="Session name"
                          onChange={(event) => update(session.id, { name: event.target.value })}
                        />
                      </label>

                      <label className="field">
                        <span className="block text-[13.5px] font-semibold text-ink">Starts</span>
                        <input
                          className="wiz-input"
                          type="time"
                          value={session.start}
                          aria-label="Session start time"
                          onChange={(event) => update(session.id, { start: event.target.value })}
                        />
                      </label>

                      <label className="field">
                        <span className="block text-[13.5px] font-semibold text-ink">Ends</span>
                        <input
                          className="wiz-input"
                          type="time"
                          value={session.end}
                          aria-label="Session end time"
                          onChange={(event) => update(session.id, { end: event.target.value })}
                        />
                      </label>

                      <label className="field">
                        <span className="block text-[13.5px] font-semibold text-ink">Instructor</span>
                        <input
                          className="wiz-input"
                          value={session.instructor}
                          placeholder="e.g., Instructor Rani"
                          aria-label="Instructor"
                          onChange={(event) => update(session.id, { instructor: event.target.value })}
                        />
                      </label>

                      <label className="field">
                        <span className="block text-[13.5px] font-semibold text-ink">Slots</span>
                        <input
                          className="wiz-input"
                          inputMode="numeric"
                          value={session.slots}
                          aria-label="Slots per session"
                          onChange={(event) =>
                            update(session.id, { slots: Number(event.target.value.replace(/\D/g, '')) || 0 })
                          }
                        />
                      </label>

                      <div className="wiz-sess__days">
                        <span className="block text-[13.5px] font-semibold text-ink">Runs on</span>
                        <div>
                          {WEEKDAYS.map((day) => {
                            const operating = draft.operatingDays.includes(day);
                            const on = session.days.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                className={`wiz-daychip ${on && operating ? 'is-on' : ''}`.trim()}
                                disabled={!operating}
                                title={operating ? undefined : 'Not an operating day — set it in 2.2'}
                                aria-pressed={on && operating}
                                onClick={() =>
                                  update(session.id, {
                                    days: on
                                      ? session.days.filter((item) => item !== day)
                                      : ([...session.days, day] as Weekday[]),
                                  })
                                }
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <label
                        className={`wiz-check wiz-sess__active ${session.active ? 'is-on' : ''}`.trim()}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={session.active}
                          onChange={(event) => update(session.id, { active: event.target.checked })}
                        />
                        <span className="wiz-check__box" aria-hidden="true">
                          <Check size={11} color="#fff" strokeWidth={3} />
                        </span>
                        Bookable by participants
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="wiz-note wiz-note--tip">
          <span className="flex-none flex mt-px">
            <Bulb size={17} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <div>
            <strong>Tips</strong>
            <p>You can reorder the sessions by dragging the session cards.</p>
          </div>
        </div>
      </div>
    </>
  );
}
