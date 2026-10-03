-- ============================================================================
-- ENTREGA INMEDIATA DESDE "COMPRAS LIBRES"  ·  Proyecto Supabase del CATÁLOGO
--
-- El panel de tracking (botón "Poner en Entrega inmediata" de una compra Disponible) le pide a
-- su servidor que llame a esta función: agrega las tallas (y colores) a "disponibles ahora" del
-- producto y lo marca como Entrega inmediata en la tienda. Una misma compra (p_ref) no se agrega
-- dos veces MIENTRAS el producto siga en Entrega inmediata (si viene con colores, solo corrige los
-- colores); si ya salió (se vendió, se quitó o se desmarcó en el admin), se puede volver a poner.
-- Colores: si se mandan, la tienda muestra SOLO esos colores en Entrega inmediata.
-- ============================================================================

create table if not exists public.ei_altas (
  ref text primary key,          -- id de la compra en Compras libres
  codigo text not null,
  tallas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.ei_altas enable row level security;
revoke all on public.ei_altas from anon, authenticated;

drop function if exists public.marcar_entrega_inmediata(text, text, jsonb, text);
create or replace function public.marcar_entrega_inmediata(p_secreto text, p_codigo text, p_tallas jsonb, p_ref text, p_colores jsonb default null)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.catalogo_web; d jsonb; actuales jsonb; nuevas jsonb; colores jsonb; ya_estaba boolean := false; es_ei boolean;
begin
  if p_secreto is distinct from (select valor from public.secretos_internos where clave = 'entrega_inmediata') then return 'no autorizado'; end if;
  if p_ref is null or btrim(p_ref) = '' then return 'falta la referencia'; end if;
  select * into r from public.catalogo_web where upper(codigo) = upper(btrim(p_codigo)) for update;
  if not found then return 'sin fila en el catálogo'; end if;
  es_ei := coalesce((r.datos->>'entregaInmediata')::boolean, false);
  select coalesce(jsonb_agg(distinct to_jsonb(left(btrim(x), 30))), '[]'::jsonb) into colores
  from jsonb_array_elements_text(case when jsonb_typeof(p_colores) = 'array' then p_colores else '[]'::jsonb end) x
  where btrim(x) <> '';
  insert into public.ei_altas (ref, codigo, tallas) values (p_ref, r.codigo, coalesce(p_tallas, '[]'::jsonb)) on conflict (ref) do nothing;
  if not found then
    ya_estaba := true;
    if es_ei then
      -- Ya está en Entrega inmediata: solo se corrigen los colores (si vinieron).
      if jsonb_array_length(colores) > 0 then
        update public.catalogo_web set datos = jsonb_set(r.datos, '{coloresEntregaInmediata}', colores), updated_at = now() where id = r.id;
        return 'colores actualizados';
      end if;
      return 'ya estaba agregada';
    end if;
    update public.ei_altas set tallas = coalesce(p_tallas, '[]'::jsonb), created_at = now() where ref = p_ref;
  end if;
  select coalesce(jsonb_agg(to_jsonb(left(btrim(x), 20))), '[]'::jsonb) into nuevas
  from jsonb_array_elements_text(case when jsonb_typeof(p_tallas) = 'array' then p_tallas else '[]'::jsonb end) x
  where btrim(x) <> '';
  d := r.datos;
  actuales := case when es_ei and jsonb_typeof(d->'tallasEntregaInmediata') = 'array' then d->'tallasEntregaInmediata' else '[]'::jsonb end;
  d := jsonb_set(d, '{tallasEntregaInmediata}', actuales || nuevas);
  if jsonb_array_length(colores) > 0 then
    -- Suma los colores nuevos a los que ya estaban en Entrega inmediata (sin repetir).
    select coalesce(jsonb_agg(distinct c), '[]'::jsonb) into colores from (
      select value as c from jsonb_array_elements(case when es_ei and jsonb_typeof(d->'coloresEntregaInmediata') = 'array' then d->'coloresEntregaInmediata' else '[]'::jsonb end)
      union select value from jsonb_array_elements(colores)) t;
    d := jsonb_set(d, '{coloresEntregaInmediata}', colores);
  elsif not es_ei then
    d := jsonb_set(d, '{coloresEntregaInmediata}', '[]'::jsonb);
  end if;
  d := jsonb_set(d, '{entregaInmediata}', 'true'::jsonb);
  update public.catalogo_web set datos = d, activo = true, updated_at = now() where id = r.id;
  return 'ok';
end;
$$;
revoke all on function public.marcar_entrega_inmediata(text, text, jsonb, text, jsonb) from public, anon, authenticated;
grant execute on function public.marcar_entrega_inmediata(text, text, jsonb, text, jsonb) to anon, authenticated;

-- Comprobación: con clave falsa debe decir "no autorizado".
select public.marcar_entrega_inmediata('clave-falsa', 'X', '["40"]'::jsonb, 'prueba', '["NEGRO"]'::jsonb) as prueba;
