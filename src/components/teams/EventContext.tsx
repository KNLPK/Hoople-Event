import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Calendar, ChevronLeft, Globe, Lock, MapPin, Monitor } from '@/components/ui/icons';
import type { EventFormat, TeamEvent } from '@/data/teams';

export function statusTone(status: TeamEvent['status']): string {
  switch (status) {
    case 'Ongoing':
      return 'live';
    case 'Published':
      return 'published';
    case 'Draft':
      return 'draft';
    case 'Ended':
      return 'ended';
    default:
      return 'cancelled';
  }
}

export function FormatIcon({ format, size = 15 }: { format: EventFormat; size?: number }) {
  if (format === 'Online') return <Monitor size={size} color="#6B6A7B" strokeWidth={1.9} />;
  if (format === 'Hybrid') return <Globe size={size} color="#6B6A7B" strokeWidth={1.9} />;
  return <MapPin size={size} color="#6B6A7B" strokeWidth={1.9} />;
}

/**
 * The strip that says which event you are inside.
 *
 * Every view below the dashboard belongs to one event, and losing track of
 * which one would make the numbers meaningless — so the event travels with you
 * across the top rather than living in a page title you have to remember.
 */
export function EventContext({ event, children }: { event: TeamEvent; children?: React.ReactNode }) {
  return (
    <div className="tm-ctx">
      <Link to={`/teams?e=${event.id}`} className="org-back tm-ctx__back">
        <ChevronLeft size={16} color="#3C3A4A" />
        Back to Dashboard
      </Link>

      <div className="tm-ctx__row">
        <span className="tm-ctx__thumb">
          <ImageSlot id={`tm-cover-${event.id}`} shape="rounded" radius={10} placeholder={event.photoHint} />
        </span>

        <div className="tm-ctx__body">
          <div className="tm-ctx__title">
            <h2>{event.title}</h2>
            <span className={`org-pill org-pill--${statusTone(event.status)}`}>{event.status}</span>
            {/* The whole point of this console: nothing here is public. */}
            <span className="tm-private">
              <Lock size={12} color="#5B21F5" strokeWidth={2} />
              Members only
            </span>
          </div>
          <div className="tm-ctx__meta">
            <span>
              <Calendar size={15} color="#6B6A7B" strokeWidth={1.9} />
              {event.dateLabel}
            </span>
            <span>
              <MapPin size={15} color="#6B6A7B" strokeWidth={1.9} />
              {event.venue}
            </span>
            <span>
              <FormatIcon format={event.format} />
              {event.format} event
            </span>
          </div>
        </div>

        {children ? <div className="tm-ctx__actions">{children}</div> : null}
      </div>
    </div>
  );
}
