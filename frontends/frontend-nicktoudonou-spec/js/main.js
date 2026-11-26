/* Point d'entrée : on installe l'en-tête, puis le routeur affiche la page. */

import { initChrome } from "./chrome.js";
import { initRouter } from "./router.js";

initRouter(initChrome());
