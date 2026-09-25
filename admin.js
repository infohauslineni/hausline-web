// Panel de productos de HAUSLINE (antes inline en admin.html; separado para que la CSP
// pueda prohibir scripts inline).
// Foto rota en la lista: se quita el src (antes era un onerror inline, que la CSP bloquea).
document.addEventListener("error",function(e){ var t=e.target; if(t&&t.tagName==="IMG"&&t.closest&&t.closest(".tr")) t.removeAttribute("src"); },true);
(function(){
  "use strict";
  const SUPA_URL = "https://xgdijumnmaqfirmckugw.supabase.co";
  const SUPA_KEY = "sb_publishable_NwpQth6G3qhpvtnRan3Xfg_8EqPM4Pw";
  const BUCKET = "catalogo", MAX_LADO = 1600, CALIDAD = 0.8, PORPAG = 25;
  const CATEGORIAS = ["Hombre", "Dama", "Unisex", "Accesorios", "Decoración"];
  const SUBCATEGORIAS = { "Hombre":["Calzado","Ropa"], "Dama":["Calzado","Ropa"], "Unisex":["Calzado","Ropa"], "Accesorios":["Hombre","Dama"], "Decoración":[] };

  const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  // Segundo proyecto: la TIENDA/tracking (epslwaxjemlysqtubbfu), donde viven cupones y
  // promociones. Se entra con las MISMAS credenciales del admin (login dual).
  const TIENDA_URL = "https://epslwaxjemlysqtubbfu.supabase.co";
  const TIENDA_KEY = "sb_publishable_bASR2lpLTORx-1pWbwvgiQ_fsjAuX2r";
  const supaTienda = window.supabase.createClient(TIENDA_URL, TIENDA_KEY, { auth: { storageKey: "hausline-tienda-auth", persistSession: true, autoRefreshToken: true } });
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

  let fotos = [], baseProductos = [], remotos = [], itemsMerged = [];
  let filtroEstado = "todos", filtroCategoria = "todas", pagina = 1;
  const seleccion = new Set(); // códigos seleccionados para el descuento en lote
  let selbarWired = false;

  function aviso(el, texto, tipo){ el.textContent = texto; el.className = "aviso " + (tipo || ""); if(texto) el.scrollIntoView({ behavior:"smooth", block:"nearest" }); }
  function llenarSelect(sel, valores, vac){ sel.innerHTML = (vac ? '<option value="">—</option>' : "") + valores.map(v => `<option value="${v}">${v}</option>`).join(""); }
  function enOferta(d){ return d && Number(d.precioOferta) > 0 && d.promocionHasta && new Date(d.promocionHasta) > new Date(); }
  function precioTxt(d){
    if(d.cotizar || !(Number(d.precio) > 0)) return "A consultar";
    if(enOferta(d)) return `<span class="precio-tachado">$${d.precio}</span><b>$${d.precioOferta}</b>`;
    return `<b>$${d.precio || 0}</b>`;
  }

  let nombresVisibles = {};
  function nombreVisible(codigo, datos){ const r=nombresVisibles[String(codigo||"").trim()]; return (datos&&datos.nombreReal)||(r&&r.nombre)||(datos&&datos.nombre)||""; }
  // productos.js se carga como <script> normal (lo permite la CSP: script-src 'self') y se
  // leen sus globales productosBase / nombresReales. Antes se bajaba como texto y se
  // evaluaba con Function(), pero la CSP del panel (sin 'unsafe-eval') lo bloquea y el
  // catálogo base salía vacío: el Inicio mostraba solo los productos del panel, todos
  // como "nuevos". Se carga una sola vez por página (volver a declarar sus const fallaría).
  let basePromesa = null;
  function cargarBase(){
    if(!basePromesa) basePromesa = new Promise(res=>{
      const leer=()=>{ try{
        nombresVisibles = (typeof nombresReales!=="undefined" && nombresReales) || {};
        res(typeof productosBase!=="undefined" && Array.isArray(productosBase) ? productosBase : []);
      }catch(e){ console.warn("cargarBase:", e); res([]); } };
      const s=document.createElement("script"); s.src="productos.js?_="+Date.now();
      s.onload=leer; s.onerror=()=>{ console.warn("cargarBase: no se pudo cargar productos.js"); basePromesa=null; res([]); };
      document.head.appendChild(s);
    });
    return basePromesa;
  }
  function datosDeBase(p){
    const imagenes=(p.imagenes&&p.imagenes.length)?p.imagenes.filter(Boolean):(p.imagen?[p.imagen]:[]);
    return { codigo:p.codigo, nombre:nombreVisible(p.codigo,p)||p.codigo, marca:p.marca||"", categoria:p.categoria||"", subcategoria:p.subcategoria||"",
      precio:Number(p.precio||0), cotizar:p.cotizar===true, precioOferta:Number(p.precioOferta||0), promocionHasta:p.promocionHasta||"",
      descripcion:p.descripcionReal||p.descripcion||"", tallas:p.tallas||[], colores:p.colores||[], imagen:p.imagen||imagenes[0]||"", imagenes, imagenFit:p.imagenFit||"", posicionImagen:p.posicionImagen||"", escalaImagen:p.escalaImagen||null, destacadoNuevo:p.destacadoNuevo===true,
      // Etiquetas opcionales del producto base (para que al editar un producto que ya las trae
      // del código —ej. los Birkenstock con 100% OG— salgan pre-marcadas y no se pierdan al guardar).
      og100:p.og100===true, masVendido:p.masVendido===true, ultimasUnidades:p.ultimasUnidades===true, exclusivo:p.exclusivo===true, preventa:p.preventa===true, edicionLimitada:p.edicionLimitada===true, restock:p.restock===true, recomendado:p.recomendado===true };
  }

  // ============ Fotos ============
  function comprimir(file){ return new Promise((res,rej)=>{ const img=new Image(),l=new FileReader();
    l.onload=()=>{img.src=l.result;}; l.onerror=rej;
    img.onload=()=>{ let{width:w,height:h}=img; if(Math.max(w,h)>MAX_LADO){const f=MAX_LADO/Math.max(w,h);w=Math.round(w*f);h=Math.round(h*f);}
      const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
      c.toBlob(b=>b?res(b):rej(new Error("no")), "image/jpeg", CALIDAD); }; img.onerror=rej; l.readAsDataURL(file); }); }
  function pintarFotos(){
    const g=$("fotosGrid");
    g.innerHTML=fotos.map((f,i)=>`
      <div class="foto-item ${i===0?"principal":""} ${i===activePhoto?"activa":""}">
        <img src="${esc(f.url)}" alt="" data-ver="${i}" title="Ver esta foto en la vista previa">
        ${i===0 ? '<span class="etq-principal">Principal</span>' : `<button type="button" class="estrella" data-principal="${i}" title="Hacer principal">★</button>`}
        <button type="button" class="quitar" data-quitar="${i}">×</button>
        ${f.sinFondo ? "" : `<button type="button" class="cortar" data-fondo="${i}" title="Quitar fondo (dejar sobre el fondo del catálogo)">✂️ Fondo</button>`}
      </div>`).join("")+
      `<button type="button" class="foto-add" id="btnAddFoto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>Agregar</button>`;
    $("btnAddFoto").addEventListener("click",()=>$("fFotos").click());
    g.querySelectorAll("[data-quitar]").forEach(b=>b.addEventListener("click",()=>{ const i=+b.dataset.quitar; if(fotos[i]&&!fotos[i].remota)URL.revokeObjectURL(fotos[i].url); fotos.splice(i,1); pintarFotos(); }));
    // ★ = poner esa foto como principal (la mueve al primer lugar = vista previa)
    g.querySelectorAll("[data-principal]").forEach(b=>b.addEventListener("click",()=>{ const i=+b.dataset.principal; const m=fotos.splice(i,1)[0]; fotos.unshift(m); pintarFotos(); }));
    // ✂️ = quitar fondo (opcional, gratis, en el teléfono)
    g.querySelectorAll("[data-fondo]").forEach(b=>b.addEventListener("click",()=>quitarFondo(+b.dataset.fondo)));
    // Tocar una foto la muestra en la Vista previa (para ver TODAS las fotos y encuadrarlas).
    g.querySelectorAll("[data-ver]").forEach(im=>im.addEventListener("click",()=>{ activePhoto=+im.dataset.ver; pintarFotos(); const pf=$("preFrame"); if(pf) pf.scrollIntoView({block:"center",behavior:"smooth"}); }));
    updatePreview();
  }

  // ---------- Quitar fondo (gratis, en el navegador) ----------
  let _removedor = null;
  async function cargarRemovedor(){
    if(_removedor) return _removedor;
    const mod = await import("https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm");
    _removedor = mod.removeBackground || (mod.default && mod.default.removeBackground);
    if(!_removedor) throw new Error("librería no disponible");
    return _removedor;
  }
  async function quitarFondo(i){
    const foto = fotos[i]; if(!foto) return;
    $("fondoEstado").textContent = "Quitando fondo… la 1ª vez descarga el modelo y puede tardar hasta 1 min (más en celular). No cierres la página.";
    const btn = document.querySelector('[data-fondo="'+i+'"]'); if(btn){ btn.disabled=true; btn.textContent="⏳…"; }
    try{
      const quitar = await cargarRemovedor();
      const entrada = foto.remota ? foto.url : foto.blob;
      // Modelo liviano (quint8): descarga menos y corre más rápido en celular.
      const recorte = await quitar(entrada, { model:"isnet_quint8" });
      // Componer el recorte (transparente) sobre fondo BLANCO.
      const img = await new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error("imagen")); im.src=URL.createObjectURL(recorte); });
      const c=document.createElement("canvas"); c.width=img.naturalWidth; c.height=img.naturalHeight;
      // Fondo = el mismo gris clarito del catálogo (--foto-bg #f4f4f4), para que
      // el recorte calce sin que se note el borde contra el marco del producto.
      const ctx=c.getContext("2d"); ctx.fillStyle="#f4f4f4"; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0);
      URL.revokeObjectURL(img.src);
      const blob = await new Promise(r=>c.toBlob(r,"image/jpeg",0.92));
      if(!foto.remota) URL.revokeObjectURL(foto.url);
      fotos[i] = { blob, url:URL.createObjectURL(blob), sinFondo:true };
      $("fondoEstado").textContent = "✓ Fondo quitado. Si no quedó bien, borrá la foto y volvé a subir la original.";
      pintarFotos();
    }catch(err){
      $("fondoEstado").textContent = "";
      alert("No se pudo quitar el fondo (" + (err.message||err) + "). La foto queda como estaba.");
      if(btn){ btn.disabled=false; btn.textContent="✂️ Fondo"; }
    }
  }

  // ---------- Arrastrar y soltar fotos sobre la grilla ----------
  (function(){
    const g=$("fotosGrid");
    ["dragover","dragenter"].forEach(ev=>g.addEventListener(ev,e=>{ e.preventDefault(); g.classList.add("drag"); }));
    ["dragleave","dragend"].forEach(ev=>g.addEventListener(ev,e=>{ e.preventDefault(); g.classList.remove("drag"); }));
    g.addEventListener("drop",async e=>{ e.preventDefault(); g.classList.remove("drag");
      const files=Array.from(e.dataTransfer.files||[]).filter(f=>f.type.startsWith("image/"));
      for(const file of files){ try{ const b=await comprimir(file); fotos.push({blob:b,url:URL.createObjectURL(b)}); }catch(err){ console.warn(err); } }
      pintarFotos(); });
  })();

  // ---------- Vista previa interactiva (encuadre con el dedo) ----------
  let prePos = { x:50, y:50 }, preScale = 1, activePhoto = 0;
  function parsePos(str){
    const m = String(str||"").match(/([\d.]+)%\s+([\d.]+)%/);
    return m ? { x:Math.max(0,Math.min(100,+m[1])), y:Math.max(0,Math.min(100,+m[2])) } : { x:50, y:50 };
  }
  function updatePreview(){
    const img=$("preImg"), vacio=$("preVacio"), agua=$("preAgua");
    if(activePhoto>=fotos.length) activePhoto=0;
    const url = fotos[activePhoto] ? fotos[activePhoto].url : "";
    if(url){ img.src=url; img.style.display="block"; vacio.style.display="none"; agua.style.display="block"; }
    else{ img.removeAttribute("src"); img.style.display="none"; vacio.style.display="flex"; agua.style.display="none"; }
    img.classList.toggle("contain", $("fAjuste").value==="contain");
    img.style.objectPosition = prePos.x+"% "+prePos.y+"%";
    img.style.transform = "scale("+preScale+")";
    // Mantiene el slider "Subir/bajar" en sincronía con el arrastre.
    var sy=$("prePosY"); if(sy) sy.value=Math.round(prePos.y);
    $("preNombre").textContent = $("fNombre").value.trim() || "Nombre del producto";
    const cot=$("fCotizar").checked, precio=Number($("fPrecio").value||0);
    $("prePrecio").textContent = (cot || !(precio>0)) ? "Precio a consultar" : ("$"+precio);
  }
  (function(){
    const frame=$("preFrame"); let drag=false, lx=0, ly=0;
    frame.addEventListener("pointerdown", e=>{ if(!fotos[0]) return; drag=true; lx=e.clientX; ly=e.clientY; frame.classList.add("arrastrando"); try{ frame.setPointerCapture(e.pointerId); }catch(_){} });
    frame.addEventListener("pointermove", e=>{ if(!drag) return; const r=frame.getBoundingClientRect(); const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
      prePos.x=Math.max(0,Math.min(100, prePos.x - dx/r.width*100)); prePos.y=Math.max(0,Math.min(100, prePos.y - dy/r.height*100)); updatePreview(); });
    const fin=()=>{ drag=false; frame.classList.remove("arrastrando"); };
    frame.addEventListener("pointerup", fin); frame.addEventListener("pointercancel", fin); frame.addEventListener("pointerleave", fin);
  })();
  $("preZoom").addEventListener("input", ()=>{ preScale=Number($("preZoom").value); updatePreview(); });
  $("prePosY").addEventListener("input", ()=>{ prePos.y=Number($("prePosY").value); updatePreview(); });
  $("preReset").addEventListener("click", ()=>{ prePos={x:50,y:50}; preScale=1; $("preZoom").value=1; $("prePosY").value=50; updatePreview(); });
  ["fNombre","fPrecio"].forEach(id=>$(id).addEventListener("input", updatePreview));
  $("fCotizar").addEventListener("change", updatePreview);
  $("fEntregaInmediata").addEventListener("change", ()=>{ const v = $("fEntregaInmediata").checked ? "block" : "none"; $("rowTallasEI").style.display = v; $("rowColoresEI").style.display = v; });
  $("fAjuste").addEventListener("change", updatePreview);
  $("fFotos").addEventListener("change",async e=>{ const files=Array.from(e.target.files||[]); e.target.value="";
    for(const file of files){ try{ const b=await comprimir(file); fotos.push({blob:b,url:URL.createObjectURL(b)}); }catch(err){ console.warn(err); } } pintarFotos(); });
  $("fCategoria").addEventListener("change",()=>{ llenarSelect($("fSubcategoria"),SUBCATEGORIAS[$("fCategoria").value]||[],true); aplicarModoTallas(); tallasUIaCampo(); });

  // ---------- Tallas: calzado (34-47) o ropa (S,M,L,XL) según la subcategoría ----------
  const ROPA_TALLAS=["S","M","L","XL"];
  // Tipo de prenda: se pide solo cuando la subcategoría es Ropa.
  const TIPOS_ROPA=["Camisa","Camiseta","Short","Pantalón","Sudadera","Chaqueta","Conjunto","Vestido","Otro"];
  (function(){
    let h=""; for(let n=34;n<=47;n++) h+=`<label class="talla-chk"><input type="checkbox" value="${n}">${n}</label>`;
    $("tallasGrid").innerHTML=h;
    $("tallasRopa").innerHTML=ROPA_TALLAS.map(t=>`<label class="talla-chk"><input type="checkbox" value="${t}">${t}</label>`).join("");
    $("fTipoRopa").innerHTML='<option value="">—</option>'+TIPOS_ROPA.map(t=>`<option value="${t}">${t}</option>`).join("");
    document.querySelectorAll("#tallasGrid input, #tallasRopa input").forEach(c=>c.addEventListener("change", tallasUIaCampo));
  })();
  // Calzado / Ropa se decide por la SUBCATEGORÍA elegida.
  function modoTallas(){ const s=($("fSubcategoria").value||"").toLowerCase(); if(s.indexOf("calzado")>=0) return "calzado"; if(s.indexOf("ropa")>=0) return "ropa"; return "otro"; }
  // Muestra el bloque de tallas que corresponde y oculta el otro.
  function aplicarModoTallas(){ const m=modoTallas();
    $("bloqueCalzado").style.display = m==="calzado" ? "" : "none";
    $("bloqueRopa").style.display    = m==="ropa"    ? "" : "none";
    $("tallasHint").style.display    = m==="otro"    ? "" : "none";
    $("grpTipoRopa").style.display   = m==="ropa"    ? "" : "none";
    if(m!=="ropa") $("fTipoRopa").value="";
  }
  function tallasUIaCampo(){ const m=modoTallas(); let vals=[];
    if(m==="calzado") vals=[...document.querySelectorAll("#tallasGrid input:checked")].map(c=>c.value);
    else if(m==="ropa"){ const letras=[...document.querySelectorAll("#tallasRopa input:checked")].map(c=>c.value);
      const extra=($("fTallasOtras").value||"").split(",").map(s=>s.trim()).filter(Boolean); vals=[...letras, ...extra]; }
    $("fTallas").value=vals.join(", ");
  }
  function campoATallasUI(){
    const arr=($("fTallas").value||"").split(",").map(s=>s.trim()).filter(Boolean);
    const nums=new Set(arr.filter(v=>/^\d+$/.test(v)));
    document.querySelectorAll("#tallasGrid input").forEach(c=>c.checked=nums.has(c.value));
    const letras=arr.filter(v=>!/^\d+$/.test(v));
    const setRopa=new Set(letras.map(v=>v.toUpperCase()));
    document.querySelectorAll("#tallasRopa input").forEach(c=>c.checked=setRopa.has(c.value));
    // Letras fuera de S/M/L/XL (raras): se conservan ocultas para no perderlas al editar.
    $("fTallasOtras").value=letras.filter(v=>!ROPA_TALLAS.includes(v.toUpperCase())).join(", ");
  }
  $("fSubcategoria").addEventListener("change",()=>{ aplicarModoTallas(); tallasUIaCampo(); });

  // ---------- Colores (chips + "Agregar color") ----------
  let coloresArr=[];
  function pintarColores(){
    const c=$("coloresChips");
    c.innerHTML=coloresArr.map((v,i)=>`<span class="chip-color">${esc(v)}<button type="button" data-delcolor="${i}" aria-label="Quitar">×</button></span>`).join("");
    c.querySelectorAll("[data-delcolor]").forEach(b=>b.addEventListener("click",()=>{ coloresArr.splice(+b.dataset.delcolor,1); pintarColores(); }));
    $("fColores").value=coloresArr.join(", ");
  }
  function agregarColor(){
    const v=($("fColorNuevo").value||"").trim(); if(!v) return;
    if(!coloresArr.some(x=>x.toLowerCase()===v.toLowerCase())) coloresArr.push(v);
    $("fColorNuevo").value=""; pintarColores(); $("fColorNuevo").focus();
  }
  function campoAColoresUI(){ coloresArr=($("fColores").value||"").split(",").map(s=>s.trim()).filter(Boolean); pintarColores(); }
  $("btnAddColor").addEventListener("click", agregarColor);
  $("fColorNuevo").addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); agregarColor(); } });

  // ============ Guardar ============
  async function subirFotos(codigo){ const urls=[];
    for(let i=0;i<fotos.length;i++){ const f=fotos[i]; if(f.remota){ urls.push(f.remota); continue; }
      const ruta=`${codigo}/${Date.now()}-${i}.jpg`;
      const {error}=await supa.storage.from(BUCKET).upload(ruta,f.blob,{contentType:"image/jpeg",upsert:true}); if(error) throw error;
      urls.push(supa.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl); } return urls; }
  // Etiquetas opcionales del producto: [idDelCheckbox, propiedadEnDatos]. Deben coincidir con
  // ETIQUETAS_OPCIONALES de productos.js (el sitio lee esa propiedad y muestra el badge).
  const ETQ_ADMIN=[["fEtqOg100","og100"],["fEtqMasVendido","masVendido"],["fEtqUltimasUnidades","ultimasUnidades"],["fEtqExclusivo","exclusivo"],["fEtqPreventa","preventa"],["fEtqEdicionLimitada","edicionLimitada"],["fEtqRestock","restock"],["fEtqRecomendado","recomendado"]];
  $("btnGuardar").addEventListener("click",async()=>{
    const codigo=$("fCodigo").value.trim().toUpperCase(), nombre=$("fNombre").value.trim(), categoria=$("fCategoria").value;
    if(!codigo||!nombre||!categoria){ aviso($("avisoForm"),"Completá código, nombre y categoría.","err"); return; }
    const btn=$("btnGuardar"); btn.disabled=true; const t=btn.innerHTML; btn.innerHTML='<span class="spin"></span> Guardando…'; aviso($("avisoForm"),"","");
    if(!(await asegurarSesion())){ btn.disabled=false; btn.innerHTML=t; return; }
    try{ const urls=await subirFotos(codigo); const cotizar=$("fCotizar").checked; const oferta=Number($("fOferta").value||0);
      const ofertaHasta=$("fOfertaHasta").value?($("fOfertaHasta").value+"T23:59:59"):"";
      // nombreReal: lo que se escribe acá es lo que ve el cliente (tiene prioridad sobre
      // el mapa nombresReales de productos.js en la web).
      const datos={ codigo, nombre, nombreReal:nombre, marca:$("fMarca").value.trim(), categoria, subcategoria:$("fSubcategoria").value,
        tipoPrenda:(modoTallas()==="ropa"?($("fTipoRopa").value||""):""),
        precio:cotizar?0:Number($("fPrecio").value||0), cotizar, precioOferta:oferta>0?oferta:0, promocionHasta:oferta>0?ofertaHasta:"",
        descripcion:$("fDescripcion").value.trim(), tallas:$("fTallas").value.split(",").map(s=>s.trim()).filter(Boolean),
        colores:$("fColores").value.split(",").map(s=>s.trim()).filter(Boolean),
        imagen:urls[0]||"", imagenes:urls, imagenFit:$("fAjuste").value==="contain"?"contain":"",
        posicionImagen:(prePos.x!==50||prePos.y!==50)?(prePos.x+"% "+prePos.y+"%"):"",
        escalaImagen:preScale>1?Number(preScale.toFixed(2)):null,
        destacadoNuevo:$("fNuevo").checked, entregaInmediata:$("fEntregaInmediata").checked, tallasEntregaInmediata:$("fTallasEntregaInmediata").value.split(",").map(s=>s.trim()).filter(Boolean), coloresEntregaInmediata:$("fColoresEntregaInmediata").value.split(",").map(s=>s.trim()).filter(Boolean), fecha:new Date().toISOString().slice(0,10) };
      // Etiquetas opcionales elegidas en el formulario.
      ETQ_ADMIN.forEach(([id,prop])=>{ datos[prop]=$(id).checked; });
      const {error}=await supa.from("catalogo_web").upsert({codigo,activo:$("fActivo").checked,datos},{onConflict:"codigo"}); if(error) throw error;

      // El tracking es OTRO proyecto Supabase (el panel no tiene acceso a escribirle).
      // Se sincroniza SOLO desde el servidor del tracking, que lee este catálogo_web
      // (una vez al día por cron y cada vez que se abre la app del tracking). Por eso
      // acá basta con guardar en catalogo_web; no hay que —ni se puede— empujar nada.
      aviso($("avisoForm"), "✓ Guardado. Ya se ve en la web. El tracking lo toma solo.", "ok");
      limpiarForm(); await cargarRemotos(); irA("lista");
    }catch(err){ aviso($("avisoForm"),"Error al guardar: "+(err.message||err),"err"); }
    finally{ btn.disabled=false; btn.innerHTML=t; }
  });
  function limpiarForm(){ $("tituloForm").textContent="Subir producto nuevo";
    ["fCodigo","fNombre","fMarca","fPrecio","fTallas","fTallasOtras","fColores","fColorNuevo","fDescripcion","fOferta","fOfertaHasta"].forEach(id=>$(id).value="");
    document.querySelectorAll("#tallasGrid input, #tallasRopa input").forEach(c=>c.checked=false);
    $("fTipoRopa").value="";
    $("fCategoria").selectedIndex=0; $("fCategoria").dispatchEvent(new Event("change"));
    $("fCotizar").checked=false; $("fNuevo").checked=true; $("fActivo").checked=true; $("fEntregaInmediata").checked=false; $("fTallasEntregaInmediata").value=""; $("rowTallasEI").style.display="none"; $("fColoresEntregaInmediata").value=""; $("rowColoresEI").style.display="none"; $("fAjuste").value="cover";
    ETQ_ADMIN.forEach(([id])=>{ const el=$(id); if(el) el.checked=false; });
    prePos={x:50,y:50}; preScale=1; $("preZoom").value=1; $("prePosY").value=50; activePhoto=0;
    fotos.forEach(f=>{ if(!f.remota) URL.revokeObjectURL(f.url); }); fotos=[]; pintarFotos();
    campoATallasUI(); campoAColoresUI(); }
  $("btnLimpiar").addEventListener("click",()=>{ limpiarForm(); aviso($("avisoForm"),"",""); });
  $("btnCancelar").addEventListener("click",()=>{ limpiarForm(); aviso($("avisoForm"),"",""); irA("inicio"); });
  function cargarEnForm(datos,opts){ opts=opts||{};
    $("tituloForm").textContent="Editar: "+(datos.nombre||datos.codigo);
    $("fCodigo").value=datos.codigo||""; $("fNombre").value=datos.nombre||""; $("fMarca").value=datos.marca||"";
    $("fCategoria").value=datos.categoria||CATEGORIAS[0]; $("fCategoria").dispatchEvent(new Event("change"));
    $("fSubcategoria").value=datos.subcategoria||""; $("fTipoRopa").value=datos.tipoPrenda||""; $("fPrecio").value=datos.precio||""; $("fCotizar").checked=!!datos.cotizar;
    $("fOferta").value=datos.precioOferta||""; $("fOfertaHasta").value=(datos.promocionHasta||"").slice(0,10);
    $("fTallas").value=(datos.tallas||[]).join(", "); $("fColores").value=(datos.colores||[]).join(", "); $("fDescripcion").value=datos.descripcion||"";
    campoATallasUI(); aplicarModoTallas(); campoAColoresUI();
    $("fAjuste").value=datos.imagenFit==="contain"?"contain":"cover";
    prePos=parsePos(datos.posicionImagen); preScale=Number(datos.escalaImagen)||1; $("preZoom").value=preScale; $("prePosY").value=Math.round(prePos.y); activePhoto=0;
    $("fNuevo").checked=datos.destacadoNuevo!==false; $("fActivo").checked=opts.activo!==false; $("fEntregaInmediata").checked=datos.entregaInmediata===true; $("fTallasEntregaInmediata").value=(datos.tallasEntregaInmediata||[]).join(", "); $("rowTallasEI").style.display=datos.entregaInmediata===true?"block":"none"; $("fColoresEntregaInmediata").value=(datos.coloresEntregaInmediata||[]).join(", "); $("rowColoresEI").style.display=datos.entregaInmediata===true?"block":"none";
    ETQ_ADMIN.forEach(([id,prop])=>{ $(id).checked=datos[prop]===true; });
    fotos=(datos.imagenes||[]).filter(Boolean).map(u=>({remota:u,url:u})); pintarFotos(); irA("form"); window.scrollTo({top:0,behavior:"smooth"}); }

  // ============ Datos ============
  async function cargarRemotos(){
    // Renová el token ANTES de leer. Si venció (típico si el panel estuvo abierto un
    // rato o el reloj de la PC está atrasado), Supabase rechaza la lectura con 401 y el
    // panel mostraría tus productos como si no existieran. Best-effort: si no hay sesión,
    // seguimos igual (como anónimo se leen los productos activos).
    try{ await supa.auth.refreshSession(); }catch(_){}
    const {data,error}=await supa.from("catalogo_web").select("id, codigo, activo, datos, created_at").order("created_at",{ascending:false});
    if(error){
      // NO borres lo que ya había en pantalla por un error puntual de sesión/red: avisá
      // y conservá el estado previo. Así no “desaparecen” los productos ya cargados.
      console.warn("cargarRemotos:", error.message||error);
      aviso($("avisoSync"), "No se pudieron cargar tus productos del panel (sesión o conexión). Reintentá o volvé a iniciar sesión.", "err");
      return;
    }
    remotos=data||[]; construirLista();
  }
  // Copia de los datos del panel con el nombre que ve el cliente (sin tocar la fila original).
  function conNombreVisible(codigo, datos){ if(!datos) return null; const n=nombreVisible(codigo,datos); return n&&n!==datos.nombre?{...datos,nombre:n}:datos; }
  function construirLista(){
    const map=new Map(); remotos.forEach(r=>map.set(String(r.codigo).toUpperCase(),r));
    const items=[],usados=new Set();
    baseProductos.forEach(p=>{ const c=String(p.codigo||"").toUpperCase(); if(!c) return; usados.add(c); const r=map.get(c);
      if(r) items.push({codigo:p.codigo,datos:conNombreVisible(r.codigo,r.datos)||datosDeBase(p),origen:"editado",remoteId:r.id,activo:r.activo});
      else items.push({codigo:p.codigo,datos:datosDeBase(p),origen:"original",remoteId:null,activo:true}); });
    remotos.forEach(r=>{ const c=String(r.codigo||"").toUpperCase(); if(usados.has(c)) return;
      items.push({codigo:r.codigo,datos:conNombreVisible(r.codigo,r.datos)||{},origen:"nuevo",remoteId:r.id,activo:r.activo}); });
    itemsMerged=items; renderInicio(); renderChips(); renderTabla(); poblarMarcas();
  }
  // Autocompletado de marcas: junta las marcas ya usadas (catálogo base + panel) para que
  // al subir un producto elijas la marca EXACTA y no la reescribas mal (mayúsculas/erratas),
  // que es lo que hace que un producto no aparezca al filtrar por su marca en la tienda.
  function poblarMarcas(){
    const dl=$("marcasList"); if(!dl) return;
    // Agrupa duplicados ignorando mayúsculas, espacios y símbolos (así "DOLCE & GABANNA"
    // y "DOLCE&GABANNA" quedan como uno). De cada grupo muestra la forma MEJOR escrita
    // (con minúsculas: "Balenciaga" > "BALENCIAGA"). Las erratas verdaderas (otra letra)
    // no se pueden juntar solas; esas se corrigen en el producto.
    const clave=s=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
    const puntaje=s=>/[a-z]/.test(s)?1:0;
    const mejor=new Map();
    itemsMerged.forEach(it=>{ const m=String((it.datos||{}).marca||"").trim(); if(!m) return; const k=clave(m); if(!k) return; const prev=mejor.get(k); if(!prev||puntaje(m)>puntaje(prev)) mejor.set(k,m); });
    dl.innerHTML=[...mejor.values()].sort((a,b)=>a.localeCompare(b)).map(m=>`<option value="${esc(m)}"></option>`).join("");
  }
  function filtrar(){
    const q=($("buscador").value||"").trim().toLowerCase();
    const peso={nuevo:0,editado:1,original:2};
    return itemsMerged.filter(i=>{ const d=i.datos||{};
      if(filtroCategoria!=="todas"&&d.categoria!==filtroCategoria) return false;
      if(filtroEstado==="nuevos"&&i.origen!=="nuevo") return false;
      if(filtroEstado==="editados"&&i.origen!=="editado") return false;
      if(filtroEstado==="oferta"&&!enOferta(d)) return false;
      if(q&&![i.codigo,d.nombre,d.marca,d.categoria].some(v=>String(v||"").toLowerCase().includes(q))) return false;
      return true;
    }).sort((a,b)=>peso[a.origen]-peso[b.origen]);
  }

  // ============ Dashboard de inicio ============
  function renderInicio(){
    const total=itemsMerged.length;
    const nuevos=itemsMerged.filter(i=>i.origen==="nuevo").length;
    const editados=itemsMerged.filter(i=>i.origen==="editado").length;
    const ofertas=itemsMerged.filter(i=>enOferta(i.datos)).length;
    const cards=[
      ["todos", total, "Productos", ""],
      ["nuevos", nuevos, "Nuevos", "acc-verde"],
      ["editados", editados, "Editados", "acc-azul"],
      ["oferta", ofertas, "En oferta", "acc-rojo"]
    ];
    $("statsGrid").innerHTML=cards.map(([f,n,l,cl])=>`<button class="stat-card ${cl}" data-goto="${f}"><span class="num">${n}</span><span class="lbl">${l}</span></button>`).join("");
    $("statsGrid").querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>{ filtroEstado=b.dataset.goto; filtroCategoria="todas"; pagina=1; renderChips(); renderTabla(); irA("lista"); }));
    // Gráfico: productos por categoría
    const counts=CATEGORIAS.map(c=>({c, n:itemsMerged.filter(i=>((i.datos||{}).categoria||"")===c).length}));
    const max=Math.max(1, ...counts.map(x=>x.n));
    const chart=$("chartCategorias");
    if(chart){ chart.innerHTML=counts.map(x=>`<div class="chart-row"><span>${x.c}</span><div class="chart-bar"><i style="width:${Math.round(x.n/max*100)}%"></i></div><span class="val">${x.n}</span></div>`).join("");
      chart.querySelectorAll(".chart-row span:first-child").forEach((s,idx)=>{ s.style.cursor="pointer"; s.addEventListener("click",()=>{ filtroCategoria=counts[idx].c; filtroEstado="todos"; pagina=1; renderChips(); renderTabla(); irA("lista"); }); }); }
    // Últimos agregados por el panel (los nuevos, hasta 5)
    const recientes=itemsMerged.filter(i=>i.origen==="nuevo").slice(0,5);
    $("recientes").innerHTML = recientes.length ? recientes.map(i=>filaHTML(i)).join("") : '<div class="cargando">Todavía no cargaste productos por el panel.</div>';
    activarAcciones($("recientes"), recientes);
  }

  // ============ Chips + Tabla ============
  function renderChips(){
    const nuevos=itemsMerged.filter(i=>i.origen==="nuevo").length, editados=itemsMerged.filter(i=>i.origen==="editado").length, ofertas=itemsMerged.filter(i=>enOferta(i.datos)).length;
    const estados=[["todos","Todos"],["nuevos","Nuevos ("+nuevos+")"],["editados","Editados ("+editados+")"],["oferta","En oferta ("+ofertas+")"]];
    $("chipsEstado").innerHTML=estados.map(([v,t])=>`<button class="chip ${filtroEstado===v?"activa":""}" data-estado="${v}">${t}</button>`).join("");
    const cats=[["todas","Todas"]].concat(CATEGORIAS.map(c=>[c,c]));
    $("chipsCategoria").innerHTML=cats.map(([v,t])=>`<button class="chip ${filtroCategoria===v?"activa":""}" data-cat="${v}">${t}</button>`).join("");
    $("chipsEstado").querySelectorAll("[data-estado]").forEach(b=>b.addEventListener("click",()=>{ filtroEstado=b.dataset.estado; pagina=1; renderChips(); renderTabla(); }));
    $("chipsCategoria").querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>{ filtroCategoria=b.dataset.cat; pagina=1; renderChips(); renderTabla(); }));
  }
  function filaHTML(i, sel){
    const d=i.datos||{}; const oferta=enOferta(d);
    const chk=sel?`<label class="chk"><input type="checkbox" class="rowchk" data-cod="${esc(i.codigo)}" ${seleccion.has(i.codigo)?"checked":""}></label>`:"";
    const pill=i.origen==="nuevo"?'<span class="pill nuevo">Nuevo</span>':i.origen==="editado"?'<span class="pill editado">Editado</span>':'<span class="pill original">Original</span>';
    const bOf=oferta?'<span class="pill oferta">Oferta</span>':"";
    const bOc=i.remoteId&&!i.activo?'<span class="pill oculto">Oculto</span>':"";
    const pausaBtn=i.remoteId?`<button class="icon-btn" data-pausa title="${i.activo?"Ocultar":"Mostrar"}">${i.activo?"⏸":"▶"}</button>`:"";
    const acc=`${pausaBtn}<button class="icon-btn" data-borrar title="Eliminar del catalogo">🗑</button>`;
    return `<div class="tr" data-cod="${esc(i.codigo)}">
      <div class="c-prod">
        ${chk}<img ${d.imagen?`src="${esc(d.imagen)}"`:""} alt="" loading="lazy">
        <div class="info"><b>${esc(d.nombre||i.codigo)}</b>
          <span>${esc(i.codigo)}<span class="movil-meta"> · ${precioTxt(d).replace(/<[^>]+>/g,"")} · ${esc(d.categoria||"")}</span></span></div>
      </div>
      <div class="c-cat">${esc(d.categoria||"")}</div>
      <div class="c-precio">${precioTxt(d)}</div>
      <div class="c-estado">${bOc}${bOf}${pill}</div>
      <div class="c-acc"><span class="badges-movil">${bOc}${bOf}${pill}</span><button class="icon-btn" data-editar>✎</button>${acc}</div>
    </div>`;
  }
  function activarAcciones(cont, lista){
    cont.querySelectorAll(".tr").forEach((row,idx)=>{
      const it=lista[idx]; if(!it) return;
      const e=row.querySelector("[data-editar]"); if(e) e.addEventListener("click",()=>cargarEnForm(it.datos,{activo:it.activo}));
      const p=row.querySelector("[data-pausa]"); if(p) p.addEventListener("click",async()=>{ await supa.from("catalogo_web").update({activo:!it.activo}).eq("id",it.remoteId); cargarRemotos(); });
      const b=row.querySelector("[data-borrar]"); if(b) b.addEventListener("click",async()=>{
        if(!(await asegurarSesion())) return;
        if(it.origen==="nuevo"){
          if(!confirm(`¿Borrar ${it.codigo}? Se quita del catálogo definitivamente.`)) return;
          const {error}=await supa.from("catalogo_web").delete().eq("id",it.remoteId);
          if(error){ alert("No se pudo borrar: "+error.message); return; }
        } else {
          // Original o editado: existe en el catálogo base, no se puede borrar el
          // archivo estático; se OCULTA con un override inactivo. Se vuelve a mostrar con ▶.
          if(!confirm(`¿Quitar ${it.codigo} del catálogo? Dejará de mostrarse en la tienda (podés volver a mostrarlo).`)) return;
          const {error}=await supa.from("catalogo_web").upsert({codigo:it.codigo,activo:false,datos:it.datos},{onConflict:"codigo"});
          if(error){ alert("No se pudo ocultar: "+error.message); return; }
        }
        cargarRemotos();
      });
    });
  }
  function renderTabla(){
    const lista=filtrar(); const paginas=Math.max(1,Math.ceil(lista.length/PORPAG));
    if(pagina>paginas) pagina=paginas;
    const desde=(pagina-1)*PORPAG; const pageItems=lista.slice(desde,desde+PORPAG);
    const cont=$("filas");
    cont.innerHTML = pageItems.length ? pageItems.map(i=>filaHTML(i,true)).join("") : '<div class="cargando">Sin resultados.</div>';
    activarAcciones(cont, pageItems);
    // Selección múltiple: enganchar checkboxes de cada fila.
    cont.querySelectorAll(".rowchk").forEach(chk=>chk.addEventListener("change",()=>{ const c=chk.dataset.cod; if(chk.checked) seleccion.add(c); else seleccion.delete(c); refrescarSel(); }));
    wireSelbar(); refrescarSel();
    $("paginacion").innerHTML = lista.length ?
      `<button id="pgPrev" ${pagina<=1?"disabled":""}>‹ Anterior</button>
       <span>Página ${pagina} de ${paginas} · ${lista.length} productos</span>
       <button id="pgNext" ${pagina>=paginas?"disabled":""}>Siguiente ›</button>` : "";
    const prev=$("pgPrev"), next=$("pgNext");
    if(prev) prev.addEventListener("click",()=>{ if(pagina>1){ pagina--; renderTabla(); window.scrollTo({top:0}); } });
    if(next) next.addEventListener("click",()=>{ if(pagina<paginas){ pagina++; renderTabla(); window.scrollTo({top:0}); } });
  }
  let bt=null; $("buscador").addEventListener("input",()=>{ clearTimeout(bt); bt=setTimeout(()=>{ pagina=1; renderTabla(); },180); });

  // ============ Descuento en lote ============
  function refrescarSel(){
    const n=seleccion.size;
    const bc=$("bulkControls"); if(bc) bc.classList.toggle("hidden", n===0);
    const sc=$("selCount"); if(sc) sc.textContent = n+" seleccionado"+(n===1?"":"s");
    const st=$("selTodos"); if(st){ const filt=filtrar();
      st.checked = filt.length>0 && filt.every(i=>seleccion.has(i.codigo));
      st.indeterminate = !st.checked && filt.some(i=>seleccion.has(i.codigo));
    }
  }
  function wireSelbar(){
    if(selbarWired) return; selbarWired=true;
    $("selTodos").addEventListener("change",e=>{ const filt=filtrar(); filt.forEach(i=>{ if(e.target.checked) seleccion.add(i.codigo); else seleccion.delete(i.codigo); }); renderTabla(); });
    $("bulkLimpiar").addEventListener("click",()=>{ seleccion.clear(); $("bulkAviso").textContent=""; renderTabla(); });
    $("bulkAplicar").addEventListener("click",aplicarDescuentoLote);
    $("bulkQuitar").addEventListener("click",quitarOfertaLote);
  }
  async function aplicarDescuentoLote(){
    const av=$("bulkAviso");
    if(!(await asegurarSesion())) return;
    const pct=Number($("bulkPct").value||0);
    const hastaRaw=$("bulkHasta").value;
    if(!(pct>0&&pct<95)){ aviso(av,"Poné un % de descuento entre 1 y 94.","err"); return; }
    if(!hastaRaw){ aviso(av,"Elegí la fecha 'hasta' de la oferta.","err"); return; }
    const hasta=hastaRaw+"T23:59:59";
    let saltados=0; const rows=[];
    itemsMerged.filter(i=>seleccion.has(i.codigo)).forEach(it=>{ const d=it.datos||{}; const precio=Number(d.precio||0);
      if(d.cotizar===true||!(precio>0)){ saltados++; return; }
      const off=Math.max(1, Math.round(precio*(1-pct/100)));
      rows.push({ codigo:it.codigo, activo:it.activo!==false, datos:{...d, precioOferta:off, promocionHasta:hasta} });
    });
    if(!rows.length){ aviso(av,"Ninguno de los seleccionados tiene precio para descontar (los 'a consultar' se omiten).","err"); return; }
    const btn=$("bulkAplicar"); btn.disabled=true;
    const {error}=await supa.from("catalogo_web").upsert(rows,{onConflict:"codigo"});
    btn.disabled=false;
    if(error){ aviso(av,"No se pudo aplicar: "+error.message,"err"); return; }
    seleccion.clear();
    aviso(av,`Descuento del ${pct}% aplicado a ${rows.length} producto(s)${saltados?` · ${saltados} omitido(s) sin precio`:""}.`,"ok");
    cargarRemotos();
  }
  async function quitarOfertaLote(){
    const av=$("bulkAviso");
    if(!(await asegurarSesion())) return;
    const rows=itemsMerged.filter(i=>seleccion.has(i.codigo)&&enOferta(i.datos))
      .map(it=>({ codigo:it.codigo, activo:it.activo!==false, datos:{...(it.datos||{}), precioOferta:0, promocionHasta:""} }));
    if(!rows.length){ aviso(av,"Ninguno de los seleccionados está en oferta.","err"); return; }
    const btn=$("bulkQuitar"); btn.disabled=true;
    const {error}=await supa.from("catalogo_web").upsert(rows,{onConflict:"codigo"});
    btn.disabled=false;
    if(error){ aviso(av,"No se pudo quitar: "+error.message,"err"); return; }
    seleccion.clear();
    aviso(av,`Oferta quitada a ${rows.length} producto(s).`,"ok");
    cargarRemotos();
  }

  // ============ Navegación ============
  function irA(tab){
    const vis={ inicio:"viewInicio", lista:"viewLista", form:"viewForm", banners:"viewBanners", cupones:"viewCupones", promos:"viewPromos" };
    Object.values(vis).forEach(v=>$(v).classList.add("hidden"));
    $(vis[tab]).classList.remove("hidden");
    $("tabInicio").classList.toggle("activa",tab==="inicio");
    $("tabLista").classList.toggle("activa",tab==="lista");
    $("tabForm").classList.toggle("activa",tab==="form");
    $("tabBanners").classList.toggle("activa",tab==="banners");
    $("tabCupones").classList.toggle("activa",tab==="cupones");
    $("tabPromos").classList.toggle("activa",tab==="promos");
    if(tab==="banners") cargarBanners();
    if(tab==="cupones") cargarCupones();
    if(tab==="promos") cargarPromos();
    window.scrollTo({top:0,behavior:"instant" in window?"instant":"auto"});
  }
  $("tabInicio").addEventListener("click",()=>irA("inicio"));
  $("tabLista").addEventListener("click",()=>irA("lista"));
  $("tabForm").addEventListener("click",()=>{ limpiarForm(); aviso($("avisoForm"),"",""); irA("form"); });
  $("tabBanners").addEventListener("click",()=>irA("banners"));
  $("tabCupones").addEventListener("click",()=>irA("cupones"));
  $("tabPromos").addEventListener("click",()=>irA("promos"));
  $("btnNuevoInicio").addEventListener("click",()=>{ limpiarForm(); aviso($("avisoForm"),"",""); irA("form"); });

  // Comprueba el catálogo y recuerda cómo llega al tracking. El tracking es OTRO
  // proyecto Supabase: el panel NO le escribe. Se sincroniza solo desde el servidor
  // del tracking (lee este catalogo_web una vez al día por cron y al abrir su app).
  // Así que este botón solo refresca la lista y confirma el estado; no empuja nada.
  $("btnSyncTracking").addEventListener("click", async () => {
    const btn=$("btnSyncTracking"); btn.disabled=true; const t=btn.innerHTML; btn.innerHTML='<span class="spin"></span> Actualizando…';
    try{
      await cargarRemotos();
      const n = remotos.length;
      aviso($("avisoSync"), n
        ? "Tenés "+n+" producto(s) en el catálogo. El tracking los sincroniza solo: una vez al día y cada vez que se abre la app del tracking. No hace falta empujarlos a mano."
        : "No hay productos del panel todavía.", "ok");
    }catch(err){ aviso($("avisoSync"), "No se pudo actualizar: "+(err.message||err), "err"); }
    finally{ btn.disabled=false; btn.innerHTML=t; }
  });

  // ============ Banners (aviso emergente de la tienda) ============
  let bnrBlob=null;
  // datetime-local (hora local de Nicaragua) <-> ISO con zona (lo que guarda timestamptz).
  function dtLocalToIso(v){ if(!v) return null; const d=new Date(v); return isNaN(d)?null:d.toISOString(); }
  function isoToDtLocal(iso){ if(!iso) return ""; const d=new Date(iso); if(isNaN(d)) return ""; const p=n=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes()); }
  function fmtFecha(iso){ if(!iso) return ""; const d=new Date(iso); if(isNaN(d)) return ""; return d.toLocaleString("es-NI",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); }
  // Estado de un banner según fechas: oculto / programado (aún no) / finalizado / activo.
  function estadoBanner(b){
    if(!b.activo) return {txt:"OCULTO",color:"#e5484d"};
    const ahora=Date.now();
    if(b.inicia_at && new Date(b.inicia_at).getTime()>ahora) return {txt:"PROGRAMADO",color:"#c08a00"};
    if(b.finaliza_at && new Date(b.finaliza_at).getTime()<ahora) return {txt:"FINALIZADO",color:"#e5484d"};
    return {txt:"ACTIVO",color:"#3aa76d"};
  }
  $("bnrFile").addEventListener("change", async e=>{
    const file=(e.target.files||[])[0]; e.target.value="";
    if(!file){ bnrBlob=null; $("bnrPrev").innerHTML=""; return; }
    try{ bnrBlob=await comprimir(file); $("bnrPrev").innerHTML='<img src="'+URL.createObjectURL(bnrBlob)+'" style="max-width:180px;border-radius:12px;">'; }
    catch(err){ aviso($("bnrAviso"),"No se pudo procesar la imagen.","err"); }
  });
  $("bnrAdd").addEventListener("click", async ()=>{
    if(!bnrBlob){ aviso($("bnrAviso"),"Elegí una imagen primero.","err"); return; }
    const btn=$("bnrAdd"); btn.disabled=true; const t=btn.innerHTML; btn.innerHTML='<span class="spin"></span> Subiendo…'; aviso($("bnrAviso"),"","");
    if(!(await asegurarSesion())){ btn.disabled=false; btn.innerHTML=t; return; }
    try{
      const ruta="banners/"+Date.now()+".jpg";
      const {error:upErr}=await supa.storage.from(BUCKET).upload(ruta,bnrBlob,{contentType:"image/jpeg",upsert:true}); if(upErr) throw upErr;
      const url=supa.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
      const base={ imagen_url:url, enlace:($("bnrEnlace").value||"").trim()||null, titulo:($("bnrTitulo").value||"").trim()||null };
      const inicia=dtLocalToIso($("bnrDesde").value), finaliza=dtLocalToIso($("bnrHasta").value);
      let {error}=await supa.from("banners").insert({ ...base, inicia_at:inicia, finaliza_at:finaliza });
      let sinColumnas=false;
      // Si aún no se aplicó la migración 202609210002 (faltan las columnas de fecha), guardamos sin fechas.
      if(error && /inicia_at|finaliza_at|column/i.test(error.message||"")){
        const r=await supa.from("banners").insert(base); error=r.error; sinColumnas=true;
      }
      if(error) throw error;
      bnrBlob=null; $("bnrPrev").innerHTML=""; $("bnrEnlace").value=""; $("bnrTitulo").value=""; $("bnrDesde").value=""; $("bnrHasta").value="";
      if(sinColumnas && (inicia||finaliza)) aviso($("bnrAviso"),"⚠ Banner creado, pero la PROGRAMACIÓN por fechas necesita aplicar la migración 202609210002 en Supabase (proyecto catálogo).","err");
      else aviso($("bnrAviso"),"✓ Banner agregado. Ya sale en la tienda.","ok");
      cargarBanners();
    }catch(err){ aviso($("bnrAviso"),"Error: "+(err.message||err),"err"); }
    finally{ btn.disabled=false; btn.innerHTML=t; }
  });
  async function cargarBanners(){
    const cont=$("bnrLista"); cont.innerHTML='<div class="cargando">Cargando…</div>';
    let {data,error}=await supa.from("banners").select("id,imagen_url,enlace,titulo,activo,inicia_at,finaliza_at").order("orden",{ascending:true}).order("created_at",{ascending:false});
    // Respaldo si aún no existen las columnas de fecha (migración 202609210002 sin aplicar).
    if(error && /inicia_at|finaliza_at|column/i.test(error.message||"")){
      const r=await supa.from("banners").select("id,imagen_url,enlace,titulo,activo").order("orden",{ascending:true}).order("created_at",{ascending:false});
      data=r.data; error=r.error;
    }
    if(error){ cont.innerHTML='<div class="cargando" style="color:#e5484d;">No se pudieron cargar los banners.</div>'; return; }
    if(!data||!data.length){ cont.innerHTML='<div class="cargando">Sin banners todavía. Subí uno arriba 👆</div>'; return; }
    cont.innerHTML=data.map(b=>{
      const st=estadoBanner(b);
      const ventana = (b.inicia_at||b.finaliza_at)
        ? '📅 '+(b.inicia_at?("Desde "+fmtFecha(b.inicia_at)):"Ya")+' · '+(b.finaliza_at?("hasta "+fmtFecha(b.finaliza_at)):"sin fin")
        : 'Sin programar (sale siempre)';
      return '<div style="padding:12px 0;border-bottom:1px solid var(--linea);">'
      + '<div style="display:flex;gap:12px;align-items:center;">'
      +   '<img src="'+esc(b.imagen_url)+'" style="width:52px;height:66px;object-fit:cover;border-radius:8px;flex:none;background:#eee;">'
      +   '<div style="flex:1;min-width:0;">'
      +     '<span style="font-size:10px;color:'+st.color+';font-weight:700;">'+st.txt+' · </span><b style="font-size:13px;">'+esc(b.titulo||"Banner")+'</b>'
      +     '<div style="font-size:11px;color:var(--texto2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(b.enlace||"(sin link)")+'</div>'
      +     '<div style="font-size:11px;color:var(--texto2);margin-top:2px;">'+esc(ventana)+'</div>'
      +   '</div>'
      +   '<button class="btn btn-sec" data-bnr-toggle="'+b.id+'" style="width:auto;flex:0 0 auto;white-space:nowrap;padding:8px 14px;font-size:12px;">'+(b.activo?"Ocultar":"Mostrar")+'</button>'
      +   '<button class="btn btn-sec" data-bnr-del="'+b.id+'" style="width:auto;flex:0 0 auto;white-space:nowrap;padding:8px 14px;font-size:12px;color:#e5484d;">Borrar</button>'
      + '</div>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:8px;padding-left:64px;">'
      +   '<div><label style="display:block;font-size:10px;color:var(--texto2);margin-bottom:3px;">Desde</label><input type="datetime-local" data-bnr-desde="'+b.id+'" value="'+isoToDtLocal(b.inicia_at)+'" style="width:auto;font-size:12px;padding:5px 8px;"></div>'
      +   '<div><label style="display:block;font-size:10px;color:var(--texto2);margin-bottom:3px;">Hasta</label><input type="datetime-local" data-bnr-hasta="'+b.id+'" value="'+isoToDtLocal(b.finaliza_at)+'" style="width:auto;font-size:12px;padding:5px 8px;"></div>'
      +   '<button class="btn btn-sec" data-bnr-fechas="'+b.id+'" style="width:auto;flex:0 0 auto;white-space:nowrap;padding:8px 14px;font-size:12px;">Guardar fechas</button>'
      + '</div>'
      + '</div>';
    }).join("");
    cont.querySelectorAll("[data-bnr-toggle]").forEach(btn=>btn.addEventListener("click",async()=>{
      const id=btn.dataset.bnrToggle, b=data.find(x=>x.id===id);
      await supa.from("banners").update({activo:!b.activo}).eq("id",id); cargarBanners();
    }));
    cont.querySelectorAll("[data-bnr-fechas]").forEach(btn=>btn.addEventListener("click",async()=>{
      const id=btn.dataset.bnrFechas;
      const desde=cont.querySelector('[data-bnr-desde="'+id+'"]').value;
      const hasta=cont.querySelector('[data-bnr-hasta="'+id+'"]').value;
      const t=btn.textContent; btn.disabled=true; btn.textContent="Guardando…";
      const {error}=await supa.from("banners").update({inicia_at:dtLocalToIso(desde),finaliza_at:dtLocalToIso(hasta)}).eq("id",id);
      btn.disabled=false; btn.textContent=t;
      if(error){ alert("No se pudieron guardar las fechas: "+(error.message||error)); return; }
      cargarBanners();
    }));
    cont.querySelectorAll("[data-bnr-del]").forEach(btn=>btn.addEventListener("click",async()=>{
      if(!confirm("¿Borrar este banner? No se puede deshacer.")) return;
      await supa.from("banners").delete().eq("id",btn.dataset.bnrDel); cargarBanners();
    }));
  }

  // ============ Cupones (proyecto de la tienda · login dual) ============
  function generarCodigoCupon(){ var abc="ABCDEFGHJKMNPQRSTUVWXYZ23456789",s=""; for(var i=0;i<5;i++) s+=abc[Math.floor(Math.random()*abc.length)]; return "HAUS-"+s; }
  $("cupTipo").addEventListener("change",()=>{ $("cupValorLbl").textContent = $("cupTipo").value==="porcentaje"?"Porcentaje (%)":"Monto (US$)"; });
  $("cupUsos").addEventListener("change",()=>{ $("cupTopeWrap").hidden = $("cupUsos").value!=="varios"; });
  $("cupGen").addEventListener("click",()=>{ $("cupCodigo").value=generarCodigoCupon(); });
  $("cupAdd").addEventListener("click", async ()=>{
    const codigo=($("cupCodigo").value||"").trim().toUpperCase(), tipo=$("cupTipo").value, valor=Number($("cupValor").value||0);
    if(codigo.length<3){ aviso($("cupAviso"),"El código es muy corto.","err"); return; }
    if(!(valor>0)){ aviso($("cupAviso"),"Indicá el valor del descuento.","err"); return; }
    if(tipo==="porcentaje"&&valor>100){ aviso($("cupAviso"),"El porcentaje no puede pasar de 100.","err"); return; }
    const usosSel=$("cupUsos").value, usos_max = usosSel==="ilimitado"?null:(usosSel==="1"?1:Math.max(1,Number($("cupTope").value||1)));
    const btn=$("cupAdd"); btn.disabled=true; const t=btn.innerHTML; btn.innerHTML='<span class="spin"></span> Creando…'; aviso($("cupAviso"),"","");
    if(!(await asegurarSesionTienda(true))){ aviso($("cupAviso"),"No se pudo entrar al proyecto de Cupones"+(ultimoErrorTienda?(": "+ultimoErrorTienda):". Revisá tus credenciales del sistema (app de tracking)."),"err"); btn.disabled=false; btn.innerHTML=t; return; }
    try{
      const {error}=await supaTienda.from("cupones").insert({ codigo, tipo, valor, usos_max, vence_el:$("cupVence").value||null, nota:($("cupNota").value||"").trim()||null, cliente_id:null });
      if(error) throw error;
      $("cupCodigo").value=""; $("cupNota").value=""; $("cupVence").value="";
      aviso($("cupAviso"),"✓ Cupón creado. Link para Brevo: hauslineshopni.es/?cupon="+codigo,"ok"); cargarCupones();
    }catch(err){ const m=err.message||String(err); aviso($("cupAviso"), /duplicate/i.test(m)?"Ese código ya existe.": /row-level security|violates|permission|not allowed/i.test(m)?"Tu usuario no tiene permiso en el proyecto de Cupones (perfil inactivo o distinto). Debe ser el mismo admin de la app de tracking.":"Error: "+m,"err"); }
    finally{ btn.disabled=false; btn.innerHTML=t; }
  });
  async function cargarCupones(){
    const cont=$("cupLista"); cont.innerHTML='<div class="cargando">Cargando…</div>';
    await asegurarSesionTienda();
    const {data,error}=await supaTienda.from("cupones").select("id,codigo,tipo,valor,usos_max,usos_confirmados,vence_el,activo").order("created_at",{ascending:false});
    if(error){ cont.innerHTML='<div class="cargando" style="color:#e5484d;">No se pudieron cargar. Cerrá sesión y volvé a entrar (para el login del segundo proyecto).</div>'; return; }
    if(!data||!data.length){ cont.innerHTML='<div class="cargando">Sin cupones todavía.</div>'; return; }
    const hoy=new Date().toISOString().slice(0,10);
    cont.innerHTML=data.map(c=>{
      const val=c.tipo==="porcentaje"?(c.valor+"%"):("US$ "+Number(c.valor).toFixed(2));
      const usos=c.usos_max==null?(c.usos_confirmados+" usos · ilimitado"):(c.usos_confirmados+" / "+c.usos_max+" usos");
      const venc=c.vence_el&&c.vence_el<hoy, inact=!c.activo||venc;
      return '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid var(--linea);'+(inact?"opacity:.6;":"")+'">'
        +'<div style="flex:1;min-width:160px;"><b style="font-family:monospace;font-size:14px;">'+esc(c.codigo)+'</b> <span style="color:var(--texto2);font-size:12px;">· '+val+' · '+usos+'</span>'+(venc?'<span style="color:#e5484d;font-size:11px;font-weight:700;"> · VENCIDO</span>':'')+'</div>'
        +'<button class="btn btn-sec" data-cup-copy="'+esc(c.codigo)+'" style="padding:6px 10px;font-size:12px;">Copiar link</button>'
        +'<button class="btn btn-sec" data-cup-toggle="'+c.id+'" style="padding:6px 10px;font-size:12px;">'+(c.activo?"Desactivar":"Activar")+'</button>'
        +'<button class="btn btn-sec" data-cup-del="'+c.id+'" style="padding:6px 10px;font-size:12px;color:#e5484d;">Borrar</button></div>';
    }).join("");
    cont.querySelectorAll("[data-cup-copy]").forEach(b=>b.addEventListener("click",()=>{ const url="https://hauslineshopni.es/?cupon="+encodeURIComponent(b.dataset.cupCopy); try{navigator.clipboard.writeText(url);}catch(e){} const o=b.textContent; b.textContent="✓ Copiado"; setTimeout(()=>b.textContent=o,1200); }));
    cont.querySelectorAll("[data-cup-toggle]").forEach(b=>b.addEventListener("click",async()=>{ const c=data.find(x=>x.id===b.dataset.cupToggle); await supaTienda.from("cupones").update({activo:!c.activo}).eq("id",c.id); cargarCupones(); }));
    cont.querySelectorAll("[data-cup-del]").forEach(b=>b.addEventListener("click",async()=>{ if(!confirm("¿Borrar este cupón?"))return; await supaTienda.from("cupones").delete().eq("id",b.dataset.cupDel); cargarCupones(); }));
  }

  // ============ Promociones automáticas (proyecto de la tienda · login dual) ============
  $("prmTipo").addEventListener("change",()=>{ $("prmValorLbl").textContent = $("prmTipo").value==="porcentaje"?"Porcentaje (%)":"Monto (US$)"; });
  $("prmCondTipo").addEventListener("change",()=>{ $("prmCondLbl").textContent = $("prmCondTipo").value==="cantidad"?"Mínimo de productos":"Monto mínimo (US$)"; });
  $("prmAdd").addEventListener("click", async ()=>{
    const nombre=($("prmNombre").value||"").trim(), condVal=Number($("prmCondValor").value||0), tipo=$("prmTipo").value, valor=Number($("prmValor").value||0);
    if(nombre.length<2){ aviso($("prmAviso"),"Ponele un nombre.","err"); return; }
    if(!(condVal>0)){ aviso($("prmAviso"),"Indicá la condición.","err"); return; }
    if(!(valor>0)){ aviso($("prmAviso"),"Indicá el valor del descuento.","err"); return; }
    if(tipo==="porcentaje"&&valor>100){ aviso($("prmAviso"),"El porcentaje no puede pasar de 100.","err"); return; }
    const btn=$("prmAdd"); btn.disabled=true; const t=btn.innerHTML; btn.innerHTML='<span class="spin"></span> Creando…'; aviso($("prmAviso"),"","");
    if(!(await asegurarSesionTienda(true))){ aviso($("prmAviso"),"No se pudo entrar al proyecto de Promos"+(ultimoErrorTienda?(": "+ultimoErrorTienda):". Revisá tus credenciales del sistema (app de tracking)."),"err"); btn.disabled=false; btn.innerHTML=t; return; }
    try{
      const {error}=await supaTienda.from("promociones").insert({ nombre, condicion_tipo:$("prmCondTipo").value, condicion_valor:condVal, tipo, valor, vence_el:$("prmVence").value||null, nota:($("prmNota").value||"").trim()||null });
      if(error) throw error;
      $("prmNombre").value=""; $("prmNota").value=""; $("prmVence").value="";
      aviso($("prmAviso"),"✓ Promoción creada. Se aplica sola en el checkout.","ok"); cargarPromos();
    }catch(err){ const m=err.message||String(err); aviso($("prmAviso"), /row-level security|violates|permission|not allowed/i.test(m)?"Tu usuario no tiene permiso en el proyecto de Promos (perfil inactivo o distinto). Debe ser el mismo admin de la app de tracking.":"Error: "+m,"err"); }
    finally{ btn.disabled=false; btn.innerHTML=t; }
  });
  async function cargarPromos(){
    const cont=$("prmLista"); cont.innerHTML='<div class="cargando">Cargando…</div>';
    await asegurarSesionTienda();
    const {data,error}=await supaTienda.from("promociones").select("id,nombre,condicion_tipo,condicion_valor,tipo,valor,vence_el,activo").order("created_at",{ascending:false});
    if(error){ cont.innerHTML='<div class="cargando" style="color:#e5484d;">No se pudieron cargar. ¿Aplicaste la migración de promociones (202609200005)?</div>'; return; }
    if(!data||!data.length){ cont.innerHTML='<div class="cargando">Sin promociones todavía.</div>'; return; }
    const hoy=new Date().toISOString().slice(0,10);
    cont.innerHTML=data.map(p=>{
      const val=p.tipo==="porcentaje"?(p.valor+"%"):("US$ "+Number(p.valor).toFixed(2));
      const cond=p.condicion_tipo==="cantidad"?(p.condicion_valor+"+ productos"):("+US$ "+Number(p.condicion_valor).toFixed(0));
      const venc=p.vence_el&&p.vence_el<hoy, inact=!p.activo||venc;
      return '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid var(--linea);'+(inact?"opacity:.6;":"")+'">'
        +'<div style="flex:1;min-width:160px;"><b style="font-size:13px;">'+esc(p.nombre)+'</b> <span style="color:var(--texto2);font-size:12px;">· '+cond+' → '+val+'</span>'+(venc?'<span style="color:#e5484d;font-size:11px;font-weight:700;"> · VENCIDA</span>':'')+'</div>'
        +'<button class="btn btn-sec" data-prm-toggle="'+p.id+'" style="padding:6px 10px;font-size:12px;">'+(p.activo?"Desactivar":"Activar")+'</button>'
        +'<button class="btn btn-sec" data-prm-del="'+p.id+'" style="padding:6px 10px;font-size:12px;color:#e5484d;">Borrar</button></div>';
    }).join("");
    cont.querySelectorAll("[data-prm-toggle]").forEach(b=>b.addEventListener("click",async()=>{ const p=data.find(x=>x.id===b.dataset.prmToggle); await supaTienda.from("promociones").update({activo:!p.activo}).eq("id",p.id); cargarPromos(); }));
    cont.querySelectorAll("[data-prm-del]").forEach(b=>b.addEventListener("click",async()=>{ if(!confirm("¿Borrar esta promoción?"))return; await supaTienda.from("promociones").delete().eq("id",b.dataset.prmDel); cargarPromos(); }));
  }

  // ============ Sesión ============
  async function mostrarPanel(m){
    $("vistaLogin").classList.toggle("hidden",m); $("vistaPanel").classList.toggle("hidden",!m);
    if(m){
      const ue=$("userEmail"); if(ue){ supa.auth.getUser().then(({data})=>{ ue.textContent=(data&&data.user&&data.user.email)||"Administrador"; }).catch(()=>{}); }
      baseProductos=await cargarBase(); await cargarRemotos(); irA("inicio");
    }
  }
  // Antes de guardar, fuerza renovar el token de sesion. Evita el error
  // '"exp" claim timestamp check failed', que sale cuando el token guardado
  // vencio y supabase-js no lo renovo solo (tipico si el panel estuvo abierto un
  // rato, o si el reloj de la PC esta atrasado). Si el refresh falla, la sesion
  // ya no sirve: limpia y pide iniciar sesion otra vez.
  async function asegurarSesion(){
    try{ const { data, error } = await supa.auth.refreshSession(); if(!error && data && data.session) return true; }
    catch(e){}
    try{ await supa.auth.signOut(); }catch(e){}
    mostrarPanel(false);
    aviso($("avisoLogin"), "Tu sesion expiro. Volve a iniciar sesion para guardar.", "err");
    return false;
  }
  // Guardamos las credenciales del login en memoria (solo mientras la pestaña está abierta)
  // para poder re-entrar al segundo proyecto (cupones/promos) si su sesión se cae.
  // OJO: el catálogo y el tracking son proyectos Supabase DISTINTOS con usuarios DISTINTOS.
  // Si tu cuenta de admin.html no existe (o tiene otra clave) en el tracking, hay que pedir
  // esas credenciales aparte.
  let credsTienda = null;
  let ultimoErrorTienda = "";
  async function loginTienda(email, password){
    try{ const { error } = await supaTienda.auth.signInWithPassword({ email, password }); ultimoErrorTienda = error ? (error.message||String(error)) : ""; return !error; }
    catch(e){ ultimoErrorTienda = e.message||String(e); return false; }
  }
  // Garantiza sesión en el proyecto de la tienda (cupones/promos). Si no hay, re-entra con las
  // credenciales guardadas; si tampoco y interactivo=true, las pide (las del SISTEMA/tracking).
  async function asegurarSesionTienda(interactivo){
    try{
      const { data } = await supaTienda.auth.getSession();
      if(data && data.session) return true;
    }catch(_){}
    if(credsTienda && await loginTienda(credsTienda.email, credsTienda.password)) return true;
    if(interactivo){
      const emailPrev = (credsTienda && credsTienda.email) || ($("loginEmail") ? $("loginEmail").value : "") || "";
      const email = (window.prompt("CUPONES/PROMOS usan tu cuenta del SISTEMA (la app de tracking), que es distinta del catálogo.\n\nCorreo del sistema:", emailPrev) || "").trim();
      if(!email) return false;
      const password = window.prompt("Contraseña del sistema (la de la app de tracking):") || "";
      if(!password) return false;
      credsTienda = { email, password };
      return await loginTienda(email, password);
    }
    return false;
  }
  $("btnEntrar").addEventListener("click",async()=>{
    const email=$("loginEmail").value.trim(),password=$("loginPass").value;
    if(!email||!password){ aviso($("avisoLogin"),"Poné correo y contraseña.","err"); return; }
    const btn=$("btnEntrar"); btn.disabled=true; const t=btn.textContent; btn.textContent="Entrando…";
    const {error}=await supa.auth.signInWithPassword({email,password});
    // Login DUAL: también al proyecto de la tienda (cupones/promos), con las mismas credenciales.
    credsTienda = { email, password };
    const okTienda = await loginTienda(email, password);
    btn.disabled=false; btn.textContent=t;
    if(error){ aviso($("avisoLogin"),"No se pudo entrar: "+error.message,"err"); return; }
    aviso($("avisoLogin"),"",""); mostrarPanel(true);
    // Si el catálogo entró pero el segundo proyecto no, avisamos (cupones/promos no funcionarán).
    if(!okTienda) aviso($("avisoLogin"),"Entraste, pero no se pudo entrar al proyecto de Cupones/Promos. Usá la MISMA contraseña que en la app de tracking (hausline-tracking) o creá tu usuario ahí.","err");
  });
  $("loginPass").addEventListener("keydown",e=>{ if(e.key==="Enter") $("btnEntrar").click(); });
  $("verPass").addEventListener("click",()=>{ const p=$("loginPass"); p.type=p.type==="password"?"text":"password"; });
  $("btnSalir").addEventListener("click",async()=>{ await supa.auth.signOut(); try{ await supaTienda.auth.signOut(); }catch(_){} limpiarForm(); mostrarPanel(false); });
  ["gesturestart","gesturechange","gestureend"].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));

  // ============ Arranque ============
  llenarSelect($("fCategoria"),CATEGORIAS,false); $("fCategoria").dispatchEvent(new Event("change"));
  pintarFotos(); campoATallasUI(); aplicarModoTallas(); campoAColoresUI();
  supa.auth.getSession().then(({data})=>mostrarPanel(!!(data&&data.session)));
})();
