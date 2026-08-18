import { useId, useMemo, useState } from 'react';

/**
 * The chart shapes both consoles need, drawn in plain SVG.
 *
 * They are interactive rather than decorative: a trend you can read a value
 * off, a ring you can pull one slice out of. Everything responds to hover, to
 * touch, and to the keyboard — a chart you can only read with a mouse is a
 * picture, and a picture cannot answer "what happened on the 17th".
 */

/* ---------- shared helpers ---------- */

/** Rounds an axis top up to something a person would choose: 20, 50, 500. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ---------- Trend ---------- */

export interface TrendPoint {
  label: string;
  value: number;
  /** The same day one period earlier, drawn as a ghost line. */
  previous?: number;
}

export interface TrendChartProps {
  points: TrendPoint[];
  /** What one value means, shown in the tooltip and the legend. */
  seriesLabel?: string;
  previousLabel?: string;
  /** Formats a value for the tooltip. */
  format?: (value: number) => string;
  /** Formats an axis tick — money charts want a shorter form. */
  formatAxis?: (value: number) => string;
  height?: number;
  tone?: 'brand' | 'green';
}

export function TrendChart({
  points,
  seriesLabel = 'Registrations',
  previousLabel = 'Previous period',
  format = (value) => value.toLocaleString('id-ID'),
  formatAxis,
  height = 210,
  tone = 'brand',
}: TrendChartProps) {
  const gradientId = useId().replace(/:/g, '');
  const [active, setActive] = useState<number | null>(null);

  const hasGhost = points.some((point) => point.previous !== undefined);
  const peak = Math.max(...points.map((p) => Math.max(p.value, p.previous ?? 0)), 1);
  const top = niceMax(peak);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((fraction) => Math.round(top * fraction));

  const step = 100 / Math.max(points.length - 1, 1);
  const y = (value: number) => 100 - (value / top) * 100;
  const x = (index: number) => index * step;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`).join(' ');
  const area = `${line} L100 100 L0 100 Z`;
  const ghost = hasGhost
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(p.previous ?? 0).toFixed(2)}`).join(' ')
    : '';

  const stroke = tone === 'green' ? '#16A34A' : '#6D28FF';

  /* Snap to the nearest point rather than making people hit a 9px dot. */
  function track(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    setActive(clamp(Math.round(ratio * (points.length - 1)), 0, points.length - 1));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    setActive((current) => {
      const from = current ?? 0;
      if (event.key === 'Home') return 0;
      if (event.key === 'End') return points.length - 1;
      return clamp(from + (event.key === 'ArrowRight' ? 1 : -1), 0, points.length - 1);
    });
  }

  const point = active === null ? null : points[active];
  const delta =
    point && point.previous !== undefined && point.previous > 0
      ? Math.round(((point.value - point.previous) / point.previous) * 100)
      : null;

  return (
    <figure className="chart">
      <figcaption className="chart__key">
        <span>
          <i className={`chart__swatch is-${tone}`} />
          {seriesLabel}
        </span>
        {hasGhost ? (
          <span>
            <i className="chart__swatch is-ghost" />
            {previousLabel}
          </span>
        ) : null}
        <span className="chart__hint">Hover or use ← →</span>
      </figcaption>

      <div className="chart__grid" style={{ height }}>
        <div className="chart__yaxis" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick}>{(formatAxis ?? format)(tick)}</span>
          ))}
        </div>

        <div
          className="chart__plot"
          tabIndex={0}
          role="img"
          aria-label={`${seriesLabel} over ${points.length} points. ${points
            .map((p) => `${p.label}: ${format(p.value)}`)
            .join(', ')}`}
          onPointerMove={track}
          onPointerDown={track}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onFocus={() => setActive((current) => current ?? points.length - 1)}
          onKeyDown={onKeyDown}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart__svg" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={stroke} stopOpacity="0.26" />
                <stop offset="1" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((_, index) => (
              <line
                key={index}
                x1="0"
                y1={index * 25}
                x2="100"
                y2={index * 25}
                stroke="var(--color-line-soft)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={area} fill={`url(#${gradientId})`} />
            {ghost ? (
              <path
                d={ghost}
                fill="none"
                stroke="var(--color-grey-faint)"
                strokeWidth="1.6"
                strokeDasharray="4 4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <path
              d={line}
              fill="none"
              stroke={stroke}
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {active !== null ? (
            <span className="chart__guide" style={{ left: `${x(active)}%` }} aria-hidden="true" />
          ) : null}

          {points.map((p, index) => (
            <span
              key={p.label}
              className={`chart__dot ${active === index ? 'is-active' : ''}`.trim()}
              style={{ left: `${x(index)}%`, top: `${y(p.value)}%`, borderColor: stroke }}
              aria-hidden="true"
            />
          ))}

          {point ? (
            <div
              /* Near the top of the plot there is no room above the point, and
                 the tooltip would cover the legend — so it drops underneath. */
              className={`chart__tip ${y(point.value) < 34 ? 'is-below' : ''}`.trim()}
              style={{ left: `${clamp(x(active ?? 0), 8, 92)}%`, top: `${y(point.value)}%` }}
              role="status"
            >
              <span className="chart__tip-label">{point.label}</span>
              <span className="chart__tip-value">
                {format(point.value)}
                <em>{seriesLabel.toLowerCase()}</em>
              </span>
              {point.previous !== undefined ? (
                <span className={`chart__tip-delta ${delta !== null && delta < 0 ? 'is-down' : 'is-up'}`}>
                  {delta === null ? '—' : `${delta > 0 ? '↑' : delta < 0 ? '↓' : ''} ${Math.abs(delta)}%`} vs{' '}
                  {format(point.previous)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="chart__xaxis" aria-hidden="true">
          {points.map((p, index) => (
            <span key={p.label} className={active === index ? 'is-active' : undefined}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

/* ---------- Bars ---------- */

export interface BarDatum {
  label: string;
  value: number;
  /** Shown on the right of the row; defaults to the value. */
  display?: string;
  sub?: string;
  tone?: string;
}

/** A ranked list of bars — the shape "top sessions" and "channels" both want. */
export function BarList({
  bars,
  max,
  ranked = false,
  tone = '#6D28FF',
}: {
  bars: BarDatum[];
  /** Defaults to the largest bar, so the biggest one fills the track. */
  max?: number;
  ranked?: boolean;
  tone?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const ceiling = max ?? Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <ul className="barlist">
      {bars.map((bar, index) => (
        <li
          key={bar.label}
          className={active === bar.label ? 'is-active' : undefined}
          onPointerEnter={() => setActive(bar.label)}
          onPointerLeave={() => setActive(null)}
        >
          <div className="barlist__head">
            <span className="barlist__label">
              {ranked ? <em className="barlist__rank">{index + 1}</em> : null}
              {bar.label}
            </span>
            <strong>{bar.display ?? bar.value.toLocaleString('id-ID')}</strong>
          </div>
          <div className="barlist__track">
            <div
              className="barlist__fill"
              style={{ width: `${Math.round((bar.value / ceiling) * 100)}%`, background: bar.tone ?? tone }}
            />
          </div>
          {bar.sub ? <span className="barlist__sub">{bar.sub}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Donut ---------- */

export interface Slice {
  label: string;
  value: number;
  tone: string;
  /** Overrides the legend figure — money wants "Rp44.300.000". */
  display?: string;
}

/**
 * A ring you can interrogate: hovering a slice or its legend row pulls that
 * slice forward, dims the rest, and swaps the centre to show it.
 */
export function Donut({
  slices,
  total,
  caption,
  size = 168,
  showShare = true,
}: {
  slices: Slice[];
  total: string;
  caption: string;
  size?: number;
  /** Off when the values already are percentages — otherwise "42% 42%". */
  showShare?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const sum = useMemo(() => slices.reduce((acc, slice) => acc + slice.value, 0) || 1, [slices]);

  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = slices.map((slice, index) => {
    const length = (slice.value / sum) * circumference;
    const isActive = active === index;
    const arc = (
      <circle
        key={slice.label}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={slice.tone}
        strokeWidth={isActive ? 27 : 22}
        strokeOpacity={active === null || isActive ? 1 : 0.3}
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-width 0.18s ease, stroke-opacity 0.18s ease', cursor: 'pointer' }}
        onPointerEnter={() => setActive(index)}
        onPointerLeave={() => setActive(null)}
      />
    );
    offset += length;
    return arc;
  });

  const shown = active === null ? null : slices[active];

  return (
    <div className="donut">
      <div className="donut__ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={caption}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth="22" />
          {arcs}
        </svg>
        <div className="donut__center">
          <strong>{shown ? (shown.display ?? shown.value.toLocaleString('id-ID')) : total}</strong>
          <span>{shown ? shown.label : caption}</span>
        </div>
      </div>

      <ul className="donut__legend">
        {slices.map((slice, index) => (
          <li key={slice.label}>
            <button
              type="button"
              className={`donut__row ${active === index ? 'is-active' : ''}`.trim()}
              onPointerEnter={() => setActive(index)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            >
              <span className="donut__dot" style={{ background: slice.tone }} />
              <span className="donut__label">{slice.label}</span>
              <span className="donut__value">
                {slice.display ?? slice.value.toLocaleString('id-ID')}
                {showShare ? <em>{Math.round((slice.value / sum) * 100)}%</em> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Meter ---------- */

export function Meter({
  value,
  max,
  tone = 'brand',
}: {
  value: number;
  max: number;
  tone?: 'brand' | 'green' | 'amber';
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="tm-meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`tm-meter__fill is-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
