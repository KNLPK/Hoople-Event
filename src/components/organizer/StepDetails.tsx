import { ChoiceTile, FieldHead, SelectInput, TokenList } from './WizardFields';
import { Chart, Globe, Levels, LinkChain, Lock, Sprout } from '@/components/ui/icons';
import {
  DIFFICULTY_LEVELS,
  LANGUAGE_OPTIONS,
  TAG_SUGGESTIONS,
  VISIBILITY_OPTIONS,
  type ActivityDraft,
  type Difficulty,
  type Visibility,
} from '@/data/builder';

const DIFFICULTY_ICON: Record<Difficulty, React.ReactNode> = {
  Beginner: <Sprout size={18} color="#16A34A" strokeWidth={1.9} />,
  Intermediate: <Chart size={18} color="#EA8C00" strokeWidth={1.9} />,
  Advanced: <Levels size={18} color="#E11D48" strokeWidth={2.2} />,
};

const VISIBILITY_ICON: Record<Visibility, React.ReactNode> = {
  Public: <Globe size={18} color="#5C5B6B" strokeWidth={1.8} />,
  Unlisted: <LinkChain size={18} color="#5C5B6B" strokeWidth={1.8} />,
  Private: <Lock size={18} color="#5C5B6B" strokeWidth={1.8} />,
};

/** 1.2 — the facts that help a participant judge whether it suits them. */
export function StepDetails({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  return (
    <>
      <p className="wiz-section__lede">
        Add key details to help participants understand your activity better.
      </p>

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <FieldHead label="Tags" hint="Add relevant tags so people can discover your activity easily." />
          <TokenList
            values={draft.tags}
            onChange={set('tags')}
            suggestions={TAG_SUGGESTIONS}
            addLabel="Add tag"
            inputPlaceholder="Type a tag and press Enter"
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Difficulty Level"
            hint="This helps participants know if this activity is suitable for them."
          />
          <div className="wiz-tiles wiz-tiles--3">
            {DIFFICULTY_LEVELS.map((level) => (
              <ChoiceTile
                key={level.value}
                name="difficulty"
                checked={draft.difficulty === level.value}
                onSelect={() => set('difficulty')(level.value)}
                title={level.value}
                sub={level.sub}
                icon={DIFFICULTY_ICON[level.value]}
              />
            ))}
          </div>
        </div>

        <div className="wiz-field">
          <FieldHead label="Language" hint="What language will be used during the activity?" />
          <div className="wiz-field__control max-w-[290px]">
            <SelectInput
              ariaLabel="Language"
              value={draft.language}
              options={LANGUAGE_OPTIONS}
              onChange={set('language')}
              leading={<Globe size={16} color="#8B8A99" strokeWidth={1.9} />}
            />
          </div>
        </div>

        <div className="wiz-field">
          <FieldHead label="Visibility" hint="Control who can see and book this activity." />
          <div className="wiz-tiles wiz-tiles--3">
            {VISIBILITY_OPTIONS.map((option) => (
              <ChoiceTile
                key={option.value}
                name="visibility"
                checked={draft.visibility === option.value}
                onSelect={() => set('visibility')(option.value)}
                title={option.value}
                sub={option.sub}
                icon={VISIBILITY_ICON[option.value]}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
