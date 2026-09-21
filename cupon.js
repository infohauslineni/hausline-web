// ============================================================
// HAUSLINE · Cupón desde el link del correo (Brevo)
// El correo de Brevo lleva un botón/enlace a:  hauslineshopni.es/?cupon=CODIGO
// Este script:
//   1) Lee ?cupon=CODIGO de la URL.
//   2) Lo valida contra la base con la RPC pública validar_cupon (no lo consume).
//   3) Lo guarda en localStorage para que el checkout lo autocomplete solo.
//   4) Muestra una barra arriba con el código a usar (con botón "Copiar").
// Si no hay ?cupon= pero hay uno guardado y sigue válido, igual muestra la barra
// como recordatorio. Un código inválido/vencido se borra y no se muestra.
// ============================================================
(function(){
  "use strict";

  var SB_URL = (typeof SUPABASE_URL !== "undefined") ? SUPABASE_URL : "";
  var SB_KEY = (typeof SUPABASE_ANON_KEY !== "undefined") ? SUPABASE_ANON_KEY : "";
  var STORE_KEY = "hausline_cupon";

  function getParam(n){ try{ return new URLSearchParams(location.search).get(n) || ""; }catch(e){ return ""; } }
  function guardar(c){ try{ localStorage.setItem(STORE_KEY, c); }catch(e){} }
  function leer(){ try{ return localStorage.getItem(STORE_KEY) || ""; }catch(e){ return ""; } }
  function borrar(){ try{ localStorage.removeItem(STORE_KEY); }catch(e){} }

  function etiquetaValor(r){
    if(String(r.tipo) === "porcentaje") return Number(r.valor) + "% de descuento";
    return "US$ " + Number(r.valor).toFixed(2) + " de descuento";
  }

  function inyectarCss(){
    if(document.getElementById("cuponCss")) return;
    var st = document.createElement("style"); st.id = "cuponCss";
    st.textContent =
      "#cuponBar{position:sticky;top:0;z-index:1300;background:#171310;color:#F7F3EC;"
      + "font-family:inherit;box-shadow:0 2px 14px rgba(0,0,0,.18);animation:cupIn .35s ease}"
      + "@keyframes cupIn{from{transform:translateY(-100%);opacity:0}to{transform:none;opacity:1}}"
      + "#cuponBar .cupbar-in{max-width:1200px;margin:0 auto;padding:9px 16px;display:flex;"
      + "align-items:center;gap:12px;justify-content:center;flex-wrap:wrap}"
      + "#cuponBar .cupbar-txt{font-size:13.5px;letter-spacing:.2px;line-height:1.35}"
      + "#cuponBar .cupbar-txt b{background:#F7F3EC;color:#171310;border-radius:6px;"
      + "padding:2px 8px;font-weight:800;letter-spacing:.6px;margin-left:2px}"
      + "#cuponBar .cupbar-copy{background:transparent;color:#F7F3EC;border:1px solid rgba(247,243,236,.5);"
      + "border-radius:999px;padding:4px 13px;font-size:12.5px;font-weight:700;cursor:pointer;"
      + "transition:background .15s,color .15s}"
      + "#cuponBar .cupbar-copy:hover{background:#F7F3EC;color:#171310}"
      + "#cuponBar .cupbar-x{background:transparent;color:#F7F3EC;border:0;font-size:22px;line-height:1;"
      + "cursor:pointer;opacity:.7;padding:0 2px}#cuponBar .cupbar-x:hover{opacity:1}"
      + "@media(max-width:520px){#cuponBar .cupbar-txt{font-size:12.5px}}";
    document.head.appendChild(st);
  }

  function mostrarBarra(codigo, texto){
    if(document.getElementById("cuponBar")) return;
    inyectarCss();
    var b = document.createElement("div"); b.id = "cuponBar"; b.setAttribute("role","status");
    b.innerHTML =
      '<div class="cupbar-in">'
      + '<span class="cupbar-txt">🎟️ ' + texto + ' — usá el código <b>' + codigo + '</b> al pagar</span>'
      + '<button type="button" class="cupbar-copy" data-copiar>Copiar código</button>'
      + '<button type="button" class="cupbar-x" aria-label="Cerrar">&times;</button>'
      + '</div>';
    document.body.insertBefore(b, document.body.firstChild);
    b.querySelector("[data-copiar]").addEventListener("click", function(){
      try{ if(navigator.clipboard) navigator.clipboard.writeText(codigo); }catch(e){}
      var btn = this; btn.textContent = "✓ Copiado"; setTimeout(function(){ btn.textContent = "Copiar código"; }, 1400);
    });
    b.querySelector(".cupbar-x").addEventListener("click", function(){ b.remove(); });
  }

  function validarYMostrar(codigo, esDeUrl){
    codigo = (codigo || "").trim();
    if(!codigo) return;
    if(!SB_URL || !SB_KEY){
      // Sin llaves no podemos validar; si vino del link, al menos lo mostramos y guardamos.
      if(esDeUrl){ guardar(codigo); mostrarBarra(codigo, "Tenés un descuento"); }
      return;
    }
    fetch(SB_URL + "rpc/validar_cupon", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
      body: JSON.stringify({ p_codigo: codigo, p_total: 0 })
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(r){
        if(r && r.valido){ guardar(r.codigo); mostrarBarra(r.codigo, etiquetaValor(r)); }
        else { borrar(); } // inválido/vencido/agotado: no molestar
      })
      .catch(function(){
        // Red caída: si vino del link, lo guardamos y mostramos igual (el checkout revalida).
        if(esDeUrl){ guardar(codigo); mostrarBarra(codigo, "Tenés un descuento"); }
      });
  }

  function arranque(){
    var deUrl = getParam("cupon");
    if(deUrl){ validarYMostrar(deUrl, true); return; }
    var guardado = leer();
    if(guardado){ validarYMostrar(guardado, false); }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", arranque);
  else arranque();
})();
