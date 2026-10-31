// Formulario público de reseña (/resena/?c=CODE&p=PROD&e=ESTRELLAS). Va en archivo aparte porque
// la CSP del sitio bloquea scripts inline (script-src 'self').
// Se envía al servidor del panel (revisa el pedido y guarda la foto); la reseña queda pendiente
// hasta que se aprueba en el panel.
(function(){
  "use strict";
  var API = "https://hausline-tracking.vercel.app/api/notificar-estado";
  var params = new URLSearchParams(location.search);
  var codigo = (params.get("c") || "").trim();
  var prod = (params.get("p") || "").trim();
  var estrellas = 0;
  var foto = null; // data URL (JPEG ya comprimido)
  var TEXTOS = ["", "Muy mala", "Mala", "Normal", "Buena", "¡Excelente!"];

  var elCod = document.getElementById("cod");
  if(codigo && elCod) elCod.textContent = "Pedido " + codigo;

  // ---------- Estrellas ----------
  var cont = document.getElementById("estrellas"), etiqueta = document.getElementById("etiqueta");
  function marcar(n){
    estrellas = n;
    cont.querySelectorAll("button").forEach(function(x){
      var on = parseInt(x.dataset.v, 10) <= n;
      x.classList.toggle("on", on);
      x.setAttribute("aria-checked", String(parseInt(x.dataset.v, 10) === n));
    });
    etiqueta.textContent = TEXTOS[n] || "Toque las estrellas";
  }
  cont.querySelectorAll("button").forEach(function(b){ b.addEventListener("click", function(){ marcar(parseInt(b.dataset.v, 10)); }); });
  var pre = parseInt(params.get("e") || "", 10);
  if(pre >= 1 && pre <= 5) marcar(pre);

  // ---------- Foto (se comprime en el teléfono a 1200 px para que suba rápido) ----------
  var zona = document.getElementById("fotoZona"), input = document.getElementById("fotoInput");
  function botonFoto(){
    zona.innerHTML = '<button type="button" class="foto-btn" id="fotoBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></svg><span>Agregar una foto<br><small>Con su producto puesto o recién llegado</small></span></button>';
    document.getElementById("fotoBtn").addEventListener("click", function(){ input.click(); });
  }
  document.getElementById("fotoBtn").addEventListener("click", function(){ input.click(); });
  function comprimir(file){
    return new Promise(function(ok, mal){
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function(){
        var esc = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * esc)); c.height = Math.max(1, Math.round(img.naturalHeight * esc));
        var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = function(){ URL.revokeObjectURL(url); mal(new Error("foto")); };
      img.src = url;
    });
  }
  input.addEventListener("change", async function(){
    var f = input.files && input.files[0]; input.value = "";
    if(!f) return;
    if(!/^image\//.test(f.type)) return mostrarErr("Ese archivo no es una foto.");
    try{
      foto = await comprimir(f);
      zona.innerHTML = '<div class="foto-prev"><img alt="Su foto"><button type="button" class="foto-quitar">Quitar foto</button></div>';
      zona.querySelector("img").src = foto;
      zona.querySelector(".foto-quitar").addEventListener("click", function(){ foto = null; botonFoto(); });
      err.style.display = "none";
    }catch(e){ mostrarErr("No se pudo leer la foto. Pruebe con otra."); }
  });

  // ---------- Enviar ----------
  var form = document.getElementById("form");
  var err = document.getElementById("err");
  function mostrarErr(m){ err.textContent = m; err.style.display = "block"; }
  var ERRORES = {
    codigo: "El enlace de la reseña no es válido. Ábralo de nuevo desde su correo.",
    pedido: "No encontramos ese pedido. Ábralo de nuevo desde su correo.",
    demasiadas: "Este pedido ya tiene reseñas registradas. ¡Gracias!",
    foto_grande: "La foto es muy pesada. Pruebe con otra.",
    foto_invalida: "No se pudo usar esa foto. Pruebe con otra.",
  };

  form.addEventListener("submit", async function(e){
    e.preventDefault();
    err.style.display = "none";
    if(!codigo) return mostrarErr(ERRORES.codigo);
    if(!estrellas) return mostrarErr("Elija cuántas estrellas.");
    var btn = document.getElementById("enviar");
    btn.disabled = true; btn.textContent = foto ? "Subiendo foto…" : "Enviando…";
    try{
      var res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resenaPublica: true, codigo: codigo, estrellas: estrellas, comentario: document.getElementById("comentario").value.trim(), producto: prod || null, foto: foto })
      });
      var data = await res.json().catch(function(){ return null; });
      if(!res.ok || !data || data.ok === false) throw new Error((data && data.error) || "error");
      document.getElementById("caja").innerHTML =
        '<div class="logo">HAUSLINE</div>' +
        '<div class="ok">' +
          '<div class="ic">★</div>' +
          '<h2>¡Gracias por su reseña!</h2>' +
          '<p>La revisamos y la publicamos muy pronto. Nos alegra mucho que comparta su experiencia con HAUSLINE.</p>' +
          '<a class="volver" href="/">Volver a la tienda</a>' +
        '</div>';
    }catch(ex){
      btn.disabled = false; btn.textContent = "Enviar reseña";
      mostrarErr(ERRORES[ex.message] || "No se pudo enviar. Revise su internet e intente de nuevo.");
    }
  });
})();
