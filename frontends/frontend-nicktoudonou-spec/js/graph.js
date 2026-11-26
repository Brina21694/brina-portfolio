/* ==========================================================================
   GRAPH — dessin du graphe Neo4j sur un <canvas>, sans bibliothèque.

   Principe (simulation de forces, comme D3) :
   - chaque nœud repousse les autres (ils ne se chevauchent pas),
   - chaque lien agit comme un ressort (les nœuds liés restent proches),
   - une légère gravité ramène tout vers le centre.
   On répète ce calcul à chaque image jusqu'à ce que tout se stabilise.

   Deux modes :
   - "hero" : décoratif, les données "arrivent et se connectent" puis respirent ;
   - "map"  : interactif (survol, glisser, clic sur un projet).
   ========================================================================== */

import { reduced } from "./motion.js";
import { esc } from "./dom.js";

const RGB = { paper: "247,247,244", lime: "215,255,70" };

const STYLE = {
  candidat:   { r: 8,   shape: "square" },
  projet:     { r: 5.5, shape: "square" },
  competence: { r: 3,   shape: "circle" },
  domaine:    { r: 6,   shape: "ring" },
};

const REST = { A_REALISE: 120, UTILISE: 64, APPARTIENT_A: 56 };

export const TYPE_LABEL = {
  candidat: "Candidat", projet: "Projet", competence: "Compétence", domaine: "Domaine",
};

export class GraphView {
  constructor(canvas, data, { mode = "map", onSelect = null, tip = null, palette = {} } = {}) {
    /* couleurs "r,g,b" : accent (candidat, domaines, survol) et base (projets, compétences, liens) */
    this.pal = { accent: RGB.lime, base: RGB.paper, ...palette };
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = mode;
    this.onSelect = onSelect;
    this.tip = tip;
    this.hover = null;
    this.drag = null;
    this.visible = true;
    this.raf = 0;
    this.dirty = true;
    this.placed = false;
    this.linkIn = 0;
    this.alpha = 0;
    this.w = 0;
    this.h = 0;

    this.load(data);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.wake();
    });
    this.io.observe(canvas);

    if (mode === "map") this.bind();
    this.resize();
  }

  /* ---------- Données ---------- */

  load({ nodes, links }) {
    this.byId = new Map();
    this.nodes = nodes.map((n) => {
      const st = STYLE[n.type] ?? STYLE.competence;
      const node = { ...n, st, r: st.r, x: 0, y: 0, vx: 0, vy: 0, deg: 0, phase: Math.random() * Math.PI * 2 };
      this.byId.set(n.id, node);
      return node;
    });
    this.links = links
      .map((l) => ({ s: this.byId.get(l.source), t: this.byId.get(l.target), type: l.type, delay: Math.random() * 0.45 }))
      .filter((l) => l.s && l.t);
    this.adj = new Map(this.nodes.map((n) => [n, new Set()]));
    for (const l of this.links) {
      l.s.deg += 1; l.t.deg += 1;
      this.adj.get(l.s).add(l.t);
      this.adj.get(l.t).add(l.s);
    }
  }

  /* Position de départ : les nœuds arrivent de l'extérieur, le candidat au centre. */
  place() {
    const cx = this.w / 2;
    const cy = this.h / 2;
    const R = Math.max(this.w, this.h) * 0.62;
    this.nodes.forEach((n, i) => {
      const angle = (i / Math.max(1, this.nodes.length)) * Math.PI * 6 + Math.random();
      const radius = n.type === "candidat" ? 0 : R * (0.55 + Math.random() * 0.5);
      n.x = cx + Math.cos(angle) * radius;
      n.y = cy + Math.sin(angle) * radius;
      n.vx = 0; n.vy = 0;
    });
    this.placed = true;
    this.alpha = 1;
    this.born = performance.now();
    if (reduced) {
      for (let i = 0; i < 360; i += 1) this.tick();
      this.alpha = 0;
    }
  }

  /* Relance l'organisation (bouton "Réorganiser"). */
  reheat() {
    this.place();
    this.dirty = true;
    this.wake();
  }

  /* ---------- Taille du canvas (net sur écrans Retina) ---------- */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.scale = Math.max(0.55, Math.min(1.35, Math.min(this.w, this.h) / 620));
    if (!this.placed) this.place();
    else this.alpha = Math.max(this.alpha, 0.25);
    this.dirty = true;
    this.wake();
  }

  /* ---------- Simulation : une étape ---------- */

  tick() {
    const nodes = this.nodes;
    const a = this.alpha;
    const s = this.scale;
    const cx = this.w / 2;
    const cy = this.h / 2;
    const charge = (this.mode === "hero" ? 4200 : 4200) * s * s;

    // 1. Répulsion entre tous les nœuds
    for (let i = 0; i < nodes.length; i += 1) {
      const p = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const q = nodes[j];
        let dx = q.x - p.x;
        let dy = q.y - p.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
        if (d2 > 250000) continue;
        const d = Math.sqrt(d2);
        const f = (charge * a) / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        p.vx -= fx; p.vy -= fy;
        q.vx += fx; q.vy += fy;
      }
    }

    // 2. Liens = ressorts
    const restScale = s * (this.mode === "hero" ? 1.25 : 1);
    for (const l of this.links) {
      const dx = l.t.x - l.s.x;
      const dy = l.t.y - l.s.y;
      const d = Math.hypot(dx, dy) || 1;
      const rest = (REST[l.type] ?? 70) * restScale;
      const f = ((d - rest) / d) * 0.07 * a;
      const share = l.s.deg / (l.s.deg + l.t.deg);
      l.t.vx -= dx * f * share; l.t.vy -= dy * f * share;
      l.s.vx += dx * f * (1 - share); l.s.vy += dy * f * (1 - share);
    }

    // 3. Gravité vers le centre + bords souples, puis déplacement
    const margin = 28;
    for (const n of nodes) {
      // gravité plus faible sur l'axe le plus long : le graphe remplit le cadre
      const g = n.type === "candidat" ? 0.03 : 0.0035;
      const ratio = this.w / this.h;
      n.vx += (cx - n.x) * g * a * Math.min(1, 1 / ratio);
      n.vy += (cy - n.y) * g * a * Math.min(1, ratio);
      if (n.x < margin) n.vx += (margin - n.x) * 0.04;
      if (n.x > this.w - margin) n.vx -= (n.x - (this.w - margin)) * 0.04;
      if (n.y < margin) n.vy += (margin - n.y) * 0.04;
      if (n.y > this.h - margin) n.vy -= (n.y - (this.h - margin)) * 0.04;

      if (n === this.drag) { n.vx = 0; n.vy = 0; continue; }
      n.vx *= 0.78;
      n.vy *= 0.78;
      n.x += n.vx;
      n.y += n.vy;
    }

    this.alpha *= 0.982;
    if (this.alpha < 0.002) this.alpha = 0;
  }

  /* ---------- Boucle d'animation (s'arrête quand tout est calme) ---------- */

  wake() {
    if (this.raf || !this.visible || !this.w) return;
    const step = (now) => {
      this.raf = 0;
      if (!this.visible) return;
      const moving = this.alpha > 0 || this.drag;
      if (moving) this.tick();
      const breathing = this.mode === "hero" && !reduced;
      const growing = this.linkIn < 1;
      if (moving || breathing || growing || this.dirty) {
        this.draw(now);
        this.dirty = false;
      }
      if (moving || breathing || growing) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  /* ---------- Dessin ---------- */

  draw(now) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.linkIn = reduced ? 1 : Math.min(1, Math.max(0, (now - this.born - 250) / 1400));

    // légère respiration en mode hero
    const breathe = this.mode === "hero" && !reduced;
    for (const n of this.nodes) {
      n.dx = breathe ? n.x + Math.sin(now * 0.00035 + n.phase) * 2.4 : n.x;
      n.dy = breathe ? n.y + Math.cos(now * 0.0003 + n.phase) * 2.4 : n.y;
    }

    const H = this.hover;
    const near = H ? this.adj.get(H) : null;

    // Liens : ils "poussent" progressivement d'un nœud à l'autre
    ctx.lineWidth = 1;
    for (const l of this.links) {
      const grow = Math.min(1, Math.max(0, this.linkIn * 1.45 - l.delay));
      if (grow <= 0) continue;
      const lit = H && (l.s === H || l.t === H);
      const base = this.mode === "hero" ? 0.26 : 0.2;
      const alpha = lit ? 0.95 : H ? 0.05 : base;
      ctx.strokeStyle = `rgba(${lit ? this.pal.accent : this.pal.base},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(l.s.dx, l.s.dy);
      ctx.lineTo(l.s.dx + (l.t.dx - l.s.dx) * grow, l.s.dy + (l.t.dy - l.s.dy) * grow);
      ctx.stroke();
    }

    // Nœuds
    for (const n of this.nodes) {
      const dim = H && n !== H && !near.has(n);
      ctx.globalAlpha = dim ? 0.2 : 1;
      const r = n.r * (n === H ? 1.6 : 1) * (this.mode === "map" ? 1.1 : 1);
      if (n.st.shape === "square") {
        ctx.fillStyle = n.type === "candidat" ? `rgb(${this.pal.accent})` : `rgb(${this.pal.base})`;
        ctx.fillRect(n.dx - r, n.dy - r, r * 2, r * 2);
      } else if (n.st.shape === "ring") {
        ctx.strokeStyle = `rgb(${this.pal.accent})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.dx, n.dy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = n === H ? `rgb(${this.pal.accent})` : `rgba(${this.pal.base},0.85)`;
        ctx.beginPath();
        ctx.arc(n.dx, n.dy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Étiquettes
      const showLabel = this.mode === "map"
        ? true
        : n.type === "domaine" || n.type === "candidat";
      if (!showLabel || !n.label) continue;
      const isComp = n.type === "competence";
      const strong = n === H || (near && near.has(n));
      let alpha = isComp ? 0.5 : 0.78;
      if (this.mode === "hero") alpha = 0.6;
      if (strong) alpha = 1;
      ctx.font = `500 ${isComp ? 9.5 : 10.5}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.fillStyle = `rgba(${n === H ? this.pal.accent : this.pal.base},${alpha})`;
      const text = String(n.label).toUpperCase();
      const right = n.dx > this.w - 150;
      ctx.textAlign = right ? "right" : "left";
      ctx.fillText(text, n.dx + (right ? -(r + 7) : r + 7), n.dy + 3.5);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  /* ---------- Interactions (mode map) ---------- */

  bind() {
    const c = this.canvas;
    const point = (e) => {
      const rect = c.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };
    const find = (x, y) => {
      let best = null;
      let bestD = 18 * 18;
      for (const n of this.nodes) {
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d < bestD) { bestD = d; best = n; }
      }
      return best;
    };

    const onMove = (e) => {
      const [x, y] = point(e);
      if (this.drag) {
        this.drag.x = x; this.drag.y = y;
        this.alpha = Math.max(this.alpha, 0.2);
        this.showTip(null);
        this.wake();
        return;
      }
      const n = find(x, y);
      if (n !== this.hover) {
        this.hover = n;
        this.dirty = true;
        this.wake();
        c.style.cursor = n ? (n.type === "projet" ? "pointer" : "grab") : "default";
      }
      this.showTip(n, e.clientX, e.clientY);
    };
    const onDown = (e) => {
      const [x, y] = point(e);
      const n = find(x, y);
      if (!n) return;
      this.drag = n;
      this.downAt = [e.clientX, e.clientY];
      c.setPointerCapture(e.pointerId);
    };
    const onUp = (e) => {
      const n = this.drag;
      this.drag = null;
      if (n && this.downAt) {
        const moved = Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]);
        if (moved < 5 && n.type === "projet" && this.onSelect) this.onSelect(n);
      }
      this.downAt = null;
      this.dirty = true;
      this.wake();
    };
    const onLeave = () => {
      if (this.drag) return;
      this.hover = null;
      this.dirty = true;
      this.showTip(null);
      this.wake();
    };

    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointerup", onUp);
    c.addEventListener("pointercancel", onUp);
    c.addEventListener("pointerleave", onLeave);
    this.unbind = () => {
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerdown", onDown);
      c.removeEventListener("pointerup", onUp);
      c.removeEventListener("pointercancel", onUp);
      c.removeEventListener("pointerleave", onLeave);
    };
  }

  showTip(n, x = 0, y = 0) {
    const tip = this.tip;
    if (!tip) return;
    if (!n) { tip.classList.remove("is-on"); return; }
    const hint = n.type === "projet" ? " · clic pour ouvrir" : "";
    tip.innerHTML = `<span>${TYPE_LABEL[n.type] ?? n.type}</span><strong>${esc(n.label)}</strong><span>${n.deg} liaison${n.deg > 1 ? "s" : ""}${hint}</span>`;
    const tx = Math.min(x + 16, window.innerWidth - 280);
    tip.style.transform = `translate(${tx}px, ${y + 16}px)`;
    tip.classList.add("is-on");
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro.disconnect();
    this.io.disconnect();
    this.unbind?.();
    this.showTip(null);
  }
}

/* Graphe décoratif de secours pour le hero, si Neo4j ne répond pas :
   construit à partir du profil (MongoDB) ou, à défaut, généré. */
export function grapheDeSecours(profil) {
  const comps = profil?.competences ?? [];
  if (comps.length) {
    const me = { id: "candidat:me", type: "candidat", label: profil.prenom ?? "" };
    const domaines = [...new Set(comps.map((c) => c.domaine).filter(Boolean))];
    const nodes = [me,
      ...domaines.map((d) => ({ id: `domaine:${d}`, type: "domaine", label: d.replace(/-/g, " ") })),
      ...comps.map((c) => ({ id: `competence:${c.skill_slug}`, type: "competence", label: c.nom }))];
    const links = [
      ...comps.map((c) => ({ source: "candidat:me", target: `competence:${c.skill_slug}`, type: "UTILISE" })),
      ...comps.filter((c) => c.domaine).map((c) => ({ source: `competence:${c.skill_slug}`, target: `domaine:${c.domaine}`, type: "APPARTIENT_A" })),
    ];
    return { nodes, links };
  }
  const nodes = [{ id: "c", type: "candidat", label: "" }];
  const links = [];
  for (let i = 0; i < 5; i += 1) {
    nodes.push({ id: `d${i}`, type: "domaine", label: "" });
    for (let j = 0; j < 4; j += 1) {
      nodes.push({ id: `s${i}${j}`, type: "competence", label: "" });
      links.push({ source: `s${i}${j}`, target: `d${i}`, type: "APPARTIENT_A" });
      if (j % 2 === 0) links.push({ source: "c", target: `s${i}${j}`, type: "UTILISE" });
    }
  }
  return { nodes, links };
}
