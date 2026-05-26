#!/usr/bin/env bash
# Runs notes-api (3001), person-api (3002), and the my-app frontend (3000).
# Stops all three when you press Ctrl+C.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pids=()

cleanup() {
  echo ""
  echo "Stopping all services..."
  kill "${pids[@]}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting notes-api on http://localhost:3001"
node "$DIR/notes-api/server.js" &
pids+=($!)

echo "Starting person-api on http://localhost:3002"
node "$DIR/person-api/server.js" &
pids+=($!)

echo "Starting my-app on http://localhost:3000"
( cd "$DIR/my-app" && npm run dev ) &
pids+=($!)

echo ""
echo "All services started. Press Ctrl+C to stop."
wait
