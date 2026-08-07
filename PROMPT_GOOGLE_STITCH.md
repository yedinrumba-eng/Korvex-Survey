# Prompt para Google Stitch — rediseño visual de las encuestas

**Objetivo:** generar una propuesta visual nueva para `survey.korvexdev.cc`.
Solo cambia el aspecto. La lógica, las preguntas y la base de datos ya están
hechas y probadas — no se tocan.

## Cómo usarlo

1. Entra a Stitch y elige modo **Web**, no Mobile. Las encuestas se llenan
   sobre todo en celular, pero necesitas que se vea bien en ambos y el modo Web
   te da los dos.
2. Sube `assets/logo.png` como referencia de marca antes de escribir el prompt.
3. Pega el **prompt principal** de abajo.
4. Si Stitch te corta el prompt por largo, usa la **versión corta** y luego pide
   pantalla por pantalla con los prompts de refinamiento.
5. El prompt va en inglés a propósito: Stitch responde mejor así. Los textos de
   la interfaz van en español dentro de comillas para que los respete literal.

---

## Prompt principal

```
Design a survey web application with a premium dark aesthetic, similar in feel
to Typeform. All interface copy must be in Spanish, exactly as written below.

BRAND
Dark theme only. Background near-black #0a0c14. Card surfaces #161a2b.
Borders #262c45. Primary accent electric blue #2f43ea. Body text #f2f4fb.
Secondary text #9aa3c4. Typeface: Inter. Only two weights, regular and medium.
No gradients, no drop shadows, no glow. Flat surfaces with hairline borders.
Generous whitespace. Rounded corners of 12 to 14 pixels.
The logo is a blue and silver angular letter K with the wordmark "KORVEX DEV".
Place it small and quiet in the top left corner, never as a hero element.

CORE PRINCIPLE
One question per screen. Nothing scrolls. Each screen is a full viewport with
the question vertically centered. A thin 4-pixel progress bar sits pinned at the
very top of the screen, filling from left to right in the accent blue.
The current question number appears in the top right in small muted text.

SCREEN 1 — Chooser
Headline: "Queremos entender cómo se sale en República Dominicana."
Subtext: "Estudio independiente sobre cómo las personas eligen dónde salir y
cómo los negocios manejan el flujo de clientes. No vendemos nada."
Three small outlined pills in a row: "100% anónimo", "3 a 6 minutos",
"Sin registro".
Below, a line in white: "Para empezar, dinos quién eres:"
Then two large selectable cards side by side on desktop, stacked on mobile.
Card A: storefront icon, title "Tengo o dirijo un negocio", description
"Restaurante, bar, discoteca, lounge, centro de eventos o similar. Son unos 5
minutos.", and a blue link "Empezar la encuesta" with a right arrow.
Card B: two-people icon, title "Salgo como persona", description "Sales a comer,
a compartir o de noche. Queremos saber cómo decides a dónde ir. Son 3 o 4
minutos.", same blue link.
Cards lift slightly and gain a blue border on hover.

SCREEN 2 — Single choice question
Small blue label "8 →" above the question.
Question in large medium-weight text: "¿Qué factor pesa más al elegir el lugar?"
Six option rows stacked vertically. Each row is a card with a small square
keyboard-key badge on the left showing a letter A through F, then the option
label. Options: "El ambiente y la gente", "El precio", "La ubicación",
"Las opiniones o reseñas", "La seguridad", "Que haya espacio o disponibilidad".
Show one option in its selected state: blue border, subtly tinted background,
the letter badge filled solid blue with white text, and a blue checkmark on the
right edge.
Below the options, a blue button "Continuar" with a check icon, and next to it
in small muted text: "o presiona Enter".

SCREEN 3 — Multiple choice question
Question: "La última vez que saliste, ¿cómo decidiste a dónde ir?"
Helper text below it: "Marca todo lo que aplique."
A small outlined pill: "Puedes elegir varias".
Seven option rows in the same style as screen 2, with two of them selected at
once to show multi-select. Options: "Recomendación de amigos", "Redes sociales,
Instagram o TikTok", "Grupo de WhatsApp", "Ya tenía el lugar en mente",
"Google o mapas", "Fui a donde me invitaron", "Otro".

SCREEN 4 — Open text question
Question: "¿Qué es lo más frustrante al momento de decidir a dónde ir?"
A large multi-line text area, roughly 130 pixels tall, with a card background,
hairline border, and placeholder "Lo que más me molesta es…".
Two buttons: a solid blue "Continuar" and a ghost outlined "Saltar".

SCREEN 5 — Optional contact
Question: "¿A dónde te escribimos?"
Helper text: "Todos los campos son opcionales. Solo usamos estos datos para
contactarte."
A small pill: "Opcional".
Four stacked fields with small muted labels above thin underlined inputs:
"Tu nombre", "Nombre del negocio", "Teléfono o WhatsApp", "Correo electrónico".
Blue button "Enviar respuestas".

SCREEN 6 — Thank you
Centered. A 70-pixel circle with a dark green fill, a thin green border and a
green checkmark inside.
Headline: "Gracias por tu tiempo."
Body: "Tus respuestas nos ayudan a entender mejor lo que viven negocios como el
tuyo. Si dejaste tu contacto, te escribimos pronto."
Progress bar completely full.

Show every screen at both mobile width and desktop width.
```

---

## Versión corta

Si Stitch corta el prompt largo, empieza con esto y luego pide cada pantalla
por separado.

```
A Typeform-style survey web app, dark premium theme. Background #0a0c14, cards
#161a2b, borders #262c45, accent electric blue #2f43ea, text #f2f4fb, Inter
typeface. Flat, no gradients or shadows. One question per screen, vertically
centered, nothing scrolls. Thin blue progress bar pinned at the top. Small
"KORVEX DEV" logo top left, question counter top right. Options are stacked
cards, each with a square letter badge A, B, C on the left; the selected one has
a blue border and a solid blue badge. All copy in Spanish.
```

Prompts de refinamiento, uno a la vez:

- `Now the chooser screen: two large cards, "Tengo o dirijo un negocio" and "Salgo como persona", each with an icon, a one-line description and a blue "Empezar la encuesta" link.`
- `Now a multi-select question with a "Puedes elegir varias" pill and two options selected at the same time.`
- `Now an open text question with a large text area and a ghost "Saltar" button next to the blue "Continuar".`
- `Now the thank you screen: centered green circle with a checkmark, headline "Gracias por tu tiempo."`
- `Now show all screens at mobile width, 390 pixels.`

---

## Reglas que el rediseño no puede romper

Si Stitch propone algo que choque con esto, se descarta — no es preferencia
estética, es lo que hace que los datos sirvan.

| Regla | Por qué |
|---|---|
| Una pregunta por pantalla, sin scroll | Es lo que mantiene la tasa de abandono baja. Un formulario largo de una sola página se abandona mucho más |
| La barra de progreso siempre visible | Sin ella la gente no sabe cuánto falta y se sale |
| Nada que nombre el producto ni sus funciones | Regla de encuesta ciega del proyecto. Si el encuestado adivina qué se está construyendo, sus respuestas dejan de medir el problema real |
| El logo pequeño y discreto | Un logo grande de empresa de tecnología sesga las respuestas hacia lo pro-tecnología |
| Los textos en español, literales | Ya están redactados y revisados. Cambiar una palabra puede cambiar lo que mide la pregunta |
| Contraste alto en el texto | Se va a llenar en un celular, de noche, a veces en un bar. Gris sobre gris no se lee |
| Áreas de toque grandes | Filas de opción de al menos 44 píxeles de alto, o la gente falla el toque con el pulgar |

---

## Cuando termines en Stitch

Exporta el diseño (captura de pantalla, enlace de Figma o el código que genere)
y me lo pasas. Yo lo traduzco al código real: solo se reemplaza
`assets/styles.css` y, si hace falta, el marcado que genera `assets/engine.js`.

Las preguntas, los identificadores, la lógica condicional y la conexión a la
base de datos se quedan intactos. Un rediseño completo es un commit de un solo
archivo — puedes probar varias propuestas sin riesgo de romper nada.
