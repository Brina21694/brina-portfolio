/* ==========================================================================
   02 — ABOUT (route 1 : profil)
   Respiration ivoire après les scènes sombres : beaucoup d'espace,
   des courbes de niveau en fond, une typographie plus calme.
   ========================================================================== */

import { CONFIG } from "../config.js";
import { esc, serifify, month, pad, stateBlock, guardImages } from "../dom.js";
import { loadProfil } from "../data.js";
import { paintIvory, StaticScene } from "../scenes.js";
import { reveal } from "../motion.js";

export function template() {
  const interets = CONFIG.interets
    .map((x, i) => `<li><span class="mono">${pad(i + 1)}</span>${esc(x)}</li>`).join("");
  return `
  <section class="about on-ivory" id="about" data-section="02" data-label="About" data-accent="#D9541E">
    <canvas class="about__topo" aria-hidden="true"></canvas>
    <div class="container">
      <header class="sec-head">
        <span class="sec-head__label mono">02 — About</span>
        <h2 class="sec-head__title display" data-reveal>Data as a <em class="serif">territory</em></h2>
      </header>

      <div class="grid about__grid">
        <figure class="about__side" data-reveal style="margin:0">
          <div class="about__frame" data-has-photo>
            <span class="about__monogram js-mono" aria-hidden="true">CA</span>
            <img class="photo" data-optional src="${esc(CONFIG.images.portrait)}" alt="Portrait de Cédric Akle" loading="lazy" decoding="async">
          </div>
          <figcaption class="about__caption mono"><span class="js-about-name">Cédric Akle</span><span>${esc(CONFIG.ville)}</span></figcaption>
        </figure>

        <div class="about__body">
          <p class="about__lead" data-reveal>${serifify(CONFIG.manifeste)}</p>
          <div class="about__cols">
            <div class="about__block" data-reveal>
              <h3 class="mono">Profil</h3>
              <div class="about__bio js-bio"><span class="skeleton" style="display:block;height:96px"></span></div>
            </div>
            <div class="about__block" data-reveal style="--d:120ms">
              <h3 class="mono">Centres d'intérêt</h3>
              <ul class="about__interests">${interets}</ul>
            </div>
          </div>
          <div class="about__block" data-reveal>
            <h3 class="mono">Formation</h3>
            <ul class="edu js-edu"></ul>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

export function mount(root) {
  const section = root.querySelector("#about");
  let alive = true;
  const topo = new StaticScene(section.querySelector(".about__topo"), paintIvory, 9);
  guardImages(section);

  loadProfil().then((p) => {
    if (!alive) return;
    const name = [p.prenom, p.nom].filter(Boolean).join(" ");
    if (name) section.querySelector(".js-about-name").textContent = name;
    section.querySelector(".js-mono").textContent = `${(p.prenom ?? "C")[0]}${(p.nom ?? "A")[0]}`.toUpperCase();
    section.querySelector(".js-bio").textContent = p.bio || p.titre || "";

    const edu = section.querySelector(".js-edu");
    const formations = [...(p.formations ?? [])].sort((a, b) => String(b.debut).localeCompare(String(a.debut)));
    edu.innerHTML = formations.length
      ? formations.map((f) => `
        <li data-reveal>
          <span class="mono">${month(f.debut)} — ${month(f.fin)}</span>
          <div><strong>${esc(f.diplome)}</strong><span>${esc([f.ecole, f.lieu].filter(Boolean).join(" · "))}</span></div>
        </li>`).join("")
      : `<li><span class="mono">—</span><span class="muted">Aucune formation renseignée.</span></li>`;
    reveal(edu);
  }).catch((error) => {
    if (alive) section.querySelector(".js-bio").innerHTML = stateBlock(error, { hint: "Lance « just seed » pour remplir ta base." });
  });

  return () => { alive = false; topo.destroy(); };
}
