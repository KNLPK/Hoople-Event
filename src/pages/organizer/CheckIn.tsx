import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Check, CheckCircle, Users } from '@/components/ui/icons';
import { ORG_REGISTRATIONS } from '@/data/organizer';

/** Door tool: scan a QR, or tick people off the list by hand. */
export function OrgCheckIn() {
  const toast = useToast();
  const [checkedIn, setCheckedIn] = useState<Set<string>>(
    () => new Set(ORG_REGISTRATIONS.filter((r) => r.checkedIn).map((r) => r.id)),
  );

  const attendees = ORG_REGISTRATIONS.filter((r) => r.status === 'Confirmed');
  const inCount = attendees.filter((r) => checkedIn.has(r.id)).length;

  function toggle(id: string, name: string) {
    /* The toast has to fire out here. React runs a state updater during the
       render phase, and telling another component to update from inside one
       is the "Cannot update a component while rendering" warning. */
    const wasIn = checkedIn.has(id);
    setCheckedIn((current) => {
      const next = new Set(current);
      if (wasIn) next.delete(id);
      else next.add(id);
      return next;
    });
    toast(wasIn ? `${name} checked out` : `${name} checked in`);
  }

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Check-in</h1>
          <p>Scan a participant's QR e-ticket at the door, or check them off by hand.</p>
        </div>
        <div className="row" style={{ gap: 10, fontSize: 13.5, fontWeight: 600 }}>
          <Users size={17} color="#6D28FF" strokeWidth={1.9} />
          {inCount} of {attendees.length} checked in
        </div>
      </div>

      <div className="org-checkin">
        <Reveal className="org-scanner">
          <div className="org-scanner__frame">
            <ImageSlot id="org-scanner" shape="rounded" radius={12} placeholder="QR scanner view" />
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>Point at a QR e-ticket</div>
          <p style={{ fontSize: 12.5, color: 'var(--grey)', lineHeight: 1.6, marginBottom: 18 }}>
            The scanner works offline — check-ins sync as soon as you are back on a connection.
          </p>
          <Button
            as="button"
            variant="primary"
            block
            onClick={() => {
              const next = attendees.find((r) => !checkedIn.has(r.id));
              if (next) {
                toggle(next.id, next.name);
              } else {
                toast('Everyone on the list is already checked in');
              }
            }}
          >
            <CheckCircle size={17} strokeWidth={1.9} />
            Simulate a scan
          </Button>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="org-card__head">
            <h2 className="org-card__title">Attendee list</h2>
            <span style={{ fontSize: 13, color: 'var(--grey)' }}>Confirmed registrations only</span>
          </div>

          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Experience</th>
                  <th className="org-table__num">Tickets</th>
                  <th className="org-table__num">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => {
                  const isIn = checkedIn.has(attendee.id);
                  return (
                    <tr key={attendee.id}>
                      <td>
                        <span className="org-table__title">{attendee.name}</span>
                        <span className="org-table__sub">{attendee.email}</span>
                      </td>
                      <td>{attendee.experience}</td>
                      <td className="org-table__num">{attendee.tickets}</td>
                      <td className="org-table__num">
                        <Button
                          as="button"
                          variant={isIn ? 'green' : 'outline'}
                          size="sm"
                          onClick={() => toggle(attendee.id, attendee.name)}
                        >
                          {isIn ? (
                            <>
                              <Check size={14} color="#fff" />
                              Checked in
                            </>
                          ) : (
                            'Check in'
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </>
  );
}
