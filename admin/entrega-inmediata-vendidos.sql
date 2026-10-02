-- ============================================================================
-- ENTREGA INMEDIATA: QUITAR LO QUE SE VENDE  ·  Proyecto Supabase del CATÁLOGO (admin.html)
--
-- Cuando se confirma un pedido en el tracking, el tracking llama a esta función con el producto
-- y la talla vendidos. Si era de entrega inmediata:
--   · con tallas ("Tallas disponibles ahora"): se quita esa talla de la lista; si no quedan tallas,
--     el producto deja de ser de entrega inmediata (sale de esa sección; sigue en la tienda por encargo).
--   · sin tallas: baja la cantidad disponible; al llegar a 0 deja de ser de entrega inmediata.
-- Si tenés 2 unidades de la misma talla, escribila 2 veces en el admin (ej. 40, 40).
-- Solo funciona con la clave secreta (la misma que va en el SQL del tracking).
-- ============================================================================

create table if not exists public.secretos_internos (clave text primary key, valor text not null);
alter table public.secretos_internos enable row level security;
revoke all on public.secretos_internos from anon, authenticated;
insert into public.secretos_internos (clave, valor) values ('entrega_inmediata', '__SECRETO__')
on conflict (clave) do update set valor = excluded.valor;

create or replace function public.descontar_entrega_inmediata(p_secreto text, p_codigo text, p_talla text, p_cantidad int default 1)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  r public.catalogo_web;
  d jsonb;
  tallas jsonb;
  nueva jsonb := '[]'::jsonb;
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
      else
        nueva := nueva || jsonb_build_array(t);
      end if;
    end loop;
    if quedan = pedir then return 'esa talla no estaba en entrega inmediata (es encargo)'; end if;
    d := jsonb_set(d, '{tallasEntregaInmediata}', nueva);
    if jsonb_array_length(nueva) = 0 then d := jsonb_set(d, '{entregaInmediata}', 'false'::jsonb); end if;
  else
    cant := case when (d->>'cantidadDisponible') ~ '^[0-9]+(\.[0-9]+)?$' then (d->>'cantidadDisponible')::numeric end;
    if cant is not null and cant - pedir > 0 then
      d := jsonb_set(d, '{cantidadDisponible}', to_jsonb(cant - pedir));
    else
      d := jsonb_set(d, '{entregaInmediata}', 'false'::jsonb);
      if cant is not null then d := jsonb_set(d, '{cantidadDisponible}', '0'::jsonb); end if;
    end if;
  end if;
  update public.catalogo_web set datos = d, updated_at = now() where id = r.id;
  return 'ok';
end;
$$;
revoke all on function public.descontar_entrega_inmediata(text, text, text, int) from public, anon, authenticated;
grant execute on function public.descontar_entrega_inmediata(text, text, text, int) to anon, authenticated;

-- Comprobación: con una clave falsa debe decir "no autorizado".
select public.descontar_entrega_inmediata('clave-falsa', 'X', '40', 1) as prueba;
