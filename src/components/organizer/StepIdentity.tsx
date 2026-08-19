import { CounterArea, FieldHead, SelectInput, TextInput } from './WizardFields';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Bulb } from '@/components/ui/icons';
import { BUILDER_CATEGORIES, SUMMARY_LIMIT, type ActivityDraft } from '@/data/builder';

const COVER_TIPS = ['Use high-quality image', 'Avoid busy background', 'Showcase your activity clearly'];

/** 1.1 — what the activity is called, and what it looks like on a card. */
export function StepIdentity({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  return (
    <>
      <p className="wiz-section__lede">Tell us the basic information about your activity.</p>

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <FieldHead label="Cover Image" required hint="This will be the main image for your activity." />
          <div className="wiz-cover">
            <div className="wiz-cover__slot">
              <ImageSlot
                id="builder-cover"
                src={draft.cover}
                onChange={set('cover')}
                radius={12}
                placeholder="Upload cover image"
                hint="PNG, JPG up to 10MB (Recommended: 1600 x 900px)"
              />
            </div>
            <aside className="wiz-tips">
              <div className="flex items-center gap-[7px] text-[12.5px] font-semibold text-brand mb-[9px]">
                <Bulb size={15} color="#6D28FF" strokeWidth={1.9} />
                Tips
              </div>
              <ul>
                {COVER_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </aside>
          </div>
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Activity Title"
            required
            hint="Give your activity a clear and engaging title."
            saved={draft.title.trim() !== ''}
          />
          <TextInput
            ariaLabel="Activity title"
            value={draft.title}
            onChange={set('title')}
            placeholder="e.g., Pottery Class for Beginners"
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Activity Category"
            required
            hint="Select the category that best fits your activity."
            saved={draft.category !== ''}
          />
          <div className="wiz-field__control max-w-[290px]">
            <SelectInput
              ariaLabel="Activity category"
              value={draft.category}
              options={BUILDER_CATEGORIES}
              placeholder="Select category"
              onChange={set('category')}
            />
          </div>
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Short Description"
            required
            hint="A short summary that will appear on activity cards and previews."
            saved={draft.summary.trim() !== ''}
          />
          <CounterArea
            ariaLabel="Short description"
            value={draft.summary}
            onChange={set('summary')}
            limit={SUMMARY_LIMIT}
            placeholder="Describe your activity in 1-2 sentences..."
          />
        </div>
      </div>
    </>
  );
}
