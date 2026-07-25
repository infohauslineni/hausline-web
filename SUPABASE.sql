-- ============================================================
--  HAUSLINE — SQL COMPLETO PARA SUPABASE
--  Copia TODO este archivo y pégalo en:
--  Supabase → tu proyecto → SQL Editor → New query → Run
--  Solo se ejecuta una vez. Es seguro correrlo de nuevo.
-- ============================================================

-- ---------- 1. TABLAS ----------

-- Contador de visualizaciones por producto (una fila por código).
create table if not exists public.vistas_producto (
  codigo       text primary key,
  vistas       bigint not null default 0,
  actualizado  timestamptz not null default now()
);

-- Registro de ventas (para "Más vendidos esta semana").
-- Se llena a mano cuando confirmes un pedido (ver la guía).
create table if not exists public.ventas (
  id        bigint generated always as identity primary key,
  codigo    text not null,
  cantidad  int  not null default 1,
  creado    timestamptz not null default now()
);

-- ---------- 2. ÍNDICES ----------
create index if not exists idx_ventas_creado on public.ventas (creado desc);
create index if not exists idx_ventas_codigo on public.ventas (codigo);
create index if not exists idx_vistas_orden  on public.vistas_producto (vistas desc);

-- ---------- 3. RLS (seguridad a nivel de fila) ----------
alter table public.vistas_producto enable row level security;
alter table public.ventas          enable row level security;

-- ---------- 4. POLÍTICAS ----------
-- El público (anon) SOLO puede LEER los contadores y las ventas.
-- No puede escribir directamente: el conteo se hace por la función de abajo.
drop policy if exists "leer vistas" on public.vistas_producto;
create policy "leer vistas" on public.vistas_producto
  for select using (true);

drop policy if exists "leer ventas" on public.ventas;
create policy "leer ventas" on public.ventas
  for select using (true);

-- ---------- 5. FUNCIÓN RPC: incrementar vista ----------
-- SECURITY DEFINER: puede escribir el contador aunque anon no tenga
-- permiso de escritura directa. Devuelve el nuevo total.
create or replace function public.incrementar_vista(p_codigo text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo bigint;
begin
  insert into public.vistas_producto (codigo, vistas, actualizado)
  values (p_codigo, 1, now())
  on conflict (codigo)
  do update set vistas = vistas_producto.vistas + 1, actualizado = now()
  returning vistas into nuevo;
  return nuevo;
end;
$$;

-- ---------- 6. FUNCIÓN RPC: más vendidos de la semana ----------
create or replace function public.mas_vendidos_semana()
returns table(codigo text, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select codigo, sum(cantidad)::bigint as total
  from public.ventas
  where creado >= now() - interval '7 days'
  group by codigo
  order by total desc
  limit 12;
$$;

-- ---------- 7. PERMISOS ----------
grant select  on public.vistas_producto to anon, authenticated;
grant select  on public.ventas          to anon, authenticated;
grant execute on function public.incrementar_vista(text)   to anon, authenticated;
grant execute on function public.mas_vendidos_semana()     to anon, authenticated;

-- ============================================================
--  LISTO. Ahora copia tu URL y tu ANON KEY (NO la service_role)
--  y pégalas en el archivo config.js del sitio.
-- ============================================================

-- --- Cómo REGISTRAR UNA VENTA (cuando confirmes un pedido) ---
-- Reemplaza el código y la cantidad. Ejecútalo en el SQL Editor:
--   insert into public.ventas (codigo, cantidad) values ('CL0002', 1);

-- --- Cómo VER los datos ---
--   select * from public.vistas_producto order by vistas desc;
--   select * from public.ventas order by creado desc;
