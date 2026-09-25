// Imagen "Nuevo en HAUSLINE" para Instagram, generada en el navegador (canvas) al subir un
// producto en el panel (admin.html) o desde el botón 📸 de la lista. Dos formatos:
//   · Post 4:5  (1080×1350)   · Story 9:16 (1080×1920)
// + el texto de la publicación listo para copiar. Se descarga como JPG y se programa en
// Meta Business Suite / Instagram. Usa los colores y fuentes de la tienda.
(function(){
  "use strict";
  var C = { fondo:"#F7F3EC", card:"#FFFFFF", borde:"#E7E3DC", tinta:"#171310", gris:"#6B655C", gris2:"#9C958A" };
  var SERIF = '"Cormorant Garamond", Georgia, serif';
  var SANS = 'Jost, "Segoe UI", Helvetica, Arial, sans-serif';
  var SITIO = "hauslineshopni.es";
  var WHATSAPP = "+505 7899 5116";

  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }

  // Foto del producto con CORS (sin esto el canvas queda "manchado" y no se puede descargar).
  function cargarImagen(src){
    return new Promise(function(res){
      if(!src){ res(null); return; }
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function(){ res(img); };
      img.onerror = function(){ res(null); };
      // Cache-bust en URLs absolutas: si el navegador ya la tenía sin CORS, la pediría manchada.
      img.src = /^https?:/i.test(src) ? src + (src.indexOf("?") < 0 ? "?" : "&") + "ig=1" : src;
    });
  }
  function fuentesListas(){
    if(!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('600 96px "Cormorant Garamond"'),
      document.fonts.load('500 40px "Cormorant Garamond"'),
      document.fonts.load('500 32px Jost'),
      document.fonts.load('600 26px Jost')
    ]).catch(function(){});
  }

  function rectRedondo(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // Texto centrado con letter-spacing (canvas no lo trae en todos los navegadores).
  function textoEspaciado(ctx, texto, cx, y, espacio){
    var chars = String(texto).split(""), ancho = 0;
    chars.forEach(function(c){ ancho += ctx.measureText(c).width + espacio; });
    ancho -= espacio;
    var x = cx - ancho / 2;
    ctx.textAlign = "left";
    chars.forEach(function(c){ ctx.fillText(c, x, y); x += ctx.measureText(c).width + espacio; });
    ctx.textAlign = "center";
  }
  // Parte el nombre en hasta `max` líneas que entren en `ancho`.
  function lineas(ctx, texto, ancho, max){
    var palabras = String(texto).split(/\s+/).filter(Boolean), out = [], linea = "";
    palabras.forEach(function(p){
      var prueba = linea ? linea + " " + p : p;
      if(ctx.measureText(prueba).width > ancho && linea){ out.push(linea); linea = p; } else linea = prueba;
    });
    if(linea) out.push(linea);
    if(out.length > max){ out = out.slice(0, max); out[max - 1] = out[max - 1].replace(/\s*\S*$/, "") + "…"; }
    return out;
  }

  function precioTexto(p){
    if(p.cotizar || !(Number(p.precio) > 0)) return "Precio a consultar";
    var n = Number(p.precioOferta) > 0 ? Number(p.precioOferta) : Number(p.precio);
    return "US$ " + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function dibujar(canvas, p, img, formato){
    var W = 1080, H = formato === "story" ? 1920 : 1350;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = C.fondo; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";

    var story = formato === "story";
    var y0 = story ? 190 : 120;

    // Encabezado
    ctx.fillStyle = C.gris; ctx.font = "600 26px " + SANS;
    textoEspaciado(ctx, "NUEVO INGRESO", W / 2, y0, 9);
    ctx.fillStyle = C.tinta; ctx.font = "600 " + (story ? 104 : 92) + "px " + SERIF;
    ctx.fillText("Nuevo en HAUSLINE", W / 2, y0 + (story ? 110 : 98));

    // Tarjeta con la foto
    var cx = 90, cw = W - 180, cy = y0 + (story ? 170 : 145), ch = story ? 920 : 715;
    ctx.save();
    ctx.shadowColor = "rgba(23,19,16,.08)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    rectRedondo(ctx, cx, cy, cw, ch, 36); ctx.fillStyle = C.card; ctx.fill();
    ctx.restore();
    rectRedondo(ctx, cx, cy, cw, ch, 36); ctx.strokeStyle = C.borde; ctx.lineWidth = 2; ctx.stroke();
    if(img){
      // La foto LLENA la tarjeta (recorte centrado): las fotos del catálogo traen su propio fondo.
      var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var iw = img.naturalWidth * s, ih = img.naturalHeight * s;
      ctx.save(); rectRedondo(ctx, cx, cy, cw, ch, 36); ctx.clip();
      ctx.drawImage(img, cx + (cw - iw) / 2, cy + (ch - ih) / 2, iw, ih);
      ctx.restore();
    } else {
      ctx.fillStyle = C.gris2; ctx.font = "500 32px " + SANS; ctx.fillText("Foto del producto", W / 2, cy + ch / 2);
    }

    // Nombre + precio
    var yN = cy + ch + (story ? 100 : 78);
    ctx.fillStyle = C.tinta; ctx.font = "500 " + (story ? 44 : 38) + "px " + SANS;
    var ls = lineas(ctx, String(p.nombre || "").toUpperCase(), W - 200, 2);
    ls.forEach(function(l, i){ textoEspaciado(ctx, l, W / 2, yN + i * (story ? 56 : 48), 3); });
    var yP = yN + (ls.length - 1) * (story ? 56 : 48) + (story ? 96 : 80);
    ctx.font = "600 " + (story ? 80 : 68) + "px " + SERIF;
    ctx.fillText(precioTexto(p), W / 2, yP);

    // Pie
    if(story){
      var bwid = 780, bx = (W - bwid) / 2, by = H - 260;
      rectRedondo(ctx, bx, by, bwid, 96, 48); ctx.fillStyle = C.tinta; ctx.fill();
      ctx.fillStyle = C.fondo; ctx.font = "600 30px " + SANS;
      textoEspaciado(ctx, "ENCARGALO EN " + SITIO.toUpperCase(), W / 2, by + 60, 2);
      ctx.fillStyle = C.gris; ctx.font = "500 28px " + SANS;
      ctx.fillText("Envíos a toda Nicaragua · " + (p.codigo || ""), W / 2, H - 110);
    } else {
      ctx.fillStyle = C.gris; ctx.font = "500 28px " + SANS;
      ctx.fillText("Encargalo en " + SITIO + " · Envíos a toda Nicaragua", W / 2, H - 70);
    }
  }

  function textoPost(p){
    var dem = (typeof p.demoraExtendida !== "undefined" && p.demoraExtendida) ? "\n⏳ Este producto puede tardar un poco más de lo normal." : "";
    return "✨ Nuevo en HAUSLINE\n\n"
      + (p.nombre || "") + "\n"
      + "💵 " + precioTexto(p) + "\n"
      + "📦 Por encargo · envíos a toda Nicaragua" + dem + "\n\n"
      + "🛒 Encargalo en " + SITIO + "/p/" + encodeURIComponent(p.codigo || "") + "/\n"
      + "📲 WhatsApp " + WHATSAPP + "\n\n"
      + "#hausline #nicaragua #managua #sneakers #streetwear #moda";
  }

  var CSS = ".hlig-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:16px;overflow:auto}"
    + ".hlig-box{background:#141714;border:1px solid #2f362e;border-radius:18px;max-width:980px;width:100%;padding:20px;color:#eef1ec;font-family:inherit}"
    + ".hlig-h{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:6px}.hlig-h b{font-size:17px}"
    + ".hlig-x{background:none;border:1px solid #2f362e;color:#eef1ec;border-radius:10px;width:36px;height:36px;cursor:pointer;font-size:18px}"
    + ".hlig-sub{color:#99a299;font-size:12.5px;margin:0 0 14px}"
    + ".hlig-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:700px){.hlig-grid{grid-template-columns:1fr}}"
    + ".hlig-col{display:flex;flex-direction:column;gap:8px;align-items:stretch}.hlig-col small{color:#99a299;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700}"
    + ".hlig-col canvas{width:100%;height:auto;border-radius:12px;border:1px solid #2f362e;background:#F7F3EC}"
    + ".hlig-btn{display:inline-flex;justify-content:center;align-items:center;gap:8px;border:1px solid #b6f13c;background:#b6f13c;color:#0b0f08;border-radius:12px;padding:11px 14px;font-weight:700;font-size:13px;cursor:pointer}"
    + ".hlig-btn.sec{background:transparent;color:#eef1ec;border-color:#2f362e}"
    + ".hlig-txt{width:100%;min-height:150px;margin-top:14px;background:#0a0c0a;border:1px solid #2f362e;border-radius:12px;color:#eef1ec;padding:12px;font-size:13px;line-height:1.5;font-family:inherit;resize:vertical;box-sizing:border-box}"
    + ".hlig-fila{display:flex;gap:8px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap}";

  function slug(s){ return String(s || "producto").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 40); }
  function descargar(canvas, nombre){
    canvas.toBlob(function(blob){
      if(!blob) return;
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
    }, "image/jpeg", 0.92);
  }

  // p = datos del producto del panel: { codigo, nombre, precio, precioOferta, cotizar, imagen, demoraExtendida }
  async function abrir(p){
    if(!p) return;
    if(!document.getElementById("hlig-css")){ var st = document.createElement("style"); st.id = "hlig-css"; st.textContent = CSS; document.head.appendChild(st); }
    var ov = document.createElement("div"); ov.className = "hlig-ov";
    ov.innerHTML = '<div class="hlig-box" role="dialog" aria-modal="true" aria-label="Imagen para Instagram">'
      + '<div class="hlig-h"><b>📸 Imagen para Instagram · ' + esc(p.codigo || "") + '</b><button class="hlig-x" type="button" data-cerrar aria-label="Cerrar">✕</button></div>'
      + '<p class="hlig-sub">Descargala y programala en Meta Business Suite (post y story). El texto de abajo va de descripción.</p>'
      + '<div class="hlig-grid"><div class="hlig-col"><small>Post · 4:5</small><canvas data-c="post"></canvas><button class="hlig-btn" type="button" data-d="post">⬇ Descargar post</button></div>'
      + '<div class="hlig-col"><small>Story · 9:16</small><canvas data-c="story" style="max-height:560px;object-fit:contain"></canvas><button class="hlig-btn" type="button" data-d="story">⬇ Descargar story</button></div></div>'
      + '<textarea class="hlig-txt" data-t readonly></textarea>'
      + '<div class="hlig-fila"><button class="hlig-btn sec" type="button" data-copiar>Copiar texto</button><button class="hlig-btn sec" type="button" data-cerrar>Listo</button></div></div>';
    document.body.appendChild(ov);
    var cerrar = function(){ ov.remove(); document.removeEventListener("keydown", onKey); };
    var onKey = function(e){ if(e.key === "Escape") cerrar(); };
    document.addEventListener("keydown", onKey);
    ov.addEventListener("click", function(e){ if(e.target === ov) cerrar(); });
    ov.querySelectorAll("[data-cerrar]").forEach(function(b){ b.addEventListener("click", cerrar); });
    var txt = ov.querySelector("[data-t]"); txt.value = textoPost(p);
    ov.querySelector("[data-copiar]").addEventListener("click", function(e){
      var b = e.currentTarget;
      (navigator.clipboard ? navigator.clipboard.writeText(txt.value) : Promise.reject()).catch(function(){ txt.select(); document.execCommand("copy"); })
        .then(function(){ b.textContent = "✓ Copiado"; setTimeout(function(){ b.textContent = "Copiar texto"; }, 1600); });
    });

    await fuentesListas();
    var img = await cargarImagen(p.imagen || (p.imagenes && p.imagenes[0]) || "");
    ["post", "story"].forEach(function(f){
      var cv = ov.querySelector('[data-c="' + f + '"]');
      dibujar(cv, p, img, f);
      ov.querySelector('[data-d="' + f + '"]').addEventListener("click", function(){
        try{ descargar(cv, "hausline-" + slug(p.codigo || p.nombre) + "-" + f + ".jpg"); }
        catch(err){ alert("No se pudo descargar la imagen (la foto no permite exportarse). Probá con otra foto del producto."); }
      });
    });
  }

  window.HLInstagram = { abrir: abrir };
})();
