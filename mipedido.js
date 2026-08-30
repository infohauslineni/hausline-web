// ============================================================
//  VOLVER A MI PEDIDO
//  Si el cliente creó un encargo (guardado por encargo.js en
//  localStorage), le mostramos un acceso para volver a su página
//  de pago (/checkout/?c=CODE) — así puede ver las cuentas y el
//  estado aunque haya cerrado la página. Solo aparece si el pedido
//  sigue PENDIENTE (no pagado/vencido).
// ============================================================
(function(){
  "use strict";
  var KEY = "hausline_pedidos";

  function leer(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "[]"); }catch(e){ return []; }
  }
  function guardar(arr){
    try{ localStorage.setItem(KEY, JSON.stringify(arr)); }catch(e){}
  }

  function inyectarEstilos(){
    if(document.getElementById("mp-css")) return;
    var s = document.createElement("style");
    s.id = "mp-css";
    s.textContent = `
      .mp-bar{display:grid;grid-template-columns:auto 1fr auto;gap:9px 12px;align-items:center;margin:14px 0 0;padding:13px 15px;border:1px solid rgba(183,255,0,.35);background:rgba(183,255,0,.06);border-radius:14px;animation:mp-in .25s ease;}
      .mp-bar .ic{grid-row:1;font-size:22px;line-height:1;}
      .mp-bar .tx{grid-row:1;min-width:0;}
      .mp-bar .tx b{display:block;font-size:13.5px;color:#f3f6f3;}
      .mp-bar .tx small{font-size:12px;color:#8a938d;}
      .mp-bar .mp-x{grid-row:1;background:none;border:0;color:#8a938d;font-size:20px;line-height:1;cursor:pointer;padding:2px 4px;}
      .mp-bar a.mp-go{grid-column:1 / -1;grid-row:2;background:#b7ff00;color:#050705;font-weight:800;font-size:13px;padding:11px 15px;border-radius:10px;text-decoration:none;text-align:center;}
      @media(min-width:560px){
        .mp-bar{grid-template-columns:auto 1fr auto auto;}
        .mp-bar a.mp-go{grid-column:3;grid-row:1;}
        .mp-bar .mp-x{grid-column:4;}
      }
      @keyframes mp-in{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
    `;
    document.head.appendChild(s);
  }

  function esc(v){ return String(v ?? "").replace(/[&<>"]/g, function(c){ return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[c]; }); }

  async function estadoPendiente(codigo){
    // Si podemos, consultamos el estado: solo mostramos si sigue pendiente. Si la
    // consulta falla (sin red), devolvemos true para no esconder el acceso.
    if(typeof SUPABASE_URL === "undefined" || !SUPABASE_URL) return true;
    try{
      var res = await fetch(SUPABASE_URL + "rpc/obtener_solicitud_publica", {
        method: "POST",
        headers: { "Content-Type":"application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + SUPABASE_ANON_KEY },
        body: JSON.stringify({ p_codigo: codigo })
      });
      if(!res.ok) return true;
      var s = await res.json();
      if(!s) return true;
      return s.estado === "pendiente";
    }catch(e){ return true; }
  }

  function mostrar(pedido){
    inyectarEstilos();
    var cont = document.querySelector("#vistaInicio .contenedor");
    if(!cont || document.getElementById("mpBar")) return;
    var bar = document.createElement("div");
    bar.className = "mp-bar";
    bar.id = "mpBar";
    var detalle = pedido.producto ? ("Pedido " + esc(pedido.codigo) + " · " + esc(pedido.producto)) : ("Pedido " + esc(pedido.codigo));
    bar.innerHTML =
      '<span class="ic">🧾</span>' +
      '<div class="tx"><b>Tenés un pedido en proceso</b><small>' + detalle + ' — mirá las cuentas y el estado.</small></div>' +
      '<a class="mp-go" href="/checkout/?c=' + encodeURIComponent(pedido.codigo) + '">Ver mi pedido</a>' +
      '<button class="mp-x" type="button" aria-label="Ocultar">&times;</button>';
    cont.insertBefore(bar, cont.firstChild);
    bar.querySelector(".mp-x").addEventListener("click", function(){
      bar.remove();
      try{ sessionStorage.setItem("mp_oculto", "1"); }catch(e){}
    });
  }

  async function init(){
    try{ if(sessionStorage.getItem("mp_oculto")) return; }catch(e){}
    var lista = leer().filter(function(p){ return p && p.codigo && (Date.now() - (p.ts || 0)) < 6 * 86400000; });
    if(!lista.length) return;
    var reciente = lista[lista.length - 1];
    var pendiente = await estadoPendiente(reciente.codigo);
    if(!pendiente){
      // Ya pagado o vencido: lo quitamos de la lista para no volver a ofrecerlo.
      guardar(lista.filter(function(p){ return p.codigo !== reciente.codigo; }));
      return;
    }
    mostrar(reciente);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
