import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Card, Check, Doc, Download, Gear, Headset, Info, Wallet } from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import { Donut } from '@/components/teams/charts';
import {
  GATEWAY_FLAT,
  GATEWAY_RATE,
  ORGANIZATION,
  PAYOUT_ACCOUNT,
  REGISTRATIONS,
  collected,
  paidOrders,
  payoutSteps,
  settlement,
  type TeamEvent,
} from '@/data/teams';
import { compactDate, rupiah } from '@/lib/format';

/**
 * Where the money ends up.
 *
 * On the Organization plan Hoople charges a subscription, not a cut — so
 * unlike the organizer console there is no platform fee line taking 15% off a
 * whip-round between colleagues. Only the gateway charges per transaction.
 */
export function TeamsPayments() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const sum = settlement(event);
  const steps = payoutSteps(event);
  const free = collected(event) === 0;

  const transactions = REGISTRATIONS.filter((row) => row.orderId && row.payment === 'Paid').slice(0, 5);

  return (
    <>
      <EventContext event={event}>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Downloading the settlement report')}>
          <Download size={15} strokeWidth={1.9} />
          Download report
        </Button>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Payout settings')}>
          <Gear size={15} strokeWidth={1.9} />
          Payout settings
        </Button>
      </EventContext>

      {free ? (
        <Reveal className="org-card">
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="empty__title">Nothing to settle</div>
            <p className="empty__body">
              {event.title} is {event.costModel.toLowerCase()}, so no money passed through Hoople. Costs for this
              event sit with {event.organiser}.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="tm-cols">
          <div className="stack" style={{ gap: 18 }}>
            <Reveal className="org-stats org-stats--4">
              <Stat
                icon={<Wallet size={17} color="#6D28FF" strokeWidth={1.8} />}
                label="Collected"
                value={rupiah(sum.gross)}
                note={`From ${sum.orders} paid orders`}
              />
              <Stat
                icon={<Info size={17} color="#16A34A" strokeWidth={1.8} />}
                label="Platform fee"
                value={rupiah(0)}
                note="Included in the Organization plan"
              />
              <Stat
                icon={<Card size={17} color="#EA8C00" strokeWidth={1.8} />}
                label="Gateway fee"
                value={rupiah(sum.gatewayFee)}
                note={`${(GATEWAY_RATE * 100).toFixed(2)}% + ${rupiah(GATEWAY_FLAT)} per order`}
              />
              <Stat
                icon={<Wallet size={17} color="#6D28FF" strokeWidth={1.8} />}
                label="Net to settle"
                value={rupiah(sum.net)}
                note="After gateway fees"
                money
              />
            </Reveal>

            <div className="org-panels">
              <Reveal className="org-card">
                <div className="org-card__head">
                  <h2 className="org-card__title">Where the money goes</h2>
                </div>
                <div className="org-card__body">
                  <Donut
                    slices={[
                      {
                        label: 'To the organization',
                        value: sum.net,
                        tone: '#16A34A',
                        display: rupiah(sum.net),
                      },
                      {
                        label: 'Payment gateway',
                        value: sum.gatewayFee,
                        tone: '#6D28FF',
                        display: rupiah(sum.gatewayFee),
                      },
                    ]}
                    total={rupiah(sum.gross)}
                    caption="collected"
                  />
                </div>
              </Reveal>

              <Reveal className="org-card" delay={60}>
                <div className="org-card__head">
                  <h2 className="org-card__title">Fee configuration</h2>
                </div>
                <div className="org-card__body">
                  <Row label="Plan" value={`${ORGANIZATION.plan} — flat subscription`} />
                  <Row label="Platform fee" value="0% of collections" />
                  <Row label="Who pays the gateway fee" value="The member, at checkout" />
                  <Row label="Gateway" value="Midtrans" />
                  <Row label="Gateway fee model" value={`${(GATEWAY_RATE * 100).toFixed(2)}% + ${rupiah(GATEWAY_FLAT)} / order`} />
                  <Row label="Cost model" value={event.costModel} />
                  <p className="tm-muted" style={{ lineHeight: 1.7, marginTop: 14 }}>
                    An internal event is a whip-round between colleagues, not a sale. Taking a percentage of it would
                    be hard to explain to the people paying, so the plan covers it instead.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal className="org-card" delay={120}>
              <div className="org-card__head">
                <h2 className="org-card__title">Recent transactions</h2>
                <span className="tm-muted">{sum.orders} in total</span>
              </div>
              <div className="org-table-wrap">
                <table className="org-table tm-table">
                  <thead>
                    <tr>
                      <th>Date &amp; time</th>
                      <th>Description</th>
                      <th>Order</th>
                      <th className="org-table__num">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((row) => (
                      <tr key={row.id}>
                        <td>
                          {compactDate(row.registeredOn)}
                          <div className="org-table__sub">{row.paidAt}</div>
                        </td>
                        <td>
                          <span className="org-table__title">Contribution received</span>
                          <span className="org-table__sub">
                            {row.name} · {row.method}
                          </span>
                        </td>
                        <td>{row.orderId}</td>
                        <td className="org-table__num tm-tone-green" style={{ fontWeight: 600 }}>
                          + {rupiah(row.amount)}
                        </td>
                        <td>
                          <span className="org-pill org-pill--confirmed">Settled</span>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        {compactDate(event.startDate)}
                        <div className="org-table__sub">Rolling</div>
                      </td>
                      <td>
                        <span className="org-table__title">Payment gateway fees</span>
                        <span className="org-table__sub">Charged per order</span>
                      </td>
                      <td>{paidOrders(event)} orders</td>
                      <td className="org-table__num" style={{ fontWeight: 600, color: 'var(--danger)' }}>
                        − {rupiah(sum.gatewayFee)}
                      </td>
                      <td>
                        <span className="org-pill org-pill--confirmed">Settled</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>

          <aside className="stack tm-rail" style={{ gap: 18 }}>
            <Reveal className="org-card">
              <div className="org-card__head">
                <h2 className="org-card__title">Payout summary</h2>
              </div>
              <div className="org-card__body">
                <Row label="Event ends" value={`${compactDate(event.endDate)}, 12:00`} />
                <Row label="Eligible for payout" value={event.status === 'Ended' ? 'Yes' : 'After the event'} />
                <Row label="Payout schedule" value="H+1 after the event ends" />
                <Row label="Bank account" value={`${PAYOUT_ACCOUNT.bank} ${PAYOUT_ACCOUNT.masked}`} />
                <Row label="Account holder" value={PAYOUT_ACCOUNT.holder} />
                <Row label="Method" value={PAYOUT_ACCOUNT.method} />
                <div className="tm-arow tm-arow--total">
                  <span>Estimated payout</span>
                  <strong>{rupiah(sum.net)}</strong>
                </div>
              </div>
            </Reveal>

            <Reveal className="org-card" delay={60}>
              <div className="org-card__head">
                <h2 className="org-card__title">Payout progress</h2>
              </div>
              <div className="org-card__body">
                <ol className="tm-timeline">
                  {steps.map((step, index) => (
                    <li key={step.label} className={step.state === 'done' ? 'is-done' : ''}>
                      <span className="tm-timeline__mark">
                        {step.state === 'done' ? <Check size={12} color="#fff" /> : <em>{index + 1}</em>}
                      </span>
                      <span>
                        <strong>{step.label}</strong>
                        <em>{step.when}</em>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="tm-infobox">
                  <Info size={15} color="#6D28FF" strokeWidth={1.9} />
                  <p>
                    The transfer runs automatically one working day after {event.title} ends. Nothing to request.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="org-card" delay={120}>
              <div className="org-card__head">
                <h2 className="org-card__title">Reports</h2>
              </div>
              <div className="tm-quick">
                <button type="button" className="tm-quick__item" onClick={() => toast('Settlement statement downloaded')}>
                  <Doc size={16} color="#5C5B6B" strokeWidth={1.9} />
                  Settlement statement
                </button>
                <button type="button" className="tm-quick__item" onClick={() => toast('Transaction report downloaded')}>
                  <Doc size={16} color="#5C5B6B" strokeWidth={1.9} />
                  Transaction report
                </button>
                <button type="button" className="tm-quick__item" onClick={() => toast('Tax invoice (PPN) downloaded')}>
                  <Doc size={16} color="#5C5B6B" strokeWidth={1.9} />
                  Tax invoice (PPN)
                </button>
              </div>
            </Reveal>

            <Reveal className="org-card tm-tip" delay={180}>
              <div className="org-card__body">
                <div className="row" style={{ gap: 8, marginBottom: 8, fontWeight: 600, fontSize: 13.5 }}>
                  <Headset size={16} color="#EA8C00" strokeWidth={1.9} />
                  Question about a settlement?
                </div>
                <p className="tm-muted" style={{ lineHeight: 1.65 }}>
                  Finance can see this page too. Give them the event code {event.code} and they can match it against
                  the bank statement.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      )}
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

function Stat({
  icon,
  label,
  value,
  note,
  money,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  money?: boolean;
}) {
  return (
    <div className="org-stat">
      <div className="org-stat__head">
        <span className="org-stat__icon">{icon}</span>
        <span className="org-stat__label">{label}</span>
      </div>
      <div className={`org-stat__value ${money ? 'org-stat__value--money' : ''}`.trim()}>{value}</div>
      <div className="org-stat__note">{note}</div>
    </div>
  );
}
