import { useState } from 'react';
import { AffixInput, CounterInput, SelectInput } from '../WizardFields';
import { EventHead, type EventSectionProps } from './shared';
import { useToast } from '@/components/ui/Toast';
import {
  Card,
  Check,
  DotsVertical,
  Info,
  Monitor,
  Plus,
  Trash,
  User,
  Users,
} from '@/components/ui/icons';
import {
  CURRENCIES,
  DELIVERY_MODES,
  PAYMENT_METHOD_OPTIONS,
  REFUND_POLICIES,
  TICKET_PERKS,
  nextTicketId,
  ticketsLeft,
  type DeliveryMode,
  type TicketType,
} from '@/data/eventBuilder';
import { rupiah } from '@/lib/format';

const MODE_LABEL: Record<DeliveryMode, string> = {
  Onsite: 'Onsite Only',
  Online: 'Online Only',
  Both: 'Onsite + Online',
};

const MODE_ICON: Record<DeliveryMode, typeof User> = {
  Onsite: User,
  Online: Monitor,
  Both: Users,
};

const LEDE: Record<string, string> = {
  Offline: 'Create ticket types for your event and set what each one includes.',
  Online: 'Create ticket types for your online event and set what each one includes.',
  Hybrid:
    'Create ticket types for your hybrid event. Participants can choose to join in person, online, or both.',
};

/** Step 3 — what a seat costs and what it includes. */
export function EventTickets({ draft, set }: EventSectionProps) {
  const toast = useToast();
  const [openId, setOpenId] = useState<string | null>(null);

  const hybrid = draft.eventType === 'Hybrid';

  function update(id: string, patch: Partial<TicketType>) {
    set('tickets')(draft.tickets.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function add() {
    const id = nextTicketId(draft.tickets);
    set('tickets')([
      ...draft.tickets,
      {
        id,
        name: `Ticket ${draft.tickets.length + 1}`,
        mode: hybrid ? 'Both' : draft.eventType === 'Online' ? 'Online' : 'Onsite',
        description: '',
        perks: [],
        price: 0,
        capacity: 100,
        sold: 0,
        active: true,
      },
    ]);
    setOpenId(id);
  }

  return (
    <>
      <EventHead
        lede={LEDE[draft.eventType]}
        tip="Give each ticket a clear name and say what it includes — it is the first thing people compare."
      />

      <div className="wiz-stack">
        {hybrid ? (
          <div className="evt-banner">
            <Card size={18} color="#6D28FF" strokeWidth={1.9} />
            <div>
              <strong>This is a Hybrid Event</strong>
              <span>You can create different ticket types for onsite, online, or both experiences.</span>
            </div>
          </div>
        ) : null}

        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <span className="block text-[13.5px] font-semibold text-ink">Ticket Types</span>
            <button type="button" className="wiz-addsession" onClick={add}>
              <Plus size={14} color="#6D28FF" strokeWidth={2} />
              Add Ticket Type
            </button>
          </div>

          {draft.tickets.length === 0 ? (
            <p className="text-[13px] text-grey py-[18px] px-0">
              No ticket types yet. Add one so people have something to register for.
            </p>
          ) : (
            <div className="evt-tickets">
              {draft.tickets.map((ticket) => {
                const Icon = MODE_ICON[ticket.mode];
                const open = openId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className={`evt-ticket evt-ticket--${ticket.mode.toLowerCase()} ${
                      open ? 'is-open' : ''
                    } ${ticket.active ? '' : 'is-off'}`.trim()}
                  >
                    <div className="evt-ticket__row">
                      <span className="w-11 h-11 rounded-md bg-brand-tint-strong flex items-center justify-center">
                        <Icon size={19} color="#6D28FF" strokeWidth={1.8} />
                      </span>

                      <div className="evt-ticket__main">
                        <div className="flex items-center gap-2.5 text-[14.5px] font-semibold flex-wrap">
                          {ticket.name}
                          <span className={`evt-mode evt-mode--${ticket.mode.toLowerCase()}`}>
                            {MODE_LABEL[ticket.mode]}
                          </span>
                        </div>
                        <p>{ticket.description || 'Add a short description of what this includes.'}</p>
                        <div className="evt-ticket__perks">
                          {ticket.perks.map((perk) => (
                            <span key={perk}>
                              <Check size={11} color="#8B8A99" strokeWidth={2.4} />
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="evt-ticket__stat">
                        <span>Price</span>
                        <strong>{ticket.price === 0 ? 'Free' : rupiah(ticket.price)}</strong>
                        {ticket.earlyBird ? (
                          <em>Early Bird {rupiah(ticket.earlyBird)}</em>
                        ) : null}
                      </div>

                      <div className="evt-ticket__stat">
                        <span>Capacity</span>
                        <strong>{ticket.capacity === null ? 'Unlimited' : ticket.capacity}</strong>
                        <em>{ticketsLeft(ticket)}</em>
                      </div>

                      <label
                        className={`wiz-toggle evt-ticket__toggle ${ticket.active ? 'is-on' : ''}`.trim()}
                      >
                        <input
                          type="checkbox"
                          role="switch"
                          className="sr-only"
                          checked={ticket.active}
                          aria-label={`${ticket.name} on sale`}
                          onChange={(event) => update(ticket.id, { active: event.target.checked })}
                        />
                        <span className="wiz-toggle__track" aria-hidden="true">
                          <span className="wiz-toggle__knob" />
                        </span>
                      </label>

                      <button
                        type="button"
                        className="wiz-iconbtn wiz-iconbtn--ghost"
                        onClick={() => setOpenId(open ? null : ticket.id)}
                        aria-expanded={open}
                        aria-label={`Edit ${ticket.name}`}
                      >
                        <DotsVertical size={15} color="#8B8A99" />
                      </button>
                    </div>

                    {open ? (
                      <div className="flex flex-col gap-3.5 pt-4 pr-4 pb-4 pl-[18px] border-t border-t-line-faint bg-surface-alt">
                        <div className="wiz-pair">
                          <div>
                            <span className="block text-[13.5px] font-semibold text-ink">Ticket name</span>
                            <CounterInput
                              ariaLabel="Ticket name"
                              value={ticket.name}
                              onChange={(value) => update(ticket.id, { name: value })}
                              limit={60}
                              placeholder="e.g., Onsite Pass"
                            />
                          </div>
                          <div>
                            <span className="block text-[13.5px] font-semibold text-ink">Who it is for</span>
                            <SelectInput
                              ariaLabel="Ticket delivery mode"
                              value={ticket.mode}
                              options={DELIVERY_MODES}
                              onChange={(value) => update(ticket.id, { mode: value as DeliveryMode })}
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[13.5px] font-semibold text-ink">Description</span>
                          <CounterInput
                            ariaLabel="Ticket description"
                            value={ticket.description}
                            onChange={(value) => update(ticket.id, { description: value })}
                            limit={120}
                            placeholder="What does this ticket get them?"
                          />
                        </div>

                        <div className="wiz-triple">
                          <div>
                            <span className="block text-[13.5px] font-semibold text-ink">Price</span>
                            <AffixInput
                              ariaLabel="Ticket price"
                              prefix="Rp"
                              value={ticket.price.toLocaleString('id-ID')}
                              onChange={(value) =>
                                update(ticket.id, { price: Number(value.replace(/\D/g, '')) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <span className="block text-[13.5px] font-semibold text-ink">
                              Early bird <span className="font-normal text-grey">(Optional)</span>
                            </span>
                            <AffixInput
                              ariaLabel="Early bird price"
                              prefix="Rp"
                              value={ticket.earlyBird ? ticket.earlyBird.toLocaleString('id-ID') : ''}
                              onChange={(value) => {
                                const amount = Number(value.replace(/\D/g, ''));
                                update(ticket.id, { earlyBird: amount || undefined });
                              }}
                            />
                          </div>
                          <div>
                            <span className="block text-[13.5px] font-semibold text-ink">Capacity</span>
                            <AffixInput
                              ariaLabel="Ticket capacity"
                              suffix="seats"
                              placeholder="Unlimited"
                              value={ticket.capacity === null ? '' : String(ticket.capacity)}
                              onChange={(value) => {
                                const digits = value.replace(/\D/g, '');
                                update(ticket.id, { capacity: digits === '' ? null : Number(digits) });
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[13.5px] font-semibold text-ink">Includes</span>
                          <div className="wiz-tokens__suggest">
                            {TICKET_PERKS.map((perk) => {
                              const on = ticket.perks.includes(perk);
                              return (
                                <button
                                  key={perk}
                                  type="button"
                                  className={on ? 'is-on' : ''}
                                  aria-pressed={on}
                                  onClick={() =>
                                    update(ticket.id, {
                                      perks: on
                                        ? ticket.perks.filter((item) => item !== perk)
                                        : [...ticket.perks, perk],
                                    })
                                  }
                                >
                                  {on ? (
                                    <Check size={12} color="#6D28FF" strokeWidth={2.6} />
                                  ) : (
                                    <Plus size={12} color="#6D28FF" />
                                  )}
                                  {perk}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="wiz-iconbtn wiz-iconbtn--danger self-start"
                          onClick={() => {
                            set('tickets')(draft.tickets.filter((item) => item.id !== ticket.id));
                            setOpenId(null);
                            toast(`"${ticket.name}" removed`);
                          }}
                          aria-label={`Delete ${ticket.name}`}
                        >
                          <Trash size={15} color="#E11D48" strokeWidth={1.9} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="org-card wiz-panel">
          <span className="block text-[13.5px] font-semibold text-ink">General Ticket Settings</span>

          <div className="wiz-triple" style={{ marginTop: 14 }}>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">Sales Start</span>
              <div className="wiz-when">
                <span className="wiz-date">
                  <input
                    type="date"
                    value={draft.salesStart}
                    aria-label="Sales start date"
                    onChange={(event) => set('salesStart')(event.target.value)}
                  />
                </span>
                <span className="wiz-date">
                  <input
                    type="time"
                    value={draft.salesStartTime}
                    aria-label="Sales start time"
                    onChange={(event) => set('salesStartTime')(event.target.value)}
                  />
                </span>
              </div>
            </div>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">
                Sales End <span className="font-normal text-grey">(Optional)</span>
              </span>
              <div className="wiz-when">
                <span className="wiz-date">
                  <input
                    type="date"
                    value={draft.salesEnd}
                    min={draft.salesStart}
                    aria-label="Sales end date"
                    onChange={(event) => set('salesEnd')(event.target.value)}
                  />
                </span>
                <span className="wiz-date">
                  <input
                    type="time"
                    value={draft.salesEndTime}
                    aria-label="Sales end time"
                    onChange={(event) => set('salesEndTime')(event.target.value)}
                  />
                </span>
              </div>
            </div>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">Currency</span>
              <SelectInput
                ariaLabel="Currency"
                value={draft.currency}
                options={CURRENCIES}
                onChange={set('currency')}
              />
            </div>
          </div>

          <div className="wiz-pair" style={{ marginTop: 18 }}>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">Refund Policy</span>
              <SelectInput
                ariaLabel="Refund policy"
                value={draft.refundPolicy}
                options={REFUND_POLICIES}
                onChange={set('refundPolicy')}
              />
            </div>
            <div>
              <span className="block text-[13.5px] font-semibold text-ink">Payment Methods</span>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_METHOD_OPTIONS.map((method) => {
                  const on = draft.paymentMethods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      className={`evt-pay ${on ? 'is-on' : ''}`.trim()}
                      aria-pressed={on}
                      onClick={() =>
                        set('paymentMethods')(
                          on
                            ? draft.paymentMethods.filter((item) => item !== method)
                            : PAYMENT_METHOD_OPTIONS.filter(
                                (item) => item === method || draft.paymentMethods.includes(item),
                              ),
                        )
                      }
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="wiz-note">
          <span className="flex-none flex mt-px">
            <Info size={16} color="#6D28FF" strokeWidth={1.9} />
          </span>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-3)' }}>
            Hoople adds its 3% platform fee and the 1.8% gateway fee at checkout — the price above is
            what the participant sees for the ticket itself.
          </p>
        </div>
      </div>
    </>
  );
}
