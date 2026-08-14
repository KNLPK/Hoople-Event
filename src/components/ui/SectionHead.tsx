import { Link } from 'react-router-dom';

interface SectionHeadProps {
  title: string;
  subtitle?: string;
  /** Renders the "View all →" link on the right. */
  moreTo?: string;
  moreLabel?: string;
  /** Optional leading icon, used by "Ongoing & Recurring Activities". */
  icon?: React.ReactNode;
  size?: 'md' | 'sm';
}

/** Stacked-section header: title + optional subtitle, with "View all →" on the right. */
export function SectionHead({
  title,
  subtitle,
  moreTo,
  moreLabel = 'View all →',
  icon,
  size = 'md',
}: SectionHeadProps) {
  return (
    <div className={`section-head ${size === 'sm' ? 'section-head--sm' : ''}`.trim()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {icon ? <span style={{ marginTop: 2, flex: 'none' }}>{icon}</span> : null}
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {moreTo ? (
        <Link to={moreTo} className="link-more">
          {moreLabel}
        </Link>
      ) : null}
    </div>
  );
}
