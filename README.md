# Pool Pilot Site

Thème Grav du site officiel **pool-pilot.app**.

## Structure

Le dépôt est directement un thème Grav. Il doit être cloné dans :

```bash
/opt/grav/user/themes/poolpilot
```

## Installation sur le serveur

```bash
cd /opt/grav/user/themes
git clone https://github.com/amery74/pool-pilot-site.git poolpilot
chown -R www-data:www-data poolpilot
cd /opt/grav
php bin/grav clear-cache
```

Dans Grav Admin :

1. Configuration → Système → Pages.
2. Choisir `poolpilot` comme thème par défaut.
3. Ouvrir la page d'accueil.
4. Sélectionner le template `home`.
5. Enregistrer puis vider le cache.

## Mise à jour

```bash
cd /opt/grav/user/themes/poolpilot
git pull
cd /opt/grav
php bin/grav clear-cache
```

## Important

Le fichier `images/logo-pool-pilot.svg` est provisoire. Il devra être remplacé par le logo officiel fourni en haute résolution.
