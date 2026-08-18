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
          <span className="block text-[13.5px] font-semibold text-ink">Event Branding</span>
          <span className="wiz-field__hint">Add visual identity that represents your event.</span>

          <div className="evt-brand">
            <div className="evt-asset">
              <span className="block text-[13.5px] font-semibold text-ink">
                Event Logo<span className="text-danger"> *</span>
              </span>
              <div className="flex gap-3.5 items-start mt-2 to-900:flex-col">
                <div className="relative w-[96px] h-[96px] flex-none rounded-md overflow-hidden">
                  <ImageSlot id="event-logo" radius={10} placeholder="Logo" />
                </div>
                <div>
                  <span className="inline-flex items-center h-[34px] py-0 px-3.5 border border-line-input rounded-md bg-[#fff] text-[12.5px] font-semibold text-ink mb-2.5 pointer-events-none">Change Logo</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">PNG, JPG or SVG</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">Max. 2MB</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">Recommended size: 512 x 512px</span>
                </div>
              </div>
            </div>

            <div className="evt-asset">
              <span className="block text-[13.5px] font-semibold text-ink">
                Event Banner / Cover Image<span className="text-danger"> *</span>
              </span>
              <div className="flex gap-3.5 items-start mt-2 to-900:flex-col">
                {/* The same cover 1.1 sets — one image, two places to change it. */}
                <div className="flex-1 min-w-0 h-[132px] rounded-md overflow-hidden to-900:w-full to-900:self-stretch">
                  <ImageSlot
                    id="event-cover"
                    src={draft.cover}
                    onChange={set('cover')}
                    radius={10}
                    placeholder="Event banner"
                  />
                </div>
                <div>
                  <span className="inline-flex items-center h-[34px] py-0 px-3.5 border border-line-input rounded-md bg-[#fff] text-[12.5px] font-semibold text-ink mb-2.5 pointer-events-none">Change Banner</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">PNG or JPG</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">Max. 5MB</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">Recommended size: 1920 x 1080px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="evt-brandrow">
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Brand Colors <span className="font-normal text-grey">(Optional)</span>
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
              <span className="block text-[13.5px] font-semibold text-ink">
                Font Style <span className="font-normal text-grey">(Optional)</span>
              </span>
              <span className="wiz-field__hint">Select the font style for your event page.</span>
              <SelectInput
                ariaLabel="Font style"
                value={draft.fontStyle}
                options={FONT_STYLES}
                onChange={set('fontStyle')}
                leading={<span className="text-[12px] font-bold text-grey">Aa</span>}
              />
            </div>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <span className="block text-[13.5px] font-semibold text-ink">Host Information</span>
          <span className="wiz-field__hint">This information will be shown as the event organizer.</span>

          <div className="wiz-pair" style={{ marginTop: 14 }}>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Host Name<span className="text-danger"> *</span>
              </span>
              <input
                className="wiz-input"
                value={draft.hostName}
                aria-label="Host name"
                onChange={(event) => set('hostName')(event.target.value)}
              />
            </div>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">Host Type</span>
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
              <span className="block text-[13.5px] font-semibold text-ink">
                Host Description<span className="text-danger"> *</span>
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
                  <span className="w-px h-4 bg-line-strong my-0 mx-[5px]" />
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
              <span className="block text-[13.5px] font-semibold text-ink">
                Host Logo<span className="text-danger"> *</span>
              </span>
              <div className="flex gap-3.5 items-start mt-2 to-900:flex-col">
                <div className="relative w-[96px] h-[96px] flex-none rounded-md overflow-hidden evt-asset__square--brand">
                  <ImageSlot id="event-host-logo" radius={10} placeholder="" />
                  <span className="absolute inset-0 flex items-center justify-center font-heading text-[30px] font-bold text-[#fff] pointer-events-none">WL</span>
                </div>
                <div>
                  <span className="inline-flex items-center h-[34px] py-0 px-3.5 border border-line-input rounded-md bg-[#fff] text-[12.5px] font-semibold text-ink mb-2.5 pointer-events-none">Change Logo</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">PNG, JPG or SVG</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">Max. 2MB</span>
                  <span className="block text-[11.5px] text-grey leading-[1.6]">Recommended size: 512 x 512px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wiz-triple" style={{ marginTop: 18 }}>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Contact Email<span className="text-danger"> *</span>
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
              <span className="block text-[13.5px] font-semibold text-ink">
                Contact Phone <span className="font-normal text-grey">(Optional)</span>
              </span>
              <input
                className="wiz-input"
                value={draft.contactPhone}
                aria-label="Contact phone"
                onChange={(event) => set('contactPhone')(event.target.value)}
              />
            </div>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Website / Social <span className="font-normal text-grey">(Optional)</span>
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
