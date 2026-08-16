import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import {
  Check,
  CheckCircle,
  Close,
  Download,
  DotsVertical,
  Mail,
  Phone,
  Plus,
  Search,
  Users,
} from '@/components/ui/icons';
import { EventContext } from '@/components/teams/EventContext';
import {
  REGISTRATIONS,
  passOf,
  type AttendanceState,
  type PaymentState,
  type Registration,
  type TeamEvent,
} from '@/data/teams';
import { compactDate, rupiah } from '@/lib/format';

const PAYMENTS: (PaymentState | 'All')[] = ['All', 'Paid', 'Pending', 'Failed', 'Refunded', 'Covered'];
const ATTENDANCE: (AttendanceState | 'All')[] = ['All', 'Checked in', 'Not checked in', 'No show'];

function paymentTone(state: PaymentState): string {
  if (state === 'Paid') return 'paid';
  if (state === 'Pending') return 'pending';
  if (state === 'Failed') return 'cancelled';
  if (state === 'Refunded') return 'scheduled';
  return 'confirmed';
}

/** Who registered, whether they paid their share, and whether they turned up. */
export function TeamsRegistrations() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState<PaymentState | 'All'>('All');
  const [attendance, setAttendance] = useState<AttendanceState | 'All'>('All');
  const [selected, setSelected] = useState<Registration | null>(REGISTRATIONS[0]);
  const [ticked, setTicked] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return REGISTRATIONS.filter((row) => {
      if (payment !== 'All' && row.payment !== payment) return false;
      if (attendance !== 'All' && row.attendance !== attendance) return false;
      if (!needle) return true;
      return `${row.name} ${row.email} ${row.employeeId} ${row.department}`.toLowerCase().includes(needle);
    });
  }, [query, payment, attendance]);

  const counts = {
    total: event.registered,
    checkedIn: event.checkedIn,
    pending: REGISTRATIONS.filter((r) => r.payment === 'Pending').length,
    problem: REGISTRATIONS.filter((r) => r.payment === 'Failed' || r.attendance === 'No show').length,
  };

  function toggleAll() {
    setTicked((current) => (current.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  function toggle(id: string) {
    setTicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <EventContext event={event}>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Exporting registrations as CSV')}>
          <Download size={15} strokeWidth={1.9} />
          Export
        </Button>
        <Button as="button" variant="neutral" size="sm" onClick={() => toast('Email queued for the selected members')}>
          <Mail size={15} strokeWidth={1.9} />
          Send email
        </Button>
        <Button as="button" variant="primary" size="sm" onClick={() => toast('Add a member from the directory')}>
          <Plus size={15} strokeWidth={2.2} />
          Add member
        </Button>
      </EventContext>

      <div className={`tm-work ${selected ? 'has-aside' : ''}`.trim()}>
        <div className="stack" style={{ gap: 18 }}>
          <Reveal className="org-stats org-stats--4">
            <Stat label="Total registrations" value={String(counts.total)} note="↑ 18.6% vs last week" up />
            <Stat
              label="Checked in"
              value={String(counts.checkedIn)}
              note={`${Math.round((counts.checkedIn / counts.total) * 1000) / 10}% of registrations`}
            />
            <Stat label="Awaiting payment" value={String(counts.pending)} note="Contribution not settled" />
            <Stat label="Needs attention" value={String(counts.problem)} note="Failed payment or no show" />
          </Reveal>

          <div className="org-filters">
            <label className="org-search" style={{ width: 280 }}>
              <Search size={17} color="#8B8A99" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search member, email or employee ID"
                aria-label="Search registrations"
              />
            </label>
            <select
              className="org-select"
              value={payment}
              onChange={(e) => setPayment(e.target.value as PaymentState | 'All')}
              aria-label="Filter by payment"
            >
              {PAYMENTS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All payments' : option}
                </option>
              ))}
            </select>
            <select
              className="org-select"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value as AttendanceState | 'All')}
              aria-label="Filter by attendance"
            >
              {ATTENDANCE.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All attendance' : option}
                </option>
              ))}
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--grey)' }}>
              {rows.length} of {REGISTRATIONS.length} shown · {counts.total} in total
            </span>
          </div>

          {ticked.size ? (
            <div className="tm-bulk">
              <strong>{ticked.size} selected</strong>
              <Button as="button" variant="neutral" size="sm" onClick={() => toast(`${ticked.size} marked as checked in`)}>
                <CheckCircle size={15} strokeWidth={1.9} />
                Mark as checked in
              </Button>
              <Button as="button" variant="neutral" size="sm" onClick={() => toast(`Email sent to ${ticked.size} members`)}>
                <Mail size={15} strokeWidth={1.9} />
                Send email
              </Button>
              <Button as="button" variant="neutral" size="sm" onClick={() => toast('Export started')}>
                <Download size={15} strokeWidth={1.9} />
                Export selected
              </Button>
              <button type="button" className="tm-cardlink" onClick={() => setTicked(new Set())}>
                Clear selection
              </button>
            </div>
          ) : null}

          <Reveal className="org-card">
            <div className="org-table-wrap">
              <table className="org-table tm-table">
                <thead>
                  <tr>
                    <th className="tm-table__tick">
                      <input
                        type="checkbox"
                        checked={ticked.size > 0 && ticked.size === rows.length}
                        onChange={toggleAll}
                        aria-label="Select all shown"
                      />
                    </th>
                    <th>Member</th>
                    <th>Pass</th>
                    <th>Order</th>
                    <th>Payment</th>
                    <th>Attendance</th>
                    <th>Registered</th>
                    <th className="org-table__num">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const pass = passOf(event, row.passId);
                    return (
                      <tr
                        key={row.id}
                        className={selected?.id === row.id ? 'is-selected' : undefined}
                        onClick={() => setSelected(row)}
                      >
                        <td className="tm-table__tick">
                          <input
                            type="checkbox"
                            checked={ticked.has(row.id)}
                            onChange={() => toggle(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${row.name}`}
                          />
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
                              <span className="org-table__sub">
                                {row.employeeId} · {row.department}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="tm-passchip">{pass?.name ?? row.passId}</span>
                          <span className="org-table__sub">
                            {row.quantity} {row.quantity === 1 ? 'seat' : 'seats'}
                          </span>
                        </td>
                        <td>
                          <span className="org-table__title">{row.orderId || '—'}</span>
                          <span className="org-table__sub">{row.amount ? rupiah(row.amount) : 'No cost'}</span>
                        </td>
                        <td>
                          <span className={`org-pill org-pill--${paymentTone(row.payment)}`}>{row.payment}</span>
                        </td>
                        <td>
                          <span
                            className={`org-pill org-pill--${
                              row.attendance === 'Checked in'
                                ? 'confirmed'
                                : row.attendance === 'No show'
                                  ? 'cancelled'
                                  : 'pending'
                            }`}
                          >
                            {row.attendance}
                          </span>
                          {row.checkedInAt ? <span className="org-table__sub">{row.checkedInAt}</span> : null}
                        </td>
                        <td>
                          {compactDate(row.registeredOn)}
                          <div className="org-table__sub">{row.registeredAt}</div>
                        </td>
                        <td className="org-table__num">
                          <button
                            type="button"
                            className="org-icon-btn"
                            aria-label={`Actions for ${row.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toast(`Actions for ${row.name}`);
                            }}
                          >
                            <DotsVertical size={17} color="#5C5B6B" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {rows.length === 0 ? (
              <div style={{ padding: 44, textAlign: 'center' }}>
                <div className="empty__title">Nobody matches those filters</div>
                <p className="empty__body">Clear a filter, or search by employee ID.</p>
              </div>
            ) : null}
          </Reveal>
        </div>

        {selected ? <MemberPanel event={event} row={selected} onClose={() => setSelected(null)} /> : null}
      </div>
    </>
  );
}

function MemberPanel({ event, row, onClose }: { event: TeamEvent; row: Registration; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'pass' | 'activity'>('overview');
  const pass = passOf(event, row.passId);

  const timeline = [
    { label: 'Registered', when: `${compactDate(row.registeredOn)}, ${row.registeredAt}`, done: true },
    {
      label: row.payment === 'Covered' ? 'Covered by the company' : 'Payment completed',
      when: row.paidAt ? `${compactDate(row.registeredOn)}, ${row.paidAt}` : 'Not settled',
      done: row.payment === 'Paid' || row.payment === 'Covered',
    },
    { label: 'Reminder sent', when: `${compactDate(row.registeredOn)}, 20:00`, done: true },
    {
      label: 'Checked in',
      when: row.checkedInAt ? `${compactDate(event.startDate)}, ${row.checkedInAt}` : 'Not yet',
      done: row.attendance === 'Checked in',
    },
    { label: 'Event completed', when: '—', done: false },
  ];

  return (
    <aside className="tm-aside">
      <button type="button" className="tm-aside__close" onClick={onClose} aria-label="Close member details">
        <Close size={17} color="#5C5B6B" />
      </button>

      <div className="tm-aside__head">
        <span className="tm-aside__avatar">
          <ImageSlot id={`tm-member-avatar-${row.id}`} shape="circle" placeholder="" interactive={false} />
        </span>
        <div>
          <div className="tm-aside__name">
            {row.name}
            <span
              className={`org-pill org-pill--${row.attendance === 'Checked in' ? 'confirmed' : 'pending'}`}
            >
              {row.attendance}
            </span>
          </div>
          <div className="tm-aside__line">
            <Mail size={13} color="#8B8A99" strokeWidth={1.9} />
            {row.email}
          </div>
          <div className="tm-aside__line">
            <Phone size={13} color="#8B8A99" strokeWidth={1.9} />
            {row.phone}
          </div>
          <div className="tm-aside__line">
            <Users size={13} color="#8B8A99" strokeWidth={1.9} />
            {row.employeeId} · {row.title}, {row.department}
          </div>
        </div>
      </div>

      <div className="tm-tabs">
        {(['overview', 'pass', 'activity'] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={`tm-tab ${tab === option ? 'is-on' : ''}`.trim()}
            onClick={() => setTab(option)}
          >
            {option === 'overview' ? 'Overview' : option === 'pass' ? 'Pass & QR' : 'Activity'}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="tm-aside__body">
          <Section title="Pass" aside={<span className="tm-passchip">{pass?.name}</span>}>
            <Row label="Order ID" value={row.orderId || 'No order — free pass'} />
            <Row label="Quantity" value={`${row.quantity} ${row.quantity === 1 ? 'seat' : 'seats'}`} />
            <Row label="Price" value={pass && pass.price > 0 ? `${rupiah(pass.price)} / seat` : 'No cost'} />
            <Row label="Registered via" value={row.source} />
          </Section>

          <Section title="Payment" aside={<span className={`org-pill org-pill--${paymentTone(row.payment)}`}>{row.payment}</span>}>
            <Row label="Amount" value={row.amount ? rupiah(row.amount) : 'No cost'} />
            <Row label="Paid at" value={row.paidAt ? `${compactDate(row.registeredOn)}, ${row.paidAt}` : '—'} />
            <Row label="Method" value={row.method} />
          </Section>

          <Section title="Attendance timeline">
            <ol className="tm-timeline">
              {timeline.map((step) => (
                <li key={step.label} className={step.done ? 'is-done' : ''}>
                  <span className="tm-timeline__mark">{step.done ? <Check size={12} color="#fff" /> : null}</span>
                  <span>
                    <strong>{step.label}</strong>
                    <em>{step.when}</em>
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      ) : tab === 'pass' ? (
        <div className="tm-aside__body">
          <div className="tm-qr">
            <ImageSlot id={`tm-pass-qr-${row.id}`} shape="rounded" radius={12} placeholder="QR code" />
          </div>
          <p className="tm-muted" style={{ textAlign: 'center', lineHeight: 1.6 }}>
            Scanned at the door. The pass is tied to {row.employeeId}, so it cannot be forwarded to someone outside
            the organization.
          </p>
        </div>
      ) : (
        <div className="tm-aside__body">
          <ol className="tm-timeline">
            {timeline.map((step) => (
              <li key={step.label} className={step.done ? 'is-done' : ''}>
                <span className="tm-timeline__mark">{step.done ? <Check size={12} color="#fff" /> : null}</span>
                <span>
                  <strong>{step.label}</strong>
                  <em>{step.when}</em>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </aside>
  );
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="tm-asection">
      <div className="tm-asection__head">
        <h3>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
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
      <div className="org-stat__label" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div className="org-stat__value">{value}</div>
      <div className={`org-stat__note ${up ? 'is-up' : ''}`.trim()}>{note}</div>
    </div>
  );
}
