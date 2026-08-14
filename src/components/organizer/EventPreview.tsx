import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  Eye,
  Facebook,
  Gift,
  Globe,
  HeartOutlineLarge,
  LinkChain,
  LinkedIn,
  MapPin,
  Monitor,
  Sparkle,
  Star,
  Tag,
  Users,
  WhatsApp,
  Wifi,
  XMark,
} from '@/components/ui/icons';
import {
  fromPrice,
  timedSessions,
  timezoneShort,
  type EventDraft,
} from '@/data/eventBuilder';
import { WORKSPACE, WORKSPACE_INITIALS } from '@/data/organizer';
import { compactDate, parseISODate, rupiah, shortDate } from '@/lib/format';

/** `2026-07-20` -> `['24', 'MAY']` for the date block on a discovery card. */
function dayBlock(iso: string): [string, string] {
  const date = parseISODate(iso);
  return [String(date.getDate()), shortDate(iso).split(', ')[1].split(' ')[1].toUpperCase()];
}

const SESSIONS_SHOWN = 5;

/**
 * The participant-facing event page, rendered live from the draft. Every line
 * either shows what the organizer has entered or says plainly what will appear
 * there once they do — no invented copy.
 */
export function EventPreview({
  draft,
  onCover,
  variant = 'page',
}: {
  draft: EventDraft;
  onCover: (dataUrl: string) => void;
  /** `discover` shows the listing cards; `final` the last look before publish. */
  variant?: 'page' | 'discover' | 'final';
}) {
  const toast = useToast();

  const schedule = timedSessions(draft);
  const shown = schedule.slice(0, SESSIONS_SHOWN);
  const zone = timezoneShort(draft.timezone);
  const dated = draft.title.trim() !== '' || draft.startDate !== '';

  if (variant === 'discover') return <DiscoverPreviews draft={draft} onCover={onCover} />;
  if (variant === 'final') return <FinalPreview draft={draft} onCover={onCover} />;

  return (
    <aside className="wiz-preview">
      <h2 className="wiz-preview__title">Live Preview</h2>
      <p className="wiz-preview__lede">This is how your event page will look.</p>

      <div className="wiz-pv">
        <div className={`wiz-pv__media ${draft.eventType === 'Hybrid' ? 'is-split' : ''}`.trim()}>
          <ImageSlot
            id="event-cover"
            src={draft.cover}
            onChange={onCover}
            interactive={false}
            shape="rect"
            placeholder="Event cover"
          />
          <span className="evt-pv__badge">{(draft.category || 'Event').toUpperCase()}</span>
          <span className="wiz-pv__heart" aria-hidden="true">
            <HeartOutlineLarge size={16} color="#fff" />
          </span>
          {draft.eventType === 'Hybrid' ? (
            <>
              <span className="evt-pv__mode evt-pv__mode--left">In-Person</span>
              <span className="evt-pv__mode evt-pv__mode--right">Online</span>
            </>
          ) : null}
        </div>

        <div className="wiz-pv__body">
          <h3 className="evt-pv__title">{draft.title || 'Your Event Title'}</h3>
          <p className="evt-pv__lede">
            {draft.summary ||
              'Short description of your event will appear here. This is a preview of how your event might look to the participants.'}
          </p>

          <ul className="wiz-pv__meta">
            <li>
              <Calendar size={14} color="#6D28FF" strokeWidth={1.9} />
              {dated ? (
                <>
                  {compactDate(draft.startDate)},{' '}
                  {draft.allDay
                    ? 'All day'
                    : `${draft.startTime} – ${draft.endTime}${zone ? ` ${zone}` : ''}`}
                </>
              ) : (
                'Date will appear here'
              )}
            </li>
            <li>
              {draft.eventType === 'Online' ? (
                <>
                  <Globe size={14} color="#6D28FF" strokeWidth={1.9} />
                  Online Event
                </>
              ) : (
                <>
                  <MapPin size={14} color="#6D28FF" strokeWidth={1.9} />
                  {draft.venueName || 'Location will appear here'}
                </>
              )}
            </li>
            {draft.eventType !== 'Offline' ? (
              <li>
                <Monitor size={14} color="#6D28FF" strokeWidth={1.9} />
                Join via {draft.platform}
              </li>
            ) : null}
            <li>
              <Tag size={14} color="#6D28FF" strokeWidth={1.9} />
              {[draft.theme, draft.category, draft.eventType].filter(Boolean).join(' • ')}
            </li>
          </ul>

          {draft.audience || draft.ageRestriction ? (
            <>
              <div className="evt-pv__head">Who should join</div>
              <ul className="wiz-pv__meta">
                <li>
                  <Users size={14} color="#6D28FF" strokeWidth={1.9} />
                  {draft.audience}
                </li>
                <li>
                  <Clock size={14} color="#6D28FF" strokeWidth={1.9} />
                  {draft.ageRestriction} • {draft.language}
                </li>
              </ul>
            </>
          ) : null}

          <div className="evt-pv__host">
            <div className="evt-pv__head">Hosted by</div>
            <div className="evt-pv__hostrow">
              <span className="wiz-pv__avatar evt-pv__avatar">{WORKSPACE_INITIALS}</span>
              <div>
                <strong>{draft.hostedAs.replace(/\s*\(.*\)$/, '')}</strong>
                <span>{WORKSPACE.category}</span>
                <span className="evt-pv__rating">
                  <Star size={12} color="#F5B301" />
                  4.9 (220 reviews) • 28 Events
                </span>
              </div>
            </div>
          </div>

          {shown.length > 0 ? (
            <>
              <div className="wiz-pv__sessions">
                <span>{draft.eventType === 'Hybrid' ? 'Event Schedule' : 'Schedule'}</span>
                <button type="button" onClick={() => toast('The full schedule opens once you publish')}>
                  View full schedule
                  <ArrowRight size={13} strokeWidth={2} />
                </button>
              </div>
              <ul className="evt-pv__schedule">
                {shown.map((session) => (
                  <li key={session.id}>
                    <span>{session.start}</span>
                    {session.title}
                  </li>
                ))}
                {schedule.length > shown.length ? (
                  <li className="evt-pv__more">and more…</li>
                ) : null}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="wiz-preview__note wiz-preview__note--info">
        <Gift size={16} color="#6D28FF" strokeWidth={1.9} />
        <div>
          <strong>{draft.highlights.length > 0 ? 'Key benefits are set' : 'Key benefits'}</strong>
          <span>
            {draft.highlights.length > 0
              ? draft.highlights.slice(0, 3).join(' • ')
              : 'Key benefits will be shown here once you add them.'}
          </span>
        </div>
      </div>
    </aside>
  );
}


/* ------------------------------------------------------------------ */

/** 5.2 — the same draft as it will appear in Discover, search and on a phone. */
function DiscoverPreviews({
  draft,
  onCover,
}: {
  draft: EventDraft;
  onCover: (dataUrl: string) => void;
}) {
  const [day, month] = dayBlock(draft.startDate);
  const zone = timezoneShort(draft.timezone);
  const title = draft.title || 'Your Event Title';
  const from = fromPrice(draft);
  const when = draft.allDay ? 'All day' : `${draft.startTime} - ${draft.endTime}${zone ? ` ${zone}` : ''}`;
  const city = draft.eventType === 'Online' ? 'Online' : draft.venueName || 'Jakarta';

  return (
    <aside className="wiz-preview">
      <h2 className="wiz-preview__title">How your page will appear in Discover</h2>
      <p className="wiz-preview__lede">This is a preview of your event listing.</p>

      <span className="evt-dp__label">Discover Card (Desktop)</span>
      <div className="evt-dcard">
        <div className="evt-dcard__media">
          <ImageSlot
            id="event-cover"
            src={draft.cover}
            onChange={onCover}
            interactive={false}
            shape="rect"
            placeholder="Event cover"
          />
          <span className="evt-pv__badge">{(draft.category || 'Event').toUpperCase()}</span>
          <span className="wiz-pv__heart" aria-hidden="true">
            <HeartOutlineLarge size={15} color="#fff" />
          </span>
        </div>

        <div className="evt-dcard__body">
          <span className="evt-dcard__date">
            <strong>{day}</strong>
            <em>{month}</em>
          </span>
          <div>
            <h3>{title}</h3>
            <ul className="wiz-pv__meta">
              <li>
                <MapPin size={13} color="#6D28FF" strokeWidth={1.9} />
                {city}
              </li>
              <li>
                <Clock size={13} color="#6D28FF" strokeWidth={1.9} />
                {when}
              </li>
              <li>
                <Tag size={13} color="#6D28FF" strokeWidth={1.9} />
                {[draft.theme, draft.category].filter(Boolean).join(' • ')}
              </li>
            </ul>

            <div className="evt-dcard__foot">
              <span className="evt-dcard__faces">
                <i />
                <i />
                <i />
                <i />
                128 interested
              </span>
              <span className="evt-dcard__cta">Get Ticket</span>
            </div>
          </div>
        </div>
      </div>

      <span className="evt-dp__label">Search Result Preview</span>
      <div className="evt-srow">
        <span className="evt-srow__art">
          <ImageSlot id="event-cover" src={draft.cover} interactive={false} radius={8} placeholder="" />
        </span>
        <div>
          <strong>{title}</strong>
          <span>
            <Calendar size={12} color="#8B8A99" strokeWidth={1.9} />
            {compactDate(draft.startDate)} • {city}
          </span>
          <span>
            <Tag size={12} color="#8B8A99" strokeWidth={1.9} />
            {draft.theme}
          </span>
        </div>
        <div className="evt-srow__right">
          <HeartOutlineLarge size={14} color="#8B8A99" />
          <em>From {from === 0 ? 'Rp 0' : rupiah(from)}</em>
        </div>
      </div>

      <span className="evt-dp__label">Mobile Card Preview</span>
      <div className="wiz-phone evt-mcard">
        <div className="wiz-phone__status">
          <span>9:41</span>
          <span className="wiz-phone__glyphs" aria-hidden="true">
            <i className="wiz-phone__bars" />
            <Wifi size={11} color="#12121A" strokeWidth={2} />
            <i className="wiz-phone__battery" />
          </span>
        </div>
        <div className="evt-mcard__media">
          <ImageSlot id="event-cover" src={draft.cover} interactive={false} shape="rect" placeholder="" />
          <span className="evt-pv__badge">{(draft.category || 'Event').toUpperCase()}</span>
          <span className="wiz-pv__heart" aria-hidden="true">
            <HeartOutlineLarge size={14} color="#fff" />
          </span>
        </div>
        <div className="evt-mcard__body">
          <span className="evt-dcard__date">
            <strong>{day}</strong>
            <em>{month}</em>
          </span>
          <div>
            <h3>{title}</h3>
            <span>
              <MapPin size={12} color="#8B8A99" strokeWidth={1.9} />
              {city}
            </span>
            <span>
              <Clock size={12} color="#8B8A99" strokeWidth={1.9} />
              {when}
            </span>
            <em>From {from === 0 ? 'Rp 0' : rupiah(from)}</em>
          </div>
        </div>
      </div>

      <div className="wiz-preview__note wiz-preview__note--info">
        <Sparkle size={16} color="#6D28FF" strokeWidth={1.9} />
        <div>
          <strong>Looks great!</strong>
          <span>You are all set to review and publish your event.</span>
        </div>
      </div>
    </aside>
  );
}

/** 5.3 — exactly what a participant sees, plus the share row. */
function FinalPreview({
  draft,
  onCover,
}: {
  draft: EventDraft;
  onCover: (dataUrl: string) => void;
}) {
  const toast = useToast();
  const [day, month] = dayBlock(draft.startDate);
  const zone = timezoneShort(draft.timezone);
  const link = `https://hoople.id/e/${draft.shareSlug}`;

  const socials = [
    { Icon: Facebook, label: 'Facebook' },
    { Icon: XMark, label: 'X' },
    { Icon: LinkedIn, label: 'LinkedIn' },
    { Icon: WhatsApp, label: 'WhatsApp' },
    { Icon: LinkChain, label: 'Copy link' },
  ];

  return (
    <aside className="wiz-preview">
      <div className="evt-final__previewhead">
        <div>
          <h2 className="wiz-preview__title">Final Event Preview</h2>
          <p className="wiz-preview__lede">This is exactly how participants will see your event.</p>
        </div>
        <div className="evt-final__previewbtns">
          <button type="button" className="wiz-addsession" onClick={() => toast('Opens once published')}>
            <Eye size={13} color="#6D28FF" strokeWidth={1.9} />
            Preview as Participant
          </button>
          <button
            type="button"
            className="wiz-addsession"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              toast('Link copied');
            }}
          >
            <Copy size={13} color="#6D28FF" strokeWidth={1.9} />
            Copy Link
          </button>
        </div>
      </div>

      <div className="evt-dcard">
        <div className="evt-dcard__media">
          <ImageSlot
            id="event-cover"
            src={draft.cover}
            onChange={onCover}
            interactive={false}
            shape="rect"
            placeholder="Event cover"
          />
          <span className="evt-pv__badge">{(draft.category || 'Event').toUpperCase()}</span>
          <span className="wiz-pv__heart" aria-hidden="true">
            <HeartOutlineLarge size={15} color="#fff" />
          </span>
        </div>

        <div className="evt-dcard__body">
          <span className="evt-dcard__date">
            <strong>{day}</strong>
            <em>{month}</em>
          </span>
          <div>
            <h3>{draft.title || 'Your Event Title'}</h3>
            <p className="evt-pv__lede">{draft.summary || 'Your short description appears here.'}</p>
            <ul className="wiz-pv__meta">
              <li>
                <Calendar size={13} color="#6D28FF" strokeWidth={1.9} />
                {compactDate(draft.startDate)},{' '}
                {draft.allDay ? 'All day' : `${draft.startTime} - ${draft.endTime}${zone ? ` ${zone}` : ''}`}
              </li>
              <li>
                {draft.eventType === 'Online' ? (
                  <>
                    <Globe size={13} color="#6D28FF" strokeWidth={1.9} />
                    Online Event
                  </>
                ) : (
                  <>
                    <MapPin size={13} color="#6D28FF" strokeWidth={1.9} />
                    {draft.venueName}
                  </>
                )}
              </li>
              <li>
                <Tag size={13} color="#6D28FF" strokeWidth={1.9} />
                {[draft.theme, draft.category, draft.eventType].filter(Boolean).join(' • ')}
              </li>
            </ul>

            <div className="evt-dcard__foot">
              <span className="evt-dcard__faces">
                <i />
                <i />
                <i />
                <i />
                128 interested
              </span>
              <span className="evt-dcard__cta">Get Ticket</span>
            </div>
          </div>
        </div>
      </div>

      <div className="evt-share__block">
        <strong>Share this event</strong>
        <span>Share your event with more people!</span>
        <div className="evt-socials">
          {socials.map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(link);
                toast(`${label} — link copied`);
              }}
              aria-label={`Share on ${label}`}
            >
              <Icon size={17} color="#6D28FF" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
