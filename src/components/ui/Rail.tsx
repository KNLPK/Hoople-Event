import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from '@/components/ui/icons';

interface RailProps {
  /** Cards visible at once on desktop. */
  perView?: 4 | 5;
  gap?: number;
  /** Vertical offset of the floating arrows, aligned to the card artwork. */
  arrowTop?: number;
  label: string;
  children: React.ReactNode;
}

/**
 * A horizontally scrollable row of cards with the arrow floating on the right
 * edge, as in the mockups. Scrolls by exactly one card per press.
 */
export function Rail({ perView = 4, gap = 22, arrowTop = 150, label, children }: RailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function step(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const distance = card ? card.offsetWidth + gap : track.clientWidth / perView;
    track.scrollBy({ left: distance * direction, behavior: 'smooth' });
  }

  function syncEdges() {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft < 8);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 8);
  }

  return (
    <div className="rail">
      <div
        ref={trackRef}
        className="rail__track"
        style={
          {
            '--per-view': perView,
            '--rail-gap': `${gap}px`,
          } as React.CSSProperties
        }
        onScroll={syncEdges}
      >
        {children}
      </div>

      {atStart ? null : (
        <button
          type="button"
          className="carousel-arrow carousel-arrow--prev"
          style={{ top: arrowTop }}
          onClick={() => step(-1)}
          aria-label={`Scroll ${label} left`}
        >
          <ChevronLeft size={18} color="#12121A" />
        </button>
      )}
      {atEnd ? null : (
        <button
          type="button"
          className="carousel-arrow"
          style={{ top: arrowTop }}
          onClick={() => step(1)}
          aria-label={`Scroll ${label} right`}
        >
          <ChevronRight size={18} color="#12121A" />
        </button>
      )}
    </div>
  );
}
