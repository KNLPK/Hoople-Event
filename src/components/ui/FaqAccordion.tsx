import { useState } from 'react';
import { ChevronDown } from './icons';
import type { FaqItem } from '@/data/types';

interface FaqAccordionProps {
  items: FaqItem[];
  /** Index open on first render; pass `null` to start fully collapsed. */
  initialOpen?: number | null;
}

/** One-at-a-time FAQ accordion, shared by activity and event detail. */
export function FaqAccordion({ items, initialOpen = 0 }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(initialOpen);

  return (
    <div>
      {items.map((faq, index) => (
        <div key={faq.question} className={`faq-item ${open === index ? 'is-open' : ''}`.trim()}>
          <button
            type="button"
            className="faq-item__q"
            onClick={() => setOpen(open === index ? null : index)}
            aria-expanded={open === index}
          >
            {faq.question}
            <ChevronDown size={16} color="#8B8A99" />
          </button>
          {open === index ? <div className="pt-0 px-4 pb-4 text-[13px] leading-[1.75] text-ink-3">{faq.answer}</div> : null}
        </div>
      ))}
    </div>
  );
}
