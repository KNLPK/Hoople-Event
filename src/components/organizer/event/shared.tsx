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
 * Every event section opens the same way: what this part is for on the left,
 * and a tip beside the mascot on the right.
 *
 * It carries no title. The accordion header above it already states the
 * number and the name, and printing them twice made every panel look like it
 * had started over.
 */
export function EventHead({ lede, tip }: { lede: string; tip: string }) {
  return (
    <div className="evt-head">
      <div>
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
