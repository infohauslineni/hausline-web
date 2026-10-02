// Darse de baja de los correos de novedades (enlace al pie de cada correo):
// /baja/?e=correo&t=código → RPC dar_de_baja_suscriptor (valida el código firmado).
(function(){
  "use strict";
  var q = new URLSearchParams(location.search);
  var correo = (q.get("e") || "").trim(), token = (q.get("t") || "").trim();
  var titulo = document.getElementById("titulo"), texto = document.getElementById("texto");
  function mostrar(t, p){ titulo.textContent = t; texto.textContent = p; }
  if(!correo || !token){ mostrar("Enlace incompleto", "Abrí el enlace completo desde el correo, o escribinos por WhatsApp y te damos de baja."); return; }
  fetch(SUPABASE_URL + "rpc/dar_de_baja_suscriptor", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
    body: JSON.stringify({ p_correo: correo, p_token: token })
  }).then(function(r){ return r.ok ? r.json() : null; }).then(function(ok){
    if(ok === true) mostrar("Listo, te diste de baja", "Ya no te vamos a enviar correos de novedades a " + correo + ". Vas a seguir recibiendo los avisos de tus pedidos.");
    else mostrar("No pudimos darte de baja", "El enlace no es válido o venció. Escribinos por WhatsApp y lo hacemos por vos.");
  }).catch(function(){ mostrar("Sin conexión", "Revisá tu internet y volvé a abrir el enlace."); });
})();
