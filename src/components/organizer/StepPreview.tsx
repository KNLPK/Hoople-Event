import { useState } from 'react';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  Bag,
  Calendar,
  ChevronDown,
  Clock,
  Dashboard,
  HeartOutlineLarge,
  Info,
  MapPin,
  Share,
  Tag,
  User,
  Users,
} from '@/components/ui/icons';
import {
  DIFFICULTY_LEVELS,
  PREVIEW_FALLBACK,
  slotsPerSession,
  venueLine,
  type ActivityDraft,
} from '@/data/builder';
import { WORKSPACE_INITIALS } from '@/data/organizer';
import { compactDate, rupiah } from '@/lib/format';

type View = 'participant' | 'host';

/** 5.2 — the same draft seen from both sides of the platform. */
export function StepPreview({ draft }: { draft: ActivityDraft }) {
  const toast = useToast();
  const [view, setView] = useState<View>('participant');

  const live = draft.sessions.filter((session) => session.active);
  const badge = DIFFICULTY_LEVELS.find((level) => level.value === draft.difficulty)?.badge;
  const capacity = live.reduce((total, session) => total + session.slots, 0);

  return (
    <>
      <p className="wiz-section__lede">Review how your activity will appear to participants.</p>

      <div className="wiz-viewtabs" role="group" aria-label="Preview surface">
        <button
          type="button"
          className={view === 'participant' ? 'is-on' : ''}
          onClick={() => setView('participant')}
          aria-pressed={view === 'participant'}
        >
          <User size={16} color={view === 'participant' ? '#6D28FF' : '#5C5B6B'} strokeWidth={1.9} />
          Participant View
        </button>
        <button
          type="button"
          className={view === 'host' ? 'is-on' : ''}
          onClick={() => setView('host')}
          aria-pressed={view === 'host'}
        >
          <Dashboard size={16} color={view === 'host' ? '#6D28FF' : '#5C5B6B'} strokeWidth={1.9} />
          Host Dashboard View
        </button>
      </div>

      {view === 'participant' ? (
        <div className="wiz-stack">
          <div className="wiz-face">
            <div className="relative h-[210px]">
              <ImageSlot
                id="builder-cover"
                src={draft.cover}
                interactive={false}
                shape="rect"
                placeholder="Activity cover"
              />
              <span className="wiz-pv__category">{draft.category || PREVIEW_FALLBACK.category}</span>
              <span className="wiz-face__actions" aria-hidden="true">
                <span>
                  <HeartOutlineLarge size={16} color="#fff" />
                </span>
                <span>
                  <Share size={15} color="#fff" strokeWidth={1.9} />
                </span>
              </span>
            </div>

            <div className="wiz-face__body">
              <h3 className="font-heading text-[19px] font-semibold tracking-[-0.02em] mb-[11px]">{draft.title || PREVIEW_FALLBACK.title}</h3>
              <div className="wiz-pv__host">
                <span className="wiz-pv__avatar">{WORKSPACE_INITIALS}</span>
                by {draft.hostedAs}
              </div>

              <ul className="wiz-face__meta">
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
            </div>
          </div>

          <div className="wiz-pair">
            <section className="org-card wiz-panel">
              <span className="block text-[13.5px] font-semibold text-ink">Price per Session</span>
              <div className="wiz-face__price">{rupiah(draft.price)}</div>
              <span className="wiz-field__hint">This price will be applied to all sessions.</span>
            </section>

            <section className="org-card wiz-panel flex flex-col justify-center gap-2.5">
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => toast('Preview only — booking opens once you publish')}
              >
                View Sessions &amp; Book
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--block"
                onClick={() => toast('Preview only — the full activity page opens once you publish')}
              >
                See Details
              </button>
            </section>
          </div>

          <section className="org-card wiz-panel">
            <span className="block text-[13.5px] font-semibold text-ink">About this activity</span>
            <p className="wiz-face__about">
              {draft.summary || 'Add a short description in 1.1 and it will appear here.'}
            </p>
            <details className="wiz-more">
              <summary>
                Show more
                <ChevronDown size={14} color="#6D28FF" strokeWidth={2} />
              </summary>
              <p className="wiz-face__about">{draft.learn}</p>
            </details>
          </section>

          <div className="wiz-note">
            <span className="flex-none flex mt-px">
              <Info size={17} color="#6D28FF" strokeWidth={1.9} />
            </span>
            <div>
              <strong>This is a preview</strong>
              <p>Some details may look different to participants once it is live.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="wiz-stack">
          <section className="org-card wiz-panel">
            <span className="block text-[13.5px] font-semibold text-ink">How this lands in your console</span>
            <span className="wiz-field__hint">
              This is the row you will manage it from once it is published.
            </span>

            <div className="org-xp-row wiz-hostrow">
              <div className="org-xp-row__media zoom">
                <ImageSlot
                  id="builder-cover"
                  src={draft.cover}
                  interactive={false}
                  radius={10}
                  placeholder="Activity cover"
                />
              </div>

              <div className="org-xp-row__chips">
                <span className="org-pill org-pill--activity">Activity</span>
                <span className="org-pill org-pill--draft">Draft</span>
              </div>

              <div>
                <div className="org-xp-row__title">{draft.title || PREVIEW_FALLBACK.title}</div>
                <div className="org-xp-row__meta">
                  <span>
                    <Calendar size={13} color="#8B8A99" strokeWidth={1.9} />
                    {draft.operatingDays.join(', ') || 'No operating day'} · {live.length} session
                    {live.length === 1 ? '' : 's'}
                  </span>
                  <span>
                    <MapPin size={13} color="#8B8A99" strokeWidth={1.9} />
                    {venueLine(draft)}
                  </span>
                  <span>
                    <Bag size={13} color="#8B8A99" strokeWidth={1.9} />
                    {draft.category || PREVIEW_FALLBACK.category}
                  </span>
                </div>
              </div>

              <div className="org-xp-row__stat">
                <span className="text-[12px] text-grey">Capacity</span>
                <strong>0 / {capacity}</strong>
                <div className="org-xp-row__progress">
                  <div className="org-meter" style={{ width: '100%', marginTop: 0 }}>
                    <div className="org-meter__fill" style={{ width: '0%' }} />
                  </div>
                  <span>0%</span>
                </div>
              </div>

              <div className="org-xp-row__stat">
                <span className="text-[12px] text-grey">Revenue</span>
                <strong className="org-xp-row__revenue">{rupiah(0)}</strong>
              </div>

              <div className="org-xp-row__stat">
                <span className="text-[12px] text-grey">Status</span>
                <span className="org-pill org-pill--draft">Draft</span>
                <span className="text-[11.5px] text-grey">
                  {draft.publishWhen === 'now'
                    ? 'Goes live when you publish'
                    : `Scheduled for ${compactDate(draft.publishDate)}`}
                </span>
              </div>

              <span />
            </div>
          </section>

          <div className="wiz-note">
            <span className="flex-none flex mt-px">
              <Info size={17} color="#6D28FF" strokeWidth={1.9} />
            </span>
            <div>
              <strong>Registrations, check-in and payouts follow the same row</strong>
              <p>
                Once published, this activity appears under Experiences and feeds your Sessions,
                Registrations and Payments pages.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
