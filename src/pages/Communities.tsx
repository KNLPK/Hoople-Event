import { Navigate, useParams } from 'react-router-dom';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { CommunityCard } from '@/components/cards/CommunityCard';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Newsletter } from '@/components/ui/Newsletter';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import { MapPin, Star, Users } from '@/components/ui/icons';
import { ACTIVITIES } from '@/data/activities';
import { COMMUNITIES } from '@/data/events';

export function Communities() {
  return (
    <>
      <div className="mx-auto w-full max-w-page to-900:px-gutter page-header">
        <h1>Communities on Hoople</h1>
        <p>
          Studios, clubs and kitchens running experiences week after week. Follow a host and their next
          session lands in your feed.
        </p>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="grid grid--4">
          {COMMUNITIES.map((community) => (
            <CommunityCard key={community.slug} community={community} />
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="cta-banner">
          <div>
            <h2>Run a community of your own?</h2>
            <p>
              List your first experience free. Ticketing and QR check-in are included from day one, and your
              payout lands H+1.
            </p>
          </div>
          <div className="flex gap-3.5 flex-wrap">
            <Button as="link" to="/organizers" variant="white" size="xl">
              Create Experience
            </Button>
            <Button as="link" to="/pricing" variant="onDark" size="xl">
              See pricing
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <Newsletter slotId="communities-mail" title="Follow the communities you love" />
      </Reveal>
    </>
  );
}

/** A single community: who they are and everything they currently run. */
export function CommunityDetail() {
  const { slug } = useParams();
  const toast = useToast();
  const community = COMMUNITIES.find((item) => item.slug === slug);

  if (!community) return <Navigate to="/communities" replace />;

  const hosted = ACTIVITIES.filter(
    (activity) => activity.host === community.name || activity.host.startsWith(community.name),
  );

  return (
    <>
      <div className="mx-auto w-full max-w-page px-gutter pt-[30px]">
        <div className="explore-banner explore-banner--art">
          <div style={{ height: 180, borderRadius: 16, overflow: 'hidden' }}>
            <ImageSlot
              id={`community-hero-${community.slug}`}
              shape="rounded"
              radius={16}
              placeholder={community.photoHint}
            />
          </div>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 10 }}>
              {community.name}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-ink-3)', marginBottom: 16 }}>{community.focus}</p>
            <div className="flex items-center" style={{ gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
              <span className="meta">
                <Users size={16} color="#8B8A99" strokeWidth={1.9} />
                {community.members}
              </span>
              <span className="meta">
                <MapPin size={16} color="#8B8A99" strokeWidth={1.9} />
                {community.area}
              </span>
              <span className="meta">
                <Star size={16} />
                4.9 average across {hosted.length || 1} experiences
              </span>
            </div>
            <div className="flex items-center" style={{ gap: 14, flexWrap: 'wrap' }}>
              <Button as="button" variant="primary" onClick={() => toast(`Following ${community.name}`)}>
                Follow community
              </Button>
              <Button as="link" to="/discover" variant="outline">
                Browse everything they run
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title={`Experiences by ${community.name}`}
          subtitle={
            hosted.length
              ? `${hosted.length} ${hosted.length === 1 ? 'activity' : 'activities'} open for booking`
              : 'Nothing open right now'
          }
          moreTo="/activities"
        />
        {hosted.length ? (
          <div className="grid grid--4">
            {hosted.map((activity) => (
              <ActivityCard key={activity.slug} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="font-heading text-[17px] font-semibold mb-1.5">No open sessions right now</div>
            <p className="text-[13.5px] text-grey mb-[18px]">
              Follow {community.name} and we'll message you the moment their next session opens.
            </p>
            <Button as="button" variant="primary" onClick={() => toast(`Following ${community.name}`)}>
              Follow community
            </Button>
          </div>
        )}
      </Reveal>
    </>
  );
}
