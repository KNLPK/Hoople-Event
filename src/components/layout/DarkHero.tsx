import { ImageSlot } from '@/components/ui/ImageSlot';

interface DarkHeroProps {
  /** Persistence key for the hero photo slot. */
  slotId: string;
  photoHint: string;
  children: React.ReactNode;
  /** Extra content pinned to the bottom edge, e.g. the overlapping search bar. */
  overlap?: React.ReactNode;
}

/**
 * Full-bleed dark photo hero. It sits below the solid white navigation, so the
 * photo reads as its own band rather than as the page background.
 */
export function DarkHero({ slotId, photoHint, children, overlap }: DarkHeroProps) {
  return (
    <div className="dark-hero">
      <div className="dark-hero__photo">
        <ImageSlot id={slotId} shape="rect" placeholder={photoHint} />
      </div>
      <div className="dark-hero__scrim" aria-hidden="true" />
      <div className="mx-auto w-full max-w-page px-gutter relative z-20">{children}</div>
      {overlap ? <div className="dark-hero__overlap mx-auto w-full max-w-page px-gutter">{overlap}</div> : null}
    </div>
  );
}
