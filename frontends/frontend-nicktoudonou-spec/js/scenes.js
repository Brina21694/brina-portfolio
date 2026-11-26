/* ==========================================================================
   SCENES — décors cinématographiques dessinés en code (aucune photo, aucun
   visuel de jeu copié). Chaque "monde" évoque une ambiance :

   dusk     : heure dorée sur une ville (immersion, lumière chaude)
   neon     : rue de nuit sous la pluie, néons reflétés (technologie)
   monolith : architecture brutaliste, lumière rouge (géométrie monumentale)
   ivory    : brume claire et courbes de niveau (espace, contemplation)

   Les décors sont dessinés une seule fois (à chaque redimensionnement) ;
   seuls de légers calques (trafic, pluie) sont animés, et seulement à l'écran.
   ========================================================================== */

import { reduced } from "./motion.js";

/* Générateur aléatoire reproductible : même graine = même décor */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const WORLDS = {
  dusk:     { name: "Golden hour", accent: "#FFB36B", text: "light" },
  neon:     { name: "Neon district", accent: "#2BE4FF", text: "light" },
  monolith: { name: "Monolith", accent: "#E8262E", text: "light" },
  ivory:    { name: "White field", accent: "#141418", text: "dark" },
};
export const WORLD_ORDER = ["dusk", "neon", "monolith", "ivory"];

/* ---------- Outils de dessin ---------- */

function skyline(ctx, w, base, { r, minH, maxH, fill, bw = [22, 64], windows = 0, win = "rgba(255,196,120,0.85)", gap = 0.3 }) {
  let x = -30;
  while (x < w + 30) {
    const width = bw[0] + r() * (bw[1] - bw[0]);
    const height = minH + Math.pow(r(), 1.5) * (maxH - minH);
    ctx.fillStyle = fill;
    ctx.fillRect(x, base - height, width, height + 4000);
    if (r() < 0.18) ctx.fillRect(x + width * 0.5 - 1, base - height - 10 - r() * 28, 2, 40);
    if (r() < 0.22) ctx.fillRect(x + width * 0.18, base - height - 7, width * 0.64, 8);
    if (windows) {
      ctx.fillStyle = win;
      for (let wy = base - height + 8; wy < base - 6; wy += 7) {
        for (let wx = x + 4; wx < x + width - 5; wx += 6) {
          if (r() < windows) ctx.fillRect(wx, wy, 2, 3);
        }
      }
    }
    x += width + (r() < gap ? r() * 8 : 0);
  }
}

function palm(ctx, x, groundY, height, lean, color, r) {
  const topX = x + lean;
  const topY = groundY - height;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  // tronc effilé
  const steps = 18;
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const px = (t) => x + (topX - x) * t + Math.sin(t * Math.PI) * lean * 0.25;
    const py = (t) => groundY - height * t;
    ctx.lineWidth = 14 - 9 * t0;
    ctx.beginPath(); ctx.moveTo(px(t0), py(t0)); ctx.lineTo(px(t1), py(t1)); ctx.stroke();
  }
  // palmes
  const fronds = 9;
  for (let f = 0; f < fronds; f += 1) {
    const ang = -Math.PI + (f / (fronds - 1)) * Math.PI + (r() - 0.5) * 0.25;
    const len = height * (0.32 + r() * 0.12);
    const ex = topX + Math.cos(ang) * len;
    const ey = topY + Math.sin(ang) * len * 0.35 + len * 0.42;
    const cx = topX + Math.cos(ang) * len * 0.55;
    const cy = topY - len * 0.18;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
    // folioles
    ctx.lineWidth = 1.6;
    for (let k = 0.15; k < 1; k += 0.07) {
      const qx = (1 - k) * (1 - k) * topX + 2 * (1 - k) * k * cx + k * k * ex;
      const qy = (1 - k) * (1 - k) * topY + 2 * (1 - k) * k * cy + k * k * ey;
      const l = 22 * (1 - k * 0.7);
      ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx - 4, qy + l); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx + 5, qy + l * 0.9); ctx.stroke();
    }
  }
  ctx.beginPath(); ctx.arc(topX, topY, 6, 0, Math.PI * 2); ctx.fill();
}

/* ---------- DUSK : heure dorée ---------- */

export function paintDuskBack(ctx, w, h, seed = 7) {
  const r = rng(seed);
  const horizon = h * 0.78;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#0E0820");
  sky.addColorStop(0.38, "#3A1A47");
  sky.addColorStop(0.62, "#A63E66");
  sky.addColorStop(0.82, "#F07E5C");
  sky.addColorStop(1, "#FFC48A");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // soleil bas et halo
  const sx = w * 0.7;
  const sy = horizon - h * 0.02;
  let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.75);
  g.addColorStop(0, "rgba(255,214,150,0.75)");
  g.addColorStop(0.2, "rgba(255,150,100,0.32)");
  g.addColorStop(1, "rgba(255,120,120,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  g = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.09);
  g.addColorStop(0, "rgba(255,246,222,1)");
  g.addColorStop(0.7, "rgba(255,226,170,0.9)");
  g.addColorStop(1, "rgba(255,200,140,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, h * 0.09, 0, Math.PI * 2); ctx.fill();

  // nuages étirés
  for (let i = 0; i < 9; i += 1) {
    const y = h * (0.12 + r() * 0.45);
    const x = r() * w;
    const cw = w * (0.2 + r() * 0.4);
    const grad = ctx.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0);
    grad.addColorStop(0, "rgba(255,170,150,0)");
    grad.addColorStop(0.5, `rgba(255,${150 + r() * 60},${140 + r() * 40},${0.08 + r() * 0.12})`);
    grad.addColorStop(1, "rgba(255,170,150,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - cw / 2, y, cw, 2 + r() * 6);
  }

  // lointain (brumeux), puis plan moyen (fenêtres allumées)
  skyline(ctx, w, horizon + 4, { r, minH: h * 0.05, maxH: h * 0.24, fill: "rgba(122,52,92,0.55)", bw: [14, 44] });
  const haze = ctx.createLinearGradient(0, horizon - h * 0.2, 0, horizon + 10);
  haze.addColorStop(0, "rgba(255,170,120,0)");
  haze.addColorStop(1, "rgba(255,170,120,0.35)");
  ctx.fillStyle = haze; ctx.fillRect(0, horizon - h * 0.2, w, h * 0.2 + 10);
  skyline(ctx, w, horizon + 10, { r, minH: h * 0.04, maxH: h * 0.32, fill: "#2B1230", bw: [20, 60], windows: 0.12 });
  ctx.fillStyle = "#1A0B1E";
  ctx.fillRect(0, horizon + 8, w, h);
}

export function paintDuskFront(ctx, w, h, seed = 11) {
  const r = rng(seed);
  const ground = h;
  // silhouettes proches : hautes sur les bords, basses au centre (cadrage)
  let x = -20;
  ctx.fillStyle = "#0B0610";
  while (x < w + 20) {
    const width = 30 + r() * 70;
    const edge = Math.abs((x + width / 2) / w - 0.5) * 2;
    const height = h * (0.04 + Math.pow(edge, 2.2) * 0.5 + r() * 0.05);
    ctx.fillRect(x, ground - height, width, height);
    if (r() < 0.3) ctx.fillRect(x + width * 0.3, ground - height - 10, width * 0.4, 10);
    x += width;
  }
  // palmiers
  palm(ctx, w * 0.04, ground, h * 0.62, w * 0.03, "#0B0610", r);
  palm(ctx, w * 0.12, ground, h * 0.44, -w * 0.02, "#0B0610", r);
  palm(ctx, w * 0.95, ground, h * 0.7, -w * 0.035, "#0B0610", r);
  palm(ctx, w * 0.86, ground, h * 0.4, w * 0.015, "#0B0610", r);
  // route
  ctx.fillStyle = "#08050B";
  ctx.fillRect(0, h * 0.94, w, h * 0.06);
}

/* ---------- NEON : rue de nuit, pluie, reflets ---------- */

export function paintNeon(ctx, w, h, seed = 3) {
  const r = rng(seed);
  ctx.fillStyle = "#05060C";
  ctx.fillRect(0, 0, w, h);
  const vx = w * (0.42 + r() * 0.16);
  const vy = h * 0.5;

  // brume au point de fuite
  let g = ctx.createRadialGradient(vx, vy, 0, vx, vy, w * 0.6);
  g.addColorStop(0, "rgba(80,120,255,0.35)");
  g.addColorStop(0.4, "rgba(120,40,160,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // murs (perspective)
  const wall = (side) => {
    const x0 = side < 0 ? 0 : w;
    const x1 = side < 0 ? vx - w * 0.07 : vx + w * 0.07;
    ctx.fillStyle = "#090A14";
    ctx.beginPath();
    ctx.moveTo(x0, 0); ctx.lineTo(x1, vy - h * 0.18); ctx.lineTo(x1, vy + h * 0.04); ctx.lineTo(x0, h * 0.78); ctx.closePath();
    ctx.fill();
  };
  wall(-1); wall(1);

  // enseignes néon (verticales et horizontales) + reflets au sol
  const colors = ["#2BE4FF", "#FF3CD6", "#FFB36B", "#7C5CFF", "#2BE4FF"];
  const signs = [];
  for (let i = 0; i < 16; i += 1) {
    const side = i % 2 ? 1 : -1;
    const t = 0.15 + r() * 0.75;                     // distance au point de fuite
    const x = side < 0 ? vx - (vx) * t : vx + (w - vx) * t;
    const y = vy - h * 0.35 * t - r() * h * 0.08;
    const vertical = r() < 0.6;
    const sw = (vertical ? 6 : 40) * t * 3;
    const sh = (vertical ? 60 : 8) * t * 3;
    signs.push({ x: x - sw / 2, y, sw, sh, c: colors[Math.floor(r() * colors.length)] });
  }
  ctx.save();
  for (const s of signs) {
    ctx.shadowColor = s.c; ctx.shadowBlur = 24;
    ctx.fillStyle = s.c;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(s.x, s.y, s.sw, s.sh);
  }
  ctx.restore();

  // sol mouillé : reflets étirés
  const floorY = h * 0.6;
  ctx.fillStyle = "#04050A";
  ctx.beginPath(); ctx.moveTo(0, h * 0.78); ctx.lineTo(vx - w * 0.07, vy + h * 0.04); ctx.lineTo(vx + w * 0.07, vy + h * 0.04); ctx.lineTo(w, h * 0.78); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.globalAlpha = 0.28;
  for (const s of signs) {
    const ry = floorY + (floorY - s.y) * 0.35;
    const grad = ctx.createLinearGradient(0, ry, 0, ry + s.sh * 2.2 + 40);
    grad.addColorStop(0, s.c); grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(s.x, ry, Math.max(2, s.sw), s.sh * 2.2 + 40);
  }
  ctx.restore();

  // lignes du sol vers le point de fuite
  ctx.strokeStyle = "rgba(43,228,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = -10; i <= 10; i += 1) {
    ctx.beginPath(); ctx.moveTo(vx, vy + h * 0.04); ctx.lineTo(vx + i * w * 0.12, h); ctx.stroke();
  }
  // vignettage
  g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

/* ---------- MONOLITH : pyramide inversée, lumière rouge ---------- */

export function paintMonolith(ctx, w, h, seed = 5) {
  const r = rng(seed);
  ctx.fillStyle = "#0C0A0B";
  ctx.fillRect(0, 0, w, h);

  // plafond : grille
  ctx.strokeStyle = "rgba(242,238,229,0.05)";
  for (let x = 0; x < w; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h * 0.3); ctx.stroke(); }

  // lumière rouge au sol
  let g = ctx.createRadialGradient(w / 2, h * 1.05, 0, w / 2, h * 1.05, h * 0.9);
  g.addColorStop(0, "rgba(232,38,46,0.75)");
  g.addColorStop(0.45, "rgba(150,20,30,0.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // piliers
  const pillars = 6;
  for (let i = 0; i < pillars; i += 1) {
    const side = i < pillars / 2 ? -1 : 1;
    const k = (i % (pillars / 2)) / (pillars / 2);
    const pw = w * (0.06 - k * 0.015);
    const x = side < 0 ? w * (0.04 + k * 0.14) : w * (0.96 - k * 0.14) - pw;
    const top = h * (0.38 + k * 0.08);
    const pg = ctx.createLinearGradient(x, 0, x + pw, 0);
    pg.addColorStop(0, "#1C1A1C"); pg.addColorStop(1, "#0F0E0F");
    ctx.fillStyle = pg;
    ctx.fillRect(x, top, pw, h - top);
    ctx.fillStyle = "rgba(232,38,46,0.35)";
    ctx.fillRect(side < 0 ? x + pw - 2 : x, top, 2, h - top);
  }

  // pyramide inversée
  const apexY = h * (0.5 + r() * 0.06);
  const pg = ctx.createLinearGradient(0, 0, 0, apexY);
  pg.addColorStop(0, "#232327");
  pg.addColorStop(1, "#0B0B0D");
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.moveTo(w * 0.22, -2); ctx.lineTo(w * 0.78, -2); ctx.lineTo(w * 0.5, apexY); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath(); ctx.moveTo(w * 0.22, -2); ctx.lineTo(w * 0.5, -2); ctx.lineTo(w * 0.5, apexY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(232,38,46,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w * 0.22, 0); ctx.lineTo(w * 0.5, apexY); ctx.lineTo(w * 0.78, 0); ctx.stroke();

  // sol
  ctx.strokeStyle = "rgba(232,38,46,0.18)";
  for (let i = 0; i < 9; i += 1) {
    const y = h * 0.82 + i * i * 2.4;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

/* ---------- IVORY : brume et courbes de niveau (données topographiques) ---------- */

export function paintIvory(ctx, w, h, seed = 9, { strong = false } = {}) {
  const r = rng(seed);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#F6F3EC");
  bg.addColorStop(1, "#E9E3D6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const centers = Array.from({ length: 3 }, () => ({ x: w * (0.15 + r() * 0.7), y: h * (0.2 + r() * 0.65), k: 0.6 + r() * 0.8 }));
  ctx.lineWidth = 1;
  for (const c of centers) {
    const rings = 22;
    for (let i = 1; i <= rings; i += 1) {
      const base = i * Math.min(w, h) * 0.022 * c.k;
      ctx.strokeStyle = `rgba(20,20,24,${(strong ? 0.13 : 0.08) * (1 - i / (rings + 4))})`;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
        const wob = Math.sin(a * 3 + i * 0.4 + c.k * 5) * i * 1.6 + Math.cos(a * 5 - i * 0.2) * i * 0.8;
        const rad = base + wob;
        const x = c.x + Math.cos(a) * rad * 1.35;
        const y = c.y + Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // repère
    ctx.strokeStyle = "rgba(20,20,24,0.35)";
    ctx.beginPath(); ctx.moveTo(c.x - 6, c.y); ctx.lineTo(c.x + 6, c.y); ctx.moveTo(c.x, c.y - 6); ctx.lineTo(c.x, c.y + 6); ctx.stroke();
  }
  // horizon fin
  ctx.strokeStyle = "rgba(20,20,24,0.12)";
  ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.stroke();
}

export const PAINTERS = {
  dusk: (ctx, w, h, seed) => { paintDuskBack(ctx, w, h, seed); paintDuskFront(ctx, w, h, seed + 4); },
  neon: paintNeon,
  monolith: paintMonolith,
  ivory: (ctx, w, h, seed) => paintIvory(ctx, w, h, seed, { strong: true }),
};

/* ---------- Canvas statique redessiné au redimensionnement ---------- */

export class StaticScene {
  constructor(canvas, painter, seed = 1) {
    this.canvas = canvas;
    this.painter = painter;
    this.seed = seed;
    this.ro = new ResizeObserver(() => this.draw());
    this.ro.observe(canvas);
  }
  draw() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    const ctx = this.canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.painter(ctx, rect.width, rect.height, this.seed);
  }
  destroy() { this.ro.disconnect(); }
}

/* ---------- Calques animés : trafic (dusk) et pluie (neon) ---------- */

export class LiveLayer {
  constructor(canvas, kind) {
    this.canvas = canvas;
    this.kind = kind;
    this.ctx = canvas.getContext("2d");
    this.visible = false;
    this.raf = 0;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.loop(); });
    this.io.observe(canvas);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width) return;
    this.w = rect.width; this.h = rect.height;
    this.canvas.width = Math.round(this.w); this.canvas.height = Math.round(this.h);
    const r = rng(42);
    if (this.kind === "traffic") {
      this.items = Array.from({ length: 34 }, () => ({
        x: r() * this.w, lane: r() < 0.5 ? 0 : 1, v: 1.2 + r() * 2.4,
      }));
    } else {
      this.items = Array.from({ length: Math.round(this.w / 6) }, () => ({ x: r() * this.w, y: r() * this.h, v: 9 + r() * 9, l: 10 + r() * 22 }));
    }
    if (reduced) this.frame(); else this.loop();
  }
  frame() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    if (this.kind === "traffic") {
      const y0 = h * 0.955;
      for (const c of this.items) {
        const dir = c.lane ? -1 : 1;
        const y = y0 + c.lane * h * 0.022;
        const grad = ctx.createLinearGradient(c.x - dir * 70, 0, c.x, 0);
        const col = c.lane ? "255,70,70" : "255,236,200";
        grad.addColorStop(0, `rgba(${col},0)`);
        grad.addColorStop(1, `rgba(${col},0.9)`);
        ctx.fillStyle = grad;
        ctx.fillRect(Math.min(c.x, c.x - dir * 70), y, 70, 2);
        if (!reduced) { c.x += dir * c.v; if (c.x > w + 80) c.x = -80; if (c.x < -80) c.x = w + 80; }
      }
    } else {
      ctx.strokeStyle = "rgba(170,210,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of this.items) {
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.18, d.y + d.l);
        if (!reduced) { d.y += d.v; d.x -= d.v * 0.18; if (d.y > h) { d.y = -d.l; d.x = Math.random() * (w + 60); } }
      }
      ctx.stroke();
    }
  }
  loop() {
    if (this.raf || reduced || !this.visible || !this.w) return;
    const tick = () => { this.raf = 0; if (!this.visible) return; this.frame(); this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  }
  destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); }
}
