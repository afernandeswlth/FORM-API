#!/usr/bin/env bash
# Stop all WLTH Form APIs started by start-apis.sh

DESKTOP="$(cd "$(dirname "$0")" && pwd)"
STOPPED=0

for dir in "$DESKTOP"/*/; do
  script="$dir/start.sh"
  [ -f "$script" ] || continue

  port=$(grep -m1 '^PORT=' "$script" | cut -d= -f2)
  [ -z "$port" ] && continue

  name=$(basename "$dir")
  pids=$(lsof -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null)

  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null
    echo "✓  Stopped $name  (port $port)"
    STOPPED=$((STOPPED + 1))
  else
    echo "–  $name  not running"
  fi
done

[ $STOPPED -eq 0 ] && echo "Nothing to stop."
