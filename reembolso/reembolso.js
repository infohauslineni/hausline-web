// Datos para la devolución: cuando HAUSLINE cancela un pedido pagado, el correo y el WhatsApp
// traen /reembolso/?t=<token>. El cliente llena banco, moneda, número de cuenta y titular →
// RPC enviar_datos_reembolso (tracking) y aviso al admin (/api/notificar-estado).
(function(){
  "use strict";
  var token = (new URLSearchParams(location.search).get("t") || "").trim();
  var $ = function(id){ return document.getElementById(id); };
  var ver = function(id){ ["cargando", "formulario", "listo", "mensaje"].forEach(function(x){ $(x).hidden = x !== id; }); };
  var mensaje = function(t, p){ $("mensajeTitulo").textContent = t; $("mensajeTexto").textContent = p; ver("mensaje"); };
  var rpc = function(nombre, cuerpo){
    return fetch(SUPABASE_URL + "rpc/" + nombre, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
      body: JSON.stringify(cuerpo)
    });
  };
  if(!/^[0-9a-f-]{36}$/i.test(token)){ mensaje("Enlace incompleto", "Abra el enlace completo desde el correo o el WhatsApp que le enviamos."); return; }

  rpc("reembolso_datos_publico", { p_token: token }).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
    if(!d || !d.codigo){ mensaje("Enlace no válido", "No encontramos esta devolución. Escríbanos por WhatsApp y le ayudamos."); return; }
    if(d.enviado){
      $("listoTexto").textContent = d.estado === "aprobada" ? "La devolución ya se hizo. Revise su cuenta; si no la ve, escríbanos por WhatsApp." : "Ya tenemos los datos de su cuenta. Vamos a hacer la transferencia en 1 a 3 días hábiles y le avisamos por correo.";
      ver("listo"); return;
    }
    $("codigo").textContent = d.codigo;
    $("monto").textContent = "US$ " + Number(d.monto || 0).toFixed(2);
    if(d.nombre) $("saludo").textContent = "Hola, " + d.nombre + ". Su pedido fue cancelado y vamos a devolverle lo que pagó. Complete los datos de su cuenta bancaria y hacemos la transferencia.";
    ver("formulario");
  }).catch(function(){ mensaje("Sin conexión", "Revise su internet y vuelva a abrir el enlace."); });

  $("banco").addEventListener("change", function(){ $("bancoOtroCaja").hidden = this.value !== "otro"; });

  $("form").addEventListener("submit", function(e){
    e.preventDefault();
    var banco = $("banco").value === "otro" ? $("bancoOtro").value.trim() : $("banco").value;
    var numero = $("numero").value.trim(), titular = $("titular").value.trim();
    var error = function(t){ $("error").textContent = t; $("error").hidden = false; };
    $("error").hidden = true;
    if(banco.length < 2) return error("Elija su banco.");
    if(numero.replace(/\s/g, "").length < 4) return error("Escriba el número de cuenta completo.");
    if(titular.length < 3) return error("Escriba el nombre del titular de la cuenta.");
    $("enviar").disabled = true; $("enviar").textContent = "Enviando…";
    rpc("enviar_datos_reembolso", { p_token: token, p_banco: banco, p_moneda: $("moneda").value, p_numero: numero, p_titular: titular })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(ok){
        if(ok !== true){ $("enviar").disabled = false; $("enviar").textContent = "Enviar datos"; return error("No pudimos guardar sus datos. Revíselos o escríbanos por WhatsApp."); }
        // Aviso al equipo (si falla, igual quedó guardado y lo ven en el panel).
        fetch("https://hausline-tracking.vercel.app/api/notificar-estado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reembolsoDatos: token }) }).catch(function(){});
        ver("listo");
      })
      .catch(function(){ $("enviar").disabled = false; $("enviar").textContent = "Enviar datos"; error("Sin conexión. Intente de nuevo."); });
  });
})();
