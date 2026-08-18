import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { useToast } from '@/components/ui/Toast';
import { ChevronDown, Headset, Mail, Shield, Ticket } from '@/components/ui/icons';

const TOPICS = [
  {
    title: 'Bookings & e-tickets',
    faqs: [
      {
        question: 'Where do I find my e-ticket?',
        answer:
          'Open My Tickets in the top navigation, then My Bookings → View E-Ticket. Every confirmed booking carries its own QR code.',
      },
      {
        question: 'Can I bring someone else?',
        answer:
          'Yes — add up to five participants during checkout, and each one gets their own name on the ticket.',
      },
      {
        question: 'I booked the wrong session.',
        answer:
          'Move to another session free of charge up to 24 hours before it starts, from My Bookings → View Details.',
      },
    ],
  },
  {
    title: 'Payments & refunds',
    faqs: [
      {
        question: 'Which payment methods work?',
        answer:
          'QRIS, GoPay, ShopeePay, Virtual Account across the major banks, and credit or debit cards via Midtrans.',
      },
      {
        question: 'What is the refund policy?',
        answer:
          'Full refund up to 24 hours before the experience starts. Inside 24 hours the seat stays yours but is no longer refundable.',
      },
      {
        question: 'Why are there two fees at checkout?',
        answer:
          'A 3% Hoople platform fee and the payment gateway fee. Both are shown as separate lines so you always know what you are paying.',
      },
    ],
  },
  {
    title: 'For organizers',
    faqs: [
      {
        question: 'When does my payout arrive?',
        answer: 'H+1 — one working day after your event or session runs.',
      },
      {
        question: 'Can I use my own domain?',
        answer: 'Yes, white-label and custom domain are available on the Enterprise / Activation tier.',
      },
    ],
  },
];

export function Help() {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(TOPICS[0].faqs[0].question);

  return (
    <>
      <div className="mx-auto w-full max-w-page max-[900px]:px-gutter page-header">
        <h1>Help Center</h1>
        <p>Answers to the questions we get most, plus a direct line to a person when you need one.</p>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="grid grid--3" style={{ gap: 22 }}>
          <button type="button" className="why-card lift" style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast('Support replies on WhatsApp within 10 minutes')}>
            <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
              <Headset size={22} color="#6D28FF" strokeWidth={1.8} />
            </span>
            <h3>Chat with support</h3>
            <p>Our team is on WhatsApp every day, 08.00–22.00 WIB. Average reply time is under 10 minutes.</p>
          </button>
          <button type="button" className="why-card lift" style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast('Email us at support@hoople.id')}>
            <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
              <Mail size={22} color="#6D28FF" strokeWidth={1.8} />
            </span>
            <h3>Email us</h3>
            <p>support@hoople.id — best for refunds, invoices and anything with an attachment.</p>
          </button>
          <button type="button" className="why-card lift" style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => toast('Report sent to our trust & safety team')}>
            <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
              <Shield size={22} color="#6D28FF" strokeWidth={1.8} />
            </span>
            <h3>Report a problem</h3>
            <p>Something wrong with a listing, a host or a payment? Tell us and we'll look into it.</p>
          </button>
        </div>
      </Reveal>

      {TOPICS.map((topic, index) => (
        <Reveal key={topic.title} className="mx-auto w-full max-w-page px-gutter section" delay={index * 60}>
          <SectionHead size="sm" title={topic.title} />
          {topic.faqs.map((faq) => (
            <div key={faq.question} className={`faq-item ${open === faq.question ? 'is-open' : ''}`.trim()}>
              <button
                type="button"
                className="faq-item__q"
                onClick={() => setOpen(open === faq.question ? null : faq.question)}
                aria-expanded={open === faq.question}
              >
                {faq.question}
                <ChevronDown size={16} color="#8B8A99" />
              </button>
              {open === faq.question ? <div className="pt-0 px-4 pb-4 text-[13px] leading-[1.75] text-ink-3">{faq.answer}</div> : null}
            </div>
          ))}
        </Reveal>
      ))}

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="explore-banner">
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Still stuck?
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--color-ink-3)', lineHeight: 1.65, marginBottom: 20 }}>
              Send us your booking ID and we'll take it from there.
            </div>
            <Button as="button" variant="primary" onClick={() => toast('Support ticket opened — check your email')}>
              <Ticket size={16} strokeWidth={1.8} />
              Open a support ticket
            </Button>
          </div>
          <div className="bg-surface-panel rounded-lg py-4 px-[18px]" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Prototype notice</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-grey)', lineHeight: 1.7 }}>
              This build is a clickable prototype for stakeholder review. Authentication and payment are not
              verified, and no message sent from these forms reaches a real inbox.
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
