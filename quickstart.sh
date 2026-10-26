#!/usr/bin/env bash
set -euo pipefail

# Usage: ./quickstart.sh [aquasense|factsafe|firescout]
project_id=${1:-aquasense}
case "$project_id" in
  aquasense|factsafe|firescout) ;;
  *) echo "Supported projects: aquasense, factsafe, firescout" >&2; exit 2 ;;
esac

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if [[ -x .venv/bin/python ]]; then
  python_cmd=.venv/bin/python
else
  python_cmd=python3
fi

if ! "$python_cmd" -c 'import websockets' 2>/dev/null; then
  "$python_cmd" -m pip install -r simulator/requirements.txt
fi
if [[ ! -d frontend/node_modules ]]; then
  npm --prefix frontend ci
fi

"$python_cmd" -u simulator/server.py --project "$project_id" &
simulator_pid=$!
cleanup() {
  kill "$simulator_pid" 2>/dev/null || true
  wait "$simulator_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

sleep 1
if ! kill -0 "$simulator_pid" 2>/dev/null; then
  echo "Simulator could not start. Check whether port 8765 is already in use." >&2
  exit 1
fi

echo "Open http://localhost:5173/?project=$project_id"
echo "Use Scenarios to start playback. Ctrl+C stops both services."
VITE_PROJECT="$project_id" npm --prefix frontend run dev -- --strictPort
