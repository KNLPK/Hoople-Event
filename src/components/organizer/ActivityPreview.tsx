import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDots,
  Clock,
  Cloud,
  HeartOutlineLarge,
  Info,
  Lock,
  MapPin,
  Moon,
  Share,
  Sun,
  Tag,
  Users,
  Wallet,
  Wifi,
} from '@/components/ui/icons';
import { rupiah } from '@/lib/format';
import {
  DIFFICULTY_LEVELS,
  PREVIEW_FALLBACK,
  effectiveDays,
  sessionTone,
  slotsPerSession,
  venueLine,
  type ActivityDraft,
  type SessionTone,
} from '@/data/builder';
import { WORKSPACE_INITIALS } from '@/data/organizer';

const SESSIONS_SHOWN = 4;

const TONE_ICON: Record<SessionTone, { Icon: typeof Sun; colour: string }> = {
  morning: { Icon: Sun, colour: '#EA8C00' },
  afternoon: { Icon: Cloud, colour: '#2563EB' },
  evening: { Icon: Moon, colour: '#6D28FF' },
  weekend: { Icon: CalendarDots, colour: '#16A34A' },
};

/**
 * The participant-facing card, rendered live from the draft. It rides along
 * with the form so the organizer always sees what they are actually making.
 */
export function ActivityPreview({
  draft,
  onCover,
  variant = 'card',
}: {
  draft: ActivityDraft;
  onCover: (dataUrl: string) => void;
  /** `phone` frames the participant app, as the publish steps show it. */
  variant?: 'card' | 'phone';
}) {
  const toast = useToast();

  const badge = DIFFICULTY_LEVELS.find((level) => level.value === draft.difficulty)?.badge;
  const live = draft.sessions.filter((session) => session.active);
  const lead = draft.instructors.find((person) => person.name.trim() !== '');

  /* The card stays a card — the rest sit behind "View all sessions". */
  const shown = live.slice(0, SESSIONS_SHOWN);
  const hidden = live.length - shown.length;

  if (variant === 'phone') {
    return (
      <aside className="wiz-preview">
        <h2 className="wiz-preview__title">Activity Preview</h2>
        <p className="wiz-preview__lede">This is how your activity will appear to participants.</p>

        <div className="wiz-phone">
          <div className="wiz-phone__status">
            <span>9:41</span>
            <span className="wiz-phone__glyphs" aria-hidden="true">
              <i className="wiz-phone__bars" />
              <Wifi size={12} color="#12121A" strokeWidth={2} />
              <i className="wiz-phone__battery" />
            </span>
          </div>

          <div className="wiz-phone__bar">
            <span className="wiz-phone__chip">
              <ArrowLeft size={15} color="#12121A" strokeWidth={2} />
            </span>
            <span className="wiz-phone__chip">
              <HeartOutlineLarge size={15} color="#12121A" />
            </span>
            <span className="wiz-phone__chip">
              <Share size={14} color="#12121A" strokeWidth={1.9} />
            </span>
          </div>

          <div className="wiz-phone__media">
            <ImageSlot
              id="builder-cover"
              src={draft.cover}
              onChange={onCover}
              interactive={false}
              shape="rect"
              placeholder="Activity cover"
            />
            <span className="wiz-pv__category">{draft.category || PREVIEW_FALLBACK.category}</span>
            <span className="wiz-phone__count">1 / {draft.gallery.length + 1}</span>
          </div>

          <div className="wiz-phone__body">
            <h3 className="wiz-pv__name">{draft.title || PREVIEW_FALLBACK.title}</h3>
            <div className="wiz-pv__host">
              <span className="wiz-pv__avatar">{WORKSPACE_INITIALS}</span>
              by {draft.hostedAs}
            </div>

            <ul className="wiz-pv__meta">
              <li>
                <MapPin size={14} color="#6D28FF" strokeWidth={1.9} />
                {venueLine(draft)}
              </li>
              <li>
                <Users size={14} color="#6D28FF" strokeWidth={1.9} />
                {slotsPerSession(draft.sessions)} slots per session
              </li>
              <li>
                <Clock size={14} color="#6D28FF" strokeWidth={1.9} />
                {live.length > 1 ? 'Multiple sessions available' : 'One session per week'}
              </li>
              <li>
                <Tag size={14} color="#6D28FF" strokeWidth={1.9} />
                {badge}
              </li>
            </ul>

            <div className="wiz-phone__price">
              <strong>{rupiah(draft.price)}</strong>
              <span>/ session</span>
            </div>

            <button
              type="button"
              className="wiz-phone__cta"
              onClick={() => toast('Preview only — participants can book once you publish')}
            >
              View Sessions &amp; Book
            </button>
          </div>
        </div>

        <div className="wiz-preview__note wiz-preview__note--info">
          <Info size={16} color="#6D28FF" strokeWidth={1.9} />
          <div>
            <strong>Preview mode</strong>
            <span>You can still edit anything before publishing.</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="wiz-preview">
      <h2 className="wiz-preview__title">Activity Preview</h2>
      <p className="wiz-preview__lede">This is how your activity will appear to participants.</p>

      <div className="wiz-pv">
        <div className="wiz-pv__media">
          {/* Shares the cover's slot id, so filling either fills both. */}
          <ImageSlot
            id="builder-cover"
            src={draft.cover}
            onChange={onCover}
            interactive={false}
            shape="rect"
            placeholder="Activity cover"
          />
          <span className="wiz-pv__category">{draft.category || PREVIEW_FALLBACK.category}</span>
          <span className="wiz-pv__heart" aria-hidden="true">
            <HeartOutlineLarge size={16} color="#fff" />
          </span>
        </div>

        <div className="wiz-pv__body">
          <h3 className="wiz-pv__name">{draft.title || PREVIEW_FALLBACK.title}</h3>

          <div className="wiz-pv__host">
            <span className="wiz-pv__avatar">{WORKSPACE_INITIALS}</span>
            by {draft.hostedAs}
          </div>

          <ul className="wiz-pv__meta">
            <li>
              <MapPin size={14} color="#6D28FF" strokeWidth={1.9} />
              {venueLine(draft)}
            </li>
            <li>
              <Wallet size={14} color="#6D28FF" strokeWidth={1.9} />
              {rupiah(draft.price)} per session
            </li>
            <li>
              <Clock size={14} color="#6D28FF" strokeWidth={1.9} />
              {live.length > 1 ? 'Multiple sessions available' : 'One session per week'}
            </li>
            <li>
              <Users size={14} color="#6D28FF" strokeWidth={1.9} />
              {slotsPerSession(draft.sessions)} slots per session
            </li>
            <li>
              <Tag size={14} color="#6D28FF" strokeWidth={1.9} />
              {badge}
            </li>
          </ul>

          {draft.summary ? <p className="wiz-pv__summary">{draft.summary}</p> : null}

          {lead ? (
            <div className="wiz-pv__instructor">
              <span className="wiz-pv__portrait">
                <ImageSlot
                  id={`builder-instructor-${lead.id}`}
                  shape="circle"
                  interactive={false}
                  placeholder=""
                />
              </span>
              <div className="wiz-pv__who">
                <span className="wiz-pv__who-label">Instructor</span>
                <strong>{lead.name}</strong>
                <span>{lead.role}</span>
              </div>
              <div className="wiz-pv__expertise">
                {lead.expertise.slice(0, 2).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
                {lead.expertise.length > 2 ? (
                  <span className="wiz-pv__more">+{lead.expertise.length - 2} more</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="wiz-pv__sessions">
            <span>Available Sessions</span>
            <button type="button" onClick={() => toast('The full session list opens once you publish')}>
              View all sessions
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>

          {live.length === 0 ? (
            <p className="wiz-pv__none">No active sessions yet — add one in step 2.3.</p>
          ) : (
            shown.map((session) => {
              const { Icon, colour } = TONE_ICON[sessionTone(session)];
              return (
                <div key={session.id} className="wiz-pv__session">
                  <span className={`wiz-pv__tone wiz-pv__tone--${sessionTone(session)}`}>
                    <Icon size={14} color={colour} strokeWidth={1.9} />
                  </span>
                  <div className="wiz-pv__slot">
                    <strong>{session.name}</strong>
                    <span>
                      {effectiveDays(session, draft.operatingDays).join(', ') || 'No days set'}
                    </span>
                  </div>
                  <div className="wiz-pv__time">
                    {session.start} – {session.end}
                  </div>
                  <div className="wiz-pv__left">{session.slots} slots left</div>
                  <button
                    type="button"
                    className="wiz-pv__book"
                    onClick={() => toast('Preview only — participants can book once you publish')}
                  >
                    Book
                  </button>
                </div>
              );
            })
          )}

          {hidden > 0 ? (
            <p className="wiz-pv__none">
              +{hidden} more session{hidden > 1 ? 's' : ''}
            </p>
          ) : null}
        </div>
      </div>

      <div className="wiz-preview__note">
        <Lock size={16} color="#16A34A" strokeWidth={1.9} />
        <div>
          <strong>This is only a preview.</strong>
          <span>You can change everything before publishing.</span>
        </div>
      </div>
    </aside>
  );
}
