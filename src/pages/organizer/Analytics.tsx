import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { BarList, Donut, TrendChart } from '@/components/ui/charts';
import { ANALYTICS_MONTHS, ORG_STATS, TOP_EXPERIENCES, TRAFFIC_SOURCES } from '@/data/organizer';
import { rupiah, shortRupiah } from '@/lib/format';

type Metric = 'registrations' | 'revenue';


const SOURCE_TONES = ['#6D28FF', '#E2547F', '#16A34A', '#EA8C00'];

export function OrgAnalytics() {
  const [metric, setMetric] = useState<Metric>('registrations');
  const money = metric === 'revenue';

  const headline = ORG_STATS.filter((stat) =>
    ['registrations', 'revenue', 'experiences', 'sessions'].includes(stat.key),
  );
  const totalRegistrations = ANALYTICS_MONTHS.reduce((sum, month) => sum + month.registrations, 0);
  const totalRevenue = ANALYTICS_MONTHS.reduce((sum, month) => sum + month.revenue, 0);

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Analytics</h1>
          <p>Where your registrations come from, and what they are worth.</p>
        </div>
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
            onClick={() => setMetric('revenue')}
            aria-pressed={money}
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
            <h2 className="org-card__title">{money ? 'Revenue' : 'Registrations'} — last 6 months</h2>
            <span className="tm-muted">Feb – Jul 2026</span>
          </div>
          <div className="org-card__body">
            <TrendChart
              key={metric}
              seriesLabel={money ? 'Revenue' : 'Registrations'}
              tone={money ? 'green' : 'brand'}
              height={240}
              format={money ? rupiah : undefined}
              formatAxis={money ? shortRupiah : undefined}
              points={ANALYTICS_MONTHS.map((month) => ({
                label: month.month,
                value: money ? month.revenue : month.registrations,
              }))}
            />
            <p className="tm-muted" style={{ lineHeight: 1.7, marginTop: 14 }}>
              {money
                ? `${rupiah(totalRevenue)} across the half year, peaking in June.`
                : `${totalRegistrations.toLocaleString('id-ID')} registrations across the half year, and July is still running.`}
            </p>
          </div>
        </Reveal>

        <div className="org-panels">
          <Reveal className="org-card" delay={120}>
            <div className="org-card__head">
              <h2 className="org-card__title">Top experiences</h2>
              <span className="tm-muted">By registrations</span>
            </div>
            <div className="org-card__body">
              <BarList
                ranked
                bars={TOP_EXPERIENCES.map((experience) => ({
                  label: experience.title,
                  value: experience.registrations,
                  display: experience.registrations.toLocaleString('id-ID'),
                }))}
              />
            </div>
          </Reveal>

          <Reveal className="org-card" delay={180}>
            <div className="org-card__head">
              <h2 className="org-card__title">Where people find you</h2>
              <span className="tm-muted">Share of registrations</span>
            </div>
            <div className="org-card__body">
              <Donut
                slices={TRAFFIC_SOURCES.map((source, index) => ({
                  label: source.source,
                  value: source.share,
                  tone: SOURCE_TONES[index % SOURCE_TONES.length],
                  display: `${source.share}%`,
                }))}
                total={totalRegistrations.toLocaleString('id-ID')}
                caption="registrations"
                showShare={false}
              />
              <p className="tm-muted" style={{ lineHeight: 1.7, marginTop: 16 }}>
                Connect (WhatsApp CRM) drives {TRAFFIC_SOURCES[2].share}% of registrations on the Pro tier — the
                audience you already own, brought back for the next session.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
