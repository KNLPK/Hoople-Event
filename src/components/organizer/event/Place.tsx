import { RecordingFields, VenueFields, VirtualFields } from './VenueFields';
import { EventHead, type EventSectionProps } from './shared';
import { Building, Globe, MapPin, Pencil, Wifi } from '@/components/ui/icons';

/**
 * 2.2 — where the event happens. One component, three shapes: a venue, a
 * meeting link, or both. Keeping them together makes the difference between
 * the three event types readable in one place.
 */
export function EventPlace({ draft, set, goTo }: EventSectionProps) {
  if (draft.eventType === 'Online') {
    return (
      <>
        <EventHead
          title="2.2 Virtual Event Setup"
          badge="2 of 3"
          lede="Set up your online event details so participants can join smoothly."
          tip="Provide clear instructions and test your meeting link before publishing."
        />

        <div className="org-card wiz-card">
          <div className="evt-banner">
            <Globe size={18} color="#6D28FF" strokeWidth={1.9} />
            <div>
              <strong>You're creating an Online Event</strong>
              <span>All participants will join virtually.</span>
            </div>
          </div>

          <div className="evt-split">
            <div className="evt-split__main">
              <VirtualFields draft={draft} set={set} />
            </div>
            <div className="evt-split__side">
              <RecordingFields draft={draft} set={set} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (draft.eventType === 'Hybrid') {
    return (
      <>
        <EventHead
          title="2.2 Venue Setup"
          badge="2 of 3"
          lede="Set up both physical and virtual venues for your hybrid event."
          tip="Provide both venue and online details to make it easy for all participants to join—wherever they are."
        />

        <div className="org-card wiz-card">
          <div className="evt-banner">
            <Globe size={18} color="#6D28FF" strokeWidth={1.9} />
            <div>
              <strong>You're creating a Hybrid Event</strong>
              <span>Participants can join in person at the venue or attend online.</span>
            </div>
          </div>

          <div className="evt-columns">
            <section>
              <div className="evt-columns__head">
                <MapPin size={16} color="#6D28FF" strokeWidth={1.9} />
                <div>
                  <strong>Physical Venue (On-site)</strong>
                  <span>Venue where participants can attend in person.</span>
                </div>
              </div>
              <VenueFields draft={draft} set={set} compact />
            </section>

            <section>
              <div className="evt-columns__head">
                <Wifi size={16} color="#6D28FF" strokeWidth={1.9} />
                <div>
                  <strong>Virtual Venue (Online)</strong>
                  <span>Online platform for remote participants.</span>
                </div>
              </div>
              <VirtualFields draft={draft} set={set} compact />
              <div className="evt-recording">
                <RecordingFields draft={draft} set={set} />
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <EventHead
        title="2.2 Venue Details"
        badge="2 of 3"
        lede="Tell us where your event will take place."
        tip="Add a clear venue location and details to help participants find and plan their visit easily."
      />

      <div className="org-card wiz-card">
        <div className="wiz-field">
          <span className="wiz-field__label">Event Type</span>
          <div className="evt-typechip">
            <span>
              <Building size={15} color="#3C3A4A" strokeWidth={1.9} />
              Offline
            </span>
            {/* Sends you back to 2.1, where the type is actually chosen. */}
            <button type="button" onClick={() => goTo(2, 0)}>
              <Pencil size={13} color="#6D28FF" strokeWidth={1.9} />
              Change
            </button>
          </div>
        </div>

        <VenueFields draft={draft} set={set} />
      </div>
    </>
  );
}
