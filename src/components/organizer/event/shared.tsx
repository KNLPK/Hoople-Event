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
 * Every event section opens the same way: what this part is for, then one line
 * of advice.
 *
 * This used to be a two-column grid with the tip in a 300px card beside a
 * mascot. The ledes are one sentence, so the left column was mostly empty and
 * every panel opened on a block of white. The tip is worth keeping — it is the
 * only place the builder explains *why* a field matters — so it stays as a
 * single slim line rather than a card competing with the form.
 */
export function EventHead({ lede, tip }: { lede: string; tip: string }) {
  return (
    <div className="evt-head">
      <p className="wiz-section__lede">{lede}</p>
      <p className="evt-tip">
        <Bulb size={14} color="#EA8C00" strokeWidth={2} />
        {tip}
      </p>
    </div>
  );
}
