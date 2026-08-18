import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { HeartButton } from '@/components/ui/HeartButton';
import { Button } from '@/components/ui/Button';
import { Clock, Users } from '@/components/ui/icons';
import type { DatedSession } from '@/data/schedule';

/** Compact card for "Today's Sessions" — time badge, duration, level, Join now. */
export function SessionCard({ activity, session }: DatedSession) {
  return (
    <article className="card lift session-card">
      <div className="relative h-[132px] flex-none zoom">
        <ImageSlot
          id={`session-${activity.slug}-${session.id}`}
          shape="rect"
          placeholder={activity.photoHint}
        />
        <span className="badge badge--white absolute top-[11px] left-[11px] pointer-events-none z-2">{session.start.replace(':', '.')}</span>
        <HeartButton
          kind="activity"
          slug={activity.slug}
          label={`${activity.title} at ${session.start}`}
          className="absolute top-[11px] right-[11px] z-2"
        />
      </div>

      <div className="pt-[15px] px-[15px] pb-4 flex flex-col flex-1">
        <Link to={`/activities/${activity.slug}`} className="session-card__title">
          {activity.title}
        </Link>
        <div className="text-[12.5px] text-grey-soft mt-1">
          {activity.venue.name}, {activity.venue.area}
        </div>

        <div className="flex items-center gap-3.5 mt-3 mx-0 mb-3.5 mt-auto pt-3 text-[12px] text-grey">
          <span className="meta meta--sm">
            <Clock size={13} color="#8B8A99" strokeWidth={2} />
            {session.durationMin} min
          </span>
          <span className="meta meta--sm">
            <Users size={13} color="#8B8A99" strokeWidth={2} />
            {session.level}
          </span>
        </div>

        <div className="flex items-center" style={{ gap: 12 }}>
          <Button
            as="link"
            to={`/booking?activity=${activity.slug}&session=${session.id}&date=${session.date}`}
            variant="green"
            size="sm"
          >
            Join now
          </Button>
          <span style={{ fontSize: 12, color: 'var(--color-grey)' }}>{session.slotsLeft} slots left</span>
        </div>
      </div>
    </article>
  );
}
