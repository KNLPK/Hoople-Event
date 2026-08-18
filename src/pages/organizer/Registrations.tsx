import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Download, Search } from '@/components/ui/icons';
import { ORG_REGISTRATIONS, type RegistrationStatus } from '@/data/organizer';
import { compactDate, rupiah } from '@/lib/format';

const FILTERS: (RegistrationStatus | 'All')[] = ['All', 'Confirmed', 'Pending', 'Cancelled'];

export function OrgRegistrations() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState<RegistrationStatus | 'All'>('All');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ORG_REGISTRATIONS.filter((registration) => {
      if (status !== 'All' && registration.status !== status) return false;
      if (!needle) return true;
      return `${registration.name} ${registration.email} ${registration.experience}`
        .toLowerCase()
        .includes(needle);
    });
  }, [query, status]);

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Registrations</h1>
          <p>Everyone who signed up across your experiences.</p>
        </div>
        <Button as="button" variant="neutral" onClick={() => toast('Exporting registrations as CSV')}>
          <Download size={16} strokeWidth={1.9} />
          Export CSV
        </Button>
      </div>

      <div className="org-filters">
        <label className="org-search" style={{ width: 320 }}>
          <Search size={17} color="#8B8A99" strokeWidth={2} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or experience"
            aria-label="Search registrations"
          />
        </label>
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip chip-motion ${status === option ? 'is-active' : ''}`.trim()}
            onClick={() => setStatus(option)}
            aria-pressed={status === option}
          >
            {option}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-grey)' }}>
          {rows.length} of {ORG_REGISTRATIONS.length} registrations
        </span>
      </div>

      <Reveal className="org-card">
        {rows.length ? (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="org-table__num">Tickets</th>
                  <th className="org-table__num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((registration) => (
                  <tr key={registration.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flex: 'none',
                            background: 'var(--color-brand-tint-strong)',
                          }}
                        >
                          <ImageSlot
                            id={`org-reg-avatar-${registration.id}`}
                            shape="circle"
                            placeholder=""
                            interactive={false}
                          />
                        </span>
                        <span>
                          <span className="org-table__title">{registration.name}</span>
                          <span className="org-table__sub">{registration.email}</span>
                        </span>
                      </div>
                    </td>
                    <td>{registration.experience}</td>
                    <td>
                      <span className={`org-pill org-pill--${registration.status.toLowerCase()}`}>
                        {registration.status}
                      </span>
                    </td>
                    <td>
                      {compactDate(registration.date)}
                      <div className="org-table__sub">{registration.time} WIB</div>
                    </td>
                    <td className="org-table__num">{registration.tickets}</td>
                    <td className="org-table__num">{rupiah(registration.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="empty__title">No registrations match</div>
            <p className="empty__body">Try a different search or clear the status filter.</p>
          </div>
        )}
      </Reveal>
    </>
  );
}
