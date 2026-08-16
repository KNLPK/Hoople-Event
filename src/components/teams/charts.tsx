/**
 * The two chart shapes this console needs that the organizer console did not:
 * a ring for "what is this total made of", and a trend line with one labelled
 * peak. Both are plain SVG — no chart library for two shapes.
 */

export interface Slice {
  label: string;
  value: number;
  tone: string;
  /** Overrides the legend figure — money wants "Rp44.300.000", not "44300000". */
  display?: string;
}

/** A ring with the total in the middle, plus a legend beside it. */
export function Donut({
  slices,
  total,
  caption,
  size = 168,
}: {
  slices: Slice[];
  total: string;
  caption: string;
  size?: number;
}) {
  const sum = slices.reduce((acc, slice) => acc + slice.value, 0) || 1;
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = slices.map((slice) => {
    const length = (slice.value / sum) * circumference;
    const arc = (
      <circle
        key={slice.label}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={slice.tone}
        strokeWidth="22"
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-offset}
        /* Start at twelve o'clock rather than three. */
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    );
    offset += length;
    return arc;
  });

  return (
    <div className="tm-donut">
      <div className="tm-donut__ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={caption}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth="22" />
          {arcs}
        </svg>
        <div className="tm-donut__center">
          <strong>{total}</strong>
          <span>{caption}</span>
        </div>
      </div>

      <ul className="tm-legend">
        {slices.map((slice) => (
          <li key={slice.label}>
            <span className="tm-legend__dot" style={{ background: slice.tone }} />
            <span className="tm-legend__label">{slice.label}</span>
            <span className="tm-legend__value">
              {slice.display ?? slice.value.toLocaleString('id-ID')}
              <em>{Math.round((slice.value / sum) * 100)}%</em>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface TrendPoint {
  label: string;
  value: number;
  previous?: number;
}

/**
 * A trend line over a handful of points, with the peak called out. Drawn in a
 * 0–100 viewBox and stretched by CSS, so it fits whatever column it lands in.
 */
export function TrendLine({ points, height = 190 }: { points: TrendPoint[]; height?: number }) {
  const peak = Math.max(...points.map((p) => Math.max(p.value, p.previous ?? 0)), 1);
  const step = 100 / Math.max(points.length - 1, 1);
  const y = (value: number) => 100 - (value / peak) * 88;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(2)} ${y(p.value).toFixed(2)}`).join(' ');
  const area = `${path} L100 100 L0 100 Z`;
  const ghost = points
    .filter((p) => p.previous !== undefined)
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(2)} ${y(p.previous ?? 0).toFixed(2)}`)
    .join(' ');

  const peakIndex = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);

  return (
    <div className="tm-trend" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="tm-trend__svg" aria-hidden="true">
        <defs>
          <linearGradient id="tmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6D28FF" stopOpacity="0.22" />
            <stop offset="1" stopColor="#6D28FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((line) => (
          <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="var(--line-soft)" strokeWidth="0.4" />
        ))}
        <path d={area} fill="url(#tmFill)" />
        {ghost ? (
          <path
            d={ghost}
            fill="none"
            stroke="var(--grey-faint)"
            strokeWidth="0.7"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="#6D28FF"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Dots and the peak label sit outside the stretched SVG so they stay round. */}
      {points.map((point, i) => (
        <span
          key={point.label}
          className={`tm-trend__dot ${i === peakIndex ? 'is-peak' : ''}`.trim()}
          style={{ left: `${i * step}%`, top: `${y(point.value)}%` }}
        >
          {i === peakIndex ? <em className="tm-trend__flag">{point.value}</em> : null}
        </span>
      ))}

      <div className="tm-trend__axis">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

/** A labelled progress bar — used for session fill and funnel steps. */
export function Meter({ value, max, tone = 'brand' }: { value: number; max: number; tone?: 'brand' | 'green' | 'amber' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="tm-meter">
      <div className={`tm-meter__fill is-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
