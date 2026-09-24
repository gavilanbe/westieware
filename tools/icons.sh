#!/bin/sh
# Iconos de la app (192, 512, 180 y enmascarable) desde la escena ICON: tools/icons.sh
cd "$(dirname "$0")/.."
PAGE=${PAGE:-index.html}; T=${TMPDIR:-/tmp}
grab() {
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom "file://$PWD/$PAGE?test=icon$1" 2>/dev/null \
   | grep -o 'data-result="data:image/png;base64,[^"]*"' | sed 's/data-result="data:image\/png;base64,//; s/"$//' | base64 -d > "$2"
}
grab "" "$T/ww-icon.png"; grab "&mask=1" "$T/ww-icon-mask.png"
cp "$T/ww-icon.png" icons/icon-192.png
magick "$T/ww-icon.png" -filter point -resize 512x512 icons/icon-512.png
magick "$T/ww-icon.png" -filter point -resize 180x180 icons/icon-180.png
magick "$T/ww-icon-mask.png" -filter point -resize 512x512 icons/icon-maskable-512.png
magick identify icons/*.png
