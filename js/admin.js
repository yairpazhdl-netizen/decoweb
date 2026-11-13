import {db,auth,doc,setDoc,collection,addDoc,getDocs,query,where,deleteDoc,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "./firebase.js";
import {cargar,DEF,PRESETS,aplicarTema} from "./datos.js";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const L={paquetes:["n","e","p","inc"],extras:["n","p"],zonas:["n","p"],montajes:["n","e","d","i"]};
const NOM={paquetes:"Paquetes",extras:"Extras",zonas:"Traslado por zona",montajes:"Estilos del catálogo (el precio “desde” sale de los paquetes)"};
const T={n:"Nombre",p:"Precio",inc:"Qué incluye",e:"Tipo de evento",d:"Descripción",i:"Emoji"};
const GEN={negocio:"Nombre del negocio",tel:"WhatsApp (código de país, solo números)",iva:"IVA (%)",anticipo:"Anticipo (%)"};
const NEW={
 paquetes:()=>({n:"Nuevo paquete",e:D.eventos[0],p:0,inc:""}),extras:()=>({n:"Nuevo extra",p:0}),zonas:()=>({n:"Nueva zona",p:0}),
 montajes:()=>({id:"m"+Date.now(),n:"Nuevo estilo",e:D.eventos[0],d:"",p:0,i:"🎀",c:["#f6c4d8","#d9a3e6"]})};
let D;
onAuthStateChanged(auth,async u=>{$("#login").hidden=!!u;$("#panel").hidden=!u;if(u){D=await cargar();aplicarTema(D.tema);render()}});
$("#f").onsubmit=async e=>{e.preventDefault();$("#err").textContent="";
  try{await signInWithEmailAndPassword(auth,$("#em").value,$("#pw").value)}catch(er){$("#err").textContent="Correo o contraseña incorrectos."}};
$("#out").onclick=()=>signOut(auth);
$("#save").onclick=async()=>{$("#st").textContent="Guardando…";
  try{await setDoc(doc(db,"catalogo","datos"),D);$("#st").textContent="Guardado."}catch(e){$("#st").textContent="No se pudo guardar. Revisa tus reglas de Firestore."}};
function campo(l,i,f,r){
  const a=`data-l="${l}" data-i="${i}" data-f="${f}"`;
  if(f==="e")return `<label>${T[f]}<select ${a}>${l==="paquetes"?`<option value="" ${r.e?"":"selected"}>Todos los eventos</option>`:""}${D.eventos.map(e=>`<option ${e===r.e?"selected":""}>${esc(e)}</option>`).join("")}</select></label>`;
  return `<label>${T[f]}<input ${a} ${f==="p"?'type="number" min="0"':""} value="${esc(r[f])}"></label>`;
}
function render(){
  const g=Object.keys(GEN).map(k=>`<label>${GEN[k]}<input data-g="${k}" value="${esc(D[k])}"></label>`).join("");
  const ls=Object.keys(L).map(l=>`<fieldset><legend>${NOM[l]}</legend>${D[l].map((r,i)=>`<div class="it">${L[l].map(f=>campo(l,i,f,r)).join("")}<button type="button" class="btn alt" data-del="${l}" data-i="${i}">Quitar</button></div>`).join("")}<div class="acts"><button type="button" class="btn alt" data-add="${l}">Agregar</button>${l==="paquetes"?'<button type="button" class="btn alt" data-ejemplo="1">Cargar paquetes de ejemplo por evento</button>':""}</div></fieldset>`).join("");
  const lg=`<fieldset><legend>Logo</legend>${D.logo?`<img src="${D.logo}" alt="Logo actual" style="height:68px;max-width:200px;object-fit:contain;display:block;margin-bottom:8px">`:'<p class="note">Aún no has subido un logo desde aquí.</p>'}<label>Subir logo<input type="file" accept="image/*" data-logo="1"></label>${D.logo?'<div class="acts"><button type="button" class="btn alt" data-rmlogo="1">Quitar logo</button></div>':""}</fieldset>`;
  const TM=D.tema||PRESETS["Morado y dorado"];
  const tm=`<fieldset><legend>Colores de la página</legend><div class="acts" style="margin:0 0 8px">${Object.keys(PRESETS).map(k=>`<button type="button" class="btn alt" data-preset="${esc(k)}">${k}</button>`).join("")}</div><div class="it">${[["ac","Color principal (botones)"],["gold","Color de acento (precios y líneas)"],["bg","Fondo"],["ink","Texto"]].map(([k,n])=>`<label>${n}<input type="color" data-c="${k}" value="${TM[k]}" style="height:42px;padding:2px"></label>`).join("")}</div><div class="acts"><button type="button" class="btn alt" data-rmtema="1">Restablecer colores</button></div><p class="note">Se ve al instante aquí y se publica al pulsar “Guardar cambios”.</p></fieldset>`;
  const fo=D.montajes.map(m=>`<label>${esc(m.n)}<input type="file" accept="image/*" multiple data-ph="${m.id}"></label><div class="th" id="th-${m.id}"></div>`).join("");
  $("#ed").innerHTML=`${lg}${tm}<fieldset><legend>Datos generales</legend>${g}</fieldset>${ls}<fieldset><legend>Fotos de los eventos</legend>${fo}</fieldset>`;
  D.montajes.forEach(m=>fotos(m.id));
}
async function fotos(id){
  const el=$("#th-"+id);if(!el)return;
  const s=await getDocs(query(collection(db,"fotos"),where("m","==",id)));
  el.innerHTML=s.docs.map(d=>`<figure style="margin:0"><img src="${d.data().d}" alt=""><button type="button" class="btn alt" data-df="${d.id}" data-m="${id}" style="width:100%;margin-top:4px">Quitar</button></figure>`).join("");
}
$("#ed").oninput=e=>{const t=e.target,d=t.dataset;
  if(d.g)D[d.g]=d.g==="negocio"?t.value:d.g==="tel"?t.value.replace(/\D/g,""):+t.value||0;
  if(d.l)D[d.l][d.i][d.f]=d.f==="p"?+t.value||0:t.value;
  if(d.c){D.tema={...(D.tema||PRESETS["Morado y dorado"]),[d.c]:t.value};aplicarTema(D.tema)}};
$("#ed").onclick=async e=>{const d=e.target.dataset;
  if(d.rmlogo){delete D.logo;render()}
  if(d.preset){D.tema={...PRESETS[d.preset]};aplicarTema(D.tema);render()}
  if(d.rmtema){delete D.tema;aplicarTema(null);render()}
  if(d.ejemplo&&confirm("Esto reemplaza tus paquetes actuales por los de ejemplo. ¿Continuar?")){D.paquetes=structuredClone(DEF.paquetes);render()}
  if(d.add){D[d.add].push(NEW[d.add]());render()}
  if(d.del){D[d.del].splice(+d.i,1);render()}
  if(d.df){await deleteDoc(doc(db,"fotos",d.df));fotos(d.m)}};
$("#ed").onchange=e=>{const t=e.target,id=t.dataset.ph;
  if(t.dataset.logo){const fl=t.files[0];if(!fl)return;const r=new FileReader();
    r.onload=()=>{const im=new Image();im.onload=()=>{
      const s=Math.min(1,300/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      let u=c.toDataURL("image/png");if(u.length>600000)u=c.toDataURL("image/jpeg",.8);
      D.logo=u;render();$("#st").textContent="Logo cargado. Pulsa “Guardar cambios” para publicarlo."};im.src=r.result};
    r.readAsDataURL(fl);return}
  if(!id)return;
  [...t.files].forEach(fl=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=async()=>{
    const s=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    try{await addDoc(collection(db,"fotos"),{m:id,d:c.toDataURL("image/jpeg",.7),t:Date.now()});fotos(id)}catch(er){alert("No se pudo subir la foto. Revisa tus reglas de Firestore.")}};
    im.src=r.result};r.readAsDataURL(fl)});t.value=""};
