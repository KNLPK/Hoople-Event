import { useState } from 'react';
import { ChevronDown } from './icons';
import type { ScheduleItem } from '@/data/types';

interface ScheduleProps {
  items: ScheduleItem[];
  /** Rows shown before the "View full schedule" toggle. */
  preview?: number;
}

/** An event's run of show — a dotted timeline that expands to the full list. */
export function Schedule({ items, preview = 6 }: ScheduleProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > preview;
  const shown = expanded || !hasMore ? items : items.slice(0, preview);

  return (
    <div className="schedule">
      <ol className="schedule__list">
        {shown.map((item) => (
          <li key={`${item.time}-${item.label}`} className="schedule__row">
            <span className="w-2 h-2 rounded-[50%] bg-brand" aria-hidden="true" />
            <span className="schedule__time">{item.time}</span>
            <span className="text-[13.5px] text-ink-2 leading-[1.5]">{item.label}</span>
          </li>
        ))}
      </ol>

      {hasMore ? (
        <button type="button" className="schedule__toggle" onClick={() => setExpanded((open) => !open)}>
          {expanded ? 'Show less' : 'View full schedule'}
          <ChevronDown size={15} strokeWidth={2.2} className={expanded ? 'is-flipped' : undefined} />
        </button>
      ) : null}
    </div>
  );
}
