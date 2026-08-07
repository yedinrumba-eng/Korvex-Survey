# KORVEX SURVEY

Encuestas de validación para el proyecto de descubrimiento social y reservas.
Dos encuestas independientes, estilo Typeform, servidas desde `survey.korvexdev.cc`.

| Ruta | Encuesta | Público | Duración |
|---|---|---|---|
| `/` | Selector | Todos | — |
| `/negocios` | Encuesta A | Dueños y gerentes de locales | ~5 min |
| `/personas` | Encuesta B | Consumidores | ~3–4 min |

El contenido de las preguntas está documentado en
`APP-SOCIAL-DESCUBRE/ENCUESTAS_V3_FINAL.md` del repositorio del proyecto.

> **Regla de encuesta ciega:** ninguna pantalla menciona el nombre del proyecto,
> sus funciones ni describe el producto. Las preguntas de intención van al final
> y están redactadas en genérico. No romper esta regla al editar preguntas.

---

## Stack

HTML, CSS y JavaScript sin dependencias ni paso de compilación.
Los datos van directo a **Supabase** por su API REST.
Se despliega como sitio estático en **Vercel**.

No hay framework a propósito: el sitio carga en menos de 100 KB y arranca
al instante en un celular con datos móviles, que es donde se va a llenar
la mayoría de las encuestas.

```
├── index.html              selector negocio / persona
├── negocios/index.html     encuesta A
├── personas/index.html     encuesta B
├── assets/
│   ├── config.js           credenciales de Supabase  ← editar
│   ├── engine.js           motor de encuestas
│   ├── styles.css          estilos
│   ├── survey-negocios.js  preguntas A
│   ├── survey-personas.js  preguntas B
│   └── logo.png
├── supabase/schema.sql     tablas, RLS y vistas de análisis
└── vercel.json
```

---

## Puesta en marcha

### 1. Base de datos — ya hecho

El esquema está aplicado en el proyecto Supabase **Survey**
(`mgtxlzkvkfdodrtqpyxe`). `supabase/schema.sql` es la copia versionada, por si
hay que recrearlo: SQL Editor → New query → pegar → Run.

### 2. Credenciales — ya hecho

`assets/config.js` ya apunta al proyecto correcto con la clave publicable.

Esa clave es **pública por diseño** y está hecha para vivir en el navegador.
No da acceso a nada: el navegador no tiene ningún permiso sobre la tabla, y su
única puerta de entrada es la función `guardar_respuesta`. Con esa clave nadie
puede leer respuestas, borrarlas, ni modificar una ya enviada.

### 3. Desplegar

Conectar el repositorio en [vercel.com/new](https://vercel.com/new).
Framework: **Other**. Sin comando de build ni directorio de salida.

### 4. Subdominio

En Cloudflare → DNS → Add record:

| Campo | Valor |
|---|---|
| Type | `CNAME` |
| Name | `survey` |
| Target | `cname.vercel-dns.com` |
| Proxy status | **DNS only** (nube gris) |

Después, en Vercel → Project → Settings → Domains → añadir
`survey.korvexdev.cc`. El certificado HTTPS se emite solo.

> La nube debe quedar **gris**, no naranja. Con el proxy de Cloudflare activo
> Vercel no puede validar el dominio ni emitir el certificado.

### Probar en local

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

Si se ponen los placeholders `TU_...` de vuelta en `config.js`, la encuesta
funciona completa pero no guarda nada — útil para revisar diseño y flujo sin
ensuciar la base con respuestas de prueba.

---

## Seguimiento por canal

Agregar `?src=` a cualquier enlace para saber de dónde vino cada respuesta.
El parámetro sobrevive al pasar del selector a la encuesta.

```
survey.korvexdev.cc/personas?src=aramis-instagram
survey.korvexdev.cc/personas?src=whatsapp-personal
survey.korvexdev.cc/negocios?src=junior-visita
survey.korvexdev.cc/negocios?src=email-frio
```

Comparar resultados con:

```sql
select * from v_canales;
```

---

## Qué se guarda

Además de las respuestas, cada sesión registra automáticamente:

| Campo | Para qué |
|---|---|
| `duration_seconds` | Detectar respuestas de relleno |
| `last_question_id` | En qué pregunta abandonó quien no terminó |
| `completed` | Separar completadas de abandonadas |
| `source` | Comparar canales de difusión |
| `device_type` | Móvil vs escritorio |
| `skipped_optional` | Nivel de compromiso del encuestado |
| `started_at` / `submitted_at` | Cuándo responde la gente |

La sesión se guarda también en el navegador: si alguien cierra la pestaña a
media encuesta y vuelve dentro de 6 horas, continúa donde se quedó.

---

## Consultas útiles

```sql
-- Panorama general
select * from v_resumen;

-- Dónde se cae la gente
select * from v_abandono;

-- Qué canal funciona
select * from v_canales;

-- Contactos para dar seguimiento
select * from v_contactos;

-- Solo respuestas de calidad
select * from v_respuestas_validas where survey_type = 'personas';

-- Cruce: cuánto gasta vs. cuánto pagaría de cargo de servicio
select
  answers #>> '{p21,label}' as gasto_por_salida,
  answers #>> '{p22,label}' as cargo_aceptado,
  count(*)
from v_respuestas_validas
where survey_type = 'personas'
group by 1, 2
order by 3 desc;
```

---

## Editar las preguntas

Las preguntas viven en `assets/survey-negocios.js` y `assets/survey-personas.js`.
Cada una es un objeto:

```js
{
  id: 'p8',                    // debe ser único y estable — es la clave en la base
  type: 'radio',               // radio | checkbox | text | longtext | contact
  required: true,
  title: '¿Qué factor pesa más al elegir el lugar?',
  help: 'Texto de apoyo, opcional',
  maxSelect: 3,                // solo checkbox
  showIf: (a) => a.p7 && a.p7.value !== 'nunca',   // lógica condicional
  options: [
    { value: 'ambiente', label: 'El ambiente y la gente' },
    { value: 'otro',     label: 'Otro', other: true },      // abre campo de texto
    { value: 'ninguno',  label: 'Ninguna', exclusive: true } // deselecciona el resto
  ]
}
```

**No cambiar un `id` una vez que la encuesta esté publicada** — las respuestas
ya guardadas quedarían huérfanas.

---

## Notas

- Las páginas llevan `noindex`: no aparecen en Google.
- Hay una trampa antibots invisible (campo oculto) en cada envío.
- El diseño respeta `prefers-reduced-motion`.
- Navegación con teclado: `A`–`Z` para elegir opción, `Enter` para avanzar,
  flechas arriba y abajo para moverse entre preguntas.
