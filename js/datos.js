import {db,doc,getDoc} from "./firebase.js";
export const fmt=n=>(+n||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});
// Datos de ejemplo: se usan mientras no hayas guardado nada desde /admin.html
const BASE={"Boda":[9000,15000,26000],"XV años":[7500,13000,22000],"Cumpleaños":[3500,6000,10500],"Baby shower":[3200,5500,9500],"Bautizo":[3000,5200,9000],"Corporativo":[6500,11000,19000]};
const INC=["Backdrop y globos de ambiente","Backdrop con flores, arreglos decorativos e iluminación cálida","Ambientación completa, arco, arreglos florales, iluminación y letras"];
const PAQ=Object.entries(BASE).flatMap(([e,ps])=>["Básico","Medio","Premium"].map((n,i)=>({e,n,p:ps[i],inc:INC[i]})));
export const DEF={
 negocio:"Tu Negocio de Decoración",tel:"5210000000000",iva:16,anticipo:50,
 eventos:["Boda","XV años","Cumpleaños","Baby shower","Bautizo","Corporativo"],
 paquetes:PAQ,
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

// ---- Paleta de colores ----
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>"#"+hx(a).map((v,i)=>Math.round(v+(hx(b)[i]-v)*t).toString(16).padStart(2,"0")).join("");
const lum=h=>{const [r,g,b]=hx(h);return(.299*r+.587*g+.114*b)/255};
export const PRESETS={
 "Morado y dorado":{ac:"#7a3e6b",gold:"#a87a2c",bg:"#fbf8fc",ink:"#2a1b3d"},
 "Verde salvia":{ac:"#4f7a5c",gold:"#b08a3e",bg:"#f6f8f4",ink:"#1f2d24"},
 "Rosa y champagne":{ac:"#c2587f",gold:"#b8913f",bg:"#fff8f6",ink:"#3a2230"},
 "Azul marino":{ac:"#24427a",gold:"#b58a2e",bg:"#f5f7fb",ink:"#14213d"},
 "Noche elegante":{ac:"#d9a95a",gold:"#d9a95a",bg:"#17101f",ink:"#f3ecf8"}
};
export function aplicarTema(t){
  let el=document.getElementById("tema");
  if(!el){el=document.createElement("style");el.id="tema";document.head.appendChild(el)}
  if(!t){el.textContent="";return}
  const dark=lum(t.bg)<.45,sf=dark?mix(t.bg,"#ffffff",.08):mix(t.bg,"#ffffff",.65);
  el.textContent=`:root{--ac:${t.ac};--gold:${t.gold};--bg:${t.bg};--ink:${t.ink};--sf:${sf};--on:${lum(t.ac)>.6?"#1b1024":"#ffffff"};--line:${mix(t.bg,t.ink,.16)};--mute:${mix(t.ink,t.bg,.38)};color-scheme:${dark?"dark":"light"}}`;
}
