import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { HeartButton } from '@/components/ui/HeartButton';
import { Button } from '@/components/ui/Button';
import { Bolt, Calendar, Clock } from '@/components/ui/icons';
import { rupiah, shortDate } from '@/lib/format';
import { nextSession } from '@/data/schedule';
import type { Activity } from '@/data/types';

/** Grid card used by Popular Activities, Discover and the recommendation rails. */
export function ActivityCard({ activity }: { activity: Activity }) {
  const upcoming = nextSession(activity);
  const slotsLeft = upcoming?.slotsLeft ?? 0;
  const urgent = slotsLeft > 0 && slotsLeft <= 4;

  return (
    <article className="card lift activity-card">
      <div className="relative h-[150px] flex-none zoom">
        <ImageSlot id={`activity-${activity.slug}`} shape="rect" placeholder={activity.photoHint} />
        {activity.badge ? (
          <span
            className={`badge activity-card__badge ${activity.badge === 'TRENDING' ? 'badge--green' : ''}`}
          >
            {activity.badge}
          </span>
        ) : null}
        <HeartButton
          kind="activity"
          slug={activity.slug}
          label={activity.title}
          className="activity-card__heart"
        />
      </div>

      <div className="activity-card__body">
        <Link to={`/activities/${activity.slug}`} className="activity-card__title">
          {activity.title}
        </Link>
        <div className="text-[12.5px] text-grey-soft mt-1">by {activity.host}</div>

        <div className="flex flex-col" style={{ gap: 7, marginTop: 14 }}>
          <span className="meta meta--sm">
            <Calendar size={14} color="#8B8A99" strokeWidth={2} />
            Next session
          </span>
          <span className="meta meta--sm">
            <Clock size={14} color="#8B8A99" strokeWidth={2} />
            {upcoming
              ? `${shortDate(upcoming.date)} • ${upcoming.start.replace(':', '.')}`
              : 'New dates coming soon'}
          </span>
          {upcoming ? (
            <span className={`meta meta--sm ${urgent ? 'meta--amber' : 'meta--green'}`}>
              <Bolt size={14} color={urgent ? '#EA8C00' : '#16A34A'} strokeWidth={2} />
              {slotsLeft} slots remaining!
            </span>
          ) : null}
        </div>

        <div className="activity-card__price">
          {activity.priceFrom === 0 ? 'Free' : `From ${rupiah(activity.priceFrom)}`}
        </div>

        <Button as="link" to={`/activities/${activity.slug}`} variant="outline" size="sm" block>
          Book session
        </Button>

        <div className="flex gap-2 mt-3.5 flex-wrap">
          {activity.tags.map((tag) => (
            <span key={tag} className="tag tag--neutral">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
