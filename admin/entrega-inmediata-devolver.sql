-- ============================================================================
-- ENTREGA INMEDIATA: DEVOLVER LA TALLA AL CANCELAR  ·  Proyecto Supabase del CATÁLOGO
-- (correr DESPUÉS de entrega-inmediata-vendidos.sql)
--
-- descontar_entrega_inmediata ahora ANOTA cada talla que quita y de qué pedido (ei_movimientos).
-- Si ese pedido se cancela en el tracking, devolver_entrega_inmediata vuelve a poner exactamente
-- esas tallas (y el producto vuelve a "Entrega inmediata"). Las ventas de antes de este cambio no
-- tienen anotación: esas se devuelven a mano en el admin.
-- ============================================================================

create table if not exists public.ei_movimientos (
  id bigserial primary key,
  pedido_ref text not null,
  codigo text not null,
  talla text,                 -- la talla tal como estaba escrita (null = producto sin tallas)
  cantidad int not null default 1,
  devuelto_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ei_movimientos_pedido_idx on public.ei_movimientos (pedido_ref) where devuelto_at is null;
alter table public.ei_movimientos enable row level security;
revoke all on public.ei_movimientos from anon, authenticated;

drop function if exists public.descontar_entrega_inmediata(text, text, text, int);
create or replace function public.descontar_entrega_inmediata(p_secreto text, p_codigo text, p_talla text, p_cantidad int default 1, p_pedido text default null)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  r public.catalogo_web;
  d jsonb;
  tallas jsonb;
  nueva jsonb := '[]'::jsonb;
  quitadas text[] := '{}';
  pedir int := greatest(1, least(coalesce(p_cantidad, 1), 20));
  quedan int;
  t jsonb;
  cant numeric;
  norm text := lower(regexp_replace(regexp_replace(coalesce(p_talla, ''), '^\s*(talla|eur?|us)\s*', '', 'i'), '\s+', '', 'g'));
begin
  if p_secreto is distinct from (select valor from public.secretos_internos where clave = 'entrega_inmediata') then return 'no autorizado'; end if;
  select * into r from public.catalogo_web where upper(codigo) = upper(btrim(p_codigo)) for update;
  if not found then return 'sin fila en el catálogo'; end if;
  d := r.datos;
  if coalesce((d->>'entregaInmediata')::boolean, false) is false then return 'no es entrega inmediata'; end if;
  tallas := coalesce(d->'tallasEntregaInmediata', '[]'::jsonb);
  if jsonb_typeof(tallas) = 'array' and jsonb_array_length(tallas) > 0 then
    if norm = '' then return 'venta sin talla: no se toca'; end if;
    quedan := pedir;
    for t in select value from jsonb_array_elements(tallas) loop
      if quedan > 0 and lower(regexp_replace(regexp_replace(t #>> '{}', '^\s*(talla|eur?|us)\s*', '', 'i'), '\s+', '', 'g')) = norm then
        quedan := quedan - 1;
        quitadas := quitadas || (t #>> '{}');
      else
        nueva := nueva || jsonb_build_array(t);
      end if;
    end loop;
    if quedan = pedir then return 'esa talla no estaba en entrega inmediata (es encargo)'; end if;
    d := jsonb_set(d, '{tallasEntregaInmediata}', nueva);
    if jsonb_array_length(nueva) = 0 then d := jsonb_set(d, '{entregaInmediata}', 'false'::jsonb); end if;
    if p_pedido is not null then
      insert into public.ei_movimientos (pedido_ref, codigo, talla, cantidad) select p_pedido, r.codigo, x, 1 from unnest(quitadas) x;
    end if;
  else
    cant := case when (d->>'cantidadDisponible') ~ '^[0-9]+(\.[0-9]+)?$' then (d->>'cantidadDisponible')::numeric end;
    if cant is not null and cant - pedir > 0 then
      d := jsonb_set(d, '{cantidadDisponible}', to_jsonb(cant - pedir));
    else
      d := jsonb_set(d, '{entregaInmediata}', 'false'::jsonb);
      if cant is not null then d := jsonb_set(d, '{cantidadDisponible}', '0'::jsonb); end if;
    end if;
    if p_pedido is not null then
      insert into public.ei_movimientos (pedido_ref, codigo, talla, cantidad) values (p_pedido, r.codigo, null, least(pedir, coalesce(cant, pedir)::int));
    end if;
  end if;
  update public.catalogo_web set datos = d, updated_at = now() where id = r.id;
  return 'ok';
end;
$$;
revoke all on function public.descontar_entrega_inmediata(text, text, text, int, text) from public, anon, authenticated;
grant execute on function public.descontar_entrega_inmediata(text, text, text, int, text) to anon, authenticated;

create or replace function public.devolver_entrega_inmediata(p_secreto text, p_pedido text)
returns int language plpgsql security definer set search_path = public, pg_temp as $$
declare m record; d jsonb; n int := 0;
begin
  if p_secreto is distinct from (select valor from public.secretos_internos where clave = 'entrega_inmediata') then return -1; end if;
  for m in select * from public.ei_movimientos where pedido_ref = p_pedido and devuelto_at is null order by id for update loop
    select datos into d from public.catalogo_web where upper(codigo) = upper(m.codigo) for update;
    if not found then continue; end if;
    if m.talla is not null then
      d := jsonb_set(d, '{tallasEntregaInmediata}',
        (case when jsonb_typeof(d->'tallasEntregaInmediata') = 'array' then d->'tallasEntregaInmediata' else '[]'::jsonb end) || to_jsonb(m.talla));
    elsif (d->>'cantidadDisponible') ~ '^[0-9]+(\.[0-9]+)?$' then
      d := jsonb_set(d, '{cantidadDisponible}', to_jsonb((d->>'cantidadDisponible')::numeric + m.cantidad));
    end if;
    d := jsonb_set(d, '{entregaInmediata}', 'true'::jsonb);
    update public.catalogo_web set datos = d, updated_at = now() where upper(codigo) = upper(m.codigo);
    update public.ei_movimientos set devuelto_at = now() where id = m.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;
revoke all on function public.devolver_entrega_inmediata(text, text) from public, anon, authenticated;
grant execute on function public.devolver_entrega_inmediata(text, text) to anon, authenticated;

-- Comprobación: con clave falsa, las dos deben rechazar (no autorizado / -1).
select public.descontar_entrega_inmediata('clave-falsa', 'X', '40', 1, null) as descontar,
       public.devolver_entrega_inmediata('clave-falsa', 'X') as devolver;
