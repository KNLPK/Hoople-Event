import { CounterArea, CounterInput, SelectInput, Toggle } from '../WizardFields';
import { type EventSetter } from './shared';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Emoji,
  ExternalLink,
  LinkChain,
  ListBullets,
  ListNumbers,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  TextBold,
  TextItalic,
} from '@/components/ui/icons';
import {
  ACCESSIBILITY_OPTIONS,
  EVENT_ADDRESS_LIMIT,
  JOIN_INSTRUCTIONS_LIMIT,
  MEETING_PLATFORMS,
  RECORDING_ACCESS,
  RECORDING_AVAILABILITY,
  RECORDING_OPTIONS,
  VENUE_FIELD_LIMIT,
  VENUE_NAME_LIMIT,
  type EventDraft,
} from '@/data/eventBuilder';

/**
 * The venue and virtual field groups, split out because the hybrid section
 * shows both side by side and the other two show one each.
 */

export function VenueFields({
  draft,
  set,
  compact = false,
}: {
  draft: EventDraft;
  set: EventSetter;
  /** The hybrid layout puts these in a narrow column. */
  compact?: boolean;
}) {
  const mapsQuery = encodeURIComponent(
    [draft.venueName, draft.address].filter(Boolean).join(', ') || 'Jakarta',
  );

  return (
    <>
      <div className="wiz-field">
        <span className="wiz-field__label">
          Venue Name<span className="field__req"> *</span>
        </span>
        {!compact ? <span className="wiz-field__hint">Enter the name of your venue.</span> : null}
        <CounterInput
          ariaLabel="Venue name"
          value={draft.venueName}
          onChange={set('venueName')}
          limit={VENUE_NAME_LIMIT}
          placeholder="e.g., The Kasablanka Hall"
        />
      </div>

      <div className="wiz-field">
        <span className="wiz-field__label">
          Address<span className="field__req"> *</span>
        </span>
        {!compact ? (
          <span className="wiz-field__hint">Search or enter the full address.</span>
        ) : null}
        <CounterArea
          ariaLabel="Address"
          value={draft.address}
          onChange={set('address')}
          limit={EVENT_ADDRESS_LIMIT}
          placeholder="Enter the full address"
          rows={2}
        />

        <div className="evt-map">
          <ImageSlot
            id="event-map"
            interactive={false}
            shape="rect"
            placeholder="Map of the venue's neighbourhood"
          />
          <span className="evt-map__pin">
            <MapPin size={22} color="#6D28FF" strokeWidth={2} />
            <span>
              <strong>{draft.venueName || 'Your venue'}</strong>
              {draft.address ? <em>{draft.address.split(',').slice(0, 2).join(', ')}</em> : null}
            </span>
          </span>

          <a
            className="evt-map__action"
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noreferrer"
          >
            <Search size={13} color="#6D28FF" strokeWidth={2} />
            {compact ? 'Search on Map' : 'Edit on Map'}
            <ExternalLink size={12} color="#6D28FF" strokeWidth={2} />
          </a>

          <div className="evt-map__zoom" aria-hidden="true">
            <span>
              <Plus size={13} color="#3C3A4A" />
            </span>
            <span>
              <Minus size={13} color="#3C3A4A" />
            </span>
          </div>
        </div>
      </div>

      <div className={compact ? 'wiz-pair' : 'wiz-triple'}>
        <div>
          <span className="wiz-field__label">
            Meeting Point <span className="wiz-field__optional">(Optional)</span>
          </span>
          {!compact ? (
            <span className="wiz-field__hint">Help participants find the check-in location.</span>
          ) : null}
          <CounterInput
            ariaLabel="Meeting point"
            value={draft.meetingPoint}
            onChange={set('meetingPoint')}
            limit={VENUE_FIELD_LIMIT}
            placeholder="e.g., Main Lobby, Lantai 1"
          />
        </div>
        <div>
          <span className="wiz-field__label">
            Parking Information <span className="wiz-field__optional">(Optional)</span>
          </span>
          {!compact ? (
            <span className="wiz-field__hint">Provide parking info for participants.</span>
          ) : null}
          <CounterInput
            ariaLabel="Parking information"
            value={draft.parking}
            onChange={set('parking')}
            limit={VENUE_FIELD_LIMIT}
            placeholder="e.g., Available at Mall Parking P2 & P3"
          />
        </div>
        <div className={compact ? 'evt-span' : ''}>
          <span className="wiz-field__label">
            Accessibility <span className="wiz-field__optional">(Optional)</span>
          </span>
          {!compact ? (
            <span className="wiz-field__hint">Share accessibility information.</span>
          ) : null}
          <SelectInput
            ariaLabel="Accessibility"
            value={draft.accessibility}
            options={ACCESSIBILITY_OPTIONS}
            onChange={set('accessibility')}
          />
        </div>
      </div>

      {!compact ? (
        <div className="org-card wiz-panel evt-subpanel">
          <span className="wiz-field__label">
            Venue Contact <span className="wiz-field__optional">(Optional)</span>
          </span>
          <span className="wiz-field__hint">
            Provide a contact person or number for venue-related inquiries.
          </span>
          <span className="wiz-affix">
            <span className="wiz-affix__lead">
              <Phone size={15} color="#8B8A99" strokeWidth={1.9} />
            </span>
            <input
              value={draft.venueContact}
              aria-label="Venue contact"
              placeholder="+62 812 3456 7890 (Venue Manager)"
              onChange={(event) => set('venueContact')(event.target.value)}
            />
          </span>
        </div>
      ) : null}
    </>
  );
}

export function VirtualFields({
  draft,
  set,
  compact = false,
}: {
  draft: EventDraft;
  set: EventSetter;
  compact?: boolean;
}) {
  const toast = useToast();

  /** The toolbar wraps the selection, so the buttons do something real. */
  function wrap(before: string, after = before) {
    const field = document.getElementById('event-join-instructions') as HTMLTextAreaElement | null;
    if (!field) return;
    const { selectionStart: from, selectionEnd: to, value } = field;
    if (from === to) {
      toast('Select some text first');
      return;
    }
    set('joinInstructions')(
      `${value.slice(0, from)}${before}${value.slice(from, to)}${after}${value.slice(to)}`,
    );
  }

  function prefixLines(marker: string) {
    const numbered = marker === '1.';
    set('joinInstructions')(
      draft.joinInstructions
        .split('\n')
        .map((line, index) => (numbered ? `${index + 1}. ${line}` : `${marker} ${line}`))
        .join('\n'),
    );
  }

  return (
    <>
      {/* The URL needs the wider half — the platform is a short select. */}
      <div className="wiz-pair evt-pair--url">
        <div>
          <span className="wiz-field__label">
            Meeting Platform<span className="field__req"> *</span>
          </span>
          {!compact ? (
            <span className="wiz-field__hint">Choose the platform you will use.</span>
          ) : null}
          <SelectInput
            ariaLabel="Meeting platform"
            value={draft.platform}
            options={MEETING_PLATFORMS}
            onChange={set('platform')}
            leading={<LinkChain size={16} color="#6D28FF" strokeWidth={1.9} />}
          />
        </div>
        <div>
          <span className="wiz-field__label">
            Meeting URL<span className="field__req"> *</span>
          </span>
          {!compact ? (
            <span className="wiz-field__hint">Paste the permanent meeting link.</span>
          ) : null}
          <span className="wiz-affix evt-url">
            <input
              value={draft.meetingUrl}
              aria-label="Meeting URL"
              placeholder="https://zoom.us/j/1234567890"
              onChange={(event) => set('meetingUrl')(event.target.value)}
            />
            <a
              className="evt-url__test"
              href={draft.meetingUrl || '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (!draft.meetingUrl) {
                  event.preventDefault();
                  toast('Add a meeting link first');
                }
              }}
            >
              Test Link
              <ExternalLink size={12} color="#6D28FF" strokeWidth={2} />
            </a>
          </span>
        </div>
      </div>

      <div className="wiz-pair">
        {!compact ? (
          <div>
            <span className="wiz-field__label">Meeting ID</span>
            <span className="wiz-field__hint">Your {draft.platform} meeting ID (numbers only).</span>
            <input
              className="wiz-input"
              value={draft.meetingId}
              aria-label="Meeting ID"
              placeholder="123 456 7890"
              onChange={(event) => set('meetingId')(event.target.value)}
            />
          </div>
        ) : null}
        <div className={compact ? 'evt-span' : ''}>
          <span className="wiz-field__label">
            Passcode <span className="wiz-field__optional">(Optional)</span>
          </span>
          {!compact ? (
            <span className="wiz-field__hint">Enter the meeting passcode.</span>
          ) : null}
          <PasscodeField value={draft.passcode} onChange={set('passcode')} />
        </div>
      </div>

      {!compact ? (
        <div className="wiz-field">
          <span className="wiz-field__label">Host / Organizer Email</span>
          <span className="wiz-field__hint">This email will be displayed as the host.</span>
          <input
            className="wiz-input"
            type="email"
            value={draft.hostEmail}
            aria-label="Host email"
            placeholder="hello@waktuluang.com"
            onChange={(event) => set('hostEmail')(event.target.value)}
          />
        </div>
      ) : null}

      <div className="wiz-field">
        <span className="wiz-field__label">
          Join Instructions {compact ? <span className="wiz-field__optional">(Optional)</span> : null}
        </span>
        <span className="wiz-field__hint">Add instructions for participants before they join.</span>

        <div className="evt-rich">
          <div className="evt-rich__bar">
            <button type="button" onClick={() => wrap('**')} aria-label="Bold">
              <TextBold size={14} color="#3C3A4A" />
            </button>
            <button type="button" onClick={() => wrap('_')} aria-label="Italic">
              <TextItalic size={14} color="#3C3A4A" />
            </button>
            <span className="evt-rich__divider" />
            <button type="button" onClick={() => prefixLines('•')} aria-label="Bulleted list">
              <ListBullets size={14} color="#3C3A4A" />
            </button>
            <button type="button" onClick={() => prefixLines('1.')} aria-label="Numbered list">
              <ListNumbers size={14} color="#3C3A4A" />
            </button>
            <span className="evt-rich__divider" />
            <button type="button" onClick={() => wrap('[', '](https://)')} aria-label="Link">
              <LinkChain size={14} color="#3C3A4A" />
            </button>
            <button
              type="button"
              onClick={() => set('joinInstructions')(`${draft.joinInstructions} 🙂`)}
              aria-label="Emoji"
            >
              <Emoji size={14} color="#3C3A4A" />
            </button>
          </div>

          <div className="wiz-area">
            <textarea
              id="event-join-instructions"
              value={draft.joinInstructions}
              rows={5}
              maxLength={JOIN_INSTRUCTIONS_LIMIT}
              aria-label="Join instructions"
              placeholder="Please join 15 minutes before the event starts."
              onChange={(event) => set('joinInstructions')(event.target.value)}
            />
            <span className="wiz-area__count">
              {draft.joinInstructions.length} / {JOIN_INSTRUCTIONS_LIMIT}
            </span>
          </div>
        </div>
      </div>

      {!compact ? (
        <div className="wiz-field">
          <span className="wiz-field__label">
            Support Contact <span className="wiz-field__optional">(Optional)</span>
          </span>
          <span className="wiz-field__hint">
            Provide a contact for technical support during the event.
          </span>
          <span className="wiz-affix">
            <span className="wiz-affix__prefix evt-flag">
              <i className="flag-id" aria-hidden="true" />
              +62
            </span>
            <input
              value={draft.supportContact}
              aria-label="Support contact"
              placeholder="812 3456 7890 (WhatsApp Support)"
              onChange={(event) => set('supportContact')(event.target.value)}
            />
          </span>
        </div>
      ) : null}
    </>
  );
}

/** The recording block sits in its own column on both online and hybrid. */
export function RecordingFields({ draft, set }: { draft: EventDraft; set: EventSetter }) {
  return (
    <>
      <Toggle
        checked={draft.waitingRoom}
        onChange={set('waitingRoom')}
        label="Enable Waiting Room"
        hint="Review participants before they join."
      />

      <div className="wiz-field">
        <span className="wiz-field__label">Recording</span>
        <span className="wiz-field__hint">Will this session be recorded?</span>
        <SelectInput
          ariaLabel="Recording"
          value={draft.recording}
          options={RECORDING_OPTIONS}
          onChange={set('recording')}
        />
      </div>

      <div className="wiz-field">
        <span className="wiz-field__label">Recording Access</span>
        <span className="wiz-field__hint">Who can access the recording?</span>
        <SelectInput
          ariaLabel="Recording access"
          value={draft.recordingAccess}
          options={RECORDING_ACCESS}
          onChange={set('recordingAccess')}
        />
      </div>

      <div className="wiz-field">
        <span className="wiz-field__label">Recording Availability</span>
        <span className="wiz-field__hint">How long will the recording be available?</span>
        <SelectInput
          ariaLabel="Recording availability"
          value={draft.recordingAvailability}
          options={RECORDING_AVAILABILITY}
          onChange={set('recordingAvailability')}
        />
      </div>
    </>
  );
}

function PasscodeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <span className="wiz-affix">
      <input
        value={value}
        aria-label="Passcode"
        placeholder="Enter the meeting passcode"
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  );
}
