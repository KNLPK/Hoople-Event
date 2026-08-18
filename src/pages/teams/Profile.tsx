import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Calendar, Check, Lock, Mail, MapPin, Phone, Users } from '@/components/ui/icons';
import { statusTone } from '@/components/teams/EventContext';
import { DEPARTMENTS, ORGANIZATION, ORG_ADMIN, TEAM_EVENTS, type TeamEvent } from '@/data/teams';
import { compactDate } from '@/lib/format';

/**
 * What a member sees when they open an invite: who is running this, and what
 * else the organization has on. It is the closest thing this console has to a
 * public page -- except it is not public, only visible inside the directory.
 */
export function TeamsProfile() {
  const event = useOutletContext<TeamEvent>();
  const toast = useToast();

  const upcoming = TEAM_EVENTS.filter((item) => item.status === 'Published' || item.status === 'Ongoing').slice(0, 4);

  return (
    <div className="tm-cols">
      <div className="flex flex-col" style={{ gap: 18 }}>
        <Reveal className="org-card">
          <div className="h-[150px] relative overflow-hidden">
            <ImageSlot id="tm-profile-hero" shape="rect" placeholder="Company town hall on stage" />
          </div>
          <div className="flex items-end gap-4 flex-wrap pt-0 px-5 pb-5 mt-[-34px] relative">
            <span className="w-[84px] h-[84px] flex-none rounded-[20px] overflow-hidden border-4 border-[#fff] bg-[#fff] shadow-card">
              <ImageSlot id="tm-org-logo" shape="rounded" radius={18} placeholder="Logo" />
            </span>
            <div className="tm-profile__id">
              <h2>{ORGANIZATION.name}</h2>
              <p className="text-[12.5px] text-grey">
                {ORGANIZATION.legalName} · {ORGANIZATION.city}
              </p>
              <span className="tm-private" style={{ marginTop: 8 }}>
                <Lock size={12} color="#5B21F5" strokeWidth={2} />
                Visible to {ORGANIZATION.members} members only
              </span>
            </div>
            <Button as="button" variant="outline" size="sm" onClick={() => toast('Preview opens the member view')}>
              Preview as a member
            </Button>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="flex items-center justify-between gap-4 py-[18px] px-5 border-b border-b-line-faint">
            <h2 className="font-heading text-[15.5px] font-semibold">About</h2>
          </div>
          <div className="pt-2 px-5 pb-3 org-form">
            <label className="field field--full">
              <span className="field__label">What your members see</span>
              <textarea
                className="input textarea"
                rows={4}
                defaultValue={`People Ops runs the company calendar at ${ORGANIZATION.name}: the kick-off, quarterly town halls, onboarding for every new batch, and the standing Friday padel booking. Everything here is for colleagues only.`}
              />
            </label>
            <label className="field">
              <span className="field__label">Contact email</span>
              <input className="input" defaultValue={ORG_ADMIN.email} />
            </label>
            <label className="field">
              <span className="field__label">Contact number</span>
              <input className="input" defaultValue={ORG_ADMIN.phone} />
            </label>
          </div>
          <div className="pt-3.5 px-5 pb-[18px]">
            <Button as="button" variant="primary" onClick={() => toast('Profile saved')}>
              <Check size={16} strokeWidth={2.2} />
              Save profile
            </Button>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={120}>
          <div className="flex items-center justify-between gap-4 py-[18px] px-5 border-b border-b-line-faint">
            <h2 className="font-heading text-[15.5px] font-semibold">What is on</h2>
            <span className="text-[12.5px] text-grey">As members see it</span>
          </div>
          <div className="tm-sesslist">
            {upcoming.map((item) => (
              <div key={item.id} className="tm-sessrow">
                <span className="w-16 h-11 flex-none rounded-[10px] overflow-hidden bg-surface-chip">
                  <ImageSlot
                    id={`tm-cover-${item.id}`}
                    shape="rounded"
                    radius={10}
                    placeholder={item.photoHint}
                    interactive={false}
                  />
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                  <span className="flex items-center gap-2 flex-wrap text-[14px] font-semibold">
                    {item.title}
                    {item.id === event.id ? <em className="py-[3px] px-[9px] rounded-pill bg-green-tint text-green-deep text-[11px] font-bold not-italic">Open in console</em> : null}
                  </span>
                  <span className="tm-ctx__meta">
                    <span>
                      <Calendar size={14} color="#6B6A7B" strokeWidth={1.9} />
                      {item.dateLabel}
                    </span>
                    <span>
                      <MapPin size={14} color="#6B6A7B" strokeWidth={1.9} />
                      {item.venue}
                    </span>
                  </span>
                </span>
                <span className={`org-pill org-pill--${statusTone(item.status)}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <aside className="flex flex-col min-w-0" style={{ gap: 18 }}>
        <Reveal className="org-card">
          <div className="flex items-center justify-between gap-4 py-[18px] px-5 border-b border-b-line-faint">
            <h2 className="font-heading text-[15.5px] font-semibold">Owner</h2>
          </div>
          <div className="pt-2 px-5 pb-3">
            <div className="tm-person" style={{ marginBottom: 12 }}>
              <span className="tm-person__avatar tm-person__avatar--lg">
                <ImageSlot id="tm-admin-avatar" shape="circle" placeholder="" interactive={false} />
              </span>
              <span>
                <span className="org-table__title">{ORG_ADMIN.name}</span>
                <span className="org-table__sub">{ORG_ADMIN.role}</span>
              </span>
            </div>
            <div className="tm-aside__line">
              <Mail size={13} color="#8B8A99" strokeWidth={1.9} />
              {ORG_ADMIN.email}
            </div>
            <div className="tm-aside__line">
              <Phone size={13} color="#8B8A99" strokeWidth={1.9} />
              {ORG_ADMIN.phone}
            </div>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="flex items-center justify-between gap-4 py-[18px] px-5 border-b border-b-line-faint">
            <h2 className="font-heading text-[15.5px] font-semibold">Directory</h2>
            <span className="text-[12.5px] text-grey">{ORGANIZATION.members} members</span>
          </div>
          <div className="pt-2 px-5 pb-3">
            {DEPARTMENTS.map((department) => (
              <div key={department.name} className="tm-arow">
                <span>
                  <Users size={14} color="#8B8A99" strokeWidth={1.9} /> {department.name}
                </span>
                <strong>{department.headcount}</strong>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="org-card" delay={120}>
          <div className="flex items-center justify-between gap-4 py-[18px] px-5 border-b border-b-line-faint">
            <h2 className="font-heading text-[15.5px] font-semibold">Workspace</h2>
          </div>
          <div className="pt-2 px-5 pb-3">
            <div className="tm-arow">
              <span>Plan</span>
              <strong>{ORGANIZATION.plan}</strong>
            </div>
            <div className="tm-arow">
              <span>Handle</span>
              <strong>hoople.id/w/{ORGANIZATION.handle}</strong>
            </div>
            <div className="tm-arow">
              <span>Sign-in domain</span>
              <strong>@{ORGANIZATION.domain}</strong>
            </div>
            <div className="tm-arow">
              <span>Events run</span>
              <strong>{TEAM_EVENTS.length}</strong>
            </div>
            <div className="tm-arow">
              <span>Since</span>
              <strong>{compactDate('2025-02-03')}</strong>
            </div>
          </div>
        </Reveal>
      </aside>
    </div>
  );
}
