# ✨ Clean Girl Portfolio — Frontend de `@bibou172`

* **Architecture** : HTML5, Tailwind CSS, JavaScript vanilla + interface mini-jeu Canvas 2D (Option 2 légère)
* **Lancer en local** : servir le dossier `frontends/frontend-bibou172` (ex. `npx serve .` ou extension Live Server) et démarrer l'API FastAPI sur le port `8000` (détails ci-dessous)
* **Déploiement** : Vercel (`Root Directory` : `frontends/frontend-bibou172`)
* **Sources de données** : API FastAPI (`MongoDB` + `Neo4j`) avec repli automatique en aperçu local si l'API est indisponible

---

## 1. Présentation

Un portfolio interactif à l'esthétique **Clean Girl** (minimaliste, lumineuse, soignée) mettant en valeur le profil, les projets, le parcours, les compétences et le graphe relationnel de **`bibou172`**, enrichi d'une interface interactive et d'un mini-jeu 2D sur `<canvas>`.

* **Navigation fluide** : accès rapide aux sections (`accueil`, `parcours`, `projets`, `compétences`, `graphe`, `contact`) et chargement des données (`loadAll`, `loadGraph`, `loadDomain`).
* **Mini-jeu / interaction Canvas 2D** : boucle d'animation continue (`updateGameLoop`) permettant d'explorer l'univers visuel de manière ludique.
* **Mode résilient** : si le backend FastAPI n'est pas démarré ou n'est pas encore joignable en HTTPS depuis Vercel, l'interface reste utilisable avec les données locales/intégrées et bascule automatiquement sur les données de l'API dès qu'elle répond.

---

## 2. Pages, sections et routes de l'API

| Section / Vue | Contenu | Route(s) / Endpoints API attendus |
| :--- | :--- | :--- |
| **Accueil (`accueil`)** | Présentation générale, accroche Clean Girl, aperçu du profil et lancement rapide | `GET /api/profil` |
| **Parcours** | Expériences, formations, filtres par lieu ou période | `GET /api/profil`, `GET /api/experiences` |
| **Projets** | Liste des projets (`projetbibou172.json`), détails et filtres par compétence/domaine | `GET /api/projets`, `GET /api/graph/projets/{slug}/similaires` |
| **Compétences** | Statistiques, compétences clés et domaines | `GET /api/stats/competences`, `GET /api/competences/top` |
| **Graphe** | Visualisation des relations et compétences (`Neo4j`) | `GET /api/graph/competences` |
| **Contact** | Coordonnées, liens et informations du candidat `bibou172` | `GET /api/profil` |

> **Note** : les routes exactes peuvent varier légèrement selon l'avancement du backend de l'équipe (`FastAPI` sur le port `8000`). Si une route renvoie `404` ou échoue, l'application conserve un affichage propre sans bloquer l'interface.

---

## 3. Prérequis

| Outil | Rôle | Vérifier |
| :--- | :--- | :--- |
| **Navigateur moderne** | Exécution HTML5, Tailwind CSS, JS et Canvas 2D | Chrome / Firefox / Edge / Safari |
| **Python / uv / FastAPI** | Backend API + bases `MongoDB` & `Neo4j` (pour les données live) | `python3 --version` / `uv --version` |
| **Node.js / npm** *(optionnel)* | Serveur statique local rapide (`npx serve`) | `node -v` |

---

## 4. Installation

1. **Cloner le dépôt** (ou se placer dans le workspace) :
   ```bash
   git clone <url-du-depot>
   cd <dossier-du-depot>
