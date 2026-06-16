#!/bin/sh
# One-time setup for the local narrator (Chatterbox Multilingual TTS).
# Creates bridge/.venv-narrator and installs the model runtime (~3GB with
# PyTorch; the model weights download on first run, a few GB more).
#
#     sh bridge/setup-narrator.sh
#
# Requires Python 3.11 (Chatterbox's tested version) — `brew install python@3.11`.
set -e
cd "$(dirname "$0")"

PY=""
for c in python3.11 python3; do
  if command -v "$c" >/dev/null 2>&1; then PY="$c"; break; fi
done
[ -n "$PY" ] || { echo "No python3 found. Install Python 3.11 first."; exit 1; }
echo "Using $PY ($($PY --version 2>&1))"

if [ ! -d .venv-narrator ]; then
  "$PY" -m venv .venv-narrator
fi
./.venv-narrator/bin/pip install --upgrade pip
./.venv-narrator/bin/pip install chatterbox-tts

echo
echo "✓ Narrator ready. The bridge will generate audio for new pages automatically."
echo "  (First narration downloads the model weights — give it a few minutes.)"
