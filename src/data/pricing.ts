/** Hoople's transparent fee model, applied identically wherever a total is shown. */

export const PLATFORM_FEE_RATE = 0.03;
export const GATEWAY_FEE_RATE = 0.018;

export interface PriceBreakdown {
  subtotal: number;
  platformFee: number;
  gatewayFee: number;
  total: number;
}

export function priceBreakdown(unitPrice: number, quantity: number): PriceBreakdown {
  const subtotal = unitPrice * quantity;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const gatewayFee = Math.round(subtotal * GATEWAY_FEE_RATE);
  return { subtotal, platformFee, gatewayFee, total: subtotal + platformFee + gatewayFee };
}

export interface PaymentMethod {
  name: string;
  logo: string;
  description: string;
  recommended?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { name: 'QRIS', logo: 'QRIS', description: 'Pay easily with any QRIS app', recommended: true },
  { name: 'GoPay', logo: 'gopay', description: 'Pay with your GoPay balance' },
  { name: 'ShopeePay', logo: 'SPay', description: 'Pay with ShopeePay' },
  {
    name: 'Virtual Account',
    logo: 'VA',
    description: 'Transfer via BCA, Mandiri, BNI, BRI, and more',
  },
  { name: 'Credit / Debit Card', logo: 'CARD', description: 'Pay with Visa, Mastercard, JCB, Amex' },
  {
    name: 'More Payment Options',
    logo: '•••',
    description: 'KlikBCA, BNI Direct, Danamon Online, and more',
  },
];

/** Plans quoted on the Pricing page. */
export const PRICING_TIERS = [
  {
    name: 'Starter',
    tagline: 'For a first paid event',
    price: 'Free to list',
    fee: '3% admin + payment gateway fee',
    features: [
      'Event microsite and registration',
      'Ticketing with QR check-in',
      'Payout H+1 after the event',
      'Transparent fees, shown to the buyer',
    ],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    tagline: 'For communities running a calendar',
    price: 'Rp1.500.000 / month',
    fee: '2.5% admin + payment gateway fee',
    features: [
      'Everything in Starter',
      'Connect — WhatsApp CRM and retargeting',
      'Recurring activities and session booking',
      'Attendance and revenue analytics',
    ],
    cta: 'Talk to sales',
    featured: true,
  },
  {
    name: 'Enterprise / Activation',
    tagline: 'For brand activations and venues',
    price: 'Custom',
    fee: 'Negotiated per activation',
    features: [
      'Event + Quest + Play + Connect',
      'Scavenger hunt and booth missions',
      'Games, leaderboard, lucky draw',
      'White-label and custom domain',
    ],
    cta: 'Request a quote',
  },
] as const;
