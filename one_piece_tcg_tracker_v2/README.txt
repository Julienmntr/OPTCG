# One Piece TCG Tracker — V2

Version mobile-first basée sur l'UI V1.

## Fonctionnalités
- Navigation fixe en bas : Accueil / Decklists / Rapports / Stats
- Création et stockage local de plusieurs decklists
- Import texte `4xOP17-045`
- Création d'un tournoi : date → deck → nombre de rounds
- Saisie de chaque ronde : leader adverse, Dé gagné/perdu, 1er/2e, victoire/défaite, commentaire
- Navigation arrière/avant entre les rondes
- Rapports historiques
- Statistiques cumulées par deck
- Matchups cumulés : somme de toutes les rondes de tous les rapports joués avec le même deck
- PWA manifest inclus

## Lancer
Ouvre `index.html` dans un navigateur ou utilise Live Server dans VS Code.

## Données
Les données sont enregistrées dans le `localStorage` du navigateur.
