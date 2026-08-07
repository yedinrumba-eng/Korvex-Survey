-- ============================================================
-- KORVEX SURVEY — esquema de base de datos
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- Es idempotente: se puede correr más de una vez sin romper nada.
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


-- ---------- Seguridad (RLS) ----------
-- El navegador usa la clave anon, que es pública por diseño.
-- Estas políticas hacen que esa clave solo pueda:
--   1. crear una respuesta nueva (siempre incompleta)
--   2. ir actualizándola mientras se llena
-- y que NUNCA pueda leer, borrar, ni tocar una respuesta ya enviada.

alter table public.survey_responses enable row level security;

drop policy if exists "anon inserta respuesta nueva"  on public.survey_responses;
drop policy if exists "anon completa su respuesta"    on public.survey_responses;

create policy "anon inserta respuesta nueva"
  on public.survey_responses
  for insert to anon
  with check (completed = false);

create policy "anon completa su respuesta"
  on public.survey_responses
  for update to anon
  using (completed = false);
  -- Sin política de SELECT ni de DELETE: nadie puede leer ni borrar
  -- con la clave pública. Una vez enviada (completed = true) la fila
  -- queda congelada y ya no puede modificarse desde el navegador.

grant insert, update on public.survey_responses to anon;


-- ---------- Vistas de análisis ----------
-- Estas vistas solo son accesibles desde el panel de Supabase
-- o con la clave de servicio. No están expuestas al navegador.

-- Respuestas válidas: completadas y con duración razonable.
create or replace view public.v_respuestas_validas as
select *
from public.survey_responses
where completed = true
  and duration_seconds >= case when survey_type = 'negocios' then 90 else 60 end;

-- Resumen general por encuesta.
create or replace view public.v_resumen as
select
  survey_type,
  count(*)                                         as total_iniciadas,
  count(*) filter (where completed)                as completadas,
  round(100.0 * count(*) filter (where completed)
        / nullif(count(*), 0), 1)                  as tasa_completado_pct,
  round(avg(duration_seconds) filter (where completed))       as duracion_promedio_seg,
  round(percentile_cont(0.5) within group
        (order by duration_seconds) filter (where completed))  as duracion_mediana_seg,
  min(created_at)                                  as primera,
  max(created_at)                                  as ultima
from public.survey_responses
group by survey_type;

-- Dónde abandona la gente: la pregunta que más fuga produce.
create or replace view public.v_abandono as
select
  survey_type,
  last_question_id                                 as pregunta,
  last_question_index                              as posicion,
  count(*)                                         as abandonos
from public.survey_responses
where completed = false
  and last_question_id is not null
group by survey_type, last_question_id, last_question_index
order by abandonos desc;

-- Rendimiento por canal de difusión (?src=).
create or replace view public.v_canales as
select
  survey_type,
  coalesce(source, 'directo')                      as canal,
  count(*)                                         as visitas,
  count(*) filter (where completed)                as completadas,
  round(100.0 * count(*) filter (where completed)
        / nullif(count(*), 0), 1)                  as conversion_pct
from public.survey_responses
group by survey_type, source
order by completadas desc;

-- Contactos que pidieron seguimiento, ya separados en columnas.
create or replace view public.v_contactos as
select
  id,
  survey_type,
  created_at,
  coalesce(answers #>> '{n27,nombre}',   answers #>> '{p29,nombre}')   as nombre,
  answers #>> '{n27,negocio}'                                          as negocio,
  coalesce(answers #>> '{n27,email}',    answers #>> '{p29,email}')    as email,
  coalesce(answers #>> '{n27,telefono}', answers #>> '{p29,telefono}') as telefono,
  source                                                               as canal
from public.survey_responses
where completed = true
  and (
    coalesce(answers #>> '{n27,email}', answers #>> '{p29,email}',
             answers #>> '{n27,telefono}', answers #>> '{p29,telefono}') is not null
  );


-- ---------- Comprobación ----------
-- Después de correr esto deberías ver la tabla vacía y las 5 vistas creadas:
--   select * from public.v_resumen;
