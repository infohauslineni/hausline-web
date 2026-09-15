/* Aviso de bienvenida + consentimiento de cookies de HAUSLINE.
   Al entrar por primera vez muestra un aviso que explica cómo funciona la tienda
   (todo por encargo salvo lo marcado "Entrega inmediata", el cambio de moneda, y
   que el número solo es para consultas). El botón "Entendido, entrar" cierra el
   aviso y deja registrado el consentimiento de cookies (solo las necesarias:
   NO activa rastreo). Se muestra CENTRADO y en CADA carga de la página.

   localStorage:
   - "hausline_cookie_consent": "essential" (solo necesarias) | "all" (con rastreo)
   sessionStorage:
   - "hausline_aviso_sesion": "1" cuando ya se mostró el aviso en ESTA visita
   window.hauslineTrackingAllowed() sigue siendo la puerta para cualquier analítica. */
(function () {
  "use strict";
  var KEY_CONSENT = "hausline_cookie_consent";
  var KEY_SESION = "hausline_aviso_sesion"; // por visita (sessionStorage), no por carga
  var TEL_ATENCION = "+505 7899 5116"; // atención al cliente; los pedidos se hacen en la web

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } }
  function leerSesion(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function guardarSesion(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* modo privado */ } }

  // Puerta para analítica futura: solo activarla si devuelve true.
  window.hauslineTrackingAllowed = function () { return leer(KEY_CONSENT) === "all"; };

  // El aviso se muestra UNA sola vez por visita (al entrar a la web). Al navegar
  // entre productos o volver del detalle NO reaparece, porque el flag vive en
  // sessionStorage. Una visita nueva (otra pestaña o más tarde) sí lo vuelve a ver.

  function inyectarEstilos() {
    if (document.getElementById("hl-aviso-style")) return;
    var css =
      ".hl-aviso{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,17,14,.42);backdrop-filter:blur(5px);}" +
      ".hl-aviso__box{width:100%;max-width:440px;max-height:92vh;overflow-y:auto;background:#FFFFFF;border:1px solid #E7E3DC;border-radius:20px;padding:22px 20px;color:#171310;box-shadow:0 24px 80px rgba(0,0,0,.18);animation:hl-up .28s ease;}" +
      "@keyframes hl-up{from{transform:translateY(12px) scale(.98);opacity:0}to{transform:none;opacity:1}}" +
      ".hl-aviso__t{font-size:20px;font-weight:800;margin:0;letter-spacing:-.01em;}" +
      ".hl-aviso__lead{font-size:13px;color:#6B655C;line-height:1.55;margin:8px 0 16px;}" +
      ".hl-aviso__list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;}" +
      ".hl-aviso__li{display:flex;gap:11px;align-items:flex-start;}" +
      ".hl-aviso__ic{flex:none;width:34px;height:34px;border-radius:10px;background:rgba(138,106,59,.12);color:#8A6A3B;display:grid;place-items:center;font-size:17px;}" +
      ".hl-aviso__li b{font-size:13.5px;font-weight:700;display:block;margin-bottom:2px;}" +
      ".hl-aviso__li p{font-size:12.5px;color:#6B655C;line-height:1.5;margin:0;}" +
      ".hl-aviso__li em{color:#8A6A3B;font-style:normal;font-weight:700;}" +
      ".hl-aviso__tel{font-family:ui-monospace,Menlo,monospace;font-weight:800;color:#171310;}" +
      ".hl-aviso__cookies{margin:16px 0 0;padding-top:14px;border-top:1px solid #E7E3DC;font-size:11.5px;color:#9C958A;line-height:1.55;}" +
      ".hl-aviso__cookies a{color:#8A6A3B;}" +
      ".hl-aviso__btn{width:100%;margin-top:16px;border:0;border-radius:12px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;background:#171310;color:#F7F3EC;}" +
      ".hl-aviso__btn:hover{background:#2b2420;}";
    var s = document.createElement("style");
    s.id = "hl-aviso-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function li(icono, titulo, htmlDetalle) {
    return '<li class="hl-aviso__li"><span class="hl-aviso__ic">' + icono + '</span>' +
      '<div><b>' + titulo + '</b><p>' + htmlDetalle + '</p></div></li>';
  }

  function mostrar() {
    // Ya se mostró en esta visita: no reaparecer al cerrar un producto ni al navegar.
    if (leerSesion(KEY_SESION) === "1") return;
    guardarSesion(KEY_SESION, "1");
    inyectarEstilos();
    var wrap = document.createElement("div");
    wrap.className = "hl-aviso";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Cómo funciona HAUSLINE");

    var box = document.createElement("div");
    box.className = "hl-aviso__box";
    box.innerHTML =
      '<p class="hl-aviso__t">Bienvenido a HAUSLINE 👟</p>' +
      '<p class="hl-aviso__lead">Antes de entrar, tené en cuenta cómo funciona la tienda:</p>' +
      '<ul class="hl-aviso__list">' +
        li("📦", "Todo es por encargo",
          'Los productos se importan bajo pedido. Solo los marcados como <em>Entrega inmediata</em> ya están en Nicaragua y se entregan de una vez.') +
        li("💱", "Dólares o córdobas",
          'Podés ver los precios en <em>US$</em> o <em>C$</em> con el botón de moneda en la parte de arriba.') +
        li("🛒", "Los pedidos se hacen aquí",
          'Encargá directamente desde la web. Atención al cliente: <span class="hl-aviso__tel">' + TEL_ATENCION + '</span>.') +
      '</ul>' +
      '<p class="hl-aviso__cookies">🍪 Usamos cookies necesarias para que el sitio funcione. <a href="/privacidad.html">Más información</a>.</p>' +
      '<button type="button" class="hl-aviso__btn">Entendido, entrar</button>';

    wrap.appendChild(box);
    document.body.appendChild(wrap);
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    box.querySelector(".hl-aviso__btn").addEventListener("click", function () {
      // Registra el consentimiento SOLO de cookies necesarias (sin rastreo) si aún no eligió.
      if (leer(KEY_CONSENT) == null) guardar(KEY_CONSENT, "essential");
      document.body.style.overflow = prevOverflow;
      wrap.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mostrar);
  } else {
    mostrar();
  }
})();
