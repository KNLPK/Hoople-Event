import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Modal } from '@/components/ui/Modal';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { MiniCard } from '@/components/cards/MiniCard';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/store/session';
import { readCheckoutDraft, clearCheckoutDraft, writeCheckoutDraft } from '@/store/checkout';
import {
  ArrowRight,
  Bolt,
  Calendar,
  Card,
  Check,
  ChevronDown,
  Clock,
  Close,
  Copy,
  Doc,
  Download,
  Headset,
  Info,
  Lock,
  MapPin,
  Plus,
  Share,
  ShieldCheck,
  StarOutline,
  Ticket,
  Trash,
  User,
} from '@/components/ui/icons';
import { ACTIVITIES, getActivity } from '@/data/activities';
import { EVENT_BY_SLUG } from '@/data/events';
import { sessionsOn } from '@/data/schedule';
import { PAYMENT_METHODS, priceBreakdown } from '@/data/pricing';
import { useBookings } from '@/store/bookings';
import { fireConfetti } from '@/lib/motion';
import { idr, longDate, timeRange } from '@/lib/format';
import type { Booking as BookingRecord, Participant } from '@/data/types';
import { copyText } from '@/lib/clipboard';

type Step = 1 | 2 | 3;
type PayScreen = 'methods' | 'pay';

const MAX_PARTICIPANTS = 5;
const COUNTDOWN_SECONDS = 15 * 60;

const EMPTY_PARTICIPANT: Participant = { name: '', email: '', phone: '' };

export function Booking() {
  const [params] = useSearchParams();
  const toast = useToast();
  const { createBooking } = useBookings();

  const eventSlug = params.get('event');
  const eventItem = eventSlug ? EVENT_BY_SLUG.get(eventSlug) : undefined;
  const activity = eventItem ? undefined : getActivity(params.get('activity') ?? 'pottery-class');
  const date = params.get('date') ?? '';
  const sessionId = params.get('session') ?? '';

  const session = useMemo(() => {
    if (!activity) return undefined;
    const onDate = date ? sessionsOn(activity, date) : [];
    return onDate.find((item) => item.id === sessionId) ?? onDate[0];
  }, [activity, date, sessionId]);

  /** One shape for both product types, so the rest of checkout stays identical. */
  const subject = eventItem
    ? {
        slug: eventItem.slug,
        title: eventItem.title,
        host: eventItem.host,
        kind: 'EVENT' as const,
        photoHint: eventItem.photoHint,
        venueName: eventItem.venueName,
        venueArea: eventItem.area,
        venueCity: eventItem.area.split(', ').slice(-1)[0],
        date: eventItem.date,
        start: eventItem.start,
        end: eventItem.end,
        unitPrice: eventItem.price,
        ticketType: 'General Admission',
        detailPath: `/events/${eventItem.slug}`,
      }
    : activity
      ? {
          slug: activity.slug,
          title: activity.title,
          host: activity.host,
          kind: activity.kind,
          photoHint: activity.photoHint,
          venueName: activity.venue.name,
          venueArea: activity.venue.area,
          venueCity: activity.venue.city,
          date: session?.date || date,
          start: session?.start ?? '',
          end: session?.end ?? '',
          unitPrice: session?.price ?? activity.priceFrom,
          ticketType: session ? `${session.name} — Regular Ticket` : 'Regular Ticket',
          detailPath: `/activities/${activity.slug}`,
        }
      : undefined;

  const [step, setStep] = useState<Step>(1);
  const [payOpen, setPayOpen] = useState(false);
  const [payScreen, setPayScreen] = useState<PayScreen>('methods');
  const [method, setMethod] = useState(PAYMENT_METHODS[0].name);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const [buyer, setBuyer] = useState<Participant>({
    name: 'Adriani Ajeng',
    email: 'adriani.ajeng@gmail.com',
    phone: '+62 812 3456 7890',
  });
  const [buyerIsParticipant, setBuyerIsParticipant] = useState(true);
  const [extraParticipants, setExtraParticipants] = useState<Participant[]>([]);
  const [consentMedia, setConsentMedia] = useState(true);
  const [consentTerms, setConsentTerms] = useState(true);

  const [confirmed, setConfirmed] = useState<BookingRecord | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const { isSignedIn } = useSession();
  const navigate = useNavigate();

  /*
   * Coming back from the sign-in gate: everything typed before was parked in
   * the checkout draft, so restore it and open the payment sheet straight
   * away. Nobody should have to fill the form twice to pay for one seat.
   */
  useEffect(() => {
    if (params.get('resume') !== '1' || !isSignedIn) return;
    const saved = readCheckoutDraft();
    if (saved) {
      setBuyer(saved.buyer);
      setBuyerIsParticipant(saved.buyerIsParticipant);
      setExtraParticipants(saved.extraParticipants);
      setConsentMedia(saved.consentMedia);
      setConsentTerms(saved.consentTerms);
    }
    clearCheckoutDraft();
    setPayScreen('methods');
    setSecondsLeft(COUNTDOWN_SECONDS);
    setPayOpen(true);
    setStep(2);
  }, [params, isSignedIn]);

  const participants: Participant[] = buyerIsParticipant
    ? [buyer, ...extraParticipants]
    : extraParticipants.length
      ? extraParticipants
      : [EMPTY_PARTICIPANT];

  const unitPrice = subject?.unitPrice ?? 0;
  const money = priceBreakdown(unitPrice, participants.length);

  useEffect(() => {
    if (!payOpen || payScreen !== 'pay') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [payOpen, payScreen]);

  useEffect(() => {
    if (step === 3 && successRef.current) fireConfetti(successRef.current);
  }, [step]);

  if (!subject) return <Navigate to="/activities" replace />;

  const ticketDate = subject.date;
  const start = subject.start;
  const end = subject.end;

  function completePayment() {
    if (!subject) return;
    const booking = createBooking({
      slug: subject.slug,
      title: subject.title,
      host: subject.host,
      kind: subject.kind,
      ticketType: subject.ticketType,
      date: subject.date,
      start: subject.start,
      end: subject.end,
      venueName: subject.venueName,
      venueArea: subject.venueArea,
      venueCity: subject.venueCity,
      photoHint: subject.photoHint,
      unitPrice: subject.unitPrice,
      participants,
      buyer,
      paymentMethod: method,
    });
    setConfirmed(booking);
    setPayOpen(false);
    setStep(3);
    window.scrollTo(0, 0);
  }

  /**
   * Paying needs an account, browsing does not. If they are not signed in we
   * park the form and send them to the gate with a `next` that returns here
   * and resumes — see the resume effect above.
   */
  function goToPayment() {
    if (!isSignedIn) {
      writeCheckoutDraft({
        buyer,
        buyerIsParticipant,
        extraParticipants,
        consentMedia,
        consentTerms,
      });
      const back = `/booking?${params.toString()}${params.toString() ? '&' : ''}resume=1`;
      navigate(`/auth?next=${encodeURIComponent(back)}`);
      return;
    }
    setPayScreen('methods');
    setSecondsLeft(COUNTDOWN_SECONDS);
    setPayOpen(true);
    setStep(2);
  }

  const canContinue =
    consentTerms &&
    buyer.name.trim() !== '' &&
    buyer.email.trim() !== '' &&
    participants.every((participant) => participant.name.trim() !== '');

  const countdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
    secondsLeft % 60,
  ).padStart(2, '0')}`;

  const suggestions = ACTIVITIES.filter((item) => item.slug !== subject.slug).slice(0, 4);

  return (
    <>
      <div className="mx-auto w-full max-w-page px-gutter" style={{ paddingTop: 34 }}>
        <Stepper step={step} />
      </div>

      {/* Step 2 keeps the form mounted behind the payment modal. */}
      {step !== 3 ? (
        <>
          <div className="mx-auto w-full max-w-page px-gutter" style={{ paddingTop: 40 }}>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Complete Your Booking
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--color-ink-muted)' }}>
              Please fill in your details to complete your booking.
            </p>
          </div>

          <div className="mx-auto w-full max-w-page px-gutter checkout-layout" style={{ paddingTop: 28 }}>
            <div className="flex flex-col" style={{ gap: 22 }}>
              {/* 1. Buyer */}
              <Reveal className="panel panel--lg">
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, marginBottom: 5 }}>
                  1. Buyer Information
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-grey)', marginBottom: 22 }}>
                  This information will be used for your order and payment.
                </div>
                <div className="grid grid--2" style={{ gap: '20px 24px' }}>
                  <TextField
                    label="First Name"
                    required
                    value={buyer.name.split(' ')[0] ?? ''}
                    onChange={(value) =>
                      setBuyer({ ...buyer, name: `${value} ${buyer.name.split(' ').slice(1).join(' ')}`.trim() })
                    }
                  />
                  <TextField
                    label="Last Name"
                    required
                    value={buyer.name.split(' ').slice(1).join(' ')}
                    onChange={(value) => setBuyer({ ...buyer, name: `${buyer.name.split(' ')[0]} ${value}`.trim() })}
                  />
                  <TextField
                    label="Email Address"
                    required
                    type="email"
                    value={buyer.email}
                    onChange={(value) => setBuyer({ ...buyer, email: value })}
                  />
                  <PhoneField
                    label="Phone Number"
                    required
                    value={buyer.phone}
                    onChange={(value) => setBuyer({ ...buyer, phone: value })}
                  />
                </div>
              </Reveal>

              {/* 2. Participants */}
              <Reveal className="panel panel--lg" delay={60}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, marginBottom: 5 }}>
                  2. Participant Information
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-grey)', marginBottom: 20 }}>
                  Please provide details for each participant.
                </div>

                <div className="grid grid--2" style={{ gap: 22, marginBottom: 22 }}>
                  <button
                    type="button"
                    className={`choice ${buyerIsParticipant ? 'is-on' : ''}`.trim()}
                    onClick={() => setBuyerIsParticipant(true)}
                  >
                    <span className="radio-dot">{buyerIsParticipant ? <span /> : null}</span>
                    <span>
                      <span className="text-[14px] font-semibold">Buyer is the participant</span>
                      <span className="text-[12.5px] text-grey mt-[3px]">I will attend this experience</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`choice ${buyerIsParticipant ? '' : 'is-on'}`.trim()}
                    onClick={() => {
                      setBuyerIsParticipant(false);
                      if (!extraParticipants.length) setExtraParticipants([{ ...EMPTY_PARTICIPANT }]);
                    }}
                  >
                    <span className="radio-dot">{buyerIsParticipant ? null : <span />}</span>
                    <span>
                      <span className="text-[14px] font-semibold">Different participant</span>
                      <span className="text-[12.5px] text-grey mt-[3px]">Someone else will attend</span>
                    </span>
                  </button>
                </div>

                {participants.map((participant, index) => {
                  const isBuyer = buyerIsParticipant && index === 0;
                  const extraIndex = buyerIsParticipant ? index - 1 : index;
                  return (
                    <div key={index} className="participant-card">
                      <div className="flex items-center gap-[11px] mb-5">
                        <User size={18} color="#3C3A4A" strokeWidth={1.8} />
                        <span style={{ fontSize: 14.5, fontWeight: 600 }}>Participant {index + 1}</span>
                        {index === 0 ? <span className="tag">Primary</span> : null}
                        {!isBuyer ? (
                          <button
                            type="button"
                            className="ml-auto"
                            style={{ border: 0, background: 'none', cursor: 'pointer', display: 'flex' }}
                            onClick={() =>
                              setExtraParticipants((list) => list.filter((_, i) => i !== extraIndex))
                            }
                            aria-label={`Remove participant ${index + 1}`}
                          >
                            <Trash size={17} color="#B4B2C0" />
                          </button>
                        ) : null}
                      </div>

                      <div
                        className="grid"
                        style={{ gap: '20px 24px', marginBottom: 20 }}
                      >
                        <TextField
                          label="Full Name"
                          required
                          value={participant.name}
                          disabled={isBuyer}
                          onChange={(value) =>
                            setExtraParticipants((list) =>
                              list.map((item, i) => (i === extraIndex ? { ...item, name: value } : item)),
                            )
                          }
                        />
                        <TextField
                          label="Email (optional)"
                          type="email"
                          value={participant.email}
                          disabled={isBuyer}
                          onChange={(value) =>
                            setExtraParticipants((list) =>
                              list.map((item, i) => (i === extraIndex ? { ...item, email: value } : item)),
                            )
                          }
                        />
                      </div>
                      <div style={{ maxWidth: '50%' }}>
                        <PhoneField
                          label="Phone Number (optional)"
                          value={participant.phone}
                          disabled={isBuyer}
                          onChange={(value) =>
                            setExtraParticipants((list) =>
                              list.map((item, i) => (i === extraIndex ? { ...item, phone: value } : item)),
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="add-participant"
                  disabled={participants.length >= MAX_PARTICIPANTS}
                  onClick={() => setExtraParticipants((list) => [...list, { ...EMPTY_PARTICIPANT }])}
                >
                  <span className="w-[34px] h-[34px] rounded-[50%] bg-brand-tint-strong flex items-center justify-center flex-none">
                    <Plus size={18} color="#6D28FF" />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-brand)' }}>
                      Add More Participants
                    </span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                      You can add up to {MAX_PARTICIPANTS} participants
                    </span>
                  </span>
                </button>
              </Reveal>

              {/* 3. Consent */}
              <Reveal className="panel panel--lg" delay={120}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>
                  3. Consent &amp; Agreement
                </div>
                <div className="flex gap-3.5 text-left" style={{ marginBottom: 20 }}>
                  <button
                    type="button"
                    className={`check-box ${consentMedia ? 'is-on' : ''}`.trim()}
                    onClick={() => setConsentMedia((on) => !on)}
                    aria-pressed={consentMedia}
                    aria-label="Consent to photos and video"
                  >
                    {consentMedia ? <Check size={13} color="#fff" /> : null}
                  </button>
                  <div>
                    <div className="text-[14px] font-medium mb-[5px]">
                      I agree to appear in photos or videos taken during this experience
                    </div>
                    <div className="text-[12.5px] text-grey leading-[1.6]">
                      I understand that these may be used for documentation, promotional materials, and social
                      media by the host.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3.5 text-left">
                  <button
                    type="button"
                    className={`check-box ${consentTerms ? 'is-on' : ''}`.trim()}
                    onClick={() => setConsentTerms((on) => !on)}
                    aria-pressed={consentTerms}
                    aria-label="Agree to terms and refund policy"
                  >
                    {consentTerms ? <Check size={13} color="#fff" /> : null}
                  </button>
                  <div>
                    <div className="text-[14px] font-medium mb-[5px]">
                      I agree to the Terms &amp; Conditions and Refund Policy{' '}
                      <span className="text-danger">*</span>
                    </div>
                    <div className="text-[12.5px] text-grey leading-[1.6]">
                      By continuing, you agree to Hoople's Terms of Service and the host's Refund Policy.
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Continue */}
              <Reveal className="panel panel--lg" delay={180}>
                <div
                  className="flex items-center justify-between"
                  style={{ gap: 30, flexWrap: 'wrap' }}
                >
                  <div className="flex items-center" style={{ gap: 14 }}>
                    <span className="icon-tile" style={{ borderRadius: '50%', width: 36, height: 36 }}>
                      <ShieldCheck size={18} color="#6D28FF" strokeWidth={1.8} />
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Your data is secure and encrypted</div>
                      <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                        We use industry-standard security to protect your information.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      as="button"
                      variant="primary"
                      size="xl"
                      halo
                      disabled={!canContinue}
                      onClick={goToPayment}
                      style={{ width: 280 }}
                    >
                      Continue to Payment
                      <ArrowRight size={17} strokeWidth={2.2} />
                    </Button>
                    <div
                      className="flex items-center"
                      style={{ justifyContent: 'center', gap: 7, fontSize: 12, color: 'var(--color-grey-soft)', marginTop: 10 }}
                    >
                      <Lock size={13} color="#8B8A99" strokeWidth={2} />
                      You'll be redirected to our secure payment partner
                    </div>
                  </div>
                </div>
                {canContinue ? null : (
                  <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--color-amber-ink)' }}>
                    Add a name for every participant and accept the Terms &amp; Refund Policy to continue.
                  </p>
                )}
              </Reveal>
            </div>

            {/* Sticky summary */}
            <aside className="checkout-aside">
              <div className="panel">
                <div className="panel__title">Booking Summary</div>
                <SummaryItem
                  slotId={`booking-thumb-${subject.slug}`}
                  photoHint={subject.photoHint}
                  title={subject.title}
                  host={subject.host}
                  date={ticketDate}
                  start={start}
                  end={end}
                  venueName={subject.venueName}
                  venueArea={`${subject.venueArea}, ${subject.venueCity}`}
                />

                <div className="divider" />
                <div className="panel__title panel__title--sm" style={{ marginBottom: 14 }}>
                  Your Selection
                </div>
                <div className="price-row">
                  <span className="flex items-center gap-[7px] text-ink-2">{subject.ticketType}</span>
                  <span className="font-medium whitespace-nowrap">{unitPrice === 0 ? 'Free' : idr(unitPrice)}</span>
                </div>
                <div className="price-row">
                  <span className="flex items-center gap-[7px] text-ink-2">Quantity</span>
                  <span className="font-medium whitespace-nowrap">{participants.length}</span>
                </div>

                <div className="divider" />
                <div className="panel__title panel__title--sm" style={{ marginBottom: 14 }}>
                  Price Breakdown
                </div>
                <PriceBreakdownRows
                  subtotal={money.subtotal}
                  platformFee={money.platformFee}
                  gatewayFee={money.gatewayFee}
                  quantity={participants.length}
                />
                <div className="divider divider--dashed" style={{ margin: '20px 0 16px' }} />
                <div className="price-total">
                  <span>Total Payment</span>
                  <span>{idr(money.total)}</span>
                </div>

                <div className="bg-surface-panel rounded-lg py-4 px-[18px]" style={{ marginTop: 20, display: 'flex', gap: 13 }}>
                  <ShieldCheck size={20} color="#6D28FF" strokeWidth={1.8} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>Full Refund Available</div>
                    <div style={{ fontSize: 12.5, color: 'var(--color-grey)', lineHeight: 1.6 }}>
                      You can request a full refund up to 24 hours before the experience starts.
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel__title panel__title--sm" style={{ marginBottom: 8 }}>
                  Need Help?
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-grey)', lineHeight: 1.65, marginBottom: 16 }}>
                  If you have any questions, our support team is here to help.
                </div>
                <Button
                  as="button"
                  variant="ghost"
                  block
                  onClick={() => toast('Support is on WhatsApp — we reply within 10 minutes')}
                >
                  <Headset size={17} strokeWidth={1.8} />
                  Contact Support
                </Button>
              </div>
            </aside>
          </div>

          <Reveal className="mx-auto w-full max-w-page px-gutter pt-[30px]">
            <div className="trust-strip">
              <div>
                <StarOutline size={26} color="#6D28FF" strokeWidth={1.7} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Trusted by thousands</div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                    4.8/5 from 2,500+ reviews
                  </div>
                </div>
              </div>
              <div>
                <Lock size={26} color="#6D28FF" strokeWidth={1.7} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Secure Payment</div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                    Your payment is safe with us
                  </div>
                </div>
              </div>
              <div>
                <Bolt size={26} color="#6D28FF" strokeWidth={1.7} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Instant Confirmation</div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                    Get your ticket right after payment
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </>
      ) : null}

      {/* Step 3 — confirmation */}
      {step === 3 && confirmed ? (
        <>
          <div className="mx-auto w-full px-gutter done-layout" style={{ paddingTop: 30 }}>
            <div className="panel panel--lg" ref={successRef} style={{ borderRadius: 18, padding: '34px 36px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="w-[66px] h-[66px] rounded-[50%] bg-green inline-flex items-center justify-center mb-5">
                  <Check size={30} color="#fff" />
                </div>
                <h2 style={{ fontSize: 29, fontWeight: 700, marginBottom: 10 }}>Payment Successful!</h2>
                <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.7, marginBottom: 22 }}>
                  Thank you for your booking. We've sent the details to{' '}
                  <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{confirmed.buyer.email}</strong>
                </p>
              </div>

              <div className="order-strip">
                <div>
                  <Doc size={19} color="#16A34A" strokeWidth={1.8} />
                  <div>
                    <div style={{ fontSize: 12.5, color: '#4B5A50' }}>Order ID</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{confirmed.orderId}</div>
                  </div>
                </div>
                <div>
                  <Card size={19} color="#16A34A" strokeWidth={1.8} />
                  <div>
                    <div style={{ fontSize: 12.5, color: '#4B5A50' }}>Payment Method</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{confirmed.paymentMethod}</div>
                  </div>
                </div>
                <div>
                  <Clock size={19} color="#16A34A" strokeWidth={1.8} />
                  <div>
                    <div style={{ fontSize: 12.5, color: '#4B5A50' }}>Payment Time</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{confirmed.paidAt}</div>
                  </div>
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-grey)', margin: '20px 0 26px' }}>
                A confirmation email has been sent with your e-ticket(s) and booking details.
              </p>

              <div className="eticket">
                <div className="flex items-center justify-between" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 600 }}>
                      Your E-Ticket
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-grey)', marginTop: 4 }}>
                      Show this QR code at the entrance for verification.
                    </div>
                  </div>
                  <span className="tag" style={{ fontSize: 12, padding: '6px 12px' }}>
                    {confirmed.participants.length}{' '}
                    {confirmed.participants.length === 1 ? 'Ticket' : 'Tickets'}
                  </span>
                </div>

                <div className="eticket__grid">
                  <div className="eticket__qr">
                    <ImageSlot id={`qr-${confirmed.id}`} shape="rounded" radius={12} placeholder="QR code" />
                  </div>
                  <div>
                    <span className="tag" style={{ marginBottom: 12 }}>
                      {confirmed.ticketType}
                    </span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, fontWeight: 700 }}>
                      {confirmed.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--color-grey)', margin: '5px 0 16px' }}>
                      Hosted by {confirmed.host}
                    </div>
                    <TicketFacts booking={confirmed} />
                    <div
                      className="grid grid--2"
                      style={{
                        borderTop: '1px solid var(--color-line-faint)',
                        marginTop: 20,
                        paddingTop: 16,
                        gap: 20,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-grey-soft)' }}>Participant</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>
                          {confirmed.participants[0].name}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-grey-soft)' }}>Ticket ID</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{confirmed.ticketId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="bg-surface-panel rounded-lg py-4 px-[18px]"
                style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 11, fontSize: 13 }}
              >
                <Info size={17} color="#6D28FF" strokeWidth={1.9} />
                Please arrive 15 minutes before the experience starts.
              </div>
            </div>

          </div>

          <Reveal className="mx-auto w-full max-w-page px-gutter pt-[30px]">
            <div className="action-grid">
              <button type="button" className="action-tile" onClick={() => toast('E-ticket PDF is on its way to your inbox')}>
                <Download size={22} color="#5B21F5" strokeWidth={1.8} />
                <span>
                  <span className="text-[14px] font-semibold">Download Ticket</span>
                  <span className="action-tile__sub">Save your e-ticket</span>
                </span>
              </button>
              <button type="button" className="action-tile" onClick={() => toast('Added to your calendar')}>
                <Calendar size={22} color="#5B21F5" strokeWidth={1.8} />
                <span>
                  <span className="text-[14px] font-semibold">Add to Calendar</span>
                  <span className="action-tile__sub">Add to your schedule</span>
                </span>
              </button>
              <button
                type="button"
                className="action-tile"
                onClick={() => {
                  void copyText(window.location.origin + subject.detailPath);
                  toast('Share link copied to your clipboard');
                }}
              >
                <Share size={22} color="#5B21F5" strokeWidth={1.8} />
                <span>
                  <span className="text-[14px] font-semibold">Share Experience</span>
                  <span className="action-tile__sub">Invite your friends</span>
                </span>
              </button>
              {/* Straight to the ticket you just bought — that QR is what gets
                  scanned at the door, and hunting for it in a list is a poor
                  reward for having just paid. The full list is one tap on. */}
              <Button
                as="link"
                to={`/bookings/${confirmed.id}`}
                variant="primary"
                className="action-tile action-tile--primary"
                style={{ height: 'auto' }}
              >
                <span>
                  <span className="text-[14px] font-semibold">View My E-Ticket</span>
                  <span className="action-tile__sub">Show this QR at the door</span>
                </span>
                <ArrowRight size={20} color="#fff" />
              </Button>
            </div>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter pt-[30px]">
            <SectionHead size="sm" title="You Might Also Like" moreTo="/activities" moreLabel="See All →" />
            <div className="grid grid--4">
              {suggestions.map((item) => (
                <MiniCard
                  key={item.slug}
                  to={`/activities/${item.slug}`}
                  slotId={`suggest-${item.slug}`}
                  photoHint={item.photoHint}
                  kicker={item.category}
                  title={item.title}
                  date={ticketDate}
                  area={`${item.venue.area}, ${item.venue.city}`}
                  price={item.priceFrom}
                />
              ))}
            </div>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter pt-[30px]">
            <div className="split-panels">
              <div className="bg-[#f6f4fd] rounded-2xl py-[26px] px-7">
                <h2 style={{ fontSize: 21, fontWeight: 600, marginBottom: 20 }}>What's Next?</h2>
                <div className="whats-next__grid">
                  {[
                    ['Get Ready', 'Check the experience details and prepare for the day.'],
                    ['Attend the Session', 'Arrive on time and enjoy the experience!'],
                    ['Share & Connect', 'Share your moments and connect with others.'],
                  ].map(([title, body], index) => (
                    <div key={title}>
                      <div className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
                        <span className="w-[26px] h-[26px] rounded-[50%] bg-[#ebe4ff] text-brand-deep flex items-center justify-center text-[12px] font-bold flex-none">{index + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>{body}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-brand-tint-strong rounded-3xl py-[26px] px-[30px] grid grid--split-lg"
                style={{ gap: 20, alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
                    Need Help?
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.65, marginBottom: 18 }}>
                    If you have any questions, our support team is here to help.
                  </div>
                  <Button as="link" to="/help" variant="white">
                    <Headset size={17} strokeWidth={1.8} />
                    Contact Support
                  </Button>
                </div>
                <div style={{ height: 150 }} className="float">
                  <ImageSlot id="help-art" shape="rounded" radius={12} placeholder="Support illustration" />
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto w-full max-w-page px-gutter pt-[30px]" style={{ textAlign: 'center' }}>
            <div className="flex items-center" style={{ justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
              <Ticket size={17} color="#6D28FF" strokeWidth={1.9} />
              Thank you for being a part of Hoople.
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-grey)', marginTop: 6 }}>
              We can't wait to see you there!
            </div>
          </div>
        </>
      ) : null}

      {/* Payment modal */}
      <Modal
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          setStep(1);
        }}
        label="Complete your payment"
      >
        <div style={{ padding: '24px 26px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 600 }}>
              Complete Your Payment
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-grey)', marginTop: 4 }}>
              All transactions are secure and encrypted
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPayOpen(false);
              setStep(1);
            }}
            style={{ width: 32, height: 32, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close payment"
          >
            <Close size={17} color="#5C5B6B" />
          </button>
        </div>

        <div style={{ padding: '20px 26px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 5 }}>Total Payment</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 23, fontWeight: 700 }}>
              {idr(money.total)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 5 }}>Order ID</div>
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, border: 0, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => {
                void copyText('HOOP-PENDING');
                toast('Order ID copied');
              }}
            >
              Pending — issued on payment
              <Copy size={15} color="#8B8A99" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div style={{ padding: '14px 26px 0', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-ink-muted)', border: 0, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => setShowOrderDetails((open) => !open)}
            aria-expanded={showOrderDetails}
          >
            {showOrderDetails ? 'Hide order details' : 'View order details'}
            <ChevronDown size={14} color="#8B8A99" className={showOrderDetails ? 'is-flipped' : undefined} />
          </button>
        </div>

        {showOrderDetails ? (
          <div style={{ padding: '14px 26px 0' }}>
            <div className="bg-surface-panel rounded-lg py-4 px-[18px]">
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>{subject.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 14 }}>
                {longDate(ticketDate)} · {timeRange(start, end)}
              </div>
              <PriceBreakdownRows
                subtotal={money.subtotal}
                platformFee={money.platformFee}
                gatewayFee={money.gatewayFee}
                quantity={participants.length}
              />
            </div>
          </div>
        ) : null}

        {payScreen === 'methods' ? (
          <div style={{ padding: '20px 26px 0' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>Choose Payment Method</div>
            {PAYMENT_METHODS.map((option) => (
              <button
                key={option.name}
                type="button"
                className={`pay-method ${method === option.name ? 'is-on' : ''}`.trim()}
                onClick={() => setMethod(option.name)}
                aria-pressed={method === option.name}
              >
                <span className="pay-method__radio" />
                <span className="w-10 h-[30px] rounded-sm bg-surface-toggle flex items-center justify-center text-[10px] font-bold text-ink-2 flex-none">{option.logo}</span>
                <span style={{ flex: 1 }}>
                  <span className="flex items-center" style={{ gap: 9 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{option.name}</span>
                    {option.recommended ? (
                      <span className="tag" style={{ fontSize: 10.5, padding: '4px 9px' }}>
                        Recommended
                      </span>
                    ) : null}
                  </span>
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--color-grey)', marginTop: 3 }}>
                    {option.description}
                  </span>
                </span>
              </button>
            ))}
            <Button
              as="button"
              variant="primary"
              size="lg"
              block
              style={{ marginTop: 18 }}
              onClick={() => {
                setSecondsLeft(COUNTDOWN_SECONDS);
                setPayScreen('pay');
              }}
            >
              Pay with {method}
            </Button>
          </div>
        ) : (
          <div style={{ padding: '20px 26px 0', textAlign: 'center' }}>
            <div className="inline-flex items-center gap-[9px] bg-[#fef3e7] text-amber-ink text-[12.5px] font-semibold py-2 px-3.5 rounded-[8px] mb-[18px]">
              <Clock size={14} strokeWidth={2} />
              Complete payment in {countdown}
            </div>
            <div className="pay-qr">
              <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>
                Scan with any {method} app
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 18 }}>
                GoPay, OVO, DANA, ShopeePay, mobile banking
              </div>
              <div className="pay-qr__code">
                <ImageSlot id="payment-qr" shape="rounded" radius={12} placeholder="QR code" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginTop: 18 }}>
                {idr(money.total)}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 5 }}>
                {subject.title} · {longDate(ticketDate)}
              </div>
            </div>
            <Button
              as="button"
              variant="primary"
              size="lg"
              block
              style={{ marginTop: 18 }}
              onClick={completePayment}
            >
              I have completed the payment
            </Button>
            <Button
              as="button"
              variant="neutral"
              block
              style={{ marginTop: 10, height: 46 }}
              onClick={() => setPayScreen('methods')}
            >
              Choose another method
            </Button>
          </div>
        )}

        <div className="mt-5 bg-[#f6f4fd] py-4 px-[26px] flex items-center gap-[13px]">
          <ShieldCheck size={20} color="#6D28FF" strokeWidth={1.8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Payments are secure and encrypted</div>
            <div style={{ fontSize: 12, color: 'var(--color-grey)', marginTop: 2 }}>
              Your payment details are protected by Midtrans
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink-2)' }}>
            midtrans
          </span>
        </div>
        <div style={{ padding: '16px 26px 22px', textAlign: 'center', fontSize: 12, color: 'var(--color-grey-soft)' }}>
          This is a UI prototype — no payment is actually processed.
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Stepper({ step }: { step: Step }) {
  const steps = [
    { title: 'Booking Details', sub: step > 1 ? 'Completed' : 'Fill in your information' },
    { title: 'Payment', sub: step > 2 ? 'Paid Successfully' : 'Complete your payment' },
    { title: 'Confirmation', sub: step === 3 ? "You're all set!" : 'Get your ticket' },
  ];

  return (
    <div className="stepper">
      {steps.map((item, index) => {
        const number = index + 1;
        const done = number < step;
        const active = number === step;
        return (
          <div key={item.title} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`stepper__item ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`.trim()}>
              <span className="stepper__dot">{done ? <Check size={18} color="#fff" /> : number}</span>
              <div>
                <div className="stepper__title">{item.title}</div>
                <div className="text-[13px] text-grey mt-0.5">{item.sub}</div>
              </div>
            </div>
            {number < 3 ? <span className="stepper__line" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span className="field__label">
        {label} {required ? <span className="text-danger">*</span> : null}
      </span>
      <input
        className="input"
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        style={disabled ? { background: 'var(--color-surface-sunken)', color: 'var(--color-ink-2)' } : undefined}
      />
    </label>
  );
}

function PhoneField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span className="field__label">
        {label} {required ? <span className="text-danger">*</span> : null}
      </span>
      <span style={{ display: 'flex', gap: 10 }}>
        <span className="phone-prefix">
          <span className="flag-id" />
          <ChevronDown size={14} color="#8B8A99" />
        </span>
        <input
          className="input"
          type="tel"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          style={disabled ? { background: 'var(--color-surface-sunken)', color: 'var(--color-ink-2)' } : undefined}
        />
      </span>
    </label>
  );
}

function PriceBreakdownRows({
  subtotal,
  platformFee,
  gatewayFee,
  quantity,
}: {
  subtotal: number;
  platformFee: number;
  gatewayFee: number;
  quantity: number;
}) {
  return (
    <>
      <div className="price-row">
        <span className="flex items-center gap-[7px] text-ink-2">
          Subtotal ({quantity} {quantity === 1 ? 'Ticket' : 'Tickets'})
        </span>
        <span className="font-medium whitespace-nowrap">{idr(subtotal)}</span>
      </div>
      <div className="price-row">
        <span className="flex items-center gap-[7px] text-ink-2">
          Hoople Platform Fee <Info size={14} color="#B4B2C0" strokeWidth={1.9} />
        </span>
        <span className="font-medium whitespace-nowrap">{idr(platformFee)}</span>
      </div>
      <div className="price-row">
        <span className="flex items-center gap-[7px] text-ink-2">
          Payment Gateway Fee <Info size={14} color="#B4B2C0" strokeWidth={1.9} />
        </span>
        <span className="font-medium whitespace-nowrap">{idr(gatewayFee)}</span>
      </div>
    </>
  );
}

function SummaryItem({
  slotId,
  photoHint,
  title,
  host,
  date,
  start,
  end,
  venueName,
  venueArea,
}: {
  slotId: string;
  photoHint: string;
  title: string;
  host: string;
  date: string;
  start: string;
  end: string;
  venueName: string;
  venueArea: string;
}) {
  return (
    <div className="summary-item">
      <div className="h-[112px] rounded-lg overflow-hidden">
        <ImageSlot id={slotId} shape="rounded" radius={12} placeholder={photoHint} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--color-grey)', margin: '4px 0 12px' }}>Hosted by {host}</div>
        <div className="flex flex-col" style={{ gap: 9 }}>
          <span className="meta">
            <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
            {longDate(date)}
          </span>
          <span className="meta">
            <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
            {timeRange(start, end)}
          </span>
          <span className="meta meta--top">
            <MapPin size={15} color="#8B8A99" strokeWidth={1.9} style={{ marginTop: 2 }} />
            <span style={{ lineHeight: 1.55 }}>
              {venueName}
              <br />
              {venueArea}
            </span>
          </span>
        </div>
        <span className="tag" style={{ marginTop: 12, fontSize: 11.5, padding: '5px 12px' }}>
          Offline
        </span>
      </div>
    </div>
  );
}

function TicketFacts({ booking }: { booking: BookingRecord }) {
  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <span className="meta">
        <Calendar size={15} color="#8B8A99" strokeWidth={1.9} />
        {longDate(booking.date)}
      </span>
      <span className="meta">
        <Clock size={15} color="#8B8A99" strokeWidth={1.9} />
        {timeRange(booking.start, booking.end)}
      </span>
      <span className="meta meta--top">
        <MapPin size={15} color="#8B8A99" strokeWidth={1.9} style={{ marginTop: 2 }} />
        <span style={{ lineHeight: 1.55 }}>
          {booking.venueName}
          <br />
          {booking.venueArea}, {booking.venueCity}
        </span>
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-grey-soft)' }}>Purchased {booking.paidAt}</span>
    </div>
  );
}
