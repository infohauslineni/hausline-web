// ============================================================
//  FOTOS REALES (CONTROL DE CALIDAD) EN LA PÁGINA DEL PRODUCTO
//  Si HAUSLINE tiene ese producto comprado (en camino o ya en Nicaragua) y le subió fotos de
//  control de calidad en el panel (Compras libres), aquí se muestran aunque nadie lo haya
//  comprado todavía. Al venderse dejan de salir. Datos: RPC fotos_calidad_producto (panel)
//  + URLs firmadas del Storage (solo esas fotos son públicas).
//  app.js llama a window.renderCalidadProducto(codigo) al abrir un producto.
// ============================================================
(function(){
  var BASE = (typeof SUPABASE_URL === "string" ? SUPABASE_URL : "").replace(/\/rest\/v1\/?$/, "");
  var KEY = typeof SUPABASE_ANON_KEY === "string" ? SUPABASE_ANON_KEY : "";
  var cache = {};
  var ultimo = null;

  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  function headers(){ return { "Content-Type": "application/json", apikey: KEY, Authorization: "Bearer " + KEY }; }

  function estilos(){
    if(document.getElementById("calidadEstilos")) return;
    var st = document.createElement("style"); st.id = "calidadEstilos";
    st.textContent = ".qc-sec{margin:22px 0 4px;padding:16px;border:1px solid #e7e2d9;border-radius:14px;background:#faf8f4}"
      + ".qc-h{display:flex;align-items:center;gap:8px;margin:0;font-size:15px;font-weight:700;color:#171310}"
      + ".qc-h svg{width:18px;height:18px;stroke:#171310;fill:none;stroke-width:1.8}"
      + ".qc-sub{margin:4px 0 12px;font-size:12.5px;line-height:1.45;color:#6f675c}"
      + ".qc-tira{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}"
      + ".qc-mini{flex:0 0 auto;width:92px;height:92px;border-radius:10px;overflow:hidden;border:1px solid #e7e2d9;background:#fff;padding:0;cursor:zoom-in}"
      + ".qc-mini img{width:100%;height:100%;object-fit:cover;display:block}"
      + ".qc-tag{display:inline-block;margin:0 0 8px;padding:3px 9px;border-radius:99px;background:#efe9df;font-size:11.5px;font-weight:600;color:#4a433a}"
      + ".qc-ver{position:fixed;inset:0;z-index:9999;background:rgba(10,9,8,.94);display:flex;align-items:center;justify-content:center}"
      + ".qc-ver img{max-width:94vw;max-height:84vh;border-radius:10px}"
      + ".qc-x,.qc-nav{position:absolute;border:0;background:rgba(255,255,255,.14);color:#fff;border-radius:99px;width:44px;height:44px;font-size:22px;cursor:pointer}"
      + ".qc-x{top:16px;right:16px}.qc-prev{left:12px;top:50%;transform:translateY(-50%)}.qc-next{right:12px;top:50%;transform:translateY(-50%)}"
      + ".qc-cnt{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:#fff;font-size:13px;opacity:.8}";
    document.head.appendChild(st);
  }

  async function cargar(codigo){
    if(cache[codigo]) return cache[codigo];
    var r = await fetch(BASE + "/rest/v1/rpc/fotos_calidad_producto", { method: "POST", headers: headers(), body: JSON.stringify({ p_codigo: codigo }) });
    if(!r.ok) return (cache[codigo] = []);
    var filas = await r.json();
    if(!Array.isArray(filas) || !filas.length) return (cache[codigo] = []);
    var s = await fetch(BASE + "/storage/v1/object/sign/pedidos", { method: "POST", headers: headers(), body: JSON.stringify({ expiresIn: 21600, paths: filas.map(function(f){ return f.storage_path; }) }) });
    if(!s.ok) return (cache[codigo] = []);
    var firmadas = await s.json();
    var fotos = filas.map(function(f, i){
      var u = firmadas && firmadas[i] && firmadas[i].signedURL;
      return u ? { url: BASE + "/storage/v1" + u, talla: f.talla_color || "", enCamino: !!f.en_camino } : null;
    }).filter(Boolean);
    return (cache[codigo] = fotos);
  }

  function visor(fotos, inicio){
    var i = inicio;
    var ov = document.createElement("div"); ov.className = "qc-ver"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Fotos de control de calidad");
    ov.innerHTML = '<img alt="Foto real de control de calidad"><button class="qc-x" type="button" aria-label="Cerrar">&times;</button>'
      + (fotos.length > 1 ? '<button class="qc-nav qc-prev" type="button" aria-label="Anterior">‹</button><button class="qc-nav qc-next" type="button" aria-label="Siguiente">›</button>' : "")
      + '<span class="qc-cnt"></span>';
    var img = ov.querySelector("img"), cnt = ov.querySelector(".qc-cnt");
    function pintar(){ img.src = fotos[i].url; cnt.textContent = fotos.length > 1 ? (i + 1) + " / " + fotos.length : ""; }
    function cerrar(){ ov.remove(); document.removeEventListener("keydown", tecla); }
    function mover(d){ i = (i + d + fotos.length) % fotos.length; pintar(); }
    function tecla(e){ if(e.key === "Escape") cerrar(); else if(e.key === "ArrowRight") mover(1); else if(e.key === "ArrowLeft") mover(-1); }
    ov.addEventListener("click", function(e){ if(e.target === ov || e.target.classList.contains("qc-x")) cerrar(); else if(e.target.classList.contains("qc-prev")) mover(-1); else if(e.target.classList.contains("qc-next")) mover(1); });
    document.addEventListener("keydown", tecla);
    document.body.appendChild(ov); pintar();
  }

  window.renderCalidadProducto = async function(codigo){
    var resenas = document.getElementById("modalResenas");
    var cont = document.getElementById("modalCalidad");
    if(!cont && resenas){ cont = document.createElement("div"); cont.id = "modalCalidad"; resenas.parentNode.insertBefore(cont, resenas); }
    if(!cont) return;
    cont.innerHTML = "";
    if(!codigo || !BASE || !KEY) return;
    ultimo = codigo;
    var fotos;
    try{ fotos = await cargar(String(codigo).toUpperCase()); }catch(e){ return; }
    if(ultimo !== codigo || !fotos.length) return;
    estilos();
    var tallas = fotos.map(function(f){ return f.talla; }).filter(function(t, i, a){ return t && a.indexOf(t) === i; });
    var enCamino = fotos.every(function(f){ return f.enCamino; });
    cont.innerHTML = '<section class="qc-sec">'
      + '<h3 class="qc-h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3l2-3h8l2 3h3v13H3z"/><circle cx="12" cy="13" r="4"/></svg>Fotos reales del producto</h3>'
      + '<p class="qc-sub">Control de calidad de HAUSLINE: así es la pieza que ' + (enCamino ? "viene en camino" : "tenemos en Nicaragua") + '. Toque una foto para verla en grande.</p>'
      + (tallas.length ? '<span class="qc-tag">' + (tallas.length === 1 ? "Talla / detalle: " : "Tallas: ") + esc(tallas.join(" · ")) + "</span>" : "")
      + '<div class="qc-tira">' + fotos.map(function(f, i){ return '<button type="button" class="qc-mini" data-qc="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + esc(f.url) + '" alt="Control de calidad ' + (i + 1) + '" loading="lazy" decoding="async"></button>'; }).join("") + "</div>"
      + "</section>";
    cont.querySelectorAll("[data-qc]").forEach(function(b){ b.addEventListener("click", function(){ visor(fotos, Number(b.getAttribute("data-qc")) || 0); }); });
  };

  // Entrando directo a /p/CODIGO el producto se abre antes de que cargue este archivo.
  try{ if(typeof productoActual !== "undefined" && productoActual && productoActual.codigo) window.renderCalidadProducto(productoActual.codigo); }catch(e){}
})();
