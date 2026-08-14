import { EventHead, type EventSectionProps } from './shared';
import { useToast } from '@/components/ui/Toast';
import {
  Calendar,
  CalendarDots,
  ChevronRight,
  Doc,
  Eye,
  Mail,
  MapPin,
  Phone,
  Ticket,
  Users,
} from '@/components/ui/icons';
import {
  timedSessions,
  timezoneShort,
} from '@/data/eventBuilder';
import { compactDate, rupiah } from '@/lib/format';

/** 5.1 — everything the organizer built, in one glance, before it goes live. */
export function EventReview({ draft, goTo }: EventSectionProps) {
  const toast = useToast();

  const schedule = timedSessions(draft);
  const zone = timezoneShort(draft.timezone);
  const last = schedule[schedule.length - 1];
  const live = draft.tickets.filter((ticket) => ticket.active);

  return (
    <>
      <EventHead
        title="5.1 Review Summary"
        badge="Part 1 of 3"
        lede="Please review all the information below. You can go back and edit any section if needed."
        tip="Read it as a participant would. Anything unclear here will be unclear on the event page."
      />

      <div className="wiz-stack">
        <div className="evt-review__top">
          <button
            type="button"
            className="wiz-addsession"
            onClick={() => goTo(5, 2)}
          >
            <Eye size={14} color="#6D28FF" strokeWidth={1.9} />
            Preview as Attendee
          </button>
        </div>

        <section className="org-card wiz-panel evt-review">
          <ReviewRow
            index="01"
            Icon={Doc}
            tone="violet"
            title="Basic Information"
            onEdit={() => goTo(1, 0)}
            fields={[
              { label: 'Event Title', value: draft.title || 'Not set yet' },
              { label: 'Category', value: [draft.theme, draft.category].filter(Boolean).join('\n') },
              { label: 'Description', value: draft.summary || 'Not set yet' },
            ]}
          />

          <ReviewRow
            index="02"
            Icon={MapPin}
            tone="green"
            title={draft.eventType === 'Online' ? 'Date & Setup' : 'Date & Location'}
            onEdit={() => goTo(2, 0)}
            fields={[
              { label: 'Date', value: compactDate(draft.startDate) },
              {
                label: 'Time',
                value: draft.allDay ? 'All day' : `${draft.startTime} - ${draft.endTime} ${zone}`,
              },
              { label: 'Timezone', value: draft.timezone },
              {
                label: draft.eventType === 'Online' ? 'Platform' : 'Venue',
                value:
                  draft.eventType === 'Online'
                    ? `${draft.platform}\n${draft.meetingUrl}`
                    : `${draft.venueName}\n${draft.address}`,
              },
            ]}
          />

          <ReviewRow
            index="03"
            Icon={CalendarDots}
            tone="blue"
            title="Event Schedule"
            onEdit={() => goTo(2, 2)}
            action={{ label: 'View Full Schedule', onClick: () => goTo(2, 2) }}
            fields={[
              { label: 'Total Sessions', value: `${draft.sessions.length} Sessions` },
              { label: 'Start Time', value: `${draft.startTime} ${zone}` },
              { label: 'End Time', value: `${last?.end ?? draft.endTime} ${zone}` },
            ]}
          />

          <ReviewRow
            index="04"
            Icon={Ticket}
            tone="amber"
            title="Ticket Setup"
            onEdit={() => goTo(3, 0)}
            action={{ label: 'View Ticket Types', onClick: () => goTo(3, 0) }}
            fields={[
              { label: 'Total Ticket Types', value: `${live.length} Types` },
              {
                label: 'Sales Period',
                value: `${compactDate(draft.salesStart)} - ${
                  draft.salesEnd ? compactDate(draft.salesEnd) : 'until the event'
                }`,
              },
              { label: 'Currency', value: draft.currency },
            ]}
          >
            <div className="evt-review__tickets">
              {live.map((ticket) => (
                <span key={ticket.id}>
                  <i style={{ background: draft.brandColor }} />
                  {ticket.name}
                  <strong>{ticket.price === 0 ? 'Free' : rupiah(ticket.price)}</strong>
                </span>
              ))}
            </div>
          </ReviewRow>

          <ReviewRow
            index="05"
            Icon={Users}
            tone="pink"
            title="Brand & Host"
            onEdit={() => goTo(4, 0)}
            fields={[
              { label: 'Host', value: `${draft.hostName}\n${draft.hostType}` },
              { label: 'Brand Colors', value: '' },
              { label: 'Host Contact', value: '' },
            ]}
          >
            <div className="evt-review__brand">
              <div>
                <span className="evt-review__label">Brand Colors</span>
                <span className="evt-swatches evt-swatches--read">
                  <i style={{ background: draft.brandColor }} />
                  <i style={{ background: '#12121A' }} />
                  <i style={{ background: '#2563EB' }} />
                  <i style={{ background: '#0E9F87' }} />
                  <i style={{ background: '#EC4899' }} />
                  <i style={{ background: '#F97316' }} />
                </span>
              </div>
              <div>
                <span className="evt-review__label">Host Contact</span>
                <span className="evt-review__contact">
                  <Mail size={13} color="#8B8A99" strokeWidth={1.9} />
                  {draft.contactEmail}
                </span>
                {draft.contactPhone ? (
                  <span className="evt-review__contact">
                    <Phone size={13} color="#8B8A99" strokeWidth={1.9} />
                    {draft.contactPhone}
                  </span>
                ) : null}
              </div>
            </div>
          </ReviewRow>
        </section>

        <div className="wiz-note">
          <span className="wiz-note__icon">
            <Calendar size={16} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            Every <strong>Edit</strong> here jumps straight back to the section that owns the field,
            so nothing has to be re-entered.{' '}
            <button
              type="button"
              className="evt-linkbtn"
              onClick={() => toast('Nothing is published until you press Publish Event Now')}
            >
              What happens when I publish?
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

interface ReviewField {
  label: string;
  value: string;
}

function ReviewRow({
  index,
  Icon,
  tone,
  title,
  fields,
  onEdit,
  action,
  children,
}: {
  index: string;
  Icon: typeof Doc;
  tone: string;
  title: string;
  fields: ReviewField[];
  onEdit: () => void;
  action?: { label: string; onClick: () => void };
  children?: React.ReactNode;
}) {
  return (
    <div className="evt-rv">
      <span className={`evt-rv__icon evt-tl__icon--${tone}`}>
        <Icon size={17} color="#6D28FF" strokeWidth={1.8} />
      </span>

      <div className="evt-rv__body">
        <div className="evt-rv__head">
          <span className="evt-rv__index">{index}</span>
          <strong>{title}</strong>
          {action ? (
            <button type="button" className="wiz-addsession evt-rv__action" onClick={action.onClick}>
              {action.label}
            </button>
          ) : null}
          <button type="button" className="evt-rv__edit" onClick={onEdit}>
            Edit
            <ChevronRight size={14} color="#6D28FF" strokeWidth={2} />
          </button>
        </div>

        <div className="evt-rv__fields">
          {fields
            .filter((field) => field.value !== '')
            .map((field) => (
              <div key={field.label}>
                <span className="evt-review__label">{field.label}</span>
                <p>{field.value}</p>
              </div>
            ))}
        </div>

        {children}
      </div>
    </div>
  );
}
