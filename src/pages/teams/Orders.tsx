import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Close, Doc, Download, Mail, Reset, Search, WhatsApp } from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import {
  GATEWAY_FLAT,
  GATEWAY_RATE,
  REGISTRATIONS,
  passOf,
  type PaymentState,
  type Registration,
  type TeamEvent,
} from '@/data/teams';
import { compactDate, rupiah } from '@/lib/format';

const STATES: (PaymentState | 'All')[] = ['All', 'Paid', 'Pending', 'Failed', 'Refunded'];

function tone(state: PaymentState): string {
  if (state === 'Paid') return 'paid';
  if (state === 'Pending') return 'pending';
  if (state === 'Failed') return 'cancelled';
  if (state === 'Refunded') return 'scheduled';
  return 'confirmed';
}

/**
 * Contributions, not ticket sales. A free pass leaves no order behind, so this
 * list only ever shows the members who owed something.
 */
export function TeamsOrders() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const [state, setState] = useState<PaymentState | 'All'>('All');
  const [query, setQuery] = useState('');
  const withOrders = useMemo(() => REGISTRATIONS.filter((row) => row.orderId), []);
  const [selected, setSelected] = useState<Registration | null>(withOrders[0] ?? null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return withOrders.filter((row) => {
      if (state !== 'All' && row.payment !== state) return false;
      if (!needle) return true;
      return `${row.orderId} ${row.name} ${row.email} ${row.employeeId}`.toLowerCase().includes(needle);
    });
  }, [withOrders, state, query]);

  const counts = {
    total: withOrders.length,
    paid: withOrders.filter((r) => r.payment === 'Paid').length,
    pending: withOrders.filter((r) => r.payment === 'Pending').length,
    failed: withOrders.filter((r) => r.payment === 'Failed').length,
    refunded: withOrders.filter((r) => r.payment === 'Refunded').length,
  };

  return (
    <>
      <EventContext event={event}>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Exporting the order list')}>
          <Download size={15} strokeWidth={1.9} />
          Export
        </Button>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Reconciling against the bank statement')}>
          <Reset size={15} strokeWidth={1.9} />
          Reconcile
        </Button>
      </EventContext>

      <div className={`tm-work ${selected ? 'has-aside' : ''}`.trim()}>
        <div className="flex flex-col" style={{ gap: 18 }}>
          <Reveal className="org-stats org-stats--4">
            <Stat label="Orders" value={String(counts.total)} note="Members who owed a contribution" />
            <Stat label="Paid" value={String(counts.paid)} note={`${Math.round((counts.paid / counts.total) * 100)}% settled`} up />
            <Stat label="Awaiting payment" value={String(counts.pending)} note="Reminder goes out at H−1" />
            <Stat label="Failed or refunded" value={String(counts.failed + counts.refunded)} note="Needs a follow-up" />
          </Reveal>

          <div className="org-filters">
            <label className="org-search" style={{ width: 300 }}>
              <Search size={17} color="#8B8A99" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order ID, member or employee ID"
                aria-label="Search orders"
              />
            </label>
            {STATES.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip chip-motion ${state === option ? 'is-active' : ''}`.trim()}
                onClick={() => setState(option)}
                aria-pressed={state === option}
              >
                {option}
              </button>
            ))}
          </div>

          <Reveal className="org-card">
            {rows.length ? (
              <div className="org-table-wrap">
                <table className="org-table tm-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Member</th>
                      <th>Pass</th>
                      <th className="org-table__num">Amount</th>
                      <th>Payment</th>
                      <th>Date</th>
                      <th className="org-table__num">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className={selected?.id === row.id ? 'is-selected' : undefined}
                        onClick={() => setSelected(row)}
                      >
                        <td className="tm-cell-main">
                          <span className="org-table__title">{row.orderId}</span>
                          <span className="org-table__sub">{row.method}</span>
                        </td>
                        <td>
                          <div className="tm-person">
                            <span className="tm-person__avatar">
                              <ImageSlot
                                id={`tm-member-avatar-${row.id}`}
                                shape="circle"
                                placeholder=""
                                interactive={false}
                              />
                            </span>
                            <span>
                              <span className="org-table__title">{row.name}</span>
                              <span className="org-table__sub">{row.employeeId}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="inline-block py-[3px] px-[9px] rounded-pill bg-brand-tint-strong text-brand-ink text-[11.5px] font-semibold">{passOf(event, row.passId)?.name}</span>
                          <span className="org-table__sub">
                            {row.quantity} {row.quantity === 1 ? 'seat' : 'seats'}
                          </span>
                        </td>
                        <td className="org-table__num" style={{ fontWeight: 600 }}>
                          {rupiah(row.amount)}
                        </td>
                        <td>
                          <span className={`org-pill org-pill--${tone(row.payment)}`}>{row.payment}</span>
                        </td>
                        <td>
                          {compactDate(row.registeredOn)}
                          <div className="org-table__sub">{row.paidAt || row.registeredAt}</div>
                        </td>
                        <td className="org-table__num">
                          <Button
                            as="button"
                            variant="outline"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setSelected(row);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 44, textAlign: 'center' }}>
                <div className="font-heading text-[17px] font-semibold mb-1.5">No orders match</div>
                <p className="text-[13.5px] text-grey mb-[18px]">Clear the filter, or search by order ID.</p>
              </div>
            )}
          </Reveal>
        </div>

        {selected ? (
          <aside className="tm-aside">
            <button type="button" className="tm-aside__close" onClick={() => setSelected(null)} aria-label="Close order details">
              <Close size={17} color="#5C5B6B" />
            </button>

            <div className="tm-aside__body">
              <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
                <strong style={{ fontSize: 15 }}>{selected.orderId}</strong>
                <span className={`org-pill org-pill--${tone(selected.payment)}`}>{selected.payment}</span>
              </div>

              <section className="mb-[22px]">
                <div className="tm-asection__head">
                  <h3>Member</h3>
                  <button
                    type="button"
                    className="tm-cardlink"
                    onClick={() => toast(`Opening WhatsApp for ${selected.name}`)}
                  >
                    <WhatsApp size={15} color="#16A34A" />
                  </button>
                </div>
                <div className="tm-person" style={{ marginBottom: 10 }}>
                  <span className="tm-person__avatar">
                    <ImageSlot
                      id={`tm-member-avatar-${selected.id}`}
                      shape="circle"
                      placeholder=""
                      interactive={false}
                    />
                  </span>
                  <span>
                    <span className="org-table__title">{selected.name}</span>
                    <span className="org-table__sub">{selected.email}</span>
                  </span>
                </div>
                <Row label="Employee ID" value={selected.employeeId} />
                <Row label="Department" value={selected.department} />
              </section>

              <section className="mb-[22px]">
                <div className="tm-asection__head">
                  <h3>Order summary</h3>
                  <span className="inline-block py-[3px] px-[9px] rounded-pill bg-brand-tint-strong text-brand-ink text-[11.5px] font-semibold">{passOf(event, selected.passId)?.name}</span>
                </div>
                <Row label="Quantity" value={`${selected.quantity} seats`} />
                <Row
                  label="Price per seat"
                  value={rupiah(passOf(event, selected.passId)?.price ?? 0)}
                />
                <Row label="Subtotal" value={rupiah(selected.amount)} />
                <Row label="Platform fee" value="No fee on the Organization plan" />
                <Row
                  label="Gateway fee"
                  value={rupiah(Math.round(selected.amount * GATEWAY_RATE + GATEWAY_FLAT))}
                />
                <div className="tm-arow tm-arow--total">
                  <span>Total paid</span>
                  <strong>{rupiah(selected.amount + Math.round(selected.amount * GATEWAY_RATE + GATEWAY_FLAT))}</strong>
                </div>
              </section>

              <section className="mb-[22px]">
                <div className="tm-asection__head">
                  <h3>Payment</h3>
                </div>
                <Row label="Method" value={selected.method} />
                <Row label="Gateway" value="Midtrans" />
                <Row label="Transaction ID" value={`MT-${selected.orderId.slice(-3)}X2A1B`} />
                <Row
                  label="Paid at"
                  value={selected.paidAt ? `${compactDate(selected.registeredOn)}, ${selected.paidAt}` : 'Not settled'}
                />
              </section>

              <div className="flex flex-col" style={{ gap: 8 }}>
                <Button as="button" variant="outline" size="sm" block onClick={() => toast('Invoice sent')}>
                  <Mail size={15} strokeWidth={1.9} />
                  Send invoice
                </Button>
                <Button as="button" variant="outline" size="sm" block onClick={() => toast('Receipt downloaded')}>
                  <Doc size={15} strokeWidth={1.9} />
                  Download receipt
                </Button>
                <Button
                  as="button"
                  variant="outline"
                  size="sm"
                  block
                  className="tm-danger-btn"
                  onClick={() => toast(`Refund started for ${selected.orderId}`)}
                >
                  Refund contribution
                </Button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="tm-arow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ label, value, note, up }: { label: string; value: string; note: string; up?: boolean }) {
  return (
    <div className="org-stat">
      <div className="text-[12.5px] text-grey font-medium leading-[1.35]" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div className="org-stat__value">{value}</div>
      <div className={`org-stat__note ${up ? 'is-up' : ''}`.trim()}>{note}</div>
    </div>
  );
}
