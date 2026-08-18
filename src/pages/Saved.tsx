import { ActivityCard } from '@/components/cards/ActivityCard';
import { EventCard } from '@/components/cards/EventCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { ACTIVITY_BY_SLUG } from '@/data/activities';
import { EVENT_BY_SLUG } from '@/data/events';
import { parseSavedKey, useSaved } from '@/store/saved';
import type { Activity, EventItem } from '@/data/types';

/** "My List" — everything the visitor has hearted, activities and events. */
export function Saved() {
  const { saved, count } = useSaved();

  const activities: Activity[] = [];
  const events: EventItem[] = [];

  for (const key of saved) {
    const { kind, slug } = parseSavedKey(key);
    if (kind === 'activity') {
      const activity = ACTIVITY_BY_SLUG.get(slug);
      if (activity) activities.push(activity);
    } else {
      const event = EVENT_BY_SLUG.get(slug);
      if (event) events.push(event);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-page max-[900px]:px-gutter page-header">
        <h1>My List</h1>
        <p>
          {count === 0
            ? 'Nothing saved yet. Tap the heart on any experience and it lands here.'
            : `${count} saved ${count === 1 ? 'experience' : 'experiences'}, ready when you are.`}
        </p>
      </div>

      {count === 0 ? (
        <div className="mx-auto w-full max-w-page px-gutter section">
          <div className="empty">
            <div className="empty__title">Your list is empty</div>
            <p className="empty__body">
              Browse activities and events, hit the heart on the ones you like, and come back here to book.
            </p>
            <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
              <Button as="link" to="/activities" variant="primary">
                Explore activities
              </Button>
              <Button as="link" to="/events" variant="outline">
                Browse events
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {activities.length ? (
        <Reveal className="mx-auto w-full max-w-page px-gutter section">
          <SectionHead
            title="Saved activities"
            subtitle={`${activities.length} recurring ${activities.length === 1 ? 'activity' : 'activities'}`}
            moreTo="/activities"
            moreLabel="Find more →"
          />
          <div className="grid grid--4">
            {activities.map((activity) => (
              <ActivityCard key={activity.slug} activity={activity} />
            ))}
          </div>
        </Reveal>
      ) : null}

      {events.length ? (
        <Reveal className="mx-auto w-full max-w-page px-gutter section" delay={60}>
          <SectionHead
            title="Saved events"
            subtitle={`${events.length} one-time ${events.length === 1 ? 'event' : 'events'}`}
            moreTo="/events"
            moreLabel="Find more →"
          />
          <div className="grid grid--4">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
