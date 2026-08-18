import { useState } from 'react';
import { CounterArea, CounterInput, FieldHead } from './WizardFields';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import { ExternalLink, MapPin, Minus, Plus, Reset, Search } from '@/components/ui/icons';
import {
  ADDRESS_LIMIT,
  FACILITIES_NOTE_LIMIT,
  MEETING_POINT_LIMIT,
  PARKING_LIMIT,
  VENUE_NAME_LIMIT,
  type ActivityDraft,
  type MapPin as MapPinPosition,
} from '@/data/builder';

const CENTRE: MapPinPosition = { x: 30, y: 46 };
const ZOOM_RANGE = { min: 1, max: 4 } as const;

/** 2.1 — where the activity happens, and how a participant finds it. */
export function StepVenue({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const toast = useToast();
  const [zoom, setZoom] = useState(2);
  const [query, setQuery] = useState('');

  const label = draft.venueName || 'Drop your pin';
  const mapsQuery = encodeURIComponent(
    [draft.venueName, draft.address].filter(Boolean).join(', ') || 'Kemang, Jakarta',
  );

  /** Click anywhere on the map to move the pin there. */
  function dropPin(event: React.MouseEvent<HTMLDivElement>) {
    const frame = event.currentTarget.getBoundingClientRect();
    set('pin')({
      x: Math.round(((event.clientX - frame.left) / frame.width) * 100),
      y: Math.round(((event.clientY - frame.top) / frame.height) * 100),
    });
  }

  return (
    <>
      <p className="wiz-section__lede">Add the venue details where your activity will take place.</p>

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <FieldHead
            label="Venue Name"
            required
            hint="This is the name of the place where your activity will be held."
            saved={draft.venueName.trim() !== ''}
          />
          <CounterInput
            ariaLabel="Venue name"
            value={draft.venueName}
            onChange={set('venueName')}
            limit={VENUE_NAME_LIMIT}
            placeholder="e.g., Clayhouse Pottery Studio"
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Full Address"
            required
            hint="Provide the complete address so participants can find the venue easily."
            saved={draft.address.trim() !== ''}
          />
          <CounterArea
            ariaLabel="Full address"
            value={draft.address}
            onChange={set('address')}
            limit={ADDRESS_LIMIT}
            placeholder="Enter full address"
            rows={3}
          />
        </div>

        <div className="wiz-field">
          <FieldHead
            label="Google Maps Location"
            required
            hint="Drop a pin on the map or search for the venue location."
          />

          <div className="wiz-map">
            {/* Drag a map export onto the frame to replace the placeholder. */}
            <ImageSlot
              id="builder-map"
              interactive={false}
              shape="rect"
              placeholder="Map of the venue's neighbourhood"
            />

            {/* Sits above the map so a click lands on the frame, not the slot. */}
            <div
              className="wiz-map__surface"
              onClick={dropPin}
              role="presentation"
              style={{ transform: `scale(${1 + (zoom - 1) * 0.08})` }}
            >
              <span className="wiz-map__pin" style={{ left: `${draft.pin.x}%`, top: `${draft.pin.y}%` }}>
                <MapPin size={26} color="#6D28FF" strokeWidth={2} />
                <span className="wiz-map__pin-label">{label}</span>
              </span>
            </div>

            <form
              className="wiz-map__search"
              onSubmit={(event) => {
                event.preventDefault();
                if (query.trim() === '') return;
                set('pin')(CENTRE);
                toast(`Pin moved to "${query.trim()}"`);
              }}
            >
              <Search size={15} color="#8B8A99" strokeWidth={2} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search location"
                aria-label="Search for the venue location"
              />
            </form>

            <div className="wiz-map__zoom">
              <button
                type="button"
                onClick={() => setZoom((level) => Math.min(ZOOM_RANGE.max, level + 1))}
                disabled={zoom === ZOOM_RANGE.max}
                aria-label="Zoom in"
              >
                <Plus size={15} color="#3C3A4A" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((level) => Math.max(ZOOM_RANGE.min, level - 1))}
                disabled={zoom === ZOOM_RANGE.min}
                aria-label="Zoom out"
              >
                <Minus size={15} color="#3C3A4A" />
              </button>
            </div>

            <button
              type="button"
              className="wiz-map__reset"
              onClick={() => {
                set('pin')(CENTRE);
                setZoom(2);
              }}
            >
              <Reset size={14} color="#3C3A4A" strokeWidth={2} />
              Reset pin
            </button>

            <a
              className="wiz-map__open"
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
              <ExternalLink size={13} color="#6D28FF" strokeWidth={2} />
            </a>
          </div>
        </div>

        <div className="wiz-extras">
          <div>
            <FieldHead
              label="Meeting Point / Landmark (Optional)"
              hint="Give a specific landmark to help participants."
            />
            <CounterInput
              ariaLabel="Meeting point or landmark"
              value={draft.meetingPoint}
              onChange={set('meetingPoint')}
              limit={MEETING_POINT_LIMIT}
              placeholder="e.g., In front of the main gate"
            />
          </div>
          <div>
            <FieldHead
              label="Parking Information (Optional)"
              hint="Share parking availability or location."
            />
            <CounterInput
              ariaLabel="Parking information"
              value={draft.parking}
              onChange={set('parking')}
              limit={PARKING_LIMIT}
              placeholder="e.g., Available on-site parking"
            />
          </div>
          <div>
            <FieldHead
              label="Facilities (Optional)"
              hint="List key facilities available at the venue."
            />
            <CounterInput
              ariaLabel="Facilities"
              value={draft.facilitiesNote}
              onChange={set('facilitiesNote')}
              limit={FACILITIES_NOTE_LIMIT}
              placeholder="e.g., Restroom, WiFi, Prayer room"
            />
          </div>
        </div>
      </div>
    </>
  );
}
