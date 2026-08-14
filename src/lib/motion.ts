/**
 * Hoople motion primitives.
 *
 * All of these no-op (or resolve instantly) when the visitor asks for reduced
 * motion, so callers never have to branch on it themselves.
 */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* ------------------------------------------------------------------ *
 * Scroll reveal — one shared observer for the whole document.
 * ------------------------------------------------------------------ */

const REVEALED = 'is-visible';
let revealObserver: IntersectionObserver | null = null;

function getRevealObserver(): IntersectionObserver {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(REVEALED);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
  }
  return revealObserver;
}

/** Reveal `el` once it scrolls into view. Returns an unobserve callback. */
export function observeReveal(el: Element, delayMs = 0): () => void {
  if (prefersReducedMotion()) {
    el.classList.add(REVEALED);
    return () => {};
  }
  (el as HTMLElement).style.setProperty('--reveal-delay', `${delayMs}ms`);
  const observer = getRevealObserver();
  observer.observe(el);
  return () => observer.unobserve(el);
}

/* ------------------------------------------------------------------ *
 * Ripple — expands from the exact point the pointer went down.
 * ------------------------------------------------------------------ */

export function spawnRipple(event: React.MouseEvent<HTMLElement>): void {
  if (prefersReducedMotion()) return;
  const host = event.currentTarget;
  const box = host.getBoundingClientRect();
  const bit = document.createElement('span');
  bit.className = 'ripple';
  bit.style.left = `${event.clientX - box.left - 11}px`;
  bit.style.top = `${event.clientY - box.top - 11}px`;
  host.appendChild(bit);
  window.setTimeout(() => bit.remove(), 640);
}

/* ------------------------------------------------------------------ *
 * Confetti — a single celebratory burst.
 * ------------------------------------------------------------------ */

const CONFETTI_COLOURS = ['#6D28FF', '#A78BFA', '#16A34A', '#F5B301', '#E11D48'];

/** Burst confetti outward from `anchor` (defaults to the top of the viewport). */
export function fireConfetti(anchor?: Element | null): void {
  if (prefersReducedMotion()) return;
  const box = anchor?.getBoundingClientRect();
  const originX = box ? box.left + box.width / 2 : window.innerWidth / 2;
  const originY = box ? box.top + 20 : 120;

  for (let i = 0; i < 46; i += 1) {
    const bit = document.createElement('i');
    bit.className = 'confetti-bit';
    bit.style.background = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length];
    bit.style.left = `${originX + (Math.random() - 0.5) * 260}px`;
    bit.style.top = `${originY}px`;
    bit.style.setProperty('--dx', `${(Math.random() - 0.5) * 340}px`);
    bit.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
    bit.style.animationDelay = `${Math.random() * 0.25}s`;
    bit.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 2000);
  }
}
