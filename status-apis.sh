#!/usr/bin/env bash
# Show which WLTH Form APIs are running

DESKTOP="$(cd "$(dirname "$0")" && pwd)"

for dir in "$DESKTOP"/*/; do
  script="$dir/start.sh"
  [ -f "$script" ] || continue

  port=$(grep -m1 '^PORT=' "$script" | cut -d= -f2)
  [ -z "$port" ] && continue

  name=$(basename "$dir")
  if lsof -iTCP:"$port" -sTCP:LISTEN -t &>/dev/null; then
    echo "✓  $name  →  http://localhost:$port  (RUNNING)"
  else
    echo "✗  $name  →  http://localhost:$port  (stopped)"
  fi
done
