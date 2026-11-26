/* ==========================================================================
   00 — HERO : une ville à l'heure dorée, en plusieurs plans.

   Ordre des calques (du fond vers l'avant) :
   1. ciel, soleil, skyline lointaine (canvas, ou ta photo assets/hero.jpg)
   2. TON graphe Neo4j, en constellation dans le ciel
   3. silhouettes proches, palmiers, trafic animé
   4. le titre, puis l'interface (dossier, boutons)
   Chaque calque bouge un peu avec la souris et le scroll (parallaxe).
   ========================================================================== */

import { CONFIG } from "../config.js";
import { esc, button, guardImages } from "../dom.js";
import { loadProfil, loadProjets, loadGraph } from "../data.js";
import { GraphView, grapheDeSecours } from "../graph.js";
import { StaticScene, LiveLayer, paintDuskBack, paintDuskFront } from "../scenes.js";
import { reduced, countUp } from "../motion.js";

export function template() {
  const year = new Date().getFullYear();
  return `
  <section class="hero grain" id="intro" data-section="00" data-label="Intro" data-accent="#FFB36B">
    <div class="hero__layer hero__back" data-depth="0.25" aria-hidden="true" data-has-photo>
      <canvas class="js-back"></canvas>
      <img class="photo" data-optional src="${esc(CONFIG.images.hero)}" alt="" decoding="async" fetchpriority="high">
    </div>
    <div class="hero__layer hero__stars hero__sky" data-depth="0.5">
      <canvas class="js-sky" role="img" aria-label="Constellation : mon graphe de compétences (candidat, projets, compétences, domaines), chargé depuis Neo4j."></canvas>
    </div>
    <div class="hero__shade" aria-hidden="true"></div>
    <div class="hero__layer hero__front" data-depth="1.1" aria-hidden="true">
      <canvas class="js-front"></canvas>
      <canvas class="js-traffic"></canvas>
    </div>

    <div class="hero__layer hero__type" data-depth="0.8">
      <h1 class="hero__title display split" aria-label="I turn complex data into clarity.">
        <span class="line" aria-hidden="true"><span style="--i:0">I turn complex</span></span>
        <span class="line" aria-hidden="true"><span style="--i:1">data into</span></span>
        <span class="line" aria-hidden="true"><span style="--i:2"><em class="serif">clarity.</em></span></span>
      </h1>
    </div>

    <div class="hero__ui">
      <div class="hero__meta mono reveal-late">
        <span>Portfolio ${year} — N° 01</span>
        <span>49.44° N · 1.10° E</span>
        <span>${esc(CONFIG.ville)} · Golden hour</span>
      </div>

      <p class="hero__sub reveal-late">
        <strong class="js-hero-who">Cédric Akle</strong>, élève-ingénieur Big Data.
        Je transforme des données brutes en décisions lisibles.
      </p>

      <aside class="hero__dossier hud reveal-late" aria-label="Fiche">
        <h2 class="mono"><span>Dossier</span><span>CA-01</span></h2>
        <div class="hud__row"><span class="mono">Rôle</span><span class="mono js-role">Data Analyst</span></div>
        <div class="hud__row"><span class="mono">Statut</span><span class="mono">${esc(CONFIG.disponibilite ?? "—")}</span></div>
        <div class="hud__row"><span class="mono">Projets</span><span class="mono js-n-projets">—</span></div>
        <div class="hud__row"><span class="mono">Compétences</span><span class="mono js-n-competences">—</span></div>
        <div class="hud__row"><span class="mono">Graphe</span><span class="mono js-n-graph">Neo4j</span></div>
      </aside>

      <div class="hero__actions reveal-late">
        ${button("Explorer les projets", "#/work")}
        ${button("Me contacter", "#/contact", { variant: "ghost" })}
      </div>

      <div class="hero__foot mono reveal-late">
        <span>Explore · Discover · Understand</span>
        <span class="scroll-cue">Scroll <i aria-hidden="true"></i></span>
      </div>
    </div>
  </section>`;
}

/* Parallaxe : souris (lissée) + scroll. On écrit la propriété CSS `translate`,
   qui s'ajoute aux animations d'entrée faites avec `transform`. */
function parallax(hero) {
  if (reduced) return () => {};
  const layers = [...hero.querySelectorAll("[data-depth]")].map((el) => ({ el, d: Number(el.dataset.depth) }));
  let mx = 0, my = 0, tx = 0, ty = 0, raf = 0, visible = true;

  const frame = () => {
    raf = 0;
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    const sy = Math.min(scrollY, innerHeight);
    for (const { el, d } of layers) {
      el.style.translate = `${(-mx * 18 * d).toFixed(2)}px ${(-my * 12 * d + sy * (0.5 - d * 0.35)).toFixed(2)}px`;
    }
    if (visible && (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001)) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  const onMove = (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; kick(); };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
  io.observe(hero);
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("scroll", kick, { passive: true });
  return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", onMove); removeEventListener("scroll", kick); };
}

export function mount(root) {
  const hero = root.querySelector("#intro");
  let alive = true;
  let view = null;

  const back = new StaticScene(hero.querySelector(".js-back"), paintDuskBack, 7);
  const front = new StaticScene(hero.querySelector(".js-front"), paintDuskFront, 11);
  const traffic = new LiveLayer(hero.querySelector(".js-traffic"), "traffic");
  const stopParallax = parallax(hero);

  guardImages(hero);
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-ready")));

  const set = (key, value) => {
    const el = hero.querySelector(`.js-n-${key}`);
    if (el && alive) countUp(el, value);
  };

  loadProfil().then((p) => {
    if (!alive) return;
    const who = [p.prenom, p.nom].filter(Boolean).join(" ");
    if (who) hero.querySelector(".js-hero-who").textContent = who;
    if (p.titre) hero.querySelector(".js-role").textContent = p.titre.split(/\s[—–-]\s|,/)[0].trim();
    set("competences", (p.competences ?? []).length);
  }).catch(() => {});

  loadProjets().then((list) => set("projets", list.length)).catch(() => {});

  const graphLabel = hero.querySelector(".js-n-graph");
  loadGraph()
    .then((g) => {
      if (g.nodes.length < 4) throw new Error("graphe trop petit");
      graphLabel.textContent = `${g.nodes.length} nœuds · ${g.links.length} liens`;
      return g;
    })
    .catch(async () => {
      graphLabel.textContent = "Profil MongoDB";
      return grapheDeSecours(await loadProfil().catch(() => null));
    })
    .then((g) => {
      if (!alive) return;
      view = new GraphView(hero.querySelector(".js-sky"), g, {
        mode: "hero",
        palette: { accent: "255,214,160", base: "255,240,228" },
      });
    });

  return () => {
    alive = false;
    view?.destroy(); back.destroy(); front.destroy(); traffic.destroy(); stopParallax();
  };
}
