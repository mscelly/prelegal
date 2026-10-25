#!/usr/bin/env bash
# Build the image and start Prelegal at http://localhost:8000 with a fresh database.
set -euo pipefail
cd "$(dirname "$0")/.."
docker build -t prelegal .
docker run -d --rm --name prelegal -p 8000:8000 --env-file .env prelegal
echo "Prelegal is running at http://localhost:8000"
