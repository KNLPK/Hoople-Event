import { CounterArea, FieldHead, TokenList } from './WizardFields';
import {
  BRING_LIMIT,
  INCLUDED_SUGGESTIONS,
  LEARN_LIMIT,
  REQUIREMENTS_LIMIT,
  type ActivityDraft,
} from '@/data/builder';

/** 1.3 — what a participant walks away with, and what they need to bring. */
export function StepParticipant({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  return (
    <>
      <h2 className="wiz-section__title">1.3 Participant Information</h2>
      <p className="wiz-section__lede">
        Share what participants will get and need to know before joining.
      </p>

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <FieldHead
            label="What Participants Will Learn"
            hint="Highlight the key takeaways or skills participants will gain."
            saved={draft.learn.trim() !== ''}
          />
          <CounterArea
            ariaLabel="What participants will learn"
            value={draft.learn}
            onChange={set('learn')}
            limit={LEARN_LIMIT}
            placeholder="• Basic techniques"
            rows={5}
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="What's Included"
            hint="List everything that is included in the activity fee."
            saved={draft.included.length > 0}
          />
          <TokenList
            values={draft.included}
            onChange={set('included')}
            suggestions={INCLUDED_SUGGESTIONS}
            addLabel="Add item"
            inputPlaceholder="Type an inclusion and press Enter"
            ticked
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="What to Bring"
            hint="Let participants know what they should bring."
            saved={draft.bring.trim() !== ''}
          />
          <CounterArea
            ariaLabel="What to bring"
            value={draft.bring}
            onChange={set('bring')}
            limit={BRING_LIMIT}
            placeholder="• Comfortable clothes"
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Requirements (Optional)"
            hint="Any prerequisites or conditions participants should meet."
            saved={draft.requirements.trim() !== ''}
          />
          <CounterArea
            ariaLabel="Requirements"
            value={draft.requirements}
            onChange={set('requirements')}
            limit={REQUIREMENTS_LIMIT}
            placeholder="No prior experience needed."
            rows={3}
          />
        </div>
      </div>
    </>
  );
}
