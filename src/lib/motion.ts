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
          pending.delete(entry.target);
          observer.unobserve(entry.target);
        }
      },
      /*
       * Threshold 0, not a fraction. A card taller than the viewport can never
       * show a given percentage of itself — on a phone the tables and the long
       * settings panels are several screens tall — and anything that failed the
       * test would have stayed at opacity 0 with no way to bring it back.
       * The negative bottom margin still holds the reveal until the block has
       * properly entered the screen.
       */
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );
  }
  return revealObserver;
}

/*
 * A safety net behind the observer.
 *
 * IntersectionObserver delivers asynchronously, and a fast flick on a phone —
 * or any scripted jump — can move several screens between deliveries. Anything
 * it misses would sit at opacity 0 with no second chance, which on a long page
 * looks like the content failed to load. So every scroll also sweeps whatever
 * has passed the fold and reveals it outright.
 */
const pending = new Set<Element>();
let sweepTimer: number | null = null;
let sweepBound = false;

function sweep(): void {
  sweepTimer = null;
  const fold = window.innerHeight;
  for (const el of pending) {
    if (el.getBoundingClientRect().top < fold) {
      el.classList.add(REVEALED);
      pending.delete(el);
      revealObserver?.unobserve(el);
    }
  }
}

/*
 * Runs on the scroll event itself, not inside requestAnimationFrame: a frame
 * callback can be deferred exactly when the page is moving fastest, which is
 * the case this net exists to cover. A trailing timer catches the end of a
 * flick, where the last scroll event lands mid-throttle.
 */
function queueSweep(): void {
  if (pending.size === 0) return;
  sweep();
  if (sweepTimer !== null) window.clearTimeout(sweepTimer);
  sweepTimer = window.setTimeout(sweep, 90);
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
  pending.add(el);

  if (!sweepBound) {
    sweepBound = true;
    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep, { passive: true });
  }
  /* Anything already on screen at mount should not wait for a scroll. */
  queueSweep();

  return () => {
    pending.delete(el);
    observer.unobserve(el);
  };
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
