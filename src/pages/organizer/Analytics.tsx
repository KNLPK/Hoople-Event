import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { ANALYTICS_MONTHS, ORG_STATS, TOP_EXPERIENCES, TRAFFIC_SOURCES } from '@/data/organizer';
import { rupiah } from '@/lib/format';

type Metric = 'registrations' | 'revenue';

export function OrgAnalytics() {
  const [metric, setMetric] = useState<Metric>('registrations');

  const peak = Math.max(...ANALYTICS_MONTHS.map((month) => month[metric]));
  const headline = ORG_STATS.filter((stat) =>
    ['registrations', 'revenue', 'experiences', 'sessions'].includes(stat.key),
  );

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Analytics</h1>
          <p>Where your registrations come from, and what they are worth.</p>
        </div>
        <div className="org-filters" style={{ margin: 0 }}>
          <button
            type="button"
            className={`chip chip-motion ${metric === 'registrations' ? 'is-active' : ''}`.trim()}
            onClick={() => setMetric('registrations')}
            aria-pressed={metric === 'registrations'}
          >
            Registrations
          </button>
          <button
            type="button"
            className={`chip chip-motion ${metric === 'revenue' ? 'is-active' : ''}`.trim()}
            onClick={() => setMetric('revenue')}
            aria-pressed={metric === 'revenue'}
          >
            Revenue
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 18 }}>
        <Reveal className="org-stats org-stats--4">
          {headline.map((stat) => (
            <div key={stat.key} className="org-stat">
              <div className="org-stat__label" style={{ marginBottom: 10 }}>
                {stat.label}
              </div>
              <div
                className={`org-stat__value ${stat.key === 'revenue' ? 'org-stat__value--money' : ''}`.trim()}
              >
                {stat.value}
              </div>
              <div className="org-stat__note">{stat.delta ?? stat.note}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="org-card__head">
            <h2 className="org-card__title">
              {metric === 'registrations' ? 'Registrations' : 'Revenue'} — last 6 months
            </h2>
            <span style={{ fontSize: 13, color: 'var(--grey)' }}>Feb – Jul 2026</span>
          </div>
          <div className="org-card__body">
            <div className="org-chart">
              {ANALYTICS_MONTHS.map((month) => (
                <div key={month.month} className="org-chart__col">
                  <span className="org-chart__value">
                    {metric === 'revenue'
                      ? `${Math.round(month.revenue / 1_000_000)}jt`
                      : month.registrations}
                  </span>
                  <div
                    className="org-chart__bar"
                    style={{ height: `${Math.round((month[metric] / peak) * 100)}%` }}
                  />
                  <span className="org-chart__label">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="org-panels">
          <Reveal className="org-card" delay={120}>
            <div className="org-card__head">
              <h2 className="org-card__title">Top experiences</h2>
              <span style={{ fontSize: 13, color: 'var(--grey)' }}>By registrations</span>
            </div>
            <div className="org-card__body">
              <div className="org-bars">
                {TOP_EXPERIENCES.map((experience) => (
                  <div key={experience.title}>
                    <div className="org-bar__head">
                      <span>{experience.title}</span>
                      <strong>{experience.registrations}</strong>
                    </div>
                    <div className="org-bar__track">
                      <div className="org-bar__fill" style={{ width: `${experience.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="org-card" delay={180}>
            <div className="org-card__head">
              <h2 className="org-card__title">Where people find you</h2>
              <span style={{ fontSize: 13, color: 'var(--grey)' }}>Share of registrations</span>
            </div>
            <div className="org-card__body">
              <div className="org-bars">
                {TRAFFIC_SOURCES.map((source) => (
                  <div key={source.source}>
                    <div className="org-bar__head">
                      <span>{source.source}</span>
                      <strong>{source.share}%</strong>
                    </div>
                    <div className="org-bar__track">
                      <div className="org-bar__fill org-bar__fill--soft" style={{ width: `${source.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--grey)', lineHeight: 1.7, marginTop: 20 }}>
                Connect (WhatsApp CRM) drives {TRAFFIC_SOURCES[2].share}% of registrations on the Pro tier —
                the audience you already own, brought back for the next session. Highest single month so far:{' '}
                {rupiah(Math.max(...ANALYTICS_MONTHS.map((m) => m.revenue)))}.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
