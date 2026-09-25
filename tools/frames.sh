#!/bin/sh
# Fotogramas de una escena en varios instantes, 5 Chromes a la vez, y una lámina con todos.
#   tools/frames.sh <salida.png> "<parámetros sin ff>" t1 t2 t3 …   (p. ej. "escena=mg&id=prepara&lv=1&bot=1")
cd "$(dirname "$0")/.."
OUT=$1; Q=$2; shift 2; PAGE=${PAGE:-index.html}
D=$(mktemp -d "${TMPDIR:-/tmp}/frames.XXXX"); i=0
for t in "$@"; do
  i=$((i+1)); n=$(printf '%02d' $i)
  ( "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --mute-audio --window-size=792,1260 --virtual-time-budget="${VT:-4000}" --screenshot="$D/$n.png" "file://$PWD/$PAGE?nosave=1&seed=7&$Q&ff=$t&freeze=1" >/dev/null 2>&1
    magick "$D/$n.png" -resize 264x420 -gravity South -background '#1d1424' -splice 0x12 -gravity North -fill white -pointsize 11 -annotate +0+1 "t=$t" "$D/s$n.png" ) &
  [ $((i % 5)) -eq 0 ] && wait
done; wait
montage "$D"/s*.png -tile ${COLS:-5}x -geometry +2+2 -background '#1d1424' "$OUT" && echo "$OUT ($D)"
