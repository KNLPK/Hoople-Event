import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Bulb, CheckCircle, Download, Gear, Monitor, ShieldCheck, Users } from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import { Meter, TrendChart } from '@/components/ui/charts';
import {
  CHECKIN_CURVE,
  REGISTRATIONS,
  SCANNER_STATS,
  onsiteRegistrations,
  passOf,
  sessionsFor,
  type TeamEvent,
} from '@/data/teams';

/**
 * The door. A hybrid internal event has two doors, really — a scanner in the
 * lobby and a livestream that marks people present when they join — so the
 * totals here split by both rather than pretending everyone is scanned.
 */
export function TeamsCheckIn() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const [scans, setScans] = useState(event.onsiteScans);
  const onlineJoins = event.checkedIn - event.onsiteScans;
  const totalIn = scans + onlineJoins;
  const onsite = onsiteRegistrations(event);
  const sessions = sessionsFor(event.id);

  const recent = REGISTRATIONS.filter((row) => row.attendance === 'Checked in');

  function simulate() {
    if (scans >= onsite) {
      toast('Everyone onsite is already checked in');
      return;
    }
    setScans((current) => current + 1);
    toast('Pass accepted — member checked in');
  }

  return (
    <>
      <EventContext event={event}>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Downloading the attendance report')}>
          <Download size={15} strokeWidth={1.9} />
          Download report
        </Button>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Check-in settings')}>
          <Gear size={15} strokeWidth={1.9} />
          Check-in settings
        </Button>
      </EventContext>

      <div className="tm-work has-aside">
        <div className="flex flex-col" style={{ gap: 18 }}>
          <Reveal className="org-stats org-stats--4">
            <Stat
              icon={<CheckCircle size={17} color="#16A34A" strokeWidth={1.8} />}
              label="Checked in"
              value={String(totalIn)}
              note={`${Math.round((totalIn / event.registered) * 1000) / 10}% of registrations`}
            />
            <Stat
              icon={<Users size={17} color="#6D28FF" strokeWidth={1.8} />}
              label="Scanned at the door"
              value={String(scans)}
              note={`of ${onsite} onsite passes`}
            />
            <Stat
              icon={<Monitor size={17} color="#EA8C00" strokeWidth={1.8} />}
              label="Joined online"
              value={String(onlineJoins)}
              note="Livestream counts as present"
            />
            <Stat
              icon={<Users size={17} color="#B4B2C0" strokeWidth={1.8} />}
              label="Yet to arrive"
              value={String(Math.max(event.registered - totalIn, 0))}
              note="Registered but not present"
            />
          </Reveal>

          <div className="org-panels">
            <Reveal className="org-card">
              <div className="org-card__head">
                <h2 className="font-heading text-[15.5px] font-semibold">Check-in activity</h2>
                <span className="text-[12.5px] text-grey">Today</span>
              </div>
              <div className="org-card__body">
                <TrendChart
                  seriesLabel="Checked in"
                  tone="green"
                  points={CHECKIN_CURVE.map((point) => ({ label: point.hour, value: point.count }))}
                />
              </div>
            </Reveal>

            <Reveal className="org-card" delay={60}>
              <div className="org-card__head">
                <h2 className="font-heading text-[15.5px] font-semibold">Recent check-ins</h2>
                <span className="text-[12.5px] text-grey">{recent.length} shown</span>
              </div>
              <div className="tm-checklist">
                {recent.map((row) => (
                  <div key={row.id} className="tm-checkrow">
                    <span className="tm-person__avatar">
                      <ImageSlot id={`tm-member-avatar-${row.id}`} shape="circle" placeholder="" interactive={false} />
                    </span>
                    <span>
                      <span className="org-table__title">{row.name}</span>
                      <span className="org-table__sub">
                        {passOf(event, row.passId)?.name} · {row.department}
                      </span>
                    </span>
                    <span className="tm-checkrow__time">{row.checkedInAt}</span>
                    <span className="org-pill org-pill--confirmed">Checked in</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal className="org-card" delay={120}>
            <div className="org-card__head">
              <h2 className="font-heading text-[15.5px] font-semibold">Check-in by session</h2>
              <span className="text-[12.5px] text-grey">Attendance is reported per session</span>
            </div>
            <div className="org-table-wrap">
              <table className="org-table tm-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Time</th>
                    <th className="org-table__num">Checked in</th>
                    <th className="org-table__num">Booked</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="tm-cell-main">
                        <span className="org-table__title">{session.title}</span>
                        <span className="org-table__sub">{session.room}</span>
                      </td>
                      <td>
                        {session.start} – {session.end}
                      </td>
                      <td className="org-table__num">{session.checkedIn}</td>
                      <td className="org-table__num">{session.booked}</td>
                      <td style={{ minWidth: 180 }}>
                        <Meter
                          value={session.checkedIn}
                          max={session.booked}
                          tone={session.checkedIn === 0 ? 'amber' : 'green'}
                        />
                        <span className="org-table__sub">
                          {session.booked ? Math.round((session.checkedIn / session.booked) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        <aside className="tm-aside tm-aside--static">
          <div className="tm-aside__body">
            <div className="tm-asection__head" style={{ marginBottom: 12 }}>
              <h3>Live QR scanner</h3>
              <span className="tm-dot is-green" />
            </div>

            <div className="tm-scanner">
              <ImageSlot id="tm-scanner" shape="rounded" radius={14} placeholder="QR scanner view" interactive={false} />
              <div className="tm-scanner__hint">
                <strong>Scan a member pass</strong>
                <span>Align the QR inside the frame</span>
              </div>
            </div>

            <Button as="button" variant="primary" block onClick={simulate} style={{ marginTop: 12 }}>
              <CheckCircle size={17} strokeWidth={1.9} />
              Simulate a scan
            </Button>

            <section className="mb-[22px]" style={{ marginTop: 20 }}>
              <div className="tm-asection__head">
                <h3>Scanner statistics</h3>
                <span className="text-[12.5px] text-grey">Today</span>
              </div>
              {SCANNER_STATS.map((stat) => (
                <div key={stat.label} className="tm-arow">
                  <span>{stat.label}</span>
                  <strong className={`tm-tone-${stat.tone}`}>
                    {stat.label === 'Successful' ? scans : stat.value}
                  </strong>
                </div>
              ))}
            </section>

            <div className="tm-okbox">
              <ShieldCheck size={16} color="#16A34A" strokeWidth={1.9} />
              <div>
                <strong>Check-in is running smoothly</strong>
                <p>Scans work offline and sync when the connection returns.</p>
              </div>
            </div>

            <div className="tm-tipbox">
              <Bulb size={16} color="#EA8C00" strokeWidth={1.9} />
              <div>
                <strong>Tip</strong>
                <p>
                  A pass belongs to one employee ID. If someone hands over a colleague's QR the scanner rejects it —
                  that is what "not on the list" counts.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="org-stat">
      <div className="org-stat__head">
        <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none bg-brand-tint-strong">{icon}</span>
        <span className="text-[12.5px] text-grey font-medium leading-[1.35]">{label}</span>
      </div>
      <div className="org-stat__value">{value}</div>
      <div className="org-stat__note">{note}</div>
    </div>
  );
}
