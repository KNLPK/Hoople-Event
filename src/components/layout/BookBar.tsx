import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/icons';
import { rupiah } from '@/lib/format';

/**
 * The phone-only action bar on a detail page. On desktop the price and the
 * book button sit in the sticky aside; on a phone that aside is at the bottom
 * of a long page, so the action follows the reader instead.
 */
export function BookBar({
  price,
  unit,
  note,
  to,
  cta,
}: {
  price: number;
  /** `session` or `ticket` — what the price buys. */
  unit: string;
  note?: string;
  to: string;
  cta: string;
}) {
  return (
    <div className="bookbar">
      <div className="bookbar__price">
        <strong>{rupiah(price)}</strong>
        <span>{note ?? `per ${unit}`}</span>
      </div>
      <Button as="link" to={to} variant="primary">
        {cta}
        <ArrowRight size={16} strokeWidth={2} />
      </Button>
    </div>
  );
}
