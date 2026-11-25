# ✨ Clean Girl Portfolio — le portfolio interactif de @Bibou172

- **Technologie** : HTML5, Tailwind CSS, JavaScript (ES6+), Canvas 2D
- **Lancer** : ouvrir `index.html` via un serveur local (`npx serve .` ou Live Server) → <http://localhost:3000> (détails ci-dessous)
- **Routes de l'API consommées** : R1 à R8 d'[ARCHITECTURE.md](../../ARCHITECTURE.md) (tableau ci-dessous)

---

## 1. Présentation

Un portfolio interactif dans une esthétique **Clean Girl** : minimaliste, lumineuse, épurée et fluide, avec une palette douce (nude, blanc cassé, rose poudré, sauge), une typographie éditoriale soignée et une scène interactive en **Canvas 2D**.

L'application permet de naviguer instantanément entre les différentes rubriques du portfolio de **`bibou172`** (`accueil`, `parcours`, `projets`, `compétences`, `graphe`, `contact`), d'explorer une scène interactive animée en continu et de visualiser les relations entre compétences et projets.

Tous les éléments visuels, composants d'interface et animations Canvas sont conçus sur mesure pour offrir une expérience fluide aussi bien sur ordinateur que sur tablette et mobile.

### Sections et routes de l'API

| Section / Vue | Contenu | Route(s) de l'API |
|---|---|---|
| `accueil` | Vue d'accueil Clean Girl, présentation du profil, scène interactive et accès rapide | R1 `GET /api/profil` |
| `parcours` | Frise des expériences et formations, filtres par lieu (`loadDomain`) | R1 `GET /api/profil`, R8 `GET /api/experiences?lieu=` |
| `projets` | Cartes des projets (`projetbibou172.json`), détails et projets similaires | R2 `GET /api/projets?competence=`, R4 `GET /api/graph/projets/{slug}/similaires` |
| `competences` | Compétences clés, statistiques et filtrage par domaine | R3 `GET /api/stats/competences`, R6 `GET /api/competences/top?n=5`, R7 `GET /api/graph/domaines/{slug}/competences` |
| `graphe` | Visualisation interactive du graphe Neo4j (`btn-load-graph`) | R5 `GET /api/graph/competences` |
| `contact` | Profil complet, bio et liens de contact de `bibou172` | R1 `GET /api/profil` |

> **Mode résilient (Aperçu local)** : si le backend FastAPI n'est pas démarré ou ne répond pas, l'interface bascule automatiquement sur les données locales de démonstration (`bibou172.json` / `projetbibou172.json`) sans bloquer l'affichage, puis se synchronise dès que l'API redevient accessible.

## 2. Prérequis

| Outil | Version / Détail | Vérifier |
|---|---|---|
| Navigateur moderne | Chrome, Safari, Edge ou Firefox (support HTML5 / Canvas 2D) | — |
| Python + `uv` | Pour démarrer le backend FastAPI de l'équipe (`MongoDB` + `Neo4j`) | `python3 --version` |
| Node.js / npm *(optionnel)* | Utile pour lancer un serveur statique local rapide (`npx serve`) | `node -v` |

Pour afficher les **vraies données** issues des bases `MongoDB` et `Neo4j`, le backend de l'équipe doit tourner : voir le [README principal du dépôt](../../README.md). **Sans backend, le portfolio fonctionne quand même** en aperçu local.

## 3. Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd <dossier-du-depot>

# 2. Aller dans ce frontend
cd frontends/frontend-bibou172

# 3. Vérifier la présence des fichiers du frontend
ls -la