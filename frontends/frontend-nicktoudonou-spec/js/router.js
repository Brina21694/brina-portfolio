/* ==========================================================================
   ROUTER — lit l'adresse après le # et affiche la bonne page.

   #/ , #/city         → DATA WORLD (mode Explore, 3D)
   #/lab, #/archive, #/journey → DATA WORLD, voyage vers ce lieu
   #/quick             → Accès rapide : le portfolio classique
   #/work, #/about ... → Accès rapide, défile jusqu'à la section
   #/projet/<slug>     → étude de cas d'un projet
   #/admin             → ajout de données (page cachée)
   ========================================================================== */

import { renderHome, scrollToSection, SECTIONS } from "./pages/home.js";
import { renderProjet } from "./pages/projet.js";
import { renderAdmin } from "./pages/admin.js";
import { renderWorld } from "./world/index.js";
import { wipe, resetReveal } from "./motion.js";

const WORLD_ZONES = ["city", "lab", "archive", "journey"];

let current = null;
let dispose = () => {};
let worldCtl = null;
let chrome = null;

function parse() {
  const [a, b] = location.hash.replace(/^#\/?/, "").split("/");
  if (a === "projet" && b) return { view: "projet", slug: decodeURIComponent(b) };
  if (a === "admin") return { view: "admin" };
  if (!a || WORLD_ZONES.includes(a)) return { view: "world", zone: a || "city" };
  if (a === "quick") return { view: "home", section: null };
  return { view: "home", section: SECTIONS.includes(a) ? a : null };
}

async function go() {
  const route = parse();
  const app = document.getElementById("app");

  // Déjà dans le monde : la caméra voyage, pas de rechargement.
  if (current?.view === "world" && route.view === "world") {
    worldCtl?.go(route.zone);
    current = route;
    return;
  }

  // Déjà sur l'accueil : on défile simplement, sans transition.
  if (current?.view === "home" && route.view === "home") {
    scrollToSection(route.section);
    current = route;
    return;
  }

  const render = () => {
    dispose();
    resetReveal();
    window.scrollTo(0, 0);
    worldCtl = null;
    if (route.view === "world") {
      worldCtl = renderWorld(app, route.zone);
      dispose = worldCtl.dispose;
    } else if (route.view === "projet") dispose = renderProjet(app, route.slug);
    else if (route.view === "admin") dispose = renderAdmin(app);
    else {
      dispose = renderHome(app);
      if (route.section) requestAnimationFrame(() => scrollToSection(route.section, true));
    }
    app.focus({ preventScroll: true });
    chrome?.refresh();
  };

  if (current === null) render();
  else await wipe(render);
  current = route;
}

export function initRouter(chromeApi) {
  chrome = chromeApi;
  addEventListener("hashchange", go);

  // Clic sur un lien vers la section déjà dans l'adresse : on défile quand même.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute("href") === location.hash && current?.view === "home") {
      e.preventDefault();
      scrollToSection(parse().section);
    }
  });

  go();
}
