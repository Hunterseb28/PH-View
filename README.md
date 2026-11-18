# PH-View

**Site en ligne :** https://hunterseb28.github.io/PH-View/

PH-View est un projet indépendant de moteur de découverte multi-plateforme.

## État actuel

- Interface responsive pensée pour mobile.
- Sélecteur de source (Pornhub / xHamster / toutes).
- Recherche et filtres visuels pour vidéos et playlists.
- Écran de confirmation 18+.
- Aucun résultat fictif : les connecteurs de données seront ajoutés séparément.

## Développement sur iPhone

Ouvrir le dépôt sur GitHub puis remplacer `github.com` par `github.dev` dans l'adresse pour utiliser l'éditeur web gratuit. Il est aussi possible d'éditer directement les fichiers depuis le site GitHub.

## Publication gratuite

Le site peut être publié avec GitHub Pages si le dépôt est public et si les conditions du service sont respectées. Dans **Settings → Pages**, choisir **Deploy from a branch**, puis la branche `main` et le dossier `/(root)`.

## Architecture prévue

La première version est un frontend statique. Les recherches réelles multi-plateformes demanderont des connecteurs compatibles avec les conditions et autorisations des plateformes, idéalement via un backend séparé. Ne jamais placer de clé API privée dans le code frontend.

## Note

PH-View n'est affilié à aucune plateforme tierce, n'héberge pas de vidéos et doit être réservé aux adultes.
