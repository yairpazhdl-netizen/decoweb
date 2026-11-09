import {db,doc,getDoc} from "./firebase.js";
export const fmt=n=>(+n||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});
// Datos de ejemplo: se usan mientras no hayas guardado nada desde /admin.html
export const DEF={
 negocio:"Tu Negocio de Decoración",tel:"5210000000000",iva:16,anticipo:50,
 eventos:["Boda","XV años","Cumpleaños","Baby shower","Bautizo","Corporativo"],
 paquetes:[
  {n:"Básico",p:3500,inc:"Backdrop y globos de ambiente"},
  {n:"Intermedio",p:6800,inc:"Backdrop con flores, arreglos decorativos e iluminación cálida"},
  {n:"Premium",p:12500,inc:"Ambientación completa, arco, arreglos florales, iluminación y letras"}],
 extras:[{n:"Letras luminosas",p:1200},{n:"Mesa de dulces",p:1800},{n:"Iluminación ambiental",p:2200},{n:"Arco de globos",p:1500}],
 zonas:[{n:"Local",p:0},{n:"Hasta 20 km",p:400},{n:"De 20 a 50 km",p:900},{n:"Foráneo",p:1800}],
 montajes:[
  {id:"m1",n:"Jardín rústico",e:"Boda",d:"Arco de madera, flores secas y luces cálidas",p:9800,i:"🌿",c:["#a8c3a0","#e8d9b5"]},
  {id:"m2",n:"Blanco y dorado",e:"Boda",d:"Elegancia clásica con telas, velas y detalles dorados",p:14500,i:"✨",c:["#f1e3c0","#d9b76a"]},
  {id:"m3",n:"Princesa",e:"XV años",d:"Rosa, pedrería y un gran backdrop de entrada",p:8900,i:"👑",c:["#f6c4d8","#d9a3e6"]},
  {id:"m4",n:"Noche de gala",e:"XV años",d:"Azul profundo, plata y luces de ambiente",p:11200,i:"🌙",c:["#3b4a8a","#a9b4e0"]},
  {id:"m5",n:"Safari",e:"Cumpleaños",d:"Globos orgánicos, follaje y animales de peluche",p:4200,i:"🦁",c:["#e3c37a","#8fb07a"]},
  {id:"m6",n:"Unicornio",e:"Cumpleaños",d:"Colores pastel, arcoíris y mesa de dulces",p:4600,i:"🦄",c:["#f7c6e0","#c9d6f7"]},
  {id:"m7",n:"Nubes y estrellas",e:"Baby shower",d:"Tonos suaves, nubes de globos y letrero con el nombre",p:3900,i:"☁️",c:["#cfe3f3","#f3e6cf"]},
  {id:"m8",n:"Bautizo clásico",e:"Bautizo",d:"Blanco, flores frescas y detalles de recuerdo",p:3600,i:"🕊️",c:["#f4f1ea","#cfd9e8"]},
  {id:"m9",n:"Lanzamiento de marca",e:"Corporativo",d:"Backdrop con logotipo, arco de globos y mesa de bienvenida",p:7500,i:"🎤",c:["#2a1b3d","#7a3e6b"]}]
};
export async function cargar(){
  try{const s=await getDoc(doc(db,"catalogo","datos"));if(s.exists())return s.data()}catch(e){console.warn("Firestore:",e)}
  return structuredClone(DEF);
}
