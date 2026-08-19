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
  priceSpread,
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
  const spread = priceSpread(draft);
  const lead = draft.instructors.find((person) => person.name.trim() !== '');

  /* The card stays a card — the rest sit behind "View all sessions". */
  const shown = live.slice(0, SESSIONS_SHOWN);
  const hidden = live.length - shown.length;

  if (variant === 'phone') {
    return (
      <aside className="wiz-preview">
        <h2 className="font-heading text-[15px] font-semibold">Activity Preview</h2>
        <p className="text-[12px] text-grey mt-1 mx-0 mb-3">This is how your activity will appear to participants.</p>

        <div className="wiz-phone">
          <div className="flex items-center justify-between pt-2.5 px-4 pb-1 text-[12px] font-semibold">
            <span>9:41</span>
            <span className="flex items-center gap-[5px]" aria-hidden="true">
              <i className="wiz-phone__bars" />
              <Wifi size={12} color="#12121A" strokeWidth={2} />
              <i className="wiz-phone__battery" />
            </span>
          </div>

          <div className="wiz-phone__bar">
            <span className="w-[30px] h-[30px] rounded-[50%] bg-surface-sunken flex items-center justify-center">
              <ArrowLeft size={15} color="#12121A" strokeWidth={2} />
            </span>
            <span className="w-[30px] h-[30px] rounded-[50%] bg-surface-sunken flex items-center justify-center">
              <HeartOutlineLarge size={15} color="#12121A" />
            </span>
            <span className="w-[30px] h-[30px] rounded-[50%] bg-surface-sunken flex items-center justify-center">
              <Share size={14} color="#12121A" strokeWidth={1.9} />
            </span>
          </div>

          <div className="relative h-[168px]">
            <ImageSlot
              id="builder-cover"
              src={draft.cover}
              onChange={onCover}
              interactive={false}
              shape="rect"
              placeholder="Activity cover"
            />
            <span className="absolute top-3 left-3 py-[5px] px-3 rounded-pill bg-green text-[#fff] text-[11.5px] font-semibold">{draft.category || PREVIEW_FALLBACK.category}</span>
            <span className="wiz-phone__count">1 / {draft.gallery.length + 1}</span>
          </div>

          <div className="pt-[15px] px-4 pb-[18px]">
            <h3 className="font-heading text-[17px] font-semibold tracking-[-0.02em] leading-[1.3]">{draft.title || PREVIEW_FALLBACK.title}</h3>
            <div className="flex items-center gap-2 text-[12.5px] text-grey mt-[7px] mx-0 mb-[11px]">
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
              {spread.varies ? <span>from</span> : null}
              <strong>{rupiah(spread.low)}</strong>
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
      <h2 className="font-heading text-[15px] font-semibold">Activity Preview</h2>
      <p className="text-[12px] text-grey mt-1 mx-0 mb-3">This is how your activity will appear to participants.</p>

      <div className="bg-[#fff] border border-line rounded-xl overflow-hidden shadow-card">
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
          <span className="absolute top-3 left-3 py-[5px] px-3 rounded-pill bg-green text-[#fff] text-[11.5px] font-semibold">{draft.category || PREVIEW_FALLBACK.category}</span>
          <span className="wiz-pv__heart" aria-hidden="true">
            <HeartOutlineLarge size={16} color="#fff" />
          </span>
        </div>

        <div className="pt-3.5 px-4 pb-4">
          <h3 className="font-heading text-[17px] font-semibold tracking-[-0.02em] leading-[1.3]">{draft.title || PREVIEW_FALLBACK.title}</h3>

          <div className="flex items-center gap-2 text-[12.5px] text-grey mt-[7px] mx-0 mb-[11px]">
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
              {spread.varies ? 'from ' : ''}
              {rupiah(spread.low)} per session
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

          {draft.summary ? <p className="text-[12.5px] text-grey leading-[1.55] mt-3">{draft.summary}</p> : null}

          {lead ? (
            <div className="wiz-pv__instructor">
              <span className="w-[38px] h-[38px] rounded-[50%] overflow-hidden bg-brand-tint-strong">
                <ImageSlot
                  id={`builder-instructor-${lead.id}`}
                  shape="circle"
                  interactive={false}
                  placeholder=""
                />
              </span>
              <div className="wiz-pv__who">
                <span className="block text-[10px] text-grey">Instructor</span>
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
            <p className="text-[12.5px] text-grey mt-3">No active sessions yet — add one in step 2.3.</p>
          ) : (
            shown.map((session) => {
              const { Icon, colour } = TONE_ICON[sessionTone(session)];
              return (
                <div key={session.id} className="wiz-pv__session">
                  <span className={`col-[1] row-[1_/_span_2] self-start mt-0.5 w-[26px] h-[26px] rounded-sm flex items-center justify-center wiz-pv__tone--${sessionTone(session)}`}>
                    <Icon size={14} color={colour} strokeWidth={1.9} />
                  </span>
                  <div className="wiz-pv__slot">
                    <strong>{session.name}</strong>
                    <span>
                      {effectiveDays(session, draft.operatingDays).join(', ') || 'No days set'}
                    </span>
                  </div>
                  <div className="col-[3] row-[1] text-right whitespace-nowrap text-[10.5px] text-ink-3 whitespace-nowrap">
                    {session.start} – {session.end}
                  </div>
                  <div className="col-[3] row-[2] text-right whitespace-nowrap text-[10px] text-grey whitespace-nowrap">{session.slots} slots left</div>
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
            <p className="text-[12.5px] text-grey mt-3">
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
