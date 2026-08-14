import { Fragment } from 'react';
import { Check, Lock } from '@/components/ui/icons';
import type { WizardStep } from '@/data/builder';

interface WizardStepperProps {
  steps: WizardStep[];
  /** Step currently being edited, by its 1-based id. */
  step: number;
  /** Index of the open sub-section within that step. */
  substep: number;
  onStep: (id: number) => void;
  onSubstep: (index: number) => void;
  /** Sits at the far right of the bar — "Save as Draft". */
  action?: React.ReactNode;
}

/**
 * The five-step rail, with the open step's parts on a row of their own.
 *
 * That row is a sibling of the rail rather than a child of the active step:
 * it belongs to the whole bar, it never widens a step, and it can be centred
 * on a wide screen or stacked as tabs on a narrow one without moving markup.
 */
export function WizardStepper({
  steps,
  step,
  substep,
  onStep,
  onSubstep,
  action,
}: WizardStepperProps) {
  const open = steps.find((item) => item.id === step);
  const substeps = open?.substeps ?? [];

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

      {substeps.length > 0 ? (
        <div className="wiz-subs" role="tablist" aria-label={`${open?.label} sections`}>
          {substeps.map((sub, index) => (
            <button
              key={sub.id}
              type="button"
              role="tab"
              className={`wiz-sub ${index === substep ? 'is-on' : ''}`.trim()}
              onClick={() => onSubstep(index)}
              aria-selected={index === substep}
            >
              <span className="wiz-sub__num">
                {step}.{index + 1}
              </span>
              {sub.label}
            </button>
          ))}
        </div>
      ) : null}

      {action}
    </div>
  );
}
