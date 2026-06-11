-- =====================================================================
-- MundialYa — Esquema, RLS y triggers (Supabase / Postgres)
-- Ejecutar en: Supabase Dashboard → SQL Editor (antes de 002_seed.sql)
--
-- Modelo de seguridad:
--   · Lectura pública (anon) en todas las tablas de contenido.
--   · TODAS las escrituras pasan por las API routes con service_role
--     (el service role omite RLS), así que no hay políticas de escritura.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,            -- código FIFA de 3 letras
  flag_url text,
  group_label text check (group_label ~ '^[A-L]$'),
  fifa_rank int,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  stage text not null default 'group' check (stage in ('group','r32','r16','qf','sf','final')),
  group_label text check (group_label ~ '^[A-L]$'),
  home_team_id uuid references teams(id) on delete cascade,
  away_team_id uuid references teams(id) on delete cascade,
  kickoff timestamptz not null,
  stadium text not null default '',
  host_city text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  home_score int,
  away_score int,
  views bigint not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists matches_kickoff_idx on matches (kickoff);
create index if not exists matches_status_idx on matches (status);

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  owner_id text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  total_points int not null default 0,
  created_at timestamptz not null default now(),
  unique (league_id, user_id)
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id text not null,
  match_id uuid not null references matches(id) on delete cascade,
  pred_home int not null check (pred_home between 0 and 20),
  pred_away int not null check (pred_away between 0 and 20),
  points int,
  created_at timestamptz not null default now(),
  unique (league_id, user_id, match_id)
);
create index if not exists predictions_match_idx on predictions (match_id);

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,  -- null = global
  question text not null,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_index int not null check (option_index >= 0),
  ip_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, ip_hash)              -- 1 voto por persona (modificable vía upsert)
);

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  neighborhood text not null default '',
  city text not null default 'Bogotá',
  phone text not null default '',
  photo_url text,
  description text not null default '',
  screens int not null default 1,
  promos text not null default '',
  showing_match_id uuid references matches(id) on delete set null,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  featured_until timestamptz,
  avg_rating numeric(3,1) not null default 0,
  review_count int not null default 0,
  views bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists venue_reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  ip_hash text not null,
  created_at timestamptz not null default now(),
  unique (venue_id, ip_hash)             -- anti-spam: 1 reseña por IP por sitio
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  link text,
  placement text not null default 'home_top' check (placement in ('home_top','sidebar','match')),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  priority int not null default 1
);

create table if not exists popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_url text,
  link text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  frequency_hours int not null default 12
);

create table if not exists site_stats (
  key text primary key,
  value bigint not null default 0
);

-- ---------------------------------------------------------------------
-- RLS: lectura pública, escrituras solo vía service role
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['teams','matches','leagues','league_members','predictions',
                           'polls','votes','venues','venue_reviews','banners','popups','site_stats']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "lectura publica" on %I', t);
    execute format('create policy "lectura publica" on %I for select using (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Funciones RPC para contadores de visitas
-- ---------------------------------------------------------------------
create or replace function increment_stat(stat_key text)
returns void language sql security definer as $$
  insert into site_stats (key, value) values (stat_key, 1)
  on conflict (key) do update set value = site_stats.value + 1;
$$;

create or replace function increment_views(table_name text, row_id uuid)
returns void language plpgsql security definer as $$
begin
  if table_name = 'matches' then
    update matches set views = views + 1 where id = row_id;
  elsif table_name = 'venues' then
    update venues set views = views + 1 where id = row_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER: puntuación automática de la polla
-- Cuando un partido pasa a 'finished' (o cambia su marcador final),
-- recalcula los puntos de todas sus predicciones y los totales por liga.
-- Reglas: marcador exacto = 5 pts · resultado correcto = 2 pts · fallo = 0.
-- ---------------------------------------------------------------------
create or replace function score_match_predictions()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'finished' and new.home_score is not null and new.away_score is not null then
    update predictions p set points = case
      when p.pred_home = new.home_score and p.pred_away = new.away_score then 5
      when sign(p.pred_home - p.pred_away) = sign(new.home_score - new.away_score) then 2
      else 0
    end
    where p.match_id = new.id;

    -- recalcular totales de los miembros afectados
    update league_members lm set total_points = coalesce((
      select sum(p.points) from predictions p
      where p.league_id = lm.league_id and p.user_id = lm.user_id and p.points is not null
    ), 0)
    where exists (
      select 1 from predictions p
      where p.match_id = new.id and p.league_id = lm.league_id and p.user_id = lm.user_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_score_match on matches;
create trigger trg_score_match
  after update of status, home_score, away_score on matches
  for each row execute function score_match_predictions();

-- ---------------------------------------------------------------------
-- TRIGGER: rating promedio de sitios al moderar reseñas
-- ---------------------------------------------------------------------
create or replace function refresh_venue_rating()
returns trigger language plpgsql security definer as $$
declare vid uuid;
begin
  vid := coalesce(new.venue_id, old.venue_id);
  update venues v set
    review_count = (select count(*) from venue_reviews r where r.venue_id = vid and r.status = 'approved'),
    avg_rating = coalesce((select round(avg(r.rating)::numeric, 1) from venue_reviews r where r.venue_id = vid and r.status = 'approved'), 0)
  where v.id = vid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_venue_rating on venue_reviews;
create trigger trg_venue_rating
  after insert or update or delete on venue_reviews
  for each row execute function refresh_venue_rating();
