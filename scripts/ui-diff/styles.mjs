/**
 * Compare computed styles element-by-element between two builds of the same
 * app. Usage: node scripts/ui-diff/styles.mjs <path> [width] [urlA] [urlB]
 *
 * The React tree is identical in both, so elements are matched by their
 * position in a depth-first walk. Reports the property, the two values, and
 * enough of the element to find it in the source.
 */
import { chromium } from 'playwright';

const path = process.argv[2] || '/';
const width = Number(process.argv[3] || 1280);
const urlA = process.argv[4] || 'http://localhost:4174';
const urlB = process.argv[5] || 'http://localhost:4173';

const PROPS = [
  'display', 'position', 'width', 'height', 'marginTop', 'marginRight',
  'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
  'paddingLeft', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
  'letterSpacing', 'color', 'backgroundColor', 'borderTopLeftRadius',
  'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
  'borderTopColor', 'textAlign', 'flexDirection', 'alignItems',
  'justifyContent', 'rowGap', 'columnGap', 'flexGrow', 'flexShrink',
  'flexBasis', 'gridTemplateColumns', 'overflowX', 'overflowY', 'whiteSpace',
  'textTransform', 'boxShadow', 'minWidth', 'maxWidth', 'opacity', 'top',
  'left', 'right', 'bottom', 'zIndex', 'flexWrap',
];

const COLLECT = `(() => {
  const props = ${JSON.stringify(PROPS)};
  const out = [];
  let i = 0;
  const walk = (el) => {
    const cs = getComputedStyle(el);
    const rec = { i: i++, tag: el.tagName, cls: el.getAttribute('class') || '', s: {} };
    for (const p of props) rec.s[p] = cs[p];
    out.push(rec);
    for (const c of el.children) walk(c);
  };
  walk(document.body);
  return out;
})()`;

const browser = await chromium.launch();

async function snap(base) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(`
    try { localStorage.setItem('hoople.session', JSON.stringify({ name: 'Adriani Ajeng', email: 'adriani.ajeng@gmail.com' })); } catch (e) {}
    let seed = 42;
    Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  `);
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const data = await page.evaluate(COLLECT);
  await page.close();
  return data;
}

const [a, b] = await Promise.all([snap(urlA), snap(urlB)]);
await browser.close();

if (a.length !== b.length) {
  console.log(`!! element count differs: ${a.length} vs ${b.length} — tree changed`);
}

const byProp = new Map();
const examples = [];
const n = Math.min(a.length, b.length);
for (let i = 0; i < n; i++) {
  if (a[i].tag !== b[i].tag) {
    console.log(`!! tag mismatch at ${i}: ${a[i].tag} vs ${b[i].tag}`);
    break;
  }
  for (const p of PROPS) {
    if (a[i].s[p] !== b[i].s[p]) {
      byProp.set(p, (byProp.get(p) || 0) + 1);
      if (examples.length < 40) {
        examples.push(
          `${p}: ${a[i].s[p]}  ->  ${b[i].s[p]}\n    <${a[i].tag.toLowerCase()} class="${a[i].cls}">\n    now  class="${b[i].cls}"`
        );
      }
    }
  }
}

console.log(`\n=== ${path} @${width} — ${[...byProp.values()].reduce((x, y) => x + y, 0)} property differences ===`);
for (const [p, c] of [...byProp].sort((x, y) => y[1] - x[1])) console.log(`${String(c).padStart(4)}  ${p}`);
console.log();
for (const e of examples.slice(0, 12)) console.log('  ' + e + '\n');
