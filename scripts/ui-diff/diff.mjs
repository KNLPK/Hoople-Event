/**
 * Compare two screenshot directories. Usage: node scripts/ui-diff/diff.mjs <a> <b> [diffDir]
 * Reports differing pixel counts and writes highlight images for anything > 0.
 */
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [dirA, dirB, diffDir] = process.argv.slice(2);
if (!dirA || !dirB) throw new Error('usage: node scripts/ui-diff/diff.mjs <a> <b> [diffDir]');
if (diffDir) mkdirSync(diffDir, { recursive: true });

const files = readdirSync(dirA).filter((f) => f.endsWith('.png'));
const rows = [];

for (const name of files) {
  let a, b;
  try {
    a = PNG.sync.read(readFileSync(join(dirA, name)));
    b = PNG.sync.read(readFileSync(join(dirB, name)));
  } catch {
    rows.push({ name, note: 'missing' });
    continue;
  }
  if (a.width !== b.width || a.height !== b.height) {
    rows.push({
      name,
      note: `size ${a.width}x${a.height} -> ${b.width}x${b.height}`,
      pixels: Math.abs(a.height - b.height) * a.width,
    });
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.1,
  });
  if (n > 0) {
    rows.push({ name, pixels: n, pct: ((n / (a.width * a.height)) * 100).toFixed(4) });
    if (diffDir) writeFileSync(join(diffDir, name), PNG.sync.write(diff));
  }
}

rows.sort((x, y) => (y.pixels || 0) - (x.pixels || 0));
for (const r of rows) {
  console.log(
    `${r.name.padEnd(34)} ${String(r.pixels ?? '?').padStart(9)} px  ${r.pct ? r.pct + '%' : ''} ${r.note || ''}`
  );
}
console.log(`\n${files.length} compared, ${rows.length} differ`);
