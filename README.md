# Pool Pilot — thème Grav v0.1.0

Version minimale et stable du thème Pool Pilot.

## Installation

Le contenu du dépôt doit être installé dans :

```text
/opt/grav/user/themes/poolpilot
```

Dans Grav Admin :

1. Configuration → Système → Pages.
2. Choisir `Pool Pilot` comme thème par défaut.
3. Ouvrir la page d’accueil.
4. Onglet Avancé.
5. Choisir le modèle `home`.
6. Enregistrer.
7. Vider le cache Grav.

## Mise à jour depuis GitHub

```bash
cd /opt/grav/user/themes/poolpilot
git pull
cd /opt/grav
php bin/grav clear-cache
```


## v0.4.3 — Statistiques Umami

- Ajout du script de mesure d’audience Umami sur toutes les pages du site.
- Endpoint public utilisé : `https://analytics.pool-pilot.app/script.js`.
- Website ID : `7c61b0c7-a165-4f87-a93b-5cc2996a461d`.
- Mise à jour de la page Confidentialité pour documenter la mesure d’audience auto-hébergée et sans cookie.
- Replays et Heatmaps restent désactivés.

## v0.4.2 — Mentions légales et confidentialité

- Ajout des pages `/mentions-legales` et `/confidentialite`.
- Ajout des liens légaux et de `contact@pool-pilot.app` dans le footer.
- Correction des liens Accueil, FAQ et Documentation afin qu'ils fonctionnent depuis toutes les pages.
- Aucun bandeau de consentement n'est affiché tant qu'aucun traceur soumis au consentement n'est intégré au site.

> Note conformité : la page de mentions légales décrit actuellement le site comme un projet open source édité à titre non professionnel et auto-hébergé. L'éditeur doit vérifier que les informations d'identification affichées correspondent à sa situation juridique avant mise en production.
