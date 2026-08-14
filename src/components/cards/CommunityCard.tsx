import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { MapPin, Users } from '@/components/ui/icons';
import type { Community } from '@/data/types';

/** Community tile used on Discover and the Communities page. */
export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link to={`/communities/${community.slug}`} className="card lift community-card">
      <div className="community-card__media zoom">
        <ImageSlot id={`community-${community.slug}`} shape="rect" placeholder={community.photoHint} />
      </div>
      <div className="community-card__body">
        <div className="community-card__name">{community.name}</div>
        <div className="community-card__focus">{community.focus}</div>
        <div className="community-card__facts">
          <span className="meta meta--sm">
            <Users size={13} color="#8B8A99" strokeWidth={2} />
            {community.members}
          </span>
          <span className="meta meta--sm">
            <MapPin size={13} color="#8B8A99" strokeWidth={2} />
            {community.area}
          </span>
        </div>
      </div>
    </Link>
  );
}
