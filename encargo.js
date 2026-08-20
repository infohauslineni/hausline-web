// ============================================================
//  ENCARGO DESDE LA WEB  →  crea una SOLICITUD en el tracking
//  El cliente elige envío (estándar/rápido) y forma de pago
//  (total o abono 50%), ve el total y el monto a pagar ahora,
//  se crea un SOL-#### en Supabase y se muestran las cuentas
//  para transferir + botón de WhatsApp para el comprobante.
//  No cobra en línea: todo es por transferencia.
// ============================================================
(function(){
  "use strict";

  function inyectarEstilos(){
    if(document.getElementById("enc-css")) return;
    const s = document.createElement("style");
    s.id = "enc-css";
    s.textContent = `
      .enc-fondo{position:fixed;inset:0;z-index:9999;display:none;background:rgba(3,4,3,.72);backdrop-filter:blur(4px);align-items:flex-end;justify-content:center;}
      .enc-fondo.activo{display:flex;}
      @media(min-width:640px){.enc-fondo{align-items:center;}}
      .enc-card{width:100%;max-width:460px;max-height:92vh;overflow-y:auto;background:#0e120f;border:1px solid rgba(255,255,255,.09);border-radius:20px 20px 0 0;padding:20px;color:#f3f6f3;font-family:inherit;animation:enc-up .28s ease;}
      @media(min-width:640px){.enc-card{border-radius:20px;}}
      @keyframes enc-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
      .enc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
      .enc-top h3{font-size:18px;font-weight:800;margin:0;letter-spacing:-.01em;}
      .enc-x{width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:none;color:#c3c9c5;font-size:19px;line-height:1;cursor:pointer;flex:none;}
      .enc-prod{display:flex;gap:12px;align-items:center;margin-top:16px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.02);}
      .enc-prod img{width:52px;height:52px;border-radius:10px;object-fit:cover;flex:none;background:#1a211d;}
      .enc-prod .nm{font-weight:700;font-size:14px;line-height:1.25;}
      .enc-prod .mt{font-size:12px;color:#8a938d;margin-top:2px;}
      .enc-f{margin-top:14px;}
      .enc-f label{display:block;font-size:12px;font-weight:600;color:#c3c9c5;margin-bottom:5px;}
      .enc-f input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:11px 12px;color:#fff;font-size:15px;font-family:inherit;outline:none;}
      .enc-f input:focus{border-color:rgba(183,255,0,.5);}
      .enc-row{display:flex;gap:10px;}
      .enc-row .enc-f{flex:1;}
      .enc-sub{font-size:12px;font-weight:600;color:#c3c9c5;margin:16px 0 0;}
      .enc-opts{display:flex;gap:8px;margin-top:7px;}
      .enc-opt{flex:1;border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:10px 11px;cursor:pointer;background:rgba(255,255,255,.02);text-align:left;transition:.15s;}
      .enc-opt.sel{border-color:#b7ff00;background:rgba(183,255,0,.08);}
      .enc-opt b{font-size:13px;display:block;}
      .enc-opt.sel b{color:#b7ff00;}
      .enc-opt small{font-size:11px;color:#8a938d;display:block;margin-top:2px;}
      .enc-cart{margin-top:14px;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;}
      .enc-cart-it{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border-bottom:1px solid rgba(255,255,255,.06);font-size:12.5px;}
      .enc-cart-it:last-child{border-bottom:0;}
      .enc-cart-it b{font-weight:700;}
      .enc-cart-it small{display:block;color:#8a938d;font-size:11px;margin-top:2px;}
      .enc-cart-it .mono{font-family:ui-monospace,Menlo,monospace;font-weight:700;white-space:nowrap;}
      .enc-total{margin-top:16px;padding:14px 16px;border:1px solid rgba(183,255,0,.28);background:rgba(183,255,0,.06);border-radius:12px;}
      .enc-total .line{display:flex;align-items:center;justify-content:space-between;gap:10px;}
      .enc-total .line + .line{margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,.08);}
      .enc-total .k{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a938d;}
      .enc-total .k.hl{color:#b7ff00;}
      .enc-total .v{text-align:right;}
      .enc-total .usd{font-size:16px;font-weight:800;}
      .enc-total .usd.big{font-size:24px;letter-spacing:-.02em;}
      .enc-total .nio{font-size:12px;color:#8ec5ff;font-weight:700;}
      .enc-btn{width:100%;margin-top:16px;border:0;border-radius:12px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;background:#b7ff00;color:#050705;display:flex;align-items:center;justify-content:center;gap:8px;}
      .enc-btn:disabled{opacity:.55;cursor:default;}
      .enc-btn.wa{background:#25d366;color:#052012;}
      .enc-btn.ghost{background:transparent;border:1px solid rgba(255,255,255,.15);color:#f3f6f3;margin-top:9px;font-weight:700;font-size:14px;}
      .enc-btn.ghost:hover{background:rgba(255,255,255,.04);}
      .enc-err{margin-top:12px;color:#ff9a9a;font-size:13px;display:none;}
      .enc-hint{margin-top:12px;font-size:11px;color:#5f6863;line-height:1.5;text-align:center;}
      .enc-ok-ic{width:56px;height:56px;border-radius:50%;background:rgba(183,255,0,.14);color:#b7ff00;display:grid;place-items:center;margin:6px auto 0;font-size:28px;}
      .enc-sol{font-family:ui-monospace,Menlo,monospace;font-weight:800;font-size:20px;color:#b7ff00;text-align:center;margin-top:8px;letter-spacing:.06em;}
      .enc-cta-title{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a938d;margin:18px 0 8px;}
      .enc-acc{border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;}
      .enc-acc .r{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border-bottom:1px solid rgba(255,255,255,.06);}
      .enc-acc .r:last-child{border-bottom:0;}
      .enc-acc .b{font-size:12.5px;font-weight:600;}
      .enc-acc .b small{display:block;color:#8a938d;font-weight:400;font-size:11px;margin-top:1px;}
      .enc-acc .num{font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:700;color:#fff;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:5px 9px;cursor:pointer;white-space:nowrap;}
      .enc-acc .num:active{background:rgba(183,255,0,.15);}
    `;
    document.head.appendChild(s);
  }

  let fondo = null, card = null;
  function ensure(){
    if(fondo) return;
    inyectarEstilos();
    fondo = document.createElement("div");
    fondo.className = "enc-fondo";
    fondo.addEventListener("click", (e)=>{ if(e.target === fondo) cerrar(); });
    card = document.createElement("div");
    card.className = "enc-card";
    fondo.appendChild(card);
    document.body.appendChild(fondo);
  }
  function abrir(){ ensure(); fondo.classList.add("activo"); document.body.style.overflow = "hidden"; }
  function cerrar(){ if(fondo){ fondo.classList.remove("activo"); document.body.style.overflow = ""; } }

  function fmtUSD(n){ return "$" + (Math.round((Number(n)||0)*100)/100).toLocaleString("en-US"); }
  function fmtNIO(n){ return "C$" + (Number(n)||0).toLocaleString("en-US"); }
  function cordobas(usd){ return (typeof cordobasCerrados==="function") ? cordobasCerrados(usd) : Math.ceil((Number(usd)||0)*(typeof HAUSLINE_EXCHANGE_RATE!=="undefined"?HAUSLINE_EXCHANGE_RATE:37)/10)*10; }
  function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function waNumero(){ return (typeof WHATSAPP_NUMERO!=="undefined"&&WHATSAPP_NUMERO) || (typeof WHATSAPP!=="undefined"&&WHATSAPP) || "50578995116"; }
  function envioCfg(){ return (typeof HAUSLINE_ENVIO!=="undefined") ? HAUSLINE_ENVIO : { estandar:{dias:"20 a 25 días",recargo:0}, rapido:{dias:"14 a 17 días",recargo:15} }; }

  // producto: objeto del catálogo. opts: { talla, color, cantidad, precio } (opcional).
  window.abrirEncargo = function(producto, opts){
    if(!producto) return;
    opts = opts || {};
    const nombre = (typeof nombreProducto==="function") ? nombreProducto(producto) : (producto.nombre||"Producto");
    const marca = producto.marca || (typeof marcaProducto==="function" ? marcaProducto(producto) : "");
    const precioU = Number(opts.precio != null ? opts.precio : (typeof precioVigente==="function" ? precioVigente(producto, false) : (producto.precio||0)));
    const img = (producto.imagenes && producto.imagenes[0]) || producto.imagen || producto.foto || "";
    const cfg = envioCfg();
    let cant = Math.max(1, parseInt(opts.cantidad,10) || 1);
    const envio = (opts.envio === 'rapido') ? 'rapido' : 'estandar'; // viene del producto (obligatorio)
    let pago = "total";              // 'total' | '50'

    abrir();
    renderForm();

    function recargo(){ return envio === "rapido" ? (Number(cfg.rapido.recargo)||0) * cant : 0; }
    function calc(){
      const total = precioU * cant + recargo();
      const ahora = pago === "50" ? Math.round(total * 50) / 100 : total;
      return { total, ahora };
    }

    function renderForm(){
      const t = calc();
      card.innerHTML = `
        <div class="enc-top"><h3>Encargar producto</h3><button class="enc-x" type="button" aria-label="Cerrar">&times;</button></div>
        <div class="enc-prod">
          ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">`:""}
          <div><div class="nm">${esc(nombre)}</div><div class="mt">${[esc(marca), "Código "+esc(producto.codigo)].filter(Boolean).join(" · ")}</div></div>
        </div>
        <form class="enc-form" novalidate>
          <div class="enc-f"><label>Tu nombre completo *</label><input name="nombre" autocomplete="name" placeholder="Ej. María Gómez" required></div>
          <div class="enc-f"><label>WhatsApp *</label><input name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="Ej. 8890 1122" required></div>
          <div class="enc-f"><label>Correo (para el seguimiento del pedido)</label><input name="correo" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@correo.com"></div>
          <div class="enc-row">
            <div class="enc-f"><label>Talla / detalle</label><input name="talla" placeholder="Talla o N/A" value="${esc(opts.talla||"")}"></div>
            <div class="enc-f" style="max-width:110px"><label>Cantidad</label><input name="cantidad" type="number" min="1" max="20" value="${cant}"></div>
          </div>

          <p class="enc-sub">¿Cuánto pagas ahora?</p>
          <div class="enc-opts" data-pago>
            <button type="button" class="enc-opt ${pago==='total'?'sel':''}" data-p="total"><b>Pagar todo</b><small>El total completo</small></button>
            <button type="button" class="enc-opt ${pago==='50'?'sel':''}" data-p="50"><b>Abono 50%</b><small>La mitad ahora</small></button>
          </div>

          <div class="enc-total" data-total>${totalHTML(t)}</div>
          <div class="enc-err" data-err></div>
          <button class="enc-btn" type="submit">Crear encargo →</button>
          <div class="enc-hint">Al crear el encargo te contactamos por WhatsApp para coordinar el pago. No se cobra nada en línea. Si no coordinás en 24 h, el encargo se cancela solo.</div>
        </form>`;
      card.querySelector(".enc-x").addEventListener("click", cerrar);
      const form = card.querySelector(".enc-form");
      form.cantidad.addEventListener("input", ()=>{ cant = Math.min(20, Math.max(1, parseInt(form.cantidad.value,10)||1)); refrescar(); });
      card.querySelectorAll("[data-pago] .enc-opt").forEach(b=> b.addEventListener("click", ()=>{ pago = b.dataset.p; marcar("[data-pago]", b); refrescar(); }));
      form.addEventListener("submit", (e)=>{ e.preventDefault(); enviar(form); });
      card.__talla = opts.talla || "";
      form.talla.addEventListener("input", ()=>{ card.__talla = form.talla.value; });
    }
    function marcar(sel, activo){ card.querySelectorAll(sel+" .enc-opt").forEach(x=>x.classList.remove("sel")); activo.classList.add("sel"); }
    function refrescar(){ const box = card.querySelector("[data-total]"); if(box) box.innerHTML = totalHTML(calc()); }

    function totalHTML(t){
      const parcial = pago === "50";
      const envioTxt = envio === "rapido" ? " (incluye envío rápido)" : "";
      return `
        <div class="line"><div class="k">Total del pedido${esc(envioTxt)}</div><div class="v"><span class="usd${parcial?'':' big'}">${fmtUSD(t.total)}</span><div class="nio">≈ ${fmtNIO(cordobas(t.total))}</div></div></div>
        ${parcial ? `<div class="line"><div class="k hl">A pagar ahora (50%)</div><div class="v"><span class="usd big">${fmtUSD(t.ahora)}</span><div class="nio">≈ ${fmtNIO(cordobas(t.ahora))}</div></div></div>` : ``}`;
    }

    async function enviar(form){
      const err = card.querySelector("[data-err]");
      err.style.display = "none";
      const nombreV = form.nombre.value.trim();
      const wa = form.whatsapp.value.trim();
      const correo = form.correo.value.trim();
      const talla = form.talla.value.trim();
      cant = Math.min(20, Math.max(1, parseInt(form.cantidad.value,10)||1));
      if(nombreV.length < 2) return mostrarErr("Escribe tu nombre completo.");
      if(!/^[0-9+ ()-]{7,25}$/.test(wa)) return mostrarErr("Escribe un WhatsApp válido (solo números).");
      if(correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return mostrarErr("El correo no es válido.");

      const btn = form.querySelector(".enc-btn");
      btn.disabled = true; btn.textContent = "Creando…";
      try{
        const url = (typeof SUPABASE_URL!=="undefined" ? SUPABASE_URL : "") + "rpc/crear_solicitud_publica";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type":"application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer "+SUPABASE_ANON_KEY },
          body: JSON.stringify({
            p_nombre: nombreV, p_whatsapp: wa, p_correo: correo||null, p_ciudad: null, p_direccion: null,
            p_producto: nombre, p_producto_codigo: producto.codigo||null, p_marca: marca||null,
            p_talla: talla||null, p_color: opts.color||null, p_cantidad: cant, p_precio_unitario: precioU,
            p_envio: envio, p_recargo: recargo(), p_pago: pago
          })
        });
        if(!res.ok){ throw new Error("HTTP "+res.status); }
        const sol = await res.json();
        renderOk(String(sol), talla);
      }catch(ex){
        btn.disabled = false; btn.innerHTML = "Crear encargo →";
        mostrarErr("No se pudo crear el encargo. Revisa tu internet e inténtalo de nuevo.");
      }
      function mostrarErr(m){ err.textContent = m; err.style.display = "block"; }
    }

    function renderOk(sol, talla){
      const t = calc();
      const parcial = pago === "50";
      const cuentas = (typeof HAUSLINE_CUENTAS!=="undefined" ? HAUSLINE_CUENTAS : []);
      const filas = cuentas.map(c=>`
        <div class="r"><div class="b">${esc(c.banco)}${c.moneda?" · "+esc(c.moneda):""}<small>${esc(c.titular)}</small></div>
        <button class="num" type="button" data-copiar="${esc(c.numero)}" title="Tocar para copiar">${esc(c.numero)}</button></div>`).join("");
      const waMsg = `Hola HAUSLINE 👋, hice mi encargo ${sol}\n`+
        `Producto: ${nombre} (Código ${producto.codigo})\n`+
        (talla?`Talla: ${talla}\n`:"")+
        `Cantidad: ${cant}\n`+
        `Envío: ${envio === "rapido" ? "Rápido" : "Estándar"}\n`+
        `A pagar: ${fmtUSD(t.ahora)}\n`+
        `\nAquí va mi comprobante de la transferencia:`;
      const ayudaMsg = `Hola HAUSLINE 👋, necesito ayuda con mi encargo ${sol} (${nombre}). Mi consulta es: `;
      card.innerHTML = `
        <div class="enc-top"><h3>¡Encargo recibido! ✅</h3><button class="enc-x" type="button" aria-label="Cerrar">&times;</button></div>
        <div class="enc-ok-ic">✓</div>
        <div class="enc-sol">${esc(sol)}</div>
        <p style="text-align:center;color:#e6e9e6;font-size:14px;margin-top:12px;line-height:1.6"><b>En unos momentos te contactamos por WhatsApp</b> para coordinar tu pedido. Si querés adelantar, transferí este monto y mandanos el comprobante 👇</p>
        <div class="enc-total" style="margin-top:16px">
          <div class="line"><div class="k hl">${parcial?'A pagar ahora (abono 50%)':'A pagar'}</div><div class="v"><span class="usd big">${fmtUSD(t.ahora)}</span><div class="nio">≈ ${fmtNIO(cordobas(t.ahora))}</div></div></div>
        </div>
        <div class="enc-cta-title">Transferí a cualquiera de estas cuentas</div>
        <div class="enc-acc">${filas || '<div class="r"><div class="b">Escríbenos por WhatsApp para los datos de pago</div></div>'}</div>
        <a class="enc-btn wa" href="https://wa.me/${waNumero()}?text=${encodeURIComponent(waMsg)}" target="_blank" rel="noopener noreferrer">Enviar comprobante por WhatsApp</a>
        <a class="enc-btn ghost" href="https://wa.me/${waNumero()}?text=${encodeURIComponent(ayudaMsg)}" target="_blank" rel="noopener noreferrer">¿Necesitás ayuda?</a>
        <div class="enc-hint">Guardá tu código <b style="color:#b7ff00">${esc(sol)}</b>. Si no coordinás el pago en 24 h, el encargo se cancela solo.</div>`;
      card.querySelector(".enc-x").addEventListener("click", cerrar);
      card.querySelectorAll("[data-copiar]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const n = b.getAttribute("data-copiar");
          if(navigator.clipboard) navigator.clipboard.writeText(n).catch(()=>{});
          const orig = b.textContent; b.textContent = "¡Copiado!"; setTimeout(()=>{ b.textContent = orig; }, 1200);
        });
      });
    }
  };

  // Encargo desde el CARRITO: crea un encargo (SOL) por cada ítem por encargo, con los
  // mismos datos del cliente. Cada ítem ya trae su tipo de envío elegido.
  window.abrirEncargoCarrito = function(items){
    items = (items||[]).filter(it => it && !it.entregaInmediata);
    if(!items.length){ if(typeof enviarPedidoWhatsApp==="function") enviarPedidoWhatsApp(); return; }
    let pago = "total";
    abrir();
    renderForm();

    function recargoItem(it){ return (it.envio === 'rapido' && typeof HAUSLINE_ENVIO!=='undefined') ? (Number(HAUSLINE_ENVIO.rapido.recargo)||0) * (Number(it.cantidad)||1) : 0; }
    function calc(){
      let total = 0;
      for(const it of items) total += (Number(it.precioUnitario)||0) * (Number(it.cantidad)||1) + recargoItem(it);
      total = Math.round(total*100)/100;
      return { total, ahora: pago==='50' ? Math.round(total*50)/100 : total };
    }
    function totalHTML(t){
      const parcial = pago==='50';
      return `<div class="line"><div class="k">Total del pedido</div><div class="v"><span class="usd${parcial?'':' big'}">${fmtUSD(t.total)}</span><div class="nio">≈ ${fmtNIO(cordobas(t.total))}</div></div></div>
        ${parcial?`<div class="line"><div class="k hl">A pagar ahora (50%)</div><div class="v"><span class="usd big">${fmtUSD(t.ahora)}</span><div class="nio">≈ ${fmtNIO(cordobas(t.ahora))}</div></div></div>`:``}`;
    }
    function renderForm(){
      const lista = items.map(it => `<div class="enc-cart-it"><div><b>${esc(it.nombre)}</b><small>${[esc(it.marca), it.talla?('Talla '+esc(it.talla)):'', '×'+(it.cantidad||1)].filter(Boolean).join(' · ')}${it.envio==='rapido'?' · Rápido':''}</small></div><span class="mono">${fmtUSD((Number(it.precioUnitario)||0)*(it.cantidad||1)+recargoItem(it))}</span></div>`).join("");
      card.innerHTML = `
        <div class="enc-top"><h3>Encargar tu carrito</h3><button class="enc-x" type="button" aria-label="Cerrar">&times;</button></div>
        <div class="enc-cart">${lista}</div>
        <form class="enc-form" novalidate>
          <div class="enc-f"><label>Tu nombre completo *</label><input name="nombre" autocomplete="name" placeholder="Ej. María Gómez" required></div>
          <div class="enc-f"><label>WhatsApp *</label><input name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="Ej. 8890 1122" required></div>
          <div class="enc-f"><label>Correo (para el seguimiento)</label><input name="correo" type="email" inputmode="email" placeholder="tucorreo@correo.com"></div>
          <p class="enc-sub">¿Cuánto pagas ahora?</p>
          <div class="enc-opts" data-pago>
            <button type="button" class="enc-opt ${pago==='total'?'sel':''}" data-p="total"><b>Pagar todo</b><small>El total completo</small></button>
            <button type="button" class="enc-opt ${pago==='50'?'sel':''}" data-p="50"><b>Abono 50%</b><small>La mitad ahora</small></button>
          </div>
          <div class="enc-total" data-total>${totalHTML(calc())}</div>
          <div class="enc-err" data-err></div>
          <button class="enc-btn" type="submit">Crear encargo →</button>
          <div class="enc-hint">Al crear el encargo te contactamos por WhatsApp para coordinar el pago. Si no coordinás en 24 h, se cancela solo.</div>
        </form>`;
      card.querySelector(".enc-x").addEventListener("click", cerrar);
      const form = card.querySelector(".enc-form");
      card.querySelectorAll("[data-pago] .enc-opt").forEach(b=> b.addEventListener("click", ()=>{ pago = b.dataset.p; card.querySelectorAll("[data-pago] .enc-opt").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); const box=card.querySelector("[data-total]"); if(box) box.innerHTML = totalHTML(calc()); }));
      form.addEventListener("submit", (e)=>{ e.preventDefault(); enviar(form); });
    }
    async function enviar(form){
      const err = card.querySelector("[data-err]"); err.style.display="none";
      function showErr(m){ err.textContent=m; err.style.display="block"; }
      const nombre = form.nombre.value.trim(), wa = form.whatsapp.value.trim(), correo = form.correo.value.trim();
      if(nombre.length<2) return showErr("Escribe tu nombre completo.");
      if(!/^[0-9+ ()-]{7,25}$/.test(wa)) return showErr("Escribe un WhatsApp válido (solo números).");
      if(correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return showErr("El correo no es válido.");
      const btn = form.querySelector(".enc-btn"); btn.disabled=true; btn.textContent="Creando…";
      const url = (typeof SUPABASE_URL!=="undefined"?SUPABASE_URL:"") + "rpc/crear_solicitud_publica";
      const sols = [];
      try{
        for(const it of items){
          const res = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":"Bearer "+SUPABASE_ANON_KEY },
            body: JSON.stringify({ p_nombre:nombre, p_whatsapp:wa, p_correo:correo||null, p_ciudad:null, p_direccion:null,
              p_producto:it.nombre, p_producto_codigo:it.codigo||null, p_marca:it.marca||null, p_talla:it.talla||null, p_color:it.color||null,
              p_cantidad:it.cantidad||1, p_precio_unitario:it.precioUnitario||0, p_envio:it.envio==='rapido'?'rapido':'estandar', p_recargo:recargoItem(it), p_pago:pago }) });
          if(!res.ok) throw new Error("HTTP "+res.status);
          sols.push(String(await res.json()));
        }
        if(typeof vaciarCarrito==="function") vaciarCarrito();
        renderOk(sols);
      }catch(ex){ btn.disabled=false; btn.innerHTML="Crear encargo →"; showErr("No se pudo crear el encargo. Revisa tu internet e inténtalo de nuevo."); }
    }
    function renderOk(sols){
      const t = calc();
      const cuentas = (typeof HAUSLINE_CUENTAS!=="undefined"?HAUSLINE_CUENTAS:[]);
      const filas = cuentas.map(c=>`<div class="r"><div class="b">${esc(c.banco)}${c.moneda?" · "+esc(c.moneda):""}<small>${esc(c.titular)}</small></div><button class="num" type="button" data-copiar="${esc(c.numero)}" title="Tocar para copiar">${esc(c.numero)}</button></div>`).join("");
      const codes = sols.join(", ");
      const waMsg = `Hola HAUSLINE 👋, hice mi pedido del carrito (${codes}).\nA pagar: ${fmtUSD(t.ahora)}\n\nAquí va mi comprobante de la transferencia:`;
      card.innerHTML = `
        <div class="enc-top"><h3>¡Pedido recibido! ✅</h3><button class="enc-x" type="button" aria-label="Cerrar">&times;</button></div>
        <div class="enc-ok-ic">✓</div>
        <div class="enc-sol" style="font-size:15px">${esc(codes)}</div>
        <p style="text-align:center;color:#e6e9e6;font-size:14px;margin-top:12px;line-height:1.6"><b>En unos momentos te contactamos por WhatsApp</b> para coordinar tu pedido. Si querés adelantar, transferí este monto y mandanos el comprobante 👇</p>
        <div class="enc-total" style="margin-top:16px"><div class="line"><div class="k hl">${pago==='50'?'A pagar ahora (abono 50%)':'A pagar'}</div><div class="v"><span class="usd big">${fmtUSD(t.ahora)}</span><div class="nio">≈ ${fmtNIO(cordobas(t.ahora))}</div></div></div></div>
        <div class="enc-cta-title">Transferí a cualquiera de estas cuentas</div>
        <div class="enc-acc">${filas || '<div class="r"><div class="b">Escríbenos por WhatsApp para los datos de pago</div></div>'}</div>
        <a class="enc-btn wa" href="https://wa.me/${waNumero()}?text=${encodeURIComponent(waMsg)}" target="_blank" rel="noopener noreferrer">Enviar comprobante por WhatsApp</a>
        <div class="enc-hint">Guardá tus códigos. Si no coordinás el pago en 24 h, el encargo se cancela solo.</div>`;
      card.querySelector(".enc-x").addEventListener("click", cerrar);
      card.querySelectorAll("[data-copiar]").forEach(b=> b.addEventListener("click", ()=>{ const n=b.getAttribute("data-copiar"); if(navigator.clipboard) navigator.clipboard.writeText(n).catch(()=>{}); const o=b.textContent; b.textContent="¡Copiado!"; setTimeout(()=>{b.textContent=o;},1200); }));
    }
  };
})();
