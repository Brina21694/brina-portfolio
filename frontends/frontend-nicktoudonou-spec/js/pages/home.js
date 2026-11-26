/* ==========================================================================
   ACCUEIL — assemble les sections. Chacune charge ses propres données :
   si une route de l'API tombe, seule sa section affiche une erreur.
   ========================================================================== */

import * as hero from "../sections/hero.js";
import * as work from "../sections/work.js";
import * as about from "../sections/about.js";
import * as expertise from "../sections/expertise.js";
import * as experience from "../sections/experience.js";
import * as map from "../sections/map.js";
import * as contact from "../sections/contact.js";
import { reveal, reduced } from "../motion.js";

const PARTS = [hero, work, about, expertise, experience, map, contact];

export const SECTIONS = ["intro", "work", "about", "expertise", "experience", "map", "contact"];

export function renderHome(app) {
  document.title = "Cédric Akle — Data Analyst";
  app.innerHTML = PARTS.map((part) => part.template()).join("");
  const disposers = PARTS.map((part) => part.mount(app)).filter(Boolean);
  reveal(app);
  return () => disposers.forEach((fn) => fn());
}

export function scrollToSection(id, instant = false) {
  if (!id || id === "intro") {
    window.scrollTo({ top: 0, behavior: reduced || instant ? "auto" : "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector(".site-header").offsetHeight;
  const top = el.getBoundingClientRect().top + window.scrollY - header + 1;
  window.scrollTo({ top, behavior: reduced || instant ? "auto" : "smooth" });
}
