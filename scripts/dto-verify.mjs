/*
 * Menjaga kontrak `dto/` tetap konsisten setelah dibelah jadi tiga section.
 *
 * Yang diperiksa bukan gaya penulisan, melainkan hal-hal yang membuat dua situs
 * menyebut satu hal dengan dua cara berbeda — kelas kesalahan yang baru terlihat
 * kalau seluruh berkas dibandingkan berdampingan, dan yang paling mahal
 * diperbaiki setelah backend terlanjur membangun join-nya.
 *
 *   npm run dto:verify
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'dto';
const SECTIONS = ['shared', 'participant', 'organizer', 'teams'];

/* Nama field yang pernah bertabrakan, atau yang sengaja dijaga satu tipe. */
const WATCH = [
  'host', 'price', 'stats', 'schedule', 'pricing',
  'priceBreakdown', 'statCards', 'scheduleSummary', 'rundown',
];

const files = [];
(function collect(dir, section) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p, section ?? entry.name);
    else if (entry.name.endsWith('.json')) files.push({ p, section });
  }
})(ROOT, null);

let failures = 0;
const fail = (msg) => { failures += 1; console.log('  ✗ ' + msg); };

/* ── 1. Setiap berkas parse, dan berada di section yang dikenal ────────── */
const docs = [];
for (const { p, section } of files) {
  if (!SECTIONS.includes(section)) fail(`section tak dikenal: ${p}`);
  try { docs.push({ p, section, json: JSON.parse(fs.readFileSync(p, 'utf8')) }); }
  catch { fail(`gagal parse: ${p}`); }
}

/* ── 2. Setiap response memakai envelope penuh ─────────────────────────── */
for (const { p, json } of docs) {
  if (!p.endsWith('.response.json')) continue;
  for (const key of ['success', 'message', 'data', 'meta'])
    if (!(key in json)) fail(`envelope kurang "${key}": ${p}`);
}

/* ── 3. Kumpulkan fakta lintas berkas ──────────────────────────────────── */
const names = new Map();   // id      -> nama yang pernah dipakai
const hosts = new Map();   // slug    -> host yang pernah disebut
const roles = new Map();   // akun id -> daftar roles
const mails = new Map();   // akun id -> email akun
const types = new Map();   // "req|res:field" -> tipe yang pernah muncul

const put = (map, key, value) => {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
};

for (const { p, json } of docs) {
  /* Request sengaja berbeda dari response untuk uang — integer polos di
     request, objek {amount,currency} di response. Jadi tipe dihitung
     terpisah per sisi, kalau digabung asimetri itu terbaca sebagai cacat. */
  const side = p.endsWith('.request.json') ? 'req' : 'res';

  (function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;

    const label = node.name ?? node.fullName ?? node.title;
    if (typeof node.id === 'string' && typeof label === 'string') put(names, node.id, label);

    const slug = node.slug ?? node.experience?.slug;
    if (slug && node.host) {
      put(hosts, slug, typeof node.host === 'string' ? 'STRING:' + node.host : node.host.name);
    }
    if (typeof node.id === 'string' && Array.isArray(node.roles)) {
      put(roles, node.id, [...node.roles].sort().join(','));
    }
    if (typeof node.id === 'string' && typeof node.email === 'string') put(mails, node.id, node.email);

    for (const [key, value] of Object.entries(node)) {
      if (value === null) continue;          /* null tidak memberi tahu tipe apa pun */
      put(types, `${side}:${key}`, Array.isArray(value) ? 'array' : typeof value);
    }
    for (const value of Object.values(node)) walk(value);
  })(json.data ?? json);
}

/* ── 4. Aturan yang menjaga ketiga section tidak bentrok ───────────────── */
for (const [id, set] of names)
  if (set.size > 1) fail(`satu id dipakai beberapa nama: ${id} → ${[...set].join(' | ')}`);

for (const [slug, set] of hosts) {
  if (set.size > 1) fail(`satu experience punya beberapa host: ${slug} → ${[...set].join(' | ')}`);
  if ([...set].some((h) => h.startsWith('STRING:'))) fail(`host masih bertipe string: ${slug}`);
}
for (const [id, set] of roles)
  if (set.size > 1) fail(`satu akun punya beberapa daftar roles: ${id} → ${[...set].join(' | ')}`);

for (const [id, set] of mails)
  if (set.size > 1) fail(`satu akun punya beberapa email: ${id} → ${[...set].join(' | ')}`);

for (const field of WATCH) for (const side of ['req', 'res']) {
  const set = types.get(`${side}:${field}`);
  if (set && set.size > 1) fail(`field "${field}" punya dua tipe di ${side}: ${[...set].join(', ')}`);
}

/* ── 5. Laporan ────────────────────────────────────────────────────────── */
const perSection = {};
for (const { section } of files) perSection[section] = (perSection[section] ?? 0) + 1;

console.log(`\n${files.length} berkas   ` + SECTIONS.map((s) => `${s}=${perSection[s] ?? 0}`).join('  '));
if (failures) {
  console.log(`\n${failures} masalah ditemukan.`);
  process.exit(1);
}
console.log('\nSemua pemeriksaan lolos.');
