/* KORVEX SURVEY — configuración
 *
 * Sustituye los dos valores de abajo por los de tu proyecto de Supabase.
 * Los encuentras en:  Supabase → Project Settings → API
 *
 *   SUPABASE_URL       →  "Project URL"
 *   SUPABASE_ANON_KEY  →  "anon" / "publishable" key
 *
 * La clave anon es PÚBLICA por diseño: está pensada para vivir en el navegador
 * y no da acceso a leer datos. Lo que protege la base es la política RLS
 * definida en supabase/schema.sql, que solo permite insertar y completar
 * respuestas — nunca leerlas ni modificarlas una vez enviadas.
 *
 * Mientras estos valores tengan los placeholders, la encuesta funciona igual
 * pero no guarda nada: útil para revisar el diseño antes de conectar la base.
 */

window.KORVEX_CONFIG = {
  SUPABASE_URL: 'https://mgtxlzkvkfdodrtqpyxe.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_Ffmj7P0D16Sk3Kudofo_jg_1A7sUsBt'
};
