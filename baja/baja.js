// Darse de baja de los correos de novedades (enlace al pie de cada correo):
// /baja/?e=correo&t=código → RPC dar_de_baja_suscriptor (valida el código firmado).
(function(){
  "use strict";
  var q = new URLSearchParams(location.search);
  var correo = (q.get("e") || "").trim(), token = (q.get("t") || "").trim();
  var titulo = document.getElementById("titulo"), texto = document.getElementById("texto");
  function mostrar(t, p){ titulo.textContent = t; texto.textContent = p; }
  if(!correo || !token){ mostrar("Enlace incompleto", "Abra el enlace completo desde el correo, o escríbanos por WhatsApp y le damos de baja."); return; }
  fetch(SUPABASE_URL + "rpc/dar_de_baja_suscriptor", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
    body: JSON.stringify({ p_correo: correo, p_token: token })
  }).then(function(r){ return r.ok ? r.json() : null; }).then(function(ok){
    if(ok === true) mostrar("Listo, se dio de baja", "Ya no le vamos a enviar correos de novedades a " + correo + ". Va a seguir recibiendo los avisos de sus pedidos.");
    else mostrar("No pudimos darle de baja", "El enlace no es válido o venció. Escríbanos por WhatsApp y lo hacemos por usted.");
  }).catch(function(){ mostrar("Sin conexión", "Revise su internet y vuelva a abrir el enlace."); });
})();
