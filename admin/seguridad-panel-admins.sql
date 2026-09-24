-- ============================================================
--  HAUSLINE · SEGURIDAD DEL PANEL (proyecto CATÁLOGO xgdijumnmaqfirmckugw)
--  2026-09-24
--
--  Problema: catalogo_web, banners y las fotos del bucket "catalogo" dejaban
--  escribir a CUALQUIER usuario con sesión ("to authenticated using (true)"), y
--  el registro de usuarios está abierto. Un atacante podía crearse una cuenta y
--  cambiar precios, nombres, fotos o el aviso emergente de la tienda.
--
--  Solución: lista blanca de administradores (panel_admins). Solo quien esté
--  ahí puede escribir. Se agregan TODOS los usuarios que existen hoy (revisá la
--  lista que sale al final y borrá cualquiera que no reconozcas).
--
--  Re-ejecutable. Correr completo en SQL Editor del proyecto del CATÁLOGO.
-- ============================================================

begin;

-- 1) Lista blanca de administradores del panel -------------------------------
create table if not exists public.panel_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.panel_admins enable row level security;
revoke all on public.panel_admins from anon, authenticated;

-- Los usuarios que existen HOY quedan como admin (los nuevos, no).
insert into public.panel_admins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.es_admin_panel()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.panel_admins a where a.user_id = auth.uid());
$$;
revoke all on function public.es_admin_panel() from public, anon;
grant execute on function public.es_admin_panel() to authenticated;

-- 2) Productos del panel: leer público (activos), escribir solo admin ---------
drop policy if exists catalogo_web_admin on public.catalogo_web;
create policy catalogo_web_admin on public.catalogo_web
  for all to authenticated
  using (public.es_admin_panel()) with check (public.es_admin_panel());

-- 3) Cualquier otra política de este proyecto que abra escritura a "cualquier
--    usuario con sesión" (using/with check = true) pasa a exigir admin.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and roles = '{authenticated}'::name[]
      and (qual = 'true' or with_check = 'true')
  loop
    if p.cmd = 'INSERT' then
      execute format('alter policy %I on %I.%I with check (public.es_admin_panel())', p.policyname, p.schemaname, p.tablename);
    elsif p.cmd = 'SELECT' or p.cmd = 'DELETE' then
      execute format('alter policy %I on %I.%I using (public.es_admin_panel())', p.policyname, p.schemaname, p.tablename);
    else
      execute format('alter policy %I on %I.%I using (public.es_admin_panel()) with check (public.es_admin_panel())', p.policyname, p.schemaname, p.tablename);
    end if;
    raise notice 'Asegurada: %.%', p.tablename, p.policyname;
  end loop;
end $$;

commit;

-- 4) Fotos del bucket "catalogo": solo admin sube/edita/borra ------------------
--    (Si da error "must be owner of table objects", hacelo desde el dashboard:
--     Storage → Policies → bucket catalogo → editar catalogo_fotos_escribir /
--     _editar / _borrar y poner:  bucket_id = 'catalogo' and public.es_admin_panel() )
do $$
begin
  execute 'alter policy catalogo_fotos_escribir on storage.objects with check (bucket_id = ''catalogo'' and public.es_admin_panel())';
  execute 'alter policy catalogo_fotos_editar on storage.objects using (bucket_id = ''catalogo'' and public.es_admin_panel())';
  execute 'alter policy catalogo_fotos_borrar on storage.objects using (bucket_id = ''catalogo'' and public.es_admin_panel())';
  raise notice 'Fotos del catálogo aseguradas.';
exception when others then
  raise notice 'No se pudo cambiar storage por SQL (%). Hacelo desde el dashboard (ver comentario).', sqlerrm;
end $$;

-- 5) REVISÁ esta lista: son los usuarios con acceso al panel. Si hay alguno que
--    no reconocés, borralo en Authentication → Users.
select u.email, u.created_at, u.last_sign_in_at
from auth.users u join public.panel_admins a on a.user_id = u.id
order by u.created_at;

-- ============================================================
--  ADEMÁS (dashboard, 1 minuto):
--  Authentication → Sign In / Providers → Email →
--  DESACTIVAR "Allow new users to sign up".
--  (En este proyecto nadie necesita registrarse: los clientes usan el otro proyecto.)
-- ============================================================
