-- ============================================================================
-- QUITAR DE ENTREGA INMEDIATA  ·  Proyecto Supabase del CATÁLOGO
-- Botón "Quitar de Entrega inmediata" del panel (Compras libres): el producto deja de salir en
-- "Entrega inmediata" (se vacían sus tallas disponibles) pero sigue en la tienda por encargo.
-- Se borran sus altas (ei_altas) para que después se pueda volver a poner desde Compras libres.
-- ============================================================================

create or replace function public.quitar_entrega_inmediata(p_secreto text, p_codigo text)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.catalogo_web;
begin
  if p_secreto is distinct from (select valor from public.secretos_internos where clave = 'entrega_inmediata') then return 'no autorizado'; end if;
  select * into r from public.catalogo_web where upper(codigo) = upper(btrim(p_codigo)) for update;
  if not found then return 'sin fila en el catálogo'; end if;
  update public.catalogo_web
     set datos = jsonb_set(jsonb_set(r.datos, '{entregaInmediata}', 'false'::jsonb), '{tallasEntregaInmediata}', '[]'::jsonb), updated_at = now()
   where id = r.id;
  delete from public.ei_altas where upper(codigo) = upper(r.codigo);
  return 'ok';
end;
$$;
revoke all on function public.quitar_entrega_inmediata(text, text) from public, anon, authenticated;
grant execute on function public.quitar_entrega_inmediata(text, text) to anon, authenticated;

-- Comprobación: con clave falsa debe decir "no autorizado".
select public.quitar_entrega_inmediata('clave-falsa', 'X') as prueba;
