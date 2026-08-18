import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { HeartButton } from '@/components/ui/HeartButton';
import { Button } from '@/components/ui/Button';
import { Clock, Repeat } from '@/components/ui/icons';
import { rupiah } from '@/lib/format';
import type { Activity } from '@/data/types';

/** List row for "Ongoing & Recurring Activities". */
export function RecurringRow({ activity }: { activity: Activity }) {
  return (
    <div className="recurring-row">
      <div className="recurring-row__media">
        <ImageSlot
          id={`recurring-${activity.slug}`}
          shape="rounded"
          radius={10}
          placeholder={activity.photoHint}
        />
      </div>

      <div>
        <Link to={`/activities/${activity.slug}`} className="recurring-row__title">
          {activity.title}
        </Link>
        <div className="text-[12.5px] text-grey">{activity.host}</div>
        <div className="text-[12.5px] text-grey-soft mt-[3px]">{activity.level}</div>
      </div>

      <div className="flex flex-col" style={{ gap: 6 }}>
        <span className="meta meta--sm">
          <Clock size={14} color="#8B8A99" strokeWidth={2} />
          {activity.recurrence}
        </span>
        <span className="meta meta--sm">
          <Repeat size={14} color="#8B8A99" strokeWidth={2} />
          {activity.recurrenceTime}
        </span>
      </div>

      <div className="recurring-row__price">
        {activity.priceFrom === 0 ? (
          'Free'
        ) : (
          <>
            {rupiah(activity.priceFrom)}
            <span> / session</span>
          </>
        )}
      </div>

      <Button as="link" to={`/activities/${activity.slug}`} variant="green" size="sm">
        Book session
      </Button>

      <HeartButton kind="activity" slug={activity.slug} label={activity.title} tone="inline" size={19} />
    </div>
  );
}
