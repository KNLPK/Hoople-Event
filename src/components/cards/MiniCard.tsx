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
      <div className="mini-card__media zoom">
        <ImageSlot id={slotId} shape="rect" placeholder={photoHint} />
      </div>
      <div className="mini-card__body">
        <div className="mini-card__kicker">{kicker}</div>
        <div className="mini-card__title">{title}</div>
        <div className="mini-card__meta">{shortDate(date)}</div>
        {area ? <div className="mini-card__meta">{area}</div> : null}
        <div className="mini-card__price">{price === 0 ? 'Free' : idr(price)}</div>
      </div>
    </Link>
  );
}
