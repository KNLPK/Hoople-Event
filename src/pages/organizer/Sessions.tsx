import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Plus } from '@/components/ui/icons';
import { ORG_SESSIONS } from '@/data/organizer';
import { longDate } from '@/lib/format';

/** Every bookable slot across the workspace, in date order. */
export function OrgSessions() {
  const toast = useToast();
  const sessions = [...ORG_SESSIONS].sort(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
  );

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Sessions</h1>
          <p>Every bookable slot across your events and activities, in date order.</p>
        </div>
        <Button as="button" variant="primary" onClick={() => toast('Session scheduling is next on our roadmap')}>
          <Plus size={16} strokeWidth={2} />
          Add session
        </Button>
      </div>

      <Reveal className="org-card">
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Type</th>
                <th>Date &amp; time</th>
                <th>Coach / room</th>
                <th>Booked</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const ratio = session.booked / session.capacity;
                return (
                  <tr key={session.id}>
                    <td>
                      <span className="org-table__title">{session.experience}</span>
                      <span className="org-table__sub">{session.id.toUpperCase()}</span>
                    </td>
                    <td>
                      <span className={`org-pill org-pill--${session.kind.toLowerCase()}`}>
                        {session.kind === 'EVENT' ? 'Event' : 'Activity'}
                      </span>
                    </td>
                    <td>
                      {longDate(session.date)}
                      <div className="org-table__sub">
                        {session.start} - {session.end} WIB
                      </div>
                    </td>
                    <td>
                      {session.coach}
                      <div className="org-table__sub">{session.room}</div>
                    </td>
                    <td>
                      {session.booked} / {session.capacity}
                      <div className="org-meter">
                        <div
                          className={`org-meter__fill ${ratio >= 1 ? 'org-meter__fill--full' : ''}`.trim()}
                          style={{ width: `${Math.round(ratio * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="org-table__num">
                      <Button as="link" to="/organizer/check-in" variant="neutral" size="sm">
                        Check-in
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </>
  );
}
