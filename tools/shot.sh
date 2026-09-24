#!/bin/sh
# Capturas con Chrome sin cabeza: tools/shot.sh <escena> [ancho alto] [parámetros extra]
# p. ej.  tools/shot.sh lab 792 1260 "p=1"
cd "$(dirname "$0")/.."
ESC=${1:-lab}; W=${2:-792}; H=${3:-1260}; EXTRA=${4:-}
PAGE=${PAGE:-index.html}
OUT="${SHOTDIR:-artifacts}/$ESC$( [ -n "$EXTRA" ] && echo "-$(echo "$EXTRA" | tr '=&' '-_')" ).png"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --mute-audio \
  --window-size="$W,$H" --virtual-time-budget="${VT:-2500}" --screenshot="$OUT" \
  "file://$PWD/$PAGE?escena=$ESC&nosave=1&seed=7&$EXTRA" >/dev/null 2>&1
echo "$OUT"
