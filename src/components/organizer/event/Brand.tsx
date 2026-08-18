import { CounterArea, SelectInput } from '../WizardFields';
import { EventHead, type EventSectionProps } from './shared';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Check,
  Emoji,
  Globe,
  LinkChain,
  ListBullets,
  ListNumbers,
  Plus,
  TextBold,
  TextItalic,
  TextUnderline,
} from '@/components/ui/icons';
import {
  BRAND_COLORS,
  FONT_STYLES,
  HOST_TYPES,
  JOIN_INSTRUCTIONS_LIMIT,
} from '@/data/eventBuilder';

/** Step 4 — the visual identity and who is behind the event. */
export function EventBrand({ draft, set }: EventSectionProps) {
  const toast = useToast();

  return (
    <>
      <EventHead
        lede="Customize your event branding and add host information."
        tip="A logo and a short host bio make an event page feel like a real organisation, not a listing."
      />

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <span className="wiz-field__label">Event Branding</span>
          <span className="wiz-field__hint">Add visual identity that represents your event.</span>

          <div className="evt-brand">
            <div className="evt-asset">
              <span className="wiz-field__label">
                Event Logo<span className="field__req"> *</span>
              </span>
              <div className="evt-asset__row">
                <div className="evt-asset__square">
                  <ImageSlot id="event-logo" radius={10} placeholder="Logo" />
                </div>
                <div>
                  <span className="evt-asset__btn">Change Logo</span>
                  <span className="evt-asset__hint">PNG, JPG or SVG</span>
                  <span className="evt-asset__hint">Max. 2MB</span>
                  <span className="evt-asset__hint">Recommended size: 512 x 512px</span>
                </div>
              </div>
            </div>

            <div className="evt-asset">
              <span className="wiz-field__label">
                Event Banner / Cover Image<span className="field__req"> *</span>
              </span>
              <div className="evt-asset__row">
                {/* The same cover 1.1 sets — one image, two places to change it. */}
                <div className="evt-asset__banner">
                  <ImageSlot
                    id="event-cover"
                    src={draft.cover}
                    onChange={set('cover')}
                    radius={10}
                    placeholder="Event banner"
                  />
                </div>
                <div>
                  <span className="evt-asset__btn">Change Banner</span>
                  <span className="evt-asset__hint">PNG or JPG</span>
                  <span className="evt-asset__hint">Max. 5MB</span>
                  <span className="evt-asset__hint">Recommended size: 1920 x 1080px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="evt-brandrow">
            <div>
              <span className="wiz-field__label">
                Brand Colors <span className="wiz-field__optional">(Optional)</span>
              </span>
              <span className="wiz-field__hint">Choose primary colors for your event page.</span>
              <div className="evt-swatches">
                {BRAND_COLORS.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    className={`evt-swatch ${draft.brandColor === colour ? 'is-on' : ''}`.trim()}
                    style={{ background: colour }}
                    aria-label={`Brand colour ${colour}`}
                    aria-pressed={draft.brandColor === colour}
                    onClick={() => set('brandColor')(colour)}
                  >
                    {draft.brandColor === colour ? (
                      <Check size={13} color="#fff" strokeWidth={3} />
                    ) : null}
                  </button>
                ))}
                <button
                  type="button"
                  className="evt-swatch evt-swatch--add"
                  onClick={() => toast('Custom brand colours arrive with the Pro plan')}
                  aria-label="Add a custom colour"
                >
                  <Plus size={14} color="#5C5B6B" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div>
              <span className="wiz-field__label">
                Font Style <span className="wiz-field__optional">(Optional)</span>
              </span>
              <span className="wiz-field__hint">Select the font style for your event page.</span>
              <SelectInput
                ariaLabel="Font style"
                value={draft.fontStyle}
                options={FONT_STYLES}
                onChange={set('fontStyle')}
                leading={<span className="evt-aa">Aa</span>}
              />
            </div>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <span className="wiz-field__label">Host Information</span>
          <span className="wiz-field__hint">This information will be shown as the event organizer.</span>

          <div className="wiz-pair" style={{ marginTop: 14 }}>
            <div>
              <span className="wiz-field__label">
                Host Name<span className="field__req"> *</span>
              </span>
              <input
                className="wiz-input"
                value={draft.hostName}
                aria-label="Host name"
                onChange={(event) => set('hostName')(event.target.value)}
              />
            </div>
            <div>
              <span className="wiz-field__label">Host Type</span>
              <SelectInput
                ariaLabel="Host type"
                value={draft.hostType}
                options={HOST_TYPES}
                onChange={set('hostType')}
              />
            </div>
          </div>

          <div className="evt-hostgrid">
            <div>
              <span className="wiz-field__label">
                Host Description<span className="field__req"> *</span>
              </span>
              <div className="evt-rich">
                <div className="evt-rich__bar">
                  {[TextBold, TextItalic, TextUnderline].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toast('Select some text to style it')}
                      aria-label={['Bold', 'Italic', 'Underline'][index]}
                    >
                      <Icon size={14} color="#3C3A4A" />
                    </button>
                  ))}
                  <span className="evt-rich__divider" />
                  {[ListBullets, ListNumbers, LinkChain, Emoji].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toast('Select some text to style it')}
                      aria-label={['Bulleted list', 'Numbered list', 'Link', 'Emoji'][index]}
                    >
                      <Icon size={14} color="#3C3A4A" />
                    </button>
                  ))}
                </div>
                <CounterArea
                  ariaLabel="Host description"
                  value={draft.hostDescription}
                  onChange={set('hostDescription')}
                  limit={JOIN_INSTRUCTIONS_LIMIT}
                  placeholder="What does your community stand for?"
                  rows={4}
                />
              </div>
            </div>

            <div className="evt-asset">
              <span className="wiz-field__label">
                Host Logo<span className="field__req"> *</span>
              </span>
              <div className="evt-asset__row">
                <div className="evt-asset__square evt-asset__square--brand">
                  <ImageSlot id="event-host-logo" radius={10} placeholder="" />
                  <span className="evt-asset__initials">WL</span>
                </div>
                <div>
                  <span className="evt-asset__btn">Change Logo</span>
                  <span className="evt-asset__hint">PNG, JPG or SVG</span>
                  <span className="evt-asset__hint">Max. 2MB</span>
                  <span className="evt-asset__hint">Recommended size: 512 x 512px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wiz-triple" style={{ marginTop: 18 }}>
            <div>
              <span className="wiz-field__label">
                Contact Email<span className="field__req"> *</span>
              </span>
              <input
                className="wiz-input"
                type="email"
                value={draft.contactEmail}
                aria-label="Contact email"
                onChange={(event) => set('contactEmail')(event.target.value)}
              />
            </div>
            <div>
              <span className="wiz-field__label">
                Contact Phone <span className="wiz-field__optional">(Optional)</span>
              </span>
              <input
                className="wiz-input"
                value={draft.contactPhone}
                aria-label="Contact phone"
                onChange={(event) => set('contactPhone')(event.target.value)}
              />
            </div>
            <div>
              <span className="wiz-field__label">
                Website / Social <span className="wiz-field__optional">(Optional)</span>
              </span>
              <span className="wiz-select">
                <Globe size={16} color="#8B8A99" strokeWidth={1.9} />
                <input
                  className="wiz-linkinput"
                  value={draft.hostWebsite}
                  aria-label="Website or social link"
                  placeholder="https://"
                  onChange={(event) => set('hostWebsite')(event.target.value)}
                />
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
