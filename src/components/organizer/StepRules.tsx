import { ChoiceTile, CounterArea, FieldHead, SelectInput, TokenList } from './WizardFields';
import { Camera, Clock, EyeOff, Info, ShieldCheck, Users } from '@/components/ui/icons';
import {
  HOUSE_RULE_SUGGESTIONS,
  LATE_ARRIVAL_OPTIONS,
  NO_SHOW_OPTIONS,
  PHOTOGRAPHY_OPTIONS,
  RULES_NOTES_LIMIT,
  type ActivityDraft,
  type Photography,
} from '@/data/builder';

const PHOTOGRAPHY_ICON: Record<Photography, React.ReactNode> = {
  Allowed: <Camera size={18} color="#16A34A" strokeWidth={1.8} />,
  'Ask first': <Users size={18} color="#EA8C00" strokeWidth={1.8} />,
  'Not allowed': <EyeOff size={18} color="#E11D48" strokeWidth={1.8} />,
};

/**
 * 4.4 — the expectations a participant agrees to. These appear on the activity
 * page and again on the e-ticket, so they are worth setting deliberately.
 */
export function StepRules({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  return (
    <>
      <p className="wiz-section__lede">
        Set what participants agree to when they join. Clear rules save awkward conversations later.
      </p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <FieldHead
            label="Ground Rules"
            hint="Shown on the activity page and repeated on every e-ticket."
            saved={draft.houseRules.length > 0}
          />
          <TokenList
            values={draft.houseRules}
            onChange={set('houseRules')}
            suggestions={HOUSE_RULE_SUGGESTIONS}
            addLabel="Add rule"
            inputPlaceholder="Type a rule and press Enter"
            ticked
          />
        </section>

        <section className="org-card wiz-panel">
          <FieldHead label="Attendance" hint="Decide how you handle late arrivals and no-shows." />
          <div className="wiz-pair">
            <label className="field">
              <span className="wiz-field__label">Late arrival</span>
              <SelectInput
                ariaLabel="Late arrival policy"
                value={draft.lateArrival}
                options={LATE_ARRIVAL_OPTIONS}
                onChange={set('lateArrival')}
                leading={<Clock size={16} color="#8B8A99" strokeWidth={1.9} />}
              />
            </label>
            <label className="field">
              <span className="wiz-field__label">No-show</span>
              <SelectInput
                ariaLabel="No-show policy"
                value={draft.noShow}
                options={NO_SHOW_OPTIONS}
                onChange={set('noShow')}
                leading={<ShieldCheck size={16} color="#8B8A99" strokeWidth={1.9} />}
              />
            </label>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <FieldHead
            label="Photography &amp; Sharing"
            hint="Some people are happy on camera and some are not — say which this is."
          />
          <div className="wiz-tiles wiz-tiles--3">
            {PHOTOGRAPHY_OPTIONS.map((option) => (
              <ChoiceTile
                key={option.value}
                name="photography"
                checked={draft.photography === option.value}
                onSelect={() => set('photography')(option.value)}
                title={option.value}
                sub={option.sub}
                icon={PHOTOGRAPHY_ICON[option.value]}
              />
            ))}
          </div>
        </section>

        <section className="org-card wiz-panel">
          <FieldHead
            label="Additional Notes (Optional)"
            hint="Anything else a participant should know before they book."
            saved={draft.rulesNotes.trim() !== ''}
          />
          <CounterArea
            ariaLabel="Additional notes"
            value={draft.rulesNotes}
            onChange={set('rulesNotes')}
            limit={RULES_NOTES_LIMIT}
            placeholder="e.g., The studio is on the second floor and there is no lift."
            rows={3}
          />
        </section>

        <div className="wiz-note">
          <span className="wiz-note__icon">
            <Info size={17} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <div>
            <strong>Where these show up</strong>
            <p>
              Participants see your rules on the activity page before they book, and again on their
              e-ticket. Editing them later only changes what new bookings agree to.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
