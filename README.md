# Pool Pilot Website

Thème Grav du site officiel Pool Pilot.

## Installation dans Grav

Le dépôt doit être cloné dans :

```text
/opt/grav/user/themes/poolpilot
```

## Activation

Dans Grav Admin :

1. Configuration → Système → Pages.
2. Choisir **Pool Pilot** comme thème par défaut.
3. Ouvrir la page d'accueil.
4. Onglet **Avancé**.
5. Choisir le modèle **home**.
6. Enregistrer.
7. Vider le cache Grav.

## Mise à jour du serveur

```bash
cd /opt/grav/user/themes/poolpilot
git pull
cd /opt/grav
php bin/grav clear-cache
```
