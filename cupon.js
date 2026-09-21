// ============================================================
// HAUSLINE · Cupón desde el link del correo (Brevo)
// El correo de Brevo lleva un enlace a:  hauslineshopni.es/?cupon=CODIGO
// Este script:
//   1) Lee ?cupon=CODIGO de la URL.
//   2) Lo valida contra la base con la RPC pública validar_cupon (no lo consume).
//   3) Lo guarda en localStorage para que el checkout lo autocomplete solo.
//   4) Muestra una ETIQUETA FLOTANTE chica (esquina inferior izquierda) con el código;
//      tocarla copia el código. NO es una barra ancha ni tapa el contenido.
//
// La etiqueta es position:fixed y se AUTO-REPARA: la tienda re-renderiza el DOM al navegar
// (abrir un producto, cambiar de categoría) y la borraba; un MutationObserver la vuelve a
// poner sola. Si el cliente la cierra (×), se queda cerrada por el resto de la visita.
// ============================================================
(function(){
  "use strict";

  var SB_URL = (typeof SUPABASE_URL !== "undefined") ? SUPABASE_URL : "";
  var SB_KEY = (typeof SUPABASE_ANON_KEY !== "undefined") ? SUPABASE_ANON_KEY : "";
  var STORE_KEY = "hausline_cupon";
  var TXT_KEY   = "hausline_cupon_txt";
  var CERRADO_KEY = "hausline_cupon_cerrado";

  var estado = { codigo: "", corto: "" };
  var obs = null;

  function getParam(n){ try{ return new URLSearchParams(location.search).get(n) || ""; }catch(e){ return ""; } }
  function guardar(c, corto){ try{ localStorage.setItem(STORE_KEY, c); localStorage.setItem(TXT_KEY, corto || ""); }catch(e){} }
  function leer(){ try{ return localStorage.getItem(STORE_KEY) || ""; }catch(e){ return ""; } }
  function leerTxt(){ try{ return localStorage.getItem(TXT_KEY) || ""; }catch(e){ return ""; } }
  function borrar(){ try{ localStorage.removeItem(STORE_KEY); localStorage.removeItem(TXT_KEY); }catch(e){} }
  function cerrado(){ try{ return sessionStorage.getItem(CERRADO_KEY) === "1"; }catch(e){ return false; } }
  function marcarCerrado(){ try{ sessionStorage.setItem(CERRADO_KEY, "1"); }catch(e){} }

  // Texto corto para la etiqueta: "10% OFF" o "US$ 5 OFF".
  function etiquetaCorta(r){
    if(String(r.tipo) === "porcentaje") return Number(r.valor) + "% OFF";
    return "US$ " + Number(r.valor).toFixed(0) + " OFF";
  }

  function inyectarCss(){
    if(document.getElementById("cuponCss")) return;
    var st = document.createElement("style"); st.id = "cuponCss";
    st.textContent =
      "#cuponChip{position:fixed;left:14px;z-index:850;"
      + "bottom:calc(84px + env(safe-area-inset-bottom,0px));"
      + "display:flex;align-items:center;gap:8px;background:#171310;color:#F7F3EC;"
      + "border-radius:999px;padding:7px 9px 7px 13px;font-family:inherit;"
      + "box-shadow:0 8px 24px rgba(0,0,0,.28);animation:cupPop .35s cubic-bezier(.2,.9,.3,1.2);cursor:pointer}"
      + "@keyframes cupPop{from{transform:translateY(14px) scale(.9);opacity:0}to{transform:none;opacity:1}}"
      + "#cuponChip .cc-tag{font-size:14px;line-height:1}"
      + "#cuponChip .cc-tx{font-size:12.5px;line-height:1.15;font-weight:600;letter-spacing:.2px}"
      + "#cuponChip .cc-tx b{display:block;font-weight:800;letter-spacing:.5px;font-size:12.5px}"
      + "#cuponChip .cc-tx small{font-size:10.5px;font-weight:600;opacity:.75}"
      + "#cuponChip .cc-x{flex:none;width:20px;height:20px;border-radius:999px;border:0;cursor:pointer;"
      + "background:rgba(247,243,236,.14);color:#F7F3EC;font-size:14px;line-height:1;display:grid;place-items:center}"
      + "#cuponChip .cc-x:hover{background:rgba(247,243,236,.28)}"
      + "#cuponChip.copiado{background:#12a15a}"
      + "@media(min-width:900px){#cuponChip{bottom:22px}}";
    document.head.appendChild(st);
  }

  function construirChip(){
    if(document.getElementById("cuponChip") || !estado.codigo) return;
    inyectarCss();
    var el = document.createElement("div"); el.id = "cuponChip"; el.setAttribute("role","status");
    el.setAttribute("title", "Tocá para copiar el código");
    el.innerHTML =
      '<span class="cc-tag">🎟️</span>'
      + '<span class="cc-tx"><b class="cc-code">' + estado.codigo + '</b><small>' + estado.corto + ' · tocá para copiar</small></span>'
      + '<button type="button" class="cc-x" aria-label="Cerrar">&times;</button>';
    document.body.appendChild(el);

    function copiar(){
      try{ if(navigator.clipboard) navigator.clipboard.writeText(estado.codigo); }catch(e){}
      el.classList.add("copiado");
      var small = el.querySelector(".cc-tx small"); var prev = small ? small.textContent : "";
      if(small) small.textContent = "¡Copiado!";
      setTimeout(function(){ el.classList.remove("copiado"); if(small) small.textContent = prev; }, 1400);
    }
    // Tocar la etiqueta (menos la ×) copia el código.
    el.addEventListener("click", function(e){ if(e.target.closest(".cc-x")) return; copiar(); });
    el.querySelector(".cc-x").addEventListener("click", function(e){
      e.stopPropagation();
      marcarCerrado(); if(obs){ obs.disconnect(); obs = null; } el.remove();
    });
  }

  // Observa el body: si la tienda re-renderiza y borra la etiqueta, la volvemos a poner
  // (a menos que el cliente la haya cerrado). No hay bucle: al recrearla ya existe.
  function vigilar(){
    if(obs || cerrado()) return;
    try{
      obs = new MutationObserver(function(){
        if(!cerrado() && estado.codigo && !document.getElementById("cuponChip")) construirChip();
      });
      obs.observe(document.body, { childList: true });
    }catch(e){}
  }

  function mostrar(codigo, corto){
    estado.codigo = codigo; estado.corto = corto || "Descuento";
    if(cerrado()) return;
    construirChip();
    vigilar();
  }

  function validarYMostrar(codigo, esDeUrl){
    codigo = (codigo || "").trim();
    if(!codigo || cerrado()) return;
    if(!SB_URL || !SB_KEY){ if(esDeUrl){ guardar(codigo, "Descuento"); mostrar(codigo, "Descuento"); } return; }
    fetch(SB_URL + "rpc/validar_cupon", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
      body: JSON.stringify({ p_codigo: codigo, p_total: 0 })
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(r){
        if(r && r.valido){ var corto = etiquetaCorta(r); guardar(r.codigo, corto); mostrar(r.codigo, corto); }
        else { borrar(); } // inválido/vencido/agotado: no molestar
      })
      .catch(function(){ if(esDeUrl){ guardar(codigo, "Descuento"); mostrar(codigo, "Descuento"); } });
  }

  function arranque(){
    if(cerrado()) return;
    var deUrl = getParam("cupon");
    if(deUrl){ validarYMostrar(deUrl, true); return; }
    var guardado = leer();
    if(guardado){
      var corto = leerTxt();
      if(corto) mostrar(guardado, corto); else validarYMostrar(guardado, false);
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", arranque);
  else arranque();
})();
