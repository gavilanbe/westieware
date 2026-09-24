#!/bin/sh
# Lámina de revisión de una fase con un solo Chrome: tarjeta, interludio y cada microjuego (con el bot).
#   tools/sheet.sh anahi [PAGE=index.html]   → artifacts/gallery/anahi.png
cd "$(dirname "$0")/.."
ID=$1; PAGE=${PAGE:-index.html}; COLS=${COLS:-5}; mkdir -p artifacts/gallery
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
GAMES=${GAMES:-$("$CHROME" --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom "file://$PWD/$PAGE?test=list&id=$ID" 2>/dev/null | grep -o 'data-result="[^"]*"' | sed 's/data-result="//; s/"$//')}
CELLS="escena=stage%26id=$ID%26nostory=1%26ff=1.7%26freeze=1|escena=stage%26id=$ID%26nostory=1%26ff=4.3%26freeze=1"
N=2; for g in $GAMES; do CELLS="$CELLS|escena=mg%26id=$g%26lv=2%26ff=1.4%26freeze=1%26bot=1"; N=$((N+1)); done
ROWS=$(( (N + COLS - 1) / COLS ))
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --mute-audio --window-size="$((COLS*268+4)),$((ROWS*424+4))" --virtual-time-budget="${VT:-30000}" \
  --screenshot="artifacts/gallery/$ID.png" "file://$PWD/tools/grid.html?page=../$PAGE&cols=$COLS&cells=$CELLS" >/dev/null 2>&1
echo "artifacts/gallery/$ID.png ($N: $GAMES)"
