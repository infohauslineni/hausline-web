// Clientes y entregas reales de HAUSLINE.
// Para enlazar una foto a Instagram, pega la URL en "instagramUrl".
// Si se deja vacío (""), la foto se muestra igual pero NO es clicable (sin error).
const clientes = [
  { imagen: "imgP/clientes/1.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/2.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/3.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/4.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/5.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/6.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/7.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/8.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/9.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/10.jpeg", instagramUrl: "" }
];

// Fotos editoriales / publicitarias ("Estilo HAUSLINE").
// codigoProducto: código real de un producto para enlazarlo. Si está vacío o no existe,
// el botón se desactiva de forma segura (sin error, sin redirigir a otro producto).
// Cada tarjeta lleva al producto de su codigoProducto.
// Ahora usan fotos de tus Birkenstock. Cuando tengas las fotos de los
// looks (las de los pies con las Boston), guárdalas en imgP/editorial/
// y cambia solo la ruta "imagen". El resto sigue funcionando igual.
const editoriales = [
  {
  imagen: "imgP/ZAPATOS MEN/Birkenstock/BK001/1.jpeg",
  titulo: "El clog del momento",
  subtitulo: "Birkenstock Boston",
  codigoProducto: "BK001",
  textoBoton: "Ver Birkenstock",
  activo: true
},
  {
  imagen: "imgP/ZAPATOS MEN/Birkenstock/BK003/1.jpeg",
  titulo: "Comodidad premium",
  subtitulo: "Ante natural",
  codigoProducto: "BK003",
  textoBoton: "Ver Birkenstock",
  activo: true
},
  {
  imagen: "imgP/ZAPATOS MEN/Birkenstock/BK007/1.jpeg",
  titulo: "Detalle que marca",
  subtitulo: "Boston herrajes",
  codigoProducto: "BK007",
  textoBoton: "Ver Birkenstock",
  activo: true
},
];

// ============================================================
//  LOOKBOOK — banner grande con varias fotos de un mismo estilo
//  Todas las fotos en un solo bloque + botón que lleva a la marca.
//  Para cambiar las fotos, edita la lista "imagenes".
//  "marca" debe coincidir con la marca tal como aparece en la web.
// ============================================================
const lookbook = {
  activo: true,
  titulo: "El estilo Birkenstock",
  subtitulo: "Comodidad que combina con todo tu outfit",
  textoBoton: "Comprar ahora",
  marca: "Birkenstock",
  imagenes: [
    "imgP/clientes/bk1.jpg",
    "imgP/clientes/bk4.jpg",
    "imgP/clientes/bk3.jpg",
    "imgP/clientes/bk2.jpg",
    "imgP/clientes/bk6.png"
  ]
};

// Banners del carrusel principal.
// Guarda tus fotos en imgP/banners/ y escribe la ruta en "imagen".
// Si "imagen" está vacía se muestra un fondo limpio (nunca una imagen rota).
// codigoProducto: si lo llenas, el botón abre ese producto dentro de la web.
// Si el código no existe, el botón cae al catálogo de forma segura.
const banners = [
  {
    // BANNER DE LOS CABALLEROS (foto 2, blanco y negro):
    // 1) Guarda esa foto en:  imgP/banners/caballeros.jpg
    // 2) Cambia activo a true.  Mientras esté en false, no se muestra.
    imagen: "imgP/banners/caballeros.jpg",
    titulo: "Para los que visten distinto",
    subtitulo: "Estilo HAUSLINE",
    textoBoton: "Ver catálogo",
    codigoProducto: "",
    enlace: "#catalogo",
    activo: true
  },
  {
    // IMAGEN DE PRUEBA: reemplázala por tu foto publicitaria.
    // Al poner un codigoProducto, el botón abre ese producto directamente.
    imagen: "imgP/ZAPATOS MEN/Birkenstock/BK007/3.jpeg",
    titulo: "Nueva colección",
    subtitulo: "Estilo que te define",
    textoBoton: "Ver producto",
    codigoProducto: "BK007",
    enlace: "#catalogo",
    activo: true
  },
  {
    imagen: "imgP/ropa/009.4.jfif",
    titulo: "Entrega inmediata",
    subtitulo: "Productos disponibles ahora en Nicaragua",
    textoBoton: "Ver disponibles",
    codigoProducto: "#009R",
    enlace: "#entrega-inmediata",
    activo: true
  },
  {
    imagen: "imgP/clientes/7.jpeg",
    titulo: "Pedidos bajo encargo",
    subtitulo: "Abono del 50% para confirmar tu pedido",
    textoBoton: "Ver catálogo",
    codigoProducto: "",
    enlace: "#catalogo",
    activo: true
  }
];

// Mensajes de la banda infinita. Edítalos libremente.
const mensajesBanda = [
  "Envíos a toda Nicaragua",
  "Pedidos bajo encargo",
  "Abono del 50% para confirmar",
  "Atención personalizada por WhatsApp",
  "Nuevos productos disponibles",
  "Entrega inmediata en productos seleccionados"
];
