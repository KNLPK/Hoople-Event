import { useState } from 'react';
import { EventHead, type EventSetter } from './shared';
import { useToast } from '@/components/ui/Toast';
import {
  Bag,
  Check,
  Doc,
  Grip,
  Mic,
  Plus,
  Trash,
  Users,
  Utensils,
  VideoFile,
} from '@/components/ui/icons';
import {
  BENEFIT_MAX,
  BENEFIT_SUGGESTIONS,
  HIGHLIGHT_MAX,
  HIGHLIGHT_OPTIONS,
  type EventDraft,
} from '@/data/eventBuilder';

/** Highlights are a fixed vocabulary, so each one can carry its own icon. */
const HIGHLIGHT_ICON: Record<string, typeof Doc> = {
  Certificate: Doc,
  Networking: Users,
  'Lunch Included': Utensils,
  'Workshop Kit': Bag,
  'Expert Speaker': Mic,
  'Recording Access': VideoFile,
  'Door Prize': Bag,
  'Community Access': Users,
};

/** 1.3 — why the event is worth someone's afternoon. */
export function EventBenefits({ draft, set }: { draft: EventDraft; set: EventSetter }) {
  const toast = useToast();
  const [picker, setPicker] = useState(false);
  const [entry, setEntry] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  const unused = HIGHLIGHT_OPTIONS.filter((item) => !draft.highlights.includes(item));

  function addBenefit(value: string) {
    const clean = value.trim();
    if (!clean || draft.benefits.includes(clean)) return;
    if (draft.benefits.length >= BENEFIT_MAX) {
      toast(`Up to ${BENEFIT_MAX} benefits — remove one first`);
      return;
    }
    set('benefits')([...draft.benefits, clean]);
    setEntry('');
  }

  /** Drop the dragged benefit in front of the one it was released over. */
  function reorder(target: string) {
    if (!dragId || dragId === target) return;
    const rest = draft.benefits.filter((item) => item !== dragId);
    rest.splice(rest.indexOf(target), 0, dragId);
    set('benefits')(rest);
  }

  return (
    <>
      <EventHead
        title="1.3 Benefits"
        badge="3 of 3"
        lede="Highlight what participants will get and why your event is worth joining."
        tip="Clear benefits help increase interest and encourage more people to register!"
      />

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <span className="wiz-field__label">Experience Highlights</span>
          <span className="wiz-field__hint">
            Add key highlights of your event. You can add up to {HIGHLIGHT_MAX} items.
          </span>

          <div className="evt-highlights">
            {draft.highlights.map((item) => {
              const Icon = HIGHLIGHT_ICON[item] ?? Check;
              return (
                <button
                  key={item}
                  type="button"
                  className="evt-highlight"
                  onClick={() => set('highlights')(draft.highlights.filter((h) => h !== item))}
                  aria-label={`Remove ${item}`}
                >
                  <Icon size={17} color="#6D28FF" strokeWidth={1.8} />
                  {item}
                </button>
              );
            })}

            {draft.highlights.length < HIGHLIGHT_MAX ? (
              <button
                type="button"
                className="evt-highlight evt-highlight--add"
                onClick={() => setPicker((was) => !was)}
                aria-expanded={picker}
              >
                <Plus size={15} color="#6D28FF" strokeWidth={2} />
                Add Highlight
              </button>
            ) : null}
          </div>

          {picker ? (
            <div className="wiz-tokens__suggest evt-highlights__picker">
              {unused.length === 0 ? (
                <span className="wiz-field__hint">Every highlight is already on the list.</span>
              ) : (
                unused.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      set('highlights')([...draft.highlights, item]);
                      setPicker(false);
                    }}
                  >
                    <Plus size={12} color="#6D28FF" />
                    {item}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="wiz-field">
          <span className="wiz-field__label">What will participants gain?</span>
          <span className="wiz-field__hint">
            List the key benefits or takeaways participants will get from this event.
          </span>

          <div className="evt-benefits">
            {draft.benefits.map((benefit) => (
              <div
                key={benefit}
                className={`evt-benefit ${dragId === benefit ? 'is-dragging' : ''}`.trim()}
                draggable
                onDragStart={() => setDragId(benefit)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorder(benefit)}
              >
                <span className="evt-benefit__grip" aria-hidden="true">
                  <Grip size={14} color="#C3C1CE" />
                </span>
                <input
                  value={benefit}
                  aria-label="Benefit"
                  onChange={(event) =>
                    set('benefits')(
                      draft.benefits.map((item) => (item === benefit ? event.target.value : item)),
                    )
                  }
                />
                <button
                  type="button"
                  className="wiz-iconbtn wiz-iconbtn--danger"
                  onClick={() => set('benefits')(draft.benefits.filter((item) => item !== benefit))}
                  aria-label={`Remove "${benefit}"`}
                >
                  <Trash size={14} color="#E11D48" strokeWidth={1.9} />
                </button>
              </div>
            ))}

            <form
              className="evt-benefit__add"
              onSubmit={(event) => {
                event.preventDefault();
                addBenefit(entry || BENEFIT_SUGGESTIONS[draft.benefits.length] || '');
              }}
            >
              <Plus size={15} color="#6D28FF" strokeWidth={2} />
              <input
                value={entry}
                onChange={(event) => setEntry(event.target.value)}
                placeholder="Add Benefit"
                aria-label="Add a benefit"
              />
            </form>
          </div>

          <div className="evt-benefits__count">
            {draft.benefits.length} / {BENEFIT_MAX}
          </div>
        </div>
      </div>
    </>
  );
}
