import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import { Check } from '@/components/ui/icons';
import { PRICING_TIERS } from '@/data/pricing';

const FAQS = [
  {
    question: 'What does it cost to list?',
    answer: 'Nothing. Listing is free on every tier — you only pay when you sell a ticket.',
  },
  {
    question: 'When do I get paid?',
    answer: 'Payout lands H+1 — one working day after the event or session runs.',
  },
  {
    question: 'Who pays the fees?',
    answer:
      'By default the buyer sees the admin and gateway fee as separate lines at checkout. You can choose to absorb them instead.',
  },
  {
    question: 'Can I change tier later?',
    answer: 'Yes, up or down, at the start of any billing month. Nothing is locked in for a year.',
  },
];

export function Pricing() {
  const toast = useToast();

  return (
    <>
      <div className="mx-auto w-full max-w-page max-[900px]:px-gutter page-header">
        <h1>Pricing</h1>
        <p>
          Free to list, transparent at checkout, paid out H+1. Start with ticketing and add modules when your
          community is ready for them.
        </p>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="pricing-grid">
          {PRICING_TIERS.map((tier, index) => (
            <Reveal
              key={tier.name}
              delay={index * 70}
              className={`pricing-card lift ${'featured' in tier && tier.featured ? 'is-featured' : ''}`.trim()}
            >
              {'featured' in tier && tier.featured ? (
                <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: 14 }}>
                  Most popular
                </span>
              ) : null}
              <h3>{tier.name}</h3>
              <div className="text-[13px] text-grey mt-1.5 mx-0 mb-5">{tier.tagline}</div>
              <div className="font-heading text-[26px] font-bold tracking-[-0.02em]">{tier.price}</div>
              <div className="text-[12.5px] text-grey mt-1.5 mx-0 mb-[22px]">{tier.fee}</div>
              <ul>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} color="#16A34A" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                as={tier.name === 'Starter' ? 'link' : 'button'}
                to="/organizers"
                variant={'featured' in tier && tier.featured ? 'primary' : 'outline'}
                block
                onClick={
                  tier.name === 'Starter'
                    ? undefined
                    : () => toast('Our team will be in touch within one working day')
                }
              >
                {tier.cta}
              </Button>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="detail-split">
          <div>
            <SectionHead size="sm" title="Pricing questions" />
            {FAQS.map((faq) => (
              <div key={faq.question} className="faq-item is-open">
                <div className="faq-item__q" style={{ cursor: 'default' }}>
                  {faq.question}
                </div>
                <div className="pt-0 px-4 pb-4 text-[13px] leading-[1.75] text-ink-3">{faq.answer}</div>
              </div>
            ))}
          </div>

          <div className="cta-banner" style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <h2>Not sure which tier fits?</h2>
              <p>
                Tell us how many people you expect and how often you run. We'll tell you honestly whether you
                need Pro yet.
              </p>
            </div>
            <div className="flex gap-3.5 flex-wrap">
              <Button as="link" to="/organizers" variant="white" size="xl">
                Talk to our team
              </Button>
              <Button as="link" to="/how-it-works" variant="onDark" size="xl">
                How it works
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
