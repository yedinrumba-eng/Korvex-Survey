-- ============================================================
-- KORVEX SURVEY — esquema de base de datos
-- Ya está aplicado en el proyecto Supabase "Survey".
-- Este archivo es la copia versionada, por si hay que recrearlo.
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- Es idempotente: se puede correr más de una vez.
-- ============================================================

-- ---------- Tabla principal ----------

create table if not exists public.survey_responses (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null unique,
  survey_type         text not null check (survey_type in ('negocios', 'personas')),

  -- Respuestas completas en formato JSON.
  -- Estructura por pregunta:
  --   radio     → { "value": "sd", "label": "Santo Domingo", "other": "..." }
  --   checkbox  → { "selected": ["whatsapp","telefono"], "labels": [...], "other": "..." }
  --   texto     → "texto libre del encuestado"
  --   contacto  → { "nombre": "...", "email": "...", "telefono": "..." }
  answers             jsonb not null default '{}'::jsonb,

  completed           boolean not null default false,
  last_question_id    text,
  last_question_index int default 0,
  total_questions     int,
  skipped_optional    int default 0,

  -- Metadata capturada automáticamente
  source              text,          -- de ?src= en la URL
  campaign            text,
  referrer            text,
  device_type         text,          -- movil | tablet | escritorio
  user_agent          text,
  language            text,
  screen              text,
  timezone            text,

  started_at          timestamptz not null default now(),
  submitted_at        timestamptz,
  duration_seconds    int,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_sr_type      on public.survey_responses (survey_type);
create index if not exists idx_sr_completed on public.survey_responses (completed);
create index if not exists idx_sr_source    on public.survey_responses (source);
create index if not exists idx_sr_created   on public.survey_responses (created_at desc);
create index if not exists idx_sr_answers   on public.survey_responses using gin (answers);

alter table public.survey_responses enable row level security;


-- ---------- Seguridad ----------
--
-- El navegador NO tiene ningún permiso sobre la tabla. Su única puerta de
-- entrada es la función guardar_respuesta, que corre con permisos de dueño
-- (security definer) y valida todo lo que entra.
--
-- Con la clave pública NO se puede:
--   · leer respuestas          · borrar filas
--   · insertar en la tabla     · modificar una respuesta ya enviada
--
-- Nota de diseño: la primera versión daba permiso de INSERT y UPDATE directo
-- con políticas RLS. No sirve: PostgREST necesita permiso de SELECT para poder
-- filtrar en un PATCH, y concederlo abriría la lectura de todas las respuestas.
-- Por eso todo pasa por la función.

create or replace function public.guardar_respuesta(
  p_session_id  uuid,
  p_survey_type text,
  p_payload     jsonb default '{}'::jsonb
) returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_answers   jsonb   := coalesce(p_payload->'answers', '{}'::jsonb);
  v_completed boolean := coalesce((p_payload->>'completed')::boolean, false);
  v_filas     int;
begin
  if p_session_id is null then
    raise exception 'falta el identificador de sesión';
  end if;
  if p_survey_type is null or p_survey_type not in ('negocios','personas') then
    raise exception 'tipo de encuesta inválido';
  end if;
  if jsonb_typeof(v_answers) <> 'object' then
    raise exception 'formato de respuestas inválido';
  end if;
  if pg_column_size(v_answers) > 65536 then
    raise exception 'respuesta demasiado grande';
  end if;

  insert into public.survey_responses (
    session_id, survey_type, answers, completed,
    last_question_id, last_question_index, total_questions, skipped_optional,
    duration_seconds, submitted_at,
    source, campaign, referrer, device_type, user_agent, language, screen, timezone,
    updated_at
  ) values (
    p_session_id, p_survey_type, v_answers, v_completed,
    left(p_payload->>'last_question_id', 40),
    (p_payload->>'last_question_index')::int,
    (p_payload->>'total_questions')::int,
    (p_payload->>'skipped_optional')::int,
    (p_payload->>'duration_seconds')::int,
    case when v_completed then now() else null end,
    left(p_payload->>'source', 80),
    left(p_payload->>'campaign', 80),
    left(p_payload->>'referrer', 300),
    left(p_payload->>'device_type', 20),
    left(p_payload->>'user_agent', 400),
    left(p_payload->>'language', 20),
    left(p_payload->>'screen', 24),
    left(p_payload->>'timezone', 60),
    now()
  )
  on conflict (session_id) do update set
    answers             = excluded.answers,
    completed           = excluded.completed,
    last_question_id    = coalesce(excluded.last_question_id,    survey_responses.last_question_id),
    last_question_index = coalesce(excluded.last_question_index, survey_responses.last_question_index),
    total_questions     = coalesce(excluded.total_questions,     survey_responses.total_questions),
    skipped_optional    = coalesce(excluded.skipped_optional,    survey_responses.skipped_optional),
    duration_seconds    = coalesce(excluded.duration_seconds,    survey_responses.duration_seconds),
    submitted_at        = coalesce(excluded.submitted_at,        survey_responses.submitted_at),
    updated_at          = now()
  where survey_responses.completed = false;   -- una vez enviada, queda congelada

  get diagnostics v_filas = row_count;
  return case when v_filas > 0 then 'ok' else 'ya_enviada' end;
end $$;

revoke all on public.survey_responses from anon, authenticated;
revoke all on function public.guardar_respuesta(uuid, text, jsonb) from public, authenticated;
grant execute on function public.guardar_respuesta(uuid, text, jsonb) to anon;


-- ---------- Vistas de análisis ----------
-- Solo accesibles desde el panel de Supabase o con la clave de servicio.

-- Respuestas válidas: completadas y con duración razonable.
create or replace view public.v_respuestas_validas
with (security_invoker = true) as
select *
from public.survey_responses
where completed = true
  and duration_seconds >= case when survey_type = 'negocios' then 90 else 60 end;

-- Resumen general por encuesta.
create or replace view public.v_resumen
with (security_invoker = true) as
select
  survey_type,
  count(*)                                                    as total_iniciadas,
  count(*) filter (where completed)                           as completadas,
  round(100.0 * count(*) filter (where completed)
        / nullif(count(*), 0), 1)                             as tasa_completado_pct,
  round(avg(duration_seconds) filter (where completed))       as duracion_promedio_seg,
  round(percentile_cont(0.5) within group (order by duration_seconds)
        filter (where completed))                             as duracion_mediana_seg,
  min(created_at)                                             as primera,
  max(created_at)                                             as ultima
from public.survey_responses
group by survey_type;

-- Dónde abandona la gente.
create or replace view public.v_abandono
with (security_invoker = true) as
select survey_type, last_question_id as pregunta, last_question_index as posicion,
       count(*) as abandonos
from public.survey_responses
where completed = false and last_question_id is not null
group by survey_type, last_question_id, last_question_index
order by abandonos desc;

-- Rendimiento por canal de difusión (?src=).
create or replace view public.v_canales
with (security_invoker = true) as
select
  survey_type,
  coalesce(source, 'directo')       as canal,
  count(*)                          as visitas,
  count(*) filter (where completed) as completadas,
  round(100.0 * count(*) filter (where completed)
        / nullif(count(*), 0), 1)   as conversion_pct
from public.survey_responses
group by survey_type, source
order by completadas desc;

-- Contactos que pidieron seguimiento, ya separados en columnas.
create or replace view public.v_contactos
with (security_invoker = true) as
select
  id, survey_type, created_at,
  coalesce(answers #>> '{n27,nombre}',   answers #>> '{p29,nombre}')   as nombre,
  answers #>> '{n27,negocio}'                                          as negocio,
  coalesce(answers #>> '{n27,email}',    answers #>> '{p29,email}')    as email,
  coalesce(answers #>> '{n27,telefono}', answers #>> '{p29,telefono}') as telefono,
  source                                                               as canal
from public.survey_responses
where completed = true
  and coalesce(answers #>> '{n27,email}',    answers #>> '{p29,email}',
               answers #>> '{n27,telefono}', answers #>> '{p29,telefono}') is not null;


-- ---------- Comprobación ----------
-- select * from public.v_resumen;
