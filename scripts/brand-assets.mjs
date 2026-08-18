/*
 * Regenerates the raster brand assets in public/ — the share card, the touch
 * icon and the .ico — from the same mark the app draws in its navigation.
 *
 * Output is committed, so this only needs running when the brand or the card
 * copy changes. It renders in Chromium rather than shipping a design binary,
 * which keeps the card's text editable as HTML.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/brand-assets.mjs
 *
 * Playwright is deliberately not a dependency of the app: nothing in the
 * build needs it, and this is the only thing that does.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const MARK = `<svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
  <path d="M12 3a9 9 0 1 0 8.5 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M15 2.5l6 1.2-1.2 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const CARD = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; display: flex; flex-direction: column;
         justify-content: space-between; padding: 66px 84px;
         font-family: Inter, system-ui, sans-serif; color: #fff;
         background: radial-gradient(1100px 700px at 82% 8%, #8b5cf6 0%, transparent 58%),
                     radial-gradient(900px 620px at 6% 96%, #4c17d6 0%, transparent 55%),
                     linear-gradient(135deg, #2a1065 0%, #4c17d6 52%, #6d28ff 100%); }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand .mark { width: 56px; height: 56px; }
  .brand span { font-family: Poppins, sans-serif; font-weight: 700; font-size: 38px; letter-spacing: -0.02em; }
  h1 { font-family: Poppins, sans-serif; font-size: 68px; line-height: 1.08;
       font-weight: 800; letter-spacing: -0.035em; max-width: 17ch; }
  h1 em { font-style: normal; color: #d8c9ff; }
  p { font-size: 25px; line-height: 1.55; color: #cdbcf5; margin-top: 22px; max-width: 40ch; }
  .foot { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .pill { border: 1.5px solid rgba(255,255,255,.34); border-radius: 999px;
          padding: 12px 24px; font-size: 21px; font-weight: 500; color: #ede7ff; }
  .blob { position: absolute; border-radius: 50%; filter: blur(3px); opacity: .5; }
</style></head><body>
  <div class="brand"><div class="mark">${MARK}</div><span>hoople</span></div>
  <div>
    <h1>Experiences that connect <em>communities.</em></h1>
    <p>Discover events and activities across Indonesia, book a seat, and check in with a QR e-ticket.</p>
  </div>
  <div class="foot">
    <span class="pill">For people</span>
    <span class="pill">For organizers</span>
    <span class="pill">For teams</span>
  </div>
</body></html>`;

const ICON = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; }
  body { width: 180px; height: 180px; background: #6D28FF; display: flex;
         align-items: center; justify-content: center; }
  .m { width: 112px; height: 112px; }
  .m svg { stroke-width: 2.9; }
</style></head><body><div class="m">${MARK.replace('2.6"', '2.9"').replace('2.6"', '2.9"')}</div></body></html>`;

const browser = await chromium.launch();

const card = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await card.setContent(CARD, { waitUntil: 'networkidle' });
await card.waitForTimeout(600);
writeFileSync('public/og.jpg', await card.screenshot({ type: 'jpeg', quality: 92 }));

const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
await icon.setContent(ICON, { waitUntil: 'load' });
writeFileSync('public/apple-touch-icon.png', await icon.screenshot({ type: 'png' }));

await browser.close();
console.log('wrote public/og.jpg and public/apple-touch-icon.png');

/*
 * A 32x32 .ico as well. Browsers that still ask for /favicon.ico would
 * otherwise be handed index.html by the SPA rewrite and show nothing.
 * Vista-era ICO can wrap a PNG verbatim: 6-byte directory, one 16-byte
 * entry, then the PNG.
 */
{
  const b2 = await chromium.launch();
  const p = await b2.newPage({ viewport: { width: 32, height: 32 }, deviceScaleFactor: 1 });
  await p.setContent(
    `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}
     body{width:32px;height:32px;background:#6D28FF;display:flex;align-items:center;justify-content:center}
     .m{width:23px;height:23px}</style>
     <div class="m">${MARK.replaceAll('2.6"', '3.1"')}</div>`,
    { waitUntil: 'load' },
  );
  const png = await p.screenshot({ type: 'png' });
  await b2.close();

  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);            // reserved
  dir.writeUInt16LE(1, 2);            // type: icon
  dir.writeUInt16LE(1, 4);            // one image
  const entry = Buffer.alloc(16);
  entry[0] = 32;                      // width
  entry[1] = 32;                      // height
  entry[2] = 0;                       // palette
  entry[3] = 0;                       // reserved
  entry.writeUInt16LE(1, 4);          // colour planes
  entry.writeUInt16LE(32, 6);         // bits per pixel
  entry.writeUInt32LE(png.length, 8); // payload size
  entry.writeUInt32LE(22, 12);        // payload offset
  writeFileSync('public/favicon.ico', Buffer.concat([dir, entry, png]));
  console.log('wrote public/favicon.ico');
}
