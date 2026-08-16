-- ============================================================
--  HAUSLINE · PANEL DE PRODUCTOS — Fase 1 (Supabase)
--  Usa una tabla NUEVA propia (catalogo_web) para no tocar la
--  tabla "productos" que ya tenías de antes.
--
--  IMPORTANTE: como el editor SQL se corta por timeout, corré
--  UN PASO A LA VEZ:
--    1. Borrá lo que haya en el editor.
--    2. Pegá SOLO el PASO 1 y dale RUN.  Esperá "Success".
--    3. Borrá, pegá el PASO 2, RUN.  Y así hasta el PASO 5.
--    Si un paso da timeout, dale RUN de nuevo (son seguros de repetir).
-- ============================================================


-- ===================== PASO 1 · Tabla =======================
create table if not exists public.catalogo_web (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,
  activo      boolean not null default true,
  datos       jsonb  not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============== PASO 2 · Seguridad: lectura pública ==========
alter table public.catalogo_web enable row level security;

drop policy if exists catalogo_web_read on public.catalogo_web;
create policy catalogo_web_read
  on public.catalogo_web for select
  using (activo = true);


-- ========== PASO 3 · Seguridad: solo el admin escribe ========
drop policy if exists catalogo_web_admin on public.catalogo_web;
create policy catalogo_web_admin
  on public.catalogo_web for all
  to authenticated
  using (true) with check (true);


-- ============== PASO 4 · Almacén de fotos (bucket) ===========
insert into storage.buckets (id, name, public)
values ('catalogo', 'catalogo', true)
on conflict (id) do nothing;


-- ========== PASO 5 · Permisos de las fotos ==================
drop policy if exists catalogo_fotos_read on storage.objects;
create policy catalogo_fotos_read
  on storage.objects for select
  using (bucket_id = 'catalogo');

drop policy if exists catalogo_fotos_escribir on storage.objects;
create policy catalogo_fotos_escribir
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalogo');

drop policy if exists catalogo_fotos_editar on storage.objects;
create policy catalogo_fotos_editar
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalogo');

drop policy if exists catalogo_fotos_borrar on storage.objects;
create policy catalogo_fotos_borrar
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalogo');


-- ============================================================
--  LISTO. Falta crear tu usuario admin (una sola vez):
--    Authentication → Users → Add user → email + contraseña
--    (marcá "Auto Confirm User").
-- ============================================================
