#!/usr/bin/env bash
# Start the Linked Account Nomination API
PORT=8001
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Linked Account API on http://localhost:$PORT"
cd "$DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload
