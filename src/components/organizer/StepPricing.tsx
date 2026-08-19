import { AffixInput, ChoiceTile, FieldHead, SelectInput } from './WizardFields';
import { RadioRow } from './WizardFields';
import { Bolt, Calendar, CheckCircle, Clock, Users } from '@/components/ui/icons';
import {
  BOOKING_CLOSES,
  BOOKING_OPENS,
  CANCELLATION_POLICIES,
  CONFIRMATION_OPTIONS,
  MAX_ADVANCE,
  slotsPerSession,
  type ActivityDraft,
} from '@/data/builder';

const CONFIRMATION_ICON = {
  Instant: <Bolt size={17} color="#6D28FF" strokeWidth={1.9} />,
  Manual: <Clock size={17} color="#5C5B6B" strokeWidth={1.9} />,
};

/** Step 3 — what a seat costs, and the rules around claiming one. */
export function StepPricing({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const policy = CANCELLATION_POLICIES.find((item) => item.value === draft.cancellation);
  const actualRange = slotsPerSession(draft.sessions);
  /* Say plainly when a session is not on the base price, so the number above
     is never read as the only thing anyone pays. */
  const overrides = draft.sessions.filter(
    (session) => session.active && session.price !== undefined,
  ).length;

  return (
    <>
      <p className="wiz-section__lede">Set the price for each session and manage how bookings work.</p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <FieldHead
            label="Pricing per Session"
            hint="One price covers every session. Charge differently for a particular slot in 2.3."
          />
          <div className="wiz-field__control max-w-[320px]">
            <span className="block text-[13.5px] font-semibold text-ink">
              Base Price per Session<span className="text-danger"> *</span>
            </span>
            <AffixInput
              ariaLabel="Base price per session"
              prefix="Rp"
              value={draft.price.toLocaleString('id-ID')}
              onChange={(value) => set('price')(Number(value.replace(/\D/g, '')) || 0)}
            />
            <span className="text-[12px] text-grey-soft mt-2">
              {overrides === 0
                ? 'Every session uses this price unless you give one its own in 2.3.'
                : `${overrides === 1 ? '1 session has its' : `${overrides} sessions have their`} own price set in 2.3.`}
            </span>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <FieldHead
            label="Capacity &amp; Availability"
            hint="Manage how many participants can join each session."
          />
          <div className="wiz-pair">
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Max Capacity per Session<span className="text-danger"> *</span>
              </span>
              <AffixInput
                ariaLabel="Max capacity per session"
                leading={<Users size={15} color="#8B8A99" strokeWidth={1.9} />}
                suffix="slots"
                value={String(draft.defaultCapacity)}
                onChange={(value) => set('defaultCapacity')(Number(value.replace(/\D/g, '')) || 0)}
              />
              {/* 2.3 sets capacity per session, so say what those actually are. */}
              <span className="text-[12px] text-grey-soft mt-2">
                Applied to new sessions. Yours currently run {actualRange} slots each — set
                individually in 2.3.
              </span>
            </div>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Minimum Participants <span className="font-normal text-grey">(Optional)</span>
              </span>
              <AffixInput
                ariaLabel="Minimum participants"
                leading={<Users size={15} color="#8B8A99" strokeWidth={1.9} />}
                suffix="participants"
                value={draft.minParticipants}
                onChange={(value) => set('minParticipants')(value.replace(/\D/g, ''))}
              />
              <span className="text-[12px] text-grey-soft mt-2">Minimum number required to run the session.</span>
            </div>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <FieldHead label="Booking Window" hint="Choose when participants can book your sessions." />
          <div className="wiz-triple">
            <label className="field">
              <span className="block text-[13.5px] font-semibold text-ink">Booking opens</span>
              <SelectInput
                ariaLabel="Booking opens"
                value={draft.bookingOpens}
                options={BOOKING_OPENS}
                onChange={set('bookingOpens')}
                leading={<Calendar size={16} color="#8B8A99" strokeWidth={1.9} />}
              />
            </label>
            <label className="field">
              <span className="block text-[13.5px] font-semibold text-ink">Booking closes</span>
              <SelectInput
                ariaLabel="Booking closes"
                value={draft.bookingCloses}
                options={BOOKING_CLOSES}
                onChange={set('bookingCloses')}
                leading={<Calendar size={16} color="#8B8A99" strokeWidth={1.9} />}
              />
            </label>
            <label className="field">
              <span className="block text-[13.5px] font-semibold text-ink">Maximum advance booking</span>
              <SelectInput
                ariaLabel="Maximum advance booking"
                value={draft.maxAdvance}
                options={MAX_ADVANCE}
                onChange={set('maxAdvance')}
                leading={<Calendar size={16} color="#8B8A99" strokeWidth={1.9} />}
              />
            </label>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <FieldHead label="Cancellation Policy" hint="Set your cancellation rules for participants." />
          <div className="wiz-policy">
            <div className="flex flex-col gap-3.5">
              {CANCELLATION_POLICIES.map((item) => (
                <RadioRow
                  key={item.value}
                  name="cancellation"
                  checked={draft.cancellation === item.value}
                  onSelect={() => set('cancellation')(item.value)}
                  title={item.value}
                  sub={item.sub}
                />
              ))}
            </div>

            {/* Reads straight off the selected policy, so it can never disagree. */}
            <aside className="wiz-policy__preview">
              <div className="text-[12.5px] font-semibold text-ink mb-[11px]">Policy preview</div>
              <ul>
                {policy?.preview.map((line) => (
                  <li key={line}>
                    <CheckCircle size={15} color="#6D28FF" strokeWidth={2} />
                    {line}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <FieldHead label="Booking Confirmation" hint="Choose how booking requests are handled." />
          <div className="wiz-tiles wiz-tiles--2">
            {CONFIRMATION_OPTIONS.map((option) => (
              <ChoiceTile
                key={option.value}
                name="confirmation"
                checked={draft.confirmation === option.value}
                onSelect={() => set('confirmation')(option.value)}
                title={option.title}
                sub={option.sub}
                icon={CONFIRMATION_ICON[option.value]}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
