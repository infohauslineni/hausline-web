// ============================================================
//                    CATÁLOGO HAUSLINE
// ============================================================
//
//  GUÍA RÁPIDA — qué se edita y dónde
//
//  1) PONER UN PRODUCTO EN ENTREGA INMEDIATA
//     Busca el producto por su código (Ctrl+F, ej: BL001) y
//     agrégale estas líneas antes de la llave de cierre "}":
//
//         entregaInmediata:true,
//         tallasEntregaInmediata:["41","42"],   // solo las que tienes
//         coloresEntregaInmediata:["Negro"],    // opcional
//         cantidadDisponible:2,
//         precioEntregaInmediata:139,           // opcional
//
//  2) QUITARLO DE ENTREGA INMEDIATA (ya se vendió)
//     Cambia una sola palabra:   entregaInmediata:false
//     O borra esas líneas. El producto vuelve a ser solo por
//     encargo con todas sus tallas y colores. No se pierde nada.
//
//  3) PONER UNA PROMOCIÓN
//     Busca más abajo el bloque PROMOCIONES (Ctrl+F "PROMOCIONES").
//     Ahí puedes descontar por marca, por categoría o por códigos.
//     También puedes ponerle precio de oferta a UN producto:
//
//         precioOferta:120,
//         promocionHasta:"2026-12-25T23:59:59",
//
//     La sección "Ofertas" aparece sola cuando hay alguna activa
//     y desaparece sola cuando vencen. No hay que tocar nada más.
//
//  4) ETIQUETAS (Más vendido, Últimas unidades, etc.)
//     Busca ETIQUETAS_OPCIONALES más abajo.
//
//  5) AJUSTAR UNA FOTO QUE SE VE MAL RECORTADA
//         imagenFit:"contain",   // muestra la foto completa
//         escalaImagen:1.15,     // o acércala un poco
//
//  NUNCA cambies el "codigo" de un producto: es el que usas
//  en tu sistema y el que viaja en el pedido de WhatsApp.
//
// ============================================================

const productosBase = [

  {
  codigo:"CL0001",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0001/CL001.jfif",
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"],
 promocionHasta:"",
 
},

{
  codigo:"CL0002",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0002/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0002/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0002/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0002/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0003",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0003/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0003/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0003/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0003/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0003/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0004",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0004/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0004/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0004/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0004/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0004/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0005",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0005/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0005/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0005/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0005/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0005/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0006",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0006/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0006/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0006/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0006/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0006/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0007",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0007/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0007/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0007/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0007/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0007/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0008",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0008/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0008/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0008/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0008/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0008/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0009",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0009/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0009/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0009/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0009/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0009/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0010",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0010/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0010/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0010/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0010/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0010/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0011",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0011/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0011/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0011/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0011/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0011/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0012",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0012/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0012/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0012/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0012/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0012/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0013",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0013/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0013/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0013/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0013/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0013/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0014",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0014/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0014/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0014/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0014/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0014/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0015",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0015/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0015/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0015/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0015/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0015/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0016",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0016/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0016/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0016/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0016/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0016/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0017",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0017/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0017/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0017/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0017/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0017/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0018",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0018/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0018/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0018/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0018/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0018/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0019",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0019/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0019/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0019/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0019/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0019/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0020",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0020/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0020/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0020/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0020/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0020/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0021",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0021/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0021/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0021/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0021/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0021/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0022",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0022/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0022/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0022/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0022/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0022/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0023",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0023/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0023/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0023/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0023/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0023/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0024",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0024/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0024/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0024/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0024/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0024/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0025",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0025/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0025/1.jpeg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0025/2.jpeg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0025/3.jpeg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0025/4.jpeg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0026",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0026/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0026/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0026/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0026/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0026/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0027",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0027/2.jpg",
  imagenes:[
    
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0027/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0027/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0027/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0028",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0028/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0028/1.webp",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0028/2.webp",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0028/3.webp",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0028/4.webp",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0029",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:165,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0029/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0029/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0029/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0029/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0029/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0030",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:165,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0030/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0030/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0030/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0030/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0030/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0031",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:165,
  precioOferta:144,
  descuento:10,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0031/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0031/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0031/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0031/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0031/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0032",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:144,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0032/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0032/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0032/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0032/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0032/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0033",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:144,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0033/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0033/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0033/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0033/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0033/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0034",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:164,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0034/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0034/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0034/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0034/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0034/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0035",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:144,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0035/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0035/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0035/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0035/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0035/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0036",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:144,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0036/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0036/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0036/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0036/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0036/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0037",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:144,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0037/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0037/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0037/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0037/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0037/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0038",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0038/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0038/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0038/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0038/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0038/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0039",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0039/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0039/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0039/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0039/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0039/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0040",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0040/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0040/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0040/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0040/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0040/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0041",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0041/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0041/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0041/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0041/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0041/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0042",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:172,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0042/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0042/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0042/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0042/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0042/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CL0043",
  marca:"Christian Louboutin",
  nombre:"Christian Louboutin",
  precio:160,
  promocionHasta:"2026-07-10T23:59:59",
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Loubutin/CL0043/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Loubutin/CL0043/1.jpg",
     "imgP/ZAPATOS MEN/Christian Loubutin/CL0043/2.jpg",
      "imgP/ZAPATOS MEN/Christian Loubutin/CL0043/3.jpg",
       "imgP/ZAPATOS MEN/Christian Loubutin/CL0043/4.jpg",
  ],
  descripcion:"LOUBOUTIN TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},







{
  codigo:"AM001",
  marca:"ALEAXANDER MCQUEEN",
  nombre:"Alexander MQCUEEN",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Alexander MCqueen/AM001/+.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Alexander MCqueen/AM001/+.jpeg",
     "imgP/ZAPATOS MEN/Alexander MCqueen/AM001/7bb7336a.jpeg",
      "imgP/ZAPATOS MEN/Alexander MCqueen/AM001/96548a9c.jpeg",
       "imgP/ZAPATOS MEN/Alexander MCqueen/AM001/fd4b494a.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AM002",
  marca:"ALEAXANDER MCQUEEN",
  nombre:"Alexander MQCUEEN",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Alexander MCqueen/AM002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Alexander MCqueen/AM002/1.jpeg",
     "imgP/ZAPATOS MEN/Alexander MCqueen/AM002/2.jpeg",
      "imgP/ZAPATOS MEN/Alexander MCqueen/AM002/3.jpeg",
       "imgP/ZAPATOS MEN/Alexander MCqueen/AM002/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AM003",
  marca:"ALEAXANDER MCQUEEN",
  nombre:"Alexander MQCUEEN",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Alexander MCqueen/AM003/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Alexander MCqueen/AM003/1.jpg",
     "imgP/ZAPATOS MEN/Alexander MCqueen/AM003/2.PNG",
      
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AM004",
  marca:"ALEAXANDER MCQUEEN",
  nombre:"Alexander MCQUEEN",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Alexander MCqueen/AM004/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Alexander MCqueen/AM004/1.jpg",
    
      
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},






{
  codigo:"AR001",
  marca:"AMIRI",
  nombre:"AMIRI",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/AMIRI/AR001/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/AMIRI/AR001/1.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR001/2.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR001/3.jpeg",
     "imgP/ZAPATOS MEN/AMIRI/AR001/4.jpeg", 
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AR002",
  marca:"AMIRI",
  nombre:"AMIRI",
  precio:140,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/AMIRI/AR002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/AMIRI/AR002/1.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR002/2.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR002/3.jpeg",
     "imgP/ZAPATOS MEN/AMIRI/AR002/4.jpeg", 
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AR003",
  marca:"AMIRI",
  nombre:"AMIRI",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/AMIRI/AR003/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/AMIRI/AR003/1.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR003/2.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR003/3.jpeg",
     "imgP/ZAPATOS MEN/AMIRI/AR003/4.jpeg", 
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AR004",
  marca:"AMIRI",
  nombre:"AMIRI",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/AMIRI/AR004/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/AMIRI/AR004/1.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR004/2.jpeg",
    "imgP/ZAPATOS MEN/AMIRI/AR004/3.jpeg",
     "imgP/ZAPATOS MEN/AMIRI/AR004/4.jpeg", 
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"AR005",
  marca:"AMIRI",
  nombre:"AMIRI",
  precio:170,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/AMIRI/AR005/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/AMIRI/AR005/1.webp",
    "imgP/ZAPATOS MEN/AMIRI/AR005/2.webp",
    "imgP/ZAPATOS MEN/AMIRI/AR005/3.webp",
     
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},







{
  codigo:"BL001",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:148,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL001/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL001/1.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL001/2.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL001/3.jpeg",
     "imgP/ZAPATOS MEN/BALENCIAGA/BL001/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"],

  // ---- EJEMPLO DE ENTREGA INMEDIATA (así se configura cualquier producto) ----
  // Borra estas líneas cuando ya no tengas este par en existencia.
  entregaInmediata:false,                       // lo saca en la sección "Entrega inmediata"
  tallasEntregaInmediata:["41","42","43"],     // SOLO estas tallas se podrán pedir
  cantidadDisponible:1,                        // cuántos pares tienes ahora
  precioEntregaInmediata:139,                  // precio especial (opcional)
  envioRapido:false,                            // etiqueta azul "Envío rápido"

  // ---- ETIQUETAS OPCIONALES (ejemplo activado) ----
  // Ver la lista completa en ETIQUETAS_OPCIONALES más abajo.
  ultimasUnidades:false,        // enciende la etiqueta
cantidadDisponible:1,        // este número decide el texto                      // etiqueta roja "Últimas unidades"
},
{
  codigo:"BL002",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:148,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL002/1.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL002/2.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL002/3.jpeg",
     "imgP/ZAPATOS MEN/BALENCIAGA/BL002/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BL003",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:148,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL003/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL003/1.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL003/2.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL003/3.jpeg",
     "imgP/ZAPATOS MEN/BALENCIAGA/BL003/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BL004",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:148,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL004/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL004/1.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL004/2.jpeg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL004/3.jpeg",
     "imgP/ZAPATOS MEN/BALENCIAGA/BL004/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BL005",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:148,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL005/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL005/1.jpg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL005/2.jpg",
    "imgP/ZAPATOS MEN/BALENCIAGA/BL005/3.jpg",
     "imgP/ZAPATOS MEN/BALENCIAGA/BL005/4.jpg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BL006",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:190,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL006/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL006/1.jpeg",
   
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BL007",
  marca:"BALENCIAGA",
  nombre:"BALENCIAGA",
  precio:90,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BALENCIAGA/BL007/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BALENCIAGA/BL007/1.jpeg",
   
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},








{
  codigo:"BK001",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK001/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK001/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK001/2.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK001/3.jpeg",
     "imgP/ZAPATOS MEN/Birkenstock/BK001/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BK002",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK002/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK002/2.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK002/3.jpeg",
     "imgP/ZAPATOS MEN/Birkenstock/BK002/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BK003",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK003/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK003/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK003/2.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK003/3.jpeg",
     "imgP/ZAPATOS MEN/Birkenstock/BK003/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BK004",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK004/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK004/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK004/2.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK004/3.jpeg",
     "imgP/ZAPATOS MEN/Birkenstock/BK004/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BK005",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK005/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK005/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK005/2.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK005/3.jpeg",
     "imgP/ZAPATOS MEN/Birkenstock/BK005/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BK006",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK006/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK006/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK006/2.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK006/3.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK006/4.jpeg"
  ],
  descripcion:"TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},

{
  codigo:"BK007",
  marca:"BIRKENSTOCK",
  nombre:"Birkenstock",
  precio:95,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Birkenstock/BK007/3.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Birkenstock/BK007/3.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK007/1.jpeg",
    "imgP/ZAPATOS MEN/Birkenstock/BK007/2.jpeg"
  ],
  descripcion:"TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},





{
  codigo:"BR001",
  marca:"BURBERRY",
  nombre:"BURBERRY",
  precio:150,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BURBERRY/BR001/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BURBERRY/BR001/1.jpeg",
    "imgP/ZAPATOS MEN/BURBERRY/BR001/2.jpeg",
    "imgP/ZAPATOS MEN/BURBERRY/BR001/3.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"BR002",
  marca:"BURBERRY",
  nombre:"BURBERRY",
  precio:90,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/BURBERRY/BR002/2.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/BURBERRY/BR002/2.jpeg",
   
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"],

  entregaInmediata:true,
tallasEntregaInmediata:["39"],
coloresEntregaInmediata:["Negro"],
cantidadDisponible:1,
precioEntregaInmediata:90,
envioRapido: true ,
},




{
  codigo:"CH001",
  marca:"CHRISTIAN DIOR",
  nombre:"Christian Dior",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Dior/CH001/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Dior/CH001/1.webp",
    "imgP/ZAPATOS MEN/Christian Dior/CH001/2.webp",
    "imgP/ZAPATOS MEN/Christian Dior/CH001/3.webp",
     "imgP/ZAPATOS MEN/Christian Dior/CH001/4.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CH002",
  marca:"CHRISTIAN DIOR",
  nombre:"Christian Dior",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Dior/CH002/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Dior/CH002/1.webp",
    "imgP/ZAPATOS MEN/Christian Dior/CH002/2.webp",
    "imgP/ZAPATOS MEN/Christian Dior/CH002/3.webp",
     "imgP/ZAPATOS MEN/Christian Dior/CH002/4.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"CH003",
  marca:"CHRISTIAN DIOR",
  nombre:"Christian Dior",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Christian Dior/CH003/1.jfif",
  imagenes:[
    "imgP/ZAPATOS MEN/Christian Dior/CH003/1.jfif",
    "imgP/ZAPATOS MEN/Christian Dior/CH003/2.jfif",
    "imgP/ZAPATOS MEN/Christian Dior/CH003/3.jfif",
     "imgP/ZAPATOS MEN/Christian Dior/CH003/4.jfif",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},










{
  codigo:"CV001",
  marca:"CONVERSE",
  nombre:"Converse",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Converse/CV001/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Converse/CV001/1.webp",
    "imgP/ZAPATOS MEN/Converse/CV001/2.webp",
    "imgP/ZAPATOS MEN/Converse/CV001/3.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},










{
  codigo:"D&C001",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C001/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C001/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C001/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C001/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C001/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C002",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C002/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C002/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C002/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C002/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C002/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C003",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C003/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C003/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C003/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C003/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C003/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C004",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C004/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C004/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C004/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C004/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C004/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C005",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C005/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C005/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C005/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C005/3.jpg",

  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C006",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C006/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C006/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C006/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C006/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C006/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C007",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C007/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C007/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C007/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C007/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C007/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C008",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C008/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C008/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C008/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C008/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C008/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C009",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C009/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C009/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C009/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C009/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C009/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C011",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C011/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C011/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C011/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C011/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C011/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C012",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C012/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C012/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C012/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C012/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C012/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C013",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C013/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C013/1.jpeg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C013/2.jpeg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C013/3.jpeg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C013/4.jpeg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C014",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C014/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C014/1.jpeg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C014/2.jpeg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C014/3.jpeg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C014/4.jpeg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C015",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C015/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C015/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C015/4.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C015/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C015/2.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C016",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C016/4.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C016/4.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C016/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C016/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C016/3.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"D&C017",
  marca:"DOLCE&GABANNA",
  nombre:"Dolce & Gabanna",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Dolce & Gabanna/D&C017/3.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C017/3.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C017/1.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C017/2.jpg",
    "imgP/ZAPATOS MEN/Dolce & Gabanna/D&C017/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},



{
  codigo:"GG001",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG001/1.avif",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG001/1.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG001/2.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG001/5.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG001/4.avif",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG002",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG002/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG002/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG002/2.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG002/3.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG002/4.webp",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG003",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG003/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG003/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG003/2.webp",
    "imgP/ZAPATOS MEN/Golden Goose/GG003/3.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG003/4.jpg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG004",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG004/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG004/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG004/2.jpg",
    
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG005",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG005/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG005/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG005/2.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG005/3.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG005/4.webp",
    
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG006",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG006/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG006/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG006/2.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG006/3.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG006/4.webp",
    
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG007",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG007/2.avif",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG007/2.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG007/3.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG007/4.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG007/1.avif",
    
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG008",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG008/1.avif",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG008/1.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG008/2.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG008/3.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG008/4.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG008/5.avif",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG009",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG009/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG009/1.webp",
    "imgP/ZAPATOS MEN/Golden Goose/GG009/2.webp",
    "imgP/ZAPATOS MEN/Golden Goose/GG009/3.webp",
    "imgP/ZAPATOS MEN/Golden Goose/GG009/4.webp",
    
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG010",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG010/1.avif",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG010/1.avif",
    "imgP/ZAPATOS MEN/Golden Goose/GG010/2.avif",
   
    "imgP/ZAPATOS MEN/Golden Goose/GG010/4.avif",
  
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},

{
  codigo:"GG011",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG011/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG011/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG011/2.jpg",
   "imgP/ZAPATOS MEN/Golden Goose/GG011/3.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG011/4.jpg",
  
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG012",
  marca:"GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:1499.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG012/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG012/1.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG012/2.jpg",
   "imgP/ZAPATOS MEN/Golden Goose/GG012/3.jpg",
    "imgP/ZAPATOS MEN/Golden Goose/GG012/4.jpg",
  
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"GG013",
  marca:"GOLDEN GOOSE",
  "marca": "GOLDEN GOOSE",
  nombre:"Golden Goose",
  precio:149.99,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Golden Goose/GG013/1.png",
  imagenes:[
    "imgP/ZAPATOS MEN/Golden Goose/GG013/1.png",
    "imgP/ZAPATOS MEN/Golden Goose/GG013/2.png",
   "imgP/ZAPATOS MEN/Golden Goose/GG013/3.png",
    "imgP/ZAPATOS MEN/Golden Goose/GG013/4.png",
  
  ],
  descripcion:" Men's Ball Star in white nappa with dove gray suede star ,TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},








{
  codigo:"LP001",
  marca:"LORO PIANA",
  nombre:"Loro Piana",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Loro Piana/LP001/1.avif",
  imagenes:[
    "imgP/ZAPATOS MEN/Loro Piana/LP001/1.avif",
    "imgP/ZAPATOS MEN/Loro Piana/LP001/2.avif",
    "imgP/ZAPATOS MEN/Loro Piana/LP001/3.avif",
    "imgP/ZAPATOS MEN/Loro Piana/LP001/4.avif",
    
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},















{
  codigo:"LV001",
  marca:"LOUIS VOUITTON",
  nombre:"Louis Vuitton",
  precio:180,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/LOUIS VOUITTON/LV001/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV001/1.jpg",
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV001/2.jpg",
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV001/3.jpg",
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV001/4.jpg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"LV002",
  marca:"LOUIS VOUITTON",
  nombre:"Louis Vuitton",
  precio:180,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/LOUIS VOUITTON/LV002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV002/1.jpeg",
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV002/2.jpeg",
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV002/3.jpeg",
    "imgP/ZAPATOS MEN/LOUIS VOUITTON/LV002/4.jpeg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},






















{
  codigo:"MM001",
  marca:"MAISON MARGIELA",
  nombre:"Maison Margiela",
  precio:150,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Maison Margiela/MM001/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Maison Margiela/MM001/1.jpg",
    "imgP/ZAPATOS MEN/Maison Margiela/MM001/2.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM001/3.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM001/4.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"MM002",
  marca:"MAISON MARGIELA",
  nombre:"Maison Margiela",
  precio:150,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Maison Margiela/MM002/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Maison Margiela/MM002/1.jpg",
    "imgP/ZAPATOS MEN/Maison Margiela/MM002/2.jpg",
    "imgP/ZAPATOS MEN/Maison Margiela/MM002/3.jpg",
    "imgP/ZAPATOS MEN/Maison Margiela/MM002/4.jpg",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"MM003",
  marca:"MAISON MARGIELA",
  nombre:"Maison Margiela",
  precio:150,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Maison Margiela/MM003/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Maison Margiela/MM003/1.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM003/2.jpg",
    "imgP/ZAPATOS MEN/Maison Margiela/MM003/3.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM003/4.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"MM004",
  marca:"MAISON MARGIELA",
  nombre:"Maison Margiela",
  precio:150,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Maison Margiela/MM004/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Maison Margiela/MM004/1.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM004/2.webp",
        "imgP/ZAPATOS MEN/Maison Margiela/MM004/3.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM004/4.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"MM005",
  marca:"MAISON MARGIELA",
  nombre:"Maison Margiela",
  precio:150,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Maison Margiela/MM005/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Maison Margiela/MM005/1.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM005/2.webp",
        "imgP/ZAPATOS MEN/Maison Margiela/MM005/3.webp",
    "imgP/ZAPATOS MEN/Maison Margiela/MM005/4.webp",
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"OFW001",
  marca:"OFF-WHITE",
  nombre:"Off White Vulcanized",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/OFF-WHITE/OFW001/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW001/1.jpeg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW001/2.jpeg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW001/3.jpeg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW001/4.jpeg",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"OFW002",
  marca:"OFF-WHITE",
  nombre:"Off White Vulcanized",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/OFF-WHITE/OFW002/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW002/1.jpeg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW002/2.jpeg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW002/3.jpeg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW002/4.jpeg",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"OFW003",
  marca:"OFF-WHITE",
  nombre:"Off White Vulcanized",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/OFF-WHITE/OFW003/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW003/1.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW003/2.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW003/3.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW003/4.jpg",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"OFW004",
  marca:"OFF-WHITE",
  nombre:"Off White ",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/OFF-WHITE/OFW004/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW004/1.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW004/2.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW004/3.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW004/4.jpg",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},

{
  codigo:"OFW005",
  marca:"OFF-WHITE",
  nombre:"Off White Vulcanized",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/OFF-WHITE/OFW005/2.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW005/2.jpg",
    "imgP/ZAPATOS MEN/OFF-WHITE/OFW005/1.jpg",
   
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"],
  entregaInmediata:true,

tallasEntregaInmediata:["42"],
coloresEntregaInmediata:["BLANCO"],
cantidadDisponible:1,
precioEntregaInmediata:160,
ultimasUnidades:false,        // enciende la etiqueta
cantidadDisponible: 1 ,     
envioRapido: true    // este número decide el texto  
},



















{
  codigo:"ST001",
  marca:"SAINT LAURENT",
  nombre:"Saint Laurent ",
  precio:148.5,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/SAINT LAURENT/ST001/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/SAINT LAURENT/ST001/1.webp",
    "imgP/ZAPATOS MEN/SAINT LAURENT/ST001/2.webp",
    "imgP/ZAPATOS MEN/SAINT LAURENT/ST001/3.webp",
    "imgP/ZAPATOS MEN/SAINT LAURENT/ST001/4.webp",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"VL001",
  marca:"VALENTINO ",
  nombre:"Valentino Garavani ",
  precio:164.50,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Valentino/VL001/1.jpg",
  imagenes:[
    "imgP/ZAPATOS MEN/Valentino/VL001/1.jpg",
    "imgP/ZAPATOS MEN/Valentino/VL001/2.jpg",
    "imgP/ZAPATOS MEN/Valentino/VL001/3.jpg",
    "imgP/ZAPATOS MEN/Valentino/VL001/4.jpg",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},
{
  codigo:"VL002",
  marca:"VALENTINO ",
  nombre:"Valentino Garavani ",
  precio:164.50,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/Valentino/VL002/1.webp",
  imagenes:[
    "imgP/ZAPATOS MEN/Valentino/VL002/1.webp",
    "imgP/ZAPATOS MEN/Valentino/VL002/2.webp",
    "imgP/ZAPATOS MEN/Valentino/VL002/3.webp",
    "imgP/ZAPATOS MEN/Valentino/VL002/4.webp",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},

{
  codigo:"VJ001",
  marca:"VEJA ",
  nombre:"Veja Campo ",
  precio:148.5,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/VEJA/VJ001/2.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/VEJA/VJ001/2.jpeg",
    "imgP/ZAPATOS MEN/VEJA/VJ001/1.jpeg",
    "imgP/ZAPATOS MEN/VEJA/VJ001/3.jpeg",
    "imgP/ZAPATOS MEN/VEJA/VJ001/4.jpeg",
],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},

{
  codigo:"PHM001",
  marca:"PHILIP MODEL",
  nombre:"Philip Model",
  precio:160,
  categoria:"Zapatos",
  nuevo:true,
  imagen:"imgP/ZAPATOS MEN/PHILIP MODEL/PHM001/1.jpeg",
  imagenes:[
    "imgP/ZAPATOS MEN/PHILIP MODEL/PHM001/1.jpeg",
    "imgP/ZAPATOS MEN/PHILIP MODEL/PHM001/2.jpeg",
    "imgP/ZAPATOS MEN/PHILIP MODEL/PHM001/3.jpeg",
    
  ],
  descripcion:" TIEMPO de entrega 15-25 días",
  tallas:["37","38","39","40","41","42","43","44"]
},




































{
  codigo: "#001W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/001.jpg",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"],
  precioOferta:0,
promocionHasta:"",


"entregaInmediata": false,
    "tallasEntregaInmediata": [40],
    "cantidadDisponible": 1,
    "precioEntregaInmediata": 140,
    "envioRapido": false
  },
{
  codigo: "#002W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/002.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#003W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/003.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#004W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/004.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#005W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/005.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#006W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/006.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#007W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/007.jpg",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#008W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/008.jpg",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#009W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/009.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#010W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/010.png",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#011W",
  nombre: "CHRISTIAN LOUBUTIN CL",
  precio: 140,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/011.jpeg",
  descripcion: " CL TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#012W",
  nombre: "CHRISTIAN DIOR CH",
  precio: 140,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/012.jpeg",
  descripcion: " CH TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#013W",
  nombre: "AMIRI ",
  precio: 140,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/013.jpeg",
  descripcion: " AMIRI TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#014W",
  nombre: "GOLDEN GOOSE GGDB",
  precio: 140,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/014.jpeg",
  descripcion: " GGDB TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#015W",
  nombre: "CHISTIAN LOUBUTIN CL",
  precio: 140,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/015.jpg",
  descripcion: " CL TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "#016W",
  nombre: "DIOR",
  precio: 126,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/DIOR/016.1.jpg",
 imagenes:[
    "imgP/dama/DIOR/016.1.jpg",
    "imgP/dama/DIOR/016.3.jpg",
    "imgP/dama/DIOR/01632.jpg",
    
  ],


  descripcion: " TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },


{
  codigo: "#017W",
  nombre: "DIOR",
  precio: 105,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/DIOR/017.1/1.jpeg",
 imagenes:[
    "imgP/dama/DIOR/017.1/1.jpeg",
    
  ],


  descripcion: " TIEMPO  DE ENTREGA 15-25 DIAS",
  tallas: ["35","36","37","38","39","40"]
  },

{
  codigo: "GGW001",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW001/1.png",
  descripcion: " Women’s Super-Star in worn white leather with tone-on-tone star, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW001/1.png",
"imgP/dama/GOLDE/GGW001/2.png",
"imgP/dama/GOLDE/GGW001/3.png",
"imgP/dama/GOLDE/GGW001/4.png"
],



  tallas: ["35","36","37","38","39","40"]
 },


{
  codigo: "GGW002",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW002/1.png",
  descripcion: " Women's Super-Star in silver glitter with ice-gray suede star, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW002/1.png",
"imgP/dama/GOLDE/GGW002/2.png",
"imgP/dama/GOLDE/GGW002/3.png",
"imgP/dama/GOLDE/GGW002/4.png"
],


  tallas: ["35","36","37","38","39","40"]
  },

{
  codigo: "GGW003",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW003/4.png",
  descripcion: " Women's Super-Star in silver glitter with ice-gray suede star, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW003/4.png",
"imgP/dama/GOLDE/GGW003/3.png",
"imgP/dama/GOLDE/GGW003/2.png",
"imgP/dama/GOLDE/GGW003/1.png"
],


  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "GGW004",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW004/1.png",
  descripcion: " Women's Ball Star with silver Swarovski micro-crystal star and metallic silver leather heel tab, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW004/1.png",
"imgP/dama/GOLDE/GGW004/2.png",
"imgP/dama/GOLDE/GGW004/3.png",
"imgP/dama/GOLDE/GGW004/4.png"
],


  tallas: ["35","36","37","38","39","40"]
  },

{
  codigo: "GGW005",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW005/1.png",
  descripcion: " Women's Ball Star in white nappa leather with green leather star and heel tab, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW005/1.png",
"imgP/dama/GOLDE/GGW005/2.png",
"imgP/dama/GOLDE/GGW005/3.png",
"imgP/dama/GOLDE/GGW005/4.png"
],


  tallas: ["35","36","37","38","39","40"]
  },
{
  codigo: "GGW006",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW006/1.png",
  descripcion: " Women’s Ball Star Wishes in white leather with a red star and heel tab, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW006/1.png",
"imgP/dama/GOLDE/GGW006/2.png",
"imgP/dama/GOLDE/GGW006/3.png",
"imgP/dama/GOLDE/GGW006/4.png"
],


  tallas: ["35","36","37","38","39","40"]
  },

{
  codigo: "GGW007",
  nombre: "GOLDEN GOOSE GGDB",
  
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW007/1.png",
  descripcion: " Women’s Ball Star Wishes in white nappa leather with bright blue star and heel tab, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW007/1.png",
"imgP/dama/GOLDE/GGW007/2.png",
"imgP/dama/GOLDE/GGW007/3.png",
"imgP/dama/GOLDE/GGW007/4.png"
],


  tallas: ["35","36","37","38","39","40"]
  },

{
  codigo: "GGW008",
  nombre: "GOLDEN GOOSE GGDB",
  "marca": "GOLDEN GOOSE",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/GOLDE/GGW006/1.png",
  descripcion: " Women’s Ball Star Wishes in white nappa leather with bright blue star and heel tab, TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/GOLDE/GGW006/1.png",
"imgP/dama/GOLDE/GGW006/2.png",
"imgP/dama/GOLDE/GGW006/3.png",
"imgP/dama/GOLDE/GGW006/4.png"
],


  tallas: ["35","36","37","38","39","40"]
  },


{
  codigo: "VJW001",
  nombre: "VEJA CAMPO",
  "marca": "VEJA",
  precio: 149.99,
  categoria: "Dama",
  nuevo: true,
  imagen:"imgP/dama/VEJA/VJW001/1.jpg",
  descripcion: "VEJA Leather Extra Sneakers , TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/VEJA/VJW001/1.jpg",
"imgP/dama/VEJA/VJW001/2.jpg",
"imgP/dama/VEJA/VJW001/3.jpg",
"imgP/dama/VEJA/VJW001/4.jpg",
"imgP/dama/VEJA/VJW001/5.jpg",
"imgP/dama/VEJA/VJW001/8.jpg",
"imgP/dama/VEJA/VJW001/9.jpg",
"imgP/dama/VEJA/VJW001/10.jpg",
],


  tallas: ["35","36","37","38","39","40","41","42","43","44","45",
  ]
  },

{
  codigo: "VJW-M002",
  nombre: "VEJA CAMPO",
  "marca": "VEJA",
  precio: 149.99,
  categoria: "Zapatos",
  nuevo: true,
  imagen:"imgP/dama/VEJA/VJW-M002/1.jpg",
  descripcion: "VEJA Leather Extra Sneakers , TIEMPO  DE ENTREGA 15-25 DIAS",
imagenes:[
   "imgP/dama/VEJA/VJW-M002/1.jpg",
"imgP/dama/VEJA/VJW-M002/2.jpg",
"imgP/dama/VEJA/VJW-M002/3.jpg",
"imgP/dama/VEJA/VJW-M002/4.jpg",
"imgP/dama/VEJA/VJW-M002/5.jpg",
"imgP/dama/VEJA/VJW-M002/6.jpg",
"imgP/dama/VEJA/VJW-M002/7.jpg",
"imgP/dama/VEJA/VJW-M002/8.jpg",
],


  tallas: ["35","36","37","38","39","40","41","42","43","44","45",
  ]
  },






















































































{
  codigo: "BEAR001",
  marca: "Bearbrick",
  nombre: "Bearbrick 400% Louis Vuitton Multicolor",
  precio: 120,
  categoria: "Accesorios",
  nuevo: true,
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR001/1.png",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR001/1.png",
    "imgP/accesorios/KAWA/Bearbricks/BEAR001/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR001/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR001/4.jpeg",
     "imgP/accesorios/KAWA/Bearbricks/BEAR001/5.jpeg",
  ],
  descripcion: "Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
  },










{
  codigo: "#ROW1",
  nombre: "SWATCH X AP",
  precio: 152,
  categoria: "Accesorios",
  nuevo: true,
  imagen:"imgP/accesorios/ROW1.jpeg",
  descripcion: " AP TIEMPO  DE ENTREGA 15-25 DIAS",
colores:["Pink","Blue","Green","Black & White"],
  },
{
  codigo:"#ROW2",
  nombre:"BOLSA LV",
  precio:140,
  categoria:"Accesorios",
  nuevo:true,
  imagen:"imgP/accesorios/ROW2.jpeg",
  descripcion:"LV TIEMPO DE ENTREGA 15-25 DIAS",
  colores:["Black"]
},
{
  codigo: "#ROW3",
  nombre: "TARJETERO GOYARD GYD",
  precio: 48,
  categoria: "Accesorios",
  nuevo: true,
  imagen:"imgP/accesorios/ROW3.jpeg",
  descripcion: " GYD TIEMPO  DE ENTREGA 15-25 DIAS",
colores:[
  "Black",
  "Red",
  "Navy Blue",
  "Pink",
  "Tan",
  "White",
  "Orange",
  "Light Grey",
  "Dark Grey",
  "Sky Blue",
  "Brown",
  "Yellow",
  "Burgundy",
  "Cream",
  "Green"
],
  },
{
  codigo:"#ROW4",
  nombre:"BACKPACK alo",
  precio:57,
  categoria:"Accesorios",
  nuevo:true,
  imagen:"imgP/accesorios/ALOBACL1/1.jpeg",
  
  imagenes:[
    "imgP/accesorios/ALOBACL1/1.jpeg",
    "imgP/accesorios/ALOBACL1/3.jpeg",
    "imgP/accesorios/ALOBACL1/2.jpeg"
  ],
  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",
  colores:["Black"]
},






{
  codigo:"#001R",
  nombre:"JACKET OFFWHITE OFFW",
  precio:140,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/001.1.jpg",

  imagenes:[
    "imgP/ropa/001.1.jpg",
    "imgP/ropa/001.2.jpg"
  ],

  descripcion:"OFFW TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#002R",
  nombre:"JACKET OFFWHITE OFFW",
  precio:140,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/002.1.jpg",

  imagenes:[
    "imgP/ropa/002.1.jpg",
    "imgP/ropa/002.2.jpg"
  ],

  descripcion:"OFFW TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#003R",
  nombre:"JACKET OFFWHITE OFFW",
  precio:140,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/003.1.jpg",

  imagenes:[
    "imgP/ropa/003.1.jpg",
    "imgP/ropa/003.2.jpg"
  ],

  descripcion:"OFFW TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#004R",
  nombre:"JACKET OFFWHITE OFFW",
  precio:140,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/004.1.jpeg",

  imagenes:[
    "imgP/ropa/004.1.jpeg",
    "imgP/ropa/004.2.jpeg"
  ],

  descripcion:"OFFW TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#005R",
  nombre:"T-SHIRT GALERY DEPT GP",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/005.1.jpeg",

  imagenes:[
    "imgP/ropa/005.1.jpeg",
    "imgP/ropa/005.2.jpeg"
  ],

  descripcion:"GP TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],  colores:[
  "Black",
  "White"
],
},
{
  codigo:"#006R",
  nombre:"T-SHIRT AMIRI",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/006.1.jpeg",

  imagenes:[
    "imgP/ropa/006.1.jpeg",
    "imgP/ropa/006.2.jpeg",
    "imgP/ropa/006.3.jpeg"
  ],

  descripcion:"AMIRI TIEMPO DE ENTREGA 15-25 DIAS",

    
  tallas:["S","M","L","XL"],
    colores:[
  "Black",
  "White"
],
},
{
  codigo:"#007R",
  nombre:"T-SHIRT ESSENSIALTS",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/007.1.jpeg",

  imagenes:[
    "imgP/ropa/007.1.jpeg",
    "imgP/ropa/007.2.jpeg",
    
  ],

  descripcion:"EST TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Cream",
  "Beige",
  "Coral",
  "Black"
],
},
{
  codigo:"#008R",
  nombre:"T-SHIRT ESSENSIALTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/008.1.jpeg",

  imagenes:[
    "imgP/ropa/008.1.jpeg",
    "imgP/ropa/008.2.jpeg",
    "imgP/ropa/008.3.jpeg"
  ],
colores:[
  "Black",
  "Cream",
],
  descripcion:"EST TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#009R",
  nombre:"T-SHIRT ESSENSIALTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/009.1.jpg",

  imagenes:[
    "imgP/ropa/009.1.jpg",
    "imgP/ropa/009.2.jfif",
    "imgP/ropa/009.3.jfif",
    "imgP/ropa/009.4.jfif",
  ],

  descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "White",
  "Grey",
  "Sand",
  "Green",
  "Blue",
  "Black"
],

  // ---- EJEMPLO: solo tienes S en negro físicamente ----
  // En el apartado "Entrega inmediata" el cliente SOLO podrá elegir S y Black.
  // En el catálogo normal siguen disponibles las 4 tallas y los 6 colores por encargo.
  entregaInmediata:true,
  tallasEntregaInmediata:["S"],
  coloresEntregaInmediata:["Black"],
  cantidadDisponible:1,
  precioEntregaInmediata:45,
},
{
  codigo:"#010R",
  nombre:"SHORTS MONCLER",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/010.1.jpg",

  imagenes:[
    "imgP/ropa/010.1.jpg",
    "imgP/ropa/010.2.jpg",
    "imgP/ropa/010.3.jpg",
    "imgP/ropa/010.4.jpg"
  ],
descripcion:"MCR TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#011R",
  nombre:"SHORTS MONCLER",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/011.1.jpg",

  imagenes:[
    "imgP/ropa/011.1.jpg",
    "imgP/ropa/011.2.jpg",
    "imgP/ropa/011.3.jpg",
    "imgP/ropa/011.4.jpg"
  ],
descripcion:"MCR TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#012R",
  nombre:"BAÑADOR MONCLER",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/012.1.jpg",

  imagenes:[
    "imgP/ropa/012.1.jpg",
    "imgP/ropa/012.2.jpg",
    "imgP/ropa/012.3.jpg",
    
  ],
descripcion:"MCR TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#013R",
  nombre:"T-SHIRT CHROME HEARTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/013.1.jpg",

  imagenes:[
    "imgP/ropa/013.1.jpg",
    "imgP/ropa/013.2.jpg",
    "imgP/ropa/013.3.jpg",
    "imgP/ropa/013.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "white",
],
},
{
  codigo:"#014R",
  nombre:"T-SHIRT CHROME HEARTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/014.1.jpg",

  imagenes:[
    "imgP/ropa/014.1.jpg",
    "imgP/ropa/014.2.jpg",
    "imgP/ropa/014.3.jpg",
    "imgP/ropa/014.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "Black",
  "white",
],
},
{
  codigo:"#015R",
  nombre:"T-SHIRT CHROME HEARTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/015.1.jpg",

  imagenes:[
    "imgP/ropa/015.1.jpg",
    "imgP/ropa/015.2.jpg",
    "imgP/ropa/015.3.jpg",
    "imgP/ropa/015.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "Black",
  "white",
],
},
{
  codigo:"#016R",
  nombre:"T-SHIRT CHROME HEARTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/016.1.jpg",

  imagenes:[
    "imgP/ropa/016.1.jpg",
    "imgP/ropa/016.2.jpg",
    "imgP/ropa/016.3.jpg",
    "imgP/ropa/016.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "Black",
  "white",
],
},
{
  codigo:"#017R",
  nombre:"T-SHIRT CHROME HEARTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/017.1.jpg",

  imagenes:[
    "imgP/ropa/017.1.jpg",
    "imgP/ropa/017.2.jpg",
    "imgP/ropa/017.3.jpg",
    "imgP/ropa/017.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "Black",
  "white",
],
},
{
  codigo:"#018R",
  nombre:"T-SHIRT CHROME HEARTS",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/018.1.jpg",

  imagenes:[
    "imgP/ropa/018.1.jpg",
    "imgP/ropa/018.2.jpg",
    "imgP/ropa/018.3.jpg",
    "imgP/ropa/018.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "Black",
  "white",
],
},
{
  codigo:"#019R",
  nombre:"HOODIE alo",
  precio:60,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/019.1.jpg",

  imagenes:[
    "imgP/ropa/019.1.jpg",
    "imgP/ropa/019.2.jpg",
    "imgP/ropa/019.3.jpg",
    "imgP/ropa/019.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#020R",
  nombre:"T-SHIRT CASA BLANCA",
  precio:"72",
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/020.1.jpg",

  imagenes:[
    "imgP/ropa/020.1.jpg",
    "imgP/ropa/020.2.jpg",
    "imgP/ropa/020.3.jpg",
    "imgP/ropa/020.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "white",
  "navy blue",
],
},
{
  codigo:"#021R",
  nombre:"T-SHIRT ALL-SAINTS",
  precio:48,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/021.1.jpg",

  imagenes:[
    "imgP/ropa/021.1.jpg",
    "imgP/ropa/021.2.webp",
    "imgP/ropa/021.3.webp",
    "imgP/ropa/021.4.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],colores:[
  "Black",
  "white",
],
},
{
  codigo:"#022R",
  nombre:"HOODIE ASSC",
  precio:45,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/022.1.jpeg",

  imagenes:[
    "imgP/ropa/022.1.jpeg",
    "imgP/ropa/022.2.jpeg",
 
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#023R",
  nombre:"T-SHIRT AMIRI",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/023.1.jpeg",

  imagenes:[
    "imgP/ropa/023.1.jpeg",
    "imgP/ropa/023.2.jpeg",
    "imgP/ropa/023.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#024R",
  nombre:"T-SHIRT AMIRI",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/024.1.jpg",

  imagenes:[
    "imgP/ropa/024.1.jpg",
    "imgP/ropa/024.2.jpg",
    "imgP/ropa/024.3.jpg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#025R",
  nombre:"T-SHIRT AMIRI",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/025.1.jpeg",

  imagenes:[
    "imgP/ropa/025.1.jpeg",
    "imgP/ropa/025.2.jpeg",
    "imgP/ropa/025.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#026R",
  nombre:"T-SHIRT AMIRI",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/026.1.jpeg",

  imagenes:[
    "imgP/ropa/026.1.jpeg",
    "imgP/ropa/026.2.jpeg",
    "imgP/ropa/026.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "white",
],
},
{
  codigo:"#027R",
  nombre:"T-SHIRT AMIRI",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/027.1.jpeg",

  imagenes:[
    "imgP/ropa/027.1.jpeg",
    "imgP/ropa/027.2.jpeg",
    "imgP/ropa/027.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#028R",
  nombre:"T-SHIRT AMIRI",
  precio:62,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/028.1.jpeg",

  imagenes:[
    "imgP/ropa/028.1.jpeg",
    "imgP/ropa/028.2.jpeg",
    "imgP/ropa/028.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"]
},
{
  codigo:"#029R",
  nombre:"T-SHIRT OFFWHT",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/029.1.jpeg",

  imagenes:[
    "imgP/ropa/029.1.jpeg",
    "imgP/ropa/029.2.jpeg",
  
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],  colores:[
  "Black",
  "White"
],
},
{
  codigo:"#031R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/031.1.jpeg",

  imagenes:[
    "imgP/ropa/031.1.jpeg",
    "imgP/ropa/031.2.jpeg",
    "imgP/ropa/031.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],  colores:[
  "Black",
  
],
  
},
{
  codigo:"#032R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/032.1.jpeg",

  imagenes:[
    "imgP/ropa/032.1.jpeg",
    "imgP/ropa/032.2.jpeg",
    "imgP/ropa/032.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "White",
  "navy blue"
],
},
{
  codigo:"#034R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/034.1.jpeg",

  imagenes:[
    "imgP/ropa/034.1.jpeg",
    "imgP/ropa/034.2.jpeg",
    "imgP/ropa/034.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "White"
],
},
{
  codigo:"#035R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/035.1.jpeg",

  imagenes:[
    "imgP/ropa/035.1.jpeg",
    "imgP/ropa/035.2.jpeg",
    "imgP/ropa/035.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "White"
],
},
{
  codigo:"#036R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/036.1.jpeg",

  imagenes:[
    "imgP/ropa/036.1.jpeg",
    "imgP/ropa/036.2.jpeg",
    "imgP/ropa/036.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:[
  "Black",
  "Grey",
  "White",

],
},
{
  codigo:"#037R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/037.1.jpeg",

  imagenes:[
    "imgP/ropa/037.1.jpeg",
    "imgP/ropa/037.2.jpeg",
    "imgP/ropa/037.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:["Negro","Blanco"]
},
{
  codigo:"#038R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/038.1.jpeg",

  imagenes:[
    "imgP/ropa/038.1.jpeg",
    "imgP/ropa/038.2.jpeg",
    "imgP/ropa/038.3.jpeg",
  ],
descripcion:" TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
colores:[
  "Pink",
  "Baby Blue",
  "Cream",
  "White",
  "Black"
],
},
{
  codigo:"#039R",
  nombre:"T-SHIRT ASSC",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/039.1.jpeg",

  imagenes:[
    "imgP/ropa/039.1.jpeg",
    "imgP/ropa/039.2.jpeg",
    "imgP/ropa/039.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:["Negro","Blanco"]
},
{
  codigo:"#040R",
  nombre:"SHORTS BALENCIAGA",
  precio:52,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/040.1.jpg",

  imagenes:[
    "imgP/ropa/040.1.jpg",
    "imgP/ropa/040.2.jpg",
    "imgP/ropa/040.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
  colores:["Negro","Blanco"]
},
{
  codigo:"#041R",
  nombre:"T-SHIRTS BALENCIAGA",
  precio:55,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/041.1.jpg",

  imagenes:[
    "imgP/ropa/041.1.jpg",
    "imgP/ropa/041.2.jpg",
    "imgP/ropa/041.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "Black",
],
},
{
  codigo:"#042R",
  nombre:"T-SHIRTS BALENCIAGA",
  precio:55,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/042.1.jpg",

  imagenes:[
    "imgP/ropa/042.1.jpg",
    "imgP/ropa/042.2.jpg",
    "imgP/ropa/042.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "Black",
],
},
{
  codigo:"#043R",
  nombre:"T-SHIRTS BALENCIAGA",
  precio:55,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/043.1.jpg",

  imagenes:[
    "imgP/ropa/043.1.jpg",
    "imgP/ropa/043.2.jpg",
    "imgP/ropa/043.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "Black",
  "white",
],
},
{
  codigo:"#044R",
  nombre:"T-SHIRTS B4PE",
  precio:48,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/044.1.jpeg",

  imagenes:[
    "imgP/ropa/044.1.jpeg",
    "imgP/ropa/044.2.jpeg",
    "imgP/ropa/044.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "Black",
  "Pink",
  "Gray",
],
},
{
  codigo:"#045R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:62,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/045.1.jpg",

  imagenes:[
    "imgP/ropa/045.1.jpg",
    "imgP/ropa/045.2.jpg",
    "imgP/ropa/045.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#047R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:62,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/047.1.jpg",

  imagenes:[
    "imgP/ropa/047.1.jpg",
    "imgP/ropa/047.2.jpg",
    "imgP/ropa/047.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#048R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:62,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/048.1.jpg",

  imagenes:[
    "imgP/ropa/048.1.jpg",
    "imgP/ropa/048.2.jpg",
    "imgP/ropa/048.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#051R",
  nombre:"CONJUNTO CASA BLANCA",
  precio:75,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/051.1.jpeg",

  imagenes:[
    "imgP/ropa/051.1.jpeg",
    "imgP/ropa/051.2.jpeg",
    "imgP/ropa/051.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#052R",
  nombre:"CONJUNTO CASA BLANCA",
  precio:75,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/052.1.jpeg",

  imagenes:[
    "imgP/ropa/052.1.jpeg",
    "imgP/ropa/052.2.jpeg",
    "imgP/ropa/052.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#053R",
  nombre:"CONJUNTO CASA BLANCA",
  precio:75,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/053.1.jpeg",

  imagenes:[
    "imgP/ropa/053.1.jpeg",
    "imgP/ropa/053.2.jpeg",
    "imgP/ropa/053.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#054R",
  nombre:"CONJUNTO CASA BLANCA",
  precio:75,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/054.1.jpeg",

  imagenes:[
    "imgP/ropa/054.1.jpeg",
    "imgP/ropa/054.2.jpeg",
    "imgP/ropa/054.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#055R",
  nombre:"CONJUNTO CASA BLANCA",
  precio:75,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/055.1.jpeg",

  imagenes:[
    "imgP/ropa/055.1.jpeg",
    "imgP/ropa/055.2.jpeg",
    "imgP/ropa/055.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#056R",
  nombre:"CONJUNTO CASA BLANCA",
  precio:75,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/056.1.jpeg",

  imagenes:[
    "imgP/ropa/056.1.jpeg",
    "imgP/ropa/056.2.jpeg",
    "imgP/ropa/056.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#057R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:68,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/057.1.jpeg",

  imagenes:[
    "imgP/ropa/057.1.jpeg",
    "imgP/ropa/057.2.jpeg",
    "imgP/ropa/057.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#058R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:68,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/058.1.jpeg",

  imagenes:[
    "imgP/ropa/058.1.jpeg",
    "imgP/ropa/058.2.jpeg",
    "imgP/ropa/058.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#059R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:65,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/059.1.jpeg",

  imagenes:[
    "imgP/ropa/059.1.jpeg",
    "imgP/ropa/059.2.jpeg",
    "imgP/ropa/059.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  "Black",
],
},
{
  codigo:"#060R",
  nombre:"T-SHIRTS CASA BLANCA",
  precio:65,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/060.1.jpeg",

  imagenes:[
    "imgP/ropa/060.1.jpeg",
    "imgP/ropa/060.2.jpeg",
    "imgP/ropa/060.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
   "black",
],
},
{
  codigo:"#061R",
  nombre:"Pantalon Chrome Hearts",
  precio:70,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/061.1.jpg",

  imagenes:[
    "imgP/ropa/061.1.jpg",
    "imgP/ropa/061.2.jpg",
    "imgP/ropa/061.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
  
],
},
{
  codigo:"#062R",
  nombre:"HOODIE CHROME HEARTS",
  precio:70,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/062.1.jpeg",

  imagenes:[
    "imgP/ropa/062.1.jpeg",
    "imgP/ropa/062.2.jpeg",
    "imgP/ropa/062.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
   "Black",
],
},
{
  codigo:"#063R",
  nombre:"T-SHIRTS CHROME HEARTS",
  precio:65,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/063.1.jpg",

  imagenes:[
    "imgP/ropa/063.1.jpg",
    "imgP/ropa/063.2.jpg",
    "imgP/ropa/063.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
   "Black",
],
},
{
  codigo:"#064R",
  nombre:"T-SHIRTS CHROME HEARTS",
  precio:53,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/064.1.jpg",

  imagenes:[
    "imgP/ropa/064.1.jpg",
    "imgP/ropa/064.2.jpeg",
    "imgP/ropa/064.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
   "Black",
],
},
{
  codigo:"#065R",
  nombre:"T-SHIRTS CHROME HEARTS",
  precio:53,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/065.1.jpeg",

  imagenes:[
    "imgP/ropa/065.1.jpeg",
    "imgP/ropa/065.2.jpeg",
    "imgP/ropa/065.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
   "Black",
],
},
{
  codigo:"#066R",
  nombre:"T-SHIRTS CHROME HEARTS",
  precio:53,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/066.1.jpg",

  imagenes:[
    "imgP/ropa/066.1.jpg",
    "imgP/ropa/066.2.jpg",
    "imgP/ropa/066.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[
  "White",
   "Black",
],
},
{
  codigo:"#067R",
  nombre:"SHORT MONCLER",
  precio:48,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/067.1.webp",

  imagenes:[
    "imgP/ropa/067.1.webp",
    "imgP/ropa/067.2.webp",
    "imgP/ropa/067.3.webp",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "Black",
],
},
{
  codigo:"#069R",
  nombre:"T-SHIRT OFF WHITE",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/069.1.jpeg",

  imagenes:[
    "imgP/ropa/069.1.jpeg",
    "imgP/ropa/069.2.jpeg",
    "imgP/ropa/069.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
],
},
{
  codigo:"#070R",
  nombre:"T-SHIRT OFF WHITE",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/070.1.jpeg",

  imagenes:[
    "imgP/ropa/070.1.jpeg",
    "imgP/ropa/070.2.jpeg",
    "imgP/ropa/070.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   "Black",
],
},
{
  codigo:"#071R",
  nombre:"T-SHIRT OFF WHITE",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/071.1.jpeg",

  imagenes:[
    "imgP/ropa/071.1.jpeg",
    "imgP/ropa/071.2.jpeg",
    "imgP/ropa/071.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   "Black",
],
},
{
  codigo:"#072R",
  nombre:"SHORT OFF WHITE",
  precio:55,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/072.1.jpeg",

  imagenes:[
    "imgP/ropa/072.1.jpeg",
    "imgP/ropa/072.2.jpeg",
    "imgP/ropa/072.3.jpeg",
    "imgP/ropa/072.4.jpeg",
    "imgP/ropa/072.5.jpeg",
    "imgP/ropa/072.6.jpeg",
    "imgP/ropa/072.7.jpeg",
    "imgP/ropa/072.8.jpeg",
    "imgP/ropa/072.9.jpeg",
    "imgP/ropa/072.10.jpeg",
    "imgP/ropa/072.11.jpeg",
  ],

  descripcion:" ENVIAR MODELO QUE NECESITA AL WHATSASAP TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   "Black",
],
},
{
  codigo:"#073R",
  nombre:"T-SHIRT OFF WHITE",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/073.1.jpg",

  imagenes:[
    "imgP/ropa/073.1.jpg",
    "imgP/ropa/073.2.jpg",
    "imgP/ropa/073.3.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   ,
   "Black",
],
},
{
  codigo:"#074R",
  nombre:"T-SHIRT AMI PLAY",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/074.1.jpeg",

  imagenes:[
    "imgP/ropa/074.1.jpeg",
    "imgP/ropa/074.2.jpeg",
    "imgP/ropa/074.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   
],
},
{
  codigo:"#075R",
  nombre:"T-SHIRT REPRESENT",
  precio:48,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/075.1.jpeg",

  imagenes:[
    "imgP/ropa/075.1.jpeg",
    "imgP/ropa/075.2.jpeg",
    "imgP/ropa/075.3.jpeg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   "Black",
],
},

{
  codigo:"#RR001",
  nombre:"T-SHIRT BURBERRY",
  precio:55,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/BURBERRY/RR001/1.jpg",

  imagenes:[
    "imgP/ropa/BURBERRY/RR001/1.jpg",
    "imgP/ropa/BURBERRY/RR001/2.jpg",
    "imgP/ropa/BURBERRY/RR001/3.jpg",
    "imgP/ropa/BURBERRY/RR001/4.jpg",
    "imgP/ropa/BURBERRY/RR001/5.jpg",
    "imgP/ropa/BURBERRY/RR001/6.jpg",
    "imgP/ropa/BURBERRY/RR001/7.jpg",
  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   "Black",
],
},



























{
  codigo:"#BP001",
  nombre:"T-SHIRT B4PE",
  precio:50,
  categoria:"Ropa",
  nuevo:true,

  imagen:"imgP/ropa/B4PE/BP001/1.jpg",

  imagenes:[
    "imgP/ropa/B4PE/BP001/1.jpg",
    "imgP/ropa/B4PE/BP001/2.jpg",
    "imgP/ropa/B4PE/BP001/3.jpg",
    "imgP/ropa/B4PE/BP001/4.jpg",
    "imgP/ropa/B4PE/BP001/5.jpg",

  ],

  descripcion:"TIEMPO DE ENTREGA 15-25 DIAS",

  tallas:["S","M","L","XL"],
 colores:[

   "White",
   "Black",
],
},

// ============================================================
//  ACCESORIOS — Figuras Bearbrick, KAWS, lentes y manta
//  Sin tallas. Algunos tienen colores para elegir.
// ============================================================
{
  codigo:"BEAR002",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% Iron Spider",
  precio:190,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR002/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/4.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/5.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/6.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/7.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR002/8.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"BEAR003",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% Iron Man Cromado",
  precio:110,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR003/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR003/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR003/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR003/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR003/4.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR003/5.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"BEAR004",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% BAPE Camo",
  precio:190,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR004/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/4.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/5.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/6.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/7.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/8.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR004/9.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"BEAR005",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% Mona Lisa",
  precio:190,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR005/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR005/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR005/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR005/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR005/4.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR005/5.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR005/6.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"BEAR006",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% BAPE Dorado",
  precio:190,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR006/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR006/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR006/2.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"BEAR007",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% Stormtrooper",
  precio:240,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR007/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/4.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/5.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/6.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/7.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/8.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR007/9.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"BEAR008",
  marca:"Bearbrick",
  nombre:"Bearbrick 400% Pikachu",
  precio:190,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/Bearbricks/BEAR008/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/Bearbricks/BEAR008/1.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR008/2.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR008/3.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR008/4.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR008/5.jpeg",
    "imgP/accesorios/KAWA/Bearbricks/BEAR008/6.jpeg",
  ],
  descripcion:"Figura Bearbrick 400% · 28 cm · BE@RBRICK ABS.",
  tallas:[]
},
{
  codigo:"KAW001",
  marca:"KAWS",
  nombre:"KAWS Cash 30 cm",
  precio:125,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/KAWS/KAW001/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/KAWS/KAW001/1.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW001/2.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW001/3.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW001/4.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW001/5.jpeg",
  ],
  descripcion:"Figura KAWS · 30 cm · PVC.",
  tallas:[],
  colores:["Negro","Gris","Café"]
},
{
  codigo:"KAW002",
  marca:"KAWS",
  nombre:"KAWS Companion 37 cm",
  precio:100,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/KAWS/KAW002/1.jpeg",
  imagenes:[
    "imgP/accesorios/KAWA/KAWS/KAW002/1.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW002/2.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW002/3.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW002/4.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW002/5.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW002/6.jpeg",
  ],
  descripcion:"Figura KAWS Figure Toys · 37 cm · PVC.",
  tallas:[],
  colores:["Negro","Gris","Celeste","Rosado"]
},
{
  codigo:"KAW003",
  marca:"KAWS",
  nombre:"KAWS Time Off Azul 29 cm",
  precio:190,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/KAWS/KAW003/1.jpg",
  imagenes:[
    "imgP/accesorios/KAWA/KAWS/KAW003/1.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW003/2.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW003/3.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW003/4.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW003/5.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW003/6.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW003/7.jpeg",
    "imgP/accesorios/KAWA/KAWS/KAW003/8.jpeg",
  ],
  descripcion:"Figura KAWS Time Off · 29 cm · PVC. Incluye caja.",
  tallas:[]
},
{
  codigo:"KAW004",
  marca:"KAWS",
  nombre:"KAWS Astro Boy 37 cm",
  precio:100,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/KAWS/KAW004/1.jpg",
  imagenes:[
    "imgP/accesorios/KAWA/KAWS/KAW004/1.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW004/2.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW004/3.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW004/4.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW004/5.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW004/6.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW004/7.jpg",
  ],
  descripcion:"Figura KAWS Astro Boy · 37 cm · sin caja.",
  tallas:[],
  colores:["Gris","Piel"]
},
{
  codigo:"KAW005",
  marca:"KAWS",
  nombre:"KAWS Dior BFF Rosado 30 cm",
  precio:130,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/KAWA/KAWS/KAW005/1.jpg",
  imagenes:[
    "imgP/accesorios/KAWA/KAWS/KAW005/1.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW005/2.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW005/3.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW005/4.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW005/5.jpg",
    "imgP/accesorios/KAWA/KAWS/KAW005/6.jpg",
  ],
  descripcion:"Figura KAWS BFF rosado con traje · 30 cm · PVC.",
  tallas:[]
},
{
  codigo:"CHROME001",
  marca:"Chrome Hearts",
  nombre:"Lentes Chrome Hearts",
  precio:50,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/CHROME HEARTS/CHROME001/1.jpg",
  imagenes:[
    "imgP/accesorios/CHROME HEARTS/CHROME001/1.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/2.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/3.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/4.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/5.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/6.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/7.jpg",
    "imgP/accesorios/CHROME HEARTS/CHROME001/8.jpg",
  ],
  descripcion:"Lentes Chrome Hearts con detalle de cruz. Incluye estuche.",
  tallas:[],
  colores:["Transparente / Dorado","Transparente / Plateado","Negro / Dorado","Negro / Plateado"]
},
{
  codigo:"OFC001",
  marca:"Off-White",
  nombre:"Manta Off-White Industrial",
  precio:100,
  categoria:"Accesorios",
  imagen:"imgP/accesorios/OFFW/OFC001/1.jpeg",
  imagenes:[
    "imgP/accesorios/OFFW/OFC001/1.jpeg",
    "imgP/accesorios/OFFW/OFC001/2.jpeg",
    "imgP/accesorios/OFFW/OFC001/3.jpeg",
    "imgP/accesorios/OFFW/OFC001/4.jpeg",
    "imgP/accesorios/OFFW/OFC001/5.jpeg",
    "imgP/accesorios/OFFW/OFC001/6.jpeg",
    "imgP/accesorios/OFFW/OFC001/7.jpeg",
    "imgP/accesorios/OFFW/OFC001/8.jpeg",
  ],
  descripcion:"Manta tejida Off-White \"Industrial by Nature\" · 130 x 160 cm · 1 kg.",
  tallas:[]
},
































];

// Normaliza cada producto agregando valores por defecto seguros.
// Nunca sobrescribe un dato que ya venga definido en el catálogo.

// ============================================================
// NOMBRES Y DESCRIPCIONES REALES
// ------------------------------------------------------------
// Identificados a partir de las fotos reales de cada producto.
// Los códigos NO se tocan: son los mismos de tu sistema.
// Para corregir un nombre, edítalo aquí. Si borras una entrada,
// el sitio vuelve a usar el nombre original del catálogo.
// "marca" solo aparece en los productos que no tenían marca.
// ============================================================

const nombresReales = {
  "CL0001": { nombre:"Louboutin Louis Junior Gamuza Negra", descripcion:"Sneaker low top en gamuza negra con puntera reforzada y ribete de grosgrain, logo tonal bordado al lateral e interior en cuero dorado." },
  "CL0002": { nombre:"Louboutin Louis Junior Gamuza Azul Marino", descripcion:"Sneaker low top en gamuza azul marino con logo bordado al lateral, puntera con ribete de grosgrain e interior en cuero dorado." },
  "CL0003": { nombre:"Louboutin Louis Junior Gamuza Azul", descripcion:"Sneaker low top en gamuza azul marino lisa, con puntera reforzada, cordones a tono e interior en cuero natural." },
  "CL0004": { nombre:"Louboutin Louis Junior Spikes Negro Monograma", descripcion:"Sneaker low top negro con tachuelas negras en la puntera y talón, y panel lateral con estampado de logos CL en tono sobre tono." },
  "CL0005": { nombre:"Louboutin Louis Junior Spikes Gamuza Gris", descripcion:"Sneaker low top en gamuza gris oscuro con tachuelas negras cubriendo la puntera y suela negra." },
  "CL0006": { nombre:"Louboutin Louis Junior Spikes Gamuza Azul", descripcion:"Sneaker low top en gamuza azul marino con tachuelas negras en la puntera y suela azul a tono." },
  "CL0007": { nombre:"Louboutin Louis Junior Spikes Gamuza Negra", descripcion:"Sneaker low top en gamuza negra total con tachuelas negras en la puntera, cordones planos negros y suela negra." },
  "CL0008": { nombre:"Louboutin Louis High Top Paisley Negro", descripcion:"Sneaker high top negro en gamuza con paneles laterales de tela con estampado paisley brillante y medallón redondo con la firma Louboutin." },
  "CL0009": { nombre:"Louboutin Louis Junior Strass Gunmetal", descripcion:"Sneaker low top en gamuza negra con panel lateral y puntera cubiertos de cristales en tono gris plomo, suela negra." },
  "CL0010": { nombre:"Louboutin Louis Junior Blanco Ribete Rojo", descripcion:"Sneaker low top en cuero blanco con ribetes de charol rojo en los paneles y talonera roja, suela blanca." },
  "CL0011": { nombre:"Louboutin Low Top Spikes Azul y Negro", descripcion:"Sneaker low top con cuerpo en gamuza azul marino perforada, paneles de cuero negro, talonera de charol azul con firma y tachuelas negras en la puntera." },
  "CL0012": { nombre:"Louboutin Louis Junior Strass Negro", descripcion:"Sneaker low top en gamuza negra con panel lateral y puntera totalmente cubiertos de cristales negros, suela negra." },
  "CL0013": { nombre:"Louboutin Louis Spikes High Top Negro", descripcion:"Sneaker high top negro con estampado de logos CL en el lateral, tachuelas negras en puntera y contorno, y medallón con la firma Louboutin." },
  "CL0014": { nombre:"Louboutin Louis Junior Spikes Blanco", descripcion:"Sneaker low top en cuero blanco con tachuelas blancas cubriendo la puntera y suela blanca." },
  "CL0015": { nombre:"Louboutin Low Top Charol Negro Ribete Blanco", descripcion:"Sneaker low top en charol negro combinado con cuero mate, ribetes blancos en todos los paneles, cordones blancos y suela blanca." },
  "CL0016": { nombre:"Louboutin Louis Junior Negro Ribete Rojo", descripcion:"Sneaker low top en cuero negro con ribetes de charol rojo en los paneles laterales y talonera roja, suela negra." },
  "CL0017": { nombre:"Louboutin Louis Flat Gamuza Negra", descripcion:"Sneaker high top en gamuza negra lisa con logo bordado tonal al lateral, interior en cuero natural y suela roja característica." },
  "CL0018": { nombre:"Louboutin Louis Junior Spikes Strass Negro", descripcion:"Sneaker low top en gamuza negra con panel y puntera cubiertos de cristales negros combinados con tachuelas negras." },
  "CL0019": { nombre:"Louboutin High Top Plata y Negro con Spikes", descripcion:"Sneaker high top con panel lateral en tejido metalizado plateado, gamuza negra en el contorno, tachuelas plateadas en la puntera y suela blanca." },
  "CL0020": { nombre:"Louboutin Louis Junior Spikes Camuflaje Negro", descripcion:"Sneaker low top negro con paneles en tela camuflada tono sobre tono, tachuelas negras en la puntera y el talón, y suela negra." },
  "CL0021": { nombre:"Louboutin Low Top Glitter Negro", descripcion:"Sneaker low top cubierto de glitter negro brillante, con suela negra y suela roja característica en la planta." },
  "CL0022": { nombre:"Louboutin Louis Junior Gamuza Negra", descripcion:"Sneaker low top en gamuza negra lisa, cordones negros, interior en cuero natural y suela roja característica." },
  "CL0023": { nombre:"Louboutin Low Top Cuero Granulado Negro", descripcion:"Sneaker low top en cuero granulado negro totalmente liso, cordones negros, interior en cuero natural y suela negra." },
  "CL0024": { nombre:"Louboutin Louis High Top Cuero Negro", descripcion:"Sneaker high top en cuero granulado negro sin apliques, suela blanca y suela roja característica con la firma Louboutin." },
  "CL0025": { nombre:"Louboutin Louis Junior Strass Turquesa", descripcion:"Sneaker low top en gamuza turquesa con panel lateral y puntera cubiertos de cristales azules a tono, suela turquesa." },
  "CL0026": { nombre:"Louboutin Fun Louis Junior Blanco", descripcion:"Sneaker low top en cuero blanco liso con talonera negra y la firma Louboutin en blanco, cordones blancos y suela blanca." },
  "CL0027": { nombre:"Louboutin Louis Junior Spikes Azul Marino", descripcion:"Sneaker low top en gamuza azul marino con tachuelas azules a tono cubriendo toda la puntera." },
  "CL0028": { nombre:"Louboutin Low Top Spikes Estampado Geométrico", descripcion:"Sneaker low top con paneles de gamuza negra y laterales con estampado geométrico multicolor, puntera blanca cubierta de tachuelas plateadas y suela blanca." },
  "CL0029": { nombre:"Louboutin Low Top Spikes Estampado Multicolor", descripcion:"Sneaker low top en cuero blanco con paneles de estampado multicolor tipo cómic, ribetes a rayas, puntera de charol negro con tachuelas plateadas y suela blanca." },
  "CL0030": { nombre:"Louboutin Low Top Cuero Negro Suela Blanca", descripcion:"Sneaker low top en cuero negro liso con costura en la puntera, cordones negros, interior en cuero natural y suela blanca." },
  "CL0031": { nombre:"Louboutin Low Top Cuero Blanco", descripcion:"Sneaker low top en cuero blanco liso con costura en la puntera, cordones blancos, interior en cuero natural y suela blanca." },
  "CL0032": { nombre:"Louboutin Sandalia Spikes Negra", descripcion:"Sandalia slide de goma negra con la tira superior cubierta de tachuelas negras y plantilla roja con la firma Christian Louboutin." },
  "CL0033": { nombre:"Louboutin Sandalia Strass Negra", descripcion:"Sandalia slide negra con la tira cubierta de cristales negros y logo del zapato en cristales rojos, plantilla roja y suela negra." },
  "CL0034": { nombre:"Louboutin Low Top Spikes Charol y Glitter", descripcion:"Sneaker low top con puntera de charol negro cubierta de tachuelas, panel lateral en glitter negro, talón en glitter plateado con tachuelas y suela blanca." },
  "CL0035": { nombre:"Louboutin Loubi Flip Gris con Tachuelas", descripcion:"Chancla de dedo en goma gris con la firma Louboutin en relieve en la plantilla, tachuelas en la tira y el contorno de la suela." },
  "CL0036": { nombre:"Louboutin Sandalia Goma Roja con Tachuelas", descripcion:"Sandalia slide de goma roja con logo CL en relieve en la tira y tachuelas del mismo tono, plantilla con la firma en relieve." },
  "CL0037": { nombre:"Louboutin Sandalia Goma Negra Suela Roja", descripcion:"Sandalia slide de goma negra con logo CL en relieve y tachuelas negras en la tira, sobre suela roja de contraste." },
  "CL0038": { nombre:"Louboutin Low Top Negro Panel Tejido", descripcion:"Sneaker low top con puntera de cuero negro, detalle en gamuza y panel lateral en tejido negro tipo rafia, suela negra." },
  "CL0039": { nombre:"Louboutin Low Top Azul Panel Tejido", descripcion:"Sneaker low top con puntera de cuero azul marino, detalles en gamuza y panel lateral en tejido azul con blanco, suela blanca." },
  "CL0040": { nombre:"Louboutin Low Top Estampado Tie-Dye Azul", descripcion:"Sneaker low top en tela con estampado tie-dye azul y motivos circulares, paneles de cuero negro con ribete blanco y suela blanca." },
  "CL0041": { nombre:"Louboutin Mocasín Terciopelo Negro Strass", descripcion:"Mocasín sin cordones en terciopelo negro con la firma Louboutin bordada en cristales sobre el empeine e interior en cuero natural." },
  "CL0042": { nombre:"Louboutin Mocasín Spikes Gamuza Negra", descripcion:"Mocasín sin cordones en gamuza negra con puntera de charol negro cubierta de tachuelas e interior en cuero natural." },
  "CL0043": { nombre:"Louboutin Low Top Azul con Logo CL", descripcion:"Sneaker low top en cuero azul marino con panel lateral a rayas y logo CL estampado en gris claro, cordones azules y suela azul." },
  "D&C001": { nombre:"Dolce & Gabbana Portofino Blanco Azul", descripcion:"Sneaker bajo de piel blanca con logo DG perforado en el lateral, talonera y forro interior en azul eléctrico. Suela de goma blanca gruesa." },
  "D&C002": { nombre:"Dolce & Gabbana Portofino Blanco Negro", descripcion:"Sneaker bajo de piel blanca con logo DG perforado en el lateral y talonera de piel negra. Suela de goma blanca gruesa." },
  "D&C003": { nombre:"Dolce & Gabbana Portofino Logo DG Verde", descripcion:"Sneaker de piel blanca con logo DG aplicado en piel verde, banda diagonal y talonera negras, y bloque negro con letras en el talón. Cordones blancos y suela blanca." },
  "D&C004": { nombre:"Dolce & Gabbana Portofino Blanco Rojo", descripcion:"Sneaker de piel blanca con logo DG en piel negra sobre fondo rojo, banda lateral y talonera rojas y bloque rojo con letras en el talón. Suela blanca." },
  "D&C005": { nombre:"Dolce & Gabbana Portofino Negro Total", descripcion:"Sneaker bajo de piel negra monocromática con logo DG grabado en relieve en el lateral y cinta DOLCE&GABBANA en la lengüeta. Suela negra con placa DOLCE&GABBANA." },
  "D&C006": { nombre:"Dolce & Gabbana Portofino Blanco Total", descripcion:"Sneaker bajo de piel blanca monocromática con logo DG grabado en relieve en el lateral y cinta lateral con logo. Suela blanca con placa DOLCE&GABBANA." },
  "D&C007": { nombre:"Dolce & Gabbana Portofino Corona Negro", descripcion:"Sneaker de piel negra con parche de corona bordado con cuentas, textos pintados a mano en blanco y rosa, talonera dorada y suela negra con letras blancas." },
  "D&C008": { nombre:"Dolce & Gabbana Portofino Corona Blanco", descripcion:"Sneaker de piel blanca con parche de corona bordado en dorado con cuentas de colores, textos escritos a mano, talonera dorada y detalles negros. Cordones estampados." },
  "D&C009": { nombre:"Dolce & Gabbana Sneaker Knit Blanco Negro", descripcion:"Zapatilla slip-on sin cordones en tejido elástico blanco con logo DOLCE&GABBANA impreso al lateral y tirador trasero con logo. Suela esculpida en blanco y negro." },
  "D&C011": { nombre:"Dolce & Gabbana Portofino Gabbana Plata", descripcion:"Sneaker de piel blanca con talón metalizado plateado y la palabra Gabbana pintada en negro sobre el lateral y la suela. Cordones blancos." },
  "D&C012": { nombre:"Dolce & Gabbana Portofino D&G Graffiti", descripcion:"Sneaker de piel blanca con logo D&G tipo graffiti en negro, banda lateral y talonera negras y bloque negro con letras en el talón. Suela blanca." },
  "D&C013": { nombre:"Dolce & Gabbana Sorrento Cristales Rojo", descripcion:"Zapatilla slip-on de tejido elástico cubierta de cristales rojos, con paneles negros y letras DOLCE y GABBANA en cristales transparentes. Suela roja de bloques." },
  "D&C014": { nombre:"Dolce & Gabbana Sorrento Cristales Negro", descripcion:"Zapatilla slip-on de tejido elástico cubierta de cristales negros, con paneles laterales de cristales blancos y las palabras DOLCE y GABBANA. Cinta con logo en el empeine." },
  "D&C015": { nombre:"Dolce & Gabbana Portofino Estampado Azul", descripcion:"Sneaker de piel blanca con estampado floral y de volutas en azul cobalto que continúa en la suela, talonera azul con cristales aplicados y cordones azul marino." },
  "D&C016": { nombre:"Dolce & Gabbana Portofino Talón Charol Negro", descripcion:"Sneaker de piel blanca con talonera de charol negro y la palabra Gabbana pintada a mano en dorado sobre el lateral. Suela blanca con relieve de logo." },
  "D&C017": { nombre:"Dolce & Gabbana Portofino Graffiti Escudo", descripcion:"Sneaker de piel blanca con dibujos tipo graffiti en negro y verde, escudo bordado en hilo dorado, tachuelas plateadas y talonera negra. Cordones verdes." },
  "GG001": { nombre:"Golden Goose Super-Star Blanco Estrella Gris", descripcion:"Sneaker de piel blanca con estrella lateral en ante gris, talonera de piel azul marino y puntera de ante. Suela envejecida color crema y marcado GGDB/SSTAR." },
  "GG002": { nombre:"Golden Goose Ball Star Crema Estrella Azul", descripcion:"Sneaker de piel color crema envejecida con estrella lateral azul marino, talonera metalizada dorada, estrella roja en el lateral interno y cordones rayados. Suela de goma color caramelo y marcado GGDB/BALLSTAR." },
  "GG003": { nombre:"Golden Goose Super-Star Malla Beige", descripcion:"Sneaker blanco con panel lateral de malla beige, estrella metalizada plateada, talonera azul con logo Golden Goose y puntera de ante. Firma Golden Goose escrita en el lateral y suela desgastada." },
  "GG004": { nombre:"Golden Goose Super-Star Estrella Marrón", descripcion:"Sneaker de piel blanca con estrella lateral en piel marrón texturizada, talonera negra brillante y cordones marrones. Suela envejecida con marcado GGDB/SSTAR." },
  "GG005": { nombre:"Golden Goose Stardan Blanco Verde", descripcion:"Sneaker blanco de perfil bajo con paneles texturizados, estrella lateral color crema, talonera de charol verde y firma Golden Goose escrita al lateral. Marcado GGDB/STARDAN en la suela blanca." },
  "GG006": { nombre:"Golden Goose Ball Star Blanco Estrella Negra", descripcion:"Sneaker de piel blanca craquelada con estrella lateral negra, talonera negra y logo de estrella en el lateral interno. Suela de goma color caramelo y marcado GGDB/BALLSTAR." },
  "GG007": { nombre:"Golden Goose Ball Star Crema Estrella Azul Metal", descripcion:"Sneaker de piel color crema con estrella lateral en piel azul metalizada, talonera azul y suela de goma color caramelo. Marcado GGDB/BALLSTAR en el lateral." },
  "GG008": { nombre:"Golden Goose Super-Star Blanco Estrella Ante", descripcion:"Sneaker de piel blanca con estrella lateral en ante gris claro, talonera azul marino y cordones grises. Suela envejecida en tono arena con marcado GGDB/SSTAR." },
  "GG009": { nombre:"Golden Goose Super-Star Crema Estrella Azul", descripcion:"Sneaker de piel color crema envejecida con estrella lateral en piel azul marino y talonera a juego con logo Golden Goose. Suela desgastada y marcado GGDB/SSTAR." },
  "GG010": { nombre:"Golden Goose Super-Star Blanco Estrella Roja", descripcion:"Sneaker de piel blanca con estrella lateral en ante rojo, talonera de piel oscura y cordones grises. Suela envejecida con marcado GGDB/SSTAR." },
  "GG011": { nombre:"Golden Goose Super-Star Estrella Azul Eléctrico", descripcion:"Sneaker de piel blanca con estrella lateral en ante azul eléctrico, talonera azul marino y puntera de ante claro. Suela desgastada con logo GGDB." },
  "GG012": { nombre:"Golden Goose Super-Star Estrella Gris Oscuro", descripcion:"Sneaker de piel blanca con estrella lateral y talonera en piel gris oscuro, detalle rojo en la lengüeta y cordones grises. Suela envejecida con marcado GGDB/SSTAR." },
  "GG013": { nombre:"Golden Goose Ball-Star ", descripcion:"Men's Ball Star in white nappa with dove gray suede star." },
  "BL001": { nombre:"Balenciaga Speed Trainer Negro Total", descripcion:"Sneaker tipo calcetín en tejido elástico negro con logo BALENCIAGA en blanco al lateral y suela deportiva negra envolvente." },
  "BL002": { nombre:"Balenciaga Speed 2.0 Gris", descripcion:"Sneaker tipo calcetín de punto gris con logo BALENCIAGA al lateral y suela segmentada en bloques blancos y negros." },
  "BL003": { nombre:"Balenciaga Speed 2.0 Negro y Blanco", descripcion:"Sneaker tipo calcetín de punto negro con logo BALENCIAGA en blanco y suela segmentada en bloques blancos y negros." },
  "BL004": { nombre:"Balenciaga Speed 2.0 Negro Total", descripcion:"Sneaker tipo calcetín de punto negro con logo BALENCIAGA en blanco al lateral y suela segmentada totalmente negra." },
  "BL005": { nombre:"Balenciaga Speed Negro Logo en Suela", descripcion:"Sneaker tipo calcetín de punto negro con las letras BALENCIAGA en blanco de gran tamaño recorriendo el borde de la suela negra." },
  "BL006": { nombre:"Balenciaga Track Negro", descripcion:"Sneaker deportivo negro de construcción por capas con paneles superpuestos, cordones pasados por ganchos y suela gruesa multicapa. Logo BALENCIAGA en el lateral." },
  "BL007": { nombre:"Balenciaga Sandalia Slide Peluche Gris", descripcion:"Sandalia slide de una sola tira en tejido de pelo rizado gris oscuro, con el logo Balenciaga bordado en blanco sobre franja roja y blanca." },
  "BK001": { nombre:"Birkenstock Boston Ante Gris", descripcion:"Zueco cerrado sin talón en ante gris con hebilla metálica cobre ajustable, plantilla anatómica de corcho y suela de goma marrón." },
  "BK002": { nombre:"Birkenstock Boston Ante Negro", descripcion:"Zueco cerrado sin talón en ante negro con hebilla negra mate, plantilla anatómica de corcho y suela de goma negra." },
  "BK003": { nombre:"Birkenstock Boston Ante Arena", descripcion:"Zueco cerrado sin talón en ante beige arena con hebilla metálica plateada y plantilla anatómica de corcho." },
  "BK004": { nombre:"Birkenstock Boston Ante Taupe", descripcion:"Zueco cerrado sin talón en ante taupe con hebilla metálica cobre, plantilla anatómica de corcho y suela de goma marrón." },
  "BK005": { nombre:"Birkenstock Arizona Ante Taupe", descripcion:"Sandalia de dos tiras en ante taupe con hebillas metálicas cobre ajustables, plantilla anatómica de corcho y suela de goma marrón." },
  "BK006": { nombre:"Birkenstock Arizona Ante Marrón", descripcion:"Sandalia de dos tiras en ante marrón oscuro con hebillas metálicas cobre ajustables, plantilla anatómica de corcho y suela de goma marrón." },
  "BK007": { nombre:"Birkenstock Boston Negro Herrajes Cruz", descripcion:"Zueco cerrado sin talón en ante negro con hebilla plateada labrada y aplique metálico en forma de cruz sobre la tira. Plantilla anatómica de corcho." },
  "AM001": { nombre:"Alexander McQueen Lona Negra Logo Graffiti", descripcion:"Sneaker bajo de lona negra con bordes deshilachados y logo 'McQUEEN' pintado a brocha en blanco sobre el lateral. Suela de goma gruesa negra y ojales metálicos oscuros." },
  "AM002": { nombre:"Alexander McQueen Oversized Cuero Negro", descripcion:"Sneaker Oversized de cuero liso negro total con suela gruesa negra y firma dorada 'Alexander McQueen' en el talón." },
  "AM003": { nombre:"Alexander McQueen Oversized Negro Cristales", descripcion:"Sneaker Oversized con empeine cubierto de cristales/brillantes negros y suela gruesa negra. Cordones y forro en negro." },
  "AM004": { nombre:"Alexander McQueen Oversized Blanco Talón Rojo", descripcion:"Sneaker Oversized de cuero blanco con contrafuerte de gamuza roja y suela gruesa blanca. Perforaciones laterales y logo plateado en el talón." },
  "AR001": { nombre:"AMIRI Stars Court Low Blanco Estrellas Azules", descripcion:"Sneaker bajo de lona blanca con estrellas de cuero azul aplicadas en el lateral y placa 'AMIRI' en la mediasuela. Puntera de goma blanca y suela con dibujo texturizado." },
  "AR002": { nombre:"AMIRI Sandalia Slide Logo Negra", descripcion:"Sandalia slide de goma negra con logo 'AMIRI' en relieve blanco sobre la tira y plantilla negra acolchada." },
  "AR003": { nombre:"AMIRI x Mihara Yasuhiro Skel Lona Negra", descripcion:"Sneaker bajo de lona negra con apliques de cuero blanco en forma de huesos de esqueleto, costuras contrastadas y suela ondulada blanca. Caja con doble marca AMIRI / Maison MIHARA YASUHIRO." },
  "AR004": { nombre:"AMIRI Stars Court Low Bandana Blanco", descripcion:"Sneaker bajo de lona blanca con estampado paisley tipo bandana, monograma 'MA' bordado en negro y placa 'AMIRI' en la mediasuela." },
  "AR005": { nombre:"AMIRI MA-1 Blanco y Negro", descripcion:"Sneaker chunky de cuero blanco hueso con paneles de malla negra, gamuza gris y monograma 'MA' en el lateral. Suela gruesa color crema con logo 'AMIRI'." },
  "BR001": { nombre:"Burberry Sneaker Lona Vintage Check", descripcion:"Sneaker bajo de lona con el cuadro Vintage Check beige, negro, blanco y rojo. Suela blanca de goma con logo 'BURBERRY' en relieve y cordones blancos." },
  "BR002": { nombre:"Burberry Sandalia Slide Vintage Check", descripcion:"Sandalia slide con tira ancha en cuadro Vintage Check beige y base de goma negra con 'BURBERRY' grabado en la plantilla." },
  "CH001": { nombre:"Dior B23 Low Oblique Transparente", descripcion:"Sneaker bajo B23 en lona técnica traslúcida con monograma Dior Oblique gris, suela blanca de goma con bandas negra y beige y placa 'DIOR' en el lateral." },
  "CH002": { nombre:"Dior Bota Alta Oblique Jacquard Negra", descripcion:"Bota alta con caña en jacquard Dior Oblique gris y crudo combinada con cuero negro, cordones negros y suela gruesa ondulada negra." },
  "CH003": { nombre:"Dior Sneaker Oblique Bordado Negro Total", descripcion:"Sneaker bajo todo negro con panel lateral bordado en monograma Dior Oblique tono sobre tono, cuero liso negro, cordones gruesos y suela de goma negra." },
  "CV001": { nombre:"Converse x CDG PLAY Chuck 70 Low Blanco", descripcion:"Chuck 70 bajo en lona blanca con el corazón rojo con ojos de Comme des Garçons PLAY en el lateral y suela de goma color crema." },
  "LP001": { nombre:"Loro Piana Summer Walk Gamuza Azul Marino", descripcion:"Mocasín Summer Walk de gamuza azul marino con plantilla de cuero natural firmada 'Loro Piana Summer Walk' y suela de goma ligera." },
  "LV001": { nombre:"Louis Vuitton LV Skate Negro", descripcion:"Sneaker LV Skate en cuero y malla negra con flor Monogram blanca en el lateral, cordones gruesos negros y suela blanca con detalles Monogram." },
  "LV002": { nombre:"Louis Vuitton LV Trainer Negro", descripcion:"Sneaker LV Trainer de cuero negro con logo LV blanco en la lengüeta, texturas Monogram en relieve y cordones blancos." },
  "MM001": { nombre:"Maison Margiela Replica Blanco Suela Gum", descripcion:"Sneaker Replica de cuero blanco con paneles de gamuza en tono crudo y suela de goma color caramelo." },
  "MM002": { nombre:"Maison Margiela Replica Gris Antracita", descripcion:"Sneaker Replica en cuero y gamuza gris antracita con cordones beige, numeración impresa en el lateral y suela de goma caramelo." },
  "MM003": { nombre:"Maison Margiela Replica Negro", descripcion:"Sneaker Replica en cuero y gamuza negra con cordones crudos, etiqueta blanca 'REPLICA' en la plantilla y suela de goma caramelo." },
  "MM004": { nombre:"Maison Margiela Replica Negro Paint Splatter", descripcion:"Sneaker Replica negro con salpicaduras de pintura multicolor en la puntera y el lateral, cordones crudos y suela de goma caramelo." },
  "MM005": { nombre:"Maison Margiela Replica Blanco Paint Splatter", descripcion:"Sneaker Replica blanco con salpicaduras de pintura multicolor en la puntera, forro de cuero natural y suela de goma caramelo." },
  "OFW001": { nombre:"Off-White Sneaker Cuero Negro Flecha", descripcion:"Sneaker bajo todo negro en cuero y gamuza con la flecha blanca y texto 'Off-White c/o Virgil Abloh' impresos en el lateral. Suela de goma negra estriada." },
  "OFW002": { nombre:"Off-White Vulcanized Low Negro y Turquesa", descripcion:"Sneaker Vulcanized bajo en gamuza negra con panel de rayas diagonales turquesa y blancas, flecha bordada en azul y mediasuela blanca con rayas negras." },
  "OFW003": { nombre:"Off-White Vulcanized Low Rayas Flecha Fucsia", descripcion:"Sneaker Vulcanized bajo con lona de rayas blancas y negras, gamuza negra, flecha fucsia bordada, precinto naranja de la marca y mediasuela con rayas diagonales." },
  "OFW004": { nombre:"Off-White Out Of Office Blanco y Rojo", descripcion:"Sneaker Out Of Office 'OOO' de cuero blanco con flecha y detalles en rojo, forro rojo y suela bicolor blanca y roja." },
  "ST001": { nombre:"Saint Laurent Court Classic Blanco Firma", descripcion:"Sneaker bajo de cuero blanco con la firma 'SAINT LAURENT' bordada en negro en el lateral, contrafuerte de cuero negro y suela de goma envejecida." },
  "VL001": { nombre:"Valentino Open Blanco Banda Azul", descripcion:"Sneaker Open de cuero blanco con banda central azul marino, logo dorado 'VALENTINO GARAVANI' y tachuelas en relieve en el talón sobre suela blanca." },
  "VL002": { nombre:"Valentino Open Blanco Banda Roja", descripcion:"Sneaker Open de cuero blanco con banda central roja brillante, logo dorado 'VALENTINO GARAVANI' y cordones blancos." },
  "VJ001": { nombre:"VEJA Recife Velcro Blanco Logo Negro", descripcion:"Sneaker de cuero blanco con tres tiras de velcro, logo 'V' de gamuza negra en el lateral, talón negro y 'VEJA' dorado. Suela de goma color crema." },
  "PHM001": { nombre:"Philippe Model Cuero Blanco Talón Negro", descripcion:"Sneaker bajo de cuero blanco con efecto envejecido, escudo de la marca en relieve en el lateral, contrafuerte de cuero negro y suela blanca desgastada." },
  "#001W": { nombre:"Golden Goose Super-Star Glitter Morado", descripcion:"Sneaker Super-Star de cuero blanco con estrella de gamuza gris, franja de glitter morado en el talón y suela con acabado envejecido.", marca:"GOLDEN GOOSE" },
  "#002W": { nombre:"Golden Goose Super-Star Blanco Talón Negro", descripcion:"Sneaker Super-Star de cuero blanco con estrella perforada y panel de gamuza gris, texto 'GGDB/SSTAR' en el lateral y contrafuerte de cuero negro.", marca:"GOLDEN GOOSE" },
  "#003W": { nombre:"Golden Goose Super-Star Lona Estrella Negra", descripcion:"Sneaker Super-Star en lona blanca con estrella de cuero negro, lengüeta negra y 'GOLDENGOOSE' impreso en la mediasuela envejecida.", marca:"GOLDEN GOOSE" },
  "#004W": { nombre:"Golden Goose Super-Star USA Is For Lovers", descripcion:"Sneaker Super-Star de cuero blanco con estrella blanca, contrafuerte azul texturizado y la frase manuscrita 'USA IS FOR LOVERS' en negro sobre la mediasuela.", marca:"GOLDEN GOOSE" },
  "#005W": { nombre:"Golden Goose Stardan Azul Metalizado", descripcion:"Sneaker Stardan en cuero laminado azul eléctrico con paneles blancos, estrella azul metalizada y mediasuela beige con la palabra 'STARDAN'.", marca:"GOLDEN GOOSE" },
  "#006W": { nombre:"Golden Goose Super-Star Journey Grafiti", descripcion:"Sneaker Super-Star de cuero blanco con dibujos y textos manuscritos tipo grafiti, estrella de glitter plateado, cordones amarillo neón y contrafuerte negro.", marca:"GOLDEN GOOSE" },
  "#007W": { nombre:"Golden Goose Super-Star Estrella Glitter Rosa", descripcion:"Sneaker Super-Star de cuero blanco envejecido con estrella de glitter rosa, contrafuerte azul claro y cordones grises.", marca:"GOLDEN GOOSE" },
  "#008W": { nombre:"Golden Goose Super-Star Estrella Leopardo", descripcion:"Sneaker Super-Star de cuero blanco muy envejecido con estrella de pelo estampado leopardo y contrafuerte azul metalizado.", marca:"GOLDEN GOOSE" },
  "#009W": { nombre:"Golden Goose Super-Star Glitter Plata", descripcion:"Sneaker Super-Star de cuero blanco con panel lateral de glitter plateado, estrella blanca, talón amarillo con glitter y cordones estampados de leopardo.", marca:"GOLDEN GOOSE" },
  "#010W": { nombre:"Golden Goose Old School Velcro Estrella Dorada", descripcion:"Sneaker Old School de cuero blanco con dos tiras de velcro logotipadas, estrella dorada, contrafuerte de glitter dorado y suela envejecida.", marca:"GOLDEN GOOSE" },
  "#011W": { nombre:"Louboutin Sneaker Gamuza Rosa con Tachas", descripcion:"Sneaker bajo de gamuza rosa palo con puntera cubierta de tachas cónicas del mismo tono, forro de cuero natural y suela de goma rosa.", marca:"CHRISTIAN LOUBOUTIN" },
  "#012W": { nombre:"Dior Dway Slide Azul Marino Bordado", descripcion:"Sandalia slide con tira de tejido bordado azul marino y beige con 'CHRISTIAN DIOR PARIS', plantilla de cuero negro firmada 'Christian Dior Paris'.", marca:"CHRISTIAN DIOR" },
  "#013W": { nombre:"AMIRI Stars Court Plataforma Blanco Rosa", descripcion:"Sneaker de plataforma en cuero y lona blanca con estrellas aplicadas en rosa y beige, y logo 'AMIRI' en rosa sobre la mediasuela blanca.", marca:"AMIRI" },
  "#014W": { nombre:"Louis Vuitton Mule Denim Monogram Rosa", descripcion:"Mule plana con tira ancha de denim rosa con Monogram en relieve, placa dorada 'LOUIS VUITTON PARIS' y plantilla de cuero rosa firmada en dorado.", marca:"LOUIS VUITTON" },
  "#015W": { nombre:"Louboutin Stiletto Charol Negro Suela Roja", descripcion:"Zapatilla de tacón de aguja alto en charol negro con punta fina y la característica suela roja. Caja original 'Christian Louboutin Paris' en la foto.", marca:"CHRISTIAN LOUBOUTIN" },
  "#016W": { nombre:"Dior Slide Denim Azul Logo Bordado", descripcion:"Sandalia slide con tira de denim azul oscuro y medallón ovalado 'Dior' bordado tono sobre tono, plantilla de cuero beige con el sello de la casa.", marca:"CHRISTIAN DIOR" },
  "#017W": { nombre:"Dior Dway Slide Dorado Mariposas", descripcion:"Sandalia slide con tira bordada en hilo dorado con 'CHRISTIAN DIOR PARIS' y plantilla blanca con estampado de mariposas doradas firmada 'Christian Dior Paris'.", marca:"CHRISTIAN DIOR" },
"GGW001": { nombre:"GOLDEN GOOSE Super-Star", descripcion:"Women’s Super-Star in worn white leather with tone-on-tone star" },
"GGW002": { nombre:"GOLDEN GOOSE Super-Star", descripcion:"Women's Super-Star in silver glitter with ice-gray suede star"}, 
"GGW003": { nombre:"GOLDEN GOOSE Ball Star ", descripcion:"Women's Super-Star in silver glitter with ice-gray suede star"}, 
"GGW004": { nombre:"GOLDEN GOOSE Ball Star", descripcion:"Women's Ball Star with silver Swarovski "},
"GGW005": { nombre:"GOLDEN GOOSE Ball Star", descripcion:" Women's Ball Star in white nappa leather with green leather star and heel tab"}, 
"GGW006": { nombre:"GOLDEN GOOSE Ball Star", descripcion:"Women’s Ball Star Wishes in white leather with a red star and heel tab"}, 
"GGW007": { nombre:"GOLDEN GOOSE Ball Star", descripcion:"Women’s Ball Star Wishes in white nappa leather with bright blue star and heel tab"}, 
"GGW008": { nombre:"GOLDEN GOOSEBall Star", descripcion:"Women’s Ball Star Wishes in white nappa leather with bright blue star and heel tab"}, 



















  "#ROW1": { nombre:"Reloj Colgante Octagonal Royal Pop Colores", descripcion:"Lámina con ocho variantes de un reloj colgante de caja octogonal con tornillos a la vista, esfera texturizada tipo tapicería y fondo esqueletado con la leyenda 'Royal Pop'; cada versión combina caja y correa de un color distinto (rojo, azul, blanco, amarillo, verde, negro, celeste y azul marino).", marca:"AUDEMARS PIGUET" },
  "#ROW2": { nombre:"Louis Vuitton S-Lock Messenger Monogram Eclipse", descripcion:"Bolso messenger de lona Monogram Eclipse negra y gris con cierre S-Lock metálico negro grabado 'LOUIS VUITTON PARIS' y correa de hombro ancha ajustable.", marca:"LOUIS VUITTON" },
  "#ROW3": { nombre:"Goyard Tarjetero Goyardine Varios Colores", descripcion:"Tarjeteros planos en lona Goyardine con el estampado de chevrones y logo 'GOYARD' impreso, disponibles en muchos colores (rojo, azul, rosa, blanco, negro, naranja, amarillo, verde, burdeos, celeste, gris y beige).", marca:"GOYARD" },
  "#ROW4": { nombre:"Alo Mochila Neopreno Negra", descripcion:"Mochila compacta de neopreno negro con etiqueta cuadrada 'alo' en el frente, bolsillo delantero con cierre, asa superior y cierres negros.", marca:"ALO" },
  "#001R": { nombre:"Chaqueta Varsity Off-White AC Milan Gris", descripcion:"Cazadora universitaria con cuerpo gris verdoso y mangas de piel gris, botones a presion y punos con rayas. Lleva parches bordados de A.C. Milan, la letra M, flechas de Off-White y texto 'Virgil Abloh' en la manga.", marca:"Off-White" },
  "#002R": { nombre:"Chaqueta Varsity Off-White Negra y Crema", descripcion:"Cazadora universitaria negra con mangas de piel color crema y ribetes a rayas. Parches verdes con 'OFF' y '13', flechas en la manga y texto 'OFF-WHITE c/o VIRGIL ABLOH EST.2013'.", marca:"Off-White" },
  "#003R": { nombre:"Chaqueta Varsity Off-White AC Milan Beige", descripcion:"Cazadora universitaria beige con mangas de piel blanca, parches dorados y negros de A.C. Milan, numero 23, letras ACM y las flechas de Off-White con 'Virgil Abloh' en la manga.", marca:"Off-White" },
  "#004R": { nombre:"Sueter Off-White Logo Tejido", descripcion:"Sueter de punto con cuello redondo y logotipo 'Off-White(TM)' tejido en grande al frente. Disponible en azul claro y en negro.", marca:"Off-White" },
  "#005R": { nombre:"Camiseta Gallery Dept. Hollywood", descripcion:"Camiseta de manga corta con estampado 'GALLERY DEPT. HOLLYWOOD, CA.' en la espalda y logo pequeno al frente. Version negra con letras verdes y version blanca con letras rosadas.", marca:"Gallery Dept." },
  "#006R": { nombre:"Camiseta Amiri Arts and Crafts", descripcion:"Camiseta de corte holgado con estampado central 'AMIRI LA CA - IMAGINATION AND DREAMS - ARTS AND CRAFTS'. Disponible en negro y en blanco.", marca:"Amiri" },
  "#007R": { nombre:"Camiseta Essentials Fear of God", descripcion:"Camiseta basica de cuello redondo con logo 'ESSENTIALS FEAR OF GOD' en relieve tono sobre tono en el pecho. Se muestra en beige, verde salvia, coral, gris topo y negro.", marca:"Fear of God Essentials" },
  "#008R": { nombre:"Short Essentials Fear of God Beige", descripcion:"Short deportivo color hueso con cintura elastica, cordon ajustable y bolsillos laterales. Logo 'ESSENTIALS FEAR OF GOD' en relieve sobre la pierna.", marca:"Fear of God Essentials" },
  "#009R": { nombre:"Camiseta AMI Paris Corazon Rojo", descripcion:"Camiseta de cuello redondo con el logo corazon 'Ami de Coeur' bordado en rojo en el pecho. Se muestra en blanco, gris, camel, verde, azul, azul marino y negro.", marca:"AMI Paris" },
  "#010R": { nombre:"Short Moncler Negro Parche Logo", descripcion:"Short de felpa negro con cintura elastica, cordon y bolsillos laterales. Parche circular del logo Moncler en la pierna izquierda.", marca:"Moncler" },
  "#011R": { nombre:"Short Moncler Negro Parche Rojo", descripcion:"Short deportivo negro con cintura elastica y cordon, con parche circular rojo del logo Moncler en la pierna.", marca:"Moncler" },
  "#012R": { nombre:"Short Moncler Negro Tejido Ligero", descripcion:"Short de tejido tecnico liso en negro con cintura elastica y cordon con topes metalicos. Parche del logo Moncler en tono negro sobre la pierna.", marca:"Moncler" },
  "#013R": { nombre:"Camiseta Chrome Hearts Cruz Negra", descripcion:"Camiseta negra de manga corta con una cruz gotica blanca de gran tamano en la espalda sobre cruces delineadas y el banner 'CHROME HEARTS'. Cruz pequena estampada en la manga.", marca:"Chrome Hearts" },
  "#014R": { nombre:"Camiseta Chrome Hearts Bandera USA", descripcion:"Camiseta blanca con estampado de la bandera de Estados Unidos enmarcada en cruces goticas y el banner 'CHROME HEARTS' debajo, en la espalda.", marca:"Chrome Hearts" },
  "#015R": { nombre:"Camiseta Chrome Hearts Letras Goticas", descripcion:"Camiseta negra con bloque de letras goticas blancas y rojas en la espalda y banner pequeno 'CHROME HEARTS' en la parte inferior.", marca:"Chrome Hearts" },
  "#016R": { nombre:"Camiseta Chrome Hearts Cruces Azules", descripcion:"Camiseta blanca con tres cruces goticas estampadas en azul en la espalda, cruz pequena en la manga y banner 'CHROME HEARTS' en azul abajo.", marca:"Chrome Hearts" },
  "#017R": { nombre:"Camiseta Chrome Hearts Herradura Lengua", descripcion:"Camiseta negra con estampado de herradura y letras goticas 'CHROME HEARTS' rodeando una lengua roja en la espalda, mas banner del logo en la parte baja.", marca:"Chrome Hearts" },
  "#018R": { nombre:"Camiseta Negra Cruces Goticas Multicolor", descripcion:"Camiseta negra de manga corta con una gran cruz gotica delineada en blanco y cruces pequenas de colores en la espalda, acompanada de letras goticas." },
  "#019R": { nombre:"Hoodie Alo Yoga Negro Logo Bordado", descripcion:"Sudadera con capucha negra, cordones a juego y bolsillo canguro. Lleva el logo 'alo' bordado en blanco en el pecho.", marca:"Alo Yoga" },
  "#020R": { nombre:"Polo Casablanca Cuello Contraste", descripcion:"Polo de pique con cuello blanco de ribete verde y parche bordado del monograma Casablanca en el pecho. Se muestra en azul marino, blanco y negro.", marca:"Casablanca" },
  "#021R": { nombre:"Camiseta AllSaints Negra Underground", descripcion:"Camiseta negra de corte holgado con estampado 'ALLSAINTS' en blanco, caracteres japoneses y 'LONDON' en la espalda.", marca:"AllSaints" },
  "#022R": { nombre:"Hoodie ASSC x CDG PLAY Negro", descripcion:"Sudadera con capucha negra con estampado en la espalda 'ANTI SOCIAL SOCIAL CLUB' en blanco combinado con corazones rojos de PLAY Comme des Garcons.", marca:"Anti Social Social Club x Comme des Garcons PLAY" },
  "#023R": { nombre:"Camiseta Amiri Negra Logo Blanco", descripcion:"Camiseta negra de corte oversize con el logotipo 'AMIRI' en letras superpuestas blancas estampado en el pecho.", marca:"Amiri" },
  "#024R": { nombre:"Camiseta Amiri Negra Lavada Logo Azul", descripcion:"Camiseta negra con efecto lavado y el logo 'AMIRI' estampado en azul claro en la parte alta de la espalda.", marca:"Amiri" },
  "#025R": { nombre:"Camisa Amiri Hollywood California", descripcion:"Camisa de manga corta con cuello camisero abierto y botonadura completa, con la firma 'Amiri Hollywood California' estampada al frente y en grande en la espalda. Version negra y version blanca con letras rojas.", marca:"Amiri" },
  "#026R": { nombre:"Camiseta Amiri Leopardo", descripcion:"Camiseta con estampado cuadrado de un leopardo entre hojas y el logo 'AMIRI' en dorado debajo; pequeno al frente y grande en la espalda. En blanco y en negro.", marca:"Amiri" },
  "#027R": { nombre:"Camisa Amiri Resort Club", descripcion:"Camisa de manga corta con cuello solapa. La blanca lleva un estampado tipo aerografo de playa con palmeras y el texto 'Amiri Resort Club' en la espalda; la negra lleva la firma 'Amiri' aerografiada en el pecho.", marca:"Amiri" },
  "#028R": { nombre:"Camisa Amiri Estampado California", descripcion:"Camisa de manga corta con cuello solapa y estampado all over en azul y blanco con paisajes de California (Golden Gate, Rose Bowl, secuoyas) y cenefa de flores rosadas.", marca:"Amiri" },
  "#029R": { nombre:"Camiseta Off-White Blanca Bocinas", descripcion:"Camiseta blanca de corte holgado con estampado fotografico de una torre de bocinas y el texto 'OFF-WHITE c/o VIRGIL ABLOH' debajo.", marca:"Off-White" },
  "#031R": { nombre:"Camiseta ASSC Negra Radiografia", descripcion:"Camiseta negra con estampado en la espalda de una radiografia de caja toracica sobre el texto 'ANTI SOCIAL SOCIAL CLUB' en rojo.", marca:"Anti Social Social Club" },
  "#032R": { nombre:"Camiseta ASSC Garras Naranja", descripcion:"Camiseta con el texto 'ANTI SOCIAL SOCIAL CLUB' en naranja atravesado por zarpazos, pequeno al frente y grande en la espalda. Se muestra en azul marino, blanco y negro.", marca:"Anti Social Social Club" },
  "#034R": { nombre:"Camiseta ASSC Goodyear Zepelines", descripcion:"Camiseta blanca con estampado en la espalda de zepelines apilados que llevan las palabras 'ANTI SOCIAL SOCIAL CLUB' y uno con el logo Goodyear.", marca:"Anti Social Social Club x Goodyear" },
  "#035R": { nombre:"Camiseta ASSC x VLONE Mariposas", descripcion:"Camiseta con la V amarilla de VLONE rodeada de mariposas y el texto 'ANTI SOCIAL SOCIAL CLUB' encima; logo pequeno al frente y estampado grande en la espalda. En blanco y en negro.", marca:"Anti Social Social Club x VLONE" },
  "#036R": { nombre:"Camiseta ASSC Abejas Amarillas", descripcion:"Camiseta con el logo 'ANTI SOCIAL SOCIAL CLUB' en amarillo tipo panal rodeado de abejas, pequeno al frente y grande en la espalda. Se muestra en negro, blanco y gris oscuro.", marca:"Anti Social Social Club" },
  "#037R": { nombre:"Camiseta ASSC Burn It Down", descripcion:"Camiseta con estampado tipo grafiti: la blanca dice 'BURN IT DOWN' en negro y la negra lleva 'ANTI SOCIAL SOCIAL CLUB' en blanco difuminado.", marca:"Anti Social Social Club" },
  "#038R": { nombre:"Camiseta ASSC Logo Clasico", descripcion:"Camiseta con el logo clasico 'ANTI SOCIAL SOCIAL CLUB' pequeno al frente y en grande en la espalda. Se muestra en rosado, azul claro, crema, blanco y negro.", marca:"Anti Social Social Club" },
  "#039R": { nombre:"Camiseta ASSC Serpiente Negra/Blanca", descripcion:"Camiseta de manga corta con logo Anti Social Social Club en verde y una serpiente roja estampada. Se muestra en negro con estampado pequeño al frente y en blanco con estampado grande a la espalda.", marca:"Anti Social Social Club" },
  "#040R": { nombre:"Short Balenciaga Logo Negro/Blanco", descripcion:"Short deportivo con cintura elastica y cordon, bolsillos laterales y el logo Balenciaga estampado en grande al frente. Disponible en negro y en blanco.", marca:"Balenciaga" },
  "#041R": { nombre:"Camiseta Balenciaga Logo Tape", descripcion:"Camiseta oversize de cuello redondo con el logo Balenciaga estampado al pecho en estilo cinta adhesiva. La foto muestra las opciones blanco, azul, negro, vino y verde.", marca:"Balenciaga" },
  "#042R": { nombre:"Camiseta Balenciaga Negra Logo Espalda", descripcion:"Camiseta negra de manga corta con el monograma BB y el nombre Balenciaga estampados en blanco sobre la espalda en tipografia de cinta.", marca:"Balenciaga" },
  "#043R": { nombre:"Camiseta Balenciaga Logos Multiples", descripcion:"Camiseta de cuello alto con varios logotipos Balenciaga estampados al frente en rojo, negro y colores, y cinta con el nombre de la marca en el cuello y las mangas. Se muestra en blanco y en negro.", marca:"Balenciaga" },
  "#044R": { nombre:"Camiseta BAPE Miami Camo Negra", descripcion:"Camiseta negra con camuflaje BAPE en tono sobre tono, cabeza de simio y texto MIAMI A BATHING APE en rosado, mas escudo bordado del Inter Miami en el pecho.", marca:"BAPE (A Bathing Ape) x Inter Miami" },
  "#045R": { nombre:"Camiseta Casablanca Equipement Sportif", descripcion:"Camiseta blanca de manga corta con estampado a la espalda de raquetas, bolsos y tenis ilustrados bajo el texto casa y Equipement Sportif.", marca:"Casablanca" },
  "#047R": { nombre:"Camiseta Casablanca Avion Blanca", descripcion:"Camiseta blanca con estampado frontal de un avion supersonico dentro de un triangulo azul, el logo Casablanca arriba y la palabra Aiiiir en cursiva.", marca:"Casablanca" },
  "#048R": { nombre:"Camiseta Casablanca Flores Blanca", descripcion:"Camiseta blanca con estampado frontal de manos en oracion, flores de colores y un globo terraqueo entre las palabras CASA y BLANCA.", marca:"Casablanca" },
  "#051R": { nombre:"Conjunto Casablanca Olas Turquesa", descripcion:"Conjunto de camisa manga corta con cuello solapa y short a juego, en blanco con franjas de olas turquesa y rojas; la camisa lleva bolsillo con montana y sol bordados.", marca:"Casablanca" },
  "#052R": { nombre:"Conjunto Casablanca Corazones Degradado", descripcion:"Conjunto de camisa y short con estampado geometrico de corazones en degradado de negro a turquesa y blanco, con cuello a rayas.", marca:"Casablanca" },
  "#053R": { nombre:"Conjunto Casablanca Casa Way Crema", descripcion:"Conjunto de camisa manga corta y short en tono crema con ribetes a rayas rojas, verdes y celestes, y estampado Casa Way en rombo a la espalda.", marca:"Casablanca" },
  "#054R": { nombre:"Conjunto Casablanca Olas Verde", descripcion:"Conjunto de camisa con cuello solapa y short a juego en verde jade con estampado de espirales y olas blancas.", marca:"Casablanca" },
  "#055R": { nombre:"Conjunto Casablanca Tennis Club Celeste", descripcion:"Conjunto de camisa y short blancos con franjas celestes en cuello, mangas y bajos; la camisa lleva bolsillo con logo Casablanca Tennis Club a color.", marca:"Casablanca" },
  "#056R": { nombre:"Conjunto Casablanca Conejo Blanco", descripcion:"Conjunto de camisa y short blancos con ribetes a rayas verdes y rojas, y bolsillo con un conejo ilustrado en el pecho.", marca:"Casablanca" },
  "#057R": { nombre:"Camisa Casablanca Afiche Blanca", descripcion:"Camisa manga corta blanca con cuello y bajos en franjas amarillas, verdes y rojas, bolsillo con logo y un afiche enrollado con el monograma estampado a la espalda.", marca:"Casablanca" },
  "#058R": { nombre:"Camisa Casablanca Unity Is Power Verde", descripcion:"Camisa de manga larga en degradado verde con cuello y punos estampados con guirnaldas rosadas, y emblema Casablanca Tennis Club Unity Is Power a la espalda.", marca:"Casablanca" },
  "#059R": { nombre:"Camiseta Casablanca Hongo Blanca", descripcion:"Camiseta blanca con estampado a la espalda de un hongo azul sobre ondas de colores enmarcado entre las palabras CASA y BLANCA en rojo.", marca:"Casablanca" },
  "#060R": { nombre:"Camiseta Casablanca Tennis Club", descripcion:"Camiseta de manga corta con el clasico estampado frontal Casablanca Tennis Club: triangulo verde con cancha de tenis, palmera y pelota. Disponible en blanco y en negro.", marca:"Casablanca" },
  "#061R": { nombre:"Jeans Chrome Hearts Cruces Parches", descripcion:"Pantalon de mezclilla azul claro desgastado con parches de cruces en cuero negro cosidos en piernas y bolsillos, y letras goticas bordadas en la pretina.", marca:"Chrome Hearts" },
  "#062R": { nombre:"Hoodie Chrome Hearts Cruces de Colores", descripcion:"Sudadera con capucha y estampado de multiples cruces multicolor en la espalda, con la firma Chrome Hearts en letra gotica. Se muestra en blanco hueso y en negro.", marca:"Chrome Hearts" },
  "#063R": { nombre:"Camiseta Chrome Hearts Herradura Rosada", descripcion:"Camiseta negra con estampado en la espalda de herradura con letras goticas Chrome Hearts y una cruz rosada al centro, mas banderola rosada debajo.", marca:"Chrome Hearts" },
  "#064R": { nombre:"Camiseta Chrome Hearts Tres Cruces", descripcion:"Camiseta de manga corta con tres cruces azul, rosada y roja estampadas al pecho sobre la banderola Chrome Hearts, y cruz adicional en la manga. Disponible en blanco y negro.", marca:"Chrome Hearts" },
  "#065R": { nombre:"Camiseta Chrome Hearts Herradura Spray", descripcion:"Camiseta de manga corta con herradura y cruz Chrome Hearts estampadas con efecto spray difuminado, pequena al pecho en la blanca y grande en la negra.", marca:"Chrome Hearts" },
  "#066R": { nombre:"Camiseta Chrome Hearts Cruces al Cuello", descripcion:"Camiseta de manga corta con parches de cruces negras aplicados alrededor del cuello. Se muestra en blanco y en negro tono sobre tono.", marca:"Chrome Hearts" },
  "#067R": { nombre:"Short Moncler Negro Logo", descripcion:"Short de bano negro en tejido liviano con cintura elastica y cordon, bolsillos laterales y parche del logo Moncler en la pierna.", marca:"Moncler" },
  "#069R": { nombre:"Camiseta Off-White Flechas Rojas", descripcion:"Camiseta blanca con el logo OFF en rojo al pecho y estampado grande en la espalda de las flechas Off-White con carita sonriente y el texto WHITE.", marca:"Off-White" },
  "#070R": { nombre:"Camiseta Off-White Caravaggio Negra", descripcion:"Camiseta con logo OFF al pecho y estampado en la espalda de una pintura clasica en blanco y negro. Se muestra en blanco y en negro.", marca:"Off-White" },
  "#071R": { nombre:"Camiseta Off-White Golden Ratio Verde", descripcion:"Camiseta con texto Golden Ratio y logo circular OFF en verde al frente, y flechas cruzadas con manchas verdes estampadas en la espalda. Disponible en blanco y negro.", marca:"Off-White" },
  "#072R": { nombre:"Short Off-White Flechas Grafiti", descripcion:"Short deportivo de felpa con cintura elastica y bolsillo trasero, con las flechas Off-White estampadas en estilo grafiti en gris, rojo o azul. Disponible en negro y blanco.", marca:"Off-White" },
  "#073R": { nombre:"Camiseta Off-White Pintura Lavada", descripcion:"Camiseta negra con lavado desgastado y estampado en la espalda de una pintura clasica a color con texto Off-White c/o Virgil Abloh Est. 2013.", marca:"Off-White" },
  "#074R": { nombre:"Camiseta CDG Play Corazon Rojo", descripcion:"Camiseta blanca de manga corta con el corazon rojo de ojos de Comme des Garcons PLAY estampado en el costado inferior y etiqueta PLAY en el cuello.", marca:"Comme des Garcons PLAY" },
  "#075R": { nombre:"Camiseta Represent Horizons", descripcion:"Camiseta oversize con estampado frontal Horizons by Represent sobre una ilustracion tipo pintura y el logo Represent en la parte baja de la espalda. Se muestra en gris jaspeado y en negro lavado.", marca:"Represent" }
};

// Unifica marcas que aparecían escritas de varias formas o como colaboración,
// para que el filtro de marcas no las muestre repetidas.
// La clave se compara en minúsculas y sin espacios extra, así "AMIRI",
// "Amiri" y "amiri " terminan siendo la misma marca.
const marcasEquivalentes = {
  "christian louboutin":  "Christian Louboutin",
  "louis vouitton":       "Louis Vuitton",
  "louis vuitton":        "Louis Vuitton",
  "aleaxander mcqueen":   "Alexander McQueen",
  "alexander mcqueen":    "Alexander McQueen",
  "christian dior":       "Christian Dior",
  "dolce&gabanna":        "Dolce & Gabbana",
  "dolce & gabbana":      "Dolce & Gabbana",
  "golden goose":         "Golden Goose",
  "balenciaga":           "Balenciaga",
  "birkenstock":          "Birkenstock",
  "burberry":             "Burberry",
  "amiri":                "Amiri",
  "off-white":            "Off-White",
  "off white":            "Off-White",
  "maison margiela":      "Maison Margiela",
  "saint laurent":        "Saint Laurent",
  "loro piana":           "Loro Piana",
  "philip model":         "Philippe Model",
  "philippe model":       "Philippe Model",
  "valentino":            "Valentino",
  "veja":                 "Veja",
  "BE@RBRICK":            "Bearbricks",
  "moncler":              "Moncler",
  "casablanca":           "Casablanca",
  "chrome hearts":        "Chrome Hearts",
  "represent":            "Represent",
  "goyard":               "Goyard",
  "audemars piguet":      "Audemars Piguet",
  "gallery dept.":        "Gallery Dept.",
  "ami paris":            "AMI Paris",
  "allsaints":            "AllSaints",
  "alo":                  "Alo Yoga",
  "alo yoga":             "Alo Yoga",
  "b4pe":                 "B4PE",
  "fear of god essentials": "Fear of God Essentials",
  "comme des garcons play": "Comme des Garçons PLAY",
  "comme des garçons play": "Comme des Garçons PLAY",
  "anti social social club": "Anti Social Social Club",
  // Colaboraciones: se agrupan bajo la marca principal.
  "anti social social club x comme des garcons play": "Anti Social Social Club",
  "anti social social club x goodyear": "Anti Social Social Club",
  "anti social social club x vlone": "Anti Social Social Club",
  "bape (a bathing ape) x inter miami": "BAPE"
};

function canonizarMarca(marca){
  if(!marca) return null;
  const clave = String(marca).trim().toLowerCase();
  return marcasEquivalentes[clave] || String(marca).trim();
}

function normalizarProducto(producto, indice){
  const imagenes = (producto.imagenes && producto.imagenes.filter(Boolean).length)
    ? [...new Set(producto.imagenes.filter(Boolean))]
    : [producto.imagen].filter(Boolean);

  const real = nombresReales[producto.codigo] || {};

  return {
    ...producto,
    // Orden en que se agregó al catálogo. El último agregado es el más nuevo,
    // así la sección "Nuevo en HAUSLINE" se actualiza sola.
    orden: indice,
    // nombreReal / descripcionReal salen del mapa de arriba. Si no hay entrada,
    // se usa el nombre y la descripción originales: nunca se pierde nada.
    nombreReal: producto.nombreReal || real.nombre || "",
    descripcionReal: producto.descripcionReal || real.descripcion || "",
    // Marca detectada en la foto para los productos que no tenían.
    marca: canonizarMarca(producto.marca || real.marca),
    imagen: producto.imagen || imagenes[0] || "",
    imagenes,
    colores: producto.colores || [],
    disponiblePorEncargo: producto.disponiblePorEncargo !== undefined ? producto.disponiblePorEncargo : true,
    entregaInmediata: producto.entregaInmediata || false,
    tallasEntregaInmediata: producto.tallasEntregaInmediata || [],
    coloresEntregaInmediata: producto.coloresEntregaInmediata || [],
    cantidadDisponible: producto.cantidadDisponible !== undefined ? producto.cantidadDisponible : null,
    precioEntregaInmediata: producto.precioEntregaInmediata !== undefined ? producto.precioEntregaInmediata : null,
    envioRapido: producto.envioRapido || false,
    destacado: producto.destacado || false,

    // Ajuste de foto por producto (opcional):
    //   imagenFit: "contain"  -> muestra la foto completa, sin recortar
    //   escalaImagen: 1.15    -> acerca el producto dentro del recuadro
    imagenFit: producto.imagenFit || "",
    escalaImagen: producto.escalaImagen || null,

    // Etiquetas opcionales — todas apagadas. Enciende la que quieras
    // poniendo la propiedad en true dentro del producto. Ver ETIQUETAS_OPCIONALES.
    masVendido: producto.masVendido || false,
    ultimasUnidades: producto.ultimasUnidades || false,
    exclusivo: producto.exclusivo || false,
    preventa: producto.preventa || false,
    edicionLimitada: producto.edicionLimitada || false,
    restock: producto.restock || false,
    recomendado: producto.recomendado || false
  };
}

let productos = productosBase.map(normalizarProducto);

// ============================================================
// PROMOCIONES  ←  AQUÍ PONES LAS PROMOS
// ------------------------------------------------------------
// Una promoción se aplica a varios productos de una sola vez.
// Para activarla: activa: true. Para apagarla: activa: false.
// Cuando pasa la fecha "hasta", se apaga sola y vuelven los
// precios normales, sin que tengas que tocar nada.
//
// A quién se le aplica (usa UNA de estas tres):
//   marca:     "Balenciaga"            -> toda esa marca
//   categoria: "Ropa"                  -> toda esa categoría
//   codigos:   ["CL0001","BL001"]      -> solo esos productos
//   (si no pones ninguna, se aplica a TODO el catálogo)
//
// Ejemplos listos para usar — solo cambia activa a true:
// ============================================================

const PROMOCIONES = [
  {
    nombre: "Promoción de temporada",
    descuento: 15,                        // 15% de descuento
    categoria: "Zapatos",                    // se aplica a toda la ropa
    hasta: "2026-12-31T23:59:59",
    activa: false                      // ← ponlo en true para encenderla
  },
  {
    nombre: "Descuento Balenciaga",
    descuento: 5,
    marca: "Balenciaga",
    hasta: "2026-12-31T23:59:59",
    activa: false
  },
  {
    nombre: "Liquidación",
    descuento: 20,
    codigos: ["CL0001", "CL0002"],        // solo estos dos códigos
    hasta: "2026-12-31T23:59:59",
    activa: false
  }
];

function fechaVigente(fecha){
  if(!fecha) return false;
  return new Date() < new Date(fecha);
}

// Devuelve la promoción que le toca a un producto, o null si no tiene.
// Tiene prioridad el precio de oferta puesto en el producto.
function ofertaDe(producto){
  // 1) Oferta propia del producto (precioOferta + promocionHasta)
  if(producto.precioOferta && fechaVigente(producto.promocionHasta)){
    return {
      precio: Number(producto.precioOferta),
      nombre: producto.nombrePromocion || "Oferta",
      descuento: producto.descuento ||
        Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100)
    };
  }

  // 2) Promoción general de la lista PROMOCIONES
  const promo = PROMOCIONES.find(p => {
    if(!p.activa || !fechaVigente(p.hasta)) return false;
    if(p.codigos)   return p.codigos.includes(producto.codigo);
    if(p.marca)     return producto.marca === p.marca;
    if(p.categoria) return producto.categoria === p.categoria;
    return true;
  });

  if(promo){
    return {
      precio: Math.round(producto.precio * (1 - promo.descuento / 100)),
      nombre: promo.nombre,
      descuento: promo.descuento
    };
  }

  return null;
}

function ofertaVigente(producto){
  return !!ofertaDe(producto);
}

// El precio depende del contexto:
// - modoInmediata = true  -> se está viendo desde "Entrega inmediata"
// - modoInmediata = false -> se está viendo desde el catálogo normal (encargo)
function precioVigente(producto, modoInmediata){
  if(modoInmediata && producto.entregaInmediata && producto.precioEntregaInmediata){
    return Number(producto.precioEntregaInmediata);
  }
  const oferta = ofertaDe(producto);
  if(oferta) return oferta.precio;
  return Number(producto.precio);
}

function buscarProducto(codigo){
  const c = String(codigo || "").trim().toUpperCase();
  return productos.find(p => String(p.codigo).trim().toUpperCase() === c) || null;
}

// Nombre que se muestra al cliente: el real si existe, si no el original.
function nombreProducto(producto){
  return producto.nombreReal || producto.nombre || producto.codigo;
}

function descripcionProducto(producto){
  return producto.descripcionReal || producto.descripcion || "";
}

// Marca visible: si el producto no tiene marca registrada usa la categoría
// para no mostrar "null" en pantalla.
function marcaProducto(producto){
  return producto.marca || "HAUSLINE";
}

// ============================================================
// ETIQUETAS OPCIONALES
// ------------------------------------------------------------
// Todas vienen APAGADAS. Para encender una, agrega la propiedad
// al producto en el catálogo de arriba. Ejemplo:
//
//   { codigo:"BL001", ..., masVendido:true, ultimasUnidades:true }
//
// Se muestran solas en la tarjeta y en la página del producto.
// Para desactivarla, borra la línea o ponla en false.
//
// ¿Quieres una etiqueta nueva? Agrega una línea aquí con el nombre
// de la propiedad, el texto y el color, y ya funciona en toda la web.
// Colores disponibles: verde · azul · rojo · blanco · dorado · morado
// ============================================================

const ETIQUETAS_OPCIONALES = [
  { propiedad: "envioRapido",     texto: "Envío rápido",     color: "azul"   },
  { propiedad: "masVendido",      texto: "Más vendido",      color: "dorado" },
  { propiedad: "ultimasUnidades", texto: "Últimas unidades", color: "rojo"   },
  { propiedad: "exclusivo",       texto: "Exclusivo",        color: "morado" },
  { propiedad: "preventa",        texto: "Preventa",         color: "azul"   },
  { propiedad: "edicionLimitada", texto: "Edición limitada", color: "dorado" },
  { propiedad: "restock",         texto: "De vuelta",        color: "verde"  },
  { propiedad: "recomendado",     texto: "Recomendado",      color: "blanco" }
];

// Devuelve las etiquetas opcionales activas de un producto.
function etiquetasActivas(producto){
  return ETIQUETAS_OPCIONALES.filter(e => producto[e.propiedad]);
}

// Cuántos de los últimos productos agregados llevan la etiqueta "Nuevo".
const CANTIDAD_NUEVOS = 20;

// La etiqueta "Nuevo" es automática: la llevan los últimos productos
// que agregaste al catálogo. Al agregar uno al final de la lista,
// entra solo y el más antiguo deja de estar marcado.
// Si prefieres forzarlo a mano, pon destacadoNuevo:true en el producto.
function esNuevo(producto){
  if(producto.destacadoNuevo) return true;
  return producto.orden >= productos.length - CANTIDAD_NUEVOS;
}

function porcentajeDescuento(producto){
  const oferta = ofertaDe(producto);
  return oferta ? Number(oferta.descuento) || 0 : 0;
}

// Nombre de la promoción, para mostrarlo en la página del producto.
function nombrePromocion(producto){
  const oferta = ofertaDe(producto);
  return oferta ? oferta.nombre : "";
}

// Tallas que se pueden pedir.
// Desde "Entrega inmediata" solo salen las que tienes físicamente.
// Desde el catálogo normal salen TODAS, porque se piden por encargo.
function tallasDisponibles(producto, modoInmediata){
  if(modoInmediata && producto.entregaInmediata && producto.tallasEntregaInmediata.length){
    return producto.tallasEntregaInmediata;
  }
  return producto.tallas || [];
}

function coloresDisponibles(producto, modoInmediata){
  if(modoInmediata && producto.entregaInmediata && producto.coloresEntregaInmediata.length){
    return producto.coloresEntregaInmediata;
  }
  return producto.colores || [];
}

// ============================================================
// LOGOS DE MARCAS
// ------------------------------------------------------------
// Archivos reales dentro de imgP/marcas/. Para agregar un logo nuevo:
// guarda el PNG en esa carpeta y escribe aquí "MARCA": "archivo.png".
// Si una marca no tiene logo, la tarjeta muestra el nombre en texto.
// ============================================================

const logosMarcas = {
  "Alexander McQueen":      "mcqueen.jpg",
  "Amiri":                  "amiri.jpg",
  "Balenciaga":             "balenciaga.jpg",
  "Birkenstock":            "birkenstock.jpg",
  "Burberry":               "burberry.jpg",
  "Christian Dior":         "dior.jpg",
  "Christian Louboutin":    "louboutin.jpg",
  "Dolce & Gabbana":        "dolcegabbana.jpg",
  "Golden Goose":           "goldengoose.jpg",
  "Loro Piana":             "loropiana.jpg",
  "Louis Vuitton":          "louisvuitton.jpg",
  "Maison Margiela":        "margiela.jpg",
  "Off-White":              "offwhite.jpg",
  "Philippe Model":         "philippemodel.jpg",
  "Saint Laurent":          "saintlaurent.jpg",
  "Valentino":              "valentino.jpg",
  "Veja":                   "veja.jpg",
  "Comme des Garçons PLAY": "cdg.jpg"
};

const tarjetasMarcas = {
  "Alexander McQueen":      "ALEXANDER MCQUEEN.png",
  "Amiri":                  "AMIRI.png",
  "Balenciaga":             "BALENCIAGA.png",
  "Birkenstock":            "BIRKENSTOCK.png",
  "Burberry":               "BURBERRU.png",
  "Christian Dior":         "DIOR.png",
  "Christian Louboutin":    "LOUBUTINS.png",
  "Dolce & Gabbana":        "DOLCE GABNNA.png",
  "Golden Goose":           "GOLDEN GOOSE.png",
  "Loro Piana":             "LORO PIANA.png",
  "Louis Vuitton":          "LV.png",
  "Maison Margiela":        "MAISON MARGIELA.png",
  "Off-White":              "OFF WHITE.png",
  "Philippe Model":         "PHILIP MODEL.png",
  "Saint Laurent":          "SAINT LAURENT.png",
  "Valentino":              "VALENTINO.png",
  "Veja":                   "VEJA.png",
  "Comme des Garçons PLAY": "COMME DES.png"
};

function logoDeMarca(marca){
  const archivo = logosMarcas[marca];
  return archivo ? "imgP/marcas/" + archivo : "";
}

function tarjetaDeMarca(marca){
  const archivo = tarjetasMarcas[marca];
  return archivo ? "imgP/marcas 2/" + archivo : "";
}

// Catálogo de marcas ordenado por cantidad de productos.
// SOLO se muestran las marcas que tienen su logo/portada en imgP/marcas/.
// Para que aparezca una marca nueva: sube su imagen y agrégala a logosMarcas.
const marcasCatalogo = [...new Set(productos.map(p => p.marca).filter(Boolean))]
  .map(marca => ({
    nombre: marca,
    logo: logoDeMarca(marca),
    tarjeta: tarjetaDeMarca(marca),
    portada: (productos.find(p => p.marca === marca) || {}).imagen || "",
    total: productos.filter(p => p.marca === marca).length
  }))
  .filter(m => m.logo)   // ← solo marcas con logo subido
  .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));

// ============================================================
// GUÍA DE TALLAS
// ------------------------------------------------------------
// Equivalencias estándar de calzado (sistema Brannock / Mondopoint),
// el mismo que usan las marcas deportivas y europeas.
// CM = largo real del pie, la medida más confiable.
// ============================================================

const guiaTallas = {
  calzado: {
    titulo: "Guía de tallas — Calzado",
    nota: "Mide tu pie descalzo, del talón al dedo más largo, y busca la medida en CM. Es la equivalencia más confiable entre marcas.",
    columnas: ["EUR", "US", "CM"],
    filas: [
      ["36", "4",    "22.5"],
      ["37", "4.5",  "23.0"],
      ["38", "5.5",  "24.0"],
      ["39", "6.5",  "24.5"],
      ["40", "7",    "25.0"],
      ["41", "8",    "26.0"],
      ["42", "8.5",  "26.5"],
      ["43", "9.5",  "27.5"],
      ["44", "10",   "28.0"],
      ["45", "11",   "29.0"],
      ["46", "11.5", "29.5"]
    ]
  },
  ropa: {
    titulo: "Guía de tallas — Ropa",
    nota: "Medidas de referencia sobre la prenda. Si estás entre dos tallas, elige la mayor para un calce holgado.",
    columnas: ["Talla", "Pecho (cm)", "Largo (cm)"],
    filas: [
      ["S",   "96 – 101",  "68"],
      ["M",   "101 – 106", "71"],
      ["L",   "106 – 111", "74"],
      ["XL",  "111 – 116", "76"],
      ["XXL", "116 – 122", "79"]
    ]
  }
};

// Elige la guía correcta según el producto.
function guiaParaProducto(producto){
  const tallas = producto.tallas || [];
  if(!tallas.length) return null;
  // Si las tallas son números, es calzado; si son letras (S/M/L), es ropa.
  const esNumerica = tallas.every(t => /^\d+([.,]\d+)?$/.test(String(t).trim()));
  return esNumerica ? guiaTallas.calzado : guiaTallas.ropa;
}
