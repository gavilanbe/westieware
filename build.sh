#!/bin/sh
# Concatenates the sources into a single index.html (no build tools needed).
cd "$(dirname "$0")"
CORE="src/core.js src/gfx.js src/font.js src/audio.js src/art.js src/anahi_art.js src/salon.js src/ui.js src/fx.js"
STAGE_SYS="src/mg.js src/stage.js src/cutscene.js"
# ONLY="anahi rizos" limits the stages/games bundled (parallel work); OUT=file writes elsewhere
if [ -n "$ONLY" ]; then
  STAGES="src/stages/0_prologue.js"; GAMES=""
  for id in $ONLY; do
    [ -f "src/stages/$id.js" ] && STAGES="$STAGES src/stages/$id.js"
    for f in src/games/$id.js src/games/${id}_*.js; do [ -f "$f" ] && GAMES="$GAMES $f"; done
  done
  # the prologue needs Anahí's stage (its microgame + art)
  case " $ONLY " in *" anahi "*) ;; *) STAGES="$STAGES src/stages/anahi.js"; GAMES="$GAMES src/games/anahi.js src/games/anahi_boss.js";; esac
else
  STAGES=$(ls src/stages/*.js 2>/dev/null)
  GAMES=$(ls src/games/*.js 2>/dev/null)
fi
OUTFILE=${OUT:-index.html}
SCENES="src/cards.js src/chibis.js src/boot.js src/title.js src/menu.js src/extras.js src/lab.js src/main.js"
FILES=""
for f in $CORE $STAGE_SYS $STAGES $GAMES $SCENES; do [ -f "$f" ] && FILES="$FILES $f"; done
# a syntax error in any module stops the build with its file and line
if command -v node >/dev/null 2>&1; then for f in $FILES; do node --check "$f" || exit 1; done; fi
{
cat <<'H'
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0b2a20">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>WESTIE WARE ¡Tocados!</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-title" content="Westie Ware">
<meta name="description" content="Microjuegos de 4 segundos en la peluquería canina Westie BLVRD (by Anahí Gavilán, Barcelona). Un homenaje a WarioWare: Touched! en pixel art, hecho para jugar en el móvil en vertical: toca, frota, corta, dibuja, arrastra y gira.">
<style>
html,body{margin:0;height:100%;background:#0b2a20;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
body{display:flex;align-items:center;justify-content:center;background:#0b2a20 radial-gradient(circle at 50% 40%,#123d30 0,#0b2a20 60%,#06190f 100%)}
canvas{image-rendering:pixelated;image-rendering:crisp-edges;display:block;touch-action:none}
</style>
</head>
<body><script>window.onerror=function(m,s,l,c){document.documentElement.setAttribute('data-err',m+' @'+l+':'+c);};</script><canvas id="c" aria-label="WESTIE WARE ¡Tocados!: microjuegos táctiles en la peluquería canina Westie BLVRD"></canvas>
<script>
H
cat $FILES
cat <<'H'
</script>
<script>if('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !location.search) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>
</body>
</html>
H
} > "$OUTFILE"
echo "$OUTFILE: $(wc -c < "$OUTFILE") bytes ($(echo $FILES | wc -w | tr -d ' ') files)"
