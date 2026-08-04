# Pack logo Pool Pilot

Fichiers inclus :

- `logo.svg` : fichier source principal fourni.
- `logo-light.svg` : version présentée sur fond clair.
- `logo-dark.svg` : version présentée sur fond sombre.
- `logo-horizontal.svg` : déclinaison horizontale pour l’en-tête du site.
- `logo-icon.svg` et `logo-square.svg` : versions carrées.
- `favicon.svg`, `favicon.ico`, `favicon-16.png`, `favicon-32.png`.
- `apple-touch-icon.png`.
- `logo-512.png`, `logo-1024.png`.
- `social-preview.svg` et `social-preview.png`.
- `site.webmanifest`.

## Intégration Grav

Place les fichiers utiles dans :

```text
user/themes/poolpilot/images/
```

Dans le `<head>` :

```html
<link rel="icon" href="/user/themes/poolpilot/images/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/user/themes/poolpilot/images/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/user/themes/poolpilot/images/apple-touch-icon.png">
<link rel="manifest" href="/user/themes/poolpilot/images/site.webmanifest">
```

Le fichier `logo.svg` reste la version de référence, sans modification.
