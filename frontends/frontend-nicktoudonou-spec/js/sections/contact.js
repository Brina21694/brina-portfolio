/* ==========================================================================
   06 — CONTACT + pied de page
   Rouge, plaques noires inclinées : l'énergie d'un écran de fin de partie.
   ========================================================================== */

import { CONFIG } from "../config.js";
import { esc, safeUrl, ARROW_UP } from "../dom.js";
import { loadProfil } from "../data.js";
import { reveal } from "../motion.js";

export function template() {
  const year = new Date().getFullYear();
  return `
  <section class="contact" id="contact" data-section="06" data-label="Contact" data-accent="#F2EEE5">
    <div class="contact__slab" aria-hidden="true"></div>
    <div class="container">
      <span class="sec-head__label contact__label mono">06 — Contact</span>
      <h2 class="contact__title display" data-reveal>Let's turn ideas<br>into <em class="serif">impact.</em></h2>
      <div class="contact__grid">
        <p class="contact__lead" data-reveal>
          Une alternance, un projet, une question sur la donnée ? Écrivez-moi, je réponds rapidement.
        </p>
        <div class="plates js-links" data-reveal style="--d:120ms"></div>
      </div>
    </div>
    <footer class="footer mono">
      <div class="container">
        <span>© ${year} <strong class="js-foot-name">Cédric Akle</strong></span>
        <span>Explore · Discover · Understand</span>
        <span>FastAPI · MongoDB · Neo4j</span>
        <a href="#/quick">Haut de page ↑</a>
      </div>
    </footer>
  </section>`;
}

function line(label, value, href, download = false) {
  const url = safeUrl(href);
  if (!url) return "";
  const external = url.startsWith("http") && !url.startsWith(location.origin);
  return `<a class="plate" href="${esc(url)}"${external ? ' target="_blank" rel="noopener"' : ""}${download ? " download" : ""}>
    <span class="mono">${esc(label)}</span><strong>${esc(value)}</strong>${ARROW_UP}
  </a>`;
}

export function mount(root) {
  const box = root.querySelector(".js-links");
  let alive = true;

  const render = (p = {}) => {
    const liens = p.liens ?? {};
    const pretty = (u) => String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    box.innerHTML = [
      p.email ? line("Email", p.email, `mailto:${p.email}`) : "",
      liens.linkedin ? line("LinkedIn", pretty(liens.linkedin), liens.linkedin) : "",
      liens.github ? line("GitHub", pretty(liens.github), liens.github) : "",
      CONFIG.cvUrl ? line("CV", "Télécharger le PDF", CONFIG.cvUrl, true) : "",
    ].join("");
    reveal(box);
  };

  loadProfil().then((p) => {
    if (!alive) return;
    root.querySelector(".js-foot-name").textContent = [p.prenom, p.nom].filter(Boolean).join(" ");
    render(p);
  }).catch(() => { if (alive) render(); });

  return () => { alive = false; };
}
