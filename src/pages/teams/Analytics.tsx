import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Download, Info } from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import { Donut, Meter, TrendLine } from '@/components/teams/charts';
import {
  DEPARTMENTS,
  DEVICE_SPLIT,
  ORGANIZATION,
  REGISTRATION_SOURCES,
  REGISTRATION_TREND,
  collected,
  funnel,
  sessionsFor,
  type TeamEvent,
} from '@/data/teams';
import { rupiah } from '@/lib/format';

const PASS_TONES = ['#6D28FF', '#16A34A', '#EA8C00', '#E2547F', '#2C7D84'];

/**
 * What a public event measures — page views, traffic sources, conversion — is
 * meaningless for an invite that went to a known list of 486 people. So the
 * funnel here counts people out of that roll, and "where they came from" means
 * which internal channel carried the invite.
 */
export function TeamsAnalytics() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const steps = funnel(event);
  const invited = steps[0].count;
  const gross = collected(event);
  const sessions = sessionsFor(event.id);
  const topSessions = [...sessions].sort((a, b) => b.booked / b.capacity - a.booked / a.capacity).slice(0, 3);

  /* A score out of 100 has to come from somewhere — response, turnout and fill. */
  const response = event.registered / invited;
  const turnout = event.checkedIn / Math.max(event.registered, 1);
  const fill = event.registered / event.capacity;
  const score = Math.round((response * 0.3 + turnout * 0.4 + fill * 0.3) * 100);

  return (
    <>
      <EventContext event={event}>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Exporting the analytics report')}>
          <Download size={15} strokeWidth={1.9} />
          Export
        </Button>
      </EventContext>

      <div className="tm-cols">
        <div className="stack" style={{ gap: 18 }}>
          <Reveal className="org-stats org-stats--4">
            <Stat label="Invited" value={String(invited)} note={`${ORGANIZATION.name} members`} />
            <Stat
              label="Registered"
              value={String(event.registered)}
              note={`${Math.round(response * 1000) / 10}% response`}
              up
            />
            <Stat label="Attended" value={String(event.checkedIn)} note={`${Math.round(turnout * 1000) / 10}% turnout`} up />
            <Stat label="Collected" value={rupiah(gross)} note="Member contributions" money />
          </Reveal>

          <div className="org-panels">
            <Reveal className="org-card">
              <div className="org-card__head">
                <h2 className="org-card__title">Registration trend</h2>
                <span className="tm-muted">Last 7 days</span>
              </div>
              <div className="org-card__body">
                <TrendLine
                  points={REGISTRATION_TREND.map((day) => ({
                    label: day.day,
                    value: day.count,
                    previous: day.previous,
                  }))}
                />
              </div>
            </Reveal>

            <Reveal className="org-card" delay={60}>
              <div className="org-card__head">
                <h2 className="org-card__title">Invite funnel</h2>
                <span className="tm-muted">People, not page views</span>
              </div>
              <div className="org-card__body">
                <div className="tm-funnel">
                  {steps.map((step) => (
                    <div key={step.label} className="tm-funnel__row">
                      <div className="tm-funnel__head">
                        <span>
                          <strong>{step.label}</strong>
                          <em>{step.note}</em>
                        </span>
                        <span className="tm-funnel__count">
                          {step.count}
                          <i>{Math.round((step.count / invited) * 100)}%</i>
                        </span>
                      </div>
                      <Meter value={step.count} max={invited} />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="org-panels">
            <Reveal className="org-card">
              <div className="org-card__head">
                <h2 className="org-card__title">Passes taken</h2>
              </div>
              <div className="org-card__body">
                <Donut
                  slices={event.passes.map((pass, index) => ({
                    label: pass.name,
                    value: pass.sold,
                    tone: PASS_TONES[index % PASS_TONES.length],
                  }))}
                  total={String(event.registered)}
                  caption="registrations"
                />
              </div>
            </Reveal>

            <Reveal className="org-card" delay={60}>
              <div className="org-card__head">
                <h2 className="org-card__title">How members registered</h2>
                <span className="tm-muted">Internal channels</span>
              </div>
              <div className="org-card__body">
                <div className="org-bars">
                  {REGISTRATION_SOURCES.map((source) => (
                    <div key={source.source}>
                      <div className="org-bar__head">
                        <span>{source.source}</span>
                        <strong>{source.share}%</strong>
                      </div>
                      <div className="org-bar__track">
                        <div className="org-bar__fill" style={{ width: `${source.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="tm-muted" style={{ lineHeight: 1.7, marginTop: 18 }}>
                  There is no search or social traffic to measure — this event has no public page. Every registration
                  came from a channel the organization already owns.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal className="org-card" delay={120}>
            <div className="org-card__head">
              <h2 className="org-card__title">Response by department</h2>
              <span className="tm-muted">Registered out of headcount</span>
            </div>
            <div className="org-card__body">
              <div className="org-bars">
                {DEPARTMENTS.map((department, index) => {
                  /* Departments respond at different rates; seeded from the roll
                     so the shares always add up to the registration total. */
                  const weight = [0.42, 0.48, 0.28, 0.31, 0.55, 0.36][index] ?? 0.35;
                  const registered = Math.round(department.headcount * weight);
                  return (
                    <div key={department.name}>
                      <div className="org-bar__head">
                        <span>{department.name}</span>
                        <strong>
                          {registered} / {department.headcount}
                        </strong>
                      </div>
                      <div className="org-bar__track">
                        <div
                          className="org-bar__fill org-bar__fill--soft"
                          style={{ width: `${Math.round(weight * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        <aside className="stack tm-rail" style={{ gap: 18 }}>
          <Reveal className="org-card">
            <div className="org-card__head">
              <h2 className="org-card__title">Event score</h2>
              <button type="button" className="org-icon-btn" onClick={() => toast('Response 30%, turnout 40%, fill 30%')} aria-label="How the score works">
                <Info size={16} color="#8B8A99" strokeWidth={1.9} />
              </button>
            </div>
            <div className="org-card__body">
              <div className="tm-score">
                <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={`Score ${score} out of 100`}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line)" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#6D28FF"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 314} 314`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="tm-score__value">
                  <strong>{score}</strong>
                  <span>/100</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <strong style={{ fontSize: 15 }}>{score >= 80 ? 'Excellent' : score >= 60 ? 'Solid' : 'Needs a push'}</strong>
                <p className="tm-muted" style={{ lineHeight: 1.6, marginTop: 4 }}>
                  Weighted from response, turnout and how full the room got.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="org-card" delay={60}>
            <div className="org-card__head">
              <h2 className="org-card__title">Fullest sessions</h2>
            </div>
            <div className="org-card__body">
              <div className="org-bars">
                {topSessions.map((session, index) => (
                  <div key={session.id}>
                    <div className="org-bar__head">
                      <span>
                        <em className="tm-rank">{index + 1}</em>
                        {session.title}
                      </span>
                      <strong>{Math.round((session.booked / session.capacity) * 100)}%</strong>
                    </div>
                    <div className="org-bar__track">
                      <div
                        className="org-bar__fill"
                        style={{ width: `${Math.round((session.booked / session.capacity) * 100)}%` }}
                      />
                    </div>
                    <span className="org-table__sub">
                      {session.room} · {session.booked} / {session.capacity} booked
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="org-card" delay={120}>
            <div className="org-card__head">
              <h2 className="org-card__title">Devices used</h2>
            </div>
            <div className="org-card__body">
              <Donut
                slices={DEVICE_SPLIT.map((device) => ({
                  label: device.label,
                  value: device.share,
                  tone: device.tone,
                }))}
                total={String(event.registered)}
                caption="registrations"
                size={148}
              />
            </div>
          </Reveal>
        </aside>
      </div>
    </>
  );
}

function Stat({ label, value, note, up, money }: { label: string; value: string; note: string; up?: boolean; money?: boolean }) {
  return (
    <div className="org-stat">
      <div className="org-stat__label" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div className={`org-stat__value ${money ? 'org-stat__value--money' : ''}`.trim()}>{value}</div>
      <div className={`org-stat__note ${up ? 'is-up' : ''}`.trim()}>{note}</div>
    </div>
  );
}
