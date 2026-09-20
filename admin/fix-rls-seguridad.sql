-- ============================================================
--  HAUSLINE · ARREGLO DE SEGURIDAD (RLS)
--  Motivo: el Security Advisor de Supabase avisó "Table publicly
--  accessible / rls_disabled_in_public" en el proyecto hausline-shop.
--
--  Diagnóstico (2026-09-16) con la clave PÚBLICA del sitio: en el
--  proyecto hausline-shop (xgdijumnmaqfirmckugw) cualquiera podía LEER
--  estas tablas sin RLS:  productos (61 filas), clientes (2), pedidos (1),
--  pagos.  'catalogo_web' es lectura pública a propósito (catálogo) y YA
--  tiene su política, así que no se toca.
--
--  ¿Por qué es SEGURO activar RLS en todo lo demás?
--   • El sitio SOLO lee la tabla 'catalogo_web' de forma directa.
--   • Todo lo demás (encargos, clientes, reseñas, cupones, pagos) se
--     hace vía funciones RPC 'SECURITY DEFINER', que IGNORAN la RLS.
--   • El panel/backend usa la clave service_role, que también IGNORA RLS.
--   Por eso, tras activar RLS, el público pierde el acceso directo pero
--   el sitio y el panel siguen funcionando igual.
--
--  CÓMO CORRERLO:
--   Supabase → proyecto hausline-shop → SQL Editor → New query →
--   pegá TODO esto → Run.  Es seguro repetirlo.
--   (Recomendado: correlo TAMBIÉN en el otro proyecto,
--    epslwaxjemlysqtubbfu, por las dudas.)
-- ============================================================


-- ---------- PASO 1 · DIAGNÓSTICO (antes) ----------
-- Muestra qué tablas del esquema public NO tienen RLS activada.
select c.relname as tabla, c.relrowsecurity as rls_activo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by rls_activo asc, tabla;


-- ---------- PASO 2 · ARREGLO ----------
-- Activa RLS en TODAS las tablas de public que no la tengan.
-- No borra políticas existentes; 'catalogo_web' (ya con RLS) se salta solo.
do $$
declare r record;
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relrowsecurity = false
  loop
    execute format('alter table public.%I enable row level security;', r.relname);
    raise notice 'RLS activado en public.%', r.relname;
  end loop;
end $$;


-- ---------- PASO 3 · VERIFICACIÓN (después) ----------
-- Volvé a correr esto: 'rls_activo' debe ser TRUE en todas.
select c.relname as tabla, c.relrowsecurity as rls_activo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by rls_activo asc, tabla;

-- ============================================================
--  NOTA: si después del arreglo algo del PANEL dejara de mostrar una
--  tabla (no debería, porque usa service_role), avisá y le agregamos la
--  política puntual. El SITIO público no se ve afectado.
--
--  EXTRA opcional: la tabla vieja 'productos' (61 filas) ya no la usa el
--  sitio (usa 'catalogo_web'). Si confirmás que nadie más la usa, se puede
--  borrar:   drop table public.productos;
-- ============================================================
