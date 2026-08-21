// ============================================================
//  CHECKOUT / PÁGINA DE PAGO DEL ENCARGO  ·  /checkout/?c=SOL-####
//  Página completa (no modal). Lee la(s) solicitud(es) desde Supabase por su código
//  (RPC pública obtener_solicitud_publica) y arma la experiencia de pago:
//  confirmación, total, contador de 24 h, cómo pagar, cuentas, WhatsApp, resumen y
//  estado del pago (se refresca solo). Datos SIEMPRE desde la base, nunca del front.
// ============================================================
(function(){
  "use strict";

  // ---- Config (viene de ../config.js) con respaldos seguros ----
  var SB_URL  = (typeof SUPABASE_URL !== "undefined") ? SUPABASE_URL : "";
  var SB_KEY  = (typeof SUPABASE_ANON_KEY !== "undefined") ? SUPABASE_ANON_KEY : "";
  var CUENTAS = (typeof HAUSLINE_CUENTAS !== "undefined") ? HAUSLINE_CUENTAS : [];
  var RATE    = (typeof HAUSLINE_EXCHANGE_RATE !== "undefined") ? Number(HAUSLINE_EXCHANGE_RATE) : 37;
  var WA      = (typeof WHATSAPP_NUMERO !== "undefined" && WHATSAPP_NUMERO) || (typeof WHATSAPP !== "undefined" && WHATSAPP) || "50578995116";
  function cordobas(usd){ return (typeof cordobasCerrados === "function") ? cordobasCerrados(usd) : Math.ceil((Number(usd)||0)*RATE/10)*10; }

  // ---- Utilidades ----
  function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function usd(n){ return "$" + (Number(n)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function nio(n){ return "C$" + Math.round(Number(n)||0).toLocaleString("en-US"); }
  function $(id){ return document.getElementById(id); }
  function primerNombre(n){ return String(n||"").trim().split(/\s+/)[0] || ""; }

  var ICON = {
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    bank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 4l9 6"/><path d="M4 10v9M20 10v9M8 10v9M16 10v9M2 21h20"/></svg>',
    send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>',
    truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/></svg>',
    wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2z"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'
  };

  // ---- Toast ----
  var toastT;
  function toast(msg){
    var t = $("toast"); if(!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove("show"); }, 1500);
  }

  // ---- Insignia de color por banco (misma idea que la pasarela) ----
  function badge(c){
    var b = String(c.banco||"").toUpperCase(), m = String(c.moneda||"").toLowerCase();
    if(b.indexOf("LAFISE")>=0) return { bg:(m.indexOf("d")===0||m.indexOf("dól")>=0||m.indexOf("dol")>=0?"#12a15a":"#0e8a8a"), label:"LAFISE" };
    if(b.indexOf("BAC")>=0) return { bg:"#c0392b", label:"BAC" };
    if(b.indexOf("BILLETERA")>=0||b.indexOf("MOVIL")>=0||b.indexOf("MÓVIL")>=0) return { bg:"#7c4dbd", label:"📱" };
    return { bg:"#3a3a3a", label:b.slice(0,5) };
  }
  function esBilletera(c){ var b=String(c.banco||"").toLowerCase(); return b.indexOf("billetera")>=0||b.indexOf("movil")>=0||b.indexOf("móvil")>=0; }

  // ---- Lectura de la(s) solicitud(es) ----
  function leerCodigos(){
    var p = new URLSearchParams(location.search);
    var raw = p.get("c") || p.get("codigo") || p.get("sol") || "";
    // También soporta /checkout/#SOL-1234 por si acaso.
    if(!raw && location.hash) raw = location.hash.replace(/^#/,"");
    return raw.split(",").map(function(s){ return s.trim().toUpperCase(); }).filter(Boolean).slice(0,10);
  }

  async function fetchSolicitud(codigo){
    var res = await fetch(SB_URL + "rpc/obtener_solicitud_publica", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "apikey":SB_KEY, "Authorization":"Bearer "+SB_KEY },
      body: JSON.stringify({ p_codigo: codigo })
    });
    if(!res.ok) throw new Error("HTTP "+res.status);
    var data = await res.json();
    return (data && data.codigo) ? data : null;
  }

  // ---- Cálculo del estado agregado ----
  function calcular(items){
    var now = Date.now();
    var pagado = items.length > 0 && items.every(function(s){ return s.estado === "confirmada"; });
    var pendientes = items.filter(function(s){ return s.estado === "pendiente" && new Date(s.vence_at).getTime() > now; });
    var estado = pagado ? "pagado" : (pendientes.length ? "pendiente" : "vencido");
    var abono = items.reduce(function(t,s){ return t + (Number(s.abono)||0); }, 0);
    var total = items.reduce(function(t,s){ return t + (Number(s.total)||0); }, 0);
    var saldo = items.reduce(function(t,s){ return t + (Number(s.saldo)||0); }, 0);
    // Vencimiento más próximo (para el contador).
    var vence = items.reduce(function(min,s){ var v=new Date(s.vence_at).getTime(); return (min===null||v<min)?v:min; }, null);
    var creado = items.reduce(function(min,s){ var v=new Date(s.created_at).getTime(); return (min===null||v<min)?v:min; }, null);
    var todos50 = items.every(function(s){ return s.pago_tipo === "50"; });
    var todosTotal = items.every(function(s){ return s.pago_tipo !== "50"; });
    var etiquetaPago = todos50 ? "50% de anticipo" : (todosTotal ? "Pago completo" : "Anticipo");
    return { estado:estado, abono:abono, total:total, saldo:saldo, vence:vence, creado:creado, etiquetaPago:etiquetaPago };
  }

  // ---- Render principal ----
  var timerInt = null, pollInt = null, ultimoEstado = null;

  function render(items){
    var c = calcular(items);
    var codes = items.map(function(s){ return s.codigo; });
    var codeStr = codes.join(", ");
    var nombre = primerNombre(items[0] && items[0].cliente_nombre);
    ultimoEstado = c.estado;

    // Header
    $("headCode").innerHTML = "Código: <b>" + esc(codeStr) + "</b>";

    var pagado = c.estado === "pagado";
    var vencido = c.estado === "vencido";

    // Cuentas
    var cuentasHTML = CUENTAS.map(function(cu){
      var b = badge(cu);
      return '<div class="acct rv"><span class="badge" style="background:'+b.bg+'">'+b.label+'</span>'+
        '<div class="info"><b>'+esc(cu.banco)+(cu.moneda?" · "+esc(cu.moneda):"")+'</b><small>'+esc(cu.titular)+'</small></div>'+
        '<div class="right"><div class="num"><span class="l">'+(esBilletera(cu)?"Número":"Cuenta")+'</span><span class="v">'+esc(cu.numero)+'</span></div>'+
        '<button class="btn-copy" data-copy="'+esc(cu.numero)+'" data-msg="Cuenta copiada">Copiar</button></div></div>';
    }).join("") || '<div class="acct"><div class="info"><b>Escríbenos por WhatsApp para los datos de pago</b></div></div>';

    // Resumen (una fila por encargo + totales)
    var resumen = items.map(function(s){
      var rows = ""
        + fila("Código", '<span class="v mono">'+esc(s.codigo)+'</span>')
        + fila("Producto", '<span class="v">'+esc(s.producto)+(s.marca?' · '+esc(s.marca):'')+'</span>')
        + (s.talla ? fila("Talla", '<span class="v">'+esc(s.talla)+'</span>') : "")
        + fila("Cantidad", '<span class="v">×'+esc(s.cantidad)+'</span>')
        + fila("Total", '<span class="v mono">'+usd(s.total)+'</span>')
        + fila("Anticipo a pagar", '<span class="v mono" style="color:var(--verde)">'+usd(s.abono)+'</span>')
        + fila("Saldo restante", '<span class="v mono">'+usd(s.saldo)+'</span>');
      return items.length > 1
        ? '<div class="card-2" style="border:1px solid var(--borde);border-radius:12px;padding:12px 14px;margin-top:10px">'+rows+'</div>'
        : rows;
    }).join("");

    // Pasos
    var pasos = ''
      + paso("01", ICON.bank, "Elige una cuenta", "Selecciona la cuenta a la que vas a transferir.")
      + paso("02", ICON.send, "Transfiere el monto", "Envía exactamente "+usd(c.abono)+".")
      + paso("03", ICON.chat, "Envía tu comprobante", "Mándanos el comprobante por WhatsApp.");

    // Estado del pago (bloque)
    var pstate = pagado
      ? '<div class="pstate pay"><span class="dot"></span> PAGO RECIBIDO ✓</div>'
      : vencido
        ? '<div class="pstate exp"><span class="dot"></span> PERÍODO DE PAGO EXPIRADO</div>'
        : '<div class="pstate pend"><span class="dot"></span> PENDIENTE DE PAGO</div>';

    // Mensaje de WhatsApp
    var waMsg = "Hola" + (nombre ? ", soy " + nombre : "") + ". Acabo de realizar el pago de mi encargo " + codeStr + " por " + usd(c.abono) + ". Adjunto mi comprobante.";
    var waHref = "https://wa.me/" + WA + "?text=" + encodeURIComponent(waMsg);
    var ayudaHref = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hola, necesito ayuda con mi encargo " + codeStr + ". Mi consulta es: ");

    var html = "";

    // 1-2-3) Confirmación + código
    html += '<section class="card card-glow rv ck-hero">'
      + '<div class="ck-check">'+ICON.check+'</div>'
      + '<h1>'+(pagado?'¡Pago confirmado!':'¡Encargo recibido!')+'</h1>'
      + '<p>'+(pagado?'Recibimos tu pago. Tu pedido ya está en proceso.':'Tu encargo ha sido registrado correctamente.')+'</p>'
      + '<div class="ck-code-label">'+(items.length>1?'Códigos de encargo':'Código de encargo')+'</div>'
      + '<div class="ck-code-big"><b>'+esc(codeStr)+'</b><button class="btn-copy" data-copy="'+esc(codeStr)+'" data-msg="¡Código copiado!">Copiar código</button></div>'
      + '<div style="margin-top:16px">'+pstate+'</div>'
      + '</section>';

    if(pagado){
      // Estado pagado: sin instrucciones de pago.
      html += '<div class="banner ok rv">'+ICON.check+'<div><b>Pago confirmado.</b> No necesitas hacer nada más. Te contactaremos por WhatsApp para coordinar tu pedido. Guardá tu código <b>'+esc(codeStr)+'</b>.</div></div>';
      html += '<a class="cta-wa rv" href="'+ayudaHref+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+' Escribinos por WhatsApp</a>';
    } else {
      // 3) Total + tiempo
      html += '<section class="card rv"><div class="ck-pay">'
        + '<div><div class="ck-pay-k">Total a pagar</div><div class="ck-pay-usd">'+usd(c.abono)+'</div>'
        + '<div class="ck-pay-nio">≈ '+nio(cordobas(c.abono))+'</div><span class="ck-badge">'+esc(c.etiquetaPago)+'</span></div>'
        + '<div class="ck-clock"><div class="lbl">'+ICON.clock+' Tiempo límite</div>'
        + '<div class="ck-timer'+(vencido?' exp':'')+'" id="timer">'+(vencido?'Expirado':'--:--:--')+'</div>'
        + '<small id="timerNote">'+(vencido?'El período de pago ha terminado. Escribinos para reactivarlo.':'Tienes 24 horas para pagar. Si no recibimos el pago, el encargo se cancela automáticamente.')+'</small></div>'
        + '</div></section>';

      if(vencido){
        html += '<div class="banner exp rv">'+ICON.alert+'<div><b>El período de pago ha expirado.</b> Tu encargo pudo cancelarse. Escribinos por WhatsApp para revisarlo o volver a encargar.</div></div>';
      }

      // Cuentas PRIMERO: el cliente las ve apenas mira el total, sin scrollear.
      html += '<div class="sec-title rv">'+ICON.truck+' Transfiere a cualquiera de estas cuentas</div><section class="accts rv">'+cuentasHTML+'</section>';

      // WhatsApp: la acción principal, justo debajo de las cuentas.
      html += '<a class="cta-wa rv" href="'+waHref+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+' Enviar comprobante por WhatsApp</a>';

      // "¿Cómo pagar?" queda como referencia, más abajo.
      html += '<div class="sec-title rv">¿Cómo pagar?</div><section class="steps rv">'+pasos+'</section>';
    }

    // 8) Resumen
    html += '<div class="sec-title rv">Resumen del encargo</div><section class="card rv">'+resumen
      + (items.length>1 ? fila("Total a pagar ahora", '<span class="v mono" style="color:var(--verde)">'+usd(c.abono)+'</span>') : "")
      + '</section>';

    // Ayuda / seguridad
    html += '<section class="card rv" style="display:flex;gap:12px;align-items:flex-start">'
      + '<span class="shield-ic" style="color:var(--verde)">'+ICON.shield+'</span>'
      + '<div><b style="font-size:13.5px">Pago seguro por transferencia</b>'
      + '<p class="muted" style="font-size:12px;margin:5px 0 0;line-height:1.5">No se cobra nada en línea. Transferí a una de las cuentas y enviá tu comprobante por WhatsApp. '
      + '<a href="'+ayudaHref+'" target="_blank" rel="noopener noreferrer" style="color:var(--verde);text-decoration:none">¿Necesitás ayuda?</a></p></div></section>';

    html += '<div class="foot rv">© HAUSLINE · King of Shoes · <a href="/">Volver a la tienda</a></div>';

    $("ck").innerHTML = html;

    // Animación escalonada
    var revs = $("ck").querySelectorAll(".rv");
    for(var i=0;i<revs.length;i++){ revs[i].style.animationDelay = Math.min(i*45, 360) + "ms"; }

    // Botones copiar
    var copies = $("ck").querySelectorAll("[data-copy]");
    for(var j=0;j<copies.length;j++){
      copies[j].addEventListener("click", function(){
        var val = this.getAttribute("data-copy"), msg = this.getAttribute("data-msg") || "Copiado";
        if(navigator.clipboard) navigator.clipboard.writeText(val).catch(function(){});
        toast(msg);
        var el = this, orig = el.textContent; el.classList.add("ok"); el.textContent = "✓ Copiado";
        setTimeout(function(){ el.classList.remove("ok"); el.textContent = orig; }, 1300);
      });
    }

    // Contador
    if(!pagado && !vencido && c.vence){ iniciarContador(c.vence); }
  }

  function fila(k, vHtml){ return '<div class="sumrow"><span class="k">'+esc(k)+'</span>'+vHtml+'</div>'; }
  function paso(n, ic, t, d){ return '<div class="step"><div class="n">'+n+'</div><div class="ic">'+ic+'</div><b>'+esc(t)+'</b><small>'+esc(d)+'</small></div>'; }

  function iniciarContador(venceMs){
    clearInterval(timerInt);
    function tick(){
      var t = $("timer"); if(!t) return;
      var diff = venceMs - Date.now();
      if(diff <= 0){
        clearInterval(timerInt);
        t.textContent = "Expirado"; t.classList.add("exp");
        var note = $("timerNote"); if(note) note.textContent = "El período de pago ha terminado.";
        // Recargamos el estado desde la base (pudo marcarse vencida/confirmada).
        cargar(true);
        return;
      }
      var h = Math.floor(diff/3600000), m = Math.floor(diff%3600000/60000), s = Math.floor(diff%60000/1000);
      t.textContent = String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    }
    tick(); timerInt = setInterval(tick, 1000);
  }

  function error(titulo, detalle){
    $("ck").innerHTML = '<section class="card rv center" style="padding:44px 24px">'
      + '<div class="err-ic" style="color:var(--texto-3);margin-bottom:12px">'+ICON.alert+'</div>'
      + '<h1 style="font-size:20px;font-weight:800;margin:0">'+esc(titulo)+'</h1>'
      + '<p class="muted" style="font-size:13.5px;margin:10px 0 0;line-height:1.55">'+esc(detalle)+'</p>'
      + '<a class="cta-wa" style="max-width:320px;margin:22px auto 0" href="/">Volver a la tienda</a>'
      + '</section>';
  }

  // ---- Carga + polling ----
  var CODIGOS = [];
  async function cargar(silencioso){
    try{
      var resultados = await Promise.all(CODIGOS.map(function(c){ return fetchSolicitud(c).catch(function(){ return null; }); }));
      var items = resultados.filter(Boolean);
      if(!items.length){
        if(!silencioso) error("No encontramos ese encargo", "Verificá que el código esté bien escrito (ejemplo: SOL-1234). Si acabás de crearlo, esperá unos segundos y recargá.");
        return;
      }
      // En los refrescos silenciosos (cada 20 s) solo re-dibujamos si CAMBIÓ el estado
      // del pago. Así el contador sigue corriendo solo y la página no "parpadea"/recarga.
      if(silencioso && ultimoEstado !== null && calcular(items).estado === ultimoEstado) return;
      render(items);
    }catch(ex){
      if(!silencioso) error("No pudimos cargar tu encargo", "Revisá tu conexión e intentá de nuevo. Si el problema sigue, escribinos por WhatsApp.");
    }
  }

  function iniciarPolling(){
    clearInterval(pollInt);
    // Cada 20 s revisamos si el admin ya confirmó el pago (o si venció), sin recargar la página.
    pollInt = setInterval(function(){
      if(document.hidden) return;
      cargar(true);
    }, 20000);
  }

  // ---- Arranque ----
  CODIGOS = leerCodigos();
  if(!SB_URL || !SB_KEY){
    error("Configuración incompleta", "No se pudo conectar con el servidor de pagos. Escribinos por WhatsApp y te ayudamos.");
  } else if(!CODIGOS.length){
    error("Falta el código del encargo", "Abrí esta página desde el enlace que te dimos al crear tu encargo, o agregá tu código: /checkout/?c=SOL-1234");
  } else {
    cargar(false);
    iniciarPolling();
  }
})();
