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
      .enc-card{width:100%;max-width:460px;max-height:min(92vh, 100%);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#0e120f;border:1px solid rgba(255,255,255,.09);border-radius:20px 20px 0 0;padding:20px;color:#f3f6f3;font-family:inherit;animation:enc-up .28s ease;}
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

      /* ===== Pasarela de pago (pantalla de éxito) ===== */
      .enc-card{position:relative;}
      .pz-x{position:absolute;top:16px;right:16px;z-index:2;}
      .pz-hero{text-align:center;padding:6px 0 2px;}
      .pz-check{width:64px;height:64px;border-radius:50%;background:#b7ff00;color:#052012;display:grid;place-items:center;margin:0 auto;font-size:32px;font-weight:900;box-shadow:0 0 0 8px rgba(183,255,0,.12);}
      .pz-title{font-size:22px;font-weight:800;letter-spacing:-.02em;margin:14px 0 0;}
      .pz-sub{font-size:12.5px;color:#8a938d;margin:6px 0 10px;}
      .pz-code{display:inline-block;font-family:ui-monospace,Menlo,monospace;font-weight:800;font-size:17px;color:#b7ff00;letter-spacing:.08em;background:rgba(183,255,0,.08);border:1px solid rgba(183,255,0,.3);border-radius:10px;padding:7px 16px;}
      .pz-pay{margin-top:18px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:16px 18px;border:1px solid rgba(183,255,0,.28);background:rgba(183,255,0,.055);border-radius:16px;}
      .pz-pay-k{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#b7ff00;}
      .pz-pay-usd{font-size:34px;font-weight:900;letter-spacing:-.02em;line-height:1.05;margin-top:2px;}
      .pz-pay-nio{font-size:13px;color:#8ec5ff;font-weight:700;margin-top:2px;}
      .pz-clock{display:flex;gap:9px;align-items:flex-start;max-width:190px;}
      .pz-clock .ic{width:32px;height:32px;border-radius:50%;background:rgba(183,255,0,.12);color:#b7ff00;display:grid;place-items:center;flex:none;font-size:16px;}
      .pz-clock b{font-size:13px;display:block;}
      .pz-clock small{font-size:11px;color:#8a938d;line-height:1.45;display:block;margin-top:2px;}
      .pz-sec{display:flex;align-items:center;gap:10px;margin:22px 0 12px;color:#8a938d;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;justify-content:center;}
      .pz-sec::before,.pz-sec::after{content:"";height:1px;flex:1;background:rgba(183,255,0,.18);max-width:60px;}
      .pz-steps{display:flex;align-items:flex-start;gap:4px;padding:14px 8px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.02);}
      .pz-step{flex:1;text-align:center;min-width:0;}
      .pz-step .n{width:30px;height:30px;border-radius:50%;background:#b7ff00;color:#052012;font-weight:800;font-size:13px;display:grid;place-items:center;margin:0 auto;}
      .pz-step .em{font-size:19px;margin-top:7px;line-height:1;}
      .pz-step b{display:block;font-size:11.5px;margin-top:6px;}
      .pz-step small{display:block;font-size:10px;color:#8a938d;line-height:1.35;margin-top:2px;}
      .pz-step .ar{align-self:center;color:#b7ff00;font-size:15px;flex:none;padding-top:6px;}
      .pz-acc-title{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;margin:20px 0 9px;}
      .pz-acc-title .em{font-size:15px;}
      .pz-accs{display:flex;flex-direction:column;gap:9px;}
      .pz-acc-row{display:flex;align-items:center;gap:11px;flex-wrap:wrap;padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.02);}
      .pz-badge{width:40px;height:40px;border-radius:50%;flex:none;display:grid;place-items:center;color:#fff;font-size:9px;font-weight:800;text-align:center;line-height:1.05;letter-spacing:.02em;}
      .pz-acc-info{flex:1;min-width:110px;}
      .pz-acc-info b{font-size:13px;font-weight:700;display:block;}
      .pz-acc-info small{font-size:11px;color:#8a938d;display:block;margin-top:1px;}
      .pz-acc-right{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:7px;}
      .pz-acc-num{text-align:right;}
      .pz-acc-num .lbl{font-size:10px;color:#8a938d;text-transform:uppercase;letter-spacing:.06em;display:block;}
      .pz-acc-num .val{font-family:ui-monospace,Menlo,monospace;font-size:14px;font-weight:800;}
      .pz-copy{flex:none;border:1px solid rgba(183,255,0,.35);background:rgba(183,255,0,.06);color:#b7ff00;border-radius:9px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
      .pz-copy:active{background:rgba(183,255,0,.18);}
      .pz-wa{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px;padding:14px 16px;border:1px solid rgba(37,211,102,.35);background:rgba(37,211,102,.07);border-radius:14px;}
      .pz-wa .tx{flex:1;min-width:150px;}
      .pz-wa b{font-size:13.5px;display:flex;align-items:center;gap:7px;}
      .pz-wa small{font-size:11.5px;color:#a7b0aa;display:block;margin-top:2px;}
      .pz-wa a{flex:none;background:#25d366;color:#052012;border-radius:11px;padding:11px 16px;font-size:13px;font-weight:800;text-decoration:none;white-space:nowrap;}
      .pz-help{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:11px;padding:13px 16px;border:1px solid rgba(255,255,255,.1);border-radius:14px;}
      .pz-help .tx{flex:1;min-width:150px;}
      .pz-help b{font-size:13px;display:flex;align-items:center;gap:7px;}
      .pz-help small{font-size:11.5px;color:#8a938d;display:block;margin-top:2px;}
      .pz-help a{flex:none;border:1px solid rgba(255,255,255,.18);color:#f3f6f3;border-radius:11px;padding:10px 15px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap;}
      .pz-again{width:100%;margin-top:14px;border:1px solid rgba(183,255,0,.4);background:rgba(183,255,0,.07);color:#b7ff00;border-radius:12px;padding:13px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;}
      .pz-again:hover{background:rgba(183,255,0,.12);}
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
  // ── Teclado del teléfono (iOS/Android) ───────────────────────────────────
  // La hoja es fija (position:fixed) y anclada abajo; al abrir el teclado el `vh`
  // NO cambia, así que la parte de abajo del formulario (correo, botón) quedaba
  // TAPADA por el teclado y no se podía subir a verla. Con VisualViewport
  // ajustamos la altura/posición de la hoja al área visible real (encima del
  // teclado) y llevamos el campo enfocado a la vista.
  function ajustarTeclado(){
    if(!fondo || !fondo.classList.contains("activo") || !window.visualViewport) return;
    const vv = window.visualViewport;
    fondo.style.height = vv.height + "px";
    fondo.style.top = vv.offsetTop + "px";
    fondo.style.bottom = "auto";
  }
  function resetTeclado(){ if(fondo){ fondo.style.height = ""; fondo.style.top = ""; fondo.style.bottom = ""; } }
  function onFocusIn(e){
    if(!card || !card.contains(e.target)) return;
    // Espera a que el teclado termine de abrir y centra el campo dentro de la hoja.
    setTimeout(() => { try{ e.target.scrollIntoView({ block:"center", behavior:"smooth" }); }catch(_){} }, 250);
  }
  function abrir(){
    ensure(); fondo.classList.add("activo"); document.body.style.overflow = "hidden";
    if(window.visualViewport){ window.visualViewport.addEventListener("resize", ajustarTeclado); window.visualViewport.addEventListener("scroll", ajustarTeclado); }
    document.addEventListener("focusin", onFocusIn);
    ajustarTeclado();
  }
  function cerrar(){
    if(fondo){ fondo.classList.remove("activo"); document.body.style.overflow = ""; }
    if(window.visualViewport){ window.visualViewport.removeEventListener("resize", ajustarTeclado); window.visualViewport.removeEventListener("scroll", ajustarTeclado); }
    document.removeEventListener("focusin", onFocusIn);
    resetTeclado();
  }

  function fmtUSD(n){ return "$" + (Math.round((Number(n)||0)*100)/100).toLocaleString("en-US"); }
  function fmtNIO(n){ return "C$" + (Number(n)||0).toLocaleString("en-US"); }
  function cordobas(usd){ return (typeof cordobasCerrados==="function") ? cordobasCerrados(usd) : Math.ceil((Number(usd)||0)*(typeof HAUSLINE_EXCHANGE_RATE!=="undefined"?HAUSLINE_EXCHANGE_RATE:37)/10)*10; }
  function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function waNumero(){ return (typeof WHATSAPP_NUMERO!=="undefined"&&WHATSAPP_NUMERO) || (typeof WHATSAPP!=="undefined"&&WHATSAPP) || "50578995116"; }
  function envioCfg(){ return (typeof HAUSLINE_ENVIO!=="undefined") ? HAUSLINE_ENVIO : { estandar:{dias:"20 a 25 días",recargo:0}, rapido:{dias:"14 a 17 días",recargo:15} }; }

  // Pastilla de color por banco para la lista de cuentas de la pasarela.
  function badgeCuenta(c){
    const banco=(c.banco||"").toUpperCase(), moneda=(c.moneda||"").toLowerCase();
    if(banco.includes("LAFISE")) return { bg:(moneda.indexOf("d")===0||moneda.includes("dól")||moneda.includes("dol")?"#12a15a":"#0e8a8a"), label:"LAFISE" };
    if(banco.includes("BAC")) return { bg:"#c0392b", label:"BAC" };
    if(banco.includes("BILLETERA")||banco.includes("MOVIL")||banco.includes("MÓVIL")) return { bg:"#7c4dbd", label:"📱" };
    return { bg:"#3a3f3c", label:(c.banco||"").slice(0,5).toUpperCase() };
  }
  function esBilletera(c){ const b=(c.banco||"").toLowerCase(); return b.includes("billetera")||b.includes("movil")||b.includes("móvil"); }

  // HTML de la pasarela de pago (pantalla de éxito), compartido por producto y carrito.
  // o = { titulo, subCodigo, codigo, montoAhora, parcial, waMsg, ayudaMsg }
  function pasarelaOkHTML(o){
    const cuentas=(typeof HAUSLINE_CUENTAS!=="undefined"?HAUSLINE_CUENTAS:[]);
    const usd=fmtUSD(o.montoAhora), nio=fmtNIO(cordobas(o.montoAhora));
    const filas=cuentas.map(c=>{
      const bd=badgeCuenta(c);
      return `<div class="pz-acc-row">
        <span class="pz-badge" style="background:${bd.bg}">${bd.label}</span>
        <div class="pz-acc-info"><b>${esc(c.banco)}${c.moneda?" · "+esc(c.moneda):""}</b><small>${esc(c.titular)}</small></div>
        <div class="pz-acc-right"><div class="pz-acc-num"><span class="lbl">${esBilletera(c)?"Número":"Cuenta"}</span><span class="val">${esc(c.numero)}</span></div><button class="pz-copy" type="button" data-copiar="${esc(c.numero)}">⧉ Copiar</button></div>
      </div>`;
    }).join("");
    const accs = filas || `<div class="pz-acc-row"><div class="pz-acc-info"><b>Escríbenos por WhatsApp para los datos de pago</b></div></div>`;
    return `
      <button class="enc-x pz-x" type="button" aria-label="Cerrar">&times;</button>
      <div class="pz-hero">
        <div class="pz-check">✓</div>
        <h3 class="pz-title">${esc(o.titulo)}</h3>
        <div class="pz-sub">${esc(o.subCodigo)}</div>
        <div class="pz-code">${esc(o.codigo)}</div>
      </div>
      <div class="pz-pay">
        <div><div class="pz-pay-k">${o.parcial?"Total a pagar (50%)":"Total a pagar"}</div><div class="pz-pay-usd">${usd}</div><div class="pz-pay-nio">≈ ${nio}</div></div>
        <div class="pz-clock"><span class="ic">⏱</span><div><b>Tenés 24 horas para pagar</b><small>Si no recibimos tu pago en este tiempo, tu encargo será cancelado.</small></div></div>
      </div>
      <div class="pz-sec">¿Cómo pagar?</div>
      <div class="pz-steps">
        <div class="pz-step"><div class="n">1</div><div class="em">🏦</div><b>Elegí una cuenta</b><small>La cuenta a la que vas a transferir</small></div>
        <div class="ar">→</div>
        <div class="pz-step"><div class="n">2</div><div class="em">📲</div><b>Transferí el monto</b><small>Enviá exactamente ${usd}</small></div>
        <div class="ar">→</div>
        <div class="pz-step"><div class="n">3</div><div class="em">💬</div><b>Enviá tu comprobante</b><small>Subí tu comprobante por WhatsApp</small></div>
      </div>
      <div class="pz-acc-title"><span class="em">🚚</span> Transferí a cualquiera de estas cuentas</div>
      <div class="pz-accs">${accs}</div>
      <div class="pz-wa"><div class="tx"><b>💬 Enviá tu comprobante por WhatsApp</b><small>Subí tu comprobante para confirmar tu pago</small></div><a href="https://wa.me/${waNumero()}?text=${encodeURIComponent(o.waMsg)}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp ↗</a></div>
      <div class="pz-help"><div class="tx"><b>🎧 ¿Necesitás ayuda?</b><small>Escribinos por WhatsApp y te ayudamos.</small></div><a href="https://wa.me/${waNumero()}?text=${encodeURIComponent(o.ayudaMsg)}" target="_blank" rel="noopener noreferrer">Contactar soporte</a></div>
      <button class="pz-again" type="button">🛍️ Encargar otro producto</button>
      <div class="enc-hint">Guardá tu código <b style="color:#b7ff00">${esc(o.codigo)}</b> para dar seguimiento a tu pedido. Si no coordinás el pago en 24 h, se cancela solo.</div>`;
  }
  function bindPasarela(){
    const x=card.querySelector(".enc-x"); if(x) x.addEventListener("click", cerrar);
    // "Encargar otro producto": cierra el comprobante y vuelve al catálogo (misma pestaña).
    const again=card.querySelector(".pz-again"); if(again) again.addEventListener("click", ()=>{ cerrar(); window.location.href = "/"; });
    card.querySelectorAll("[data-copiar]").forEach(b=>b.addEventListener("click", ()=>{
      const n=b.getAttribute("data-copiar"); if(navigator.clipboard) navigator.clipboard.writeText(n).catch(()=>{});
      const o=b.innerHTML; b.innerHTML="✓ ¡Copiado!"; setTimeout(()=>{ b.innerHTML=o; }, 1200);
    }));
  }

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
            p_envio: envio, p_recargo: recargo(), p_pago: pago, p_imagen: img||null
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

    function renderOk(sol){
      // Nuevo flujo: en vez de mostrar un modal de pago, mandamos al checkout dedicado
      // (/checkout/?c=CODE), una página completa de pago. El código va en la URL y la
      // página lee el encargo desde la base por su código.
      window.location.href = "/checkout/?c=" + encodeURIComponent(sol);
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
              p_cantidad:it.cantidad||1, p_precio_unitario:it.precioUnitario||0, p_envio:it.envio==='rapido'?'rapido':'estandar', p_recargo:recargoItem(it), p_pago:pago, p_imagen:it.imagen||null }) });
          if(!res.ok) throw new Error("HTTP "+res.status);
          sols.push(String(await res.json()));
        }
        if(typeof vaciarCarrito==="function") vaciarCarrito();
        renderOk(sols);
      }catch(ex){ btn.disabled=false; btn.innerHTML="Crear encargo →"; showErr("No se pudo crear el encargo. Revisa tu internet e inténtalo de nuevo."); }
    }
    function renderOk(sols){
      // El carrito crea varios encargos: los pasamos todos al checkout separados por coma.
      window.location.href = "/checkout/?c=" + encodeURIComponent(sols.join(","));
    }
  };
})();
