# Gestion de la Roadmap GitHub

La page `/roadmap` lit les dépôts suivants :

- `amery74/ha-poolpilot`
- `amery74/pool-pilot-dashboard`

## Labels recommandés

- `roadmap: disponible`
- `roadmap: en cours`
- `roadmap: prévu`
- `roadmap: à l'étude`

Les issues fermées sont automatiquement affichées dans **Disponible**.

## Milestones

Ajoutez un milestone comme `v1.2.4`, `v1.3.0` ou `Plus tard`.
Le nom du milestone apparaît sur la carte de l’issue.

## Cache

Le cache est conservé dans :

```text
/opt/grav/user/data/poolpilot-roadmap-cache.json
```

Durée par défaut : 6 heures.

Pour forcer une actualisation :

```bash
rm -f /opt/grav/user/data/poolpilot-roadmap-cache.json
cd /opt/grav
php bin/grav clearcache
```

## Token facultatif

Les dépôts publics fonctionnent sans token. Pour augmenter la limite de l’API,
définissez la variable d’environnement `GITHUB_TOKEN` pour PHP-FPM ou renseignez
le champ `roadmap.token` dans `poolpilot.yaml`.

Ne publiez jamais un token dans GitHub.
