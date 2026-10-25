#!/usr/bin/env bash
# Stop Prelegal. The container is removed, so its database goes with it.
set -euo pipefail
docker stop prelegal
