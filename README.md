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
