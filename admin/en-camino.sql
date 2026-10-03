-- ============================================================================
-- "EN CAMINO · APARTALO YA"  ·  Proyecto Supabase del CATÁLOGO
--
-- Las compras de "Compras libres" (panel) que están "En camino" aparecen solas en la tienda con
-- la etiqueta "En camino · Apartalo" y sus tallas (datos.enCamino / datos.tallasEnCamino). Cada
-- compra (ref) anota sus tallas en ec_altas y el producto se recalcula sumando todas las compras
-- en camino de ese código. Cuando la compra llega, se vende, se descarta o se borra, sale sola.
-- Usa la misma clave secreta de entrega inmediata (secretos_internos).
-- ============================================================================

create table if not exists public.ec_altas (
  ref text primary key,          -- id de la compra en Compras libres
  codigo text not null,
  tallas jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.ec_altas enable row level security;
revoke all on public.ec_altas from anon, authenticated;

create or replace function public.recalcular_en_camino(p_codigo text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_tallas jsonb; v_n int;
begin
  select count(*) into v_n from public.ec_altas where upper(codigo) = upper(btrim(p_codigo));
  select coalesce(jsonb_agg(e), '[]'::jsonb) into v_tallas
    from public.ec_altas a, jsonb_array_elements(case when jsonb_typeof(a.tallas) = 'array' then a.tallas else '[]'::jsonb end) e
   where upper(a.codigo) = upper(btrim(p_codigo));
  update public.catalogo_web
     set datos = datos || jsonb_build_object('enCamino', v_n > 0, 'tallasEnCamino', v_tallas), updated_at = now()
   where upper(codigo) = upper(btrim(p_codigo));
end;
$$;
revoke all on function public.recalcular_en_camino(text) from public, anon, authenticated;

create or replace function public.sync_en_camino(p_secreto text, p_ref text, p_codigo text, p_tallas jsonb, p_activo boolean)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare v_viejo text; v_codigo text := btrim(coalesce(p_codigo, '')); v_res text := 'ok';
begin
  if p_secreto is distinct from (select valor from public.secretos_internos where clave = 'entrega_inmediata') then return 'no autorizado'; end if;
  if p_ref is null or btrim(p_ref) = '' then return 'falta la referencia'; end if;
  select codigo into v_viejo from public.ec_altas where ref = p_ref;
  if p_activo and v_codigo <> '' and exists (select 1 from public.catalogo_web where upper(codigo) = upper(v_codigo)) then
    insert into public.ec_altas (ref, codigo, tallas, updated_at)
    values (p_ref, (select codigo from public.catalogo_web where upper(codigo) = upper(v_codigo) limit 1),
            case when jsonb_typeof(p_tallas) = 'array' then p_tallas else '[]'::jsonb end, now())
    on conflict (ref) do update set codigo = excluded.codigo, tallas = excluded.tallas, updated_at = now();
    perform public.recalcular_en_camino(v_codigo);
  else
    if p_activo then v_res := 'sin fila en el catálogo'; end if;
    delete from public.ec_altas where ref = p_ref;
  end if;
  if v_viejo is not null and upper(v_viejo) <> upper(v_codigo) or (v_viejo is not null and not p_activo) then
    perform public.recalcular_en_camino(v_viejo);
  end if;
  return v_res;
end;
$$;
revoke all on function public.sync_en_camino(text, text, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.sync_en_camino(text, text, text, jsonb, boolean) to anon, authenticated;

-- Comprobación: con clave falsa debe decir "no autorizado".
select public.sync_en_camino('clave-falsa', 'prueba', 'X', '["40"]'::jsonb, true) as prueba;
