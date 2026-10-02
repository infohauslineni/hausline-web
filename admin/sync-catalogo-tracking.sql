-- ============================================================================
-- PRECIOS DEL ADMIN → TRACKING AL INSTANTE
-- Correr en el proyecto Supabase del CATÁLOGO (el de admin.html: xgdijumnmaqfirmckugw).
--
-- Cada vez que se guarda, crea o cambia un producto en admin.html (tabla catalogo_web), Supabase
-- le avisa al panel de tracking (POST https://hausline-tracking.vercel.app/api/catalogo) y este
-- copia el catálogo a su tabla `productos`: el precio, la foto y el nombre nuevos salen en el
-- tracking en unos segundos (antes: hasta 15 min, o al día siguiente a las 3 a. m.).
--
-- · Es UN aviso por guardado (trigger por sentencia, no por fila): un cambio en lote = 1 aviso.
-- · El aviso va en segundo plano (pg_net): nunca frena ni rompe el guardado en admin.html.
-- · El precio de compra (costo) del tracking NO se toca, ni los pedidos ya hechos.
-- Se puede correr más de una vez.
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.avisar_tracking_catalogo()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform net.http_post(
    url := 'https://hausline-tracking.vercel.app/api/catalogo',
    body := jsonb_build_object('origen', 'catalogo_web', 'operacion', tg_op),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  );
  return null;
exception when others then
  return null;  -- si el aviso falla, el guardado sigue igual (el cron diario lo sincroniza)
end;
$$;
revoke all on function public.avisar_tracking_catalogo() from public, anon, authenticated;

drop trigger if exists catalogo_web_avisar_tracking on public.catalogo_web;
create trigger catalogo_web_avisar_tracking
  after insert or update on public.catalogo_web
  for each statement execute function public.avisar_tracking_catalogo();

-- Comprobación: debe salir 1 fila con el trigger.
select tgname as trigger_creado from pg_trigger where tgname = 'catalogo_web_avisar_tracking';
