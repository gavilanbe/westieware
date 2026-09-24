#!/bin/sh
# Lámina de revisión de una fase: tarjeta, interludio y cada microjuego (con el bot).
#   tools/gallery.sh anahi [PAGE=index.html]   → artifacts/gallery/anahi.png
cd "$(dirname "$0")/.."
ID=$1; PAGE=${PAGE:-index.html}; OUT=artifacts/gallery/$ID; mkdir -p "$OUT"; rm -f "$OUT"/*.png
GAMES=$("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom "file://$PWD/$PAGE?test=list&id=$ID" 2>/dev/null | grep -o 'data-result="[^"]*"' | sed 's/data-result="//; s/"$//')
PAGE=$PAGE SHOTDIR=$OUT VT=4000 tools/shot.sh stage 792 1260 "id=$ID&nostory=1&ff=1.7&freeze=1" >/dev/null
PAGE=$PAGE SHOTDIR=$OUT VT=4000 tools/shot.sh stage 792 1260 "id=$ID&nostory=1&ff=4.3&freeze=1" >/dev/null
for g in $GAMES; do PAGE=$PAGE SHOTDIR=$OUT tools/shot.sh mg 792 1260 "id=$g&lv=2&ff=1.4&freeze=1&bot=1" >/dev/null; done
montage "$OUT"/*.png -geometry 264x420+2+2 -tile 5x -background '#222' "artifacts/gallery/$ID.png" && echo "artifacts/gallery/$ID.png ($GAMES)"
