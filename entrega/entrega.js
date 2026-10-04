// Confirmar dirección de entrega (enlace del correo "Disponible para entrega"):
// /entrega/?c=HS123456&t=código → muestra la dirección guardada, el envío y el total; el cliente la
// confirma o la corrige (RPC entrega_pedido_publico / confirmar_entrega_publica, migración 202610020006).
(function(){
  "use strict";
  var DEPTOS = ["Managua","Masaya","Carazo","Granada","Rivas","León","Chinandega","Estelí","Madriz","Nueva Segovia","Matagalpa","Jinotega","Boaco","Chontales","Río San Juan","RACCN (Costa Caribe Norte)","RACCS (Costa Caribe Sur)"];
  var WA = "50578995116";
  var q = new URLSearchParams(location.search);
  var codigo = (q.get("c") || "").trim(), token = (q.get("t") || "").trim();
  var caja = document.getElementById("tarjeta");
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  function rpc(fn, cuerpo){
    return fetch(SUPABASE_URL + "rpc/" + fn, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY }, body: JSON.stringify(cuerpo) })
      .then(function(r){ return r.ok ? r.json() : null; });
  }
  function aviso(titulo, texto){ caja.innerHTML = '<p class="kicker">Pedido ' + esc(codigo) + '</p><h1>' + esc(titulo) + '</h1><p class="sub">' + texto + '</p><a class="btn sec" href="https://wa.me/' + WA + '" target="_blank" rel="noopener">Escríbanos por WhatsApp</a>'; }
  if(!codigo || !token){ aviso("Enlace incompleto", "Abra el enlace completo desde el correo, o escríbanos por WhatsApp."); return; }

  rpc("entrega_pedido_publico", { p_codigo: codigo, p_token: token }).then(function(d){
    if(!d || !d.ok){ aviso("No pudimos abrir su pedido", d && d.motivo === "enlace" ? "El enlace no es válido. Escríbanos por WhatsApp y lo coordinamos." : "Revise su conexión e intente de nuevo."); return; }
    var tc = Number(d.tipo_cambio) > 0 ? Number(d.tipo_cambio) : 37;
    var cs = function(u){ return "C$" + (Math.ceil(Number(u) * tc / 10) * 10).toLocaleString("en-US"); };
    var us = function(u){ return "US$" + Number(u).toFixed(2); };
    var envio = d.costo_envio != null ? Number(d.costo_envio) : null;
    var saldo = Number(d.saldo) || 0;
    var depActual = d.departamento || "";
    caja.innerHTML =
      '<p class="kicker">Pedido ' + esc(d.codigo) + '</p>'
      + '<h1>' + (d.nombre ? esc(d.nombre) + ", t" : "T") + 'u pedido está listo</h1>'
      + '<p class="sub">' + (d.confirmada ? "Ya nos confirmó esta dirección. Si desea cambiarla, edítela y vuelva a confirmar." : "Confirme a dónde se lo enviamos (o corrija la dirección).") + '</p>'
      + '<div class="campo"><label>Departamento</label><select id="dep"><option value="">Elija su departamento</option>' + DEPTOS.map(function(x){ return '<option' + (x.toLowerCase() === depActual.toLowerCase() ? " selected" : "") + '>' + esc(x) + '</option>'; }).join("") + '</select></div>'
      + '<div class="campo"><label>Dirección de entrega</label><input id="dir" autocomplete="street-address" placeholder="Barrio, calle, número de casa" value="' + esc(String(d.direccion || "").split(" · Ref: ")[0]) + '"></div>'
      + '<div class="campo"><label>Punto de referencia</label><input id="ref" placeholder="Opcional" value="' + esc(d.referencia || (String(d.direccion || "").split(" · Ref: ")[1] || "")) + '"></div>'
      + '<div class="resumen">'
      +   (saldo > 0.01 ? '<div class="fila"><span>Saldo del pedido</span><b>' + us(saldo) + '</b></div>' : '<div class="fila"><span>Pedido</span><b>Pagado ✓</b></div>')
      +   '<div class="fila"><span>Envío</span><b>' + (envio != null ? us(envio) : "A cotizar") + '</b></div>'
      +   (envio != null ? '<div class="fila total"><span>Total a pagar</span><b>' + us(saldo + envio) + ' · ' + cs(saldo + envio) + '</b></div>' : '')
      +   '<p class="nota">Si cambia de departamento, el envío se ajusta a la tarifa de ese lugar y se lo confirmamos por WhatsApp.</p>'
      + '</div>'
      + '<div class="error oculto" id="err"></div>'
      + '<button class="btn" id="ok" type="button">Confirmar dirección de entrega</button>'
      + '<a class="btn sec" href="https://wa.me/' + WA + '?text=' + encodeURIComponent("Hola, sobre la entrega de mi pedido " + d.codigo) + '" target="_blank" rel="noopener">Prefiero coordinar por WhatsApp</a>';
    var boton = document.getElementById("ok"), err = document.getElementById("err");
    boton.addEventListener("click", function(){
      var dir = document.getElementById("dir").value.trim(), dep = document.getElementById("dep").value, ref = document.getElementById("ref").value.trim();
      err.classList.add("oculto");
      if(!dep){ err.textContent = "Elija su departamento."; err.classList.remove("oculto"); return; }
      if(dir.length < 5){ err.textContent = "Escriba su dirección (barrio, calle, casa)."; err.classList.remove("oculto"); return; }
      boton.disabled = true; boton.textContent = "Confirmando…";
      rpc("confirmar_entrega_publica", { p_codigo: codigo, p_token: token, p_direccion: dir, p_referencia: ref, p_departamento: dep }).then(function(r){
        if(!r || !r.ok){
          err.textContent = r && r.motivo === "cerrado" ? "Este pedido ya fue entregado o cancelado." : "No pudimos guardar la dirección. Pruebe de nuevo o escríbanos por WhatsApp.";
          err.classList.remove("oculto"); boton.disabled = false; boton.textContent = "Confirmar dirección de entrega"; return;
        }
        var e2 = r.costo_envio != null ? Number(r.costo_envio) : null;
        caja.innerHTML = '<div class="ok"><div class="icono">✅</div><h1>¡Listo, gracias!</h1>'
          + '<p class="sub">Se lo enviamos a <b>' + esc(dir) + ', ' + esc(dep) + '</b>.' + (e2 != null ? ' Total a pagar con envío: <b>' + us(saldo + e2) + ' (' + cs(saldo + e2) + ')</b>.' : '') + ' Le escribimos por WhatsApp para coordinar la entrega.</p>'
          + '<a class="btn sec" href="/">Seguir viendo la tienda</a></div>';
      }).catch(function(){ err.textContent = "Sin conexión. Revise su internet e intente de nuevo."; err.classList.remove("oculto"); boton.disabled = false; boton.textContent = "Confirmar dirección de entrega"; });
    });
  }).catch(function(){ aviso("Sin conexión", "Revise su internet y vuelva a abrir el enlace."); });
})();
