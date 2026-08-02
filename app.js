// ============================================================
// HAUSLINE — Lógica de la tienda
// Los datos viven en: productos.js (catálogo) y clientes.js
// El carrito y favoritos viven en: carrito.js y favoritos.js
// ============================================================

const WHATSAPP = "50578995116";

const CATEGORIAS = [
  { id: "Zapatos",    etiqueta: "Zapatos" },
  { id: "Ropa",       etiqueta: "Ropa" },
  { id: "Dama",       etiqueta: "Dama" },
  { id: "Accesorios", etiqueta: "Accesorios" }
];

// Políticas de compra de HAUSLINE (se muestran en el modal del producto).
const POLITICAS = {
  condiciones: [
    "Todos los pedidos son bajo encargo salvo los marcados como entrega inmediata.",
    "Se confirma el pedido con un abono del 50%.",
    "No se permiten cancelaciones una vez confirmado el pedido."
  ],
  entrega: [
    "Tiempo estimado de 15 a 25 días hábiles.",
    "El tiempo puede variar por logística internacional.",
    "Los productos de entrega inmediata se entregan sin espera."
  ],
  garantia: [
    "Garantía de 24 horas por defectos de fábrica.",
    "Revisa tu pedido al momento de recibirlo."
  ]
};

// ---------- Estado ----------
let estadoVista = "inicio";          // "inicio" | "coleccion"
let coleccionActual = null;          // { tipo, valor, titulo }
let paginaActual = 1;
let textoBusqueda = "";
let ordenActual = "recomendados";
let filtroMarca = "";
let filtroPrecio = "";
const filtrosActivos = new Set();    // "nuevo" | "oferta" | "inmediata" | "rapido"

let productoActual = null;
let modoInmediataActual = false;   // true si se abrió desde "Entrega inmediata"
let imagenesActuales = [];
let indiceImagen = 0;
let tallaSeleccionada = "";
let colorSeleccionado = "";
let cantidadSeleccionada = 1;

// ---------- Utilidades ----------

function $(sel){ return document.querySelector(sel); }
function $$(sel){ return Array.from(document.querySelectorAll(sel)); }

function esc(texto){
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatoPrecio(valor){
  // Usa el formateador central (respeta la moneda elegida: USD o C$).
  return typeof formatearMoneda === "function"
    ? formatearMoneda(valor)
    : "$" + Number(valor || 0).toLocaleString("en-US");
}

function productosPorPagina(){
  const w = window.innerWidth;
  if(w < 640) return 6;
  if(w < 900) return 12;
  if(w < 1200) return 20;
  return 24;
}

let avisoTimer = null;
function mostrarAviso(texto){
  const aviso = $("#aviso");
  $("#avisoTexto").textContent = texto;
  aviso.classList.add("activo");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => aviso.classList.remove("activo"), 2400);
}

function animarContador(selector){
  $$(selector).forEach(el => {
    el.classList.remove("pulso");
    void el.offsetWidth;
    el.classList.add("pulso");
  });
}

// ============================================================
// TARJETA DE PRODUCTO
// ============================================================

// modoInmediata = la tarjeta se está mostrando dentro de "Entrega inmediata".
// En ese contexto muestra el precio y las tallas que hay físicamente.
function crearCard(producto, modoInmediata){
  const inmediata = !!modoInmediata && producto.entregaInmediata;
  const oferta = ofertaVigente(producto);
  const precio = precioVigente(producto, inmediata);
  const desc = porcentajeDescuento(producto);
  const fav = esFavorito(producto.codigo);

  let etiquetas = "";
  if(inmediata) etiquetas += `<span class="etiqueta inmediata">Entrega inmediata</span>`;
  if(oferta) etiquetas += `<span class="etiqueta oferta">-${desc}%</span>`;
  if(esNuevo(producto)) etiquetas += `<span class="etiqueta nuevo">Nuevo</span>`;
  // Etiquetas opcionales que hayas activado en el producto
  etiquetasActivas(producto).forEach(e => {
    etiquetas += `<span class="etiqueta ${e.color}">${esc(e.texto)}</span>`;
  });

  const precioHtml = oferta
    ? `<span class="precio-actual">${formatoPrecio(precio)}</span>
       <span class="precio-antes">${formatoPrecio(producto.precio)}</span>`
    : `<span class="precio-actual">${formatoPrecio(precio)}</span>`;

  // Solo en el apartado de entrega inmediata se listan las tallas en stock.
  let tallasHtml = "";
  if(inmediata && producto.tallasEntregaInmediata.length){
    const visibles = producto.tallasEntregaInmediata.slice(0, 4);
    const resto = producto.tallasEntregaInmediata.length - visibles.length;
    tallasHtml = `<div class="card-tallas">
      ${visibles.map(t => `<span class="card-talla">${esc(t)}</span>`).join("")}
      ${resto > 0 ? `<span class="card-talla mas">+${resto}</span>` : ""}
    </div>`;
  }

  // Por defecto la foto se recorta para que el producto llene la tarjeta.
  // Si el producto trae imagenFit:"contain" se muestra completa.
  const claseAjuste = producto.imagenFit === "contain" ? "ajuste-contain" : "";
  const estiloEscala = producto.escalaImagen
    ? ` style="transform:scale(${Number(producto.escalaImagen)})"` : "";

  return `
    <article class="card" data-codigo="${esc(producto.codigo)}" ${inmediata ? 'data-modo="inmediata"' : ""}>
      <div class="card-img">
        <img class="${claseAjuste}" src="${esc(producto.imagen)}" alt="${esc(nombreProducto(producto))}" loading="lazy"${estiloEscala}
             onerror="this.closest('.card-img').classList.add('sin-imagen')">
        <div class="etiquetas">${etiquetas}</div>
        <button class="btn-fav ${fav ? "activo" : ""}" type="button"
                data-fav="${esc(producto.codigo)}"
                aria-label="${fav ? "Quitar de favoritos" : "Guardar en favoritos"}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
      </div>
      <div class="card-info">
        <div class="card-marca">${esc(marcaProducto(producto))}</div>
        <h3 class="card-nombre">${esc(nombreProducto(producto))}</h3>
        <div class="card-codigo">${esc(producto.codigo)}</div>
        <div class="card-precio">${precioHtml}</div>
        ${tallasHtml}
      </div>
    </article>
  `;
}

function pintarFila(idSelector, lista, modoInmediata){
  const cont = $(idSelector);
  if(!cont) return;
  cont.innerHTML = lista.map(p => crearCard(p, modoInmediata)).join("");
}

// ============================================================
// SELECCIONES DE PRODUCTOS PARA CADA SECCIÓN
// Nada de datos inventados: si no marcas "destacado", se usa
// simplemente el orden del catálogo.
// ============================================================

// Reparte los productos entre las secciones sin repetir ninguno.
// Cada sección toma de lo que quedó libre, así un mismo modelo nunca
// aparece dos veces en la página de inicio.
let usadosEnInicio = new Set();

function tomar(lista, limite){
  const salida = [];
  for(const p of lista){
    if(salida.length >= limite) break;
    if(usadosEnInicio.has(p.codigo)) continue;
    usadosEnInicio.add(p.codigo);
    salida.push(p);
  }
  return salida;
}

function seleccionDestacados(lista, limite){
  const marcados = lista.filter(p => p.destacado);
  return tomar(marcados.length ? marcados : lista, limite);
}

// "Nuevo en HAUSLINE": lo último que agregaste al catálogo, automático.
// Al agregar un producto al final de productos.js aparece aquí solo.
function productosNuevos(limite){
  return tomar([...productos].sort((a, b) => b.orden - a.orden), limite || 12);
}

function productosTendencia(limite){
  return seleccionDestacados(productos.filter(p => p.categoria === "Zapatos"), limite || 12);
}

function productosPopulares(limite){
  // Muestra equilibrada de todas las categorías, sin repetir lo ya mostrado.
  const mezcla = [];
  const porCategoria = CATEGORIAS.map(c => productos.filter(p => p.categoria === c.id));
  for(let i = 0; i < 8; i++){
    porCategoria.forEach(grupo => { if(grupo[i]) mezcla.push(grupo[i]); });
  }
  return tomar(mezcla, limite || 12);
}

function productosOferta(){
  return productos.filter(ofertaVigente);
}

function productosInmediata(){
  return productos.filter(p => p.entregaInmediata);
}

function productosVistos(){
  return leerVistos().map(buscarProducto).filter(Boolean);
}

function productosFavoritos(){
  return leerFavoritos().map(buscarProducto).filter(Boolean);
}

// ============================================================
// BANDA DE MENSAJES
// ============================================================

function renderBanda(){
  const track = $("#bandaTrack");
  if(!track || typeof mensajesBanda === "undefined") return;
  const items = mensajesBanda.map(m => `<span class="banda-item">${esc(m)}</span>`).join("");
  // Se duplica para que el desplazamiento sea continuo y sin salto.
  track.innerHTML = items + items;
}

// ============================================================
// BANNERS
// ============================================================

let bannerIndice = 0;
let bannerTimer = null;

function renderBanners(){
  const track = $("#bannersTrack");
  const puntos = $("#bannerPuntos");
  if(!track || typeof banners === "undefined") return;

  const activos = banners.filter(b => b.activo);
  if(!activos.length){ $("#banners").hidden = true; return; }

  track.innerHTML = activos.map(b => {
    const img = b.imagen
      ? `<img class="banner-img" src="${esc(b.imagen)}" alt="" loading="lazy">`
      : "";
    return `
      <div class="banner">
        ${img}
        <div class="banner-contenido">
          <h2>${esc(b.titulo)}</h2>
          <p>${esc(b.subtitulo)}</p>
          <button class="btn-verde" type="button"
                  data-banner-codigo="${esc(b.codigoProducto || "")}"
                  data-banner-enlace="${esc(b.enlace || "")}">
            ${esc(b.textoBoton)}
          </button>
        </div>
      </div>`;
  }).join("");

  puntos.innerHTML = activos.map((_, i) =>
    `<button class="banner-punto ${i === 0 ? "activo" : ""}" type="button"
             data-banner-punto="${i}" aria-label="Banner ${i + 1}"></button>`
  ).join("");

  bannerIndice = 0;
  moverBanner(0);
  iniciarBannerAuto(activos.length);
}

function moverBanner(indice){
  const track = $("#bannersTrack");
  if(!track) return;
  const total = track.children.length;
  if(!total) return;
  bannerIndice = (indice + total) % total;
  track.style.transform = `translateX(-${bannerIndice * 100}%)`;
  $$("[data-banner-punto]").forEach((p, i) =>
    p.classList.toggle("activo", i === bannerIndice)
  );
}

function iniciarBannerAuto(total){
  clearInterval(bannerTimer);
  if(total <= 1) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  bannerTimer = setInterval(() => moverBanner(bannerIndice + 1), 5500);
}

// Deslizamiento táctil de los banners
(function habilitarSwipeBanners(){
  const cont = $("#banners");
  if(!cont) return;
  let x0 = null;
  cont.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive:true });
  cont.addEventListener("touchend", e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 45) moverBanner(bannerIndice + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive:true });
})();

// ============================================================
// CHIPS Y CATEGORÍAS VISUALES
// ============================================================

function renderChips(){
  const cont = $("#chipsCategorias");
  if(!cont) return;
  // El acceso a "Ofertas" solo aparece si hay alguna promoción vigente.
  const hayOfertas = productosOferta().length > 0;
  cont.innerHTML = `
    <button class="chip activo" type="button" data-ir-inicio>Inicio</button>
    ${CATEGORIAS.map(c => `<button class="chip" type="button" data-categoria="${esc(c.id)}">${esc(c.etiqueta)}</button>`).join("")}
    <button class="chip" type="button" data-coleccion="marcas">Marcas</button>
    ${hayOfertas ? `<button class="chip" type="button" data-coleccion="ofertas">Ofertas</button>` : ""}
  `;
}

// Oculta todos los enlaces a "Ofertas" (menú, footer, barra superior)
// cuando no hay ninguna promoción activa.
function actualizarAccesosOfertas(){
  const hayOfertas = productosOferta().length > 0;
  $$('[data-coleccion="ofertas"]').forEach(el => {
    el.hidden = !hayOfertas;
    el.style.display = hayOfertas ? "" : "none";
  });
}

function renderCategoriasVisuales(){
  const cont = $("#filaCategorias");
  if(!cont) return;
  cont.innerHTML = CATEGORIAS.map(c => {
    const p = productos.find(x => x.categoria === c.id);
    const img = p ? p.imagen : "";
    return `
      <button class="card-categoria" type="button" data-categoria="${esc(c.id)}">
        ${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}
        <span>${esc(c.etiqueta)}</span>
      </button>`;
  }).join("");
}

// ============================================================
// MARCAS
// ============================================================

function renderMarcas(limite){
  const cont = $("#filaMarcas");
  if(!cont) return;
  const lista = limite ? marcasCatalogo.slice(0, limite) : marcasCatalogo;
  cont.innerHTML = lista.map(m => {
    // Si la marca tiene su tarjeta en imgP/marcas/ se usa completa.
    // Si no, se arma con una foto de producto atenuada y el nombre encima.
    // El onerror cubre el caso de que el archivo no exista todavía.
    const imagenMarca = m.tarjeta || m.logo;
    const contenido = imagenMarca
      ? `<img class="marca-imagen ${m.tarjeta ? "marca-imagen-destacada" : ""}" src="${esc(imagenMarca)}" alt="${esc(m.nombre)}" loading="lazy"
              onerror="this.classList.remove('marca-imagen'); this.classList.add('marca-portada'); this.src='${esc(m.portada)}'; this.insertAdjacentHTML('afterend','<span class=&quot;marca-texto&quot;>'+this.alt+'</span>');">`
      : `${m.portada ? `<img class="marca-portada" src="${esc(m.portada)}" alt="" loading="lazy">` : ""}
         <span class="marca-texto">${esc(m.nombre)}</span>`;
    return `
      <button class="card-marca-tarjeta" type="button" data-marca="${esc(m.nombre)}" aria-label="Ver productos de ${esc(m.nombre)}">
        ${contenido}
      </button>`;
  }).join("");
}

// ============================================================
// EDITORIAL
// ============================================================

// Carrusel infinito de marcas (solo imágenes, sin enlaces ni clics).
// Usa las mismas imágenes de imgP/marcas/. Se duplica para que el
// desplazamiento sea continuo y sin saltos.
function renderMarcasMarquee(){
  const cont = $("#marcasMarquee");
  if(!cont) return;
  const conLogo = marcasCatalogo.filter(m => m.logo);
  if(!conLogo.length){ cont.style.display = "none"; return; }

  const tiles = conLogo.map(m =>
    `<div class="marca-tile"><img src="${esc(m.logo)}" alt="${esc(m.nombre)}" loading="lazy"></div>`
  ).join("");

  cont.innerHTML = `<div class="marcas-marquee-track">${tiles}${tiles}</div>`;
}

// Banner grande con varias fotos de un mismo estilo + botón a la marca.
function renderLookbook(){
  const cont = $("#lookbook");
  if(!cont || typeof lookbook === "undefined") return;

  if(!lookbook.activo || !lookbook.imagenes || !lookbook.imagenes.length){
    cont.innerHTML = "";
    return;
  }

  const fotos = lookbook.imagenes.map((src, i) => `
    <div class="lookbook-foto">
      <img src="${esc(src)}" alt="${esc(lookbook.titulo)} ${i + 1}" loading="lazy"
           onerror="this.closest('.lookbook-foto').style.display='none'">
    </div>`).join("");

  cont.innerHTML = `
    <div class="lookbook">
      <div class="lookbook-info">
        <h2>${esc(lookbook.titulo)}</h2>
        <p>${esc(lookbook.subtitulo)}</p>
        <button class="btn-verde" type="button" data-marca="${esc(lookbook.marca)}">
          ${esc(lookbook.textoBoton)}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
      <div class="lookbook-fotos">${fotos}</div>
    </div>`;
}

function renderEditorial(){
  const cont = $("#filaEditorial");
  if(!cont) return;

  const activos = (typeof editoriales !== "undefined" ? editoriales : [])
    .filter(e => e && e.activo && e.imagen);

  if(!activos.length){
    // Espacio preparado: se explica dónde agregar las fotos.
    cont.innerHTML = `
      <div class="editorial-vacio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        Espacio listo para tus fotos publicitarias.
        <code>clientes.js → editoriales</code>
      </div>`;
    return;
  }

  cont.innerHTML = activos.map(e => {
    const producto = e.codigoProducto ? buscarProducto(e.codigoProducto) : null;
    const boton = producto
      ? `<button class="btn-verde" type="button" data-codigo="${esc(producto.codigo)}">${esc(e.textoBoton || "Ver producto")}</button>`
      : "";
    return `
      <div class="card-editorial">
        <img src="${esc(e.imagen)}" alt="${esc(e.titulo || "")}" loading="lazy">
        <div class="editorial-info">
          <h3>${esc(e.titulo || "")}</h3>
          <p>${esc(e.subtitulo || "")}</p>
          ${boton}
        </div>
      </div>`;
  }).join("");
}

// ============================================================
// CLIENTES
// ============================================================

function renderClientes(){
  const cont = $("#filaClientes");
  if(!cont || typeof clientes === "undefined") return;

  cont.innerHTML = clientes.map(c => {
    const img = `<img src="${esc(c.imagen)}" alt="${esc(c.alt || "Entrega a cliente HAUSLINE")}" loading="lazy">`;
    // Solo se vuelve enlace si realmente hay URL de Instagram.
    if(c.instagramUrl){
      return `
        <a class="cliente" href="${esc(c.instagramUrl)}" target="_blank" rel="noopener noreferrer"
           aria-label="Ver publicación en Instagram">
          ${img}
          <span class="cliente-ig">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>
          </span>
        </a>`;
    }
    return `<div class="cliente">${img}</div>`;
  }).join("");
}

// ============================================================
// INSTAGRAM
// ============================================================
function renderInstagram(){
  const sec = $("#seccionInstagram");
  const cont = $("#filaInstagram");
  if(!sec || !cont) return;
  const posts = (typeof instagramPosts !== "undefined" ? instagramPosts : []).filter(p => p && p.imagen);
  if(!posts.length){ sec.hidden = true; return; }
  sec.hidden = false;
  cont.innerHTML = posts.map(p => `
    <a class="social-card" href="${esc(p.url || HAUSLINE_INSTAGRAM)}" target="_blank" rel="noopener noreferrer"
       aria-label="Ver publicación en Instagram">
      <img src="${esc(p.imagen)}" alt="Publicación de HAUSLINE en Instagram" loading="lazy">
      <span class="social-ic">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>
      </span>
    </a>`).join("");
}

// ============================================================
// TIKTOK
// ============================================================
function renderTiktok(){
  const sec = $("#seccionTiktok");
  const cont = $("#filaTiktok");
  if(!sec || !cont) return;
  const vids = (typeof tiktokVideos !== "undefined" ? tiktokVideos : []).filter(v => v && v.portada);
  if(!vids.length){ sec.hidden = true; return; }
  sec.hidden = false;
  cont.innerHTML = vids.map(v => `
    <a class="social-card vertical" href="${esc(v.url || HAUSLINE_TIKTOK)}" target="_blank" rel="noopener noreferrer"
       aria-label="Ver video en TikTok">
      <img src="${esc(v.portada)}" alt="Video de HAUSLINE en TikTok" loading="lazy">
      <span class="social-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg></span>
    </a>`).join("");
}

// ============================================================
// TENDENCIAS (más vistos, contador REAL de Supabase)
// ============================================================
function renderTendencias(){
  const sec = $("#seccionTendencias");
  const cont = $("#filaTendencias");
  if(!sec || !cont) return;

  // Sin Supabase configurado, o sin vistas aún: la sección se oculta.
  const top = (typeof hlTopVistos === "function") ? hlTopVistos(productos, 12) : [];
  if(!top.length){ sec.hidden = true; return; }
  sec.hidden = false;
  cont.innerHTML = top.map(crearCard).join("");
}

// ============================================================
// MÁS VENDIDOS ESTA SEMANA (datos reales; estado vacío elegante)
// ============================================================
async function renderMasVendidos(){
  const sec = $("#seccionVendidos");
  const cont = $("#filaVendidos");
  if(!sec || !cont) return;

  const data = (typeof hlMasVendidosSemana === "function") ? await hlMasVendidosSemana() : null;

  // null = Supabase no configurado → ocultar sección por completo.
  if(data === null){ sec.hidden = true; return; }

  const items = data
    .map(r => ({ p: buscarProducto(r.codigo), total: r.total }))
    .filter(x => x.p);

  sec.hidden = false;

  // Configurado pero sin ventas registradas → estado vacío elegante.
  if(!items.length){
    cont.innerHTML = `
      <div class="estado-vacio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/></svg>
        <p>Aún no hay suficientes datos de ventas.</p>
        <small>Esta sección se llenará sola cuando se registren pedidos.</small>
      </div>`;
    return;
  }
  cont.innerHTML = items.map(x => crearCard(x.p)).join("");
}

// ============================================================
// FECHA ESTIMADA DE ENTREGA (15–25 días hábiles, automática)
// ============================================================
function sumarDiasHabiles(desde, dias){
  const d = new Date(desde);
  let restantes = dias;
  while(restantes > 0){
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();          // 0=domingo, 6=sábado
    if(dow !== 0 && dow !== 6) restantes--;
  }
  return d;
}

function textoEntregaEstimada(){
  const meses = ["enero","febrero","marzo","abril","mayo","junio",
                 "julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const hoy = new Date();
  const desde = sumarDiasHabiles(hoy, 15);
  const hasta = sumarDiasHabiles(hoy, 25);
  const fmt = f => `${f.getDate()} de ${meses[f.getMonth()]}`;
  return `Encargando hoy, recibirías aproximadamente entre el <strong>${fmt(desde)}</strong> y el <strong>${fmt(hasta)}</strong>.`;
}

// ============================================================
// SECCIONES DE INICIO
// ============================================================

function renderInicio(){
  // Se reinicia el control de repetidos en cada render.
  usadosEnInicio = new Set();

  // Entrega inmediata va primero: tiene prioridad sobre el resto de secciones.
  const inmediata = productosInmediata();
  const contInmediata = $("#filaInmediata");
  if(inmediata.length){
    pintarFila("#filaInmediata", tomar(inmediata, 12), true);
  } else {
    contInmediata.innerHTML = `
      <div class="editorial-vacio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        Aún no hay productos marcados para entrega inmediata.
        <code>productos.js → entregaInmediata: true</code>
      </div>`;
  }

  // Ofertas: la sección se oculta sola si no hay promociones vigentes.
  const ofertas = productosOferta();
  const secOfertas = $("#seccionOfertas");
  if(ofertas.length){
    secOfertas.hidden = false;
    pintarFila("#filaOfertas", tomar(ofertas, 12));
  } else {
    secOfertas.hidden = true;
  }

  pintarFila("#filaTendencia", productosTendencia(12));
  pintarFila("#filaPopulares", productosPopulares(12));
  pintarFila("#filaRopa", seleccionDestacados(productos.filter(p => p.categoria === "Ropa"), 12));
  pintarFila("#filaAccesorios", seleccionDestacados(productos.filter(p => p.categoria === "Accesorios"), 12));
  pintarFila("#filaNuevos", productosNuevos(12));

  renderMarcas(10);
  renderLookbook();
  renderClientes();
  renderVistos();

  activarRevelado();
}

// Hace que las secciones aparezcan suavemente al ir bajando.
// Respeta "reducir movimiento" del dispositivo.
let observadorRevelado = null;
function activarRevelado(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if(!("IntersectionObserver" in window)) return;

  if(!observadorRevelado){
    observadorRevelado = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add("revelado");
          observadorRevelado.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  }

  document.querySelectorAll(".vista-inicio .seccion, .vista-inicio .banners")
    .forEach(el => {
      if(!el.classList.contains("revelado")){
        el.classList.add("por-revelar");
        observadorRevelado.observe(el);
      }
    });
}

function renderVistos(){
  const vistos = productosVistos();
  const sec = $("#seccionVistos");
  if(!sec) return;
  if(vistos.length){
    sec.hidden = false;
    pintarFila("#filaVistos", vistos);
  } else {
    sec.hidden = true;
  }
}

// ============================================================
// VISTA DE COLECCIÓN ("Ver todo")
// ============================================================

function abrirColeccion(tipo, valor, titulo){
  coleccionActual = { tipo, valor, titulo };
  estadoVista = "coleccion";
  paginaActual = 1;
  filtroMarca = "";
  filtroPrecio = "";
  filtrosActivos.clear();

  document.body.classList.add("en-coleccion");
  $("#coleccionTitulo").textContent = titulo;
  $("#selectOrden").value = ordenActual;
  $("#selectPrecio").value = "";
  $$("#filtrosBarra .chip").forEach(c => c.classList.remove("activo"));

  poblarSelectMarcas();
  renderColeccion();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function irInicio(){
  estadoVista = "inicio";
  coleccionActual = null;
  document.body.classList.remove("en-coleccion");
  window.scrollTo({ top: 0 });
}

// Devuelve la lista base de la colección abierta, antes de filtros.
function baseColeccion(){
  if(!coleccionActual) return productos;
  const { tipo, valor } = coleccionActual;

  if(tipo === "categoria") return productos.filter(p => p.categoria === valor);
  if(tipo === "marca")     return productos.filter(p => p.marca === valor);
  if(tipo === "busqueda")  return productos;

  switch(valor){
    case "tendencia":         return productos.filter(p => p.categoria === "Zapatos");
    case "populares":         return productos;
    case "nuevos":            return [...productos].sort((a, b) => b.orden - a.orden).slice(0, CANTIDAD_NUEVOS);
    case "ofertas":           return productosOferta();
    case "entrega-inmediata": return productosInmediata();
    case "favoritos":         return productosFavoritos();
    case "vistos":            return productosVistos();
    default:                  return productos;
  }
}

function aplicarBusqueda(lista){
  const t = textoBusqueda.trim().toLowerCase();
  if(!t) return lista;
  return lista.filter(p =>
    nombreProducto(p).toLowerCase().includes(t) ||
    String(p.codigo).toLowerCase().includes(t) ||
    String(p.marca || "").toLowerCase().includes(t) ||
    String(p.categoria || "").toLowerCase().includes(t) ||
    descripcionProducto(p).toLowerCase().includes(t)
  );
}

function aplicarFiltros(lista){
  let out = lista;

  if(filtroMarca) out = out.filter(p => p.marca === filtroMarca);

  if(filtroPrecio){
    const [min, max] = filtroPrecio.split("-").map(Number);
    out = out.filter(p => {
      const v = precioVigente(p);
      return v >= min && v <= max;
    });
  }

  if(filtrosActivos.has("nuevo"))     out = out.filter(esNuevo);
  if(filtrosActivos.has("oferta"))    out = out.filter(ofertaVigente);
  if(filtrosActivos.has("inmediata")) out = out.filter(p => p.entregaInmediata);
  if(filtrosActivos.has("rapido"))    out = out.filter(p => p.envioRapido);

  return out;
}

function aplicarOrden(lista){
  const copia = [...lista];
  switch(ordenActual){
    case "precio-asc":  return copia.sort((a,b) => precioVigente(a) - precioVigente(b));
    case "precio-desc": return copia.sort((a,b) => precioVigente(b) - precioVigente(a));
    case "nombre":      return copia.sort((a,b) => nombreProducto(a).localeCompare(nombreProducto(b)));
    case "recientes":   return copia.reverse();
    default:            return copia;
  }
}

function poblarSelectMarcas(){
  const sel = $("#selectMarca");
  if(!sel) return;
  const disponibles = [...new Set(baseColeccion().map(p => p.marca).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Todas las marcas</option>` +
    disponibles.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join("");
  sel.value = filtroMarca;
}

function renderColeccion(){
  const grid = $("#gridColeccion");
  if(!grid) return;

  const filtrados = aplicarOrden(aplicarFiltros(aplicarBusqueda(baseColeccion())));
  const porPagina = productosPorPagina();
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  if(paginaActual > totalPaginas) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * porPagina;
  const pagina = filtrados.slice(inicio, inicio + porPagina);

  $("#coleccionConteo").textContent =
    filtrados.length === 1 ? "1 producto" : `${filtrados.length} productos`;

  if(!pagina.length){
    grid.innerHTML = `
      <div class="sin-resultados">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <p>No encontramos productos</p>
        <small>Prueba con otra búsqueda o quita algún filtro.</small>
      </div>`;
    $("#paginacion").innerHTML = "";
    return;
  }

  // En la colección "Entrega inmediata" las tarjetas usan ese modo.
  const modo = coleccionActual &&
    coleccionActual.tipo === "seccion" &&
    coleccionActual.valor === "entrega-inmediata";

  grid.innerHTML = pagina.map(p => crearCard(p, modo)).join("");
  renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas){
  const cont = $("#paginacion");
  if(!cont) return;
  if(totalPaginas <= 1){ cont.innerHTML = ""; return; }

  let html = `<button type="button" data-pagina="${paginaActual - 1}" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>`;

  let desde = Math.max(1, paginaActual - 2);
  let hasta = Math.min(totalPaginas, desde + 4);
  desde = Math.max(1, hasta - 4);

  for(let i = desde; i <= hasta; i++){
    html += `<button type="button" class="${i === paginaActual ? "activo" : ""}" data-pagina="${i}">${i}</button>`;
  }

  html += `<button type="button" data-pagina="${paginaActual + 1}" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente</button>`;
  cont.innerHTML = html;
}

function cambiarPagina(n){
  paginaActual = n;
  renderColeccion();
  const destino = $("#gridColeccion");
  if(destino) destino.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
// MODAL DE PRODUCTO
// ============================================================

// modoInmediata = se abrió desde el apartado "Entrega inmediata".
// Ahí solo se ofrecen las tallas y colores que hay físicamente.
// Desde el resto del catálogo se ofrecen todas las opciones por encargo.
// sinHistorial = true cuando se abre desde el enlace directo o el botón atrás,
// para no volver a empujar la URL (evita duplicados en el historial).
function abrirProducto(codigo, modoInmediata, sinHistorial){
  const producto = buscarProducto(codigo);
  if(!producto) return;

  productoActual = producto;
  modoInmediataActual = !!modoInmediata && producto.entregaInmediata;
  imagenesActuales = producto.imagenes.length ? producto.imagenes : [producto.imagen];
  indiceImagen = 0;
  tallaSeleccionada = "";
  colorSeleccionado = "";
  cantidadSeleccionada = 1;

  const oferta = ofertaVigente(producto);
  const precio = precioVigente(producto, modoInmediataActual);

  $("#modalMarca").textContent = marcaProducto(producto);
  $("#modalNombre").textContent = nombreProducto(producto);
  $("#modalCodigo").textContent = "Código: " + producto.codigo;

  // Si hay promoción se muestra el precio anterior tachado y el descuento.
  // Al vencer la fecha vuelve solo al precio normal.
  const enOferta = oferta && !modoInmediataActual;
  $("#modalPrecio").innerHTML = enOferta
    ? `<span class="actual">${formatoPrecio(precio)}</span>
       <span class="antes">${formatoPrecio(producto.precio)}</span>
       <span class="desc">-${porcentajeDescuento(producto)}%</span>`
    : `<span class="actual">${formatoPrecio(precio)}</span>`;

  const promo = enOferta ? nombrePromocion(producto) : "";
  $("#modalPromocion").innerHTML = promo
    ? `<div class="promo-activa">
         <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.4L12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>
         ${esc(promo)}
       </div>`
    : "";

  // El abono del 50% solo aplica a pedidos por encargo.
  // En entrega inmediata se paga completo al recibir, sin abono previo.
  $("#modalAbono").innerHTML = modoInmediataActual
    ? `Disponible ahora, sin abono previo.`
    : `Abono para confirmar: <strong>${formatoPrecio(Math.round(precio * 0.5))}</strong> (50%)`;

  // Disponibilidad según el contexto
  $("#modalDisponibilidad").innerHTML = modoInmediataActual
    ? `<div class="disponibilidad inmediata">Entrega inmediata</div>`
    : `<div class="disponibilidad encargo">Disponible por encargo</div>`;

  // Fecha estimada de entrega (solo para pedidos por encargo).
  $("#modalEntrega").innerHTML = modoInmediataActual
    ? ""
    : `<div class="entrega-estim">
         <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
         <span>${textoEntregaEstimada()}</span>
       </div>`;

  // Vistas (se llena cuando Supabase responde)
  $("#modalVistas").textContent = "";

  // Etiquetas
  let etiquetas = "";
  if(esNuevo(producto)) etiquetas += `<span class="etiqueta nuevo">Nuevo</span>`;
  etiquetasActivas(producto).forEach(e => {
    etiquetas += `<span class="etiqueta ${e.color}">${esc(e.texto)}</span>`;
  });
  if(modoInmediataActual && producto.cantidadDisponible)
    etiquetas += `<span class="etiqueta inmediata">${producto.cantidadDisponible} disponibles</span>`;
  $("#modalEtiquetas").innerHTML = etiquetas;

  // Si el producto tiene stock pero se abrió desde el catálogo, se avisa
  // que hay unidades listas, con acceso directo al apartado.
  $("#modalAvisoInmediata").innerHTML =
    (!modoInmediataActual && producto.entregaInmediata)
      ? `<button class="aviso-inmediata" type="button" data-ver-inmediata="${esc(producto.codigo)}">
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
           <span>Hay unidades listas para entrega inmediata en
           ${esc(producto.tallasEntregaInmediata.join(", "))}${
             producto.coloresEntregaInmediata.length
               ? " · " + esc(producto.coloresEntregaInmediata.join(", ")) : ""
           }. Verlas</span>
         </button>`
      : "";

  renderGaleria();
  renderSelectores(producto);
  renderAcordeon(producto);
  actualizarFavModal();
  $("#cantidadValor").textContent = "1";

  pintarFila("#filaRelacionados", relacionados(producto));

  $("#modal").classList.add("activo");
  document.body.classList.add("sin-scroll");
  $("#modalCerrar").focus();

  // Cambia la URL a este producto para poder compartir el enlace directo.
  // Ej: hauslineshopni.es/?producto=KAW002
  if(!sinHistorial){
    try{ history.pushState({ producto: producto.codigo }, "", "?producto=" + encodeURIComponent(producto.codigo)); }catch(e){}
  }

  registrarVisto(producto.codigo);
  renderVistos();

  // Registra la visualización REAL (Supabase) y muestra el total.
  mostrarVistas(producto.codigo);
}

// Muestra "👁 N visualizaciones" y registra la vista al abrir.
function mostrarVistas(codigo){
  const cont = $("#modalVistas");
  if(!cont) return;
  cont.textContent = "";
  if(typeof hlRegistrarVista !== "function" || !HL_VIEWS.activo){ return; }
  hlRegistrarVista(codigo).then(total => {
    if(total != null && productoActual && productoActual.codigo === codigo){
      cont.innerHTML = `<span class="ojo">👁</span> ${Number(total).toLocaleString("en-US")} visualizaciones`;
    }
  });
}

function relacionados(producto){
  const mismaMarca = productos.filter(p =>
    p.codigo !== producto.codigo && p.marca && p.marca === producto.marca);
  const mismaCategoria = productos.filter(p =>
    p.codigo !== producto.codigo && p.categoria === producto.categoria);
  const juntos = [...mismaMarca, ...mismaCategoria];
  const unicos = [];
  const vistos = new Set();
  juntos.forEach(p => {
    if(!vistos.has(p.codigo)){ vistos.add(p.codigo); unicos.push(p); }
  });
  return unicos.slice(0, 12);
}

function renderGaleria(){
  const img = $("#modalImg");
  const claseBase = productoActual.imagenFit === "contain" ? "ajuste-contain" : "";
  const nuevaSrc = imagenesActuales[indiceImagen];

  // Transición suave entre fotos: se desvanece, cambia y vuelve a aparecer.
  if(img.src && !img.src.endsWith(nuevaSrc) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    img.style.opacity = "0";
    setTimeout(() => {
      img.src = nuevaSrc;
      img.className = claseBase;
      img.onload = () => { img.style.opacity = "1"; };
    }, 130);
  } else {
    img.src = nuevaSrc;
    img.style.opacity = "1";
    img.className = claseBase;
  }
  img.alt = nombreProducto(productoActual);

  const varias = imagenesActuales.length > 1;
  $("#galeriaPrev").style.display = varias ? "flex" : "none";
  $("#galeriaNext").style.display = varias ? "flex" : "none";
  $("#galeriaContador").textContent = varias
    ? `${indiceImagen + 1} / ${imagenesActuales.length}` : "";

  $("#miniaturas").innerHTML = varias
    ? imagenesActuales.map((src, i) => `
        <button class="miniatura ${i === indiceImagen ? "activa" : ""}" type="button"
                data-miniatura="${i}" aria-label="Ver imagen ${i + 1}">
          <img src="${esc(src)}" alt="" loading="lazy">
        </button>`).join("")
    : "";
}

function cambiarImagen(delta){
  if(imagenesActuales.length <= 1) return;
  indiceImagen = (indiceImagen + delta + imagenesActuales.length) % imagenesActuales.length;
  renderGaleria();
}

function renderSelectores(producto){
  // Tallas: en el apartado de entrega inmediata solo las que hay en stock;
  // en el catálogo normal todas, porque se piden por encargo.
  const tallas = tallasDisponibles(producto, modoInmediataActual);
  const selTallas = $("#selectorTallas");
  if(tallas.length){
    selTallas.hidden = false;
    selTallas.classList.remove("error");
    $("#opcionesTallas").innerHTML = tallas
      .map(t => `<button class="opcion" type="button" data-talla="${esc(t)}">${esc(t)}</button>`).join("");
    $("#tallasNota").textContent = modoInmediataActual
      ? "Disponibles ahora, listas para entrega"
      : "Bajo encargo · 15 a 25 días hábiles";
  } else {
    selTallas.hidden = true;
    $("#opcionesTallas").innerHTML = "";
  }

  // Colores — solo si el producto realmente tiene colores.
  const colores = coloresDisponibles(producto, modoInmediataActual);
  const selColores = $("#selectorColores");
  if(colores.length){
    selColores.hidden = false;
    selColores.classList.remove("error");
    $("#opcionesColores").innerHTML = colores
      .map(c => `<button class="opcion" type="button" data-color="${esc(c)}">${esc(c)}</button>`).join("");
  } else {
    selColores.hidden = true;
    $("#opcionesColores").innerHTML = "";
  }
}

function renderAcordeon(producto){
  const secciones = [];
  const descripcion = descripcionProducto(producto);

  if(descripcion){
    secciones.push({ titulo: "Descripción", cuerpo: `<p>${esc(descripcion)}</p>` });
  }

  const detalles = [];
  detalles.push(`Código: ${esc(producto.codigo)}`);
  if(producto.marca) detalles.push(`Marca: ${esc(producto.marca)}`);
  detalles.push(`Categoría: ${esc(producto.categoria)}`);
  detalles.push(modoInmediataActual ? "Entrega inmediata" : "Disponible por encargo");
  if(producto.envioRapido) detalles.push("Envío rápido");
  secciones.push({ titulo: "Detalles", cuerpo: `<ul>${detalles.map(d => `<li>${d}</li>`).join("")}</ul>` });

  const tallas = tallasDisponibles(producto, modoInmediataActual);
  if(tallas.length){
    secciones.push({
      titulo: "Tallas disponibles",
      cuerpo: `<p>${tallas.map(esc).join(" · ")}</p>` +
        (modoInmediataActual
          ? `<p>Estas son las tallas que hay físicamente ahora mismo.</p>`
          : (producto.entregaInmediata
              ? `<p>Todas se piden por encargo. Algunas tallas están disponibles para entrega inmediata.</p>`
              : ""))
    });
  }

  secciones.push({ titulo: "Condiciones de compra", cuerpo: `<ul>${POLITICAS.condiciones.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` });
  secciones.push({ titulo: "Tiempo de entrega",     cuerpo: `<ul>${POLITICAS.entrega.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` });
  secciones.push({ titulo: "Garantía",              cuerpo: `<ul>${POLITICAS.garantia.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` });

  $("#acordeon").innerHTML = secciones.map((s, i) => `
    <div class="acordeon-item ${i === 0 ? "abierto" : ""}">
      <button class="acordeon-btn" type="button">
        ${esc(s.titulo)}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="acordeon-cuerpo">${s.cuerpo}</div>
    </div>`).join("");
}

// ============================================================
// GUÍA DE TALLAS
// ============================================================

function abrirGuiaTallas(){
  if(!productoActual) return;
  const guia = guiaParaProducto(productoActual);
  if(!guia) return;

  $("#guiaTitulo").textContent = guia.titulo;
  $("#guiaNota").textContent = guia.nota;

  // Se resalta la talla que el cliente tenga seleccionada.
  const filas = guia.filas.map(fila => {
    const coincide = tallaSeleccionada &&
      fila.some(celda => String(celda).trim() === String(tallaSeleccionada).trim());
    return `<tr class="${coincide ? "destacada" : ""}">
      ${fila.map(c => `<td>${esc(c)}</td>`).join("")}
    </tr>`;
  }).join("");

  $("#guiaTabla").innerHTML = `
    <thead><tr>${guia.columnas.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${filas}</tbody>`;

  $("#guiaFondo").classList.add("activo");
}

function cerrarGuiaTallas(){
  $("#guiaFondo").classList.remove("activo");
}

$("#btnGuiaTallas").addEventListener("click", abrirGuiaTallas);
$("#guiaCerrar").addEventListener("click", cerrarGuiaTallas);
$("#guiaFondo").addEventListener("click", e => {
  if(e.target.id === "guiaFondo") cerrarGuiaTallas();
});

function cerrarModal(sinHistorial){
  $("#modal").classList.remove("activo");
  document.body.classList.remove("sin-scroll");
  productoActual = null;
  // Quita el ?producto= de la URL al cerrar.
  if(!sinHistorial && location.search.includes("producto=")){
    try{ history.pushState({}, "", location.pathname); }catch(e){}
  }
}

// Botón atrás del teléfono / navegador: abre o cierra el producto según la URL.
window.addEventListener("popstate", () => {
  const codigo = new URLSearchParams(location.search).get("producto");
  if(codigo){
    abrirProducto(codigo, false, true);
  } else if($("#modal").classList.contains("activo")){
    cerrarModal(true);
  }
});

// Enlace directo del producto actual.
function urlProducto(codigo){
  return location.origin + location.pathname + "?producto=" + encodeURIComponent(codigo);
}

// Abre el panel de compartir (WhatsApp, Facebook, Telegram, copiar, sistema).
async function compartirProducto(){
  if(!productoActual) return;
  const url = urlProducto(productoActual.codigo);
  const titulo = nombreProducto(productoActual) + " · HAUSLINE";

  // En celular: menú nativo del teléfono (WhatsApp, Instagram, etc.)
  if(navigator.share){
    try{ await navigator.share({ title: titulo, text: titulo, url }); return; }
    catch(e){ if(e && e.name === "AbortError") return; }
  }
  // En computadora / sin menú nativo: panel con opciones.
  abrirPanelCompartir(titulo, url);
}

function abrirPanelCompartir(titulo, url){
  const texto = encodeURIComponent(titulo + " ");
  const u = encodeURIComponent(url);
  $("#compartirOpciones").innerHTML = `
    <a class="compartir-op" href="https://wa.me/?text=${texto}${u}" target="_blank" rel="noopener noreferrer">
      <span class="ic wa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg></span>
      WhatsApp
    </a>
    <a class="compartir-op" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener noreferrer">
      <span class="ic fb"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8a1 1 0 0 1 1-1z" fill="currentColor" stroke="none"/></svg></span>
      Facebook
    </a>
    <a class="compartir-op" href="https://t.me/share/url?url=${u}&text=${texto}" target="_blank" rel="noopener noreferrer">
      <span class="ic tg"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4L3 11l5 2 2 6 3-4 4 3z"/></svg></span>
      Telegram
    </a>
    <button class="compartir-op" type="button" data-copiar="${esc(url)}">
      <span class="ic cp"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></span>
      Copiar enlace
    </button>`;
  $("#compartirFondo").classList.add("activo");
}

function cerrarPanelCompartir(){
  $("#compartirFondo").classList.remove("activo");
}

function actualizarFavModal(){
  if(!productoActual) return;
  const activo = esFavorito(productoActual.codigo);
  const btn = $("#btnFavModal");
  btn.classList.toggle("activo", activo);
  btn.setAttribute("aria-label", activo ? "Quitar de favoritos" : "Guardar en favoritos");
}

// Valida talla y color antes de agregar al carrito o pedir por WhatsApp.
function validarSeleccion(){
  let ok = true;

  const selTallas = $("#selectorTallas");
  if(!selTallas.hidden && !tallaSeleccionada){
    selTallas.classList.add("error");
    ok = false;
  }

  const selColores = $("#selectorColores");
  if(!selColores.hidden && !colorSeleccionado){
    selColores.classList.add("error");
    ok = false;
  }

  if(!ok) mostrarAviso("Falta seleccionar una opción");
  return ok;
}

function itemDesdeProducto(){
  return {
    codigo: productoActual.codigo,
    nombre: nombreProducto(productoActual),
    marca: productoActual.marca || "",
    categoria: productoActual.categoria,
    imagen: productoActual.imagen,
    talla: tallaSeleccionada,
    color: colorSeleccionado,
    precioUnitario: precioVigente(productoActual, modoInmediataActual),
    envioRapido: productoActual.envioRapido,
    // Solo cuenta como entrega inmediata si se pidió desde ese apartado.
    entregaInmediata: modoInmediataActual
  };
}

// Mensaje de WhatsApp para un solo producto (botón individual).
function pedirProductoWhatsApp(){
  if(!productoActual || !validarSeleccion()) return;

  const precio = precioVigente(productoActual, modoInmediataActual);
  const subtotal = precio * cantidadSeleccionada;

  // El encabezado y el cierre cambian según sea entrega inmediata o encargo.
  let msg = modoInmediataActual
    ? "Hola, quiero este producto de entrega inmediata en HAUSLINE:\n\n"
    : "Hola, quiero encargar este producto en HAUSLINE:\n\n";
  msg += `CÓDIGO: ${productoActual.codigo}\n`;
  msg += `Producto: ${nombreProducto(productoActual)}\n`;
  if(productoActual.marca) msg += `Marca: ${productoActual.marca}\n`;
  if(tallaSeleccionada) msg += `Talla: ${tallaSeleccionada}\n`;
  if(colorSeleccionado) msg += `Color: ${colorSeleccionado}\n`;
  msg += `Cantidad: ${cantidadSeleccionada}\n`;
  msg += `Precio unitario: ${precioUSD(precio)}\n`;
  msg += `Subtotal: ${precioUSD(subtotal)} (${precioNIO(subtotal)})\n`;
  msg += modoInmediataActual ? "Entrega inmediata: sí\n" : "Disponible por encargo\n";
  if(productoActual.envioRapido) msg += "Envío rápido: sí\n";

  // El abono del 50% solo se pide en los pedidos por encargo.
  if(modoInmediataActual){
    msg += `\nQuedo atento para coordinar la entrega.`;
  } else {
    msg += `\nAbono para confirmar (50%): ${precioUSD(Math.round(subtotal * 0.5))}\n\n`;
    msg += "Quedo atento para confirmar disponibilidad y realizar el abono.";
  }

  window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank");
}

// ============================================================
// PANELES (carrito / favoritos)
// ============================================================

function abrirPanel(id){
  $("#panelFondo").classList.add("activo");
  const panel = $(id);
  panel.classList.add("activo");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("sin-scroll");
}

function cerrarPaneles(){
  $("#panelFondo").classList.remove("activo");
  $$(".panel").forEach(p => {
    p.classList.remove("activo");
    p.setAttribute("aria-hidden", "true");
  });
  if(!$("#modal").classList.contains("activo")){
    document.body.classList.remove("sin-scroll");
  }
}

function renderCarrito(){
  const items = leerCarrito();
  const cuerpo = $("#carritoCuerpo");
  const pie = $("#carritoPie");

  if(!items.length){
    cuerpo.innerHTML = `
      <div class="panel-vacio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        Tu carrito está vacío
      </div>`;
    pie.hidden = true;
    return;
  }

  cuerpo.innerHTML = items.map(it => {
    const clave = claveVariante(it.codigo, it.talla, it.color);
    const meta = [it.codigo, it.talla && `Talla ${it.talla}`, it.color]
      .filter(Boolean).join(" · ");
    return `
      <div class="linea">
        <div class="linea-img"><img src="${esc(it.imagen)}" alt="" loading="lazy"></div>
        <div class="linea-info">
          <div class="linea-nombre">${esc(it.nombre)}</div>
          <div class="linea-meta">${esc(meta)}</div>
          <div class="linea-pie">
            <div class="cantidad">
              <button type="button" data-cantidad="${esc(clave)}" data-delta="-1" aria-label="Reducir cantidad">−</button>
              <span>${it.cantidad}</span>
              <button type="button" data-cantidad="${esc(clave)}" data-delta="1" aria-label="Aumentar cantidad">+</button>
            </div>
            <span class="linea-subtotal">${formatoPrecio(subtotalItem(it))}</span>
          </div>
          <button class="btn-quitar" type="button" data-quitar="${esc(clave)}">Eliminar</button>
        </div>
      </div>`;
  }).join("");

  $("#carritoTotal").textContent = formatoPrecio(totalCarrito());

  // La nota del abono se adapta a lo que haya en el carrito.
  const hayEncargo = items.some(i => !i.entregaInmediata);
  const hayInmediata = items.some(i => i.entregaInmediata);
  let nota;
  if(hayEncargo && hayInmediata){
    nota = "El abono del 50% aplica solo a los productos por encargo. Los de entrega inmediata se pagan al recibir.";
  } else if(hayEncargo){
    nota = "Se confirma con un abono del 50%. El total puede variar según disponibilidad.";
  } else {
    nota = "Productos disponibles ahora. Se pagan al momento de la entrega, sin abono previo.";
  }
  $("#carritoNota").textContent = nota;
  pie.hidden = false;
}

function renderFavoritos(){
  const favs = productosFavoritos();
  const cuerpo = $("#favoritosCuerpo");

  if(!favs.length){
    cuerpo.innerHTML = `
      <div class="panel-vacio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        Todavía no tienes favoritos
      </div>`;
    return;
  }

  cuerpo.innerHTML = favs.map(p => `
    <div class="linea">
      <div class="linea-img"><img src="${esc(p.imagen)}" alt="" loading="lazy"></div>
      <div class="linea-info">
        <div class="linea-nombre">${esc(nombreProducto(p))}</div>
        <div class="linea-meta">${esc(p.codigo)} · ${esc(marcaProducto(p))}</div>
        <div class="linea-pie">
          <button class="btn-secundario" style="height:34px;margin:0;width:auto;padding:0 14px;"
                  type="button" data-codigo="${esc(p.codigo)}">Ver producto</button>
          <span class="linea-subtotal">${formatoPrecio(precioVigente(p))}</span>
        </div>
        <button class="btn-quitar" type="button" data-fav="${esc(p.codigo)}">Quitar de favoritos</button>
      </div>
    </div>`).join("");
}

// ============================================================
// EVENTOS
// ============================================================

// --- Delegación general de clics ---
document.addEventListener("click", e => {

  // Abrir producto desde una tarjeta.
  // Si la tarjeta viene del apartado de entrega inmediata se abre en ese modo.
  const card = e.target.closest(".card");
  if(card && !e.target.closest("[data-fav]")){
    abrirProducto(card.dataset.codigo, card.dataset.modo === "inmediata");
    return;
  }

  // Desde el catálogo, ir a ver las unidades en entrega inmediata
  const verInmediata = e.target.closest("[data-ver-inmediata]");
  if(verInmediata){
    abrirProducto(verInmediata.dataset.verInmediata, true);
    return;
  }

  // Botón "Ver producto" (favoritos, editorial, banners)
  const verProducto = e.target.closest("[data-codigo]");
  if(verProducto && !verProducto.closest(".card")){
    cerrarPaneles();
    abrirProducto(verProducto.dataset.codigo);
    return;
  }

  // Favorito
  const fav = e.target.closest("[data-fav]");
  if(fav){
    e.stopPropagation();
    const activo = alternarFavorito(fav.dataset.fav);
    fav.classList.toggle("activo", activo);
    fav.classList.add("late");
    setTimeout(() => fav.classList.remove("late"), 360);
    mostrarAviso(activo ? "Guardado en favoritos" : "Quitado de favoritos");
    animarContador("[data-contador-favoritos]");
    if($("#panelFavoritos").classList.contains("activo")) renderFavoritos();
    if(productoActual) actualizarFavModal();
    return;
  }

  // Ir al inicio
  if(e.target.closest("[data-ir-inicio]")){
    e.preventDefault();
    irInicio();
    cerrarMenu();
    return;
  }

  // Abrir colección por categoría
  const cat = e.target.closest("[data-categoria]");
  if(cat){
    e.preventDefault();
    abrirColeccion("categoria", cat.dataset.categoria, cat.dataset.categoria);
    cerrarMenu();
    return;
  }

  // Abrir colección por marca
  const marca = e.target.closest("[data-marca]");
  if(marca){
    e.preventDefault();
    abrirColeccion("marca", marca.dataset.marca, marca.dataset.marca);
    cerrarMenu();
    return;
  }

  // Colecciones especiales
  const col = e.target.closest("[data-coleccion]");
  if(col){
    e.preventDefault();
    const valor = col.dataset.coleccion;
    const titulos = {
      "tendencia": "Sneakers en tendencia",
      "populares": "Más populares",
      "nuevos": "Nuevo en HAUSLINE",
      "ofertas": "Ofertas",
      "entrega-inmediata": "Entrega inmediata",
      "favoritos": "Tus favoritos",
      "vistos": "Vistos recientemente",
      "marcas": "Marcas"
    };
    if(valor === "marcas"){
      irInicio();
      renderMarcas();
      $("#filaMarcas").scrollIntoView({ behavior:"smooth", block:"center" });
      cerrarMenu();
      return;
    }
    abrirColeccion("seccion", valor, titulos[valor] || "Catálogo");
    cerrarMenu();
    cerrarPaneles();
    return;
  }

  // Paginación
  const pag = e.target.closest("[data-pagina]");
  if(pag && !pag.disabled){
    cambiarPagina(Number(pag.dataset.pagina));
    return;
  }

  // Filtros rápidos
  const filtro = e.target.closest("[data-filtro]");
  if(filtro){
    const f = filtro.dataset.filtro;
    if(filtrosActivos.has(f)) filtrosActivos.delete(f);
    else filtrosActivos.add(f);
    filtro.classList.toggle("activo", filtrosActivos.has(f));
    paginaActual = 1;
    renderColeccion();
    return;
  }

  // Banners
  const punto = e.target.closest("[data-banner-punto]");
  if(punto){ moverBanner(Number(punto.dataset.bannerPunto)); return; }

  const btnBanner = e.target.closest("[data-banner-codigo]");
  if(btnBanner){
    const codigo = btnBanner.dataset.bannerCodigo;
    const producto = codigo ? buscarProducto(codigo) : null;
    if(producto){ abrirProducto(producto.codigo); return; }
    const enlace = btnBanner.dataset.bannerEnlace;
    if(enlace === "#entrega-inmediata"){
      abrirColeccion("seccion", "entrega-inmediata", "Entrega inmediata");
    } else {
      abrirColeccion("categoria", "Zapatos", "Zapatos");
    }
    return;
  }

  // Miniaturas de la galería
  const mini = e.target.closest("[data-miniatura]");
  if(mini){
    indiceImagen = Number(mini.dataset.miniatura);
    renderGaleria();
    return;
  }

  // Tallas
  const talla = e.target.closest("[data-talla]");
  if(talla){
    $$("#opcionesTallas .opcion").forEach(b => b.classList.remove("activa"));
    talla.classList.add("activa");
    tallaSeleccionada = talla.dataset.talla;
    $("#selectorTallas").classList.remove("error");
    return;
  }

  // Colores
  const color = e.target.closest("[data-color]");
  if(color){
    $$("#opcionesColores .opcion").forEach(b => b.classList.remove("activa"));
    color.classList.add("activa");
    colorSeleccionado = color.dataset.color;
    $("#selectorColores").classList.remove("error");
    return;
  }

  // Acordeón
  const acordeon = e.target.closest(".acordeon-btn");
  if(acordeon){
    acordeon.parentElement.classList.toggle("abierto");
    return;
  }

  // Cantidad en el carrito
  const btnCant = e.target.closest("[data-cantidad]");
  if(btnCant){
    cambiarCantidad(btnCant.dataset.cantidad, Number(btnCant.dataset.delta));
    renderCarrito();
    return;
  }

  // Quitar del carrito
  const quitar = e.target.closest("[data-quitar]");
  if(quitar){
    eliminarDelCarrito(quitar.dataset.quitar);
    renderCarrito();
    mostrarAviso("Producto eliminado");
    return;
  }

  // Cerrar paneles
  if(e.target.closest("[data-cerrar-panel]") || e.target.id === "panelFondo"){
    cerrarPaneles();
    return;
  }

  // Copiar enlace (panel de compartir)
  const copiar = e.target.closest("[data-copiar]");
  if(copiar){
    const url = copiar.dataset.copiar;
    (async () => {
      try{ await navigator.clipboard.writeText(url); mostrarAviso("Enlace copiado"); }
      catch(err){ prompt("Copia el enlace:", url); }
    })();
    cerrarPanelCompartir();
    return;
  }

  // Enlaces informativos del footer
  const info = e.target.closest("[data-info]");
  if(info){
    e.preventDefault();
    const clave = info.dataset.info;
    const titulos = { condiciones:"Condiciones de compra", entrega:"Tiempo de entrega", garantia:"Garantía" };
    alert(titulos[clave] + "\n\n• " + POLITICAS[clave].join("\n• "));
    return;
  }
});

// --- Menú lateral ---
function abrirMenu(){
  $("#menuLateral").classList.add("activo");
  $("#menuFondo").classList.add("activo");
  $("#menuToggle").setAttribute("aria-expanded", "true");
  document.body.classList.add("sin-scroll");
  $("#menuCerrar").focus();
}

function cerrarMenu(){
  $("#menuLateral").classList.remove("activo");
  $("#menuFondo").classList.remove("activo");
  $("#menuToggle").setAttribute("aria-expanded", "false");
  if(!$("#modal").classList.contains("activo")) document.body.classList.remove("sin-scroll");
}

$("#menuToggle").addEventListener("click", abrirMenu);
$("#menuCerrar").addEventListener("click", cerrarMenu);
$("#menuFondo").addEventListener("click", cerrarMenu);

// --- Cabecera: carrito y favoritos ---
$("#btnCarrito").addEventListener("click", () => { renderCarrito(); abrirPanel("#panelCarrito"); });
$("#btnFavoritos").addEventListener("click", () => { renderFavoritos(); abrirPanel("#panelFavoritos"); });
$("#navCarrito").addEventListener("click", () => { renderCarrito(); abrirPanel("#panelCarrito"); });
$("#navFavoritos").addEventListener("click", () => { renderFavoritos(); abrirPanel("#panelFavoritos"); });
$("#navCategorias").addEventListener("click", abrirMenu);

// --- Modal ---
$("#modalCerrar").addEventListener("click", cerrarModal);
$("#modal").addEventListener("click", e => { if(e.target.id === "modal") cerrarModal(); });
$("#galeriaPrev").addEventListener("click", () => cambiarImagen(-1));
$("#galeriaNext").addEventListener("click", () => cambiarImagen(1));

// Deslizamiento táctil en la galería
(function swipeGaleria(){
  const zona = $("#galeriaPrincipal");
  let x0 = null;
  zona.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive:true });
  zona.addEventListener("touchend", e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 45) cambiarImagen(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive:true });
})();

// Cantidad en el modal
$("#cantidadMenos").addEventListener("click", () => {
  cantidadSeleccionada = Math.max(1, cantidadSeleccionada - 1);
  $("#cantidadValor").textContent = cantidadSeleccionada;
});
$("#cantidadMas").addEventListener("click", () => {
  cantidadSeleccionada++;
  $("#cantidadValor").textContent = cantidadSeleccionada;
});

// Agregar al carrito
$("#btnAgregarCarrito").addEventListener("click", () => {
  if(!productoActual || !validarSeleccion()) return;
  agregarAlCarrito(itemDesdeProducto(), cantidadSeleccionada);
  animarContador("[data-contador-carrito]");
  mostrarAviso("Agregado al carrito");
});

// Encargar por WhatsApp (producto individual)
$("#btnWhatsappProducto").addEventListener("click", pedirProductoWhatsApp);

// Favorito en el modal
$("#btnFavModal").addEventListener("click", () => {
  if(!productoActual) return;
  const activo = alternarFavorito(productoActual.codigo);
  actualizarFavModal();
  animarContador("[data-contador-favoritos]");
  mostrarAviso(activo ? "Guardado en favoritos" : "Quitado de favoritos");
  // Refresca el corazón de la tarjeta correspondiente
  $$(`[data-fav="${productoActual.codigo}"]`).forEach(b => b.classList.toggle("activo", activo));
});

// Compartir producto (enlace directo)
$("#btnCompartir").addEventListener("click", compartirProducto);

// --- Carrito: acciones del pie ---
$("#btnEnviarPedido").addEventListener("click", enviarPedidoWhatsApp);
$("#btnVaciarCarrito").addEventListener("click", () => {
  vaciarCarrito();
  renderCarrito();
  mostrarAviso("Carrito vaciado");
});

// ============================================================
// CONVERSOR DE MONEDA (USD ⇄ C$)
// ============================================================
function actualizarBotonesMoneda(){
  $$("[data-moneda]").forEach(b => b.classList.toggle("activo", b.dataset.moneda === monedaActual));
}

// Vuelve a pintar todo lo que muestra precios, para que cambie la moneda.
function repintarPrecios(){
  renderInicio();
  actualizarAccesosOfertas();
  renderTendencias();
  if(estadoVista === "coleccion") renderColeccion();

  // Si hay un producto abierto, reabrirlo pero CONSERVANDO la selección.
  if(productoActual){
    const t = tallaSeleccionada, c = colorSeleccionado, cant = cantidadSeleccionada;
    const codigo = productoActual.codigo, modo = modoInmediataActual;
    abrirProducto(codigo, modo, true);
    tallaSeleccionada = t; colorSeleccionado = c; cantidadSeleccionada = cant;
    $("#cantidadValor").textContent = cant;
    if(t) $$("#opcionesTallas .opcion").forEach(b => b.classList.toggle("activa", b.dataset.talla === t));
    if(c) $$("#opcionesColores .opcion").forEach(b => b.classList.toggle("activa", b.dataset.color === c));
  }

  if($("#panelCarrito").classList.contains("activo")) renderCarrito();
}

function cambiarMoneda(m){
  if(m !== "USD" && m !== "NIO") return;
  monedaActual = m;
  try{ localStorage.setItem("hausline_moneda", m); }catch(e){}
  actualizarBotonesMoneda();
  repintarPrecios();
}

$$("[data-moneda]").forEach(b => b.addEventListener("click", () => cambiarMoneda(b.dataset.moneda)));
actualizarBotonesMoneda();

// ============================================================
// COMPARTIR (panel de escritorio) + COPIAR
// ============================================================
$("#compartirFondo")?.addEventListener("click", e => {
  if(e.target.id === "compartirFondo" || e.target.closest("[data-cerrar-compartir]")) cerrarPanelCompartir();
});

// ============================================================
// BOTÓN VOLVER ARRIBA
// ============================================================
(function volverArriba(){
  const btn = $("#volverArriba");
  if(!btn) return;
  let visible = false;
  window.addEventListener("scroll", () => {
    const debe = window.scrollY > 600;
    if(debe !== visible){
      visible = debe;
      btn.classList.toggle("visible", debe);
    }
  }, { passive:true });
  btn.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));
})();

// ============================================================
// SOLICITAR COTIZACIÓN (por WhatsApp)
// ============================================================
$("#btnCotizar")?.addEventListener("click", () => {
  const prod = ($("#cotProducto")?.value || "").trim();
  const marca = ($("#cotMarca")?.value || "").trim();
  const talla = ($("#cotTalla")?.value || "").trim();
  const cant = ($("#cotCantidad")?.value || "").trim();

  let msg = "Hola Hausline 👋\n\nQuiero solicitar una cotización.\n\n";
  msg += `Producto: ${prod}\n`;
  msg += `Marca: ${marca}\n`;
  msg += `Talla: ${talla}\n`;
  msg += `Cantidad: ${cant}\n\n`;
  msg += "Adjuntaré la fotografía o el enlace del producto en este chat.";

  window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank");
});

// --- Búsqueda ---
function manejarBusqueda(valor){
  textoBusqueda = valor;
  paginaActual = 1;
  if(!valor.trim()){
    if(coleccionActual && coleccionActual.tipo === "busqueda") irInicio();
    return;
  }
  if(estadoVista !== "coleccion" || (coleccionActual && coleccionActual.tipo !== "busqueda")){
    abrirColeccion("busqueda", "", `Resultados para "${valor}"`);
  } else {
    $("#coleccionTitulo").textContent = `Resultados para "${valor}"`;
    renderColeccion();
  }
}

let busquedaTimer = null;
["#buscador", "#buscadorMovil"].forEach(sel => {
  const input = $(sel);
  if(!input) return;
  input.addEventListener("input", e => {
    const valor = e.target.value;
    // Mantiene ambos buscadores sincronizados
    ["#buscador", "#buscadorMovil"].forEach(otro => {
      if(otro !== sel && $(otro)) $(otro).value = valor;
    });
    clearTimeout(busquedaTimer);
    busquedaTimer = setTimeout(() => manejarBusqueda(valor), 220);
  });
});

// --- Filtros de la colección ---
$("#selectOrden").addEventListener("change", e => {
  ordenActual = e.target.value;
  paginaActual = 1;
  renderColeccion();
});
$("#selectMarca").addEventListener("change", e => {
  filtroMarca = e.target.value;
  paginaActual = 1;
  renderColeccion();
});
$("#selectPrecio").addEventListener("change", e => {
  filtroPrecio = e.target.value;
  paginaActual = 1;
  renderColeccion();
});

// --- Teclado ---
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){
    if($("#compartirFondo").classList.contains("activo")) cerrarPanelCompartir();
    else if($("#guiaFondo").classList.contains("activo")) cerrarGuiaTallas();
    else if($("#modal").classList.contains("activo")) cerrarModal();
    else if($$(".panel.activo").length) cerrarPaneles();
    else if($("#menuLateral").classList.contains("activo")) cerrarMenu();
  }
  if($("#modal").classList.contains("activo")){
    if(e.key === "ArrowLeft") cambiarImagen(-1);
    if(e.key === "ArrowRight") cambiarImagen(1);
  }
});

// --- Reajuste de paginación al cambiar el tamaño ---
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if(estadoVista === "coleccion") renderColeccion();
  }, 200);
});

// --- Sincronía entre pestañas / cambios de estado ---
document.addEventListener("carrito:cambio", () => {
  if($("#panelCarrito").classList.contains("activo")) renderCarrito();
});

// ============================================================
// ARRANQUE
// ============================================================

function iniciar(){
  $("#anioActual").textContent = new Date().getFullYear();

  renderBanda();
  renderBanners();
  renderChips();
  renderCategoriasVisuales();
  renderInicio();
  actualizarAccesosOfertas();

  actualizarContadorCarrito();
  actualizarContadorFavoritos();

  // Enlace directo: si la URL trae ?producto=CODIGO, abre ese producto.
  // PERO si es una RECARGA (F5), no lo reabre: limpia la URL y muestra el inicio.
  // Así el link compartido sí abre el producto, pero recargar no molesta.
  const directo = new URLSearchParams(location.search).get("producto");
  if(directo && buscarProducto(directo)){
    let esRecarga = false;
    try{
      const nav = performance.getEntriesByType("navigation")[0];
      if(nav) esRecarga = nav.type === "reload";
      else if(performance.navigation) esRecarga = performance.navigation.type === 1;
    }catch(e){}

    if(esRecarga){
      try{ history.replaceState({}, "", location.pathname); }catch(e){}
    } else {
      abrirProducto(directo, false, true);
    }
  }

  // Secciones nuevas y contador real (cuando lleguen las vistas de Supabase).
  renderInstagram();
  renderTiktok();
  document.addEventListener("vistas:listas", () => {
    renderTendencias();
    renderMasVendidos();
  });
  renderTendencias();
  renderMasVendidos();

  console.log(`HAUSLINE · ${productos.length} productos · ${marcasCatalogo.length} marcas`);
}

iniciar();
