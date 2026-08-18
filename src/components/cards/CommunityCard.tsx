import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { MapPin, Users } from '@/components/ui/icons';
import type { Community } from '@/data/types';

/** Community tile used on Discover and the Communities page. */
export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link to={`/communities/${community.slug}`} className="card lift community-card">
      <div className="h-[120px] flex-none zoom">
        <ImageSlot id={`community-${community.slug}`} shape="rect" placeholder={community.photoHint} />
      </div>
      <div className="p-4">
        <div className="font-heading text-[15.5px] font-semibold">{community.name}</div>
        <div className="text-[12.5px] text-grey mt-[5px] leading-[1.5]">{community.focus}</div>
        <div className="flex flex-col gap-[7px] mt-3">
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
