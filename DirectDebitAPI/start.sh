#!/usr/bin/env bash
# Start the Direct Debit Request API
PORT=8002
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Direct Debit Request API on http://localhost:$PORT"
cd "$DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload
