#!/usr/bin/env bash
# Start the WLTH Redraw Request API
PORT=8006
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Redraw Request API on http://localhost:$PORT"
cd "$DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload
