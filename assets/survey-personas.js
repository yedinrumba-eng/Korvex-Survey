/* Encuesta B — PERSONAS · v3
 * Fuente: APP-SOCIAL-DESCUBRE/ENCUESTAS_V3_FINAL.md
 * Regla de encuesta ciega: no se menciona el producto, su nombre ni sus funciones. */

window.PREGUNTAS_PERSONAS = [

  /* ---------- Bloque 1 · Contexto ---------- */
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
    id: 'p3', type: 'radio', required: true,
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

  /* ---------- Bloque 2 · Comportamiento real ---------- */
  {
    id: 'p6', type: 'checkbox', required: true,
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
    id: 'p8', type: 'radio', required: true,
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

  /* ---------- Bloque 3 · Reservas ---------- */
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
    id: 'p13', type: 'checkbox', required: true,
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

  /* ---------- Bloque 4 · Profundidad ---------- */
  {
    id: 'p15', type: 'longtext', required: true,
    title: 'Cuéntanos paso a paso qué haces antes de salir a algún lugar.',
    help: 'Desde que te nace la idea hasta que llegas. Mientras más detalle, mejor.',
    placeholder: 'Normalmente empiezo por…'
  },
  {
    id: 'p16', type: 'longtext', required: true,
    title: '¿Qué es lo más frustrante al momento de decidir a dónde ir?',
    placeholder: 'Lo que más me molesta es…'
  },
  {
    id: 'p17', type: 'longtext', required: false,
    title: 'Describe una ocasión donde el plan no salió como esperabas. ¿Qué pasó?',
    placeholder: 'Una vez fuimos a…'
  },
  {
    id: 'p18', type: 'longtext', required: false,
    title: '¿Qué tendría que pasar para que una salida sea perfecta para ti?',
    placeholder: 'Para mí sería perfecta si…'
  },
  {
    id: 'p19', type: 'longtext', required: false,
    title: 'Si pudieras cambiar algo de cómo eliges lugares hoy, ¿qué cambiarías?',
    placeholder: 'Cambiaría que…'
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
    title: 'Si al reservar tu lugar quedara garantizado al instante, ¿aceptarías un pequeño cargo de servicio?',
    help: 'Sin filas y sin tener que escribirle a nadie.',
    options: [
      { value: 'nada', label: 'No pagaría nada' },
      { value: 'lt100', label: 'Hasta RD$100' },
      { value: '100_250', label: 'RD$100 a 250' },
      { value: '250_500', label: 'RD$250 a 500' },
      { value: 'depende', label: 'Depende del lugar o del evento' }
    ]
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
    id: 'p24', type: 'radio', required: true,
    title: 'Si además pudieras asegurar tu entrada o mesa desde el celular, sin llamar ni escribir, ¿la usarías?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'tal_vez', label: 'Tal vez' },
      { value: 'si', label: 'Sí' }
    ]
  },

  /* ---------- Bloque 7 · Segmentación ---------- */
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

  /* ---------- Cierre ---------- */
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
