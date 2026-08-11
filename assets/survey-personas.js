/* Encuesta a personas · v4
 *
 * Instrumentos aplicados:
 *   - Van Westendorp (pvw1-pvw4) para el rango de precio aceptable
 *   - Escala Juster (p24) para intención calibrada en probabilidad
 *   - Pregunta trampa de atención (pAtt)
 *   - rotate:true rota el orden de las opciones; las exclusivas y las de "Otro"
 *     quedan ancladas al final. Nunca se rota una escala: el orden es el dato.
 */

/* Escalera de precios compartida por las cuatro preguntas de Van Westendorp.
 * Tiene que ser idéntica en las cuatro para que el cruce de curvas funcione. */
/* El techo anterior (RD$1,000) se llenó: dos de las tres primeras respuestas
 * lo eligieron para varias preguntas seguidas, lo que censura el dato y hace
 * imposible calcular el óptimo. Se sube el techo y se dan más pasos arriba. */
var ESCALERA_PRECIO = [
  { value: '25', label: 'RD$25' },
  { value: '50', label: 'RD$50' },
  { value: '100', label: 'RD$100' },
  { value: '200', label: 'RD$200' },
  { value: '350', label: 'RD$350' },
  { value: '600', label: 'RD$600' },
  { value: '1000', label: 'RD$1,000' },
  { value: '1800', label: 'RD$1,800' },
  { value: '3000', label: 'RD$3,000 o más' }
];

window.PREGUNTAS_PERSONAS = [

  /* ---------- Bloque 1 · Hábito ---------- */
  {
    id: 'p1', type: 'radio', required: true,
    title: 'Cuando decides salir, ¿qué tipo de plan haces con más frecuencia?',
    options: [
      { value: 'tranquilo', label: 'Plan tranquilo: cena, compartir, algo relajado' },
      { value: 'nocturno', label: 'Plan social o nocturno: bares, discotecas, eventos' },
      { value: 'mezcla', label: 'Una mezcla de ambos' }
    ]
  },
  {
    id: 'p2', type: 'radio', required: true,
    title: '¿Con qué frecuencia sales a socializar?',
    options: [
      { value: 'sem_2_3', label: '2 o 3 veces por semana, o más' },
      { value: 'sem_1', label: '1 vez por semana' },
      { value: 'mes_1_2', label: '1 o 2 veces al mes' },
      { value: 'casi_nunca', label: 'Casi nunca' }
    ]
  },
  {
    id: 'p3', type: 'radio', required: true, rotate: true,
    title: '¿Con quién sueles salir la mayoría de las veces?',
    options: [
      { value: 'pareja', label: 'Pareja' },
      { value: 'amigos', label: 'Amigos' },
      { value: 'familia', label: 'Familia' },
      { value: 'solo', label: 'Solo' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'p4', type: 'radio', required: true,
    title: '¿De cuántas personas suele ser el grupo?',
    options: [
      { value: '1', label: 'Solo yo' },
      { value: '2', label: '2 personas' },
      { value: '3_4', label: '3 o 4' },
      { value: '5_8', label: '5 a 8' },
      { value: 'gt8', label: 'Más de 8' }
    ]
  },
  {
    id: 'p5', type: 'radio', required: true,
    title: '¿Con cuánta anticipación planificas una salida?',
    options: [
      { value: 'mismo_dia_sobre_marcha', label: 'El mismo día, sobre la marcha' },
      { value: 'mismo_dia_horas', label: 'El mismo día, con horas de antelación' },
      { value: 'dia_antes', label: 'Un día antes' },
      { value: 'varios_dias', label: 'Varios días antes' },
      { value: 'semana', label: 'Una semana o más' }
    ]
  },

  /* ---------- Bloque 2 · Decisión ---------- */
  {
    id: 'p6', type: 'checkbox', required: true, rotate: true,
    title: 'La última vez que saliste, ¿cómo decidiste a dónde ir?',
    help: 'Marca todo lo que aplique.',
    options: [
      { value: 'amigos', label: 'Recomendación de amigos' },
      { value: 'redes', label: 'Redes sociales, Instagram o TikTok' },
      { value: 'whatsapp', label: 'Grupo de WhatsApp' },
      { value: 'ya_sabia', label: 'Ya tenía el lugar en mente' },
      { value: 'google', label: 'Google o mapas' },
      { value: 'invitado', label: 'Fui a donde me invitaron' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'p7', type: 'radio', required: true,
    title: '¿Cuánto tiempo te toma normalmente decidir a dónde ir?',
    options: [
      { value: 'lt5', label: 'Menos de 5 minutos' },
      { value: '5_15', label: 'Entre 5 y 15 minutos' },
      { value: '15_30', label: 'Entre 15 y 30 minutos' },
      { value: 'gt30', label: 'Más de 30 minutos' }
    ]
  },
  {
    id: 'p8', type: 'radio', required: true, rotate: true,
    title: '¿Qué factor pesa más al elegir el lugar?',
    options: [
      { value: 'ambiente', label: 'El ambiente y la gente' },
      { value: 'precio', label: 'El precio' },
      { value: 'ubicacion', label: 'La ubicación' },
      { value: 'resenas', label: 'Las opiniones o reseñas' },
      { value: 'seguridad', label: 'La seguridad' },
      { value: 'disponibilidad', label: 'Que haya espacio o disponibilidad' }
    ]
  },
  {
    id: 'p9', type: 'radio', required: true,
    title: '¿Qué tan difícil te resulta encontrar un lugar que realmente te convenza?',
    options: [
      { value: 'muy_facil', label: 'Muy fácil' },
      { value: 'algo_facil', label: 'Algo fácil' },
      { value: 'algo_dificil', label: 'Algo difícil' },
      { value: 'muy_dificil', label: 'Muy difícil' }
    ]
  },

  /* ---------- Bloque 3 · Fricción ---------- */
  {
    id: 'p10', type: 'radio', required: true,
    title: '¿Te ha pasado llegar a un lugar y que no esté como esperabas?',
    help: 'El ambiente, la gente, o que no hubiera espacio.',
    options: [
      { value: 'nunca', label: 'Nunca' },
      { value: 'rara_vez', label: 'Rara vez' },
      { value: 'a_veces', label: 'A veces' },
      { value: 'frecuente', label: 'Frecuentemente' }
    ]
  },
  {
    id: 'p11', type: 'radio', required: true,
    title: 'Cuando eso pasa, ¿qué haces normalmente?',
    showIf: (a) => a.p10 && a.p10.value !== 'nunca',
    options: [
      { value: 'me_quedo', label: 'Me quedo igual' },
      { value: 'me_voy', label: 'Me voy a otro lugar' },
      { value: 'se_arruina', label: 'Se arruina el plan' },
      { value: 'depende', label: 'Depende' }
    ]
  },
  {
    id: 'p12', type: 'radio', required: true,
    title: '¿Has intentado asegurar tu entrada o mesa antes de salir?',
    options: [
      { value: 'frecuente', label: 'Sí, frecuentemente' },
      { value: 'algunas', label: 'Algunas veces' },
      { value: 'nunca', label: 'Nunca' }
    ]
  },
  {
    id: 'p13', type: 'checkbox', required: true, rotate: true,
    title: '¿Cómo lo haces normalmente?',
    help: 'Marca todo lo que aplique.',
    showIf: (a) => a.p12 && a.p12.value !== 'nunca',
    options: [
      { value: 'llamando', label: 'Llamando' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'instagram', label: 'Instagram, por mensaje directo' },
      { value: 'temprano', label: 'Llegando temprano' },
      { value: 'app', label: 'Por una app o página web' },
      { value: 'promotor', label: 'A través de un promotor' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },
  {
    id: 'p14', type: 'radio', required: true,
    title: '¿Qué tan frustrante te resulta ese proceso?',
    showIf: (a) => a.p12 && a.p12.value !== 'nunca',
    options: [
      { value: 'nada', label: 'Nada frustrante' },
      { value: 'poco', label: 'Poco frustrante' },
      { value: 'algo', label: 'Algo frustrante' },
      { value: 'muy', label: 'Muy frustrante' }
    ]
  },

  /* ---------- Bloque 4 · La fricción en tus palabras ----------
   * Única abierta de la primera mitad, y llega justo cuando el tema
   * de la frustración ya está abierto en la cabeza del que responde. */
  /* Antes era pregunta abierta. Las opciones de abajo NO son inventadas:
   * salen de agrupar las 19 respuestas escritas que ya recogimos. Por eso
   * se cierra ahora y no antes — primero había que saber qué contestaba
   * la gente para poder ofrecerle la lista correcta. */
  {
    id: 'p16', type: 'radio', required: true, rotate: true,
    title: '¿Qué es lo más frustrante al momento de decidir a dónde ir?',
    help: 'Elige lo que más te pasa a ti.',
    options: [
      { value: 'acuerdo', label: 'Ponernos de acuerdo entre todos' },
      { value: 'sin_mesa', label: 'Llegar y que no haya mesa o espacio' },
      { value: 'ambiente_incierto', label: 'No saber cómo va a estar el ambiente esa noche' },
      { value: 'fotos', label: 'Que el lugar no sea como se veía en las fotos' },
      { value: 'que_coincida', label: 'Que coincidan buena comida, buen ambiente y buen servicio' },
      { value: 'tiempo', label: 'Buscar y comparar opciones me toma mucho tiempo' },
      { value: 'precio', label: 'No saber cuánto voy a terminar gastando' },
      { value: 'nada', label: 'Nada, la verdad no me resulta frustrante', exclusive: true },
      { value: 'otro', label: 'Otra cosa', other: true }
    ]
  },
  {
    id: 'p18', type: 'radio', required: true, rotate: true,
    title: '¿Qué es lo que más te arruina una salida cuando falla?',
    options: [
      { value: 'ambiente', label: 'Que el ambiente no sea el que esperaba' },
      { value: 'esperas', label: 'Las filas y las esperas' },
      { value: 'sin_espacio', label: 'Llegar y que no haya espacio' },
      { value: 'precio', label: 'Que salga más caro de lo que pensaba' },
      { value: 'musica', label: 'Que la música o el sonido estén mal' },
      { value: 'servicio', label: 'Que el servicio sea lento o malo' },
      { value: 'seguridad', label: 'No sentirme seguro' },
      { value: 'otro', label: 'Otro', other: true }
    ]
  },

  /* ---------- Control de atención ----------
   * Va camuflada entre escalas del mismo formato, a media encuesta. */
  {
    id: 'pAtt', type: 'radio', required: true, atencion: 'rara_vez',
    title: 'Para confirmar que las respuestas se están registrando bien, marca «Rara vez» en esta pregunta.',
    options: [
      { value: 'siempre', label: 'Siempre' },
      { value: 'frecuente', label: 'Frecuentemente' },
      { value: 'a_veces', label: 'A veces' },
      { value: 'rara_vez', label: 'Rara vez' },
      { value: 'nunca', label: 'Nunca' }
    ]
  },

  /* ---------- Bloque 5 · Dinero ---------- */
  {
    id: 'p20', type: 'radio', required: true,
    title: '¿Has pagado alguna vez por asegurar tu entrada o mesa antes de llegar?',
    help: 'Cover anticipado, boleta online, consumo mínimo, reserva con depósito.',
    options: [
      { value: 'varias', label: 'Sí, varias veces' },
      { value: 'alguna', label: 'Alguna vez' },
      { value: 'nunca', label: 'Nunca' }
    ]
  },
  {
    id: 'p21', type: 'radio', required: true,
    title: 'En una salida típica, ¿cuánto gastas aproximadamente por persona?',
    options: [
      { value: 'lt1k', label: 'Menos de RD$1,000' },
      { value: '1_2.5k', label: 'RD$1,000 a 2,500' },
      { value: '2.5_5k', label: 'RD$2,500 a 5,000' },
      { value: '5_10k', label: 'RD$5,000 a 10,000' },
      { value: 'gt10k', label: 'Más de RD$10,000' },
      { value: 'no_decir', label: 'Prefiero no decir' }
    ]
  },
  {
    id: 'p22', type: 'radio', required: true,
    title: 'Si al reservar, tu lugar quedara garantizado al instante, ¿considerarías pagar un cargo por el servicio?',
    help: 'Sin filas y sin tener que escribirle a nadie.',
    options: [
      { value: 'si', label: 'Sí, lo consideraría' },
      { value: 'depende', label: 'Depende del lugar o del evento' },
      { value: 'no', label: 'No pagaría nada, nunca' }
    ]
  },

  /* ---------- Van Westendorp ----------
   * Las cuatro usan la misma escalera y NO se rotan: el orden es el dato.
   * Solo se muestran a quien no descartó pagar. */
  {
    id: 'pvw1', type: 'radio', required: true, vw: 1,
    title: '¿Qué precio te parecería tan barato que sospecharías que no va a funcionar?',
    help: 'Imagina esto: desde el celular apartas tu mesa en el lugar que quieres, y cuando llegas está lista. Sin llamar, sin escribirle a nadie, sin fila. Te vamos a preguntar el precio de 4 formas distintas. · 1 de 4',
    showIf: (a) => a.p22 && a.p22.value !== 'no',
    options: ESCALERA_PRECIO
  },
  {
    id: 'pvw2', type: 'radio', required: true, vw: 2,
    title: '¿Qué precio te parecería una ganga por eso?',
    help: 'Barato, pero sin que te haga dudar. · 2 de 4',
    showIf: (a) => a.p22 && a.p22.value !== 'no',
    options: ESCALERA_PRECIO
  },
  {
    id: 'pvw3', type: 'radio', required: true, vw: 3,
    title: '¿De qué precio en adelante te parecería caro, aunque igual lo pensarías?',
    help: 'Caro, pero todavía lo considerarías. · 3 de 4',
    showIf: (a) => a.p22 && a.p22.value !== 'no',
    options: ESCALERA_PRECIO
  },
  {
    id: 'pvw4', type: 'radio', required: true, vw: 4,
    title: '¿De qué precio en adelante dirías que es demasiado y no lo pagas?',
    help: 'Ahí ya te sales. · Última de precio · 4 de 4',
    showIf: (a) => a.p22 && a.p22.value !== 'no',
    options: ESCALERA_PRECIO
  },

  /* ---------- Bloque 6 · Intención ---------- */
  {
    id: 'p23', type: 'radio', required: true,
    title: 'Si existiera una forma de saber en tiempo real cómo está un lugar antes de salir, ¿qué tan útil te parecería?',
    help: 'Saber el ambiente y el movimiento sin tener que ir a averiguarlo.',
    options: [
      { value: 'nada', label: 'Nada útil' },
      { value: 'poco', label: 'Poco útil' },
      { value: 'util', label: 'Útil' },
      { value: 'muy', label: 'Muy útil' }
    ]
  },
  {
    id: 'p24', type: 'radio', required: true, juster: true,
    title: 'Si esa app existiera hoy, ¿qué tan probable es que la uses en tu próxima salida?',
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

  /* ---------- Bloque 7 · El proceso ----------
   * También era abierta. Los pasos de abajo son los que aparecieron en las
   * respuestas escritas: Instagram, revisar menú y precios, leer reseñas,
   * cuadrar con el grupo, llamar para apartar. */
  {
    id: 'p15', type: 'checkbox', required: true, rotate: true,
    title: 'Antes de salir a un lugar, ¿qué sueles hacer?',
    help: 'Marca todo lo que aplique.',
    options: [
      { value: 'redes', label: 'Busco el lugar en Instagram o TikTok' },
      { value: 'menu', label: 'Reviso el menú y los precios' },
      { value: 'resenas', label: 'Leo reseñas u opiniones' },
      { value: 'grupo', label: 'Le escribo al grupo para ponernos de acuerdo' },
      { value: 'apartar', label: 'Llamo o escribo al lugar para apartar' },
      { value: 'evento', label: 'Reviso si hay evento o algo especial ese día' },
      { value: 'ubicacion', label: 'Miro dónde queda y cómo llegar' },
      { value: 'nada', label: 'Nada, ya sé a dónde voy y llego', exclusive: true },
      { value: 'otro', label: 'Otra cosa', other: true }
    ]
  },

  /* ---------- Bloque 8 · Segmentación ---------- */
  {
    id: 'p25', type: 'radio', required: true,
    title: '¿En qué ciudad vives?',
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
    id: 'p30', type: 'radio', required: true,
    title: '¿Vives en el país o estás de visita?',
    help: 'Un turista y un residente eligen de forma muy distinta.',
    options: [
      { value: 'residente', label: 'Vivo en República Dominicana' },
      { value: 'diaspora', label: 'Soy dominicano pero vivo fuera' },
      { value: 'turista', label: 'Estoy de visita' }
    ]
  },
  {
    id: 'p26', type: 'radio', required: true,
    title: '¿Qué edad tienes?',
    options: [
      { value: '18_25', label: '18 a 25' },
      { value: '26_33', label: '26 a 33' },
      { value: '34_41', label: '34 a 41' },
      { value: '42_49', label: '42 a 49' },
      { value: '50+', label: '50 o más' }
    ]
  },
  {
    id: 'p27', type: 'radio', required: true,
    title: 'Sexo',
    options: [
      { value: 'm', label: 'Masculino' },
      { value: 'f', label: 'Femenino' },
      { value: 'nd', label: 'Prefiero no decirlo' }
    ]
  },
  /* Única abierta que queda: opcional, corta y al final. Es la válvula
   * para que aparezca algo que no se nos ocurrió poner en ninguna lista. */
  {
    id: 'p31', type: 'longtext', required: false,
    title: '¿Hay algo más que quieras decirnos?',
    help: 'Opcional. Si algo no te preguntamos y crees que importa, aquí es.',
    placeholder: 'Escribe con toda confianza, o salta esta pregunta.'
  },
  {
    id: 'p28', type: 'radio', required: true,
    title: '¿Te gustaría probar nuevas formas de encontrar y organizar tus salidas?',
    options: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' }
    ]
  },
  {
    id: 'p29', type: 'contact', required: false,
    title: 'Déjanos tu contacto si quieres ser de los primeros en probarlo',
    help: 'Totalmente opcional. Hasta aquí tu encuesta es anónima. Solo lo usamos para avisarte, no lo compartimos con nadie y puedes pedir que lo borremos cuando quieras.',
    showIf: (a) => a.p28 && a.p28.value === 'si',
    fields: [
      { key: 'nombre', label: 'Tu nombre', placeholder: 'Como te llamamos', autocomplete: 'given-name' },
      { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com', autocomplete: 'email' },
      { key: 'telefono', label: 'Teléfono o WhatsApp', type: 'tel', placeholder: '809 000 0000', autocomplete: 'tel' }
    ]
  }
];
