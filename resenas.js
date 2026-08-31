// ============================================================
//  RESEÑAS DE CLIENTES (reales, moderadas)
//  Lee reseñas aprobadas desde Supabase (RPC públicas) y las
//  muestra en la página de producto y en el inicio. Si no hay
//  reseñas o falla la red, no rompe nada: simplemente no aparece.
// ============================================================
(function(){
  "use strict";

  function inyectarEstilos(){
    if(document.getElementById("resenas-css")) return;
    const s = document.createElement("style");
    s.id = "resenas-css";
    s.textContent = `
      .resenas{margin-top:26px;}
      .resenas-cab{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;}
      .resenas-cab h3{font-size:16px;font-weight:800;margin:0;letter-spacing:-.01em;}
      .resenas-prom{display:flex;align-items:center;gap:8px;}
      .resenas-prom .num{font-size:15px;font-weight:800;}
      .resenas-prom .cnt{font-size:12px;color:#8a938d;}
      .estrellas{display:inline-flex;gap:2px;line-height:1;}
      .estrellas svg{width:15px;height:15px;}
      .estrellas .on{fill:#b7ff00;}
      .estrellas .off{fill:none;stroke:#5f6863;stroke-width:1.5;}
      .resena-lista{display:flex;flex-direction:column;gap:11px;}
      .resena-card{border:1px solid rgba(255,255,255,.09);border-radius:13px;padding:14px 15px;background:rgba(255,255,255,.02);}
      .resena-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px;}
      .resena-nombre{font-size:13.5px;font-weight:700;}
      .resena-fecha{font-size:11px;color:#8a938d;white-space:nowrap;}
      .resena-txt{font-size:13px;line-height:1.55;color:#c3c9c5;}
      .resena-foto{margin-top:10px;}
      .resena-foto img{width:100%;max-width:220px;border-radius:10px;border:1px solid rgba(255,255,255,.1);display:block;}
      /* Producto reseñado: mini tarjeta para que se vea el modelo */
      .resena-producto{display:flex;align-items:center;gap:10px;margin-top:11px;padding:7px 9px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:rgba(255,255,255,.02);cursor:pointer;transition:border-color .15s,background .15s;}
      .resena-producto:hover{border-color:rgba(183,255,0,.4);background:rgba(255,255,255,.04);}
      .resena-producto img{width:48px;height:48px;object-fit:cover;border-radius:8px;flex:0 0 auto;background:#0c0e0d;}
      .resena-producto-nombre{font-size:12px;font-weight:700;color:#c3c9c5;line-height:1.35;}
      /* Sección del inicio */
      .resenas-home .fila{display:flex;gap:14px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;}
      .resenas-home .resena-card{flex:0 0 82%;max-width:340px;scroll-snap-align:start;}
      @media(min-width:720px){.resenas-home .resena-card{flex:0 0 320px;}}
      .resenas-home-prom{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
      .resenas-home-prom .num{font-size:20px;font-weight:900;}
      .resenas-home-prom .cnt{font-size:13px;color:#8a938d;}
      /* Estrellas de la tarjeta: pill sobre la foto, esquina superior izquierda */
      .card-rating{display:inline-flex;align-items:center;gap:5px;background:rgba(5,5,5,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:3px 8px;border-radius:999px;}
      .card-rating:empty{display:none;}
      .card-rating .estrellas svg{width:12px;height:12px;}
      .card-rating .cnt{font-size:10px;color:#e7ebe8;font-weight:700;}
    `;
    document.head.appendChild(s);
  }

  function esc(v){ return String(v ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }

  async function rpc(nombre, cuerpo){
    if(typeof SUPABASE_URL === "undefined" || !SUPABASE_URL) return null;
    try{
      const res = await fetch(SUPABASE_URL + "rpc/" + nombre, {
        method: "POST",
        headers: { "Content-Type":"application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + SUPABASE_ANON_KEY },
        body: JSON.stringify(cuerpo || {}),
      });
      if(!res.ok) return null;
      return await res.json();
    }catch(e){ return null; }
  }

  function estrellasHTML(n){
    const val = Math.round(Number(n) || 0);
    let out = '<span class="estrellas" aria-label="' + val + ' de 5 estrellas">';
    for(let i=1;i<=5;i++){
      out += `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="${i<=val?'on':'off'}" d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`;
    }
    return out + "</span>";
  }

  function fecha(iso){
    try{
      return new Date(iso).toLocaleDateString("es-NI", { day:"numeric", month:"short", year:"numeric" });
    }catch(e){ return ""; }
  }

  function cardHTML(r, opts){
    const mostrarProducto = !!(opts && opts.mostrarProducto);
    const foto = r.foto_url ? `<div class="resena-foto"><img src="${esc(r.foto_url)}" alt="Foto de reseña de ${esc(r.cliente_nombre)}" loading="lazy"></div>` : "";
    const txt = r.comentario ? `<p class="resena-txt">${esc(r.comentario)}</p>` : "";
    // Foto del producto reseñado: para que la gente vea cuál fue el modelo.
    // Solo en la sección del inicio; en la página del producto sería redundante.
    // Clic abre el producto (app.js escucha [data-codigo] fuera de .card).
    const prod = (mostrarProducto && typeof buscarProducto === "function" && r.producto_codigo) ? buscarProducto(r.producto_codigo) : null;
    const nombre = prod ? (typeof nombreProducto === "function" ? nombreProducto(prod) : (prod.nombre || prod.codigo)) : "";
    const producto = (prod && prod.imagen) ? `<div class="resena-producto" data-codigo="${esc(prod.codigo)}" role="button" tabindex="0" title="Ver ${esc(nombre)}">
        <img src="${esc(prod.imagen)}" alt="${esc(nombre)}" loading="lazy">
        <span class="resena-producto-nombre">${esc(nombre)}</span>
      </div>` : "";
    return `<div class="resena-card">
      <div class="resena-top">
        <span class="resena-nombre">${esc(r.cliente_nombre)}</span>
        <span class="resena-fecha">${esc(fecha(r.created_at))}</span>
      </div>
      ${estrellasHTML(r.estrellas)}
      ${txt}${foto}${producto}
    </div>`;
  }

  // ── Reseñas de UN producto (se llama al abrir la vista de producto) ──────────
  window.renderResenasProducto = async function(codigo){
    inyectarEstilos();
    const cont = document.getElementById("modalResenas");
    if(!cont || !codigo) return;
    cont.innerHTML = "";
    const [lista, resumen] = await Promise.all([
      rpc("resenas_producto", { p_codigo: codigo, p_limit: 20 }),
      rpc("resenas_resumen", { p_codigo: codigo }),
    ]);
    if(!Array.isArray(lista) || lista.length === 0) return; // sin reseñas: no se muestra nada
    const prom = resumen && resumen.promedio ? resumen.promedio : lista.reduce((a,r)=>a+r.estrellas,0)/lista.length;
    const total = resumen && resumen.total ? resumen.total : lista.length;
    cont.innerHTML = `
      <section class="resenas">
        <div class="resenas-cab">
          <h3>Reseñas</h3>
          <span class="resenas-prom">${estrellasHTML(prom)} <span class="num">${Number(prom).toFixed(1)}</span> <span class="cnt">(${total})</span></span>
        </div>
        <div class="resena-lista">${lista.map(cardHTML).join("")}</div>
      </section>`;
  };

  // ── Sección del inicio: "Clientes que ya compraron con HAUSLINE" ─────────────
  async function renderResenasHome(){
    const sec = document.getElementById("seccionResenas");
    if(!sec) return;
    inyectarEstilos();
    const [dest, resumen] = await Promise.all([
      rpc("resenas_destacadas", { p_limit: 8 }),
      rpc("resenas_resumen", {}),
    ]);
    if(!Array.isArray(dest) || dest.length === 0){ sec.hidden = true; return; }
    const prom = resumen && resumen.promedio ? resumen.promedio : 5;
    const total = resumen && resumen.total ? resumen.total : dest.length;
    const fila = document.getElementById("filaResenas");
    const cab = document.getElementById("resenasResumen");
    if(cab) cab.innerHTML = `${estrellasHTML(prom)} <span class="num">${Number(prom).toFixed(1)}</span> <span class="cnt">· ${total} ${total===1?"reseña":"reseñas"}</span>`;
    if(fila) fila.innerHTML = dest.map(function(r){ return cardHTML(r, { mostrarProducto:true }); }).join("");
    sec.hidden = false;
  }

  // ── Estrellas en las tarjetas del catálogo (debajo de Encargar/Añadir) ──────
  var ratingsMap = null;
  var fillProgramado = false;
  function estrellasMiniHTML(prom, total){
    return estrellasHTML(prom) + '<span class="cnt">(' + (Number(total) || 0) + ')</span>';
  }
  function llenarTarjetas(){
    if(!ratingsMap) return;
    document.querySelectorAll(".card-rating:not([data-done])").forEach(function(el){
      el.setAttribute("data-done", "1");
      var code = (el.getAttribute("data-rating") || "").toUpperCase();
      var r = ratingsMap[code];
      if(r && r.total > 0) el.innerHTML = estrellasMiniHTML(r.promedio, r.total);
    });
  }
  function programarLlenado(){
    if(fillProgramado) return;
    fillProgramado = true;
    requestAnimationFrame(function(){ fillProgramado = false; llenarTarjetas(); });
  }
  async function iniciarEstrellasTarjetas(){
    inyectarEstilos();
    var datos = await rpc("resenas_resumen_todos", {});
    if(!Array.isArray(datos)) return; // sin reseñas / migración sin aplicar: no pasa nada
    ratingsMap = {};
    datos.forEach(function(d){ if(d && d.producto_codigo) ratingsMap[String(d.producto_codigo).toUpperCase()] = { promedio: d.promedio, total: d.total }; });
    llenarTarjetas();
    // Las tarjetas se re-renderizan al navegar: un observer llena las nuevas.
    try{ new MutationObserver(programarLlenado).observe(document.body, { childList: true, subtree: true }); }catch(e){}
  }

  // Arranca cuando el DOM está listo.
  function iniciarTodo(){ renderResenasHome(); iniciarEstrellasTarjetas(); }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", iniciarTodo);
  } else {
    iniciarTodo();
  }
})();
