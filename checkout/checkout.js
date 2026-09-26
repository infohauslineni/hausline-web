// ============================================================
//  CHECKOUT HAUSLINE · e-commerce moderno, 3 pasos (páginas)
//  /checkout/?paso=info            → 1. Información (datos del cliente)
//  /checkout/?c=SOL-####&paso=pago → 2. Pago (cuentas + comprobante)
//  /checkout/?c=SOL-####&paso=confirmacion → 3. ¡Gracias!
//  El pedido se crea (SOL-####) al terminar el paso 1. El código sigue
//  siendo SOL hasta que el admin confirme el pago en el panel.
// ============================================================
(function(){
  "use strict";

  var SB_URL  = (typeof SUPABASE_URL !== "undefined") ? SUPABASE_URL : "";
  var SB_KEY  = (typeof SUPABASE_ANON_KEY !== "undefined") ? SUPABASE_ANON_KEY : "";
  var CUENTAS = (typeof HAUSLINE_CUENTAS !== "undefined") ? HAUSLINE_CUENTAS : [];
  var RATE    = (typeof HAUSLINE_EXCHANGE_RATE !== "undefined") ? Number(HAUSLINE_EXCHANGE_RATE) : 37;
  var ENVCFG  = (typeof HAUSLINE_ENVIO !== "undefined") ? HAUSLINE_ENVIO : { estandar:{dias:"20 a 25 días",recargo:0}, rapido:{dias:"15 a 20 días",recargo:15} };
  var WA      = (typeof WHATSAPP_NUMERO !== "undefined" && WHATSAPP_NUMERO) || (typeof WHATSAPP !== "undefined" && WHATSAPP) || "50578995116";
  // Demora extendida (config.js): el mayor retraso entre los productos del pedido en curso.
  function demoraPend(pend){
    if(!pend) return null;
    var ds=(pend.tipo==="carrito" ? (pend.items||[]).map(function(it){ return it.demora; }) : [pend.producto && pend.producto.demora]).filter(Boolean);
    if(!ds.length) return null;
    var extra=Math.max.apply(null, ds.map(function(d){ return Number(d.extra)||0; }));
    var conNota=ds.filter(function(d){ return d.nota; })[0];
    return { extra:extra, nota:conNota ? conNota.nota : "" };
  }
  function diasEnvio(flag, pend){
    var m=ENVCFG[flag], d=demoraPend(pend);
    return (d && m && m.diasMin != null && typeof diasConDemora==="function") ? diasConDemora(m, d.extra) : m.dias;
  }
  function cordobas(usdv){ return (typeof cordobasCerrados === "function") ? cordobasCerrados(usdv) : Math.ceil((Number(usdv)||0)*RATE/10)*10; }

  function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function usd(n){ return "$" + (Number(n)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function nio(n){ return "C$" + Math.round(Number(n)||0).toLocaleString("en-US"); }
  function $(id){ return document.getElementById(id); }
  function imgUrl(src){ if(!src) return ""; return /^https?:\/\//i.test(src) ? src : "/" + String(src).replace(/^\.?\//,""); }
  function esCordoba(c){ var m=String(c&&c.moneda||"").toLowerCase(); return m.indexOf("c")===0||m.indexOf("cór")>=0||m.indexOf("cor")>=0; }
  function esBilletera(c){ var b=String(c&&c.banco||"").toLowerCase(); return b.indexOf("billetera")>=0||b.indexOf("movil")>=0||b.indexOf("móvil")>=0; }
  function badge(c){
    var b=String(c.banco||"").toUpperCase(), m=String(c.moneda||"").toLowerCase();
    if(b.indexOf("LAFISE")>=0) return { bg:(m.indexOf("d")===0||m.indexOf("dól")>=0||m.indexOf("dol")>=0?"#12a15a":"#0e8a8a"), label:"LAFISE" };
    if(b.indexOf("BAC")>=0) return { bg:"#c0392b", label:"BAC" };
    if(b.indexOf("BILLETERA")>=0||b.indexOf("MOVIL")>=0||b.indexOf("MÓVIL")>=0) return { bg:"#7c4dbd", label:"📱" };
    return { bg:"#3a3f4c", label:b.slice(0,5) };
  }

  var ICON = {
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>',
    truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/></svg>',
    wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2z"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  var toastT;
  function toast(msg){ var t=$("toast"); if(!t) return; t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove("show"); },1500); }
  function copiar(v){ if(navigator.clipboard) navigator.clipboard.writeText(v).catch(function(){}); }
  function wireCopy(root){ root.querySelectorAll("[data-copy]").forEach(function(b){ b.addEventListener("click", function(e){ e.stopPropagation(); copiar(b.getAttribute("data-copy")); toast(b.getAttribute("data-msg")||"Copiado"); var o=b.textContent; b.classList.add("ok"); b.textContent="✓ Copiado"; setTimeout(function(){ b.classList.remove("ok"); b.textContent=o; },1200); }); }); }

  // Comprobante: al elegir la foto NO se sube ni se crea/confirma nada todavía — se muestra
  // una miniatura con "Comprobante listo", y el cliente puede "Cambiar" (si se equivocó de
  // imagen) o quitarla. El envío real ocurre recién cuando toca el botón de confirmar
  // (onChange avisa para que ese botón cambie de texto cuando hay un archivo listo).
  function wireComprobante(onChange){
    var upInput=$("upInput"), upDrop=$("upDrop"), upPreview=$("upPreview"), upStatus=$("upStatus");
    var staged=null;
    function setStatus(t,m){ if(!upStatus) return; upStatus.hidden=false; upStatus.className="up-status up-"+t; upStatus.textContent=m; }
    function clearStatus(){ if(upStatus){ upStatus.hidden=true; upStatus.textContent=""; } }
    function mostrarDrop(){ if(upDrop) upDrop.style.display=""; if(upPreview){ upPreview.hidden=true; upPreview.innerHTML=""; } }
    function quitar(){ staged=null; if(upInput) upInput.value=""; mostrarDrop(); if(onChange) onChange(null); }
    function mostrarPreview(file){
      if(!upPreview) return;
      var esImg=/^image\//.test(file.type||"");
      var thumb=esImg?'<img src="'+URL.createObjectURL(file)+'" alt="Comprobante">':'<span class="up-pdf">PDF</span>';
      upPreview.innerHTML=thumb
        +'<div class="up-preview-info"><b>'+ICON.check+' Comprobante listo</b><small>'+esc(file.name||"archivo")+'</small></div>'
        +'<button type="button" class="up-preview-cambiar" id="upCambiar">Cambiar</button>'
        +'<button type="button" class="up-preview-quitar" id="upQuitar" aria-label="Quitar comprobante">'+ICON.close+'</button>';
      upPreview.hidden=false;
      if(upDrop) upDrop.style.display="none";
      var camb=$("upCambiar"); if(camb) camb.addEventListener("click", function(){ if(upInput) upInput.click(); });
      var qui=$("upQuitar"); if(qui) qui.addEventListener("click", quitar);
    }
    if(upInput) upInput.addEventListener("change", function(){
      clearStatus();
      var file=this.files&&this.files[0]; if(!file) return;
      if(!/^(image\/|application\/pdf)/.test(file.type||"")){ setStatus("error","Formato no válido. Subí una imagen o PDF."); this.value=""; return; }
      if(file.size>6*1024*1024){ setStatus("error","El archivo pesa demasiado (máx. 6 MB)."); this.value=""; return; }
      staged=file; mostrarPreview(file); if(onChange) onChange(file);
    });
    return { get file(){ return staged; }, quitar:quitar };
  }

  // Animación del camión de HAUSLINE mientras se crea el pedido ("Creando tu pedido…").
  function inyectarCamionCSS(){
    if($("camionCss")) return;
    var st=document.createElement("style"); st.id="camionCss";
    st.textContent=".cam-ov{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:24px;background:rgba(15,23,41,.92);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:camf .3s ease;font-family:var(--font)}"
      +"@keyframes camf{from{opacity:0}to{opacity:1}}.cam-w{width:100%;max-width:440px;text-align:center}"
      +".cam-stage{position:relative;height:156px;border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#1b2233,#0c111c);border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 70px rgba(0,0,0,.55)}"
      +".cam-road{position:absolute;left:0;right:0;bottom:0;height:44px;background:#141a27;border-top:2px solid rgba(255,255,255,.07)}"
      +".cam-lane{position:absolute;left:-48px;right:-48px;top:20px;height:3px;border-radius:2px;background:repeating-linear-gradient(90deg,rgba(79,70,229,.7) 0 24px,transparent 24px 48px);animation:caml .45s linear infinite}"
      +"@keyframes caml{to{transform:translateX(-48px)}}"
      +".cam-van{position:absolute;bottom:24px;left:0;width:158px;height:76px;animation:camd 2.6s cubic-bezier(.45,0,.15,1) forwards}"
      +"@keyframes camd{0%{transform:translateX(-180px)}45%{transform:translateX(120px)}62%{transform:translateX(120px)}100%{transform:translateX(560px)}}"
      +".cam-wheel{transform-box:fill-box;transform-origin:center;animation:cams .42s linear infinite}@keyframes cams{to{transform:rotate(360deg)}}"
      +".cam-t{margin-top:24px;font-size:22px;font-weight:800;color:#fff;opacity:0;transform:translateY(8px);animation:camp .45s ease .5s forwards}.cam-t b{color:#8b83ff}"
      +".cam-s{margin-top:7px;font-size:13.5px;color:#aab2c5;opacity:0;transform:translateY(8px);animation:camp .45s ease .8s forwards}"
      +"@keyframes camp{to{opacity:1;transform:none}}"
      +"@media(prefers-reduced-motion:reduce){.cam-van{animation:none;left:50%;transform:translateX(-50%)}.cam-wheel,.cam-lane{animation:none}.cam-t,.cam-s{animation-delay:.05s}}";
    document.head.appendChild(st);
  }
  function mostrarCamion(texto){
    try{
      inyectarCamionCSS();
      var ov=document.createElement("div"); ov.className="cam-ov"; ov.id="camOv";
      ov.innerHTML='<div class="cam-w"><div class="cam-stage"><div class="cam-road"><div class="cam-lane"></div></div>'
        +'<svg class="cam-van" viewBox="0 0 158 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        +'<ellipse cx="72" cy="70" rx="66" ry="5" fill="rgba(0,0,0,.35)"/>'
        +'<g><rect x="26" y="4" width="26" height="14" rx="2" fill="#c9c4f7"/><rect x="37.5" y="4" width="3" height="14" fill="#8b83ff"/></g>'
        +'<rect x="4" y="20" width="96" height="34" rx="6" fill="#f4f6fb"/><rect x="4" y="44" width="96" height="8" fill="#4f46e5"/>'
        +'<text x="12" y="37" font-family="Arial" font-size="11" font-weight="800" letter-spacing="1" fill="#10131e">HAUSLINE</text>'
        +'<path d="M100 26 h30 a6 6 0 0 1 5 3 l7 12 a4 4 0 0 1 .6 2 v9 a2 2 0 0 1 -2 2 h-40.6 a2 2 0 0 1 -2 -2 V28 a2 2 0 0 1 2 -2 z" fill="#f4f6fb"/>'
        +'<path d="M129 30 h4 a3 3 0 0 1 2.5 1.4 l5.2 8.6 h-11.7 z" fill="#2b3145"/>'
        +'<g class="cam-wheel"><circle cx="30" cy="56" r="10" fill="#141826"/><circle cx="30" cy="56" r="3.4" fill="#4f46e5"/></g>'
        +'<g class="cam-wheel"><circle cx="112" cy="56" r="10" fill="#141826"/><circle cx="112" cy="56" r="3.4" fill="#4f46e5"/></g></svg></div>'
        +'<div class="cam-t">'+esc(texto||"Creando tu pedido…")+' <b>🚚</b></div><div class="cam-s">Un momento, estamos registrando tu pedido…</div></div>';
      document.body.appendChild(ov); document.body.style.overflow="hidden";
    }catch(_){}
  }

  var comprobanteSubido=false; // se pone true al subir el comprobante en este dispositivo
  // Diálogo modal reutilizable. cuerpo puede llevar HTML seguro. Devuelve Promise<boolean>
  // (true = botón principal / ok, false = cancelar / cerrar).
  function dlg(o){
    return new Promise(function(resolve){
      var ov=document.createElement("div"); ov.className="dlg-ov";
      ov.innerHTML='<div class="dlg" role="dialog" aria-modal="true"><div class="dlg-ic '+(o.tono||"warn")+'">'+(o.icon||ICON.alert)+'</div><h3>'+esc(o.titulo)+'</h3><p>'+(o.cuerpo||"")+'</p><div class="dlg-btns"><button class="btn dlg-ok">'+esc(o.okTxt||"Continuar")+'</button>'+(o.cancelTxt?'<button class="btn-ghost dlg-cancel">'+esc(o.cancelTxt)+'</button>':'')+'</div></div>';
      document.body.appendChild(ov); document.body.style.overflow="hidden";
      requestAnimationFrame(function(){ ov.classList.add("show"); });
      function done(v){ ov.classList.remove("show"); document.body.style.overflow=""; setTimeout(function(){ try{ov.remove();}catch(_){}} ,200); resolve(v); }
      ov.addEventListener("click", function(e){ if(e.target===ov) done(false); });
      ov.querySelector(".dlg-ok").addEventListener("click", function(){ done(true); });
      var c=ov.querySelector(".dlg-cancel"); if(c) c.addEventListener("click", function(){ done(false); });
    });
  }

  // ---- Progreso ----
  function progreso(n){
    function step(i,lb){ var c=n>i?"done":(n===i?"on":""); return '<div class="prog-step '+c+'"><span class="prog-dot">'+(n>i?"✓":i)+'</span><span class="prog-lb">'+lb+'</span></div>'; }
    function line(i){ return '<div class="prog-line'+(n>i?" on":"")+'"></div>'; }
    $("prog").innerHTML = '<div class="prog">'+step(1,"Información")+line(1)+step(2,"Pago")+line(2)+step(3,"Confirmación")+'</div>';
  }

  // ---- Resumen del pedido (columna lateral) ----
  // o = { items:[{nombre,marca,imagen,cantidad,lineTotal}], subtotal, descuento, cuponCodigo,
  //       total, ahora, parcial, codigo, envioDias }
  function resumenHTML(o){
    var filas = o.items.map(function(it){
      var f=imgUrl(it.imagen);
      return '<div class="sum-item"><div class="sum-thumb-wrap">'
        + (f?'<img class="sum-thumb" src="'+esc(f)+'" alt="" onerror="this.style.visibility=\'hidden\'">':'<div class="sum-thumb"></div>')
        + ((Number(it.cantidad)||1)>1?'<span class="sum-qty">'+(Number(it.cantidad)||1)+'</span>':'')
        + '</div><div class="sum-info"><b>'+esc(it.nombre)+'</b>'+(it.marca||it.talla?'<small>'+[it.marca?esc(it.marca):'',it.talla?('Talla '+esc(it.talla)):''].filter(Boolean).join(' · ')+'</small>':'')+'</div>'
        + '<span class="sum-lp">'+usd(it.lineTotal)+'</span></div>';
    }).join("");
    var rows = '<div class="sum-row"><span>Subtotal</span><span class="v">'+usd(o.subtotal)+'</span></div>';
    if(o.descuento>0) rows += '<div class="sum-row"><span>Descuento'+(o.cuponCodigo?" ("+esc(o.cuponCodigo)+")":"")+'</span><span class="v" style="color:var(--ok)">− '+usd(o.descuento)+'</span></div>';
    rows += '<div class="sum-row"><span>Envío</span><span class="v">'+(o.envioIntl?'A cotizar':'Coordinado')+'</span></div>';
    var grand = '<div class="sum-grand"><span class="lb">'+(o.parcial?"Anticipo hoy":"Total a pagar")+'</span><span class="amt"><b>'+usd(o.ahora)+'</b><small>≈ '+nio(cordobas(o.ahora))+'</small></span></div>';
    var pill = o.parcial ? '<div style="text-align:right"><span class="sum-pill">Abono 50% · total '+usd(o.total)+'</span></div>' : '';
    var code = o.codigo ? '<div class="sum-code"><span>Código de pedido</span><b>'+esc(o.codigo)+'</b></div>' : '';
    // Varios productos: se envían JUNTOS cuando todos estén listos.
    var unidades = o.items.reduce(function(s,it){ return s + (Number(it.cantidad)||1); }, 0);
    var juntos = unidades > 1 ? '<div class="sum-row" style="padding-top:8px;display:block;font-size:12.5px;line-height:1.5;color:var(--ink-2)">📦 Tu pedido tiene '+unidades+' productos: se envían <b style="color:var(--ink)">todos juntos una vez que estén fabricados y revisados</b>.</div>' : '';
    var dias = o.envioDias ? '<div class="sum-row" style="padding-top:8px"><span>Entrega estimada</span><span class="v" style="font-family:var(--font)">'+esc(o.envioDias)+'</span></div>'
      + (typeof textoTiemposEnvio==="function" ? '<div class="sum-row" style="display:block;padding-top:4px;font-size:12px;line-height:1.5;color:var(--ink-2)">'+esc(textoTiemposEnvio(ENVCFG[o.envioFlag]||ENVCFG.estandar))+'</div>' : '') : '';
    // Aviso de demora extendida (producto de un proveedor que tarda más).
    var demora = (o.demora && typeof textoAvisoDemora==="function") ? '<div class="sum-row" style="margin-top:8px;display:block;padding:10px 12px;border:1px solid #f0c36d;background:#fff7e6;border-radius:10px;font-size:12.5px;line-height:1.5;color:#6b4a0c">⏳ '+esc(textoAvisoDemora(o.demora))+'</div>' : '';
    return '<div class="sumcard rv"><h3 class="sum-h">Tu pedido</h3>'+filas+'<div class="sum-sep"></div>'+rows+dias+demora+juntos+grand+pill+code
      + '<div class="sum-trust"><span>'+ICON.shield+' Compra protegida</span><span>'+ICON.truck+' Seguimiento en vivo</span></div></div>';
  }

  // ---- Lectura de solicitudes ----
  function leerCodigos(){
    var p=new URLSearchParams(location.search); var raw=p.get("c")||p.get("codigo")||p.get("sol")||"";
    if(!raw && location.hash) raw=location.hash.replace(/^#/,"");
    return raw.split(",").map(function(s){ return s.trim().toUpperCase(); }).filter(Boolean).slice(0,10);
  }
  async function fetchGrupo(codigo){
    var res=await fetch(SB_URL+"rpc/obtener_solicitud_grupo",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_codigo:codigo})});
    if(!res.ok) return null; var data=await res.json(); return (Array.isArray(data)&&data.length)?data:null;
  }
  async function fetchSolicitud(codigo){
    var res=await fetch(SB_URL+"rpc/obtener_solicitud_publica",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_codigo:codigo})});
    if(!res.ok) throw new Error("HTTP "+res.status); var data=await res.json(); return (data&&data.codigo)?data:null;
  }

  // Promociones automáticas: se aplican SOLAS (sin código) cuando el carrito cumple una
  // condición y NO hay cupón. El servidor las aplica de forma autoritativa al crear el
  // pedido; acá solo las usamos para PINTAR el descuento en el resumen. Se cargan una vez.
  var PROMOS=[], promosCargadas=false;
  async function cargarPromos(){
    if(promosCargadas) return PROMOS;
    promosCargadas=true;
    try{ var r=await fetch(SB_URL+"rpc/promociones_activas",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:"{}"}); if(r.ok){ var d=await r.json(); if(Array.isArray(d)) PROMOS=d; } }catch(_){}
    return PROMOS;
  }
  function descFuente(tipo, valor, base){ var d = tipo==="porcentaje" ? base*Number(valor)/100 : Math.min(Number(valor), base); return Math.round(d*100)/100; }
  // La MEJOR promo que cumpla la condición (la que dé más descuento). null si ninguna.
  function mejorPromo(base, cant){
    var mejor=null, mejorDesc=0;
    PROMOS.forEach(function(p){
      var ok = p.condicion_tipo==="cantidad" ? (Number(cant)>=Number(p.condicion_valor)) : (Number(base)>=Number(p.condicion_valor));
      if(!ok) return;
      var d = descFuente(p.tipo, p.valor, base);
      if(d>mejorDesc){ mejorDesc=d; mejor=p; }
    });
    return mejor;
  }
  function calcular(items){
    var now=Date.now();
    var pagado=items.length>0 && items.every(function(s){ return s.estado==="confirmada"; });
    var pendientes=items.filter(function(s){ return s.estado==="pendiente" && new Date(s.vence_at).getTime()>now; });
    var estado=pagado?"pagado":(pendientes.length?"pendiente":"vencido");
    var total=items.reduce(function(t,s){ return t+(Number(s.total)||0); },0);
    var ahora=items.reduce(function(t,s){ return t+(Number(s.abono)||0); },0);
    var vence=items.reduce(function(m,s){ var v=new Date(s.vence_at).getTime(); return (m===null||v<m)?v:m; },null);
    var todos50=items.every(function(s){ return s.pago_tipo==="50"; });
    return { estado:estado, total:total, ahora:ahora, vence:vence, parcial:todos50 && ahora<total };
  }

  // =========================== PASO 1 · INFORMACIÓN ===========================
  var PAISES=["Nicaragua","Costa Rica","Panamá","Honduras","El Salvador","Guatemala","Belice","México","Estados Unidos","Canadá","Colombia","Venezuela","Ecuador","Perú","Bolivia","Chile","Argentina","Uruguay","Paraguay","Brasil","República Dominicana","Cuba","Puerto Rico","Haití","Jamaica","Trinidad y Tobago","España","Portugal","Francia","Italia","Alemania","Reino Unido","Irlanda","Países Bajos","Bélgica","Luxemburgo","Suiza","Austria","Dinamarca","Noruega","Suecia","Finlandia","Islandia","Polonia","República Checa","Eslovaquia","Hungría","Rumanía","Bulgaria","Grecia","Croacia","Eslovenia","Serbia","Ucrania","Rusia","Turquía","Israel","Emiratos Árabes Unidos","Catar","Arabia Saudita","Kuwait","Baréin","Omán","Jordania","Líbano","Egipto","Marruecos","Argelia","Túnez","Sudáfrica","Nigeria","Kenia","Ghana","Etiopía","China","Japón","Corea del Sur","Taiwán","Hong Kong","Singapur","Malasia","Tailandia","Vietnam","Filipinas","Indonesia","India","Pakistán","Bangladés","Sri Lanka","Australia","Nueva Zelanda","Otro país"];
  var DEPTOS=["Managua","Masaya","Carazo","Granada","Rivas","León","Chinandega","Estelí","Madriz","Nueva Segovia","Matagalpa","Jinotega","Boaco","Chontales","Río San Juan","RACCN (Costa Caribe Norte)","RACCS (Costa Caribe Sur)"];

  // Países con bandera (ISO2) y código telefónico, para el selector buscable y el prefijo del
  // teléfono. Nicaragua primero; el resto ordenado alfabéticamente. { n:nombre, i:ISO2, d:dial }
  var PAISES_DATA=[
    {n:"Nicaragua",i:"NI",d:"505"},
    {n:"Alemania",i:"DE",d:"49"},{n:"Arabia Saudita",i:"SA",d:"966"},{n:"Argelia",i:"DZ",d:"213"},{n:"Argentina",i:"AR",d:"54"},{n:"Australia",i:"AU",d:"61"},{n:"Austria",i:"AT",d:"43"},
    {n:"Bahamas",i:"BS",d:"1"},{n:"Bangladés",i:"BD",d:"880"},{n:"Baréin",i:"BH",d:"973"},{n:"Bélgica",i:"BE",d:"32"},{n:"Belice",i:"BZ",d:"501"},{n:"Bolivia",i:"BO",d:"591"},{n:"Brasil",i:"BR",d:"55"},{n:"Bulgaria",i:"BG",d:"359"},
    {n:"Canadá",i:"CA",d:"1"},{n:"Catar",i:"QA",d:"974"},{n:"Chile",i:"CL",d:"56"},{n:"China",i:"CN",d:"86"},{n:"Chipre",i:"CY",d:"357"},{n:"Colombia",i:"CO",d:"57"},{n:"Corea del Sur",i:"KR",d:"82"},{n:"Costa Rica",i:"CR",d:"506"},{n:"Croacia",i:"HR",d:"385"},{n:"Cuba",i:"CU",d:"53"},
    {n:"Dinamarca",i:"DK",d:"45"},{n:"Ecuador",i:"EC",d:"593"},{n:"Egipto",i:"EG",d:"20"},{n:"El Salvador",i:"SV",d:"503"},{n:"Emiratos Árabes Unidos",i:"AE",d:"971"},{n:"Eslovaquia",i:"SK",d:"421"},{n:"Eslovenia",i:"SI",d:"386"},{n:"España",i:"ES",d:"34"},{n:"Estados Unidos",i:"US",d:"1"},{n:"Estonia",i:"EE",d:"372"},{n:"Etiopía",i:"ET",d:"251"},
    {n:"Filipinas",i:"PH",d:"63"},{n:"Finlandia",i:"FI",d:"358"},{n:"Francia",i:"FR",d:"33"},{n:"Ghana",i:"GH",d:"233"},{n:"Grecia",i:"GR",d:"30"},{n:"Guatemala",i:"GT",d:"502"},{n:"Guyana",i:"GY",d:"592"},
    {n:"Haití",i:"HT",d:"509"},{n:"Honduras",i:"HN",d:"504"},{n:"Hong Kong",i:"HK",d:"852"},{n:"Hungría",i:"HU",d:"36"},{n:"India",i:"IN",d:"91"},{n:"Indonesia",i:"ID",d:"62"},{n:"Irlanda",i:"IE",d:"353"},{n:"Islandia",i:"IS",d:"354"},{n:"Israel",i:"IL",d:"972"},{n:"Italia",i:"IT",d:"39"},
    {n:"Jamaica",i:"JM",d:"1"},{n:"Japón",i:"JP",d:"81"},{n:"Jordania",i:"JO",d:"962"},{n:"Kenia",i:"KE",d:"254"},{n:"Kuwait",i:"KW",d:"965"},{n:"Líbano",i:"LB",d:"961"},{n:"Luxemburgo",i:"LU",d:"352"},
    {n:"Malasia",i:"MY",d:"60"},{n:"Marruecos",i:"MA",d:"212"},{n:"México",i:"MX",d:"52"},{n:"Nigeria",i:"NG",d:"234"},{n:"Noruega",i:"NO",d:"47"},{n:"Nueva Zelanda",i:"NZ",d:"64"},{n:"Omán",i:"OM",d:"968"},
    {n:"Países Bajos",i:"NL",d:"31"},{n:"Pakistán",i:"PK",d:"92"},{n:"Panamá",i:"PA",d:"507"},{n:"Paraguay",i:"PY",d:"595"},{n:"Perú",i:"PE",d:"51"},{n:"Polonia",i:"PL",d:"48"},{n:"Portugal",i:"PT",d:"351"},{n:"Puerto Rico",i:"PR",d:"1"},
    {n:"Reino Unido",i:"GB",d:"44"},{n:"República Checa",i:"CZ",d:"420"},{n:"República Dominicana",i:"DO",d:"1"},{n:"Rumanía",i:"RO",d:"40"},{n:"Rusia",i:"RU",d:"7"},{n:"Serbia",i:"RS",d:"381"},{n:"Singapur",i:"SG",d:"65"},{n:"Sudáfrica",i:"ZA",d:"27"},{n:"Suecia",i:"SE",d:"46"},{n:"Suiza",i:"CH",d:"41"},{n:"Sri Lanka",i:"LK",d:"94"},
    {n:"Tailandia",i:"TH",d:"66"},{n:"Taiwán",i:"TW",d:"886"},{n:"Trinidad y Tobago",i:"TT",d:"1"},{n:"Túnez",i:"TN",d:"216"},{n:"Turquía",i:"TR",d:"90"},{n:"Ucrania",i:"UA",d:"380"},{n:"Uruguay",i:"UY",d:"598"},{n:"Venezuela",i:"VE",d:"58"},{n:"Vietnam",i:"VN",d:"84"}
  ];
  function flag(iso){ if(!iso||iso.length!==2) return "🏳️"; try{ return String.fromCodePoint(0x1F1E6+iso.charCodeAt(0)-65)+String.fromCodePoint(0x1F1E6+iso.charCodeAt(1)-65); }catch(e){ return "🏳️"; } }
  function paisPorNombre(n){ return PAISES_DATA.find(function(p){ return p.n===n; }) || PAISES_DATA[0]; }

  // Selector de país buscable (bandera + código). Popover reutilizable: para el campo País
  // y para el prefijo (+código) del teléfono. cb recibe el país elegido {n,i,d}.
  var PAIS_CB=null;
  function abrirPaisPicker(cb){
    PAIS_CB=cb;
    var ov=$("paisOv");
    if(!ov){
      ov=document.createElement("div"); ov.id="paisOv"; ov.className="pais-ov";
      ov.innerHTML='<div class="pais-sheet"><div class="pais-top"><b>Elegí tu país</b><button type="button" class="pais-close" aria-label="Cerrar">&times;</button></div><div class="pais-search"><input id="paisInp" placeholder="Buscar país o código…" autocomplete="off"></div><div class="pais-list" id="paisList"></div></div>';
      document.body.appendChild(ov);
      ov.addEventListener("click", function(e){ if(e.target===ov||e.target.closest(".pais-close")) cerrarPaisPicker(); });
      $("paisInp").addEventListener("input", function(){ pintarPaisList(this.value); });
    }
    ov.classList.add("show"); document.body.style.overflow="hidden"; pintarPaisList("");
    setTimeout(function(){ var i=$("paisInp"); if(i){ i.value=""; i.focus(); } },40);
  }
  function cerrarPaisPicker(){ var ov=$("paisOv"); if(ov) ov.classList.remove("show"); document.body.style.overflow=""; PAIS_CB=null; }
  function pintarPaisList(q){
    q=(q||"").trim().toLowerCase(); var list=$("paisList"); if(!list) return;
    var qd=q.replace(/\D/g,"");
    var arr=PAISES_DATA.filter(function(p){ return !q || p.n.toLowerCase().indexOf(q)>=0 || (qd && p.d.indexOf(qd)>=0); });
    list.innerHTML=arr.map(function(p){ return '<button type="button" class="pais-row" data-i="'+p.i+'"><span class="pais-fl">'+flag(p.i)+'</span><span class="pais-nm">'+esc(p.n)+'</span><span class="pais-dc">+'+p.d+'</span></button>'; }).join("") || '<div class="pais-empty">Sin resultados</div>';
    list.querySelectorAll(".pais-row").forEach(function(b){ b.addEventListener("click", function(){ var p=PAISES_DATA.find(function(x){return x.i===b.getAttribute("data-i");}); var cb=PAIS_CB; cerrarPaisPicker(); if(cb&&p) cb(p); }); });
  }
  function ubicNI(){ return '<div class="field"><label class="label">Departamento / ciudad *</label><select class="select" name="departamento" required><option value="">Selecciona tu departamento</option>'+DEPTOS.map(function(d){return '<option>'+esc(d)+'</option>';}).join("")+'</select></div>'; }
  function ubicIntl(){ return '<div class="row"><div class="field"><label class="label">Ciudad *</label><input class="input" name="ciudad" autocomplete="address-level2" placeholder="Ej. Miami" required></div><div class="field"><label class="label">Estado / Provincia</label><input class="input" name="estado" autocomplete="address-level1" placeholder="Opcional"></div></div>'
    +'<div class="field"><label class="label">Dirección completa *</label><input class="input" name="direccion" autocomplete="street-address" placeholder="Calle, número, apto." required></div>'
    +'<div class="row"><div class="field"><label class="label">Código postal</label><input class="input" name="cp" autocomplete="postal-code" placeholder="Opcional"></div><div class="field"><label class="label">Referencia</label><input class="input" name="ref" placeholder="Opcional"></div></div>'
    +'<div class="note">🌍 <b>Envío internacional:</b> el costo del envío se cotiza por WhatsApp según tu país. El precio que ves es solo del producto; el tiempo y costo de entrega se confirman antes de procesar el pedido.</div>'; }
  // Lee y valida la ubicación. `pais` es el objeto {n,i,d} del selector.
  function leerUbic(form, pais){
    var nombre = pais ? pais.n : "Nicaragua";
    if(nombre==="Nicaragua"){ var d=form.departamento?form.departamento.value:""; return { ok:!!d, pais:nombre, ciudad:d, direccion:null, intl:false, err:"Elegí tu departamento." }; }
    var ci=form.ciudad?form.ciudad.value.trim():"", di=form.direccion?form.direccion.value.trim():"";
    var est=form.estado?form.estado.value.trim():"", cp=form.cp?form.cp.value.trim():"", ref=form.ref?form.ref.value.trim():"";
    var dir=[di, est, cp?("CP "+cp):"", ref?("Ref: "+ref):""].filter(Boolean).join(" · ");
    return { ok:!!(ci&&di), pais:nombre, ciudad:ci?(ci+", "+nombre):nombre, direccion:dir||null, intl:true, err:"Completá tu ciudad y dirección." };
  }
  function recordarPedido(codigo, producto){ try{ var a=JSON.parse(localStorage.getItem("hausline_pedidos")||"[]"); a.push({codigo:String(codigo),producto:producto||"",ts:Date.now()}); localStorage.setItem("hausline_pedidos",JSON.stringify(a.slice(-6))); }catch(e){} }
  function suscribir(correo,nombre,optin){ if(!optin||!correo) return; try{ fetch(SB_URL+"rpc/suscribir_publico",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_correo:correo,p_nombre:nombre||null,p_fuente:"checkout"})}).catch(function(){}); }catch(e){} }
  function guardarGcr(codigo,correo,envio){ try{ if(!codigo||!correo) return; var dias=envio==="rapido"?20:25; var f=new Date(Date.now()+dias*86400000); var fecha=f.getFullYear()+"-"+String(f.getMonth()+1).padStart(2,"0")+"-"+String(f.getDate()).padStart(2,"0"); sessionStorage.setItem("hausline_gcr",JSON.stringify({order_id:String(codigo),email:String(correo),estimated_delivery_date:fecha})); }catch(e){} }

  function renderInfo(){
    progreso(1);
    var pend; try{ pend=JSON.parse(sessionStorage.getItem("hausline_encargo")||"null"); }catch(e){ pend=null; }
    if(!pend){ estado("No hay un pedido en curso","Elegí un producto en la tienda y tocá “Encargar” para empezar tu compra."); return; }
    var esCarrito=pend.tipo==="carrito";
    var pago="total", cupon=null;
    var cant=esCarrito?1:Math.max(1,parseInt(pend.opts.cantidad,10)||1);
    var envioFlag=esCarrito?(pend.items.some(function(it){return it.envio==="rapido";})?"rapido":"estandar"):(pend.opts.envio==="rapido"?"rapido":"estandar");
    var intlFlag=false;
    var paisSel=PAISES_DATA[0], dialSel=PAISES_DATA[0], telManual=false; // Nicaragua por defecto

    function recargoDe(envio,c){ return envio==="rapido"?(Number(ENVCFG.rapido.recargo)||0)*c:0; }
    function descCupon(base){ if(!cupon) return 0; var d=cupon.tipo==="porcentaje"?base*cupon.valor/100:Math.min(cupon.valor,base); return Math.round(d*100)/100; }
    function calc(){
      var bruto=0, items=[];
      if(esCarrito){ pend.items.forEach(function(it){ var c=Number(it.cantidad)||1; var lp=(Number(it.precioUnitario)||0)*c+recargoDe(it.envio,c); bruto+=lp; items.push({nombre:it.nombre,marca:it.marca,talla:it.talla,imagen:it.imagen,cantidad:c,lineTotal:lp}); }); }
      else { var lp=(Number(pend.producto.precio)||0)*cant+recargoDe(pend.opts.envio,cant); bruto=lp; items.push({nombre:pend.producto.nombre,marca:pend.producto.marca,talla:pend.opts.talla,imagen:pend.producto.imagen,cantidad:cant,lineTotal:lp}); }
      bruto=Math.round(bruto*100)/100;
      var totalCant=items.reduce(function(n,i){ return n+(Number(i.cantidad)||1); },0);
      // Cupón (si lo escribió) tiene prioridad; si no, la mejor promo automática aplicable.
      var desc=0, descLabel="";
      if(cupon){ desc=descCupon(bruto); descLabel=cupon.codigo; }
      else { var pr=mejorPromo(bruto, totalCant); if(pr){ desc=descFuente(pr.tipo, pr.valor, bruto); descLabel="Promo: "+pr.nombre; } }
      var total=Math.max(0,Math.round((bruto-desc)*100)/100);
      return { items:items, subtotal:bruto, descuento:desc, descLabel:descLabel, total:total, ahora:pago==="50"?Math.round(total*50)/100:total };
    }
    function sumOpts(){ var t=calc(); return { items:t.items, subtotal:t.subtotal, descuento:t.descuento, cuponCodigo:t.descLabel, total:t.total, ahora:t.ahora, parcial:pago==="50", envioDias:diasEnvio(envioFlag,pend), envioFlag:envioFlag, demora:demoraPend(pend), envioIntl:intlFlag }; }
    function pintarResumen(){ var s=$("resumen"); if(s) s.innerHTML=resumenHTML(sumOpts()); }

    // Meta Pixel: entró al paso 1 del checkout (empezó a comprar).
    if(typeof fbq==="function"){
      var _ic=calc();
      fbq("track", "InitiateCheckout", {
        value:_ic.total, currency:"USD", content_type:"product",
        num_items:_ic.items.reduce(function(n,i){ return n+(Number(i.cantidad)||1); },0),
        content_ids: esCarrito ? pend.items.map(function(it){ return it.codigo; }) : [pend.producto.codigo]
      });
    }

    function cuponHTML(){
      if(cupon){ var et=cupon.tipo==="porcentaje"?(cupon.valor+"%"):("US$ "+Number(cupon.valor).toFixed(2)); return '<div class="cup-on">🎟️ <b>'+esc(cupon.codigo)+'</b> · '+esc(et)+' <button type="button" class="cup-x" data-cupq>Quitar</button></div>'; }
      return '<div class="cup"><input class="input" type="text" data-cupc placeholder="Código (opcional)" autocomplete="off"><button type="button" class="cup-ap" data-cupap>Aplicar</button></div><div class="cup-err" data-cuperr hidden></div>';
    }

    $("ck").innerHTML = '<div class="grid">'
      + '<div class="col-main">'
      +   '<button class="back rv" data-volver>← Seguir comprando</button>'
      +   '<div class="panel rv">'
      +     '<h1 class="panel-h">Información de contacto y envío</h1>'
      +     '<p class="panel-sub">Con estos datos coordinamos tu pedido y te damos el seguimiento.</p>'
      +     '<form class="ck-form" novalidate>'
      +       '<div class="field"><label class="label">Nombre completo *</label><input class="input" name="nombre" autocomplete="name" placeholder="Ej. María Gómez" required></div>'
      +       '<div class="field"><label class="label">País *</label><button type="button" class="combo" data-paisbtn><span class="combo-fl">'+flag(paisSel.i)+'</span><span class="combo-tx" data-paistx>'+esc(paisSel.n)+'</span><span class="combo-ch">'+ICON.chev+'</span></button></div>'
      +       '<div class="field"><label class="label">WhatsApp *</label><div class="tel"><button type="button" class="tel-code" data-dialbtn><span>'+flag(dialSel.i)+'</span><b data-dialtx>+'+dialSel.d+'</b>'+ICON.chev+'</button><input class="input tel-num" name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="8890 1122" required></div></div>'
      +       '<div class="field"><label class="label">Correo electrónico *</label><input class="input" name="correo" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@correo.com" required></div>'
      +       '<div data-ubic>'+ubicNI()+'</div>'
      +       (esCarrito?"":'<div class="row">'
      +         (pend.opts.talla?'<div class="field"><label class="label">Talla / detalle</label><input class="input" name="talla" placeholder="Talla o N/A" value="'+esc(pend.opts.talla)+'"></div>':"")
      +         '<div class="field" style="max-width:120px"><label class="label">Cantidad</label><input class="input" name="cantidad" type="number" min="1" max="20" value="'+cant+'"></div>'
      +       '</div>')
      +       '<label class="check"><input type="checkbox" name="optin" checked> Quiero recibir novedades y ofertas de HAUSLINE por correo.</label>'
      +     '</form>'
      +   '</div>'
      +   '<div class="panel rv">'
      +     '<h2 class="panel-h">Forma de pago</h2>'
      +     '<p class="panel-sub">Pago por transferencia. En el siguiente paso ves las cuentas.</p>'
      +     '<div class="tiles" data-pago><button type="button" class="tile sel" data-p="total"><b>Pagar todo</b><small>El total completo</small></button><button type="button" class="tile" data-p="50"><b>Abono 50%</b><small>La mitad ahora</small></button></div>'
      +     '<div class="field"><label class="label">¿Tenés un código de descuento?</label><div data-cupon>'+cuponHTML()+'</div></div>'
      +   '</div>'
      +   '<div class="err" data-err hidden></div>'
      +   '<button class="btn" style="margin-top:16px" data-continuar type="button">Continuar con el pago →</button>'
      +   '<p class="foot">No se cobra nada en línea. Si no coordinás el pago en 24 h, el pedido se cancela solo.</p>'
      + '</div>'
      + '<aside class="col-side"><div id="resumen">'+resumenHTML(sumOpts())+'</div></aside>'
      + '</div>';

    var form=$("ck").querySelector(".ck-form");
    var revs=$("ck").querySelectorAll(".rv"); for(var i=0;i<revs.length;i++) revs[i].style.animationDelay=Math.min(i*50,300)+"ms";
    $("ck").querySelector("[data-volver]").addEventListener("click", function(){ location.href="/"; });
    function actualizarDial(){ var d=$("ck").querySelector("[data-dialbtn]"); if(!d) return; d.querySelector("span").textContent=flag(dialSel.i); d.querySelector("[data-dialtx]").textContent="+"+dialSel.d; }
    $("ck").querySelector("[data-paisbtn]").addEventListener("click", function(){ abrirPaisPicker(function(p){
      paisSel=p; intlFlag=p.n!=="Nicaragua";
      var b=$("ck").querySelector("[data-paisbtn]"); b.querySelector(".combo-fl").textContent=flag(p.i); b.querySelector("[data-paistx]").textContent=p.n;
      form.querySelector("[data-ubic]").innerHTML=intlFlag?ubicIntl():ubicNI();
      if(!telManual){ dialSel=p; actualizarDial(); }
      pintarResumen();
    }); });
    $("ck").querySelector("[data-dialbtn]").addEventListener("click", function(){ abrirPaisPicker(function(p){ dialSel=p; telManual=true; actualizarDial(); }); });
    if(form.cantidad) form.cantidad.addEventListener("input", function(){ cant=Math.min(20,Math.max(1,parseInt(form.cantidad.value,10)||1)); pintarResumen(); });
    $("ck").querySelectorAll("[data-pago] .tile").forEach(function(b){ b.addEventListener("click", function(){ pago=b.getAttribute("data-p"); $("ck").querySelectorAll("[data-pago] .tile").forEach(function(x){x.classList.remove("sel");}); b.classList.add("sel"); pintarResumen(); }); });
    function wireCupon(){
      var box=$("ck").querySelector("[data-cupon]"); if(!box) return;
      var ap=box.querySelector("[data-cupap]"); if(ap) ap.addEventListener("click", function(){ var i=box.querySelector("[data-cupc]"); aplicarCupon(i?i.value:""); });
      var inp=box.querySelector("[data-cupc]"); if(inp) inp.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); aplicarCupon(inp.value); } });
      var q=box.querySelector("[data-cupq]"); if(q) q.addEventListener("click", function(){ cupon=null; box.innerHTML=cuponHTML(); wireCupon(); pintarResumen(); });
    }
    async function aplicarCupon(code){ code=(code||"").trim(); if(!code) return; var errB=$("ck").querySelector("[data-cuperr]");
      try{ var t=calc(); var res=await fetch(SB_URL+"rpc/validar_cupon",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_codigo:code,p_total:t.subtotal})});
        if(!res.ok) throw 0; var r=await res.json();
        if(!r||!r.valido){ if(errB){ errB.textContent=(r&&r.motivo)||"Código no válido."; errB.hidden=false; } return; }
        cupon={id:r.id,codigo:r.codigo,tipo:r.tipo,valor:Number(r.valor)}; var box=$("ck").querySelector("[data-cupon]"); box.innerHTML=cuponHTML(); wireCupon(); pintarResumen();
      }catch(_){ if(errB){ errB.textContent="No se pudo validar el código."; errB.hidden=false; } }
    }
    wireCupon();
    // Carga las promos automáticas y re-pinta el resumen (para mostrar el descuento aplicado).
    cargarPromos().then(function(){ pintarResumen(); });
    // Cupón que llega del link del correo (Brevo, ?cupon=CODIGO) o guardado desde la home
    // (localStorage hausline_cupon): lo autocompletamos y aplicamos solo, sin que el cliente
    // tenga que escribirlo. Si ya no es válido, aplicarCupon muestra el aviso y no lo aplica.
    (function(){
      var code = "";
      try{ code = new URLSearchParams(location.search).get("cupon") || ""; }catch(e){}
      if(!code){ try{ code = localStorage.getItem("hausline_cupon") || ""; }catch(e){} }
      code = (code || "").trim();
      if(code && !cupon){
        var inp = $("ck").querySelector("[data-cupc]"); if(inp) inp.value = code;
        aplicarCupon(code);
      }
    })();
    $("ck").querySelector("[data-continuar]").addEventListener("click", function(){ enviarInfo(form, pend, esCarrito, calc, envioFlag, cupon, this, paisSel, dialSel); });
  }

  async function enviarInfo(form, pend, esCarrito, calc, envioFlag, cupon, btn, pais, dial){
    var err=$("ck").querySelector("[data-err]");
    function showErr(m){ if(err){ err.textContent=m; err.hidden=false; err.scrollIntoView({block:"center",behavior:"smooth"}); } }
    if(err) err.hidden=true;
    var nombre=form.nombre.value.trim(), correo=form.correo.value.trim();
    var num=String(form.whatsapp.value||"").replace(/\D/g,"");
    var wa="+"+dial.d+" "+num;
    var ub=leerUbic(form, pais);
    if(nombre.length<2) return showErr("Escribí tu nombre completo.");
    if(num.length<7 || num.length>15) return showErr("Introducí un número de WhatsApp válido.");
    if(!correo) return showErr("Escribí tu correo electrónico (es obligatorio para el seguimiento).");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return showErr("El correo no es válido. Revisalo (ej. nombre@correo.com).");
    if(!ub.ok) return showErr(ub.err);
    // Verificación: el cliente confirma que su WhatsApp y correo están bien (por ahí lo
    // contactamos y le llega el seguimiento). Si algo está mal, vuelve a corregir.
    var ok = await dlg({ tono:"accent", icon:ICON.chat, titulo:"Verificá tus datos de contacto",
      cuerpo:"Por acá te contactamos y te enviamos el seguimiento. Confirmá que están BIEN escritos:<br><br><b>WhatsApp:</b> "+esc(wa)+"<br><b>Correo:</b> "+esc(correo),
      okTxt:"Sí, son correctos", cancelTxt:"Corregir" });
    if(!ok) return;
    var optin=form.optin&&form.optin.checked;
    var pago=$("ck").querySelector("[data-pago] .sel").getAttribute("data-p");
    // Para el producto único, la cantidad puede haber cambiado en el form: la guardamos.
    if(!esCarrito && form.cantidad){ pend.opts.cantidad = Math.min(20,Math.max(1,parseInt(form.cantidad.value,10)||1)); }
    if(!esCarrito && form.talla){ pend.opts.talla = form.talla.value.trim(); }
    // NO se crea el pedido todavía: guardamos TODO (con los datos de contacto) y pasamos al
    // pago. El pedido se crea RECIÉN cuando el cliente reporta el pago (paso 2), así no se
    // crean pedidos ni se manda correo por gente que se va sin pagar.
    pend.contacto = { nombre:nombre, whatsapp:wa, correo:correo||null, ciudad:ub.ciudad||null, direccion:ub.direccion, pais:ub.pais, pago:pago, cupon: cupon ? { codigo:cupon.codigo, tipo:cupon.tipo, valor:cupon.valor } : null, optin:optin, envio:envioFlag };
    try{ sessionStorage.setItem("hausline_encargo", JSON.stringify(pend)); }catch(_){}
    location.href="/checkout/?paso=pago";
  }

  // ===================== CREAR EL PEDIDO (recién al reportar el pago) =====================
  var codigoCreado = null;
  async function crearPedido(pend){
    if(codigoCreado) return codigoCreado;
    var ct = pend.contacto || {};
    var codigo;
    if(pend.tipo==="carrito"){
      var envioFlag = ct.envio || (pend.items.some(function(it){return it.envio==="rapido";})?"rapido":"estandar");
      var payload = pend.items.map(function(it){ var c=Number(it.cantidad)||1; return { producto:it.nombre, producto_codigo:it.codigo||null, marca:it.marca||null, talla:it.talla||null, color:it.color||null, cantidad:c, precio_unitario:it.precioUnitario||0, recargo:(it.envio==="rapido"?(Number(ENVCFG.rapido.recargo)||0)*c:0), envio:it.envio==="rapido"?"rapido":"estandar", imagen:it.imagen||null }; });
      var r1=await (typeof hauslineFetchSolicitud==="function"?hauslineFetchSolicitud:fetch)(SB_URL+"rpc/crear_solicitud_carrito",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:(typeof hauslineAuthHeader==="function"?hauslineAuthHeader():"Bearer "+SB_KEY)},body:JSON.stringify({p_nombre:ct.nombre,p_whatsapp:ct.whatsapp,p_correo:ct.correo,p_ciudad:ct.ciudad,p_direccion:ct.direccion,p_envio:envioFlag,p_pago:ct.pago,p_cupon_codigo:ct.cupon?ct.cupon.codigo:null,p_items:payload})});
      if(!r1.ok) throw await errorHttp(r1,"crear"); codigo=String(await r1.json());
      try{ localStorage.removeItem("hausline_carrito"); }catch(_){}
    } else {
      var p=pend.producto, c2=Math.max(1,parseInt(pend.opts.cantidad,10)||1);
      var rec=(pend.opts.envio==="rapido"?(Number(ENVCFG.rapido.recargo)||0)*c2:0);
      var r2=await (typeof hauslineFetchSolicitud==="function"?hauslineFetchSolicitud:fetch)(SB_URL+"rpc/crear_solicitud_publica",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:(typeof hauslineAuthHeader==="function"?hauslineAuthHeader():"Bearer "+SB_KEY)},body:JSON.stringify({p_nombre:ct.nombre,p_whatsapp:ct.whatsapp,p_correo:ct.correo,p_ciudad:ct.ciudad,p_direccion:ct.direccion,p_producto:p.nombre,p_producto_codigo:p.codigo||null,p_marca:p.marca||null,p_talla:pend.opts.talla||null,p_color:pend.opts.color||null,p_cantidad:c2,p_precio_unitario:p.precio,p_envio:pend.opts.envio==="rapido"?"rapido":"estandar",p_recargo:rec,p_pago:ct.pago,p_imagen:p.imagen||null,p_cupon_codigo:ct.cupon?ct.cupon.codigo:null})});
      if(!r2.ok) throw await errorHttp(r2,"crear"); codigo=String(await r2.json());
    }
    codigoCreado = codigo;
    suscribir(ct.correo, ct.nombre, ct.optin); guardarGcr(codigo, ct.correo, ct.envio||"estandar"); recordarPedido(codigo, pend.tipo==="carrito"?"Tu carrito":pend.producto.nombre);
    return codigo;
  }
  // Sube un archivo al bucket y registra la ruta (marca pago reportado). Devuelve/lanza.
  async function subirArchivo(file, codigo){
    var base=SB_URL.replace(/\/rest\/v1\/?$/,"");
    var ext=String(file.name||"").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"") || (file.type.indexOf("pdf")>=0?"pdf":"jpg");
    var ruta=String(codigo).replace(/[^A-Za-z0-9-]/g,"")+"/"+Date.now()+"."+ext;
    var up=await fetch(base+"/storage/v1/object/comprobantes/"+ruta.split("/").map(encodeURIComponent).join("/"),{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":file.type||"application/octet-stream"},body:file});
    if(!up.ok) throw await errorHttp(up,"upload");
    var reg=await fetch(SB_URL+"rpc/registrar_comprobante_publico",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_codigo:codigo,p_ruta:ruta})});
    if(!(reg.ok && await reg.json())) throw new Error("reg");
  }

  // ============ PASO 2 · PAGO (PRE-ORDEN: el pedido aún NO existe) ============
  // Se muestra cuando el cliente viene del paso 1 (sin código). El pedido se crea recién
  // cuando reporta el pago (sube comprobante o toca "Ya realicé mi pago").
  async function renderPagoPreorden(){
    progreso(2);
    await cargarPromos();
    var pend; try{ pend=JSON.parse(sessionStorage.getItem("hausline_encargo")||"null"); }catch(e){ pend=null; }
    if(!pend || !pend.contacto){ estado("Empezá tu pedido", "Elegí un producto en la tienda y completá tus datos para pagar."); return; }
    var esCarrito=pend.tipo==="carrito"; var ct=pend.contacto; var pago = ct.pago==="50"?"50":"total";
    function recargoDe(envio,c){ return envio==="rapido"?(Number(ENVCFG.rapido.recargo)||0)*c:0; }
    var bruto=0, sumItems=[];
    if(esCarrito){ pend.items.forEach(function(it){ var c=Number(it.cantidad)||1; var lp=(Number(it.precioUnitario)||0)*c+recargoDe(it.envio,c); bruto+=lp; sumItems.push({nombre:it.nombre,marca:it.marca,talla:it.talla,imagen:it.imagen,cantidad:c,lineTotal:lp}); }); }
    else { var c2=Math.max(1,parseInt(pend.opts.cantidad,10)||1); var lp=(Number(pend.producto.precio)||0)*c2+recargoDe(pend.opts.envio,c2); bruto=lp; sumItems.push({nombre:pend.producto.nombre,marca:pend.producto.marca,talla:pend.opts.talla,imagen:pend.producto.imagen,cantidad:c2,lineTotal:lp}); }
    bruto=Math.round(bruto*100)/100;
    var totalCant=sumItems.reduce(function(n,i){ return n+(Number(i.cantidad)||1); },0);
    var desc=0, descLabel="";
    if(ct.cupon){ desc=descFuente(ct.cupon.tipo, ct.cupon.valor, bruto); descLabel=ct.cupon.codigo; }
    else { var pr=mejorPromo(bruto, totalCant); if(pr){ desc=descFuente(pr.tipo, pr.valor, bruto); descLabel="Promo: "+pr.nombre; } }
    var total=Math.max(0,Math.round((bruto-desc)*100)/100);
    var ahora = pago==="50"?Math.round(total*50)/100:total;
    var sumHTML=resumenHTML({ items:sumItems, subtotal:bruto, descuento:desc, cuponCodigo:descLabel, total:total, ahora:ahora, parcial:pago==="50", envioIntl: !!(ct.pais && ct.pais!=="Nicaragua"), demora:demoraPend(pend) });

    $("ck").innerHTML='<div class="grid"><div class="col-main">'
      + '<button class="back rv" data-volver>← Volver a mis datos</button>'
      + '<div class="panel rv"><h1 class="panel-h">Elegí cómo pagar</h1><p class="panel-sub">Transferí el monto y confirmá. Tu pedido se crea al confirmar el pago.</p>'+metodosHTML(ahora)+'</div>'
      + '<div class="panel rv"><h2 class="panel-h">Enviá tu comprobante</h2><p class="panel-sub">Subilo para agilizar la confirmación (opcional; también podés por WhatsApp luego).</p>'
      +   '<label class="up-drop" id="upDrop"><input type="file" id="upInput" accept="image/*,application/pdf" hidden><span class="up-ic">'+ICON.upload+'</span><span class="up-txt"><b>Subí tu comprobante</b><small>Imagen (JPG/PNG) o PDF · máx. 6 MB</small></span></label>'
      +   '<div class="up-preview" id="upPreview" hidden></div>'
      +   '<div class="up-status" id="upStatus" hidden></div>'
      + '</div>'
      + '<div class="err" data-err hidden></div>'
      + '<button class="btn" id="ckConfirmar" type="button" style="margin-top:16px">Ya realicé mi pago →</button>'
      + '<p class="foot">No se cobra nada en línea. Al confirmar te damos tu número de orden.</p>'
      + '</div><aside class="col-side">'+sumHTML+'</aside></div>';
    anim(); wireMetodos($("ck"));
    var bk=$("ck").querySelector("[data-volver]"); if(bk) bk.addEventListener("click", function(){ location.href="/checkout/?paso=info"; });
    var err=$("ck").querySelector("[data-err]");
    function showErr(m){ if(err){ err.textContent=m; err.hidden=false; } }
    var conf=$("ckConfirmar");
    var comp=wireComprobante(function(file){ if(conf) conf.textContent = file ? "Enviar comprobante y confirmar pedido →" : "Ya realicé mi pago →"; });
    async function finalizar(file){
      if(err) err.hidden=true;
      mostrarCamion("Creando tu pedido…"); var t0=Date.now();
      try{
        var cod=await crearPedido(pend);
        if(file){ await subirArchivo(file, cod); }
        else { await fetch(SB_URL+"rpc/reportar_pago_publico",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_codigo:cod})}); }
        try{ sessionStorage.removeItem("hausline_encargo"); }catch(_){}
        var esperar=1600-(Date.now()-t0); if(esperar>0) await new Promise(function(r){ setTimeout(r,esperar); });
        location.href="/checkout/?c="+encodeURIComponent(cod)+"&paso=confirmacion";
      }catch(e){ falla("checkout_error", "No se pudo confirmar el pedido: "+((e&&e.message)||"error"), {paso:"pago", con_comprobante:!!file}); var ov=$("camOv"); if(ov){ try{ov.remove();}catch(_){} document.body.style.overflow=""; } showErr("No se pudo confirmar tu pedido. Revisá tu internet e intentá de nuevo."); }
    }
    if(conf) conf.addEventListener("click", async function(){
      if(comp.file){ finalizar(comp.file); return; }
      var subir = await dlg({ tono:"warn", icon:ICON.upload, titulo:"¿Ya transferiste?", cuerpo:"Al confirmar creamos tu pedido y te damos tu número de orden. Si podés, <b>subí tu comprobante</b> para agilizar; si no, podés enviarlo por WhatsApp después.", okTxt:"Subir comprobante", cancelTxt:"Sí, ya transferí →" });
      if(subir){ var inp=$("upInput"); if(inp) inp.click(); return; }
      finalizar(null);
    });
  }

  // =========================== PASO 2 · PAGO (pedido YA creado: links de correo/mipedido) ===
  var timerInt=null, pollInt=null, confInt=null, ultimoEstado=null;

  // Envuelto en [data-metodos] para poder repintarlo si llegan las cuentas del panel.
  function metodosHTML(monto){ return '<div data-metodos="'+esc(Number(monto)||0)+'">'+metodosInner(monto)+'</div>'; }
  // Las cuentas "Visible a clientes" del panel llegan después de cargar (config.js): si la
  // lista cambió mientras el cliente ya está en el paso de pago, se repinta con las nuevas.
  document.addEventListener("hausline:cuentas", function(){
    document.querySelectorAll("[data-metodos]").forEach(function(el){
      el.innerHTML = metodosInner(Number(el.getAttribute("data-metodos"))||0);
      wireMetodos(el);
    });
  });
  function metodosInner(monto){
    if(!CUENTAS.length) return '<div class="note"><b>Escríbenos por WhatsApp</b> y te damos los datos de pago.</div>';
    return '<div class="methods">'+CUENTAS.map(function(cu,i){
      var b=badge(cu), cord=esCordoba(cu);
      var num=cord?String(cordobas(monto)):(Number(monto)||0).toFixed(2);
      var txt=cord?nio(cordobas(monto)):usd(monto);
      var etq=esBilletera(cu)?"Número":"N° de cuenta";
      return '<div class="method" data-acct="'+i+'">'
        +'<button class="method-head" type="button" aria-expanded="false"><span class="radio"></span>'
        +'<span class="method-badge" style="background:'+b.bg+'">'+b.label+'</span>'
        +'<span class="method-name"><b>'+esc(cu.banco)+(cu.moneda?" · "+esc(cu.moneda):"")+'</b><small>Transferencia bancaria</small></span>'
        +'<span class="method-chev">'+ICON.chev+'</span></button>'
        +'<div class="method-body" hidden>'
        +'<div class="kv"><span class="kv-k">'+etq+'</span><span class="kv-copy"><span class="kv-v mono">'+esc(cu.numero)+'</span><button class="copy" data-copy="'+esc(cu.numero)+'" data-msg="Cuenta copiada">Copiar</button></span></div>'
        +'<div class="kv"><span class="kv-k">Monto exacto</span><span class="kv-copy"><span class="kv-v mono">'+esc(txt)+'</span><button class="copy" data-copy="'+esc(num)+'" data-msg="Monto copiado">Copiar</button></span></div>'
        +'<div class="kv"><span class="kv-k">Titular</span><span class="kv-v">'+esc(cu.titular)+'</span></div>'
        +'</div></div>';
    }).join("")+'</div>';
  }
  function wireMetodos(root){
    var ms=root.querySelectorAll(".method[data-acct]");
    function toggle(m){ var abrir=!m.classList.contains("sel"); ms.forEach(function(x){ x.classList.remove("sel"); var h=x.querySelector(".method-head"); if(h)h.setAttribute("aria-expanded","false"); var b=x.querySelector(".method-body"); if(b)b.hidden=true; }); if(abrir){ m.classList.add("sel"); var h=m.querySelector(".method-head"); if(h)h.setAttribute("aria-expanded","true"); var b=m.querySelector(".method-body"); if(b)b.hidden=false; } }
    ms.forEach(function(m){ var h=m.querySelector(".method-head"); if(h) h.addEventListener("click", function(){ toggle(m); }); });
    wireCopy(root);
  }

  function renderPago(items){
    progreso(2);
    var c=calcular(items);
    var grupo=(items[0]&&items[0].grupo_codigo)||null;
    var codigo=grupo||items.map(function(s){return s.codigo;}).join(",");
    ultimoEstado=c.estado;
    var pagado=c.estado==="pagado", vencido=c.estado==="vencido";
    var sumItems=items.map(function(s){ return { nombre:s.producto, marca:s.marca, talla:s.talla, imagen:s.imagen, cantidad:s.cantidad, lineTotal:s.total }; });
    var sumHTML=resumenHTML({ items:sumItems, subtotal:c.total, descuento:0, total:c.total, ahora:c.ahora, parcial:c.parcial, codigo:codigo });

    if(pagado){
      $("ck").innerHTML='<div class="grid"><div class="col-main">'
        +'<div class="panel rv" style="text-align:center;padding:34px 22px"><div class="conf-check" style="width:64px;height:64px;box-shadow:0 0 0 6px var(--ok-soft)">'+ICON.check+'</div>'
        +'<h1 class="panel-h" style="font-size:20px;margin-top:16px">¡Pago confirmado!</h1><p class="panel-sub" style="margin-top:6px">Recibimos tu pago. Tu pedido ya está en proceso y te contactamos por WhatsApp.</p>'
        +'<a class="btn btn-wa" style="max-width:340px;margin:8px auto 0" href="https://wa.me/'+WA+'?text='+encodeURIComponent("Hola, sobre mi pedido "+codigo+": ")+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+' Escribinos por WhatsApp</a></div>'
        +'</div><aside class="col-side">'+sumHTML+'</aside></div>';
      anim(); return;
    }

    var waMsg="Hola, acabo de realizar el pago de mi pedido "+codigo+" por "+usd(c.ahora)+". Adjunto mi comprobante.";
    var timer = vencido
      ? '<div class="timer exp">'+ICON.alert+'<div><b>Tiempo agotado</b><small>El período de pago terminó. Escribinos para reactivarlo.</small></div></div>'
      : '<div class="timer" id="timerBox">'+ICON.clock+'<div><b id="timer">--:--:--</b><small>Tenés 24 h para pagar. Si no, el pedido se cancela solo.</small></div></div>';
    var yaComp=items.some(function(s){ return s.comprobante; });

    $("ck").innerHTML='<div class="grid"><div class="col-main">'
      + '<button class="back rv" data-volver>← Volver</button>'
      + timer
      + '<div class="panel rv"><h1 class="panel-h">Elegí cómo pagar</h1><p class="panel-sub">Tocá el banco al que vas a transferir para ver el número de cuenta.</p>'+metodosHTML(c.ahora)+'</div>'
      + '<div class="panel rv"><h2 class="panel-h">Enviá tu comprobante</h2><p class="panel-sub">Es opcional, pero agiliza la confirmación de tu pago.</p>'
      +   '<a class="btn btn-wa" href="https://wa.me/'+WA+'?text='+encodeURIComponent(waMsg)+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+' Enviar por WhatsApp</a>'
      +   '<div class="divider-or">o subilo aquí</div>'
      +   (yaComp
          ? '<div class="up-status up-done">✓ Ya recibimos tu comprobante. Lo estamos verificando.</div>'
          : '<label class="up-drop" id="upDrop"><input type="file" id="upInput" accept="image/*,application/pdf" hidden><span class="up-ic">'+ICON.upload+'</span><span class="up-txt"><b>Subí tu comprobante</b><small>Imagen (JPG/PNG) o PDF · máx. 6 MB</small></span></label>'
            +'<div class="up-preview" id="upPreview" hidden></div>')
      +   '<div class="up-status" id="upStatus" hidden></div>'
      + '</div>'
      + '<button class="btn" id="ckConfirmar" type="button" style="margin-top:16px">Ya realicé mi pago →</button>'
      + '<p class="foot">© HAUSLINE · King of Shoes · <a href="/">Volver a la tienda</a></p>'
      + '</div><aside class="col-side">'+sumHTML+'</aside></div>';
    anim();
    wireMetodos($("ck"));
    var bk=$("ck").querySelector("[data-volver]"); if(bk) bk.addEventListener("click", function(){ history.length>1?history.back():location.href="/"; });
    var codigoRef=grupo||(items[0]&&items[0].codigo)||codigo;
    var conf=$("ckConfirmar");
    var comp=yaComp?null:wireComprobante(function(file){ if(conf) conf.textContent = file ? "Enviar comprobante y confirmar pago →" : "Ya realicé mi pago →"; });
    if(conf) conf.addEventListener("click", async function(){
      var staged = comp && comp.file;
      // Si NO envió su comprobante (ni ahora ni antes), avisamos: sin comprobante no podemos confirmar el pedido.
      var yaTiene = items.some(function(s){ return s.comprobante; }) || comprobanteSubido;
      if(!staged && !yaTiene){
        var subir = await dlg({ tono:"warn", icon:ICON.upload, titulo:"¿Ya enviaste tu comprobante?",
          cuerpo:"Sin tu <b>comprobante de pago</b> no podemos confirmar tu pedido. Subilo acá o enviálo por WhatsApp. Si ya lo mandaste por WhatsApp, continuá.",
          okTxt:"Subir comprobante", cancelTxt:"Ya lo envié →" });
        if(subir){ var inp=$("upInput"); if(inp) inp.click(); return; }
      }
      conf.disabled=true; conf.textContent = staged ? "Enviando comprobante…" : "Un momento…";
      try{
        if(staged){ await subirArchivo(staged, codigoRef); comprobanteSubido=true; }
        try{ await fetch(SB_URL+"rpc/reportar_pago_publico",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_codigo:codigoRef})}); }catch(_){}
        location.href="/checkout/?c="+encodeURIComponent(codigoRef)+"&paso=confirmacion";
      }catch(e){
        falla("comprobante_error", "No se pudo subir el comprobante: "+((e&&e.message)||"error"), {codigo:codigoRef||null});
        conf.disabled=false; conf.textContent = staged ? "Enviar comprobante y confirmar pago →" : "Ya realicé mi pago →";
        var st=$("upStatus"); if(st){ st.hidden=false; st.className="up-status up-error"; st.textContent="No se pudo subir el comprobante. Revisá tu internet e intentá de nuevo."; }
      }
    });
    if(!vencido && c.vence) iniciarContador(c.vence);
  }

  function anim(){ var revs=$("ck").querySelectorAll(".rv"); for(var i=0;i<revs.length;i++) revs[i].style.animationDelay=Math.min(i*50,300)+"ms"; wireCopy($("ck")); }

  function iniciarContador(venceMs){
    clearInterval(timerInt);
    function tick(){ var t=$("timer"); if(!t) return; var diff=venceMs-Date.now(); if(diff<=0){ clearInterval(timerInt); var box=$("timerBox"); if(box){ box.className="timer exp"; box.innerHTML=ICON.alert+'<div><b>Tiempo agotado</b><small>El período de pago terminó.</small></div>'; } cargarPago(true); return; } var h=Math.floor(diff/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000); t.textContent=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"); }
    tick(); timerInt=setInterval(tick,1000);
  }

  // =========================== PASO 3 · CONFIRMACIÓN ===========================
  // Línea de estados del pedido. "Orden confirmada" SOLO se marca cuando el admin confirma
  // (estado='confirmada'); antes queda en "Pago en revisión".
  function timelineHTML(estados){
    return '<div class="tl">'+estados.map(function(e){
      var ic = e.st==="done" ? ICON.check : (e.st==="active" ? '<span class="tl-pulse"></span>' : '');
      return '<div class="tl-step '+e.st+'"><div class="tl-dot">'+ic+'</div><div class="tl-txt"><b>'+esc(e.t)+'</b>'+(e.s?'<small>'+esc(e.s)+'</small>':'')+'</div></div>';
    }).join("")+'</div>';
  }
  // Mapea el estado REAL del pedido (ya confirmado) al índice de la línea pública:
  //   3 = Preparando · 4 = Enviado/en camino · 5 = Entregado.
  function nivelPedido(pe){
    var e=String(pe||"");
    if(e==="entregado") return 5;
    if(["empaquetado","disponible_entrega","transito_nicaragua","recibido_estados_unidos","transito_internacional","despachado","etiqueta_creada"].indexOf(e)>=0) return 4;
    return 3; // pedido_confirmado, pagado, en_preparacion, control_calidad…
  }
  // Cancelado: la solicitud se descartó/venció, o el pedido ya confirmado se canceló.
  function canceladoDe(items){
    if(!items || !items.length) return false;
    var todosMuertos = items.every(function(s){ return s.estado==="descartada" || s.estado==="vencida" || s.estado==="cancelada"; });
    var pedidoCancelado = items.some(function(s){ return s.pedido_estado==="cancelado"; });
    return todosMuertos || pedidoCancelado;
  }
  function estadosConf(items){
    var cancelado = canceladoDe(items);
    var confirmado = !cancelado && !!(items && items.length && items.every(function(s){ return s.estado==="confirmada"; }));
    var pe=null; if(items){ items.forEach(function(s){ if(s.pedido_estado && pe==null) pe=s.pedido_estado; }); }
    var nivel = confirmado ? nivelPedido(pe) : 1; // sin confirmar: "Pago en revisión" activo
    var defs=[
      { t:"Pedido recibido", s:"Registramos tu pedido" },
      { t:"Pago en revisión", s: confirmado?"Verificamos tu pago":"Estamos verificando tu pago" },
      { t:"Orden confirmada", s: confirmado?"¡Tu pago fue confirmado!":"Cuando validemos tu pago" },
      { t:"Preparando tu pedido", s:"Alistamos tu producto" },
      { t:"Enviado", s:"Tu pedido va en camino" },
      { t:"Entregado", s:"¡Gracias por tu compra!" }
    ];
    return { cancelado:cancelado, confirmado:confirmado, pe:pe, estados: defs.map(function(d,i){
      return { t:d.t, s:d.s, st: i<nivel ? "done" : (i===nivel ? (nivel===5?"done":"active") : "pending") };
    }) };
  }
  function firmaConf(items){
    if(!items || !items.length) return "none";
    var est = items.map(function(s){ return s.estado; }).sort().join(",");
    var pe=""; items.forEach(function(s){ if(s.pedido_estado && !pe) pe=s.pedido_estado; });
    return est+"|"+pe;
  }
  async function renderConfirmacion(codigo){
    progreso(3); clearInterval(pollInt); clearInterval(timerInt); clearInterval(confInt);
    var ayuda="https://wa.me/"+WA+"?text="+encodeURIComponent("Hola, sobre mi pedido "+codigo+": ");
    var firma=null;
    function pintar(items){
      var r=estadosConf(items); var confirmado=r.confirmado;
      if(r.cancelado){
        $("ck").innerHTML='<div class="conf">'
          + '<div class="conf-check" style="background:#d8402e">'+ICON.alert+'</div>'
          + '<h1 class="conf-h">Pedido cancelado</h1>'
          + '<p class="conf-p">Este pedido fue cancelado. Si creés que es un error o querés retomarlo, escribinos por WhatsApp.</p>'
          + '<div class="conf-code"><span class="lb">Número de orden</span><b>'+esc(codigo)+'</b><button class="copy" data-copy="'+esc(codigo)+'" data-msg="¡Número copiado!">Copiar número</button></div>'
          + '<a class="btn btn-wa" style="margin-top:16px" href="'+ayuda+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+' Escribinos por WhatsApp</a>'
          + '<a class="btn btn-ghost" style="margin-top:10px" href="/">Volver a la tienda</a>'
          + '</div>';
        wireCopy($("ck"));
        return;
      }
      $("ck").innerHTML='<div class="conf">'
        + '<div class="conf-check'+(confirmado?"":" pend")+'">'+ICON.check+'</div>'
        + '<h1 class="conf-h">'+(confirmado?"¡Pago confirmado!":"¡Pedido recibido!")+'</h1>'
        + '<p class="conf-p">'+(confirmado?"Tu pago fue confirmado y tu pedido ya está en proceso.":"Gracias por tu compra. Estamos verificando tu pago; te confirmamos por WhatsApp.")+'</p>'
        + '<div class="conf-code"><span class="lb">Número de orden</span><b>'+esc(codigo)+'</b><button class="copy" data-copy="'+esc(codigo)+'" data-msg="¡Número copiado!">Copiar número</button></div>'
        + '<div class="panel" style="margin-top:22px;text-align:left"><h3 class="panel-h" style="margin-bottom:14px">Estado de tu pedido</h3>'+timelineHTML(r.estados)+'</div>'
        + '<p class="conf-hint">Guardá tu número de orden <b>'+esc(codigo)+'</b>: lo necesitás para consultar tu pedido.</p>'
        + (confirmado ? '' : '<a class="btn" style="margin-top:8px" href="/checkout/?c='+encodeURIComponent(codigo)+'&paso=pago">Ver cuentas para pagar</a>')
        + '<a class="btn btn-wa" style="margin-top:10px" href="'+ayuda+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+' Escribinos por WhatsApp</a>'
        + '<a class="btn btn-ghost" style="margin-top:10px" href="/">Volver a la tienda</a>'
        + '</div>';
      wireCopy($("ck"));
      // Meta Pixel: compra completada. Se dispara UNA sola vez por pedido (aunque esta
      // pantalla haga polling o se recargue después), con un flag en localStorage.
      if(typeof fbq==="function"){
        try{
          var _pixelKey="hausline_pixel_purchase_"+codigo;
          if(!localStorage.getItem(_pixelKey)){
            fbq("track","Purchase",{
              value: items.reduce(function(t,s){ return t+(Number(s.total)||0); },0),
              currency:"USD", content_type:"product",
              content_ids: items.map(function(s){ return s.producto_codigo||s.producto||""; }).filter(Boolean),
              num_items: items.reduce(function(n,s){ return n+(Number(s.cantidad)||1); },0)
            });
            localStorage.setItem(_pixelKey,"1");
          }
        }catch(_){}
      }
      dispararResenaGoogle(codigo);
    }
    // Consulta el estado y repinta SOLO si cambió. Corre al entrar y cada 15s (polling) para
    // que el seguimiento se refleje sin recargar. Se detiene al entregar o si la pestaña se oculta.
    async function tick(silencioso){
      var items=null; try{ items=await fetchGrupo(codigo); }catch(_){ items=null; }
      var f=firmaConf(items);
      if(silencioso && f===firma) return;
      firma=f; pintar(items);
      if(canceladoDe(items) || (items && items.some(function(s){ return s.pedido_estado==="entregado"; }))) clearInterval(confInt);
    }
    await tick(false);
    confInt=setInterval(function(){ if(document.hidden) return; tick(true); }, 15000);
  }

  // ---- Estado / error ----
  // Aviso silencioso al panel ("Salud de clientes"): así nos enteramos si el checkout le falla a alguien.
  function falla(nombre, mensaje, detalle){ try{ if(window.HauslineSalud) window.HauslineSalud.error(nombre, mensaje, detalle||null); }catch(_){} }
  async function errorHttp(r, etapa){ var t=""; try{ t=(await r.text()).slice(0,300); }catch(_){} return new Error(etapa+" HTTP "+r.status+(t?": "+t:"")); }
  function estado(titulo, detalle){
    $("prog").innerHTML="";
    $("ck").innerHTML='<div class="state"><div style="color:var(--ink-3);margin-bottom:12px">'+ICON.alert+'</div>'
      +'<h1 style="font-size:20px;font-weight:800;margin:0">'+esc(titulo)+'</h1>'
      +'<p style="font-size:13.5px;color:var(--ink-2);margin:10px 0 0;line-height:1.55">'+esc(detalle)+'</p>'
      +'<a class="btn" style="max-width:280px;margin:22px auto 0" href="/">Ir a la tienda</a></div>';
  }

  // ---- Google Customer Reviews (opt-in), solo en la confirmación ----
  var GCR_MERCHANT_ID="5847964157", gcrDone=false;
  function dispararResenaGoogle(codigo){
    if(gcrDone) return; var raw; try{ raw=sessionStorage.getItem("hausline_gcr"); }catch(_){ return; } if(!raw) return;
    var d; try{ d=JSON.parse(raw); }catch(_){ return; } if(!d||!d.email||!d.order_id) return;
    if(codigo && String(d.order_id).toUpperCase()!==String(codigo).toUpperCase()) return;
    gcrDone=true; try{ sessionStorage.removeItem("hausline_gcr"); }catch(_){}
    window.renderOptIn=function(){ if(!window.gapi||!window.gapi.load) return; window.gapi.load("surveyoptin", function(){ try{ window.gapi.surveyoptin.render({merchant_id:GCR_MERCHANT_ID,order_id:String(d.order_id),email:String(d.email),delivery_country:"NI",estimated_delivery_date:String(d.estimated_delivery_date||""),opt_in_style:"CENTER_DIALOG"}); }catch(_){} }); };
    var s=document.createElement("script"); s.src="https://apis.google.com/js/platform.js?onload=renderOptIn"; s.async=true; s.defer=true; document.head.appendChild(s);
  }

  // ---- Carga del paso Pago + polling ----
  var CODIGOS=[];
  async function cargarPago(silencioso){
    try{
      var items=null;
      if(CODIGOS.length===1) items=await fetchGrupo(CODIGOS[0]).catch(function(){ return null; });
      if(!items){ var rs=await Promise.all(CODIGOS.map(function(c){ return fetchSolicitud(c).catch(function(){ return null; }); })); items=rs.filter(Boolean); }
      if(!items.length){ if(!silencioso) estado("No encontramos ese pedido","Verificá el código (ej. SOL-1234). Si acabás de crearlo, esperá unos segundos y recargá."); return; }
      if(silencioso && ultimoEstado!==null && calcular(items).estado===ultimoEstado) return;
      renderPago(items);
    }catch(ex){ if(!silencioso){ falla("checkout_error", "No se pudo cargar el pedido: "+((ex&&ex.message)||"error"), {paso:"confirmacion"}); estado("No pudimos cargar tu pedido","Revisá tu conexión e intentá de nuevo."); } }
  }
  function iniciarPolling(){ clearInterval(pollInt); pollInt=setInterval(function(){ if(document.hidden) return; cargarPago(true); },20000); }

  // ---- Router ----
  var PASO=new URLSearchParams(location.search).get("paso");
  CODIGOS=leerCodigos();
  if(!SB_URL||!SB_KEY){ falla("checkout_error", "Configuración incompleta (sin SB_URL/SB_KEY)"); estado("Configuración incompleta","No se pudo conectar con el servidor de pagos. Escribinos por WhatsApp."); }
  else if(PASO==="info" && !CODIGOS.length){ renderInfo(); }
  else if(PASO==="confirmacion" && CODIGOS.length){ renderConfirmacion(CODIGOS[0]); }
  else if(PASO==="pago" && !CODIGOS.length){ renderPagoPreorden(); }
  else if(CODIGOS.length){ cargarPago(false); iniciarPolling(); }
  else { estado("Empezá tu pedido","Abrí esta página desde el enlace que te dimos, o elegí un producto en la tienda y tocá “Encargar”."); }
})();
