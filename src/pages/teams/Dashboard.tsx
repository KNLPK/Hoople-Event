import { Link, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowRight,
  Calendar,
  Card,
  CheckCircle,
  Copy,
  Doc,
  Eye,
  IdCard,
  Layers,
  Lock,
  MapPin,
  Pencil,
  Share,
  Ticket,
  Trash,
  Trend,
  Users,
} from '@/components/ui/icons';
import { FormatIcon, statusTone } from '@/components/teams/EventContext';
import { Meter, TrendChart } from '@/components/ui/charts';
import {
  ACTIVITY,
  ORGANIZATION,
  REGISTRATION_TREND,
  collected,
  funnel,
  onsiteRegistrations,
  sessionsFor,
  type TeamEvent,
} from '@/data/teams';
import { compactDate, rupiah } from '@/lib/format';
import { copyText } from '@/lib/clipboard';

const TODAY = { registrations: 12, collected: 3_250_000, checkins: 28 };

export function TeamsDashboard() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const gross = collected(event);
  const invited = funnel(event)[0].count;
  const responseRate = Math.round((event.registered / invited) * 1000) / 10;
  const turnout = Math.round((event.checkedIn / Math.max(event.registered, 1)) * 1000) / 10;
  const sessions = sessionsFor(event.id);
  const upcoming = sessions.filter((session) => session.state !== 'Ended').slice(0, 3);
  const memberLink = `hoople.id/w/${ORGANIZATION.handle}/e/${event.slug}`;

  return (
    <div className="tm-cols">
      <div className="flex flex-col" style={{ gap: 18 }}>
        <Reveal className="org-card tm-hero">
          <div className="tm-hero__media">
            <ImageSlot id={`tm-cover-${event.id}`} shape="rounded" radius={14} placeholder={event.photoHint} />
            <span className={`org-pill org-pill--${statusTone(event.status)} tm-hero__badge`}>{event.status}</span>
          </div>

          <div className="py-[18px] px-5 min-w-0">
            <div className="tm-ctx__title">
              <h2>{event.title}</h2>
              <span className="tm-private">
                <Lock size={12} color="#5B21F5" strokeWidth={2} />
                Members only
              </span>
            </div>

            <div className="tm-ctx__meta">
              <span>
                <FormatIcon format={event.format} />
                {event.format} event
              </span>
              <span>
                <Calendar size={15} color="#6B6A7B" strokeWidth={1.9} />
                {event.dateLabel}
              </span>
              <span>
                <MapPin size={15} color="#6B6A7B" strokeWidth={1.9} />
                {event.venue}
              </span>
            </div>

            <div className="text-[12px] text-grey-soft mt-2.5">
              Created on {compactDate(event.createdOn)} · Event ID #{event.code} · Organised by {event.organiser}
            </div>

            <div className="tm-hero__kpis">
              <div>
                <span className="block text-[11.5px] font-semibold text-grey mb-1.5">Registered</span>
                <strong className="tm-kpi__value">
                  {event.registered} <em>/ {event.capacity}</em>
                </strong>
                <Meter value={event.registered} max={event.capacity} />
              </div>
              <div>
                <span className="block text-[11.5px] font-semibold text-grey mb-1.5">Collected</span>
                <strong className="tm-kpi__value tm-kpi__value--money">{rupiah(gross)}</strong>
                <span className="tm-kpi__note">
                  {event.costModel === 'Company-paid' ? 'Paid by the company' : 'Contributed by members'}
                </span>
              </div>
              <div>
                <span className="block text-[11.5px] font-semibold text-grey mb-1.5">Checked in</span>
                <strong className="tm-kpi__value">{event.checkedIn}</strong>
                <span className="tm-kpi__note is-up">{turnout}% turnout</span>
              </div>
              <div>
                <span className="block text-[11.5px] font-semibold text-grey mb-1.5">Response rate</span>
                <strong className="tm-kpi__value">{responseRate}%</strong>
                <span className="tm-kpi__note">of {invited} invited</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <h2 className="font-heading text-[17px] font-semibold tracking-[-0.015em] mb-3">Overview</h2>
          <Reveal className="org-stats org-stats--4">
            <StatCard
              icon={<Users size={17} color="#6D28FF" strokeWidth={1.8} />}
              label="Today's registrations"
              value={String(TODAY.registrations)}
              note="↑ 20% vs yesterday"
              up
            />
            <StatCard
              icon={<Card size={17} color="#16A34A" strokeWidth={1.8} />}
              label="Today's contributions"
              value={rupiah(TODAY.collected)}
              note="↑ 15% vs yesterday"
              money
              up
            />
            <StatCard
              icon={<CheckCircle size={17} color="#6D28FF" strokeWidth={1.8} />}
              label="Today's check-in"
              value={String(TODAY.checkins)}
              note="Main Ballroom door"
            />
            <StatCard
              icon={<Ticket size={17} color="#EA8C00" strokeWidth={1.8} />}
              label="Seats taken"
              value={String(onsiteRegistrations(event))}
              note={`${Math.round((onsiteRegistrations(event) / event.capacity) * 100)}% of ${event.capacity} onsite`}
            />
          </Reveal>
        </div>

        <div className="org-panels">
          <Reveal className="org-card">
            <div className="org-card__head">
              <h2 className="font-heading text-[15.5px] font-semibold">Registration trend</h2>
              <span className="text-[12.5px] text-grey">Last 7 days</span>
            </div>
            <div className="org-card__body">
              <TrendChart
                seriesLabel="Registrations"
                previousLabel="Previous 7 days"
                points={REGISTRATION_TREND.map((day) => ({
                  label: day.day,
                  value: day.count,
                  previous: day.previous,
                }))}
              />
            </div>
            <div className="org-card__foot">
              <Link to={`/teams/analytics?e=${event.id}`} className="tm-cardlink">
                View full analytics <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <Reveal className="org-card" delay={60}>
            <div className="org-card__head">
              <h2 className="font-heading text-[15.5px] font-semibold">Upcoming sessions</h2>
              <Link to={`/teams/sessions?e=${event.id}`} className="tm-cardlink">
                View all
              </Link>
            </div>
            <div className="tm-sesslist">
              {upcoming.length ? (
                upcoming.map((session) => (
                  <div key={session.id} className="tm-sessrow">
                    <span className="tm-sessrow__time">
                      {session.start}
                      <em>–</em>
                      {session.end}
                    </span>
                    <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                      <span className="flex items-center gap-2 flex-wrap text-[14px] font-semibold">{session.title}</span>
                      <span className="text-[12px] text-grey">{session.room}</span>
                      <span className="tm-sessrow__fill">
                        <Meter value={session.booked} max={session.capacity} />
                        <em>
                          {session.booked} / {session.capacity} booked
                        </em>
                      </span>
                    </span>
                    <span className={`org-pill org-pill--${session.state === 'Ongoing' ? 'live' : 'upcoming'}`}>
                      {session.state}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <div className="font-heading text-[17px] font-semibold mb-1.5">No sessions yet</div>
                  <p className="text-[13.5px] text-grey mb-[18px]">Add the running order and members can pick what to attend.</p>
                </div>
              )}
            </div>
            <div className="org-card__foot">
              <Link to={`/teams/sessions?e=${event.id}`} className="tm-cardlink">
                Manage sessions <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal className="org-card" delay={120}>
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">
              <span className="tm-actdot">
                <Pencil size={15} color="#6D28FF" strokeWidth={1.9} />
              </span>
              Recent activity
            </h2>
            <button type="button" className="tm-cardlink" onClick={() => toast('Full activity log is coming soon')}>
              View all activity <ArrowRight size={15} />
            </button>
          </div>
          <div className="tm-activity">
            {ACTIVITY.map((item) => (
              <div key={item.id} className="tm-activity__item">
                <span className={`tm-activity__icon is-${item.kind}`}>
                  {item.kind === 'registration' ? (
                    <Users size={16} strokeWidth={1.9} />
                  ) : item.kind === 'payment' ? (
                    <Ticket size={16} strokeWidth={1.9} />
                  ) : item.kind === 'checkin' ? (
                    <CheckCircle size={16} strokeWidth={1.9} />
                  ) : (
                    <Pencil size={16} strokeWidth={1.9} />
                  )}
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{item.title}</span>
                  <span className="block text-[12.5px] text-ink-3 mt-0.5">{item.detail}</span>
                  <span className="block text-[11.5px] text-grey-soft mt-1">{item.when}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <aside className="flex flex-col min-w-0" style={{ gap: 18 }}>
        <Reveal className="org-card">
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">Quick actions</h2>
          </div>
          <div className="tm-quick">
            <Link to={`/teams/experiences?e=${event.id}`} className="tm-quick__item">
              <Pencil size={16} color="#5C5B6B" strokeWidth={1.9} />
              Edit experience
            </Link>
            <Link to={`/teams/orders?e=${event.id}`} className="tm-quick__item">
              <Ticket size={16} color="#5C5B6B" strokeWidth={1.9} />
              Manage passes
            </Link>
            <Link to={`/teams/sessions?e=${event.id}`} className="tm-quick__item">
              <Layers size={16} color="#5C5B6B" strokeWidth={1.9} />
              Manage sessions
            </Link>
            <Link to={`/teams/registrations?e=${event.id}`} className="tm-quick__item">
              <IdCard size={16} color="#5C5B6B" strokeWidth={1.9} />
              View registrations
            </Link>
            <button type="button" className="tm-quick__item" onClick={() => toast(`Duplicated ${event.title}`)}>
              <Doc size={16} color="#5C5B6B" strokeWidth={1.9} />
              Duplicate experience
            </button>
            <button
              type="button"
              className="tm-quick__item is-danger"
              onClick={() => toast(`${event.title} archived — members can no longer register`)}
            >
              <Trash size={16} color="#E11D48" strokeWidth={1.9} />
              Archive experience
            </button>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">Member link</h2>
          </div>
          <div className="org-card__body">
            <p className="text-[12.5px] text-grey" style={{ lineHeight: 1.65, marginBottom: 12 }}>
              Share this inside the company. Opening it asks for a{' '}
              <strong>@{ORGANIZATION.domain}</strong> sign-in — there is no public page for this event.
            </p>
            <div className="tm-link">{memberLink}</div>
            <div className="flex items-center" style={{ gap: 8, marginTop: 10 }}>
              <Button
                as="button"
                variant="outline"
                size="sm"
                block
                onClick={() => {
                  void copyText(`https://${memberLink}`);
                  toast('Member link copied');
                }}
              >
                <Copy size={15} strokeWidth={1.9} />
                Copy link
              </Button>
              <Button as="button" variant="neutral" size="sm" onClick={() => toast('Preview opens the member view')}>
                <Eye size={15} strokeWidth={1.9} />
              </Button>
              <Button as="button" variant="neutral" size="sm" onClick={() => toast('Shared to the #general channel')}>
                <Share size={15} strokeWidth={1.9} />
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={120}>
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">Event status</h2>
          </div>
          <div className="tm-statuslist">
            <StatusRow label="Event status" value={event.status} pill={statusTone(event.status)} />
            <StatusRow label="Visibility" value="Members only" icon={<Lock size={13} color="#5B21F5" strokeWidth={2} />} />
            <StatusRow label="Audience" value={event.audience.join(', ')} />
            <StatusRow label="Registration" value={event.status === 'Ended' ? 'Closed' : 'Open'} dot="green" />
            <StatusRow label="Check-in" value={event.status === 'Ongoing' ? 'Active' : 'Not started'} dot="green" />
            <StatusRow
              label="Settlement"
              value={event.costModel === 'Cost-shared' ? 'Upcoming' : 'Nothing to settle'}
              dot="grey"
            />
          </div>
          <div className="org-card__foot">
            <Link to={`/teams/payments?e=${event.id}`} className="tm-cardlink">
              View details <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        <Reveal className="org-card tm-tip" delay={180}>
          <div className="org-card__body">
            <div className="flex items-center" style={{ gap: 8, marginBottom: 8, fontWeight: 600, fontSize: 13.5 }}>
              <Trend size={16} color="#6D28FF" strokeWidth={1.9} />
              Response is {responseRate}%
            </div>
            <p className="text-[12.5px] text-grey" style={{ lineHeight: 1.65 }}>
              {invited - event.registered} members have not answered yet. A reminder to the departments with the
              lowest response usually moves it more than one to everybody.
            </p>
            <Button
              as="button"
              variant="outline"
              size="sm"
              block
              onClick={() => toast('Reminder queued for 318 members')}
              style={{ marginTop: 12 }}
            >
              Send a reminder
            </Button>
          </div>
        </Reveal>
      </aside>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  money,
  up,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  money?: boolean;
  up?: boolean;
}) {
  return (
    <div className="org-stat">
      <div className="org-stat__head">
        <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none bg-brand-tint-strong">{icon}</span>
        <span className="text-[12.5px] text-grey font-medium leading-[1.35]">{label}</span>
      </div>
      <div className={`org-stat__value ${money ? 'org-stat__value--money' : ''}`.trim()}>{value}</div>
      <div className={`org-stat__note ${up ? 'is-up' : ''}`.trim()}>{note}</div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  pill,
  dot,
  icon,
}: {
  label: string;
  value: string;
  pill?: string;
  dot?: 'green' | 'grey';
  icon?: React.ReactNode;
}) {
  return (
    <div className="tm-statusrow">
      <span>{label}</span>
      {pill ? (
        <span className={`org-pill org-pill--${pill}`}>{value}</span>
      ) : (
        <strong>
          {icon}
          {dot ? <i className={`tm-dot is-${dot}`} /> : null}
          {value}
        </strong>
      )}
    </div>
  );
}
