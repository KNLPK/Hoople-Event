import { useState } from 'react';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Button } from '@/components/ui/Button';

interface NewsletterProps {
  /** Unique slot id so each page's envelope art is independent. */
  slotId: string;
  title?: string;
  body?: string;
}

/** "Stay in the loop" banner. Subscribing confirms inline — no backend here. */
export function Newsletter({
  slotId,
  title = 'Stay in the loop',
  body = 'Get updates on new activities, classes, and special offers.',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <form
      className="newsletter"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setEmail('');
      }}
    >
      <div className="w-[104px] h-[78px] float">
        <ImageSlot id={slotId} shape="rounded" radius={12} placeholder="Envelope 3D" />
      </div>
      <div>
        <div className="font-heading text-[19px] font-semibold text-brand-deep mb-[5px]">{title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--color-ink-3)' }}>{body}</div>
      </div>
      <div className="newsletter__form">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          aria-label="Email address"
        />
        <Button as="button" type="submit" variant="primary" style={{ height: 46, padding: '0 34px' }}>
          Subscribe
        </Button>
      </div>
      {subscribed ? (
        <p className="col-[1_/_-1] text-[13px] font-semibold text-green-deep" role="status">
          You're on the list — we'll email you when new sessions open.
        </p>
      ) : null}
    </form>
  );
}
