#!/usr/bin/env bash
# Start all WLTH Form APIs.
# Each API folder must contain a start.sh with a PORT variable on the second line.
# Logs go to <ApiFolder>/server.log

DESKTOP="$(cd "$(dirname "$0")" && pwd)"
STARTED=0

for dir in "$DESKTOP"/*/; do
  script="$dir/start.sh"
  [ -f "$script" ] || continue

  # Read the port from the start.sh
  port=$(grep -m1 '^PORT=' "$script" | cut -d= -f2)
  [ -z "$port" ] && continue

  name=$(basename "$dir")

  # Skip if something is already listening on that port
  if lsof -iTCP:"$port" -sTCP:LISTEN -t &>/dev/null; then
    echo "⚠  $name  →  already running on http://localhost:$port"
    continue
  fi

  log="$dir/server.log"
  (cd "$dir" && bash start.sh >> "$log" 2>&1) &
  sleep 1

  if lsof -iTCP:"$port" -sTCP:LISTEN -t &>/dev/null; then
    echo "✓  $name  →  http://localhost:$port   (log: $log)"
  else
    echo "✗  $name  →  failed to start (check $log)"
  fi
  STARTED=$((STARTED + 1))
done

[ $STARTED -eq 0 ] && echo "No API folders found on Desktop (add a start.sh with PORT=xxxx)."
