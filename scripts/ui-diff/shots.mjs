/**
 * Pixel baseline for the Hoople UI.
 *
 * Usage: node scripts/ui-diff/shots.mjs <outDir> [baseUrl]
 *
 * Determinism is the whole point, so this pins every source of drift:
 * Math.random, animations, transitions, caret blink and the signed-in session.
 * Two runs of the same commit must produce identical PNGs, otherwise the diff
 * against the Tailwind port means nothing.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2];
const base = process.argv[3] || 'http://localhost:4173';
if (!outDir) throw new Error('usage: node scripts/ui-diff/shots.mjs <outDir> [baseUrl]');

/* Breakpoint boundaries matter: `max-width: 900px` and Tailwind's default
   `max-[900px]` disagree at exactly 900. Pass widths to test them. */
const WIDTHS = (process.argv[4] || '390,1280,1920').split(',').map(Number);

const ROUTES = [
  ['entry', '/'],
  ['auth', '/auth'],
  ['home', '/home'],
  ['discover', '/discover'],
  ['events', '/events'],
  ['event-detail', '/events/jakarta-coffee-week'],
  ['activities', '/activities'],
  ['activity-detail', '/activities/morning-yoga-flow'],
  ['booking', '/booking'],
  ['bookings', '/bookings'],
  ['saved', '/saved'],
  ['communities', '/communities'],
  ['community-detail', '/communities/kopi-karya'],
  ['organizers', '/organizers'],
  ['how-it-works', '/how-it-works'],
  ['pricing', '/pricing'],
  ['help', '/help'],

  ['org-dashboard', '/organizer'],
  ['org-experiences', '/organizer/experiences'],
  ['org-create', '/organizer/create'],
  ['org-create-activity', '/organizer/create/activity'],
  ['org-create-event', '/organizer/create/event'],
  ['org-events', '/organizer/events'],
  ['org-activities', '/organizer/activities'],
  ['org-drafts', '/organizer/drafts'],
  ['org-sessions', '/organizer/sessions'],
  ['org-registrations', '/organizer/registrations'],
  ['org-checkin', '/organizer/check-in'],
  ['org-analytics', '/organizer/analytics'],
  ['org-payments', '/organizer/payments'],
  ['org-transactions', '/organizer/payments/transactions'],
  ['org-settings', '/organizer/settings'],

  ['teams-dashboard', '/teams'],
  ['teams-experiences', '/teams/experiences'],
  ['teams-registrations', '/teams/registrations'],
  ['teams-sessions', '/teams/sessions'],
  ['teams-checkin', '/teams/check-in'],
  ['teams-analytics', '/teams/analytics'],
  ['teams-orders', '/teams/orders'],
  ['teams-payments', '/teams/payments'],
  ['teams-settings', '/teams/settings'],
  ['teams-profile', '/teams/profile'],
];

/* Runs before any app code on every document. */
const INIT = `
  (() => {
    let seed = 42;
    Math.random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    try {
      localStorage.setItem(
        'hoople.session',
        JSON.stringify({ name: 'Adriani Ajeng', email: 'adriani.ajeng@gmail.com' })
      );
    } catch (e) {}
  })();
`;

const FREEZE = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
`;

const browser = await chromium.launch();
mkdirSync(outDir, { recursive: true });
const report = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(INIT);

  for (const [name, path] of ROUTES) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    try {
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
      await page.addStyleTag({ content: FREEZE });
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      const file = join(outDir, `${name}@${width}.png`);
      await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
      report.push({ name, width, ok: true, errors });
    } catch (err) {
      report.push({ name, width, ok: false, error: String(err).split('\n')[0] });
      console.log(`  FAIL ${name}@${width}: ${String(err).split('\n')[0]}`);
    }
    await page.close();
  }
  await context.close();
  console.log(`captured width ${width}`);
}

await browser.close();
writeFileSync(join(outDir, '_report.json'), JSON.stringify(report, null, 2));
const bad = report.filter((r) => !r.ok);
console.log(`\n${report.length} shots, ${bad.length} failed`);
