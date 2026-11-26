/* ==========================================================================
   FLOW — fond animé du hero : des centaines de flux lumineux qui suivent
   un champ de courants, comme des phares de voitures en pose longue ou des
   données en mouvement. Aucune image nécessaire.
   ========================================================================== */

import { reduced } from "./motion.js";

export class FlowField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.raf = 0;
    this.visible = true;
    this.t = 0;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) this.loop();
    });
    this.io.observe(canvas);
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(r.width);
    this.canvas.height = Math.round(r.height);
    this.ctx.fillStyle = "#171717";
    this.ctx.fillRect(0, 0, this.w, this.h);
    const count = Math.round(Math.min(420, (this.w * this.h) / 3200));
    this.particles = Array.from({ length: count }, () => this.spawn(true));
    if (reduced) {
      for (let i = 0; i < 260; i += 1) this.step(true);
    } else {
      this.loop();
    }
  }

  spawn(anywhere = false) {
    return {
      x: anywhere ? Math.random() * this.w : -10,
      y: Math.random() * this.h,
      life: 200 + Math.random() * 400,
      lime: Math.random() < 0.13,
      speed: 0.6 + Math.random() * 1.4,
    };
  }

  /* Direction du courant en un point : somme de sinusoïdes (lisse, sans bibliothèque) */
  angle(x, y) {
    const s = 0.0016;
    const t = this.t * 0.00025;
    return Math.sin(x * s + t) * 0.9 + Math.cos(y * s * 1.7 - t * 1.3) * 0.7 + Math.sin((x + y) * s * 0.6 + t * 0.7) * 0.5;
  }

  step(noFade = false) {
    const ctx = this.ctx;
    if (!noFade) {
      ctx.fillStyle = "rgba(23,23,23,0.035)";
      ctx.fillRect(0, 0, this.w, this.h);
    }
    ctx.lineWidth = 1;
    for (const p of this.particles) {
      const a = this.angle(p.x, p.y);
      const nx = p.x + Math.cos(a) * p.speed + 0.55;
      const ny = p.y + Math.sin(a) * p.speed * 0.7;
      ctx.strokeStyle = p.lime ? "rgba(215,255,70,0.55)" : "rgba(247,247,244,0.13)";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      p.x = nx;
      p.y = ny;
      p.life -= 1;
      if (p.life <= 0 || p.x > this.w + 10 || p.y < -10 || p.y > this.h + 10) Object.assign(p, this.spawn());
    }
    this.t += 16;
  }

  loop() {
    if (this.raf || reduced || !this.visible || !this.w) return;
    const tick = () => {
      this.raf = 0;
      if (!this.visible) return;
      this.step();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro.disconnect();
    this.io.disconnect();
  }
}
