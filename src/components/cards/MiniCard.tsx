import { Link } from 'react-router-dom';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { idr, shortDate } from '@/lib/format';

interface MiniCardProps {
  to: string;
  slotId: string;
  photoHint: string;
  /** Uppercase eyebrow: WORKSHOP / EVENT / ACTIVITY. */
  kicker: string;
  title: string;
  date: string;
  area?: string;
  price: number;
}

/** Wide, thumbnail-left card used by "You Might Also Like" and the explore banner. */
export function MiniCard({ to, slotId, photoHint, kicker, title, date, area, price }: MiniCardProps) {
  return (
    <Link to={to} className="mini-card lift">
      <div className="min-h-[100%] zoom">
        <ImageSlot id={slotId} shape="rect" placeholder={photoHint} />
      </div>
      <div className="py-3.5 px-4">
        <div className="text-[11.5px] font-semibold text-brand mb-1.5 capitalize">{kicker}</div>
        <div className="font-heading text-[14.5px] font-semibold leading-[1.35]">{title}</div>
        <div className="text-[12px] text-grey mt-1.5">{shortDate(date)}</div>
        {area ? <div className="text-[12px] text-grey mt-1.5">{area}</div> : null}
        <div className="text-[14px] font-bold mt-2.5">{price === 0 ? 'Free' : idr(price)}</div>
      </div>
    </Link>
  );
}
