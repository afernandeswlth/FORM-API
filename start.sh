#!/usr/bin/env bash
# Start the WLTH Forms Portal (all forms on a single port)
PORT=8000
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting WLTH Forms Portal on http://localhost:$PORT"
cd "$DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload
