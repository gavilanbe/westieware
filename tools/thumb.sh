#!/bin/sh
# Miniatura del portfolio (640x400): tools/thumb.sh [salida.jpg]
cd "$(dirname "$0")/.."
OUT=${1:-artifacts/thumb.png}; PAGE=${PAGE:-index.html}
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom "file://$PWD/$PAGE?test=thumb" 2>/dev/null \
 | grep -o 'data-result="data:image/png;base64,[^"]*"' | sed 's/data-result="data:image\/png;base64,//; s/"$//' | base64 -d > /tmp/westie-thumb-320.png
magick /tmp/westie-thumb-320.png -filter point -resize 640x400 "$OUT" && echo "$OUT"
