/**
 * Generated artwork for every image slot in the app.
 *
 * Photos all render through <ImageSlot>, which starts empty and waits for a
 * real asset. Empty slots make the prototype hard to read, so each slot also
 * resolves a picture of its own: a flat-vector scene drawn here, in a palette
 * picked for the subject. Nothing is fetched -- the art is an SVG data URI, so
 * it works offline, cannot 404, and adds no request to the page. A dropped
 * file still wins over it.
 *
 * The art is deterministic: the same slot id always yields the same picture.
 * That is what keeps a builder cover and its preview panel in sync without
 * either of them storing anything.
 */

/* ---------- plumbing ---------- */

type Rand = () => number;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** xorshift, so a slot's variation is stable across reloads. */
function rng(seed: number): Rand {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function pick<T>(r: Rand, list: readonly T[]): T {
  return list[Math.floor(r() * list.length) % list.length];
}

function svg(width: number, height: number, body: string): string {
  const doc =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(doc.replace(/\s+/g, ' '))}`;
}

/* ---------- palettes ---------- */

interface Palette {
  /** Background gradient, top to bottom. */
  sky: [string, string];
  /** The floor or ground plane. */
  ground: string;
  /** Mid-tone for props and furniture. */
  prop: string;
  /** The one saturated colour that carries the scene. */
  accent: string;
  /** Darkest tone -- figures and outlines. */
  ink: string;
}

function pal(
  sky0: string,
  sky1: string,
  ground: string,
  prop: string,
  accent: string,
  ink: string,
): Palette {
  return { sky: [sky0, sky1], ground, prop, accent, ink };
}

type Theme =
  | 'pottery'
  | 'yoga'
  | 'sunrise'
  | 'coffee'
  | 'dance'
  | 'gym'
  | 'running'
  | 'language'
  | 'cooking'
  | 'supper'
  | 'painting'
  | 'tufting'
  | 'candle'
  | 'music'
  | 'talk'
  | 'market'
  | 'workshop'
  | 'flower'
  | 'craft'
  | 'campus'
  | 'photography'
  | 'community';

const PALETTES: Record<Theme, Palette> = {
  pottery: pal('#f9e3d0', '#eebb98', '#c67f57', '#e0a077', '#8a4b31', '#4b2718'),
  yoga: pal('#e2f2e7', '#bcdfcb', '#84bd9c', '#a9d4bb', '#3f8f68', '#1f4d3a'),
  sunrise: pal('#ffe0b0', '#ff9e86', '#6f5aa3', '#9379c4', '#ffd166', '#2c2150'),
  coffee: pal('#f4e7d8', '#dcc0a2', '#a8764f', '#c9a07a', '#6f4429', '#3d2415'),
  dance: pal('#f6dcf4', '#d7adee', '#a266d6', '#c08fe6', '#7332ad', '#3d1663'),
  gym: pal('#dfe9f7', '#bccdea', '#6d86b5', '#93a8cf', '#38507e', '#1d2b47'),
  running: pal('#ffd3ad', '#c79ec4', '#5d5590', '#7d73ad', '#ff9f5a', '#241f47'),
  language: pal('#dcf0f2', '#b0dfe2', '#57adb2', '#84c8cc', '#2c7d84', '#14454a'),
  cooking: pal('#ecf3dd', '#cee1b3', '#8caa63', '#aec98a', '#55763a', '#2e421c'),
  supper: pal('#f5ddc1', '#dca97a', '#8c5a3c', '#b57f57', '#f0a04b', '#33200f'),
  painting: pal('#f8e8f4', '#d3e0f7', '#9db8e0', '#bfd0ee', '#e07a9b', '#413a68'),
  tufting: pal('#ffe4dc', '#ffbdae', '#e07a63', '#f19d88', '#b34a37', '#63251a'),
  candle: pal('#f8e6c6', '#e2bb85', '#a4763f', '#c79a63', '#f5b301', '#43301a'),
  music: pal('#7d5bc6', '#2b1a52', '#160f2c', '#3b2a63', '#f5b301', '#0b0718'),
  talk: pal('#eee6ff', '#cdbcf7', '#8f6ce8', '#b09bf0', '#6d28ff', '#2c1263'),
  market: pal('#ffeecf', '#ffd190', '#d98b4a', '#eaad6c', '#16a34a', '#573418'),
  workshop: pal('#f3f0ea', '#ded7c8', '#a99b84', '#c6bba6', '#6d28ff', '#453e30'),
  flower: pal('#ffe9f0', '#ffc9dc', '#7fb08a', '#a7cbaf', '#e2547f', '#54203a'),
  craft: pal('#f2ece2', '#dbcdb8', '#b0967a', '#cbb59a', '#c2703f', '#463628'),
  campus: pal('#e6eeff', '#c3d6f8', '#6a8ad4', '#93aee2', '#6d28ff', '#22345f'),
  photography: pal('#e9e9f2', '#c9c9dc', '#7c7c96', '#a0a0b6', '#6d28ff', '#2a2a3d'),
  community: pal('#f0eaff', '#d6c8fb', '#8d6ae8', '#b09bf0', '#16a34a', '#33195f'),
};

/* ---------- shared drawing vocabulary ---------- */

type Pose = 'stand' | 'reach' | 'run' | 'sit' | 'lotus' | 'tree' | 'point';

/**
 * One figure, drawn in a local space where the feet rest on y=0 and the head
 * tops out near y=-100. Every scene uses it, which is what makes them read as
 * one set rather than twenty unrelated drawings.
 */
function person(
  x: number,
  y: number,
  scale: number,
  fill: string,
  pose: Pose = 'stand',
  flip = false,
): string {
  const limb = `stroke="${fill}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const head = `<circle cx="0" cy="-84" r="13" fill="${fill}"/>`;
  const torso = `<path d="M-13 -72 Q0 -79 13 -72 L11 -34 L-11 -34 Z" fill="${fill}"/>`;

  let art: string;
  switch (pose) {
    case 'lotus':
      art =
        `<circle cx="0" cy="-72" r="12" fill="${fill}"/>` +
        `<path d="M-13 -60 Q0 -66 13 -60 L16 -20 L-16 -20 Z" fill="${fill}"/>` +
        `<path d="M-32 -20 Q0 -32 32 -20 Q32 -3 0 -3 Q-32 -3 -32 -20 Z" fill="${fill}"/>` +
        `<path d="M-15 -44 L-30 -24" ${limb}/><path d="M15 -44 L30 -24" ${limb}/>`;
      break;
    case 'tree':
      art =
        head +
        torso +
        `<path d="M-3 -34 L-3 -1" ${limb}/>` +
        `<path d="M3 -34 L18 -22 L3 -17" ${limb}/>` +
        `<path d="M-13 -66 Q0 -108 13 -66" ${limb}/>`;
      break;
    case 'reach':
      art =
        head +
        torso +
        `<path d="M-7 -34 L-7 -1" ${limb}/><path d="M7 -34 L7 -1" ${limb}/>` +
        `<path d="M-13 -66 L-25 -95" ${limb}/><path d="M13 -66 L25 -95" ${limb}/>`;
      break;
    case 'run':
      art =
        `<g transform="rotate(-7)">${head}${torso}` +
        `<path d="M-3 -34 L-22 -9" ${limb}/><path d="M3 -34 L21 -21" ${limb}/>` +
        `<path d="M-11 -64 L-27 -73" ${limb}/><path d="M11 -64 L23 -47" ${limb}/></g>`;
      break;
    case 'sit':
      art =
        `<circle cx="0" cy="-70" r="13" fill="${fill}"/>` +
        `<path d="M-13 -58 Q0 -65 13 -58 L11 -22 L-11 -22 Z" fill="${fill}"/>` +
        `<path d="M-6 -22 L-6 -8 L18 -8" ${limb}/><path d="M7 -22 L7 -8 L22 -8" ${limb}/>` +
        `<path d="M-13 -52 L-17 -30" ${limb}/><path d="M13 -52 L20 -32" ${limb}/>`;
      break;
    case 'point':
      art =
        head +
        torso +
        `<path d="M-7 -34 L-8 -1" ${limb}/><path d="M7 -34 L8 -1" ${limb}/>` +
        `<path d="M-13 -66 L-19 -42" ${limb}/><path d="M13 -66 L33 -74" ${limb}/>`;
      break;
    default:
      art =
        head +
        torso +
        `<path d="M-7 -34 L-7 -1" ${limb}/><path d="M7 -34 L7 -1" ${limb}/>` +
        `<path d="M-13 -66 L-19 -40" ${limb}/><path d="M13 -66 L19 -40" ${limb}/>`;
  }

  const sx = flip ? -scale : scale;
  return `<g transform="translate(${x} ${y}) scale(${sx} ${scale})">${art}</g>`;
}

/** A soft ground plane with a hand-drawn horizon. */
function ground(p: Palette, y = 372): string {
  return (
    `<path d="M0 ${y} Q200 ${y - 20} 400 ${y - 6} T800 ${y - 16} L800 500 L0 500 Z" ` +
    `fill="${p.ground}"/>` +
    `<path d="M0 ${y + 46} Q260 ${y + 26} 800 ${y + 40} L800 500 L0 500 Z" ` +
    `fill="${p.ink}" opacity="0.16"/>`
  );
}

/** A back wall, for the scenes that happen indoors. */
function wall(p: Palette, y = 340): string {
  return (
    `<rect x="0" y="0" width="800" height="${y}" fill="${p.sky[1]}" opacity="0.45"/>` +
    `<rect x="0" y="${y}" width="800" height="${500 - y}" fill="${p.ground}"/>` +
    `<rect x="0" y="${y - 5}" width="800" height="9" fill="${p.ink}" opacity="0.16"/>`
  );
}

function bulb(x: number, y: number, p: Palette): string {
  return (
    `<path d="M${x} 0 L${x} ${y - 12}" stroke="${p.ink}" stroke-width="3" opacity="0.5"/>` +
    `<circle cx="${x}" cy="${y}" r="13" fill="${p.accent}"/>` +
    `<circle cx="${x}" cy="${y}" r="30" fill="${p.accent}" opacity="0.22"/>`
  );
}

function steam(x: number, y: number, ink: string): string {
  return (
    `<g stroke="${ink}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.35">` +
    `<path d="M${x} ${y} q-14 -22 0 -44 q14 -22 0 -42"/>` +
    `<path d="M${x + 30} ${y + 8} q-12 -18 0 -36 q12 -18 0 -34"/>` +
    `<path d="M${x - 30} ${y + 10} q-12 -16 0 -32"/></g>`
  );
}

/* ---------- the scenes ---------- */

const MOTIFS: Record<Theme, (p: Palette, r: Rand) => string> = {
  pottery: (p, r) => {
    // A little pot: body, then a rim so it does not read as an egg.
    const pot = (x: number, base: number, h: number, w: number, fill: string) =>
      `<path d="M${x - w / 2} ${base} q-${w * 0.18} -${h * 0.6} ${w * 0.16} -${h} h${w * 0.68} q${w * 0.34} ${h * 0.4} ${w * 0.16} ${h} Z" fill="${fill}"/>` +
      `<rect x="${x - w * 0.42}" y="${base - h - 7}" width="${w * 0.84}" height="9" rx="4.5" fill="${fill}"/>`;

    return (
      wall(p, 344) +
      // shelf of finished work
      `<rect x="588" y="240" width="196" height="10" rx="5" fill="${p.ink}" opacity="0.35"/>` +
      [0, 1, 2]
        .map((i) => pot(624 + i * 58, 240, 40 + Math.round(r() * 18), 44, i % 2 ? p.prop : p.accent))
        .join('') +
      // the wheel: column, head, and the spinning disc
      `<rect x="386" y="312" width="34" height="62" rx="6" fill="${p.accent}" opacity="0.85"/>` +
      `<ellipse cx="403" cy="316" rx="104" ry="26" fill="${p.accent}"/>` +
      `<ellipse cx="403" cy="306" rx="104" ry="26" fill="${p.prop}"/>` +
      `<ellipse cx="403" cy="303" rx="72" ry="17" fill="${p.ink}" opacity="0.12"/>` +
      // the piece being thrown, with a proper neck
      `<path d="M362 303 q-18 -40 8 -62 q-22 -24 2 -40 q30 -18 62 0 q24 16 2 40 q26 22 8 62 Z" fill="${p.ink}" opacity="0.92"/>` +
      `<rect x="382" y="192" width="42" height="12" rx="6" fill="${p.ink}" opacity="0.92"/>` +
      // the potter, turned in toward the wheel
      person(258, 374, 1.55, p.ink, 'sit') +
      ground(p, 374)
    );
  },

  yoga: (p, r) => {
    const mat = (x: number, y: number, w: number) =>
      `<rect x="${x}" y="${y}" width="${w}" height="16" rx="8" fill="${p.accent}" opacity="0.75"/>`;
    return (
      wall(p, 352) +
      `<circle cx="${140 + Math.round(r() * 60)}" cy="120" r="66" fill="#ffffff" opacity="0.4"/>` +
      // window light
      `<rect x="88" y="70" width="130" height="180" rx="14" fill="#ffffff" opacity="0.35"/>` +
      mat(272, 366, 256) +
      mat(556, 372, 180) +
      mat(66, 372, 180) +
      person(400, 366, 1.5, p.ink, 'tree') +
      person(628, 372, 1.05, p.ink, 'reach') +
      person(150, 372, 1.05, p.ink, 'lotus') +
      ground(p, 388)
    );
  },

  sunrise: (p, r) => {
    const sunY = 200 + Math.round(r() * 30);
    return (
      `<circle cx="400" cy="${sunY}" r="96" fill="${p.accent}"/>` +
      `<circle cx="400" cy="${sunY}" r="150" fill="${p.accent}" opacity="0.22"/>` +
      // ridges, back to front
      `<path d="M0 330 L150 232 L268 316 L380 240 L520 336 L640 268 L800 348 L800 500 L0 500 Z" fill="${p.prop}" opacity="0.75"/>` +
      `<path d="M0 372 L130 306 L280 376 L430 312 L590 384 L720 330 L800 372 L800 500 L0 500 Z" fill="${p.ground}"/>` +
      `<path d="M0 428 Q220 402 440 428 T800 420 L800 500 L0 500 Z" fill="${p.ink}" opacity="0.85"/>` +
      person(400, 424, 1.25, p.ink, 'lotus') +
      `<g opacity="0.5" fill="${p.ink}">` +
      `<path d="M596 424 q10 -34 34 -44 q-6 30 -34 44 Z"/>` +
      `<path d="M212 428 q-12 -30 -36 -38 q8 28 36 38 Z"/></g>`
    );
  },

  coffee: (p, r) => {
    const beans = [0, 1, 2, 3].map((i) => {
      const x = 96 + i * 34 + Math.round(r() * 10);
      return `<ellipse cx="${x}" cy="${352 - (i % 2) * 8}" rx="13" ry="9" transform="rotate(${-20 + i * 14} ${x} 350)" fill="${p.ink}" opacity="0.75"/>`;
    });
    return (
      wall(p, 336) +
      // shelf of cups behind the counter
      `<rect x="520" y="132" width="240" height="9" rx="4" fill="${p.ink}" opacity="0.35"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M${540 + i * 56} 132 l0 -26 q0 -12 16 -12 q16 0 16 12 l0 26 Z" fill="${p.prop}"/>`).join('') +
      // the counter
      `<rect x="0" y="340" width="800" height="26" fill="${p.ink}" opacity="0.22"/>` +
      // the cup, centre stage
      `<ellipse cx="400" cy="352" rx="118" ry="20" fill="${p.ink}" opacity="0.18"/>` +
      `<path d="M300 214 h200 l-16 118 q-4 24 -30 24 h-108 q-26 0 -30 -24 Z" fill="#ffffff"/>` +
      `<path d="M500 236 q46 -6 46 34 q0 40 -50 42" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>` +
      `<ellipse cx="400" cy="218" rx="100" ry="24" fill="${p.prop}"/>` +
      // latte art
      `<path d="M400 200 q-30 -22 -30 4 q0 20 30 34 q30 -14 30 -34 q0 -26 -30 -4 Z" fill="#ffffff" opacity="0.92"/>` +
      steam(400, 168, p.ink) +
      beans.join('') +
      ground(p, 366)
    );
  },

  dance: (p, r) => {
    const lights = [0, 1, 2].map(
      (i) =>
        `<path d="M${140 + i * 260} 0 L${60 + i * 260} 340 L${300 + i * 260} 340 Z" fill="#ffffff" opacity="${0.1 + r() * 0.08}"/>`,
    );
    return (
      wall(p, 348) +
      lights.join('') +
      // mirror wall
      `<rect x="60" y="60" width="680" height="270" rx="10" fill="#ffffff" opacity="0.22"/>` +
      `<path d="M60 330 L280 60 L360 60 L140 330 Z" fill="#ffffff" opacity="0.2"/>` +
      person(300, 366, 1.5, p.ink, 'reach') +
      person(500, 366, 1.5, p.ink, 'run', true) +
      person(636, 360, 1.1, p.accent, 'point') +
      person(168, 360, 1.1, p.accent, 'stand') +
      ground(p, 366) +
      `<rect x="0" y="368" width="800" height="132" fill="#ffffff" opacity="0.06"/>`
    );
  },

  gym: (p, r) => {
    const plate = (x: number, y: number, ry: number) =>
      `<rect x="${x}" y="${y - ry}" width="26" height="${ry * 2}" rx="10" fill="${p.ink}"/>`;
    return (
      wall(p, 344) +
      // rack
      `<g fill="${p.prop}"><rect x="620" y="140" width="18" height="204"/><rect x="742" y="140" width="18" height="204"/>` +
      `<rect x="620" y="150" width="140" height="12"/><rect x="620" y="236" width="140" height="12"/></g>` +
      [200, 286].map((y) => `<g>${plate(628, y, 22)}${plate(730, y, 22)}<rect x="646" y="${y - 5}" width="92" height="10" rx="5" fill="${p.ink}"/></g>`).join('') +
      // hero dumbbell
      `<g transform="translate(400 ${250 + Math.round(r() * 10)})">` +
      `<rect x="-120" y="-10" width="240" height="20" rx="10" fill="${p.ink}"/>` +
      plate(-160, 0, 62) +
      plate(-132, 0, 46) +
      plate(134, 0, 46) +
      plate(106, 0, 62) +
      `</g>` +
      person(214, 372, 1.2, p.ink, 'reach') +
      person(560, 372, 1.05, p.accent, 'stand') +
      ground(p, 372)
    );
  },

  running: (p, r) => {
    const dashes = [0, 1, 2, 3, 4].map(
      (i) => `<rect x="${330 + i * 34 - i * i * 2}" y="${386 + i * 20}" width="${40 + i * 14}" height="${7 + i * 3}" rx="4" fill="#ffffff" opacity="0.6"/>`,
    );
    return (
      `<circle cx="${560 + Math.round(r() * 40)}" cy="252" r="72" fill="${p.accent}" opacity="0.9"/>` +
      // skyline
      `<g fill="${p.ink}" opacity="0.28">` +
      [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i * 118}" y="${210 + (i % 3) * 44}" width="86" height="200" rx="6"/>`).join('') +
      `</g>` +
      // the road
      `<path d="M0 500 L296 330 L512 330 L800 500 Z" fill="${p.ground}"/>` +
      `<path d="M0 500 L296 330 L512 330 L800 500 Z" fill="${p.ink}" opacity="0.28"/>` +
      dashes.join('') +
      person(300, 452, 1.5, p.ink, 'run') +
      person(490, 412, 1.1, p.ink, 'run') +
      person(566, 392, 0.85, p.ink, 'run') +
      `<path d="M0 330 L800 330" stroke="${p.ink}" stroke-width="4" opacity="0.2"/>`
    );
  },

  language: (p, r) => {
    const bubble = (x: number, y: number, w: number, h: number, fill: string, flip: boolean) =>
      `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2.6}" fill="${fill}"/>` +
      `<path d="M${flip ? x + w - 40 : x + 26} ${y + h} l14 30 l${flip ? -34 : 34} -30 Z" fill="${fill}"/>` +
      [0, 1, 2].map((i) => `<rect x="${x + 26 + i * 34}" y="${y + h / 2 - 5}" width="22" height="10" rx="5" fill="#ffffff" opacity="0.75"/>`).join('') +
      `</g>`;
    return (
      wall(p, 344) +
      bubble(88, 96, 250, 84, p.accent, false) +
      bubble(452, 148 + Math.round(r() * 14), 250, 84, p.ink, true) +
      // shared table
      `<rect x="252" y="352" width="296" height="18" rx="9" fill="${p.ink}" opacity="0.8"/>` +
      `<rect x="292" y="370" width="16" height="60" fill="${p.ink}" opacity="0.6"/>` +
      `<rect x="492" y="370" width="16" height="60" fill="${p.ink}" opacity="0.6"/>` +
      // mugs on the table
      `<rect x="330" y="330" width="26" height="24" rx="5" fill="#ffffff" opacity="0.85"/>` +
      `<rect x="444" y="330" width="26" height="24" rx="5" fill="#ffffff" opacity="0.85"/>` +
      person(212, 396, 1.25, p.ink, 'sit') +
      person(588, 396, 1.25, p.ink, 'sit', true) +
      ground(p, 396)
    );
  },

  cooking: (p, r) => {
    const veg = [0, 1, 2].map(
      (i) => `<circle cx="${556 + i * 44}" cy="${338 - (i % 2) * 6}" r="${15 + Math.round(r() * 5)}" fill="${i === 1 ? p.accent : p.ink}" opacity="0.75"/>`,
    );
    return (
      wall(p, 350) +
      // hanging utensils
      `<rect x="120" y="96" width="240" height="8" rx="4" fill="${p.ink}" opacity="0.4"/>` +
      [0, 1, 2].map((i) => `<path d="M${162 + i * 74} 104 l0 54 q0 18 16 18 q16 0 16 -18 l0 -54" fill="none" stroke="${p.ink}" stroke-width="8" opacity="0.5"/>`).join('') +
      // counter
      `<rect x="0" y="350" width="800" height="22" fill="${p.ink}" opacity="0.22"/>` +
      // pot
      `<ellipse cx="400" cy="266" rx="104" ry="20" fill="${p.prop}"/>` +
      `<path d="M296 266 l14 76 q4 14 22 14 h136 q18 0 22 -14 l14 -76 Z" fill="${p.ink}"/>` +
      `<rect x="270" y="278" width="40" height="14" rx="7" fill="${p.ink}"/>` +
      `<rect x="490" y="278" width="40" height="14" rx="7" fill="${p.ink}"/>` +
      steam(400, 244, p.ink) +
      veg.join('') +
      // chef's hat on the figure
      person(196, 372, 1.25, p.ink, 'point') +
      `<path d="M170 288 q-4 -34 26 -34 q30 0 26 34 Z" fill="#ffffff" opacity="0.9"/>` +
      ground(p, 372)
    );
  },

  supper: (p, r) => {
    const seats = [0, 1, 2, 3];
    return (
      `<rect x="0" y="0" width="800" height="500" fill="${p.sky[1]}" opacity="0.3"/>` +
      bulb(220, 96 + Math.round(r() * 20), p) +
      bulb(400, 76, p) +
      bulb(580, 104, p) +
      // long table
      `<ellipse cx="400" cy="356" rx="330" ry="52" fill="${p.prop}"/>` +
      `<ellipse cx="400" cy="344" rx="330" ry="52" fill="#ffffff" opacity="0.75"/>` +
      seats
        .map((i) => `<circle cx="${190 + i * 140}" cy="${332 + (i % 2) * 14}" r="26" fill="${p.ink}" opacity="0.16"/>`)
        .join('') +
      seats.map((i) => `<circle cx="${190 + i * 140}" cy="${332 + (i % 2) * 14}" r="18" fill="#ffffff"/>`).join('') +
      // a centrepiece
      `<path d="M386 300 q14 -34 28 0 Z" fill="${p.accent}"/>` +
      `<rect x="392" y="300" width="16" height="26" rx="4" fill="${p.accent}" opacity="0.7"/>` +
      person(150, 344, 1.2, p.ink, 'sit') +
      person(650, 344, 1.2, p.ink, 'sit', true) +
      person(330, 322, 1.0, p.ink, 'sit') +
      person(478, 322, 1.0, p.ink, 'sit', true) +
      ground(p, 404)
    );
  },

  painting: (p, r) => {
    const strokes = [p.accent, p.ground, p.ink, '#ffffff'];
    return (
      wall(p, 348) +
      // easel
      `<g stroke="${p.ink}" stroke-width="12" stroke-linecap="round" opacity="0.85">` +
      `<path d="M400 300 L336 424"/><path d="M400 300 L464 424"/><path d="M400 300 L400 430"/></g>` +
      `<rect x="288" y="118" width="224" height="188" rx="6" fill="#ffffff"/>` +
      // what is on the canvas
      strokes
        .map((c, i) => `<path d="M${308 + i * 12} ${272 - i * 22} q46 ${-40 - i * 12} 92 0 q46 ${40 - i * 8} 92 ${-20 - i * 10}" fill="none" stroke="${c}" stroke-width="${16 - i * 2}" stroke-linecap="round" opacity="0.9"/>`)
        .join('') +
      // palette
      `<path d="M600 336 q-8 -52 52 -52 q60 0 52 52 q-4 26 -34 26 q-18 0 -18 -14 q0 -14 -22 -14 q-26 0 -30 2 Z" fill="${p.prop}"/>` +
      [0, 1, 2].map((i) => `<circle cx="${630 + i * 26}" cy="${306 + (i % 2) * 12}" r="9" fill="${strokes[i]}"/>`).join('') +
      person(180, 372, 1.3, p.ink, 'point') +
      `<circle cx="${560 + Math.round(r() * 30)}" cy="120" r="46" fill="#ffffff" opacity="0.4"/>` +
      ground(p, 372)
    );
  },

  tufting: (p, r) => {
    const loops = [0, 1, 2, 3, 4, 5].map((i) =>
      [0, 1, 2, 3].map(
        (j) =>
          `<circle cx="${316 + i * 30}" cy="${190 + j * 30}" r="${11 + Math.round(r() * 3)}" fill="${(i + j) % 3 === 0 ? p.accent : (i + j) % 3 === 1 ? '#ffffff' : p.ink}" opacity="0.85"/>`,
      ).join(''),
    );
    return (
      wall(p, 350) +
      // stretched frame
      `<rect x="286" y="150" width="216" height="180" rx="6" fill="none" stroke="${p.prop}" stroke-width="16"/>` +
      `<rect x="294" y="158" width="200" height="164" fill="${p.sky[0]}" opacity="0.6"/>` +
      loops.join('') +
      // legs of the frame
      `<path d="M300 330 L276 424 M488 330 L512 424" stroke="${p.prop}" stroke-width="14" stroke-linecap="round"/>` +
      // the tufting gun
      `<g transform="translate(576 268) rotate(18)"><rect x="-46" y="-22" width="92" height="44" rx="10" fill="${p.ink}"/>` +
      `<rect x="40" y="-9" width="42" height="18" rx="6" fill="${p.ink}"/>` +
      `<rect x="-24" y="20" width="24" height="40" rx="8" fill="${p.ink}"/></g>` +
      person(160, 372, 1.25, p.ink, 'point') +
      ground(p, 372)
    );
  },

  candle: (p, r) => {
    const candle = (x: number, y: number, h: number, w: number) =>
      `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="${w / 4}" fill="#ffffff" opacity="0.9"/>` +
      `<ellipse cx="${x}" cy="${y - h}" rx="${w / 2}" ry="6" fill="${p.sky[0]}"/>` +
      `<path d="M${x} ${y - h - 34} q16 18 0 30 q-16 -12 0 -30 Z" fill="${p.accent}"/>` +
      `<circle cx="${x}" cy="${y - h - 16}" r="34" fill="${p.accent}" opacity="0.18"/>`;
    return (
      wall(p, 342) +
      `<rect x="120" y="200" width="560" height="10" rx="5" fill="${p.ink}" opacity="0.3"/>` +
      [0, 1, 2, 3].map((i) => `<rect x="${170 + i * 130}" y="${162 - (i % 2) * 8}" width="46" height="38" rx="6" fill="${p.prop}" opacity="0.8"/>`).join('') +
      candle(300, 352, 92 + Math.round(r() * 16), 62) +
      candle(400, 352, 130, 74) +
      candle(500, 352, 78, 56) +
      // melting pot on the bench
      `<path d="M596 306 h74 l-10 46 h-54 Z" fill="${p.ink}" opacity="0.8"/>` +
      person(168, 372, 1.15, p.ink, 'sit') +
      ground(p, 352)
    );
  },

  music: (p, r) => {
    const beams = [0, 1, 2, 3].map(
      (i) =>
        `<path d="M${120 + i * 190} 0 L${20 + i * 190} 330 L${250 + i * 190} 330 Z" fill="${i % 2 ? p.accent : '#ffffff'}" opacity="${0.08 + r() * 0.06}"/>`,
    );
    const hands = [0, 1, 2, 3, 4, 5, 6, 7].map(
      (i) => `<path d="M${70 + i * 96} 500 L${70 + i * 96} ${430 - (i % 3) * 22}" stroke="${p.ink}" stroke-width="14" stroke-linecap="round"/>`,
    );
    return (
      beams.join('') +
      // stage
      `<rect x="140" y="322" width="520" height="20" rx="6" fill="${p.prop}"/>` +
      // performer with a guitar
      person(400, 322, 1.7, p.ink, 'point') +
      `<g transform="translate(400 236) rotate(-18)"><ellipse cx="0" cy="18" rx="34" ry="42" fill="${p.accent}"/>` +
      `<rect x="-6" y="-64" width="12" height="70" rx="4" fill="${p.accent}"/>` +
      `<circle cx="0" cy="14" r="10" fill="${p.ink}"/></g>` +
      // speakers
      `<g fill="${p.prop}"><rect x="150" y="222" width="66" height="100" rx="8"/><rect x="584" y="222" width="66" height="100" rx="8"/></g>` +
      `<g fill="${p.ink}"><circle cx="183" cy="252" r="15"/><circle cx="183" cy="292" r="20"/><circle cx="617" cy="252" r="15"/><circle cx="617" cy="292" r="20"/></g>` +
      // crowd
      `<path d="M0 500 Q400 396 800 500 Z" fill="${p.ink}"/>` +
      hands.join('')
    );
  },

  talk: (p, r) => {
    const heads = [0, 1, 2, 3, 4, 5].map(
      (i) => `<circle cx="${72 + i * 132}" cy="${452 - (i % 2) * 10}" r="30" fill="${p.ink}" opacity="0.9"/>`,
    );
    return (
      wall(p, 360) +
      // screen
      `<rect x="180" y="70" width="440" height="230" rx="12" fill="#ffffff"/>` +
      `<rect x="212" y="104" width="220" height="20" rx="10" fill="${p.accent}"/>` +
      `<rect x="212" y="140" width="330" height="12" rx="6" fill="${p.ink}" opacity="0.2"/>` +
      `<rect x="212" y="164" width="290" height="12" rx="6" fill="${p.ink}" opacity="0.2"/>` +
      `<g opacity="0.8"><rect x="212" y="200" width="70" height="${50 + Math.round(r() * 20)}" rx="6" fill="${p.accent}" transform="translate(0 ${-Math.round(r() * 20)})"/>` +
      `<rect x="296" y="212" width="70" height="58" rx="6" fill="${p.ground}"/>` +
      `<rect x="380" y="188" width="70" height="82" rx="6" fill="${p.accent}" opacity="0.6"/></g>` +
      // podium and speaker
      person(646, 360, 1.35, p.ink, 'point', true) +
      `<path d="M562 360 h96 l14 -78 h-124 Z" fill="${p.prop}"/>` +
      `<path d="M600 282 l0 -30" stroke="${p.ink}" stroke-width="6"/><circle cx="600" cy="246" r="10" fill="${p.ink}"/>` +
      heads.join('')
    );
  },

  market: (p, r) => {
    const stall = (x: number, w: number, c1: string, c2: string) =>
      `<g><rect x="${x}" y="252" width="${w}" height="120" rx="6" fill="#ffffff" opacity="0.55"/>` +
      `<path d="M${x - 14} 252 h${w + 28} l-14 -46 h-${w} Z" fill="${c1}"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M${x - 14 + (i * (w + 28)) / 4} 252 l${(w + 28) / 8} 0 l${(w + 28) / 16} 16 Z" fill="${c2}"/>`).join('') +
      `<rect x="${x + 10}" y="292" width="${w - 20}" height="14" rx="7" fill="${p.ink}" opacity="0.25"/></g>`;
    return (
      `<rect width="800" height="500" fill="${p.sky[1]}" opacity="0.25"/>` +
      // bunting
      `<path d="M0 60 Q400 ${120 + Math.round(r() * 20)} 800 56" fill="none" stroke="${p.ink}" stroke-width="3" opacity="0.5"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${50 + i * 100} ${70 + Math.abs(4 - i) * -4 + 24} l-14 0 l7 26 Z" fill="${i % 2 ? p.accent : p.ground}"/>`).join('') +
      stall(80, 190, p.accent, '#ffffff') +
      stall(330, 190, p.ground, '#ffffff') +
      stall(580, 160, p.accent, '#ffffff') +
      person(258, 400, 1.15, p.ink, 'stand') +
      person(506, 404, 1.25, p.ink, 'point') +
      person(700, 396, 1.0, p.ink, 'stand', true) +
      ground(p, 380)
    );
  },

  workshop: (p, r) => {
    const notes = [0, 1, 2, 3, 4, 5].map((i) => {
      const x = 546 + (i % 3) * 62;
      const y = 118 + Math.floor(i / 3) * 62;
      return (
        `<rect x="${x}" y="${y}" width="52" height="52" rx="4" ` +
        `fill="${i % 2 ? p.accent : p.ground}" opacity="${(0.55 + r() * 0.3).toFixed(2)}" ` +
        `transform="rotate(${-6 + i * 2} ${x + 26} ${y + 26})"/>`
      );
    });
    return (
      wall(p, 350) +
      // whiteboard
      `<rect x="520" y="92" width="230" height="200" rx="8" fill="#ffffff" opacity="0.85"/>` +
      notes.join('') +
      // table with laptops
      `<rect x="120" y="330" width="340" height="18" rx="9" fill="${p.prop}"/>` +
      `<rect x="150" y="348" width="14" height="60" fill="${p.prop}"/>` +
      `<rect x="416" y="348" width="14" height="60" fill="${p.prop}"/>` +
      [0, 1].map((i) => `<g transform="translate(${210 + i * 150} 330)"><path d="M-40 0 l10 -46 h60 l10 46 Z" fill="${p.ink}"/><rect x="-46" y="0" width="92" height="8" rx="4" fill="${p.ink}" opacity="0.7"/></g>`).join('') +
      person(150, 392, 1.2, p.ink, 'sit') +
      person(430, 392, 1.2, p.ink, 'sit', true) +
      person(636, 372, 1.15, p.ink, 'point') +
      ground(p, 372)
    );
  },

  flower: (p, r) => {
    const bloom = (x: number, y: number, size: number, c: string) =>
      `<g transform="translate(${x} ${y})">` +
      [0, 1, 2, 3, 4].map((i) => `<ellipse cx="0" cy="${-size}" rx="${size * 0.55}" ry="${size}" fill="${c}" transform="rotate(${i * 72})"/>`).join('') +
      `<circle r="${size * 0.5}" fill="${p.accent === c ? '#ffffff' : p.accent}"/></g>`;
    return (
      wall(p, 348) +
      `<rect x="0" y="348" width="800" height="20" fill="${p.ink}" opacity="0.2"/>` +
      // vases
      `<path d="M340 348 q-26 -70 14 -104 h92 q40 34 14 104 Z" fill="#ffffff" opacity="0.85"/>` +
      `<path d="M604 348 q-16 -52 8 -76 h56 q24 24 8 76 Z" fill="${p.prop}" opacity="0.85"/>` +
      // stems
      `<g stroke="${p.ground}" stroke-width="8" stroke-linecap="round" fill="none">` +
      `<path d="M390 250 q-30 -60 -46 -96"/><path d="M400 250 q6 -70 8 -110"/><path d="M414 250 q34 -56 56 -92"/>` +
      `<path d="M636 272 q-14 -46 -24 -70"/><path d="M646 272 q10 -44 26 -66"/></g>` +
      bloom(344, 154, 22, p.accent) +
      bloom(408, 140 - Math.round(r() * 10), 26, '#ffffff') +
      bloom(470, 158, 20, p.accent) +
      bloom(612, 202, 16, '#ffffff') +
      bloom(672, 206, 16, p.accent) +
      person(180, 380, 1.25, p.ink, 'point') +
      ground(p, 380)
    );
  },

  craft: (p, r) => {
    const shelfItems = (y: number) =>
      [0, 1, 2, 3]
        .map((i) => {
          const h = 26 + Math.round(r() * 22);
          return (
            `<path d="M${540 + i * 56} ${y} l0 -${h} q0 -12 14 -12 q14 0 14 12 l0 ${h} Z" ` +
            `fill="${i % 2 ? p.prop : p.accent}" opacity="0.85"/>`
          );
        })
        .join('');
    return (
      wall(p, 344) +
      `<rect x="520" y="140" width="248" height="9" rx="4" fill="${p.ink}" opacity="0.35"/>` +
      `<rect x="520" y="238" width="248" height="9" rx="4" fill="${p.ink}" opacity="0.35"/>` +
      shelfItems(140) +
      shelfItems(238) +
      // workbench
      `<rect x="60" y="320" width="420" height="20" rx="8" fill="${p.prop}"/>` +
      `<rect x="92" y="340" width="16" height="80" fill="${p.prop}"/>` +
      `<rect x="432" y="340" width="16" height="80" fill="${p.prop}"/>` +
      // tools laid out
      `<g fill="${p.ink}" opacity="0.85"><rect x="120" y="300" width="90" height="14" rx="7"/>` +
      `<rect x="232" y="296" width="54" height="20" rx="6"/><circle cx="330" cy="306" r="16"/>` +
      `<path d="M380 314 l0 -34 q0 -10 12 -10 q12 0 12 10 l0 34 Z"/></g>` +
      person(560, 372, 1.2, p.ink, 'point', true) +
      ground(p, 372)
    );
  },

  campus: (p, r) => {
    const arch = (x: number) =>
      `<path d="M${x} 320 l0 -70 q0 -34 34 -34 q34 0 34 34 l0 70 Z" fill="${p.sky[0]}" opacity="0.85"/>`;
    return (
      `<rect width="800" height="500" fill="${p.sky[1]}" opacity="0.2"/>` +
      // building
      `<rect x="130" y="150" width="540" height="200" rx="8" fill="${p.prop}"/>` +
      `<path d="M110 150 L400 ${52 + Math.round(r() * 14)} L690 150 Z" fill="${p.ground}"/>` +
      `<rect x="360" y="96" width="80" height="54" rx="6" fill="${p.accent}" opacity="0.8"/>` +
      [0, 1, 2, 3, 4].map((i) => arch(170 + i * 100)).join('') +
      // steps
      `<rect x="90" y="350" width="620" height="18" rx="4" fill="${p.prop}" opacity="0.8"/>` +
      `<rect x="60" y="368" width="680" height="18" rx="4" fill="${p.prop}" opacity="0.6"/>` +
      person(236, 402, 1.2, p.ink, 'stand') +
      person(400, 406, 1.3, p.ink, 'point') +
      person(566, 402, 1.2, p.ink, 'stand', true) +
      ground(p, 396)
    );
  },

  photography: (p, r) => {
    return (
      wall(p, 350) +
      // backdrop roll
      `<rect x="470" y="60" width="250" height="292" rx="10" fill="#ffffff" opacity="0.5"/>` +
      // light stand
      `<g stroke="${p.ink}" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.85">` +
      `<path d="M660 200 L660 386"/><path d="M660 386 L620 424 M660 386 L700 424"/></g>` +
      `<path d="M604 158 h112 l22 60 h-156 Z" fill="${p.accent}" opacity="0.9"/>` +
      // the camera, centre stage
      `<g transform="translate(300 ${256 + Math.round(r() * 10)})">` +
      `<path d="M-150 -50 h60 l16 -28 h88 l16 28 h60 q16 0 16 16 v110 q0 16 -16 16 h-240 q-16 0 -16 -16 v-110 q0 -16 16 -16 Z" fill="${p.ink}"/>` +
      `<circle r="56" cy="30" fill="${p.prop}"/><circle r="42" cy="30" fill="${p.sky[0]}"/>` +
      `<circle r="24" cy="30" fill="${p.ink}" opacity="0.85"/>` +
      `<circle cx="110" cy="-24" r="9" fill="${p.accent}"/></g>` +
      ground(p, 380)
    );
  },

  community: (p, r) => {
    const balloon = (x: number, y: number, c: string) =>
      `<path d="M${x} ${y + 76} q6 -18 0 -26" stroke="${p.ink}" stroke-width="3" fill="none" opacity="0.5"/>` +
      `<ellipse cx="${x}" cy="${y}" rx="26" ry="32" fill="${c}"/>`;
    return (
      `<rect width="800" height="500" fill="${p.sky[1]}" opacity="0.25"/>` +
      `<circle cx="${120 + Math.round(r() * 60)}" cy="110" r="58" fill="#ffffff" opacity="0.45"/>` +
      balloon(150, 150, p.accent) +
      balloon(206, 118, p.ground) +
      balloon(660, 138, p.ground) +
      // picnic blanket
      `<path d="M250 430 L400 372 L560 430 L400 480 Z" fill="#ffffff" opacity="0.6"/>` +
      person(300, 400, 1.25, p.ink, 'stand') +
      person(400, 396, 1.4, p.ink, 'reach') +
      person(500, 400, 1.25, p.ink, 'stand', true) +
      person(590, 388, 1.05, p.ground, 'point') +
      person(214, 388, 1.05, p.ground, 'stand') +
      ground(p, 396)
    );
  },
};

/* ---------- theme resolution ---------- */

/** Checked in order -- the first match wins, so the specific sit above the general. */
const THEME_RULES: [RegExp, Theme][] = [
  [/pottery|clay|ceramic|kiln/, 'pottery'],
  [/sunrise|retreat/, 'sunrise'],
  [/yoga|namaste|hatha|pilates|meditat|wellness|flow-with-me/, 'yoga'],
  [/latte|coffee|kopi|cafe|barista|espresso|brew/, 'coffee'],
  [/dance|kpop|k-pop|choreo|move-studio|ballet/, 'dance'],
  [/gym|strength|hyrox|fitness|strive|workout|training-floor/, 'gym'],
  [/\brun\b|running|marathon|jog|sprint/, 'running'],
  [/language|conversation|english|lingua|debate/, 'language'],
  [/supper|dinner|banquet|feast/, 'supper'],
  [/cook|kitchen|greenbite|culinary|chef|baking|food/, 'cooking'],
  [/watercolou?r|paint|sketch|drawing|illustration-class|artify/, 'painting'],
  [/tufting|rug|weav|knit|crochet/, 'tufting'],
  [/candle|wax|aroma|scent/, 'candle'],
  [/concert|jazz|music|indie|band|rooftop|gig|\bdj\b|live-house/, 'music'],
  [/talk|stage|seminar|startup|keynote|conference|summit|panel|speaker/, 'talk'],
  [/market|pasar|bazaar|festival|fair/, 'market'],
  [/workshop|masterclass|design|\bux\b|education|training|course|class/, 'workshop'],
  [/flower|floral|bouquet|garden|plant/, 'flower'],
  [/camera|photograph|shoot|studio-light/, 'photography'],
  [/craft|handmade|maker|artisan|studio/, 'craft'],
  [/campus|student|university|school|orientation/, 'campus'],
  [/community|meetup|gather|social|club|crowd|networking/, 'community'],
];

/** Slots whose id carries no subject of its own. */
const ID_THEME: Record<string, Theme> = {
  'builder-cover': 'pottery',
  'event-cover': 'talk',
  'persona-communities': 'community',
  'persona-campus': 'campus',
  'persona-eo': 'market',
};

function themeFor(id: string, placeholder: string): Theme {
  const fixed = ID_THEME[id];
  if (fixed) return fixed;

  /* "photo" appears in half the hints ("Drop hero photo -- pottery wheel") and
     would otherwise drag every one of them into the camera scene. */
  const hay = `${id} ${placeholder}`.toLowerCase().replace(/photos?|drop hero|upload|cover|image/g, ' ');

  for (const [rule, theme] of THEME_RULES) {
    if (rule.test(hay)) return theme;
  }
  if (id.startsWith('builder-gallery')) return 'pottery';
  return 'community';
}

/**
 * The same scene, laid out for a hero band.
 *
 * A hero is roughly 2.5:1 while a card is 1.6:1, and `object-fit: cover` fills
 * the difference by scaling up -- which blew the figures up to three times
 * their intended size and cropped the scene to a detail. So a wide canvas gets
 * its own composition: the motif at its drawn size in the middle, dissolving
 * into open sky at both edges. The sides carry no floor line of their own --
 * one that did not line up with the motif's left a step across the band.
 */
function banner(theme: Theme, seed: number): string {
  const p = PALETTES[theme];
  const r = rng(seed);
  const body =
    `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0.1" y2="1">` +
    `<stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/>` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#000000"/><stop offset="0.28" stop-color="#ffffff"/>` +
    `<stop offset="0.72" stop-color="#ffffff"/><stop offset="1" stop-color="#000000"/>` +
    `</linearGradient>` +
    `<mask id="edges"><rect x="452" y="0" width="696" height="500" fill="url(#fade)"/></mask>` +
    `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${p.ground}" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="${p.ground}" stop-opacity="0.9"/></linearGradient>` +
    `<linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#12121a" stop-opacity="0.10"/>` +
    `<stop offset="0.5" stop-color="#12121a" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#12121a" stop-opacity="0.20"/></linearGradient>` +
    `</defs>` +
    `<rect width="1600" height="500" fill="url(#sky)"/>` +
    `<circle cx="${560 + Math.round(r() * 480)}" cy="150" r="360" fill="url(#glow)"/>` +
    // A soft floor with no edge to it, so nothing steps where the motif ends.
    `<rect y="300" width="1600" height="200" fill="url(#floor)"/>` +
    /* The mask sits on the outer group and the shift on the inner one: a
       transform on the masked element itself moves the mask with it, and the
       motif came out hard-cropped instead of faded. */
    /* Drawn a little under size: a phone crops this band to its middle third,
       and at 1:1 the motif filled that crop with one enormous silhouette. */
    `<g mask="url(#edges)"><g transform="translate(452 44) scale(0.87)">${MOTIFS[theme](p, r)}</g></g>` +
    `<rect width="1600" height="500" fill="url(#vig)"/>`;
  return svg(1600, 500, body);
}

function scene(theme: Theme, seed: number): string {
  const p = PALETTES[theme];
  const r = rng(seed);
  const lightX = 180 + Math.round(r() * 440);
  const body =
    `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0.1" y2="1">` +
    `<stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#12121a" stop-opacity="0.10"/>` +
    `<stop offset="0.45" stop-color="#12121a" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#12121a" stop-opacity="0.20"/></linearGradient>` +
    `</defs>` +
    `<rect width="800" height="500" fill="url(#sky)"/>` +
    `<circle cx="${lightX}" cy="140" r="280" fill="url(#glow)"/>` +
    MOTIFS[theme](p, r) +
    `<rect width="800" height="500" fill="url(#vig)"/>`;
  return svg(800, 500, body);
}

/* ---------- people ---------- */

const SKIN = ['#f3d3ba', '#e8bd97', '#cf9f76', '#a9714a', '#7d4d2e', '#5c3520'];
const HAIR = ['#2b1c14', '#16121f', '#4a2c1a', '#6b3f22', '#1f2a3d', '#5b2b52'];
const SHIRT = ['#6d28ff', '#16a34a', '#ea8c00', '#2c7d84', '#e2547f', '#38507e', '#8d6ae8'];
const BACKDROP = ['#efe9ff', '#e2f2e7', '#fff0dc', '#dcf0f2', '#ffe9f0', '#e6eeff'];

/**
 * A portrait for the slots that hold a face -- hosts, reviewers, attendees.
 * Features are simple on purpose: these render at 32px as often as at 120px.
 */
function avatar(seed: number): string {
  const r = rng(seed);
  const skin = pick(r, SKIN);
  const hair = pick(r, HAIR);
  const shirt = pick(r, SHIRT);
  const back = pick(r, BACKDROP);
  const style = Math.floor(r() * 4);

  const hairArt =
    style === 0
      ? // bun
        `<circle cx="120" cy="52" r="20" fill="${hair}"/>` +
        `<path d="M74 112 q0 -46 46 -46 q46 0 46 46 q0 -70 -46 -70 q-46 0 -46 70 Z" fill="${hair}"/>`
      : style === 1
        ? // short crop
          `<path d="M72 112 q0 -52 48 -52 q48 0 48 52 q-10 -22 -48 -22 q-38 0 -48 22 Z" fill="${hair}"/>`
        : style === 2
          ? // long
            `<path d="M68 116 q0 -58 52 -58 q52 0 52 58 l0 74 q-16 -22 -18 -60 q-12 16 -34 16 q-22 0 -34 -16 q-2 38 -18 60 Z" fill="${hair}"/>`
          : // headscarf
            `<path d="M66 118 q0 -60 54 -60 q54 0 54 60 l6 78 q-60 16 -120 0 Z" fill="${hair}"/>` +
            `<path d="M84 100 q10 -24 36 -24 q26 0 36 24 q-16 -8 -36 -8 q-20 0 -36 8 Z" fill="${skin}" opacity="0.25"/>`;

  const body =
    `<rect width="240" height="240" fill="${back}"/>` +
    `<circle cx="120" cy="128" r="104" fill="#ffffff" opacity="0.45"/>` +
    // shoulders
    `<path d="M28 240 q0 -74 92 -74 q92 0 92 74 Z" fill="${shirt}"/>` +
    `<path d="M104 172 h32 v-24 h-32 Z" fill="${skin}"/>` +
    // head
    `<circle cx="120" cy="116" r="50" fill="${skin}"/>` +
    hairArt +
    // face
    `<g fill="#2b2333"><circle cx="103" cy="116" r="4.6"/><circle cx="137" cy="116" r="4.6"/></g>` +
    `<path d="M108 136 q12 11 24 0" stroke="#2b2333" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  return svg(240, 240, body);
}

/* ---------- QR, maps, logos ---------- */

/**
 * A decorative QR block. It has the anatomy of the real thing -- quiet zone,
 * three finders, timing tracks -- but the payload is noise, so it is a picture
 * of a code rather than a code. Anything that must actually scan needs a real
 * encoder behind it.
 */
function qr(seed: number): string {
  const n = 25;
  const cell = 8;
  const pad = 18;
  const size = n * cell + pad * 2;
  const r = rng(seed);

  const reserved = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9) || x === 6 || y === 6;

  let cells = '';
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (reserved(x, y) || r() > 0.46) continue;
      cells += `<rect x="${pad + x * cell}" y="${pad + y * cell}" width="${cell}" height="${cell}" rx="1.6"/>`;
    }
  }

  const finder = (cx: number, cy: number) =>
    `<rect x="${pad + cx * cell}" y="${pad + cy * cell}" width="${cell * 7}" height="${cell * 7}" rx="10" fill="none" stroke="#12121a" stroke-width="${cell}"/>` +
    `<rect x="${pad + (cx + 2) * cell}" y="${pad + (cy + 2) * cell}" width="${cell * 3}" height="${cell * 3}" rx="4" fill="#12121a"/>`;

  let timing = '';
  for (let i = 8; i < n - 8; i += 2) {
    timing += `<rect x="${pad + i * cell}" y="${pad + 6 * cell}" width="${cell}" height="${cell}"/>`;
    timing += `<rect x="${pad + 6 * cell}" y="${pad + i * cell}" width="${cell}" height="${cell}"/>`;
  }

  const body =
    `<rect width="${size}" height="${size}" rx="18" fill="#ffffff"/>` +
    `<g fill="#12121a">${cells}${timing}</g>` +
    finder(0, 0) +
    finder(n - 7, 0) +
    finder(0, n - 7) +
    // the brand mark punched into the middle
    `<rect x="${size / 2 - 26}" y="${size / 2 - 26}" width="52" height="52" rx="15" fill="#ffffff"/>` +
    `<rect x="${size / 2 - 18}" y="${size / 2 - 18}" width="36" height="36" rx="11" fill="#6d28ff"/>` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="7" fill="#ffffff"/>`;
  return svg(size, size, body);
}

/** A stylised neighbourhood tile with a pin where the venue sits. */
function mapTile(seed: number): string {
  const r = rng(seed);
  const roadsH = [130 + r() * 40, 260 + r() * 40, 400 + r() * 40];
  const roadsV = [140 + r() * 60, 340 + r() * 60, 560 + r() * 60, 720];

  const blocks = roadsH
    .map((y, i) =>
      roadsV
        .map((x, j) => {
          if (r() > 0.72) return '';
          const w = 40 + r() * 60;
          const h = 26 + r() * 40;
          return `<rect x="${x + 18 + (i % 2) * 10}" y="${y + 16 + (j % 2) * 8}" width="${w}" height="${h}" rx="4" fill="#dcd8ea" opacity="0.9"/>`;
        })
        .join(''),
    )
    .join('');

  const road = (d: string) =>
    `<path d="${d}" stroke="#e2dff0" stroke-width="24" fill="none" stroke-linecap="round"/>` +
    `<path d="${d}" stroke="#ffffff" stroke-width="16" fill="none" stroke-linecap="round"/>`;

  const body =
    `<rect width="800" height="500" fill="#f4f2fa"/>` +
    // water and green
    `<path d="M0 430 Q160 396 300 440 T640 452 L800 430 L800 500 L0 500 Z" fill="#cfe2f5"/>` +
    `<path d="M560 60 q120 -14 180 40 q30 70 -40 104 q-110 20 -150 -50 Z" fill="#d7ecd8"/>` +
    `<circle cx="150" cy="120" r="62" fill="#d7ecd8"/>` +
    blocks +
    roadsH.map((y) => road(`M-20 ${y} Q400 ${y - 18} 820 ${y + 10}`)).join('') +
    roadsV.map((x) => road(`M${x} -20 L${x - 14} 520`)).join('') +
    // route into the venue
    `<path d="M120 470 Q300 400 400 300" stroke="#6d28ff" stroke-width="8" fill="none" stroke-dasharray="2 18" stroke-linecap="round" opacity="0.75"/>` +
    // the pin
    `<ellipse cx="400" cy="300" rx="34" ry="11" fill="#12121a" opacity="0.18"/>` +
    `<path d="M400 296 q-46 -50 -46 -84 q0 -46 46 -46 q46 0 46 46 q0 34 -46 84 Z" fill="#6d28ff"/>` +
    `<circle cx="400" cy="210" r="17" fill="#ffffff"/>`;
  return svg(800, 500, body);
}

/** The little square mark a workspace or a host shows next to its name. */
function logo(seed: number, initials: string): string {
  const r = rng(seed);
  const a = pick(r, ['#6d28ff', '#16a34a', '#ea8c00', '#2c7d84', '#e2547f']);
  const body =
    `<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="#12121a" stop-opacity="0.75"/>` +
    `</linearGradient></defs>` +
    `<rect width="240" height="240" rx="56" fill="url(#lg)"/>` +
    `<circle cx="188" cy="56" r="46" fill="#ffffff" opacity="0.14"/>` +
    `<circle cx="46" cy="204" r="60" fill="#ffffff" opacity="0.1"/>` +
    `<text x="120" y="120" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="Poppins, Segoe UI, system-ui, sans-serif" font-size="${initials.length > 1 ? 92 : 116}" ` +
    `font-weight="700" fill="#ffffff" letter-spacing="-2">${initials}</text>`;
  return svg(240, 240, body);
}

const ID_INITIALS: Record<string, string> = {
  'org-workspace-logo': 'WL',
  'event-logo': 'WL',
  'event-host-logo': 'WL',
};

function initialsFor(id: string, placeholder: string): string {
  const fixed = ID_INITIALS[id];
  if (fixed) return fixed;
  const words = placeholder.replace(/[^a-zA-Z ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'H';
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** A phone held up to a code -- what the check-in desk sees. */
function scanner(seed: number): string {
  const r = rng(seed);
  const body =
    `<rect width="800" height="500" fill="#161225"/>` +
    `<rect width="800" height="500" fill="#6d28ff" opacity="0.12"/>` +
    // the code in frame, slightly off-square as a real camera would catch it
    `<g transform="translate(400 250) rotate(${-4 + r() * 8}) translate(-110 -110)">` +
    `<rect width="220" height="220" rx="16" fill="#ffffff" opacity="0.94"/>` +
    `<g fill="#12121a">` +
    [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
      [0, 1, 2, 3, 4, 5, 6, 7].map((j) =>
        r() > 0.5 ? `<rect x="${24 + i * 22}" y="${24 + j * 22}" width="20" height="20" rx="3"/>` : '',
      ).join(''),
    ).join('') +
    `</g>` +
    `<g fill="none" stroke="#12121a" stroke-width="16">` +
    `<rect x="24" y="24" width="64" height="64" rx="10"/><rect x="132" y="24" width="64" height="64" rx="10"/>` +
    `<rect x="24" y="132" width="64" height="64" rx="10"/></g></g>` +
    // viewfinder brackets
    `<g stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none">` +
    `<path d="M210 140 h-40 v40"/><path d="M590 140 h40 v40"/>` +
    `<path d="M210 360 h-40 v-40"/><path d="M590 360 h40 v-40"/></g>` +
    // scan line
    `<rect x="170" y="246" width="460" height="6" rx="3" fill="#16a34a" opacity="0.9"/>` +
    `<rect x="170" y="230" width="460" height="38" fill="#16a34a" opacity="0.18"/>`;
  return svg(800, 500, body);
}

/* ---------- decorative illustrations ---------- */

type Decor =
  | 'mascot'
  | 'calendar'
  | 'checklist'
  | 'dice'
  | 'envelope'
  | 'ticket'
  | 'support'
  | 'flow'
  | 'organizer'
  | 'spark';

/* Specific before general: half these hints read "Mascot + something", and the
   something is the subject -- the character comes along with it either way. */
const DECOR_RULES: [RegExp, Decor][] = [
  [/calendar|clock|reminder|routine|schedule/, 'calendar'],
  [/checklist|check ?list|experiences|note/, 'checklist'],
  [/dice|surprise|random|roll|shuffle/, 'dice'],
  [/envelope|mail|newsletter|inbox|letter/, 'envelope'],
  [/ticket|boarding pass/, 'ticket'],
  [/support|help|question|faq/, 'support'],
  [/flow|how it works|steps|journey/, 'flow'],
  [/organizer|dashboard|workspace/, 'organizer'],
  [/mascot|waving|hoople/, 'mascot'],
];

const CONFETTI = ['#6d28ff', '#16a34a', '#ea8c00', '#e2547f', '#2c7d84'];

function confetti(r: Rand, count = 9): string {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const x = 40 + r() * 520;
    const y = 30 + r() * 400;
    const c = CONFETTI[i % CONFETTI.length];
    out +=
      r() > 0.5
        ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(4 + r() * 6).toFixed(0)}" fill="${c}" opacity="0.55"/>`
        : `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(8 + r() * 10).toFixed(0)}" height="8" rx="4" fill="${c}" opacity="0.5" transform="rotate(${(r() * 90).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  return out;
}

/** The Hoople character -- one drawing, reused wherever a mascot is asked for. */
function mascot(x: number, y: number, s: number, waving: boolean): string {
  const arm = waving
    ? `<path d="M-62 -80 q-40 -10 -46 -52" stroke="#5b21f5" stroke-width="18" stroke-linecap="round" fill="none"/>`
    : `<path d="M-62 -80 q-34 6 -40 40" stroke="#5b21f5" stroke-width="18" stroke-linecap="round" fill="none"/>`;
  return (
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<ellipse cx="0" cy="8" rx="76" ry="14" fill="#12121a" opacity="0.12"/>` +
    `<path d="M-70 -66 q0 -84 70 -84 q70 0 70 84 q0 66 -70 66 q-70 0 -70 -66 Z" fill="#6d28ff"/>` +
    `<path d="M-70 -66 q0 -84 70 -84 q30 0 48 18 q-84 24 -118 66 Z" fill="#ffffff" opacity="0.16"/>` +
    arm +
    `<path d="M62 -80 q34 6 40 40" stroke="#5b21f5" stroke-width="18" stroke-linecap="round" fill="none"/>` +
    `<g fill="#ffffff"><circle cx="-26" cy="-92" r="16"/><circle cx="26" cy="-92" r="16"/></g>` +
    `<g fill="#12121a"><circle cx="-23" cy="-90" r="7"/><circle cx="29" cy="-90" r="7"/></g>` +
    `<path d="M-16 -60 q16 16 32 0" stroke="#12121a" stroke-width="6" stroke-linecap="round" fill="none"/>` +
    `<circle cx="-48" cy="-64" r="10" fill="#ff8fb0" opacity="0.55"/>` +
    `<circle cx="48" cy="-64" r="10" fill="#ff8fb0" opacity="0.55"/>` +
    `<path d="M-34 0 l0 14 M34 0 l0 14" stroke="#5b21f5" stroke-width="18" stroke-linecap="round"/>` +
    `</g>`
  );
}

function card(x: number, y: number, w: number, h: number, fill = '#ffffff'): string {
  return (
    `<rect x="${x + 6}" y="${y + 10}" width="${w}" height="${h}" rx="20" fill="#12121a" opacity="0.08"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${fill}"/>`
  );
}

function decor(kind: Decor, seed: number): string {
  const r = rng(seed);
  let art = '';

  switch (kind) {
    case 'mascot':
      art = mascot(300, 396, 1.5, true);
      break;

    case 'calendar':
      art =
        card(150, 100, 300, 250) +
        `<path d="M150 120 q0 -20 20 -20 h260 q20 0 20 20 v42 h-300 Z" fill="#6d28ff"/>` +
        `<g fill="#ffffff"><rect x="196" y="78" width="16" height="46" rx="8"/><rect x="388" y="78" width="16" height="46" rx="8"/></g>` +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
          .map((i) => {
            const on = i === 4 || i === 9;
            return `<rect x="${182 + (i % 4) * 62}" y="${190 + Math.floor(i / 4) * 52}" width="${on ? 40 : 32}" height="32" rx="${on ? 12 : 8}" fill="${on ? '#16a34a' : '#e7e2f5'}"/>`;
          })
          .join('') +
        // the clock sitting in front
        `<circle cx="452" cy="330" r="72" fill="#ffffff"/>` +
        `<circle cx="452" cy="330" r="72" fill="none" stroke="#6d28ff" stroke-width="12"/>` +
        `<path d="M452 330 L452 292 M452 330 L482 344" stroke="#12121a" stroke-width="10" stroke-linecap="round"/>`;
      break;

    case 'checklist':
      art =
        card(150, 84, 300, 300) +
        [0, 1, 2, 3]
          .map((i) => {
            const done = i < 3;
            return (
              `<rect x="184" y="${132 + i * 62}" width="40" height="40" rx="12" fill="${done ? '#16a34a' : '#e7e2f5'}"/>` +
              (done
                ? `<path d="M194 ${152 + i * 62} l9 10 l17 -19" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
                : '') +
              `<rect x="242" y="${144 + i * 62}" width="${170 - i * 22}" height="16" rx="8" fill="#e7e2f5"/>`
            );
          })
          .join('') +
        mascot(500, 400, 0.72, false);
      break;

    case 'dice':
      art =
        `<g transform="translate(300 240) rotate(-12)">` +
        `<rect x="-110" y="-110" width="220" height="220" rx="46" fill="#ffffff"/>` +
        `<rect x="-110" y="-110" width="220" height="220" rx="46" fill="none" stroke="#6d28ff" stroke-width="10"/>` +
        `<g fill="#6d28ff"><circle cx="-56" cy="-56" r="18"/><circle cx="56" cy="-56" r="18"/>` +
        `<circle cx="0" cy="0" r="18"/><circle cx="-56" cy="56" r="18"/><circle cx="56" cy="56" r="18"/></g></g>` +
        `<g transform="translate(468 372) rotate(16)">` +
        `<rect x="-64" y="-64" width="128" height="128" rx="28" fill="#6d28ff"/>` +
        `<g fill="#ffffff"><circle cx="-30" cy="-30" r="11"/><circle cx="30" cy="30" r="11"/><circle cx="0" cy="0" r="11"/></g></g>`;
      break;

    case 'envelope':
      art =
        card(130, 130, 340, 220) +
        `<path d="M130 150 L300 268 L470 150" fill="none" stroke="#6d28ff" stroke-width="14" stroke-linejoin="round"/>` +
        `<rect x="216" y="60" width="168" height="120" rx="14" fill="#6d28ff"/>` +
        `<g fill="#ffffff" opacity="0.85"><rect x="244" y="94" width="112" height="12" rx="6"/>` +
        `<rect x="244" y="122" width="80" height="12" rx="6"/></g>` +
        mascot(500, 400, 0.66, true);
      break;

    case 'ticket':
      art =
        `<g transform="translate(300 230) rotate(-6)">` +
        `<path d="M-180 -90 h250 a26 26 0 0 0 26 26 a26 26 0 0 0 -26 26 v38 a26 26 0 0 0 26 26 a26 26 0 0 0 -26 26 h-250 a20 20 0 0 1 -20 -20 v-102 a20 20 0 0 1 20 -20 Z" fill="#ffffff"/>` +
        `<g fill="#e7e2f5"><rect x="-152" y="-52" width="150" height="16" rx="8"/><rect x="-152" y="-20" width="110" height="14" rx="7"/></g>` +
        `<rect x="-152" y="14" width="86" height="26" rx="13" fill="#16a34a"/>` +
        `<path d="M96 -90 v192" stroke="#e7e2f5" stroke-width="4" stroke-dasharray="10 10"/></g>` +
        `<g transform="translate(452 356)"><rect x="-58" y="-58" width="116" height="116" rx="18" fill="#12121a"/>` +
        [0, 1, 2, 3, 4].map((i) =>
          [0, 1, 2, 3, 4].map((j) => (r() > 0.45 ? `<rect x="${-46 + i * 19}" y="${-46 + j * 19}" width="15" height="15" rx="2" fill="#ffffff"/>` : '')).join(''),
        ).join('') +
        `</g>`;
      break;

    case 'support':
      art =
        `<path d="M110 120 h300 q26 0 26 26 v150 q0 26 -26 26 h-190 l-70 56 v-56 h-40 q-26 0 -26 -26 v-150 q0 -26 26 -26 Z" fill="#ffffff"/>` +
        `<g fill="#e7e2f5"><rect x="150" y="166" width="200" height="16" rx="8"/><rect x="150" y="200" width="150" height="16" rx="8"/>` +
        `<rect x="150" y="234" width="180" height="16" rx="8"/></g>` +
        `<path d="M300 250 h190 q26 0 26 26 v120 q0 26 -26 26 h-120 l-58 44 v-44 h-12 q-26 0 -26 -26 Z" fill="#6d28ff"/>` +
        `<g fill="#ffffff" opacity="0.9"><rect x="336" y="292" width="130" height="14" rx="7"/><rect x="336" y="322" width="96" height="14" rx="7"/></g>` +
        `<circle cx="470" cy="112" r="46" fill="#16a34a"/>` +
        `<path d="M456 100 q0 -18 18 -18 q16 0 16 15 q0 13 -14 17 v9" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round"/>` +
        `<circle cx="474" cy="138" r="5" fill="#ffffff"/>`;
      break;

    case 'flow':
      art =
        `<path d="M140 300 Q250 180 300 300 T460 240" fill="none" stroke="#6d28ff" stroke-width="8" stroke-dasharray="3 16" stroke-linecap="round" opacity="0.7"/>` +
        [
          ['#6d28ff', 140, 300, '1'],
          ['#16a34a', 300, 300, '2'],
          ['#ea8c00', 460, 240, '3'],
        ]
          .map(
            ([c, cx, cy, label]) =>
              `<circle cx="${cx}" cy="${cy}" r="52" fill="#ffffff"/>` +
              `<circle cx="${cx}" cy="${cy}" r="52" fill="none" stroke="${c}" stroke-width="10"/>` +
              `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="Poppins, Segoe UI, sans-serif" font-size="42" font-weight="700" fill="${c}">${label}</text>`,
          )
          .join('') +
        mascot(300, 442, 0.5, true);
      break;

    case 'organizer':
      art =
        card(120, 96, 360, 250) +
        `<rect x="120" y="96" width="360" height="46" rx="20" fill="#6d28ff"/>` +
        `<g fill="#ffffff" opacity="0.7"><circle cx="152" cy="119" r="7"/><circle cx="174" cy="119" r="7"/><circle cx="196" cy="119" r="7"/></g>` +
        // little dashboard bars
        [0, 1, 2, 3].map((i) => `<rect x="${164 + i * 68}" y="${300 - (40 + Math.round(r() * 96))}" width="42" height="${40 + Math.round(r() * 96)}" rx="10" fill="${i === 2 ? '#16a34a' : '#d9cffa'}"/>`).join('') +
        `<rect x="150" y="308" width="300" height="10" rx="5" fill="#e7e2f5"/>` +
        mascot(486, 400, 0.78, true);
      break;

    default:
      art = mascot(300, 400, 1.1, true) + `<circle cx="300" cy="200" r="120" fill="#6d28ff" opacity="0.07"/>`;
  }

  return svg(600, 480, confetti(r) + art);
}

/* ---------- the resolver ---------- */

const AVATAR_IDS =
  /(^|-)avatar|^reviewer-|^attendee-|^builder-instructor-|^landing-avatar|^activities-avatar|^org-reg-/;
const QR_IDS = /^qr-|qr$|^payment-qr|^eticket-qr|^landing-card-qr/;
const MAP_IDS = /^map-|-map$|-map-|^builder-map|^event-map/;
const LOGO_IDS = /logo$/;

const cache = new Map<string, string>();

/**
 * The picture a slot shows until someone drops a real one on it.
 * `undefined` means "leave this slot empty" -- nothing does that today, but
 * the door is open for slots that should stay blank.
 */
export function artworkFor(id: string, placeholder = ''): string | undefined {
  if (!id) return undefined;
  const key = `${id}|${placeholder}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const seed = hash(key);
  const hay = `${id} ${placeholder}`.toLowerCase();

  let art: string;
  if (QR_IDS.test(id) || /\bqr\b/.test(hay.replace('scanner', ''))) {
    art = /scan/.test(hay) ? scanner(seed) : qr(seed);
  } else if (/scan/.test(hay)) {
    art = scanner(seed);
  } else if (MAP_IDS.test(id) || /^map|map of|map screenshot/.test(placeholder.toLowerCase())) {
    art = mapTile(seed);
  } else if (AVATAR_IDS.test(id) || /avatar|headshot|portrait/.test(hay)) {
    art = avatar(seed);
  } else if (LOGO_IDS.test(id) || /^logo$/i.test(placeholder.trim())) {
    art = logo(seed, initialsFor(id, placeholder));
    /* Decorative slots say so in their hint ("Illustration", "Dice 3D",
       "Mascot + checklist"). Matching the id instead swept in every subject
       that happens to contain the word art -- a Latte Art Workshop booking
       came back as the mascot. */
  } else if (/mascot/.test(id) || /mascot|illustration|\b3d\b|calendar \+/i.test(placeholder)) {
    const kind = DECOR_RULES.find(([rule]) => rule.test(hay))?.[1] ?? 'spark';
    art = decor(kind, seed);
  } else if (/hero/.test(id)) {
    art = banner(themeFor(id, placeholder), seed);
  } else {
    art = scene(themeFor(id, placeholder), seed);
  }

  cache.set(key, art);
  return art;
}
