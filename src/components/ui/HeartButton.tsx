import { Heart } from './icons';
import { savedKey, useSaved, type SavedKind } from '@/store/saved';

interface HeartButtonProps {
  /** What is being saved — drives the entry that shows up in My List. */
  kind: SavedKind;
  slug: string;
  /** Human-readable name, used for the screen-reader label. */
  label: string;
  size?: number;
  /** `floating` sits on a photo; `inline` sits in a list row. */
  tone?: 'floating' | 'inline';
  className?: string;
  style?: React.CSSProperties;
}

/** Save-for-later heart. Springs on hover, turns red once saved. */
export function HeartButton({
  kind,
  slug,
  label,
  size = 16,
  tone = 'floating',
  className = '',
  style,
}: HeartButtonProps) {
  const { isSaved, toggle } = useSaved();
  const key = savedKey(kind, slug);
  const saved = isSaved(key);

  const floating: React.CSSProperties = {
    width: size + 15,
    height: size + 15,
    borderRadius: '50%',
    background: 'rgba(255,255,255,.94)',
    boxShadow: '0 1px 4px rgba(0,0,0,.12)',
  };

  return (
    <button
      type="button"
      className={`heart ${saved ? 'is-on' : ''} ${className}`.trim()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(key);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from My List` : `Save ${label} to My List`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        padding: 0,
        background: 'transparent',
        ...(tone === 'floating' ? floating : null),
        ...style,
      }}
    >
      <Heart
        size={size}
        filled={saved}
        color={saved ? '#E11D48' : tone === 'floating' ? '#12121A' : '#B4B2C0'}
      />
    </button>
  );
}
