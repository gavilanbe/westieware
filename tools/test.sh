#!/bin/sh
# Pruebas con el bot en Chrome sin cabeza.
#   tools/test.sh mg [only=rizos] [runs=6]   → cada microjuego × nivel
#   tools/test.sh stage id=rizos              → una fase entera
# PAGE=otro.html para probar un build aparte.
cd "$(dirname "$0")/.."
KIND=${1:-mg}; shift
Q="test=$KIND&auto=1"; for a in "$@"; do Q="$Q&$a"; done
PAGE=${PAGE:-index.html}
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --mute-audio --autoplay-policy=no-user-gesture-required --virtual-time-budget=5000 --dump-dom "file://$PWD/$PAGE?$Q" 2>/dev/null \
 | grep -o 'data-result="[^"]*"' | sed 's/&quot;/"/g; s/data-result="//; s/"$//' \
 | python3 -c "import json,sys; d=json.loads(sys.stdin.read() or '{}'); print(json.dumps(d, indent=1, ensure_ascii=False))"
