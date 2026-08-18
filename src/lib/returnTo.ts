/**
 * Where a sign-in gate is allowed to send you back to.
 *
 * `/auth?next=…` is the one place in this app where something off the URL bar
 * reaches `navigate()`. Left alone that is an open redirect: `next=//evil.test`
 * and `next=/\evil.test` are both protocol-relative once a browser resolves
 * them, and `next=javascript:…` is worse. React Router carried a published
 * advisory for exactly the backslash form (GHSA-wrjc-x8rr-h8h6), so this does
 * not lean on the router to get it right.
 *
 * The rule: one leading slash, then only characters a URL path may contain.
 * Anything else is not a page of this app and is refused.
 */

/** Unreserved, sub-delims and the path/query/fragment punctuation — RFC 3986. */
const SAFE_PATH = /^\/[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#[\]]*$/;

export function safeReturnTo(raw: string | null, fallback = '/activities'): string {
  if (!raw) return fallback;

  /* A browser decodes `%2f%2f` before the router ever sees it, so judge the
     decoded form. A malformed escape is reason enough on its own to refuse. */
  let value: string;
  try {
    value = decodeURIComponent(raw).trim();
  } catch {
    return fallback;
  }

  /* `//host` and `/\host` both leave this origin. */
  if (/^[/\\]{2}/.test(value.replace(/\\/g, '/'))) return fallback;

  return SAFE_PATH.test(value) ? value : fallback;
}
