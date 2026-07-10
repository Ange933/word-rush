# Word Rush — Maquettes de l'interface (Wireframes)

Activité 4 — M2 INFO — Coordination Front & Back

> Ces maquettes représentent la structure des pages de l'application Word Rush.
> L'application est développée en React 18 + Tailwind CSS.
>
> **Note (Activité 5) :** la palette de couleurs ci-dessous (thème sombre violet) correspond à la
> proposition initiale de ces wireframes. Le thème a ensuite évolué vers un design minimaliste
> blanc/noir (inspiration NYT Wordle/Spelling Bee) — voir l'application réelle pour le rendu final.
> La structure des pages et le flux de navigation décrits ici restent valides.

---

## 1. Page de Connexion `/login`

```
┌─────────────────────────────────────────┐
│                                         │
│           🔤  WORD RUSH                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Email                          │    │
│  │  [________________________]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Mot de passe                   │    │
│  │  [________________________]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│         [   Se connecter   ]            │
│                                         │
│    Mot de passe oublié ?                │
│    Pas de compte ? S'inscrire           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. Page d'Inscription `/register`

```
┌─────────────────────────────────────────┐
│                                         │
│           🔤  WORD RUSH                 │
│         Créer un compte                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Nom d'utilisateur (3-20 car.)  │    │
│  │  [________________________]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Email                          │    │
│  │  [________________________]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Mot de passe (min. 6 car.)     │    │
│  │  [________________________]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│       [  Créer mon compte  ]            │
│                                         │
│    Déjà inscrit ? Se connecter          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 3. Page d'Accueil `/` (choix du mode)

```
┌──────────────────────────────────────────────────────┐
│  🔤 Word Rush          Bienvenue, alice!  [Déco]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│              Choisissez votre mode de jeu            │
│                                                      │
│   ┌────────────────────┐  ┌────────────────────┐    │
│   │                    │  │                    │    │
│   │       SOLO         │  │   MULTIJOUEUR      │    │
│   │                    │  │                    │    │
│   │  S'entraîner       │  │  2 à 8 joueurs     │    │
│   │  contre la montre  │  │  en temps réel     │    │
│   │                    │  │                    │    │
│   │   [ Jouer ]        │  │   [ Rejoindre ]    │    │
│   │                    │  │                    │    │
│   └────────────────────┘  └────────────────────┘    │
│                                                      │
│              [ 🏆 Classement général ]               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 4. Page de Jeu — Phase Lobby (multijoueur) `/game?mode=multi`

```
┌──────────────────────────────────────────────────────┐
│  🔤 Word Rush                           [Quitter]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│             Salle d'attente multijoueur              │
│                                                      │
│   Joueurs connectés (2/8) :                         │
│   ┌──────────────────────────────┐                  │
│   │  ✓ alice  (hôte)             │                  │
│   │  ✓ bob                       │                  │
│   └──────────────────────────────┘                  │
│                                                      │
│   En attente d'au moins 2 joueurs...                │
│                                                      │
│         [ 🚀 Lancer la partie ]   ← (hôte seul)    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 5. Page de Jeu — Phase de Jeu `/game`

```
┌──────────────────────────────────────────────────────┐
│  🔤 Word Rush                    ⏱  01:23            │
├──────────────────────────────────────────────────────┤
│                                                      │
│         Les 10 lettres du tour :                    │
│                                                      │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                   │
│   │ A │ │ E │ │ I │ │ R │ │ S │                   │
│   └───┘ └───┘ └───┘ └───┘ └───┘                   │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                   │
│   │ N │ │ T │ │ L │ │ O │ │ C │                   │
│   └───┘ └───┘ └───┘ └───┘ └───┘                   │
│                                                      │
│   Votre mot :                                       │
│   ┌──────────────────────────┐  [ OK ]             │
│   │  SOLEIL_                 │                     │
│   └──────────────────────────┘                      │
│                                                      │
│   ✅ SOLEIL    +25 pts   Score : 34 pts             │
│   ✅ TOIT       +9 pts                              │
│   ❌ XXXX      (lettres non disponibles)            │
│                                                      │
│   ┌── Scores en direct ──────┐                     │
│   │  1. alice      34 pts   │                     │
│   │  2. bob        12 pts   │                     │
│   └──────────────────────────┘                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 6. Page de Jeu — Écran de Résultats

```
┌──────────────────────────────────────────────────────┐
│  🔤 Word Rush                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│                 🏆 Fin de partie !                  │
│                                                      │
│   Classement final :                                │
│   ┌──────────────────────────────────────┐          │
│   │  🥇  alice      34 pts   5 mots     │          │
│   │  🥈  bob        12 pts   3 mots     │          │
│   └──────────────────────────────────────┘          │
│                                                      │
│   Vos mots validés : SOLEIL, TOIT, ROI, NET, CLAN  │
│                                                      │
│         [ 🔄 Rejouer ]    [ 🏠 Accueil ]           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 7. Page de Classement `/leaderboard`

```
┌──────────────────────────────────────────────────────┐
│  🔤 Word Rush                           [Déco]       │
├──────────────────────────────────────────────────────┤
│                                                      │
│              🏆 Classement général                   │
│                                                      │
│  Votre position : #2  —  Meilleur score : 34 pts    │
│                                                      │
│  ┌────┬──────────┬──────────────┬──────┬────────┐   │
│  │ #  │ Joueur   │ Meill. score │ Vict.│ Parties│   │
│  ├────┼──────────┼──────────────┼──────┼────────┤   │
│  │  1 │ charlie  │     210 pts  │   9  │   20   │   │
│  │  2 │ alice    │     156 pts  │   5  │   12   │   │
│  │  3 │ bob      │      89 pts  │   2  │    8   │   │
│  └────┴──────────┴──────────────┴──────┴────────┘   │
│                                                      │
│                    [ ← Retour ]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 8. Page Mot de Passe Oublié `/forgot-password`

```
┌─────────────────────────────────────────┐
│                                         │
│           🔤  WORD RUSH                 │
│       Réinitialiser le mot de passe     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Votre adresse email            │    │
│  │  [________________________]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│         [  Envoyer le lien  ]           │
│                                         │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                         │
│  ✅ Lien généré !                       │
│                                         │
│  [ Réinitialiser mon mot de passe → ]  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Flux de navigation

```
/login ──────────────────► / (Accueil)
  │                              │
  │                    ┌─────────┴──────────┐
  ▼                    ▼                    ▼
/register         /game?mode=solo     /game?mode=multi
                                            │
/forgot-password                       /leaderboard
  │
  ▼
/reset-password
```

---

## Palette de couleurs (Tailwind CSS)

| Élément          | Couleur              |
|------------------|----------------------|
| Fond principal   | `gray-900` (sombre)  |
| Titres / accents | `purple-500`         |
| Boutons primaires| `purple-600`         |
| Mots valides     | `green-400`          |
| Mots invalides   | `red-400`            |
| Timer < 30s      | `red-500` (clignotant)|
| Tuiles lettres   | `gray-700` / `purple-700` (sélectionné) |
