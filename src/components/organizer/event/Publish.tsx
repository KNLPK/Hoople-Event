import { Checkbox, Toggle } from '../WizardFields';
import { EventHead, type EventSectionProps } from './shared';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Doc,
  Globe,
  Info,
  LinkChain,
  Lock,
  Rocket,
} from '@/components/ui/icons';
import {
  EVENT_VISIBILITY,
  REGISTRATION_STATUS,
  eventChecklist,
  type EventVisibility,
  type RegistrationStatus,
} from '@/data/eventBuilder';
import { compactDate } from '@/lib/format';
import { copyText } from '@/lib/clipboard';

const VISIBILITY_ICON: Record<EventVisibility, React.ReactNode> = {
  Public: <Globe size={17} color="#6D28FF" strokeWidth={1.8} />,
  Unlisted: <LinkChain size={17} color="#5C5B6B" strokeWidth={1.8} />,
  Private: <Lock size={17} color="#5C5B6B" strokeWidth={1.8} />,
};

const STATUS_ICON: Record<RegistrationStatus, React.ReactNode> = {
  open: <Calendar size={17} color="#6D28FF" strokeWidth={1.8} />,
  scheduled: <Clock size={17} color="#5C5B6B" strokeWidth={1.8} />,
  draft: <Doc size={17} color="#5C5B6B" strokeWidth={1.8} />,
};

/** Short labels for the checklist chips, in the order the wizard asks for them. */
const CHECK_CHIPS = [
  'Cover uploaded',
  'Schedule completed',
  'Venue added',
  'Ticket created',
  'Brand completed',
];

/** 5.2 — who can find the event, and how it looks when they do. */
export function EventPublish({ draft, set }: EventSectionProps) {
  const toast = useToast();

  const checklist = eventChecklist(draft);
  const ready = checklist.every((item) => item.done);
  const shareLink = `hoople.id/e/${draft.shareSlug}`;

  return (
    <>
      <EventHead
        lede="Choose how your event will be published and discovered."
        tip="Discovery is where most registrations come from — leave it on unless the event is private."
      />

      <div className="wiz-stack">
        <Lettered letter="A" title="Visibility" sub="Choose who can see this event.">
          <div className="wiz-vis">
            {EVENT_VISIBILITY.map((option) => (
              <label
                key={option.value}
                className={`wiz-vistile ${draft.visibility === option.value ? 'is-on' : ''}`.trim()}
              >
                <input
                  type="radio"
                  name="publish-visibility"
                  className="sr-only"
                  checked={draft.visibility === option.value}
                  onChange={() => set('visibility')(option.value)}
                />
                <span className="wiz-vistile__top">
                  <span className="wiz-tile__radio" aria-hidden="true" />
                  {VISIBILITY_ICON[option.value]}
                  <span className="wiz-tile__title">{option.value}</span>
                </span>
                <span className="wiz-tile__sub">{option.sub}</span>
              </label>
            ))}
          </div>
        </Lettered>

        <Lettered
          letter="B"
          title="Registration Status"
          sub="Control when registration will open for participants."
        >
          <div className="wiz-vis">
            {REGISTRATION_STATUS.map((option) => (
              <label
                key={option.value}
                className={`wiz-vistile ${
                  draft.registrationStatus === option.value ? 'is-on' : ''
                }`.trim()}
              >
                <input
                  type="radio"
                  name="registration-status"
                  className="sr-only"
                  checked={draft.registrationStatus === option.value}
                  onChange={() => set('registrationStatus')(option.value)}
                />
                <span className="wiz-vistile__top">
                  {STATUS_ICON[option.value]}
                  <span className="wiz-tile__title">{option.title}</span>
                </span>
                <span className="wiz-tile__sub">{option.sub}</span>
              </label>
            ))}
          </div>

          {/* Only a scheduled publish needs a date, so the fields follow the choice. */}
          <div
            className={`evt-publishwhen ${draft.registrationStatus === 'scheduled' ? '' : 'is-off'}`.trim()}
          >
            <label className="evt-when__field">
              <span>Publish Date</span>
              <span className="wiz-date">
                <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="date"
                  value={draft.publishDate}
                  disabled={draft.registrationStatus !== 'scheduled'}
                  aria-label="Publish date"
                  onChange={(event) => set('publishDate')(event.target.value)}
                />
              </span>
            </label>
            <label className="evt-when__field">
              <span>Publish Time</span>
              <span className="wiz-date">
                <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
                <input
                  type="time"
                  value={draft.publishTime}
                  disabled={draft.registrationStatus !== 'scheduled'}
                  aria-label="Publish time"
                  onChange={(event) => set('publishTime')(event.target.value)}
                />
              </span>
            </label>
          </div>
        </Lettered>

        <Lettered
          letter="C"
          title="Discovery"
          sub="Increase your event visibility on the Hoople platform."
        >
          <div className="evt-discovery">
            <Toggle
              checked={draft.showOnDiscover}
              onChange={set('showOnDiscover')}
              label="Show on Hoople Discover"
              hint="Your event will appear on Discover page and search results."
            />

            <div className={`evt-nested ${draft.showOnDiscover ? '' : 'is-off'}`.trim()}>
              <Toggle
                checked={draft.categoryRecommendation && draft.showOnDiscover}
                onChange={set('categoryRecommendation')}
                label="Category Recommendation"
                hint="Allow Hoople to recommend this event to relevant audiences."
              />
            </div>
          </div>
        </Lettered>

        <Lettered
          letter="D"
          title="Participant Notification"
          sub="Let your audience know about your event."
        >
          <div className="wiz-triple">
            <div className="evt-notify">
              <Checkbox
                checked={draft.notifyFollowers}
                onChange={set('notifyFollowers')}
                label="Notify Followers"
              />
              <span className="wiz-field__hint">Send notification to your followers.</span>
            </div>
            <div className="evt-notify">
              <Checkbox
                checked={draft.notifyCommunity}
                onChange={set('notifyCommunity')}
                label="Notify Community Members"
              />
              <span className="wiz-field__hint">Notify members from relevant communities.</span>
            </div>
            <div className="evt-notify">
              <Checkbox
                checked={draft.sendReminder}
                onChange={set('sendReminder')}
                label="Send Event Reminder"
              />
              <span className="wiz-field__hint">Send WhatsApp reminder before the event.</span>
              <span className="evt-soon">Coming Soon</span>
            </div>
          </div>
        </Lettered>

        <Lettered letter="E" title="SEO / Share Preview" sub="Customize how your link looks when shared.">
          <div className="evt-share">
            <div>
              <span className="wiz-field__label">Share Link</span>
              <div className="evt-sharelink">
                <span className="wiz-affix">
                  <span className="wiz-affix__prefix">hoople.id/e/</span>
                  <input
                    value={draft.shareSlug}
                    aria-label="Share link slug"
                    onChange={(event) =>
                      set('shareSlug')(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                    }
                  />
                </span>
                <button
                  type="button"
                  className="wiz-addsession"
                  onClick={() => {
                    void copyText(`https://${shareLink}`);
                    toast('Link copied');
                  }}
                >
                  <Copy size={14} color="#6D28FF" strokeWidth={1.9} />
                  Copy Link
                </button>
              </div>
            </div>

            <div>
              <span className="wiz-field__label">Social Preview</span>
              <div className="evt-social">
                <div className="evt-social__art">
                  <ImageSlot
                    id="event-cover"
                    src={draft.cover}
                    interactive={false}
                    radius={8}
                    placeholder=""
                  />
                </div>
                <div>
                  <strong>{draft.title || 'Your Event Title'}</strong>
                  <span>{draft.summary || 'Your short description appears here.'}</span>
                  <span>
                    {[draft.startDate ? compactDate(draft.startDate) : '', draft.venueName]
                      .filter(Boolean)
                      .join(' • ')}
                  </span>
                  <em>{shareLink}</em>
                </div>
              </div>
            </div>
          </div>
        </Lettered>

        <Lettered letter="F" title="Publish Checklist" sub="Make sure everything is ready.">
          <div className="evt-checkchips">
            {CHECK_CHIPS.map((label, index) => (
              <span key={label} className={checklist[index]?.done ? 'is-done' : ''}>
                <CheckCircle
                  size={15}
                  color={checklist[index]?.done ? '#16A34A' : '#B4B2C0'}
                  strokeWidth={2}
                />
                {label}
              </span>
            ))}
            <span className={`evt-ready ${ready ? '' : 'is-waiting'}`.trim()}>
              <Rocket size={14} color={ready ? '#6D28FF' : '#EA8C00'} strokeWidth={1.9} />
              {ready ? 'Ready to Publish' : 'Almost ready'}
            </span>
          </div>
        </Lettered>

        <div className="wiz-note">
          <span className="wiz-note__icon">
            <Info size={16} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            The previews on the right are rendered from this draft — change the title, cover or venue
            and the Discover card changes with it.
          </p>
        </div>
      </div>
    </>
  );
}

/** The lettered rail down the left of 5.2, so long settings stay navigable. */
function Lettered({
  letter,
  title,
  sub,
  children,
}: {
  letter: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="evt-lettered">
      <div className="evt-lettered__head">
        <span className="evt-lettered__letter">{letter}</span>
        <div>
          <strong>{title}</strong>
          <span>{sub}</span>
        </div>
      </div>
      <div className="org-card wiz-panel">{children}</div>
    </section>
  );
}
