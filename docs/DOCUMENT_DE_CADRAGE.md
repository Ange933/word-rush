# Document de Cadrage — Word Rush

Module : Développement d'application front/back — M2 Dev fullstack, Ynov Connect
Dépôt GitHub : https://github.com/Ange933/word-rush

---

## 1. Brief Projet

### 1.1 Présentation générale

- **Nom du projet :** Word Rush
- **Description courte :** Word Rush est un jeu de mots multijoueur en ligne, inspiré du Scrabble et de Wordle. Les joueurs disposent de 90 secondes pour former le plus de mots valides possible à partir de 10 lettres communes tirées aléatoirement. Plus un mot est long, plus il rapporte de points. Le jeu se joue en solo (contre la montre) ou en multijoueur temps réel (2 à 8 joueurs).
- **Problème résolu :** Proposer un jeu de lettres rapide, social et rejouable, sans installation, jouable au clavier en quelques secondes — un format "casual gaming" inspiré des jeux de mots quotidiens (NYT Wordle/Spelling Bee) mais avec une dimension compétitive multijoueur temps réel absente de ces références.
- **Public cible :** Joueurs occasionnels amateurs de jeux de mots/lettres, en solo pour s'entraîner ou entre amis/collègues en multijoueur pour une session courte et compétitive.

### 1.2 Arborescence

```
Word Rush
├── /login                        (Connexion)
├── /register                     (Inscription)
├── /forgot-password               (Mot de passe oublié)
├── /reset-password                (Réinitialisation du mot de passe)
├── /                              (Accueil — choix du mode de jeu)
│   ├── Solo
│   └── Multijoueur
├── /game?mode=solo                (Partie solo)
│   ├── Lobby (démarrage auto 3s)
│   ├── Compte à rebours
│   ├── Partie (90s)
│   └── Résultats
├── /game?mode=multi               (Partie multijoueur)
│   ├── Lobby (attente joueurs, hôte lance la partie)
│   ├── Compte à rebours
│   ├── Partie (90s, scores en direct)
│   └── Résultats (classement final)
└── /leaderboard                   (Classement général — Top 20 + position perso)
```

### 1.3 Wireframes

Voir [`docs/mockups.md`](mockups.md) pour les wireframes des écrans principaux (connexion, inscription, accueil, lobby multijoueur, écran de jeu, résultats, classement, mot de passe oublié).

> Note : la palette de couleurs proposée dans les wireframes initiaux (thème sombre violet) a évolué en cours de projet vers un design minimaliste blanc/noir (inspiration NYT Wordle/Spelling Bee) dans la version livrée. La structure des écrans et le flux de navigation restent conformes aux wireframes.

### 1.4 Liste des fonctionnalités

| Priorité | Fonctionnalité | Description courte | Rôle concerné |
|----------|----------------|--------------------|---------------|
| 🔴 Must have | Inscription / Connexion | Créer un compte et se connecter (JWT) | Tous |
| 🔴 Must have | Mode Solo | Jouer seul contre la montre (90s, 10 lettres) | Joueur connecté |
| 🔴 Must have | Mode Multijoueur | Affronter 2 à 8 joueurs en temps réel via WebSocket | Joueur connecté |
| 🔴 Must have | Validation des mots côté serveur | Vérification anti-triche (lettres disponibles + dictionnaire) | Serveur |
| 🔴 Must have | Classement général | Top 20 des joueurs par meilleur score | Tous |
| 🟡 Should have | Réinitialisation de mot de passe | Récupération de compte via lien à usage unique | Joueur non connecté |
| 🟡 Should have | Rate limiting | Anti-spam sur les soumissions de mots et les routes d'authentification | Serveur |
| 🟢 Nice to have | Fonctionnalité IA (suggestions/analyse) | Non implémentée dans la version actuelle (voir section 4) | — |
| 🟢 Nice to have | Reconnexion à chaud (30s de grâce) | Reprise de partie après coupure réseau — non implémentée | Joueur |

---

## 2. Modélisation de la base de données

### 2.1 MCD — Modèle Conceptuel de Données

```
┌───────────────────────────┐
│       USER_ACCOUNT        │
├───────────────────────────┤
│ id_user            (id)   │
│ username                  │
│ email                     │
│ password_hash             │
│ best_score                │
│ total_games                │
│ total_wins                │
│ created_at                │
└───────────┬───────────────┘
            │
            │ 1,N
            │
     ┌──────┴───────┐        N,N        ┌───────────────────────┐
     │   PARTICIPE   ├───────────────────┤      ACHIEVEMENT       │
     │ (score, rank) │   DÉBLOQUE        ├───────────────────────┤
     └──────┬────────┘   (unlocked_at)   │ id_achievement   (id) │
            │ N,1                        │ name                  │
            │                            │ description           │
┌───────────┴───────────────┐            └───────────────────────┘
│           GAME             │
├────────────────────────────┤
│ id_game             (id)   │
│ letters                     │
│ start_time                  │
│ end_time                    │
│ status                      │
└───────────┬────────────────┘
            │ 1,N
            │
     ┌──────┴────────┐        N,1
     │   CONTIENT     ├────────────────────┐
     └──────┬─────────┘                    │
            │ 1,N                          │
┌───────────┴───────────────┐   ┌──────────┴─────────────┐
│           WORD              │   │      USER_ACCOUNT       │
├──────────────────────────────┤   │   (SOUMET, 1,N)          │
│ id_word              (id)   │   └──────────────────────────┘
│ word                        │
│ points                      │
│ is_valid                    │
│ submitted_at                │
└──────────────────────────────┘

┌───────────────────────────┐
│        DICTIONARY          │   (entité indépendante — dictionnaire
├───────────────────────────┤    local FR de fallback, pas de relation
│ word              (id)    │    avec les autres entités)
│ length                     │
│ language                   │
└───────────────────────────┘
```

Cardinalités :
- Un joueur (`USER_ACCOUNT`) **participe** à plusieurs parties (`GAME`, 1,N), une partie a plusieurs participants (N,N globalement) → association porteuse **PARTICIPE** avec les attributs `score` et `rank` (table de liaison `game_participation`).
- Une partie **contient** plusieurs mots soumis (1,N) ; un mot est **soumis** par un seul joueur (N,1) dans une seule partie → `WORD` dépend de `GAME` et `USER_ACCOUNT`.
- Un joueur **débloque** plusieurs succès, un succès peut être débloqué par plusieurs joueurs → association **DÉBLOQUE** (N,N) avec l'attribut `unlocked_at` (table de liaison `user_achievement`).

### 2.2 MLD — Modèle Logique de Données

```
user_account (id_user, username, email, password_hash, best_score, total_games, total_wins, created_at)

game (id_game, letters, start_time, end_time, status)

game_participation (#id_user, #id_game, score, rank)
    PK (id_user, id_game)

word (id_word, #id_user, #id_game, word, points, is_valid, submitted_at)

achievement (id_achievement, name, description)

user_achievement (#id_user, #id_achievement, unlocked_at)
    PK (id_user, id_achievement)

dictionary (word, length, language)
```

(Clés primaires en tête de chaque table, clés étrangères préfixées par `#`.)

### 2.3 MPD — Modèle Physique de Données

Script SQL complet, exécutable, disponible dans [`docs/database/word_rush_mld.sql`](database/word_rush_mld.sql). Il définit les 7 tables ci-dessus, les contraintes de clés étrangères (`ON DELETE CASCADE`), les index critiques (`idx_game_status`, `idx_participation_user`, `idx_participation_game`, `idx_dictionary_word`) et les données de référence pour la table `achievement`.

> Validé par exécution réelle sur un conteneur PostgreSQL 16 jetable (création des 7 tables + 4 index + seed complet sans erreur).

---

## 3. Définition de la Stack Technique

### 3.1 Frontend

| Élément | Choix | Justification |
|---------|-------|---------------|
| Framework / Bibliothèque | React 18 | Écosystème mature, composants réutilisables adaptés aux multiples écrans de jeu (lobby/countdown/playing/résultats), bonne intégration avec Socket.io côté client. |
| Build tool | Vite | Démarrage et rechargement à chaud quasi instantanés, essentiel pour itérer rapidement sur les interactions temps réel du jeu. |
| Langage | JavaScript | Cohérence avec le backend (même langage des deux côtés), pas de complexité de typage supplémentaire jugée nécessaire pour la taille du projet. |
| UI / CSS | Tailwind CSS | Permet d'implémenter rapidement un design minimaliste cohérent (thème blanc/noir) sans fichiers CSS séparés à maintenir. |
| Routage | React Router | Standard de facto pour une SPA multi-écrans (login, jeu, classement) avec routes protégées selon l'état d'authentification. |
| Communication temps réel | Socket.io-client | Nécessaire pour synchroniser lettres, timer et scores entre joueurs en multijoueur ; gère nativement la reconnexion et le fallback de transport. |

### 3.2 Backend

| Élément | Choix | Justification |
|---------|-------|---------------|
| Runtime / Framework | Node.js + Express | Léger, bien adapté à une API REST simple (auth, classement) combinée à un serveur WebSocket sur le même process. |
| Langage | JavaScript | Un seul langage sur toute la stack, réduit la charge cognitive pour un projet individuel avec délai contraint. |
| Temps réel | Socket.io (serveur) | Gère les rooms (parties), la diffusion ciblée des événements (scores, fin de partie) et l'authentification à la connexion via middleware. |
| Authentification | JWT (jsonwebtoken) | Stateless, adapté à une API REST + WebSocket sans session serveur partagée ; le token embarque l'identité vérifiée à chaque connexion socket. |
| Hachage mots de passe | bcrypt (bcryptjs) | Standard de l'industrie pour le stockage de mots de passe, résistant au brute-force par son coût de calcul réglable. |
| Requêtes SQL | `pg` (driver natif, requêtes paramétrées) | Pas d'ORM : le schéma est simple (7 tables), les requêtes sont peu nombreuses et un accès direct/paramétré suffit à garantir la sécurité (anti-injection) sans couche d'abstraction supplémentaire. |

### 3.3 Base de données

| Élément | Choix | Justification |
|---------|-------|---------------|
| SGBD | PostgreSQL 16 | Robuste, gratuit, gère bien les contraintes relationnelles (clés étrangères, `CHECK`) nécessaires au modèle (parties, participations, succès). |
| Hébergement | Local via Docker | Aucun déploiement exigé par le cahier des charges du module ; Docker garantit un environnement reproductible pour l'exécution locale et la correction. |

### 3.4 Outils & infrastructure

| Élément | Choix |
|---------|-------|
| Versioning | Git + GitHub (dépôt public) |
| Déploiement | Aucun (non exigé par le module — exécution locale uniquement) |
| Gestion de projet | Suivi via les activités Moodle du module et l'historique de commits Git |

---

## 4. Fonctionnalité IA

**Statut : non implémentée dans la version actuelle du projet.**

Aucune fonctionnalité faisant appel à l'IA n'a été intégrée à Word Rush à ce stade. Ce choix a été fait consciemment en fin de projet, faute de temps disponible avant l'échéance de rendu, plutôt que de livrer une intégration superficielle ou un mock non fonctionnel.

Piste envisagée mais non réalisée (documentée pour référence) : un assistant post-partie suggérant, via un appel à une API d'IA générative (OpenAI ou Anthropic), des mots supplémentaires que le joueur aurait pu former avec ses lettres et n'a pas trouvés — affiché sur l'écran de résultats. Cette fonctionnalité est documentée comme piste d'amélioration dans [`docs/RAPPORT_ANALYSE_CRITIQUE.md`](RAPPORT_ANALYSE_CRITIQUE.md).
