import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowRight,
  Calendar,
  Chart,
  ChevronRight,
  Clock,
  Close,
  Layers,
  MapPin,
  Recurring,
  Ticket,
  Trend,
  Users,
  Wallet,
} from '@/components/ui/icons';
import { ORG_EXPERIENCES, ORG_REGISTRATIONS, ORG_STATS, WORKSPACE, type OrgStat } from '@/data/organizer';
import { compactDate } from '@/lib/format';

const STAT_ICON: Record<OrgStat['icon'], typeof Layers> = {
  experiences: Layers,
  events: Calendar,
  activities: Recurring,
  registrations: Users,
  revenue: Wallet,
  sessions: Clock,
};

const QUICK_ACTIONS = [
  { title: 'Create Event', sub: 'One-time event', to: '/organizer/create/event', Icon: Calendar, tone: '', colour: '#6D28FF' },
  { title: 'Create Activity', sub: 'Recurring sessions', to: '/organizer/create/activity', Icon: Recurring, tone: 'quick-action__icon--pink', colour: '#DB2777' },
  { title: 'View Registrations', sub: 'See all registrations', to: '/organizer/registrations', Icon: Users, tone: 'quick-action__icon--amber', colour: '#EA8C00' },
  { title: 'View Analytics', sub: 'Check your insights', to: '/organizer/analytics', Icon: Chart, tone: 'quick-action__icon--blue', colour: '#2563EB' },
];

export function OrgDashboard() {
  const toast = useToast();
  const [reminderOpen, setReminderOpen] = useState(true);

  const upcoming = ORG_EXPERIENCES.filter((item) => item.lifecycle === 'Upcoming').slice(0, 3);
  const recent = ORG_REGISTRATIONS.slice(0, 5);

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Greeting + quick actions */}
      <Reveal className="org-greeting">
        <div>
          <h1>Good morning, {WORKSPACE.name}! 👋</h1>
          <p className="org-greeting__lede">Here's what's happening with your experiences today.</p>

          <div className="org-greeting__label">Quick Actions</div>
          <div className="quick-actions">
            {QUICK_ACTIONS.map(({ title, sub, to, Icon, tone, colour }) => (
              <Link key={title} to={to} className="quick-action lift">
                <span className={`quick-action__icon ${tone}`.trim()}>
                  <Icon size={19} color={colour} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="quick-action__title">{title}</span>
                  <span className="quick-action__sub">{sub}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="org-greeting__more">
            <Link to="/organizer/experiences" className="link-more">
              More Actions
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div className="org-greeting__art float">
          <ImageSlot id="org-mascot" shape="rounded" radius={16} placeholder="Hoople mascot" />
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal className="org-stats" delay={60}>
        {ORG_STATS.map((stat) => {
          const Icon = STAT_ICON[stat.icon];
          return (
            <div key={stat.key} className="org-stat">
              <div className="org-stat__head">
                <span className="org-stat__icon">
                  <Icon size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <span className="org-stat__label">{stat.label}</span>
              </div>
              <div
                className={`org-stat__value ${stat.icon === 'revenue' ? 'org-stat__value--money' : ''}`.trim()}
              >
                {stat.value}
              </div>
              {stat.delta ? (
                <div className="org-stat__delta">
                  <Trend size={13} color="#16A34A" strokeWidth={2} />
                  {stat.delta}
                </div>
              ) : null}
              {stat.note ? <div className="org-stat__note">{stat.note}</div> : null}
            </div>
          );
        })}
      </Reveal>

      {/* Upcoming + recent */}
      <Reveal className="org-panels" delay={120}>
        <section className="org-card">
          <div className="org-card__head">
            <h2 className="org-card__title">Upcoming Experiences</h2>
            <Link to="/organizer/sessions" className="link-more" style={{ fontSize: 13 }}>
              View all
            </Link>
          </div>

          {upcoming.map((experience) => (
            <Link key={experience.id} to="/organizer/registrations" className="org-exp-row">
              <div className="org-exp-row__media zoom">
                <ImageSlot
                  id={`org-exp-${experience.id}`}
                  shape="rounded"
                  radius={10}
                  placeholder={experience.photoHint}
                />
              </div>

              <span className={`org-pill org-pill--${experience.kind.toLowerCase()}`}>
                {experience.kind === 'EVENT' ? 'Event' : 'Activity'}
              </span>

              <div>
                <div className="org-exp-row__title">{experience.title}</div>
                <div className="org-exp-row__meta">
                  <span>
                    <Calendar size={13} color="#8B8A99" strokeWidth={1.9} />
                    {compactDate(experience.date)} · {experience.start} - {experience.end}
                  </span>
                  <span>
                    <MapPin size={13} color="#8B8A99" strokeWidth={1.9} />
                    {experience.venue}
                  </span>
                </div>
              </div>

              <div className="org-exp-row__count">
                <strong>
                  {experience.registered} / {experience.capacity}
                </strong>
                <span>Registered</span>
              </div>

              <ChevronRight size={16} color="#B4B2C0" strokeWidth={2} />
            </Link>
          ))}

          <div className="org-card__foot">
            <Button as="link" to="/organizer/sessions" variant="neutral" block>
              View all upcoming experiences
              <ArrowRight size={15} strokeWidth={2} />
            </Button>
          </div>
        </section>

        <section className="org-card">
          <div className="org-card__head">
            <h2 className="org-card__title">Recent Registrations</h2>
            <Link to="/organizer/registrations" className="link-more" style={{ fontSize: 13 }}>
              View all
            </Link>
          </div>

          {recent.map((registration) => (
            <div key={registration.id} className="org-reg-row">
              <span className="org-reg-row__avatar">
                <ImageSlot
                  id={`org-reg-${registration.id}`}
                  shape="circle"
                  placeholder=""
                  interactive={false}
                />
              </span>
              <div>
                <div className="org-reg-row__name">{registration.name}</div>
                <div className="org-reg-row__exp">{registration.experience}</div>
              </div>
              <span className={`org-pill org-pill--${registration.status.toLowerCase()}`}>
                {registration.status}
              </span>
              <div className="org-reg-row__when">
                {compactDate(registration.date)}
                <br />
                {registration.time}
              </div>
            </div>
          ))}

          <div className="org-card__foot">
            <Button as="link" to="/organizer/registrations" variant="neutral" block>
              View all registrations
              <ArrowRight size={15} strokeWidth={2} />
            </Button>
          </div>
        </section>
      </Reveal>

      {/* Calendar reminder */}
      {reminderOpen ? (
        <Reveal className="org-reminder" delay={180}>
          <div className="org-reminder__art float">
            <ImageSlot id="org-reminder-art" shape="rounded" radius={12} placeholder="Mascot + calendar" />
          </div>
          <div>
            <div className="org-reminder__title">Don't miss a session!</div>
            <p className="org-reminder__body">
              Connect your calendar and get reminders for upcoming sessions and important updates.
            </p>
          </div>
          <Button
            as="button"
            variant="white"
            onClick={() => toast('Calendar connected — reminders are on')}
          >
            <Ticket size={16} strokeWidth={1.8} />
            Connect Calendar
          </Button>
          <button
            type="button"
            className="org-reminder__close"
            onClick={() => setReminderOpen(false)}
            aria-label="Dismiss reminder"
          >
            <Close size={16} color="#5C5B6B" />
          </button>
        </Reveal>
      ) : null}
    </div>
  );
}
