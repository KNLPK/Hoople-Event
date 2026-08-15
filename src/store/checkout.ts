import type { Participant } from '@/data/types';

/**
 * The in-progress checkout, parked while someone signs in.
 *
 * Payment needs an account but browsing does not, so a first-time buyer meets
 * the sign-in gate with a form already filled. This keeps that work in
 * `sessionStorage` across the round trip so they come back to it rather than
 * to an empty form.
 */

const STORAGE_KEY = 'hoople.checkout';

export interface CheckoutDraft {
  buyer: Participant;
  buyerIsParticipant: boolean;
  extraParticipants: Participant[];
  consentMedia: boolean;
  consentTerms: boolean;
}

export function writeCheckoutDraft(draft: CheckoutDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* Private mode or quota — the sign-in still works, the form just resets. */
  }
}

export function readCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to clean up. */
  }
}
