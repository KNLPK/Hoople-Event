import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Download, Info, Wallet } from '@/components/ui/icons';
import { ORG_REGISTRATIONS, PAYOUTS } from '@/data/organizer';
import { compactDate, rupiah } from '@/lib/format';

/** Payouts: what Hoople owes the organizer, and what has already settled. */
export function OrgPayouts() {
  const toast = useToast();

  const scheduled = PAYOUTS.filter((payout) => payout.status === 'Scheduled');
  const pendingTotal = scheduled.reduce((sum, payout) => sum + payout.net, 0);
  const paidTotal = PAYOUTS.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.net, 0);

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Payouts</h1>
          <p>Payout lands H+1 — one working day after the experience runs.</p>
        </div>
        <Button as="button" variant="neutral" onClick={() => toast('Exporting payout statement')}>
          <Download size={16} strokeWidth={1.9} />
          Export statement
        </Button>
      </div>

      <div className="flex flex-col" style={{ gap: 18 }}>
        <Reveal className="org-stats org-stats--3">
          <div className="bg-[#fff] border border-line rounded-xl p-4 shadow-card flex flex-col">
            <div className="org-stat__head">
              <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none bg-brand-tint-strong">
                <Wallet size={17} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <span className="text-[12.5px] text-grey font-medium leading-[1.35]">Scheduled payout</span>
            </div>
            <div className="org-stat__value org-stat__value--money">{rupiah(pendingTotal)}</div>
            <div className="org-stat__note">{scheduled.length} experiences awaiting settlement</div>
          </div>
          <div className="bg-[#fff] border border-line rounded-xl p-4 shadow-card flex flex-col">
            <div className="org-stat__head">
              <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none bg-brand-tint-strong">
                <Wallet size={17} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <span className="text-[12.5px] text-grey font-medium leading-[1.35]">Paid this quarter</span>
            </div>
            <div className="org-stat__value org-stat__value--money">{rupiah(paidTotal)}</div>
            <div className="org-stat__note">Net of platform and gateway fees</div>
          </div>
          <div className="bg-[#fff] border border-line rounded-xl p-4 shadow-card flex flex-col">
            <div className="org-stat__head">
              <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none bg-brand-tint-strong">
                <Info size={17} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <span className="text-[12.5px] text-grey font-medium leading-[1.35]">Fee model</span>
            </div>
            <div className="org-stat__value org-stat__value--money">3% + gateway</div>
            <div className="org-stat__note">Shown to every buyer at checkout</div>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="flex items-center justify-between gap-4 py-[18px] px-5 border-b border-b-line-faint">
            <h2 className="font-heading text-[15.5px] font-semibold">Payout history</h2>
          </div>
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Payout</th>
                  <th>Settles</th>
                  <th className="org-table__num">Gross</th>
                  <th className="org-table__num">Platform fee</th>
                  <th className="org-table__num">Gateway fee</th>
                  <th className="org-table__num">Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((payout) => (
                  <tr key={payout.id}>
                    <td>
                      <span className="org-table__title">{payout.experience}</span>
                      <span className="org-table__sub">{payout.id}</span>
                    </td>
                    <td>{payout.settledOn === '—' ? '—' : compactDate(payout.settledOn)}</td>
                    <td className="org-table__num">{rupiah(payout.gross)}</td>
                    <td className="org-table__num">−{rupiah(payout.platformFee)}</td>
                    <td className="org-table__num">−{rupiah(payout.gatewayFee)}</td>
                    <td className="org-table__num" style={{ fontWeight: 600 }}>
                      {rupiah(payout.net)}
                    </td>
                    <td>
                      <span
                        className={`org-pill org-pill--${
                          payout.status === 'On hold' ? 'hold' : payout.status.toLowerCase()
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </>
  );
}

/** Transactions: the individual payments behind those payouts. */
export function OrgTransactions() {
  const paid = ORG_REGISTRATIONS.filter((registration) => registration.status !== 'Cancelled');

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Transactions</h1>
          <p>Every payment collected on your behalf, before fees.</p>
        </div>
      </div>

      <Reveal className="org-card">
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Experience</th>
                <th>Date</th>
                <th>Status</th>
                <th className="org-table__num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paid.map((registration) => (
                <tr key={registration.id}>
                  <td>
                    <span className="org-table__title">{registration.name}</span>
                    <span className="org-table__sub">TRX-{registration.id.slice(-2)}-2026</span>
                  </td>
                  <td>{registration.experience}</td>
                  <td>
                    {compactDate(registration.date)}
                    <div className="org-table__sub">{registration.time} WIB</div>
                  </td>
                  <td>
                    <span className={`org-pill org-pill--${registration.status.toLowerCase()}`}>
                      {registration.status === 'Confirmed' ? 'Settled' : 'Awaiting payment'}
                    </span>
                  </td>
                  <td className="org-table__num">{rupiah(registration.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </>
  );
}
