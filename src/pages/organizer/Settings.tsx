import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { Check, Crown } from '@/components/ui/icons';
import { WORKSPACE } from '@/data/organizer';

const CATEGORIES = ['Community & Lifestyle', 'Sports & Fitness', 'Food & Drink', 'Arts & Culture', 'Education'];

export function OrgSettings() {
  const toast = useToast();
  const [name, setName] = useState(WORKSPACE.name);
  const [category, setCategory] = useState(WORKSPACE.category);
  const [email, setEmail] = useState('hello@waktuluang.id');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [domain, setDomain] = useState('waktuluang');
  const [payoutBank, setPayoutBank] = useState('BCA · 1234567890');
  const [absorbFees, setAbsorbFees] = useState(false);

  return (
    <>
      <div className="org-head">
        <div>
          <h1>Settings</h1>
          <p>Your workspace, how you get paid, and who sees what.</p>
        </div>
        <Button as="button" variant="primary" onClick={() => toast('Workspace settings saved')}>
          Save changes
        </Button>
      </div>

      <div className="flex flex-col" style={{ gap: 18 }}>
        <Reveal className="org-card">
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">Workspace</h2>
            <span className={`org-pill org-pill--${WORKSPACE.plan === 'Starter' ? 'draft' : 'confirmed'}`}>
              {WORKSPACE.plan} plan
            </span>
          </div>
          <div className="org-card__body" style={{ padding: 20 }}>
            <div className="flex items-center" style={{ gap: 16, marginBottom: 24 }}>
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flex: 'none',
                  background: 'var(--color-brand-tint-strong)',
                }}
              >
                <ImageSlot id="org-workspace-logo" shape="circle" placeholder="Logo" />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Workspace logo</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                  Drop a square image — it shows on your microsite and every e-ticket.
                </div>
              </div>
            </div>

            <div className="org-form">
              <label className="field">
                <span className="field__label">Organization name</span>
                <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
              </label>

              <label className="field">
                <span className="field__label">Category</span>
                <select
                  className="input"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {CATEGORIES.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Contact email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">WhatsApp number</span>
                <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>

              <label className="field org-form__full">
                <span className="field__label">Custom domain</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    className="input"
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    style={{ maxWidth: 260 }}
                  />
                  <span style={{ fontSize: 13.5, color: 'var(--color-grey)' }}>.hoople.id</span>
                  <span className="org-pill org-pill--draft">Enterprise only</span>
                </span>
              </label>
            </div>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={60}>
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">Payouts &amp; fees</h2>
          </div>
          <div className="org-card__body" style={{ padding: 20 }}>
            <div className="org-form">
              <label className="field">
                <span className="field__label">Payout account</span>
                <input
                  className="input"
                  value={payoutBank}
                  onChange={(event) => setPayoutBank(event.target.value)}
                />
                <span className="text-[12px] text-grey-soft mt-2">Payout lands H+1 after each experience runs.</span>
              </label>

              <div className="field">
                <span className="field__label">Who pays the fees?</span>
                <button
                  type="button"
                  className={`choice ${absorbFees ? 'is-on' : ''}`.trim()}
                  onClick={() => setAbsorbFees((value) => !value)}
                  aria-pressed={absorbFees}
                >
                  <span className="check-box" style={absorbFees ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)' } : undefined}>
                    {absorbFees ? <Check size={13} color="#fff" /> : null}
                  </span>
                  <span>
                    <span className="text-[14px] font-semibold">I absorb the fees</span>
                    <span className="text-[12.5px] text-grey mt-[3px]">
                      {absorbFees
                        ? 'Buyers see one price; fees come out of your payout.'
                        : 'Buyers see the 3% platform fee and gateway fee as separate lines.'}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="org-card" delay={120}>
          <div className="org-card__head">
            <h2 className="font-heading text-[15.5px] font-semibold">Plan</h2>
          </div>
          <div className="org-card__body" style={{ padding: 20 }}>
            <div className="flex items-center justify-between" style={{ gap: 20, flexWrap: 'wrap' }}>
              <div className="flex gap-[13px]">
                <span className="icon-tile">
                  <Crown size={17} color="#6D28FF" />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold mb-[5px]">You are on {WORKSPACE.plan}</div>
                  <div className="text-[12.5px] text-grey leading-[1.6]">
                    Ticketing and QR check-in are included. Pro adds Connect — WhatsApp CRM and retargeting —
                    plus session booking for recurring activities.
                  </div>
                </div>
              </div>
              <Button as="link" to="/pricing" variant="primary">
                Compare plans
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
