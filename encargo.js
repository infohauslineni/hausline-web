// ============================================================
//  ENCARGO DESDE LA WEB  →  crea una SOLICITUD en el tracking
//  El cliente llena sus datos, se crea un SOL-#### en Supabase
//  (proyecto del tracking) y se le muestran las cuentas para
//  transferir + botón de WhatsApp para el comprobante.
//  No cobra en línea: todo es por transferencia. No gasta código
//  HS: eso pasa cuando el admin confirma el pago en su panel.
// ============================================================
(function(){
  "use strict";

  // ---- estilos (se inyectan una sola vez) ----
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
      .enc-total{margin-top:16px;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid rgba(183,255,0,.28);background:rgba(183,255,0,.06);border-radius:12px;}
      .enc-total .k{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a938d;}
      .enc-total .usd{font-size:24px;font-weight:800;letter-spacing:-.02em;}
      .enc-total .nio{font-size:13px;color:#8ec5ff;font-weight:700;text-align:right;}
      .enc-btn{width:100%;margin-top:16px;border:0;border-radius:12px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;background:#b7ff00;color:#050705;display:flex;align-items:center;justify-content:center;gap:8px;}
      .enc-btn:disabled{opacity:.55;cursor:default;}
      .enc-btn.wa{background:#25d366;color:#052012;}
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

  function fmtUSD(n){ return "$" + (Number(n)||0).toLocaleString("en-US"); }
  function fmtNIO(n){ return "C$" + (Number(n)||0).toLocaleString("en-US"); }
  function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function waNumero(){ return (typeof WHATSAPP_NUMERO!=="undefined"&&WHATSAPP_NUMERO) || (typeof WHATSAPP!=="undefined"&&WHATSAPP) || "50578995116"; }

  // producto: el objeto del catálogo. opts: { talla, color, cantidad } (opcional, del detalle).
  window.abrirEncargo = function(producto, opts){
    if(!producto) return;
    opts = opts || {};
    const nombre = (typeof nombreProducto==="function") ? nombreProducto(producto) : (producto.nombre||"Producto");
    const marca = producto.marca || (typeof marcaProducto==="function" ? marcaProducto(producto) : "");
    const precioU = Number(opts.precio != null ? opts.precio : (typeof precioVigente==="function" ? precioVigente(producto, false) : (producto.precio||0)));
    const img = (producto.imagenes && producto.imagenes[0]) || producto.imagen || producto.foto || "";
    let cant = Math.max(1, parseInt(opts.cantidad,10) || 1);

    abrir();
    renderForm();

    function totales(){
      const usd = precioU * cant;
      return { usd, nio: (typeof cordobasCerrados==="function") ? cordobasCerrados(usd) : Math.ceil(usd*(typeof HAUSLINE_EXCHANGE_RATE!=="undefined"?HAUSLINE_EXCHANGE_RATE:37)/10)*10 };
    }

    function renderForm(){
      const t = totales();
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
          <div class="enc-total">
            <div><div class="k">Total a pagar</div><div class="usd" data-usd>${fmtUSD(t.usd)}</div></div>
            <div class="nio" data-nio>≈ ${fmtNIO(t.nio)}<br><span style="color:#5f6863;font-weight:400">C$${typeof HAUSLINE_EXCHANGE_RATE!=="undefined"?HAUSLINE_EXCHANGE_RATE:37} × US$</span></div>
          </div>
          <div class="enc-err" data-err></div>
          <button class="enc-btn" type="submit">Crear encargo →</button>
          <div class="enc-hint">Al crear el encargo verás nuestras cuentas para transferir. No se cobra nada en línea. Si no pagas en 24 h, el encargo se cancela solo.</div>
        </form>`;
      card.querySelector(".enc-x").addEventListener("click", cerrar);
      const form = card.querySelector(".enc-form");
      const inpCant = form.cantidad;
      inpCant.addEventListener("input", ()=>{
        cant = Math.min(20, Math.max(1, parseInt(inpCant.value,10)||1));
        const t2 = totales();
        card.querySelector("[data-usd]").textContent = fmtUSD(t2.usd);
        card.querySelector("[data-nio]").innerHTML = "≈ "+fmtNIO(t2.nio)+'<br><span style="color:#5f6863;font-weight:400">C$'+(typeof HAUSLINE_EXCHANGE_RATE!=="undefined"?HAUSLINE_EXCHANGE_RATE:37)+' × US$</span>';
      });
      form.addEventListener("submit", (e)=>{ e.preventDefault(); enviar(form); });
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
            p_talla: talla||null, p_color: opts.color||null, p_cantidad: cant, p_precio_unitario: precioU
          })
        });
        if(!res.ok){ throw new Error("HTTP "+res.status); }
        const sol = await res.json();
        renderOk(String(sol));
      }catch(ex){
        btn.disabled = false; btn.innerHTML = "Crear encargo →";
        mostrarErr("No se pudo crear el encargo. Revisa tu internet e inténtalo de nuevo.");
      }
      function mostrarErr(m){ err.textContent = m; err.style.display = "block"; }
    }

    function renderOk(sol){
      const t = totales();
      const cuentas = (typeof HAUSLINE_CUENTAS!=="undefined" ? HAUSLINE_CUENTAS : []);
      const filas = cuentas.map(c=>`
        <div class="r"><div class="b">${esc(c.banco)}${c.moneda?" · "+esc(c.moneda):""}<small>${esc(c.titular)}</small></div>
        <button class="num" type="button" data-copiar="${esc(c.numero)}" title="Tocar para copiar">${esc(c.numero)}</button></div>`).join("");
      const waMsg = `Hola HAUSLINE 👋, hice mi encargo ${sol}\n`+
        `Producto: ${nombre} (Código ${producto.codigo})\n`+
        (tallaSel()?`Talla: ${tallaSel()}\n`:"")+
        `Cantidad: ${cant}\n`+
        `Total: ${fmtUSD(t.usd)} / ${fmtNIO(t.nio)}\n\n`+
        `Aquí va mi comprobante de la transferencia:`;
      card.innerHTML = `
        <div class="enc-top"><h3>¡Encargo creado!</h3><button class="enc-x" type="button" aria-label="Cerrar">&times;</button></div>
        <div class="enc-ok-ic">✓</div>
        <div class="enc-sol">${esc(sol)}</div>
        <p style="text-align:center;color:#8a938d;font-size:13px;margin-top:8px;line-height:1.5">Guardamos tu encargo. Para confirmarlo, transferí el total y envianos el comprobante por WhatsApp.</p>
        <div class="enc-total" style="margin-top:16px"><div><div class="k">Total a pagar</div><div class="usd">${fmtUSD(t.usd)}</div></div><div class="nio">≈ ${fmtNIO(t.nio)}</div></div>
        <div class="enc-cta-title">Transferí a cualquiera de estas cuentas</div>
        <div class="enc-acc">${filas || '<div class="r"><div class="b">Escríbenos por WhatsApp para los datos de pago</div></div>'}</div>
        <a class="enc-btn wa" href="https://wa.me/${waNumero()}?text=${encodeURIComponent(waMsg)}" target="_blank" rel="noopener noreferrer">Enviar comprobante por WhatsApp</a>
        <div class="enc-hint">Si no confirmás el pago en 24 h, el encargo se cancela solo. ¡Gracias por tu compra!</div>`;
      card.querySelector(".enc-x").addEventListener("click", cerrar);
      card.querySelectorAll("[data-copiar]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const n = b.getAttribute("data-copiar");
          if(navigator.clipboard) navigator.clipboard.writeText(n).catch(()=>{});
          const orig = b.textContent; b.textContent = "¡Copiado!"; setTimeout(()=>{ b.textContent = orig; }, 1200);
        });
      });
      function tallaSel(){ return (card.__talla||"").trim(); }
    }
    // recordamos la talla escrita para el mensaje de WhatsApp del éxito
    card.__talla = opts.talla || "";
    const obs = ()=>{ const i = card.querySelector('input[name="talla"]'); if(i) card.__talla = i.value; };
    card.addEventListener("input", obs);
  };
})();
