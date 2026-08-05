#!/usr/bin/env bash
set -euo pipefail

cd /opt/grav

# Removing only the roadmap JSON forces a fresh API request on the next visit.
rm -f user/data/poolpilot-roadmap-cache.json

php bin/grav clearcache

echo "Cache Roadmap supprimé. Ouvrez /roadmap pour déclencher une nouvelle synchronisation."
