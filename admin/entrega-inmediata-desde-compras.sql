-- ============================================================================
-- ENTREGA INMEDIATA DESDE "COMPRAS LIBRES"  ·  Proyecto Supabase del CATÁLOGO
--
-- El panel de tracking (botón "Poner en Entrega inmediata" de una compra Disponible) le pide a
-- su servidor que llame a esta función: agrega las tallas a "Tallas disponibles ahora" del
-- producto y lo marca como Entrega inmediata en la tienda. Cada compra (p_ref) se agrega UNA sola
-- vez (ei_altas). Usa la misma clave secreta de entrega inmediata (secretos_internos).
-- ============================================================================

create table if not exists public.ei_altas (
  ref text primary key,          -- id de la compra en Compras libres
  codigo text not null,
  tallas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.ei_altas enable row level security;
revoke all on public.ei_altas from anon, authenticated;

create or replace function public.marcar_entrega_inmediata(p_secreto text, p_codigo text, p_tallas jsonb, p_ref text)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.catalogo_web; d jsonb; actuales jsonb; nuevas jsonb;
begin
  if p_secreto is distinct from (select valor from public.secretos_internos where clave = 'entrega_inmediata') then return 'no autorizado'; end if;
  if p_ref is null or btrim(p_ref) = '' then return 'falta la referencia'; end if;
  select * into r from public.catalogo_web where upper(codigo) = upper(btrim(p_codigo)) for update;
  if not found then return 'sin fila en el catálogo'; end if;
  insert into public.ei_altas (ref, codigo, tallas) values (p_ref, r.codigo, coalesce(p_tallas, '[]'::jsonb)) on conflict (ref) do nothing;
  if not found then return 'ya estaba agregada'; end if;
  -- Solo textos cortos y no vacíos.
  select coalesce(jsonb_agg(to_jsonb(left(btrim(x), 20))), '[]'::jsonb) into nuevas
  from jsonb_array_elements_text(case when jsonb_typeof(p_tallas) = 'array' then p_tallas else '[]'::jsonb end) x
  where btrim(x) <> '';
  d := r.datos;
  actuales := case when jsonb_typeof(d->'tallasEntregaInmediata') = 'array' then d->'tallasEntregaInmediata' else '[]'::jsonb end;
  d := jsonb_set(d, '{tallasEntregaInmediata}', actuales || nuevas);
  d := jsonb_set(d, '{entregaInmediata}', 'true'::jsonb);
  update public.catalogo_web set datos = d, activo = true, updated_at = now() where id = r.id;
  return 'ok';
end;
$$;
revoke all on function public.marcar_entrega_inmediata(text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.marcar_entrega_inmediata(text, text, jsonb, text) to anon, authenticated;

-- Comprobación: con clave falsa debe decir "no autorizado".
select public.marcar_entrega_inmediata('clave-falsa', 'X', '["40"]'::jsonb, 'prueba') as prueba;
