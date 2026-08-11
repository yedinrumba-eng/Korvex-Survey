/* Encuesta a negocios · v4
 *
 * Instrumentos aplicados:
 *   - Best-worst scaling (n10a / n10b) para priorizar funcionalidades
 *   - Van Westendorp (nvw1-nvw4) para el rango de precio mensual aceptable
 *   - Escala Juster (n24) para intención calibrada en probabilidad
 *   - Pregunta trampa de atención (nAtt)
 *   - rotate:true rota el orden de las opciones; las exclusivas y las de "Otro"
 *     quedan ancladas al final. Nunca se rota una escala: el orden es el dato.
 */

/* Set fijo de funcionalidades. Las dos preguntas de best-worst tienen que
 * ofrecer exactamente el mismo set para que la resta tenga sentido. */
var FUNCIONALIDADES = [
  { value: 'calendario', label: 'Gestión de reservas y calendario' },
  { value: 'recordatorios', label: 'Recordatorios automáticos al cliente' },
  { value: 'redes', label: 'Integración con redes sociales' },
  { value: 'espera', label: 'Lista de espera' },
  { value: 'pago', label: 'Pago online o cobro anticipado' },
  { value: 'metricas', label: 'Informes y métricas' },
  { value: 'crm', label: 'Gestión de clientes / CRM' }
];

/* Escalera de precio mensual. Idéntica en las cuatro de Van Westendorp. */
/* Techo alto a propósito: si la gente se amontona en la última opción,
 * el dato queda censurado y el óptimo no se puede calcular. */
var ESCALERA_MENSUAL = [
  { value: '500', label: 'RD$500 al mes' },
  { value: '1500', label: 'RD$1,500 al mes' },
  { value: '3000', label: 'RD$3,000 al mes' },
  { value: '6000', label: 'RD$6,000 al mes' },
  { value: '10000', label: 'RD$10,000 al mes' },
  { value: '18000', label: 'RD$18,000 al mes' },
  { value: '30000', label: 'RD$30,000 al mes' },
  { value: '50000', label: 'RD$50,000 al mes o más' }
];

window.PREGUNTAS_NEGOCIOS = [

  /* ---------- Bloque 1 · Perfil ---------- */
  {
    id: 'n1', type: 'radio', required: true,
    title: '¿Qué tipo de negocio es?',
    options: [
      { value: 'restaurante', label: 'Restaurante' },
      { value: 'bar', label: 'Bar o gastrobar' },
      { value: 'discoteca', label: 'Discoteca o club nocturno' },
      { value: 'lounge', label: 'Lounge o rooftop' },
      { value: 'beachclub', label: 'Beach club o pool club' },
      { value: 'eventos', label: 'Centro de eventos' },
      { value: 'karaoke', label: 'Karaoke' },
      { value: 'cafe', label: 'Café o repostería' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'n2', type: 'radio', required: true,
    title: '¿En qué ciudad opera principalmente?',
    options: [
      { value: 'sd', label: 'Santo Domingo' },
      { value: 'santiago', label: 'Santiago' },
      { value: 'punta_cana', label: 'Punta Cana / Bávaro' },
      { value: 'la_romana', label: 'La Romana' },
      { value: 'puerto_plata', label: 'Puerto Plata' },
      { value: 'otra', label: 'Otra', other: true }
    ]
  },
  {
    id: 'n3', type: 'radio', required: true,
    title: '¿Cuál es la capacidad aproximada del local?',
    help: 'Cantidad de personas cuando está lleno.',
    options: [
      { value: 'lt50', label: 'Menos de 50 personas' },
      { value: '50_150', label: '50 a 150' },
      { value: '150_400', label: '150 a 400' },
      { value: '400_800', label: '400 a 800' },
      { value: 'gt800', label: 'Más de 800' }
    ]
  },
  {
    id: 'n28', type: 'radio', required: true,
    title: 'En promedio, ¿cuánto gasta un cliente en una visita?',
    help: 'Consumo por persona, un aproximado.',
    options: [
      { value: 'lt500', label: 'Menos de RD$500' },
      { value: '500_1500', label: 'RD$500 a 1,500' },
      { value: '1500_3000', label: 'RD$1,500 a 3,000' },
      { value: '3000_6000', label: 'RD$3,000 a 6,000' },
      { value: 'gt6000', label: 'Más de RD$6,000' },
      { value: 'no_decir', label: 'Prefiero no decir' }
    ]
  },
  {
    id: 'n4', type: 'radio', required: true,
    title: '¿Cuánto tiempo lleva operando?',
    options: [
      { value: 'lt1', label: 'Menos de 1 año' },
      { value: '1_3', label: '1 a 3 años' },
      { value: '3_7', label: '3 a 7 años' },
      { value: 'gt7', label: 'Más de 7 años' }
    ]
  },
  {
    id: 'n5', type: 'radio', required: true,
    title: '¿Cuál es tu rol en el negocio?',
    options: [
      { value: 'dueno', label: 'Dueño o socio' },
      { value: 'gerente', label: 'Gerente general' },
      { value: 'encargado', label: 'Encargado de reservas o de piso' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },

  /* ---------- Bloque 2 · Operación ---------- */
  {
    id: 'n6', type: 'checkbox', required: true, rotate: true,
    title: '¿Cómo gestionan hoy la llegada de clientes, sea por reserva o por entrada?',
    options: [
      { value: 'telefono', label: 'Teléfono' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'instagram', label: 'Instagram o mensajes directos' },
      { value: 'web', label: 'Página web o formulario' },
      { value: 'plataforma', label: 'Plataforma de reservas' },
      { value: 'presencial', label: 'En persona / walk-ins' },
      { value: 'ninguno', label: 'No manejamos reservas', exclusive: true },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'n7', type: 'radio', required: true,
    title: 'En un fin de semana típico, ¿cuántas reservas o solicitudes reciben?',
    help: 'Un aproximado está bien.',
    options: [
      { value: '0', label: 'Ninguna' },
      { value: '1_10', label: '1 a 10' },
      { value: '11_30', label: '11 a 30' },
      { value: '31_75', label: '31 a 75' },
      { value: '76_150', label: '76 a 150' },
      { value: 'gt150', label: 'Más de 150' },
      { value: 'no_se', label: 'No llevamos la cuenta' }
    ]
  },
  {
    id: 'n8', type: 'radio', required: true,
    title: '¿Qué tan predecible es ese flujo de una semana a otra?',
    options: [
      { value: 'muy_estable', label: 'Muy estable' },
      { value: 'algo_estable', label: 'Algo estable' },
      { value: 'variable', label: 'Variable' },
      { value: 'impredecible', label: 'Muy impredecible' }
    ]
  },
  {
    id: 'n9', type: 'radio', required: true,
    title: '¿Tienen un sistema para gestionar las reservas?',
    options: [
      { value: 'software', label: 'Sí, un software o plataforma', other: true },
      { value: 'manual', label: 'Sí, agenda manual o cuaderno' },
      { value: 'no', label: 'No, lo llevamos por WhatsApp y memoria' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },

  /* ---------- Bloque 3 · Best-worst en funcionalidades ----------
   * Pedir la mejor Y la peor discrimina mucho más que "elige 3":
   * al restar frecuencias sale un ranking con distancias reales. */
  {
    id: 'n10a', type: 'radio', required: true, rotate: true, bestWorst: 'mejor',
    title: 'De estas funcionalidades, ¿cuál sería la MÁS importante para tu negocio?',
    help: 'Solo una. La que de verdad te resolvería el día a día.',
    options: FUNCIONALIDADES
  },
  {
    id: 'n10b', type: 'radio', required: true, rotate: true, bestWorst: 'peor', excluirDe: 'n10a',
    title: '¿Y cuál sería la MENOS importante?',
    help: 'La que menos falta te hace.',
    options: FUNCIONALIDADES
  },

  /* ---------- Bloque 4 · Fricción ---------- */
  {
    id: 'n11', type: 'radio', required: true,
    title: '¿Con qué frecuencia reciben cancelaciones o gente que no se presenta?',
    options: [
      { value: 'casi_nunca', label: 'Casi nunca' },
      { value: 'rara_vez', label: 'Rara vez, menos del 5%' },
      { value: 'ocasional', label: 'Ocasionalmente, entre 5% y 15%' },
      { value: 'frecuente', label: 'Frecuente, entre 15% y 30%' },
      { value: 'muy_frecuente', label: 'Muy frecuente, más del 30%' }
    ]
  },
  {
    id: 'n12', type: 'checkbox', required: true, rotate: true,
    title: '¿Hacen algo para reducir las no presentaciones?',
    options: [
      { value: 'deposito', label: 'Depósito o pago anticipado' },
      { value: 'recordatorio', label: 'Recordatorios automáticos' },
      { value: 'penalizacion', label: 'Política de cancelación con penalización' },
      { value: 'confirmacion', label: 'Confirmación previa por WhatsApp' },
      { value: 'nada', label: 'No hacemos nada', exclusive: true },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'n13', type: 'radio', required: true, rotate: true,
    title: '¿Cómo gestionan los picos de afluencia, como fines de semana o eventos?',
    options: [
      { value: 'personal', label: 'Aumentamos personal u horario' },
      { value: 'limitar', label: 'Limitamos reservas o trabajamos por turnos' },
      { value: 'espera', label: 'Usamos lista de espera' },
      { value: 'nada', label: 'No hacemos ajustes especiales' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'n14', type: 'radio', required: true,
    title: '¿Qué tan satisfechos están con su sistema actual de gestión de clientes y reservas?',
    options: [
      { value: '1', label: 'Muy insatisfecho' },
      { value: '2', label: 'Algo insatisfecho' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Satisfecho' },
      { value: '5', label: 'Muy satisfecho' }
    ]
  },

  /* ---------- Control de atención ---------- */
  {
    id: 'nAtt', type: 'radio', required: true, atencion: 'algo_deacuerdo',
    title: 'Para confirmar que las respuestas se están registrando bien, marca «Algo de acuerdo» en esta pregunta.',
    options: [
      { value: 'muy_deacuerdo', label: 'Muy de acuerdo' },
      { value: 'algo_deacuerdo', label: 'Algo de acuerdo' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'algo_desacuerdo', label: 'Algo en desacuerdo' },
      { value: 'muy_desacuerdo', label: 'Muy en desacuerdo' }
    ]
  },

  /* ---------- Bloque 5 · La fricción en tus palabras ---------- */
  {
    id: 'n15', type: 'longtext', required: true,
    title: '¿Cuál es la parte más pesada de gestionar reservas, eventos y clientes hoy?',
    help: 'Escríbelo con tus palabras. Nos interesa lo que de verdad te quita tiempo o te da dolor de cabeza.',
    placeholder: 'Por ejemplo: los fines de semana entran tantos mensajes que…'
  },
  {
    id: 'n16', type: 'radio', required: true,
    title: '¿Han perdido clientes por no responder a tiempo un mensaje de WhatsApp o Instagram?',
    options: [
      { value: 'nunca', label: 'Nunca' },
      { value: 'rara_vez', label: 'Rara vez' },
      { value: 'a_veces', label: 'A veces' },
      { value: 'frecuente', label: 'Frecuentemente' },
      { value: 'no_se', label: 'No sabría decir' }
    ]
  },

  /* ---------- Bloque 6 · Captación ---------- */
  {
    id: 'n17', type: 'checkbox', required: true, rotate: true,
    title: 'Cuando tienen un evento o una buena noche, ¿cómo lo comunican?',
    options: [
      { value: 'instagram', label: 'Instagram, en posts o historias' },
      { value: 'whatsapp', label: 'Estados o difusión de WhatsApp' },
      { value: 'flyers', label: 'Flyers físicos' },
      { value: 'promotores', label: 'Promotores' },
      { value: 'radio_tv', label: 'Radio o televisión' },
      { value: 'base_datos', label: 'Base de datos de clientes' },
      { value: 'nada', label: 'No hacemos nada en particular', exclusive: true },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'n18', type: 'radio', required: true,
    title: 'Aproximadamente, ¿cuánto invierten al mes en atraer clientes?',
    help: 'Publicidad en redes, promotores, fotografía o video, artistas, sistemas. Un rango basta.',
    options: [
      { value: 'nada', label: 'Nada' },
      { value: 'lt10k', label: 'Menos de RD$10,000' },
      { value: '10_30k', label: 'RD$10,000 a 30,000' },
      { value: '30_75k', label: 'RD$30,000 a 75,000' },
      { value: '75_150k', label: 'RD$75,000 a 150,000' },
      { value: 'gt150k', label: 'Más de RD$150,000' },
      { value: 'no_decir', label: 'Prefiero no decir' }
    ]
  },
  {
    id: 'n19', type: 'radio', required: false, rotate: true,
    title: '¿En qué se va la mayor parte de esa inversión?',
    showIf: (a) => a.n18 && a.n18.value !== 'nada' && a.n18.value !== 'no_decir',
    options: [
      { value: 'ads', label: 'Publicidad en redes sociales' },
      { value: 'promotores', label: 'Promotores' },
      { value: 'contenido', label: 'Contenido, foto y video' },
      { value: 'artistas', label: 'Artistas o DJs' },
      { value: 'software', label: 'Sistemas o software' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },

  /* ---------- Bloque 7 · Modelo y precio ---------- */
  {
    id: 'n20', type: 'radio', required: true, rotate: true,
    title: 'Si una herramienta les llenara mesas de forma comprobable, ¿qué modelo de cobro preferirían?',
    help: 'Comprobable quiere decir con números medibles, no promesas.',
    options: [
      { value: 'mensualidad', label: 'Mensualidad fija' },
      { value: 'comision', label: 'Comisión por reserva concretada' },
      { value: 'resultados', label: 'Pago solo por resultados' },
      { value: 'freemium', label: 'Gratis con funciones limitadas y pago por extras' },
      { value: 'nada', label: 'No pagaríamos nada', exclusive: true }
    ]
  },

  /* ---------- Van Westendorp ----------
   * Misma escalera en las cuatro, sin rotar. Solo a quien no descartó pagar. */
  {
    id: 'nvw1', type: 'radio', required: true, vw: 1,
    title: '¿A qué precio mensual les parecería tan bajo que dudarían de la calidad del servicio?',
    help: 'Ahora vienen 4 preguntas cortas sobre el mismo precio, vistas desde ángulos distintos. Es la parte que más nos sirve. · 1 de 4',
    showIf: (a) => a.n20 && a.n20.value !== 'nada',
    options: ESCALERA_MENSUAL
  },
  {
    id: 'nvw2', type: 'radio', required: true, vw: 2,
    title: '¿A qué precio mensual les parecería una buena inversión?',
    help: '2 de 4',
    showIf: (a) => a.n20 && a.n20.value !== 'nada',
    options: ESCALERA_MENSUAL
  },
  {
    id: 'nvw3', type: 'radio', required: true, vw: 3,
    title: '¿A qué precio mensual les empezaría a parecer caro, pero aún lo evaluarían?',
    help: '3 de 4',
    showIf: (a) => a.n20 && a.n20.value !== 'nada',
    options: ESCALERA_MENSUAL
  },
  {
    id: 'nvw4', type: 'radio', required: true, vw: 4,
    title: '¿A qué precio mensual les parecería tan caro que ni lo considerarían?',
    help: 'Última de precio · 4 de 4',
    showIf: (a) => a.n20 && a.n20.value !== 'nada',
    options: ESCALERA_MENSUAL
  },

  /* ---------- Bloque 8 · Intención ---------- */
  {
    id: 'n22', type: 'radio', required: true,
    title: '¿Estarían interesados en evaluar soluciones nuevas para gestionar reservas y flujo de clientes?',
    options: [
      { value: 'muy', label: 'Sí, muy interesados' },
      { value: 'algo', label: 'Sí, algo interesados' },
      { value: 'tal_vez', label: 'Tal vez, necesito más información' },
      { value: 'no', label: 'No' }
    ]
  },
  {
    id: 'n23', type: 'radio', required: true, rotate: true,
    title: '¿Qué factor sería decisivo para adoptar una solución nueva?',
    options: [
      { value: 'costo', label: 'El costo' },
      { value: 'facilidad', label: 'Facilidad de uso e implementación' },
      { value: 'integracion', label: 'Que se integre con lo que ya usamos' },
      { value: 'soporte', label: 'Soporte y capacitación' },
      { value: 'resultados', label: 'Resultados medibles' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'n24', type: 'radio', required: true, juster: true,
    title: 'Si esa herramienta estuviera disponible hoy con prueba gratis, ¿qué tan probable es que la prueben en los próximos 3 meses?',
    help: 'Sé honesto: cero es ninguna posibilidad y diez es prácticamente seguro.',
    options: [
      { value: '10', label: '10 · Prácticamente seguro' },
      { value: '9', label: '9 · Casi seguro' },
      { value: '8', label: '8 · Muy probable' },
      { value: '7', label: '7 · Bastante probable' },
      { value: '6', label: '6 · Buena posibilidad' },
      { value: '5', label: '5 · Posibilidad media' },
      { value: '4', label: '4 · Posibilidad moderada' },
      { value: '3', label: '3 · Alguna posibilidad' },
      { value: '2', label: '2 · Poca posibilidad' },
      { value: '1', label: '1 · Muy poca posibilidad' },
      { value: '0', label: '0 · Ninguna posibilidad' }
    ]
  },

  /* ---------- Bloque 9 · Cierre ---------- */
  {
    id: 'n25', type: 'longtext', required: false,
    title: '¿Qué necesitarían ver para confiar en una herramienta así?',
    help: 'Opcional, pero es de lo más útil que nos puedes dejar.',
    placeholder: '¿Qué te haría decir que sí, o qué te haría desconfiar?'
  },
  {
    id: 'n26', type: 'radio', required: true,
    title: '¿Deseas que te contactemos con más información o una demostración?',
    help: 'Hasta aquí la encuesta es totalmente anónima. Solo si respondes que sí te pediremos datos.',
    options: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No, gracias' }
    ]
  },
  {
    id: 'n27', type: 'contact', required: false,
    title: '¿A dónde te escribimos?',
    help: 'Solo lo usamos para escribirte sobre este estudio. No lo compartimos con nadie y puedes pedir que lo borremos cuando quieras.',
    showIf: (a) => a.n26 && a.n26.value === 'si',
    fields: [
      { key: 'nombre', label: 'Tu nombre', placeholder: 'Solo tu primer nombre', autocomplete: 'given-name' },
      { key: 'negocio', label: 'Nombre del negocio', placeholder: 'Cómo se llama el local', autocomplete: 'organization' },
      { key: 'telefono', label: 'Teléfono o WhatsApp', type: 'tel', placeholder: '809 000 0000', autocomplete: 'tel' },
      { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com', autocomplete: 'email' }
    ]
  }
];
