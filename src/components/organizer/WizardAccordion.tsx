import { useEffect, useRef } from 'react';
import { Check, ChevronDown } from '@/components/ui/icons';
import { prefersReducedMotion } from '@/lib/motion';

/** Clears the console's sticky topbar so an opened header is not tucked under it. */
const TOPBAR = 84;

export interface AccordionPanel {
  id: string;
  /** `1.2`, or just `3` for a step that has no parts. */
  number: string;
  label: string;
  body: React.ReactNode;
}

interface WizardAccordionProps {
  panels: AccordionPanel[];
  /** Index of the panel that is open, or -1 for none. */
  open: number;
  /** Indices the visitor has already continued past. */
  done: ReadonlySet<number>;
  onOpen: (index: number) => void;
  onContinue: (index: number) => void;
}

/**
 * A step's parts, stacked as one page.
 *
 * They used to be a second row of tabs under the stepper, which meant two
 * navigations for one wizard: you had to read `2.3` in a tab bar to work out
 * where you were inside a step you had already chosen. Now the whole step is
 * one scroll, and only the part being filled in is expanded — finishing one
 * closes it and opens the next, so the page never grows past what is being
 * worked on.
 *
 * The last panel has no Continue: the footer's Next is the step-level control
 * and sits directly beneath it.
 */
export function WizardAccordion({ panels, open, done, onOpen, onContinue }: WizardAccordionProps) {
  const only = panels.length === 1;
  const heads = useRef<(HTMLElement | null)[]>([]);
  const mounted = useRef(false);

  /*
   * Bring a newly opened part to the top. Continuing from 1.2 collapses a tall
   * panel above the one that just opened, so without this the page jumps
   * backwards and the new header lands somewhere off screen.
   */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const head = heads.current[open];
    if (!head) return;
    window.scrollTo({
      top: Math.max(0, head.getBoundingClientRect().top + window.scrollY - TOPBAR),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [open]);

  return (
    <div className="wiz-acc-list">
      {panels.map((panel, index) => {
        const isOpen = only || index === open;
        const isDone = done.has(index);
        const next = panels[index + 1];

        return (
          <section
            key={panel.id}
            className={`wiz-acc ${isOpen ? 'is-open' : ''} ${isDone ? 'is-done' : ''}`.trim()}
          >
            <h2
              className="wiz-acc__head"
              ref={(node) => {
                heads.current[index] = node;
              }}
            >
              <button
                type="button"
                className="wiz-acc__toggle"
                onClick={() => onOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={`panel-${panel.id}`}
                /* One panel means the header is a title, not a control. */
                disabled={only}
              >
                <span className="wiz-acc__num">
                  {isDone ? <Check size={13} color="#fff" strokeWidth={3} /> : panel.number}
                </span>
                <span className="wiz-acc__label">{panel.label}</span>
                {only ? null : (
                  <span className="wiz-acc__chev">
                    <ChevronDown size={18} color="#8B8A99" strokeWidth={2.1} />
                  </span>
                )}
              </button>
            </h2>

            {isOpen ? (
              <div className="wiz-acc__body" id={`panel-${panel.id}`}>
                {panel.body}
                {next ? (
                  <div className="wiz-acc__foot">
                    <button type="button" className="wiz-acc__next" onClick={() => onContinue(index)}>
                      Continue to {next.number} {next.label}
                      <ChevronDown size={16} color="currentColor" strokeWidth={2.2} />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
