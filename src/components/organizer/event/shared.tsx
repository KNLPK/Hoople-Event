import { ImageSlot } from '@/components/ui/ImageSlot';
import { Bulb } from '@/components/ui/icons';
import type { EventDraft } from '@/data/eventBuilder';

export type EventSetter = <K extends keyof EventDraft>(key: K) => (value: EventDraft[K]) => void;

export interface EventSectionProps {
  draft: EventDraft;
  set: EventSetter;
  /** Jumps to another sub-section — "Change" links back to the type picker. */
  goTo: (step: number, substep: number) => void;
}

/**
 * Every event section opens the same way: a numbered title with a progress
 * badge on the left and a tip beside the mascot on the right.
 */
export function EventHead({
  title,
  badge,
  lede,
  tip,
}: {
  title: string;
  badge: string;
  lede: string;
  tip: string;
}) {
  return (
    <div className="evt-head">
      <div>
        <h2 className="wiz-section__title">
          {title}
          <span className="evt-head__badge">{badge}</span>
        </h2>
        <p className="wiz-section__lede">{lede}</p>
      </div>

      <aside className="evt-tip">
        <div>
          <span className="evt-tip__label">
            <Bulb size={14} color="#EA8C00" strokeWidth={2} />
            Tips
          </span>
          <p>{tip}</p>
        </div>
        <span className="evt-tip__art float">
          <ImageSlot id="event-tip-mascot" radius={10} interactive={false} placeholder="" />
        </span>
      </aside>
    </div>
  );
}
