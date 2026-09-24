# 🐶 WESTIE WARE ¡Tocados!

**Jugar:** https://gavilanbe.github.io/westieware/

Microjuegos de cuatro segundos en **Westie BLVRD**, la peluquería canina de
**Anahí Gavilán** en el Carrer de Viladomat, 185 (Eixample, Barcelona).
Es un homenaje a *WarioWare: Touched!* (Nintendo DS) hecho entero a mano para
este juego: fuentes, pixel art, música, transiciones y hasta la consola.

Está pensado **para el móvil en vertical**: dos pantallas apiladas como una DS.
La de abajo, a todo lo ancho y a la altura del pulgar, es la táctil (en un
iPhone mide casi lo mismo que la de una DS Lite); la de arriba enseña la orden,
las vidas y al personaje, y el dedo nunca la tapa. En el ordenador se juega con
el ratón. Se puede instalar como app y funciona sin conexión.

## Cómo se juega

Cada microjuego dura cuatro segundos y empieza con una orden de una palabra:
**¡TOCA!**, **¡FROTA!**, **¡CORTA!**, **¡DIBUJA!**, **¡ARRASTRA!**, **¡GIRA!**…
Hay que entenderla y cumplirla antes de que la **bomba de baño** llegue al final
de su mecha. Tienes cuatro vidas; cada cuatro o cinco microjuegos todo va
**¡MÁS RÁPIDO!** y al final de cada fase espera un **jefe**.

## Todo lo de *Touched!*, a la manera de Westie BLVRD

- **Arranque**: el aviso de salud y seguridad de la DS en versión parodia
  («Antes de jugar, acaricia a tu perro»), el cartel de Westie BLVRD que cae y ladra.
- **Pantalla de título** con el logo animado y los personajes que ya conoces asomando.
- **Prólogo**: Ani abre la persiana, llegan 99 WhatsApps, las tijeras caen por
  la alcantarilla, Bule baja a buscarlas y el Gurú de la Alcantarilla le da el
  **Peine de Oro**. El primer «¡LAVA!» se juega dentro de la historia.
- **Menú de burbujas**: los personajes flotan y se pueden agarrar y lanzar; un
  toque enseña su ficha arriba y otro entra en su fase.
- **Cada fase**: tarjeta de presentación con la mecánica, historia de entrada,
  interludios con reacción, contador y vidas propias de cada personaje, zoom
  dentro del marco (el espejo dorado del salón), orden estampada, bomba de baño,
  «¡MÁS RÁPIDO!», «¡JEFE!», «¡SUPERADO!» con historia de salida, «¡SE ACABÓ!»,
  récords y, al repetir, «¡NIVEL 2!» y «¡NIVEL 3!» sin fin.
- **Final**: Súper Westie, todos los microjuegos mezclados y el Monstruo de Barro;
  foto de familia en el sillón de terciopelo mostaza y créditos.
- **Extras**: *Mezcla Maestra* (todos los microjuegos sin fin), *A un pelo*
  (una vida, nivel 2), **Colección** para practicar cualquier microjuego ya
  visto y **Juguetes** (Caricias, Pizarra y Piano Guau).

## Personajes y fases

| Fase | Mecánica | Microjuegos | Jefe |
|---|---|---|---|
| **Anahí** · «Cuidado, calma y detalle» | ¡TOCA! | Pulgas fuera, Uñas negras, Foto para Insta, Helado perruno, Burbujas, Lavado exprés | El Rey Pulgón |
| **Rizos** · el goldendoodle del Club Champú | ¡FROTA! | Espuma, Toalla, Vinilo (scratch de DJ), Espejo empañado, Rasca la barriga | La Gran Maraña (y Pulgui) |
| **Pompón** · ídolo de «Los 40 Perrunos» | ¡CORTA! | Flequillo, Pompones, Nudos al vuelo, Chuches para compartir, Inauguración | Estilismo de Gala (contra Vanesa) |
| **Kira & Nala** · las hermanas pastoras | ¡DIBUJA! | Pizarra, Rebaño en el Parc de Joan Miró, Correas, Rampa, Lazo en plaça de Catalunya | La Gaviota Ladrona |
| **Ceniza** · la gata bruja (y Pato) | ¡ARRASTRA! | Pócima, Estantería, Lazo, ¡Al agua!, Correa | La Gran Pócima |
| **Don Bigotes** · el schnauzer inventor | ¡GIRA! | Secador de manivela, Grifo, Tapón, Heladera, Correa retráctil | Secador Supersónico 3000 |
| **Súper Westie** · «¡Por un Eixample sin barro!» | ¡TODO! | Todos, mezclados | El Monstruo de Barro |

## Juice

Estallidos de partículas (estrellas, burbujas, gotas, pelo, confeti), *hit-stop*
en cada acierto, temblor de pantalla, *squash & stretch*, destellos, textos que
entran letra a letra con muelle, la bomba que chisporrotea y explota en espuma,
el LED de la consola que parpadea en los últimos pulsos, vibración en Android y
un sonido para cada gesto. La música de cada tramo se programa sobre el reloj de
audio para caer justo en el pulso.

## Técnica

- HTML + JavaScript sin dependencias; `./build.sh` concatena `src/` en un único `index.html`.
- **Pixel art propio**: un rasterizador de formas con distancia con signo (SDF)
  que ilumina cada pieza desde arriba a la izquierda, la cuantiza a rampas de
  color con dither ordenado y le añade sombras de contacto, líneas entre piezas y
  contorno selectivo; el pelo se hace con mechones celulares. Las caras se pintan
  píxel a píxel por expresión.
- **Fuentes propias**: *Pelusa* (5×7 con acentos, ñ, ¡ y ¿) y *Mordisco*, una
  tipografía de trazos con plumilla redonda que se rasteriza a cualquier tamaño.
- **Sintetizador propio** con WebAudio: pulsos, triángulo, campanas FM, marimba,
  metales, batería, ladridos y las voces «bla-bla» de los diálogos.
- Pruebas con bot, en Chrome sin cabeza:
  - `tools/test.sh mg` juega los 38 microjuegos (jefes incluidos) en sus tres niveles;
  - `tools/test.sh stage id=anahi` juega una fase entera, de la tarjeta a los resultados;
  - `tools/test.sh cut`, `audio` y `progress` recorren las historias, hacen sonar cada
    canción y efecto, y comprueban la cadena de desbloqueos.
- `tools/shot.sh` hace capturas, `tools/gallery.sh <fase>` monta la lámina de revisión
  de una fase, `tools/phone.html` enseña el juego en tamaños de móvil y
  `node tools/dupes.js` avisa de nombres globales repetidos entre ficheros.
- En `artifacts/` están las láminas de cada fase y la miniatura.

## Créditos

Westie BLVRD · Grooming, Spa & Store · Carrer de Viladomat, 185 · Barcelona ·
688 72 57 01 · [@westie.blvrd](https://www.instagram.com/westie.blvrd/)

Juego de fans, sin relación con Nintendo. Idea de Nahuel Gavilán; programación,
arte y música de Claude Opus 5.5.
