import { RadioRow } from './WizardFields';
import { Calendar, Clock } from '@/components/ui/icons';
import { VISIBILITY_OPTIONS, type ActivityDraft } from '@/data/builder';

/**
 * Visibility and publish timing. 5.1 shows it compact beside the checklist and
 * 5.3 shows it in full — one component, so the two screens cannot drift.
 */
export function PublishSettings({
  draft,
  set,
  compact = false,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
  compact?: boolean;
}) {
  return (
    <div className={`wiz-publish ${compact ? 'is-compact' : ''}`.trim()}>
      <div className="flex flex-col gap-3">
        <span className="text-[12.5px] font-semibold text-ink">Visibility</span>
        {VISIBILITY_OPTIONS.map((option) => (
          <RadioRow
            key={option.value}
            name={compact ? 'visibility-summary' : 'visibility-publish'}
            checked={draft.visibility === option.value}
            onSelect={() => set('visibility')(option.value)}
            title={option.value}
            sub={option.sub}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[12.5px] font-semibold text-ink">Publish Date</span>
        <RadioRow
          name={compact ? 'when-summary' : 'when-publish'}
          checked={draft.publishWhen === 'now'}
          onSelect={() => set('publishWhen')('now')}
          title="Publish now"
          sub="Make this activity live immediately."
        />
        <RadioRow
          name={compact ? 'when-summary' : 'when-publish'}
          checked={draft.publishWhen === 'later'}
          onSelect={() => set('publishWhen')('later')}
          title="Schedule for later"
          sub="Set a future date and time to publish."
        />

        <div className={`wiz-when ${draft.publishWhen === 'now' ? 'is-off' : ''}`.trim()}>
          <span className="wiz-date">
            <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
            <input
              type="date"
              value={draft.publishDate}
              disabled={draft.publishWhen === 'now'}
              aria-label="Publish date"
              onChange={(event) => set('publishDate')(event.target.value)}
            />
          </span>
          <span className="wiz-date">
            <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
            <input
              type="time"
              value={draft.publishTime}
              disabled={draft.publishWhen === 'now'}
              aria-label="Publish time"
              onChange={(event) => set('publishTime')(event.target.value)}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
