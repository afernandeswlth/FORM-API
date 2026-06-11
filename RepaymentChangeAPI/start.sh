#!/usr/bin/env bash
PORT=8003
cd "$(dirname "$0")"
exec python3 -m uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
