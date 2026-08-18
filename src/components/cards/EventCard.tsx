import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { HeartButton } from '@/components/ui/HeartButton';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, Users } from '@/components/ui/icons';
import { rupiah, shortDate } from '@/lib/format';
import type { EventItem } from '@/data/types';

/** Grid card for one-time experiences. */
export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="card lift activity-card">
      <div className="relative h-[150px] flex-none zoom">
        <ImageSlot id={`event-${event.slug}`} shape="rect" placeholder={event.photoHint} />
        <span className="badge activity-card__badge">{event.badge ?? 'EVENT'}</span>
        <HeartButton kind="event" slug={event.slug} label={event.title} className="activity-card__heart" />
      </div>

      <div className="activity-card__body">
        <Link to={`/events/${event.slug}`} className="activity-card__title">
          {event.title}
        </Link>
        <div className="text-[12.5px] text-grey-soft mt-1">by {event.host}</div>

        <div className="flex flex-col" style={{ gap: 7, marginTop: 14 }}>
          <span className="meta meta--sm">
            <Calendar size={14} color="#8B8A99" strokeWidth={2} />
            {shortDate(event.date)} • {event.start.replace(':', '.')}
          </span>
          <span className="meta meta--sm">
            <MapPin size={14} color="#8B8A99" strokeWidth={2} />
            {event.area}
          </span>
          <span className="meta meta--sm meta--green">
            <Users size={14} color="#16A34A" strokeWidth={2} />
            {event.going}
          </span>
        </div>

        <div className="activity-card__price">
          {event.price === 0 ? 'Free' : rupiah(event.price)}
        </div>

        <Button as="link" to={`/events/${event.slug}`} variant="outline" size="sm" block>
          {event.price === 0 ? 'Register' : 'Get tickets'}
        </Button>
      </div>
    </article>
  );
}
