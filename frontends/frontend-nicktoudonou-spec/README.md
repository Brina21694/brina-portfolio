# Frontend de @nicktoudonou-spec (Cédric AKLE)

**Site déployé :** https://cedric-akle-portfolio.vercel.app  
**API utilisée en ligne :** https://backend-lemon-five-v5x2aac1el.vercel.app

- **Deux modes** :
  - **Explore** (`#/`) : *Data World*, un monde 3D explorable (Three.js r170, servi en local dans `vendor/three/`). La caméra voyage entre 4 lieux : **The City** (identité), **The Lab** (compétences), **Data Archive** (projets), **The Journey** (parcours). Contact et CV restent accessibles partout.
  - **Accès rapide** (`#/quick`) : le portfolio classique, sections et études de cas.
- **Technologie** : HTML + CSS + JavaScript (modules ES, sans framework, rien à installer : Three.js est dans `vendor/`). Les décors (ville à l'heure dorée, rue néon, monolithe, champ ivoire) sont dessinés en code sur des `<canvas>` (`js/scenes.js`) : aucune image de jeu vidéo n'est utilisée. Le graphe Neo4j est dessiné par une petite simulation de forces écrite à la main (`js/graph.js`). Polices auto-hébergées dans `assets/fonts/` : Syne (titres), Manrope (texte), Instrument Serif et IBM Plex Mono (licence OFL).
- **Lancer** :
  1. Backend, à la racine du projet : `just dev` (API sur http://localhost:8000)
  2. Frontend, dans un 2e terminal :
     ```bash
     cd frontends/frontend-nicktoudonou-spec
     python -m http.server 5173
     ```
  3. Ouvrir http://localhost:5173 (page d'ajout de données : http://localhost:5173/#/admin)
- **Routes de `API_ROUTES.md` consommées** : 1 (profil), 2 et 3 (projets, détail), 4 (expériences par lieu), 5 (statistiques), 6 (projets similaires), 7 (graphe de compétences), 9 à 12 (page Admin).

## Organisation

```
index.html            squelette (en-tête, menu, rail, transition, zone #app)
css/tokens.css        couleurs des "mondes", polices, grille : l'identité en un seul endroit
css/base.css          reset, typo, grille, apparitions
css/components.css    boutons biseautés, puces, panneaux HUD, en-tête, rail, menu, transition
css/sections.css      une partie par section + responsive
js/scenes.js          décors cinématographiques dessinés en code + calques animés (trafic, pluie)
js/chrome.js          en-tête, menu, barre de progression, rail, couleur d'accent par section
js/world/scene.js     le monde 3D : ville, lab, archives, parcours, caméra, sélection des objets
js/world/textures.js  textes affichés dans la 3D (écrans, cubes, plaques), dessinés sur canvas
js/world/index.js     interface du monde : porte d'entrée, navigation, panneaux, clavier, mini-carte
css/world.css         styles du mode Explore
vendor/three/         Three.js (licence MIT) + post-traitement (bloom)
js/config.js          TOUT ce qui se personnalise (slug, textes, images, CV, URL de l'API locale ou en ligne)
js/api.js             le seul fichier qui parle au réseau
js/data.js            une fonction par route + mise en cache + calculs de secours
js/router.js          #/ , #/work ... , #/projet/<slug> , #/admin
js/graph.js           graphe animé (hero) et interactif (Map)
js/sections/*.js      hero, work, about, expertise, experience, map, contact
js/pages/*.js         accueil, étude de cas d'un projet, admin
assets/               images et CV (à ajouter)
```

## Robustesse

Chaque section charge ses propres données : si une route tombe, seule sa section affiche un message d'erreur clair. Si `/api/stats/competences` renvoie une liste vide, les statistiques sont recalculées à partir des projets. Si Neo4j ne répond pas, le hero affiche un graphe construit depuis le profil MongoDB.

## Ambiances

| Section | Monde | Couleur |
|---|---|---|
| 00 Hero | ville à l'heure dorée, graphe en constellation, parallaxe | ambre |
| 01 Work | un monde par projet (doré, néon, monolithe, ivoire), scènes empilées | celle du projet |
| 02 About | ivoire, courbes de niveau | orange brûlé |
| 03 Expertise | monolithe : colonnes = nombre réel de projets | rouge |
| 04 Experience | journal de bord néon | cyan / magenta |
| 05 Map | graphe Neo4j interactif | vert signal |
| 06 Contact | rouge, plaques inclinées | rouge / noir |

## Mettre de vraies photos

Dépose `assets/hero.jpg` (une ville au coucher du soleil, à toi ou libre de droits, ex. Unsplash) et `assets/portrait.jpg`. Pour un projet, renseigne le champ `image` dans son JSON. Si un fichier manque, le décor dessiné reste affiché.

## Data World : commandes

| Action | Souris / tactile | Clavier |
|---|---|---|
| Voyager vers un lieu | barre du bas, table-carte, clic sur un bâtiment | `1` à `4` |
| Ouvrir un objet | clic sur un écran, un cube, une plaque | liste « Dans cette zone » + `Entrée` |
| Regarder autour | glisser | — |
| Avancer dans le parcours | molette | flèches |
| Revenir | bouton ×, puis The City | `Échap` |
| Contact / CV | bouton Contact | `5` |

Sans WebGL, le site propose directement l'Accès rapide. Avec `prefers-reduced-motion`, les voyages deviennent des coupes franches et les animations ralentissent.

## Déploiement (Vercel)

Le site est statique : aucune compilation.

```bash
cd frontends/frontend-nicktoudonou-spec
vercel --prod
```

`js/config.js` choisit l'API tout seul : `http://localhost:8000` en local, l'API Vercel en ligne. L'adresse du site doit figurer dans la variable `CORS_ORIGINS` du backend sur Vercel.
