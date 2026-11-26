/* ==========================================================================
   DOM — petites fonctions utilitaires partagées par toutes les sections.
   ========================================================================== */

import { CONFIG } from "./config.js";

/* Protège l'affichage : un texte venant de la base ne devient jamais du HTML. */
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

/* N'autorise que les liens http(s), mailto et les chemins relatifs. */
export function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/* *mot* -> <em class="serif">mot</em> (après échappement) */
export function serifify(text) {
  return esc(text).replace(/\*(.+?)\*/g, '<em class="serif">$1</em>');
}

export const pad = (n) => String(n).padStart(2, "0");

/* "2025-09" -> "2025.09" ; null -> "Aujourd'hui" */
export function month(value) {
  if (!value) return "Aujourd'hui";
  const [y, m] = String(value).split("-");
  return m ? `${y}.${m}` : y;
}

export function domaineLabel(slug) {
  if (!slug) return "Autres";
  if (CONFIG.domaines[slug]) return CONFIG.domaines[slug];
  const words = String(slug).replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* Bloc d'état réutilisable : chargement vide ou erreur, avec un indice utile. */
export function stateBlock(error, { empty = false, hint = "" } = {}) {
  if (empty) {
    return `<div class="state"><span class="mono">Aucune donnée</span><p>${esc(hint || "Rien à afficher pour le moment.")}</p></div>`;
  }
  const status = error?.status ? `ERR ${error.status}` : "ERR";
  const path = error?.path ? ` · ${esc(error.path)}` : "";
  return `<div class="state" role="status">
    <span class="mono">${status}${path}</span>
    <p>${esc(error?.message || "Erreur inconnue")}</p>
    ${hint ? `<p class="muted">${esc(hint)}</p>` : ""}
  </div>`;
}

/* Icône flèche (SVG inline, hérite de la couleur du texte) */
export const ARROW = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>`;
export const ARROW_UP = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" stroke="currentColor" stroke-width="1.5"/></svg>`;

/* Retire une image qui ne se charge pas (le fond CSS prend le relais). */
export function guardImages(root) {
  root.querySelectorAll("img[data-optional]").forEach((img) => {
    const drop = () => {
      img.closest("[data-has-photo]")?.removeAttribute("data-has-photo");
      img.remove();
    };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener("error", drop, { once: true });
  });
}

/* Bouton biseauté : libellé + case flèche. variant = "" | "ghost" | "ink" | "small" (cumulables) */
export function button(label, href, { variant = "", icon = ARROW, attrs = "" } = {}) {
  const cls = ["btn", ...variant.split(" ").filter(Boolean).map((v) => `btn--${v}`)].join(" ");
  const tag = href ? "a" : "button";
  const target = href ? `href="${esc(href)}"` : 'type="button"';
  return `<${tag} class="${cls}" ${target} ${attrs}><span class="btn__label">${esc(label)}</span><span class="btn__icon">${icon}</span></${tag}>`;
}
