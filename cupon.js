// ============================================================
// HAUSLINE · Cupón desde el link del correo (Brevo)
// El correo de Brevo lleva un enlace a:  hauslineshopni.es/?cupon=CODIGO
// Este script:
//   1) Lee ?cupon=CODIGO de la URL.
//   2) Lo valida contra la base con la RPC pública validar_cupon (no lo consume).
//   3) Lo guarda en localStorage para que el checkout lo autocomplete solo.
//   4) Muestra una barra FIJA arriba con el código a usar (con botón "Copiar").
//
// La barra es position:fixed y se AUTO-REPARA: la tienda re-renderiza el DOM al navegar
// (abrir un producto, cambiar de categoría) y borraba la barra; un MutationObserver la
// vuelve a poner sola. Empuja el contenido hacia abajo (padding en el body) para no tapar
// el logo. Si el cliente la cierra (×), se queda cerrada por el resto de la visita.
// ============================================================
(function(){
  "use strict";

  var SB_URL = (typeof SUPABASE_URL !== "undefined") ? SUPABASE_URL : "";
  var SB_KEY = (typeof SUPABASE_ANON_KEY !== "undefined") ? SUPABASE_ANON_KEY : "";
  var STORE_KEY = "hausline_cupon";
  var TXT_KEY   = "hausline_cupon_txt";
  var CERRADO_KEY = "hausline_cupon_cerrado";

  var estado = { codigo: "", texto: "" };
  var obs = null;

  function getParam(n){ try{ return new URLSearchParams(location.search).get(n) || ""; }catch(e){ return ""; } }
  function guardar(c, txt){ try{ localStorage.setItem(STORE_KEY, c); localStorage.setItem(TXT_KEY, txt || ""); }catch(e){} }
  function leer(){ try{ return localStorage.getItem(STORE_KEY) || ""; }catch(e){ return ""; } }
  function leerTxt(){ try{ return localStorage.getItem(TXT_KEY) || ""; }catch(e){ return ""; } }
  function borrar(){ try{ localStorage.removeItem(STORE_KEY); localStorage.removeItem(TXT_KEY); }catch(e){} }
  function cerrado(){ try{ return sessionStorage.getItem(CERRADO_KEY) === "1"; }catch(e){ return false; } }
  function marcarCerrado(){ try{ sessionStorage.setItem(CERRADO_KEY, "1"); }catch(e){} }

  function etiquetaValor(r){
    if(String(r.tipo) === "porcentaje") return Number(r.valor) + "% de descuento";
    return "US$ " + Number(r.valor).toFixed(2) + " de descuento";
  }

  function inyectarCss(){
    if(document.getElementById("cuponCss")) return;
    var st = document.createElement("style"); st.id = "cuponCss";
    st.textContent =
      "#cuponBar{position:fixed;top:0;left:0;right:0;z-index:900;background:#171310;color:#F7F3EC;"
      + "font-family:inherit;box-shadow:0 2px 14px rgba(0,0,0,.22);animation:cupIn .35s ease}"
      + "@keyframes cupIn{from{transform:translateY(-100%)}to{transform:none}}"
      + "#cuponBar .cupbar-in{max-width:1200px;margin:0 auto;padding:8px 12px;display:flex;"
      + "align-items:center;gap:10px;justify-content:center;flex-wrap:wrap}"
      + "#cuponBar .cupbar-txt{font-size:13px;letter-spacing:.2px;line-height:1.3}"
      + "#cuponBar .cupbar-txt b{background:#F7F3EC;color:#171310;border-radius:6px;"
      + "padding:2px 8px;font-weight:800;letter-spacing:.6px;margin-left:2px;white-space:nowrap}"
      + "#cuponBar .cupbar-copy{background:transparent;color:#F7F3EC;border:1px solid rgba(247,243,236,.55);"
      + "border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;"
      + "transition:background .15s,color .15s}"
      + "#cuponBar .cupbar-copy:hover,#cuponBar .cupbar-copy:active{background:#F7F3EC;color:#171310}"
      + "#cuponBar .cupbar-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;"
      + "color:#F7F3EC;border:0;font-size:22px;line-height:1;cursor:pointer;opacity:.65;padding:0 4px}"
      + "#cuponBar .cupbar-x:hover{opacity:1}"
      + "@media(max-width:560px){#cuponBar .cupbar-in{padding-right:30px;padding-left:12px}"
      + "#cuponBar .cupbar-txt{font-size:12px}}";
    document.head.appendChild(st);
  }

  // Empuja el contenido del sitio hacia abajo la altura exacta de la barra (que puede ocupar
  // 1 o 2 líneas según el ancho), para que la barra fija no tape el logo/header.
  function ajustarPadding(){
    var b = document.getElementById("cuponBar");
    if(b) { try{ document.body.style.paddingTop = b.offsetHeight + "px"; }catch(e){} }
  }
  function quitarPadding(){ try{ document.body.style.paddingTop = ""; }catch(e){} }

  function construirBarra(){
    if(document.getElementById("cuponBar") || !estado.codigo) return;
    inyectarCss();
    var b = document.createElement("div"); b.id = "cuponBar"; b.setAttribute("role","status");
    b.innerHTML =
      '<div class="cupbar-in">'
      + '<span class="cupbar-txt">🎟️ ' + estado.texto + ' — usá el código <b>' + estado.codigo + '</b> al pagar</span>'
      + '<button type="button" class="cupbar-copy" data-copiar>Copiar código</button>'
      + '<button type="button" class="cupbar-x" aria-label="Cerrar">&times;</button>'
      + '</div>';
    document.body.insertBefore(b, document.body.firstChild);
    b.querySelector("[data-copiar]").addEventListener("click", function(){
      try{ if(navigator.clipboard) navigator.clipboard.writeText(estado.codigo); }catch(e){}
      var btn = this; btn.textContent = "✓ Copiado"; setTimeout(function(){ btn.textContent = "Copiar código"; }, 1400);
    });
    b.querySelector(".cupbar-x").addEventListener("click", function(){
      marcarCerrado(); if(obs){ obs.disconnect(); obs = null; }
      b.remove(); quitarPadding();
    });
    ajustarPadding();
  }

  // Observa el body: si la tienda re-renderiza y borra la barra, la volvemos a poner
  // (a menos que el cliente la haya cerrado). No hay bucle: al recrearla ya existe.
  function vigilar(){
    if(obs || cerrado()) return;
    try{
      obs = new MutationObserver(function(){
        if(!cerrado() && estado.codigo && !document.getElementById("cuponBar")) construirBarra();
      });
      obs.observe(document.body, { childList: true });
    }catch(e){}
  }

  function mostrar(codigo, texto){
    estado.codigo = codigo; estado.texto = texto || "Tenés un descuento";
    if(cerrado()) return;
    construirBarra();
    vigilar();
  }

  function validarYMostrar(codigo, esDeUrl){
    codigo = (codigo || "").trim();
    if(!codigo || cerrado()) return;
    if(!SB_URL || !SB_KEY){ if(esDeUrl){ guardar(codigo, "Tenés un descuento"); mostrar(codigo, "Tenés un descuento"); } return; }
    fetch(SB_URL + "rpc/validar_cupon", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
      body: JSON.stringify({ p_codigo: codigo, p_total: 0 })
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(r){
        if(r && r.valido){ var txt = etiquetaValor(r); guardar(r.codigo, txt); mostrar(r.codigo, txt); }
        else { borrar(); } // inválido/vencido/agotado: no molestar
      })
      .catch(function(){ if(esDeUrl){ guardar(codigo, "Tenés un descuento"); mostrar(codigo, "Tenés un descuento"); } });
  }

  function arranque(){
    if(cerrado()) return;
    var deUrl = getParam("cupon");
    if(deUrl){ validarYMostrar(deUrl, true); return; }
    var guardado = leer();
    if(guardado){
      // Muestra rápido con el texto guardado; igual sigue válido porque el checkout revalida.
      var txt = leerTxt();
      if(txt) mostrar(guardado, txt); else validarYMostrar(guardado, false);
    }
  }

  window.addEventListener("resize", ajustarPadding);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", arranque);
  else arranque();
})();
