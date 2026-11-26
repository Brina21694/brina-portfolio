/* ==========================================================================
   CONFIG — tout ce que tu peux personnaliser sans toucher au reste du code.
   ========================================================================== */

export const CONFIG = {
  /* Adresse de ton API (just dev) */
  apiUrl: location.hostname === "localhost" ? "http://localhost:8000" : "https://backend-lemon-five-v5x2aac1el.vercel.app",

  /* Ton identifiant : ajouté automatiquement à chaque appel (?candidat_slug=...) */
  candidatSlug: "cedric-akle",

  /* Indicateur de disponibilité (en-tête et hero). Mets null pour le cacher. */
  disponibilite: "Ouvert aux opportunités",

  /* Ville affichée dans le hero */
  ville: "Rouen, FR",

  /* CV téléchargeable : dépose ton PDF dans assets/ avec ce nom. null pour cacher. */
  cvUrl: "assets/cv-cedric-akle.pdf",

  /* Images : dépose-les dans assets/. Si un fichier manque, le site affiche
     un visuel de remplacement dessiné en CSS (rien ne casse). */
  images: {
    hero: "assets/hero.jpg",         // grande photo derrière le graphe (ville de nuit, architecture)
    portrait: "assets/portrait.jpg", // ton portrait (section About)
  },

  /* Phrase d'ouverture de la section About. *mot* = mot en italique serif. */
  manifeste: "J'aborde la donnée comme un territoire : on l'explore, on la structure, puis on la rend *lisible* pour ceux qui décident.",

  /* Centres d'intérêt (section About) */
  interets: [
    "Analyse de données",
    "Business Intelligence",
    "Data Visualization",
    "Machine Learning",
    "Transformation numérique",
  ],

  /* Noms lisibles des domaines (slug -> libellé). Les domaines absents
     sont affichés automatiquement à partir du slug. */
  domaines: {
    "bases-de-donnees": "Bases de données",
    "langages": "Langages",
    "backend": "Backend",
    "outils": "Outils",
    "data-analysis": "Data Analysis",
    "data-engineering": "Data Engineering",
    "data-visualization": "Data Visualization",
    "machine-learning": "Machine Learning",
  },
};
