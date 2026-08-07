# Sistema de diseño — KORVEX SURVEYS

Lenguaje de vidrio esmerilado sobre fondo nocturno. Toma de Stitch el
espaciado, los radios y el contenedor; reemplaza sus superficies planas por
material translúcido.

## Decisión de partida

El `DESIGN.md` de Stitch prohíbe explícitamente sombras, desenfoques y
degradados. El vidrio de Apple depende justamente de esas tres cosas. Se
descarta esa regla de forma consciente y se conserva todo lo demás de Stitch:
tipografía Inter en dos pesos, contenedor de 720 px, una pregunta por pantalla
sin scroll, barra de progreso de 4 px a ras del borde.

Lo que **no** cambia respecto al sistema anterior: el azul de marca, los textos,
el orden de las preguntas y la lógica.

---

## Tokens

### Fondo y ambiente

| Token | Valor | Para qué |
|---|---|---|
| `--bg` | `#080a11` | Lienzo base. Más profundo que antes: el vidrio necesita oscuridad detrás para que el borde de luz se lea |
| `--orb-a` | `#2f43ea` @ 18% | Halo azul superior derecho |
| `--orb-b` | `#6d4bff` @ 12% | Halo violeta inferior izquierdo |
| `--orb-c` | `#0e7ec4` @ 9% | Halo cian central, muy tenue |

Los tres halos son fijos y no se mueven. Existen para que el vidrio tenga algo
que refractar — sobre un fondo plano el efecto no se percibe.

### Material de vidrio

| Token | Valor | Notas |
|---|---|---|
| `--glass` | `rgba(255,255,255,.045)` | Superficie en reposo |
| `--glass-hover` | `rgba(255,255,255,.075)` | Al pasar el cursor |
| `--glass-sel` | `rgba(70,92,255,.19)` | Opción seleccionada |
| `--glass-line` | `rgba(255,255,255,.10)` | Borde de un píxel |
| `--glass-line-hi` | `rgba(255,255,255,.19)` | Borde al pasar el cursor |
| `--blur` | `20px` | Desenfoque de fondo |
| `--sat` | `170%` | Saturación. Sin esto el vidrio se ve gris y muerto |
| `--specular` | `inset 0 1px 0 rgba(255,255,255,.14)` | Filo brillante en el borde superior |
| `--lift` | `0 8px 28px rgba(0,0,0,.38)` | Sombra que despega la tarjeta del fondo |

El brillo superior es lo que más vende el efecto. Es la línea de luz que aparece
en el canto de una lámina de vidrio real. Sin ella las tarjetas parecen
simplemente semitransparentes.

### Marca

| Token | Valor |
|---|---|
| `--blue` | `#2f43ea` |
| `--blue-hi` | `#5568ff` |
| `--ok` | `#34d8a4` |
| `--danger` | `#ff6b6f` |

### Texto

| Token | Valor | Contraste sobre vidrio |
|---|---|---|
| `--text` | `#f4f6fd` | 15.8:1 |
| `--text-2` | `#a8b0cf` | 7.1:1 |
| `--text-3` | `#6f78a0` | 3.4:1 — solo decorativo, nunca información |

### Forma y ritmo

| Token | Valor |
|---|---|
| `--r-sm` | `10px` |
| `--r` | `14px` — controles y opciones |
| `--r-lg` | `20px` — tarjetas grandes del selector |
| Contenedor | `720px` |
| Separación entre opciones | `10px` |
| Relleno de opción | `15px 17px` |

---

## Componentes

### Opción de respuesta

Lámina de vidrio con insignia de tecla a la izquierda y palomita a la derecha.

| Estado | Superficie | Borde | Insignia |
|---|---|---|---|
| Reposo | `--glass` | `--glass-line` | Contorno, texto atenuado |
| Cursor encima | `--glass-hover` | `--glass-line-hi` | Contorno más claro |
| Seleccionada | `--glass-sel` | `--blue` | Relleno azul sólido, texto blanco |
| Bloqueada | Opacidad 38% | — | Sin interacción |

Se bloquea cuando la pregunta tiene tope de selección y ya se alcanzó. La
palomita aparece solo en el estado seleccionado.

**Accesibilidad.** Cada opción es un `<button>` real. Se llega con Tab, se
activa con Enter o Espacio, y responde a la letra correspondiente A–Z. Altura
mínima 48 px, por encima del mínimo táctil de 44 px.

### Tarjeta del selector

Solo en la portada. Vidrio de radio grande con ícono, título, descripción y
enlace. Al pasar el cursor sube 3 px y el borde toma el azul de marca.

### Campos de texto

El área de texto larga es vidrio. Los campos de una línea son subrayados
translúcidos que se vuelven azules al enfocar — mantener el vidrio aquí sería
ruido, porque el contenido es lo que importa.

### Botones

| Variante | Uso |
|---|---|
| Sólido azul | Acción principal. Uno por pantalla |
| Vidrio contorneado | Saltar, volver |

### Barra de progreso

4 px a ras del borde superior, sin redondeo. Es un instrumento de medida, no un
adorno. Debajo lleva una línea de luz de un píxel para separarla del contenido.

---

## Límites del vidrio

Reglas duras, no preferencias.

1. **Nunca vidrio sobre vidrio.** Dos capas translúcidas encimadas se vuelven
   lechosas y el texto se pierde.
2. **El texto nunca es translúcido.** El material es el fondo; las letras son
   sólidas siempre.
3. **Máximo 8 láminas en pantalla.** Cada `backdrop-filter` cuesta trabajo de
   compositor. Diez opciones con desenfoque hacen tartamudear un Android de
   gama media, y esta encuesta se llena en celular.
4. **Con `prefers-reduced-transparency` se apaga.** Se sustituye por superficies
   sólidas equivalentes.
5. **Respaldo obligatorio.** Sin soporte de `backdrop-filter` el vidrio se
   reemplaza por un relleno opaco con el mismo contraste. Nunca queda texto
   flotando sin fondo.
