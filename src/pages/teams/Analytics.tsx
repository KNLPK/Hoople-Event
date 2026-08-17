import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Download, Info } from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import { BarList, Donut, Meter, TrendChart } from '@/components/ui/charts';
import {
  DEVICE_SPLIT,
  ORGANIZATION,
  REGISTRATION_SOURCES,
  REGISTRATION_TREND,
  collected,
  departmentResponse,
  funnel,
  sessionsFor,
  type TeamEvent,
} from '@/data/teams';
import { rupiah, shortRupiah } from '@/lib/format';

const PASS_TONES = ['#6D28FF', '#16A34A', '#EA8C00', '#E2547F', '#2C7D84'];

type Metric = 'registrations' | 'contributions';


/**
 * What a public event measures — page views, traffic sources, conversion — is
 * meaningless for an invite that went to a known list of 486 people. So the
 * funnel here counts people out of that roll, and "where they came from" means
 * which internal channel carried the invite.
 */
export function TeamsAnalytics() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();
  const [metric, setMetric] = useState<Metric>('registrations');

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

  const money = metric === 'contributions';

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

          <Reveal className="org-card">
            <div className="org-card__head">
              <h2 className="org-card__title">{money ? 'Contributions' : 'Registrations'} — last 7 days</h2>
              <div className="tm-toggleset" role="group" aria-label="Chart metric">
                <button
                  type="button"
                  className={`tm-toggleset__btn ${metric === 'registrations' ? 'is-on' : ''}`.trim()}
                  onClick={() => setMetric('registrations')}
                  aria-pressed={metric === 'registrations'}
                >
                  Registrations
                </button>
                <button
                  type="button"
                  className={`tm-toggleset__btn ${money ? 'is-on' : ''}`.trim()}
                  onClick={() => setMetric('contributions')}
                  aria-pressed={money}
                >
                  Contributions
                </button>
              </div>
            </div>
            <div className="org-card__body">
              <TrendChart
                key={metric}
                seriesLabel={money ? 'Contributions' : 'Registrations'}
                previousLabel="Previous 7 days"
                tone={money ? 'green' : 'brand'}
                height={230}
                format={money ? rupiah : undefined}
                formatAxis={money ? shortRupiah : undefined}
                points={REGISTRATION_TREND.map((day) => ({
                  label: day.day,
                  value: money ? day.contributed : day.count,
                  previous: money ? undefined : day.previous,
                }))}
              />
              <p className="tm-muted" style={{ lineHeight: 1.7, marginTop: 14 }}>
                {money
                  ? `The seven days add up to ${rupiah(gross)} — every rupiah collected for this event.`
                  : `The seven days add up to ${event.registered} registrations — the whole list.`}
              </p>
            </div>
          </Reveal>

          <div className="org-panels">
            <Reveal className="org-card">
              <div className="org-card__head">
                <h2 className="org-card__title">Invite funnel</h2>
                <span className="tm-muted">People, not page views</span>
              </div>
              <div className="org-card__body">
                <div className="tm-funnel">
                  {steps.map((step, index) => {
                    const previous = index === 0 ? step.count : steps[index - 1].count;
                    const kept = Math.round((step.count / previous) * 100);
                    return (
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
                        {index > 0 ? (
                          <span className="tm-funnel__drop">
                            {kept}% of the step above · {previous - step.count} dropped
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal className="org-card" delay={60}>
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
          </div>

          <div className="org-panels">
            <Reveal className="org-card">
              <div className="org-card__head">
                <h2 className="org-card__title">How members registered</h2>
                <span className="tm-muted">Internal channels</span>
              </div>
              <div className="org-card__body">
                <BarList
                  bars={REGISTRATION_SOURCES.map((source) => ({
                    label: source.source,
                    value: source.share,
                    display: `${source.share}%`,
                  }))}
                  max={100}
                />
                <p className="tm-muted" style={{ lineHeight: 1.7, marginTop: 18 }}>
                  There is no search or social traffic to measure — this event has no public page. Every registration
                  came from a channel the organization already owns.
                </p>
              </div>
            </Reveal>

            <Reveal className="org-card" delay={60}>
              <div className="org-card__head">
                <h2 className="org-card__title">Response by department</h2>
                <span className="tm-muted">Registered of headcount</span>
              </div>
              <div className="org-card__body">
                <BarList
                  bars={departmentResponse(event).map((row) => ({
                    label: row.name,
                    value: row.share,
                    display: `${row.registered} / ${row.headcount}`,
                    sub: `${row.share}% responded`,
                    tone: row.share >= 45 ? '#16A34A' : row.share >= 30 ? '#6D28FF' : '#EA8C00',
                  }))}
                  max={100}
                />
              </div>
            </Reveal>
          </div>
        </div>

        <aside className="stack tm-rail" style={{ gap: 18 }}>
          <Reveal className="org-card">
            <div className="org-card__head">
              <h2 className="org-card__title">Event score</h2>
              <button
                type="button"
                className="org-icon-btn"
                onClick={() => toast('Response 30%, turnout 40%, how full the room got 30%')}
                aria-label="How the score is worked out"
              >
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
              <BarList
                ranked
                max={100}
                bars={topSessions.map((session) => ({
                  label: session.title,
                  value: Math.round((session.booked / session.capacity) * 100),
                  display: `${Math.round((session.booked / session.capacity) * 100)}%`,
                  sub: `${session.room} · ${session.booked} / ${session.capacity} booked`,
                }))}
              />
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
                  display: `${device.share}%`,
                }))}
                total={String(event.registered)}
                caption="registrations"
                size={148}
                showShare={false}
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
