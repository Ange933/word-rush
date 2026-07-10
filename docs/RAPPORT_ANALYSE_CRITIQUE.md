# Rapport d'analyse critique — Word Rush

Projet fil rouge M2 INFO — TP de consolidation (coordination front/back, sécurisation, optimisation)

---

## 1. Analyse critique

### 1.1 Points forts

| Domaine | Constat |
|---|---|
| Injection SQL | Toutes les requêtes sont paramétrées (`$1, $2, ...`), aucune concaténation de chaînes SQL détectée (`auth.js`, `leaderboard.js`, `roomManager.js`). |
| Mots de passe | Hachage bcrypt (coût 10), jamais stockés ni comparés en clair (`routes/auth.js`). |
| Anti-triche | `canFormWord()` revérifie côté serveur que chaque mot est composable avec les lettres tirées (`services/dictionaryService.js`) — le client n'est jamais source de vérité. |
| Timer | Le serveur calcule le temps écoulé à partir de son propre `startTime` et rejette les mots hors délai (`socketHandler.js`) — conforme à la règle « le serveur est la référence de temps absolue ». |
| Auth Socket.io | Middleware `io.use()` qui vérifie le JWT à la connexion et rejette les sockets non authentifiés. |
| Rate limiting jeu | 800 ms minimum entre deux soumissions de mots par joueur, empêchant le spam/bot flood. |
| Anti-énumération | `/forgot-password` renvoie toujours le même message générique que l'email existe ou non. |
| Frontend | Aucun usage de `dangerouslySetInnerHTML`/`innerHTML` — React échappe par défaut, pas de vecteur XSS identifié côté client. |
| UI | Thème minimaliste blanc/noir avec accents conforme à la direction artistique demandée (inspiration NYT). |
| Doc utilisateur | `docs/GUIDE_UTILISATION.md` et `docs/api/routes.http` sont complets, à jour et directement exploitables. |
| Historique Git | Commits atomiques et explicites, alignés sur les activités du module (wireframes, JWT, sécurité) — bonne preuve de progression pédagogique. |

### 1.2 Points faibles

| Sévérité | Constat | Détail |
|---|---|---|
| 🔴 Critique (corrigé dans ce TP) | Schéma SQL absent du dépôt | `docs/database/word_rush_mld.sql` était un **dossier vide**, jamais suivi par Git. `docker-compose.yml` monte ce chemin comme script d'init Postgres : sur un clone frais, la base ne contient aucune table et l'application ne peut pas démarrer. |
| 🔴 Critique (corrigé dans ce TP) | Secret JWT avec valeur par défaut faible | `JWT_SECRET \|\| 'dev_secret_change_in_prod'` : si la variable d'environnement n'est pas positionnée, n'importe qui connaissant cette chaîne (visible dans le code source public) peut forger des tokens valides. |
| 🟠 Élevée | JWT stocké en `localStorage` | Accessible à tout script JS injecté (XSS). Un cookie `httpOnly` serait plus robuste, mais impose de revoir l'auth Socket.io et la config CORS/cookies. Non traité dans ce TP (changement structurant, risque de régression sans tests de non-régression existants). |
| 🟠 Élevée | Le lien de reset mot de passe est renvoyé dans la réponse API | `POST /forgot-password` renvoie `resetUrl` dans le corps JSON, pas seulement en `console.log`. En l'absence d'envoi d'email réel (choix assumé pour la démo, documenté dans `GUIDE_UTILISATION.md`), cela permet à quiconque connaît un email existant de réinitialiser le mot de passe du compte associé, ce qui contredit la protection anti-énumération juste au-dessus dans le même fichier. Accepté comme limitation documentée du projet pédagogique ; à corriger avant toute mise en production réelle. |
| 🟡 Moyenne (corrigé dans ce TP) | Pas de rate-limit sur les routes REST d'authentification | `/login`, `/register`, `/forgot-password` étaient sans limite d'essais → brute-force possible. |
| 🟡 Moyenne (corrigé dans ce TP) | Pas de `try/catch` sur les events Socket.io asynchrones | Une exception dans `submit_word` (ex. erreur réseau vers l'API dictionnaire) pouvait potentiellement faire planter le process côté serveur. |
| 🟡 Moyenne | Pas de reconnexion à chaud (30 s de grâce) | Le cahier des charges du projet prévoit un maintien d'état 30 s après déconnexion pour permettre une reprise ; en pratique `removePlayer()` est appelé immédiatement sur `disconnect`, la partie du joueur est perdue instantanément en cas de coupure réseau. |
| 🟡 Moyenne | Cache dictionnaire minimal | Le `Map()` en mémoire (`apiCache`) ne cache que les résultats déjà interrogés via l'API externe, sans pré-chargement des mots courants comme prévu au cahier des charges. Il grossit aussi indéfiniment (pas d'éviction). |
| 🟢 Faible | Aucun test automatisé | 0 fichier de test avant ce TP, aucune dépendance de test installée (backend comme frontend). |
| 🟢 Faible | Pas de linter/formatteur | Aucun ESLint/Prettier configuré → pas de garde-fou de style/qualité en CI ou en pre-commit. |
| 🟢 Faible | Pas de CI/CD | Aucun `.github/workflows` — rien ne vérifie automatiquement qu'une PR ne casse pas le build/les tests. |

### 1.3 Parties à refactoriser

- **`server/src/socket/socketHandler.js`** (126 lignes dans une seule fonction `setupSocket`) : gagnerait à être découpé par événement (`handleJoin`, `handleSubmitWord`, `handleStartGame`...) dans des modules séparés, pour la lisibilité et la testabilité.
- **`client/src/pages/GamePage.jsx`** (286 lignes) : mélange les 4 phases de jeu (lobby / countdown / playing / ended) dans un seul composant avec du rendu conditionnel en cascade. Extraire un sous-composant par phase (`LobbyPhase`, `CountdownPhase`, `PlayingPhase`, `EndedPhase`) réduirait la complexité et faciliterait les tests unitaires de chaque écran.
- **Constantes éparpillées** : `RATE_LIMIT_MS` (socketHandler.js), `GAME_DURATION` (dictionaryService.js) gagneraient à être centralisées dans un fichier `config/constants.js` unique, partagé si besoin avec le frontend via une réponse API.

### 1.4 Apports du module pour le projet fil rouge

- **Sécurisation** : ajout de l'authentification JWT complète (inscription/connexion/`/me`), du hachage bcrypt, de la vérification systématique côté serveur, et — dans le cadre de ce TP — correction du secret par défaut, ajout du rate-limiting REST et de la gestion d'erreurs sur les sockets.
- **Coordination front/back** : mise en place du flux WebSocket temps réel (Socket.io) avec middleware d'authentification, séparation claire REST (auth, classement) / WebSocket (temps réel de jeu), cohérente avec l'architecture enseignée.
- **Documentation & process** : guide utilisateur, fichier de test de routes HTTP, wireframes (Activité 4) — traçabilité de la démarche produit avant l'implémentation.
- **Analyse critique elle-même** : le module a poussé à documenter formellement les écarts entre le cahier des charges du projet et l'implémentation réelle — exercice qui a permis de découvrir le bug bloquant du schéma SQL manquant, invisible en usage local classique (le volume Docker déjà initialisé masquait le problème).

---

## 2. Feuille de route post-module

### 2.1 Risques identifiés

| Risque | Type | Impact si non traité |
|---|---|---|
| Schéma SQL absent du repo | Technique | **Bloquant** : tout correcteur clonant le dépôt à froid ne peut pas lancer l'application. |
| Secret JWT par défaut | Sécurité | Falsification de tokens, usurpation de compte. |
| JWT en `localStorage` | Sécurité | Vol de session via XSS (aujourd'hui aucune XSS connue, mais pas de défense en profondeur). |
| Token de reset renvoyé en clair par l'API | Sécurité/Fonctionnel | Prise de compte via email connu ; incohérent avec la protection anti-énumération déjà en place. |
| Absence de tests | Qualité | Régressions non détectées lors de futures évolutions ; refactorisations risquées. |
| Pas de reconnexion à chaud | Fonctionnel | Mauvaise expérience utilisateur en multijoueur sur réseau instable (perte de partie sur simple coupure Wi-Fi). |
| Pas de CI | Process | Aucune vérification automatique avant merge ; dépend entièrement de la discipline manuelle. |

### 2.2 Plan d'action priorisé

| # | Action | Priorité | Statut |
|---|---|---|---|
| 1 | Recréer `docs/database/word_rush_mld.sql` avec le schéma complet et les index critiques | P0 | ✅ Fait dans ce TP |
| 2 | Supprimer le secret JWT par défaut (fail-fast si `JWT_SECRET` absent) | P0 | ✅ Fait dans ce TP |
| 3 | Rate-limiting sur `/login`, `/register`, `/forgot-password` | P1 | ✅ Fait dans ce TP |
| 4 | `try/catch` sur les handlers Socket.io asynchrones | P1 | ✅ Fait dans ce TP |
| 5 | Tests unitaires sur la logique de jeu pure (`normalize`, `calculatePoints`, `generateLetters`) | P1 | ✅ Fait dans ce TP (`node --test`, `npm test` côté serveur) |
| 6 | Ne plus renvoyer `resetUrl` dans la réponse API (garder uniquement le log serveur, ou gater par `NODE_ENV`) | P1 | À faire — nécessite de décider du comportement de démo souhaité |
| 7 | Migrer le JWT vers un cookie `httpOnly` + `sameSite` | P2 | À faire — impact sur l'auth Socket.io et la config CORS, à faire avec des tests de non-régression |
| 8 | Implémenter la reconnexion à chaud (30 s de grâce) | P2 | À faire |
| 9 | ESLint + Prettier + CI GitHub Actions (lint + test à chaque push) | P2 | À faire |
| 10 | Découper `socketHandler.js` et `GamePage.jsx` | P3 | À faire |
| 11 | Pré-charger un cache de mots courants au démarrage | P3 | À faire |

---

## 3. Mise en œuvre réalisée dans ce TP

- Recréation du schéma SQL PostgreSQL complet (`docs/database/word_rush_mld.sql`), reconstruit à partir de l'usage réel des colonnes dans le code (`auth.js`, `roomManager.js`, `leaderboard.js`, `scripts/seed.js`) et des index critiques décrits au cahier des charges du projet.
- Suppression du secret JWT par défaut, remplacé par une erreur de démarrage explicite si `JWT_SECRET` n'est pas défini (`server/src/middleware/auth.js`).
- Ajout d'un rate-limiter mémoire (`server/src/middleware/rateLimiter.js`, sans dépendance externe) sur les routes `/login`, `/register`, `/forgot-password`.
- Ajout de `try/catch` autour du handler `submit_word` (`server/src/socket/socketHandler.js`) pour éviter qu'une erreur inattendue ne remonte non gérée.
- Ajout de 3 tests unitaires (`server/src/services/dictionaryService.test.js`) et d'un script `npm test` (`node --test`, aucune dépendance ajoutée).

Les points restants (#6 à #11) sont documentés ci-dessus avec leur priorité, pour un traitement post-module.
