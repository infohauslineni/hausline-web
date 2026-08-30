// Formulario público de reseña (/resena/?c=CODE&p=PROD). Va en archivo aparte porque
// la CSP del sitio bloquea scripts inline (script-src 'self').
(function(){
  "use strict";
  var params = new URLSearchParams(location.search);
  var codigo = (params.get("c") || "").trim();
  var prod = (params.get("p") || "").trim();
  var estrellas = 0;

  var elCod = document.getElementById("cod");
  if(codigo && elCod) elCod.textContent = "Pedido " + codigo;

  var cont = document.getElementById("estrellas");
  cont.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click", function(){
      estrellas = parseInt(b.dataset.v, 10);
      cont.querySelectorAll("button").forEach(function(x){
        x.classList.toggle("on", parseInt(x.dataset.v, 10) <= estrellas);
      });
    });
  });

  var form = document.getElementById("form");
  var err = document.getElementById("err");
  function mostrarErr(m){ err.textContent = m; err.style.display = "block"; }

  form.addEventListener("submit", async function(e){
    e.preventDefault();
    err.style.display = "none";
    var nombre = document.getElementById("nombre").value.trim();
    var comentario = document.getElementById("comentario").value.trim();
    if(!estrellas) return mostrarErr("Elegí cuántas estrellas.");
    if(nombre.length < 2) return mostrarErr("Escribí tu nombre.");

    var btn = document.getElementById("enviar");
    btn.disabled = true; btn.textContent = "Enviando…";
    try{
      var res = await fetch(SUPABASE_URL + "rpc/crear_resena_publica", {
        method: "POST",
        headers: { "Content-Type":"application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + SUPABASE_ANON_KEY },
        body: JSON.stringify({ p_pedido_codigo: codigo || null, p_nombre: nombre, p_estrellas: estrellas, p_comentario: comentario || null, p_producto_codigo: prod || null })
      });
      var data = await res.json();
      if(!res.ok || !data || data.ok === false) throw new Error((data && data.error) || "error");
      document.getElementById("caja").innerHTML =
        '<div class="ok">' +
          '<div class="ic">✓</div>' +
          '<h2>¡Gracias por tu reseña!</h2>' +
          '<p>La revisamos y la publicamos muy pronto. Apreciamos que compartas tu experiencia con HAUSLINE.</p>' +
          '<a class="volver" href="/">← Volver a la tienda</a>' +
        '</div>';
    }catch(ex){
      btn.disabled = false; btn.textContent = "Enviar reseña";
      mostrarErr("No se pudo enviar. Revisá tu internet e intentá de nuevo.");
    }
  });
})();
