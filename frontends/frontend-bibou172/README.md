# Frontend de @bibou172


- **Technologie** : HTML5, Tailwind CSS (CDN) & JavaScript Vanilla
- **Lancer** :
  ```bash
  cd frontends/frontend-bibou172
  python3 -m http.server 8080 --bind 0.0.0.0
- **Routes de `API_ROUTES.md` consommées** : 
     GET /api/health: vérification de l'état de l'API
     GET /api/profil: profil complet, liens, expériences, formations et compétences
     GET /api/experiences?lieu=: expériences filtrées par lieu dans l'ordre décroissant
     GET /api/prjets/{projet_slug}: détail complet d'un projet
     
