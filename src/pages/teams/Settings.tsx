import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Check, Globe, Lock, Mail, Shield, Users } from '@/components/ui/icons';
import { DEPARTMENTS, ORGANIZATION, ORG_ADMIN, PAYOUT_ACCOUNT, type TeamEvent } from '@/data/teams';

/** Who counts as a member, and what an internal event is allowed to be. */
export function TeamsSettings() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const [domainLock, setDomainLock] = useState(true);
  const [allowGuests, setAllowGuests] = useState(true);
  const [managerApproval, setManagerApproval] = useState(false);
  const [autoRemind, setAutoRemind] = useState(true);

  return (
    <div className="tm-cols">
      <div className="stack" style={{ gap: 18 }}>
        <Reveal className="org-card">
          <div className="org-card__head">
            <h2 className="org-card__title">Organization</h2>
          </div>
          <div className="org-card__body org-form">
            <label className="field">
              <span className="field__label">Organization name</span>
              <input className="input" defaultValue={ORGANIZATION.name} />
            </label>
            <label className="field">
              <span className="field__label">Legal entity</span>
              <input className="input" defaultValue={ORGANIZATION.legalName} />
            </label>
            <label className="field">
              <span className="field__label">Workspace handle</span>
              <input className="input" defaultValue={`hoople.id/w/${ORGANIZATION.handle}`} />
            </label>
            <label className="field">
              <span className="field__label">Primary city</span>
              <input className="input" defaultValue={ORGANIZATION.city} />
            </label>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="org-card__head">
            <h2 className="org-card__title">Who counts as a member</h2>
            <span className="tm-muted">{ORGANIZATION.members} members</span>
          </div>
          <div className="org-card__body">
            <Toggle
              on={domainLock}
              onChange={setDomainLock}
              icon={<Lock size={17} color="#6D28FF" strokeWidth={1.9} />}
              title={`Only @${ORGANIZATION.domain} accounts`}
              body="Anyone signing in with another address is refused, even with the link. This is what keeps internal events internal."
            />
            <Toggle
              on={allowGuests}
              onChange={setAllowGuests}
              icon={<Users size={17} color="#6D28FF" strokeWidth={1.9} />}
              title="Members can bring a guest"
              body="A guest gets a seat under the member's registration. They never get an account or see anything else."
            />
            <Toggle
              on={managerApproval}
              onChange={setManagerApproval}
              icon={<Shield size={17} color="#6D28FF" strokeWidth={1.9} />}
              title="Require manager approval"
              body="Registrations sit as Pending until the member's manager approves. Useful for events that cost working hours."
            />
            <Toggle
              on={autoRemind}
              onChange={setAutoRemind}
              icon={<Mail size={17} color="#6D28FF" strokeWidth={1.9} />}
              title="Remind members who have not answered"
              body="One nudge at H−3 and one at H−1, to the members who have not opened the invite."
            />
          </div>
        </Reveal>

        <Reveal className="org-card" delay={120}>
          <div className="org-card__head">
            <h2 className="org-card__title">Departments</h2>
            <span className="tm-muted">Used to pick an audience</span>
          </div>
          <div className="org-table-wrap">
            <table className="org-table tm-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th className="org-table__num">Headcount</th>
                  <th className="org-table__num">Share of the company</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((department) => (
                  <tr key={department.name}>
                    <td className="tm-cell-main">
                      <span className="org-table__title">{department.name}</span>
                    </td>
                    <td className="org-table__num">{department.headcount}</td>
                    <td className="org-table__num">
                      {Math.round((department.headcount / ORGANIZATION.members) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={180}>
          <div className="org-card__head">
            <h2 className="org-card__title">Collections</h2>
          </div>
          <div className="org-card__body">
            <Row label="Bank account" value={`${PAYOUT_ACCOUNT.bank} ${PAYOUT_ACCOUNT.masked}`} />
            <Row label="Account holder" value={PAYOUT_ACCOUNT.holder} />
            <Row label="Disbursement" value={PAYOUT_ACCOUNT.method} />
            <Row label="Platform fee" value="0% — included in the Organization plan" />
            <Row label="Payout schedule" value="H+1 after each event ends" />
          </div>
          <div className="org-card__foot">
            <Button as="button" variant="primary" onClick={() => toast('Organization settings saved')}>
              <Check size={16} strokeWidth={2.2} />
              Save changes
            </Button>
          </div>
        </Reveal>
      </div>

      <aside className="stack tm-rail" style={{ gap: 18 }}>
        <Reveal className="org-card">
          <div className="org-card__body" style={{ textAlign: 'center', paddingTop: 22 }}>
            <span className="tm-logo">
              <ImageSlot id="tm-org-logo" shape="rounded" radius={18} placeholder="Logo" />
            </span>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>{ORGANIZATION.name}</div>
            <div className="tm-muted">{ORGANIZATION.legalName}</div>
            <span className="tm-private" style={{ marginTop: 10 }}>
              <Lock size={12} color="#5B21F5" strokeWidth={2} />
              Private workspace
            </span>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="org-card__head">
            <h2 className="org-card__title">Admins</h2>
          </div>
          <div className="tm-quick">
            <span className="tm-quick__item">
              <Users size={16} color="#5C5B6B" strokeWidth={1.9} />
              {ORG_ADMIN.name} — Owner
            </span>
            <span className="tm-quick__item">
              <Users size={16} color="#5C5B6B" strokeWidth={1.9} />
              Rizky Pratama — Editor
            </span>
            <span className="tm-quick__item">
              <Users size={16} color="#5C5B6B" strokeWidth={1.9} />
              Siti Nurhaliza — Finance
            </span>
            <button type="button" className="tm-quick__item" onClick={() => toast('Invite sent')}>
              <Mail size={16} color="#5C5B6B" strokeWidth={1.9} />
              Invite an admin
            </button>
          </div>
        </Reveal>

        <Reveal className="org-card tm-tip" delay={120}>
          <div className="org-card__body">
            <div className="row" style={{ gap: 8, marginBottom: 8, fontWeight: 600, fontSize: 13.5 }}>
              <Globe size={16} color="#6D28FF" strokeWidth={1.9} />
              Not on the public site
            </div>
            <p className="tm-muted" style={{ lineHeight: 1.65 }}>
              Nothing in this workspace is indexed, searchable, or bookable from hoople.id. {event.title} exists only
              for the {ORGANIZATION.members} people in this directory.
            </p>
          </div>
        </Reveal>
      </aside>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  icon,
  title,
  body,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="tm-toggle">
      <span className="org-stat__icon">{icon}</span>
      <span className="tm-toggle__text">
        <strong>{title}</strong>
        <p>{body}</p>
      </span>
      <button
        type="button"
        className={`tm-switch ${on ? 'is-on' : ''}`.trim()}
        onClick={() => onChange(!on)}
        role="switch"
        aria-checked={on}
        aria-label={title}
      >
        <span />
      </button>
    </div>
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
