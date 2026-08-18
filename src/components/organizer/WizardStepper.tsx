import { Fragment } from 'react';
import { Check, Lock } from '@/components/ui/icons';
import type { WizardStep } from '@/data/builder';

interface WizardStepperProps {
  steps: WizardStep[];
  /** Step currently being edited, by its 1-based id. */
  step: number;
  onStep: (id: number) => void;
  /** Sits at the far right of the bar — "Save as Draft". */
  action?: React.ReactNode;
}

/**
 * The step rail, and nothing else.
 *
 * The open step's parts used to sit here as a second row of tabs, which gave
 * one wizard two navigations. They are now an accordion inside the page — see
 * WizardAccordion — so this bar answers exactly one question: which step.
 */
export function WizardStepper({ steps, step, onStep, action }: WizardStepperProps) {
  const open = steps.find((item) => item.id === step);

  return (
    <div className="wiz-bar">
      {/*
       * Phone only. Five labelled dots cannot fit a 390px rail without being
       * cut off, and a rail you have to swipe hides your progress — so narrow
       * screens get the same information as a counter and a bar instead.
       */}
      <div className="wiz-progress">
        <span className="wiz-progress__count">
          Step {step} of {steps.length}
        </span>
        <strong className="wiz-progress__label">{open?.label}</strong>
        <span className="wiz-progress__track" aria-hidden="true">
          <span style={{ width: `${(step / steps.length) * 100}%` }} />
        </span>
      </div>

      <ol className="wiz-steps">
        {steps.map((item, index) => {
          const done = item.id < step;
          const active = item.id === step;
          const state = [
            done ? 'is-done' : active ? 'is-active' : '',
            item.ready ? '' : 'is-locked',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Fragment key={item.id}>
              {index === 0 ? <li className="wiz-line" aria-hidden="true" /> : null}

              <li className={`wiz-step ${state}`.trim()}>
                <button
                  type="button"
                  className="wiz-step__head"
                  onClick={() => onStep(item.id)}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="wiz-step__dot">
                    {done ? <Check size={13} color="#6D28FF" strokeWidth={2.6} /> : item.id}
                  </span>
                  <span className="wiz-step__label">{item.label}</span>
                  {!item.ready ? <Lock size={12} color="#B4B2C0" strokeWidth={2} /> : null}
                </button>
              </li>

              <li className="wiz-line" aria-hidden="true" />
            </Fragment>
          );
        })}
      </ol>

      {action}
    </div>
  );
}
