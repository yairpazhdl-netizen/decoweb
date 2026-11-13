import {db,auth,doc,setDoc,collection,addDoc,getDocs,query,where,deleteDoc,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "./firebase.js";
import {cargar,DEF,PRESETS,aplicarTema,calendario} from "./datos.js";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const L={paquetes:["n","p","e","inc"],extras:["n","p"],zonas:["n","p"],montajes:["n","e","d","i"]};
const T={n:"Nombre",p:"Precio",inc:"Qué incluye",e:"Tipo de evento",d:"Descripción",i:"Emoji"};
const GEN={negocio:"Nombre del negocio",tel:"WhatsApp (código de país, solo números)",anticipo:"Anticipo (%)",horaExtra:"Costo por hora extra si se prolonga el evento (0 para no mostrar monto)"};
const TABS=[["gen","General"],["paq","Paquetes"],["ext","Extras y traslado"],["est","Estilos y fotos"],["cal","Calendario"],["col","Logo y colores"]];
const NEW={
 paquetes:()=>({n:"Nuevo paquete",e:evSel,p:0,inc:""}),extras:()=>({n:"Nuevo extra",p:0}),zonas:()=>({n:"Nueva zona",p:0}),
 montajes:()=>({id:"m"+Date.now(),n:"Nuevo estilo",e:D.eventos[0],d:"",p:0,i:"🎀",c:["#f6c4d8","#d9a3e6"]})};
let D,tab="gen",evSel="",openId=null,calAd;
const lstOc=()=>(D.ocupadas||[]).map(f=>new Date(f+"T00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})).join(", ")||"Ninguna";
const sucio=()=>{$("#st").textContent="Cambios sin guardar."};

onAuthStateChanged(auth,async u=>{$("#login").hidden=!!u;$("#panel").hidden=!u;
  if(u){D=await cargar();aplicarTema(D.tema);evSel=D.eventos[0]||"";render()}});
$("#f").onsubmit=async e=>{e.preventDefault();$("#err").textContent="";
  try{await signInWithEmailAndPassword(auth,$("#em").value,$("#pw").value)}catch(er){$("#err").textContent="Correo o contraseña incorrectos."}};
$("#out").onclick=()=>signOut(auth);
$("#save").onclick=async()=>{$("#st").textContent="Guardando…";
  try{await setDoc(doc(db,"catalogo","datos"),D);$("#st").textContent="Guardado."}catch(e){$("#st").textContent="No se pudo guardar. Revisa tus reglas de Firestore."}};

function campo(l,i,f,r){
  const a=`data-l="${l}" data-i="${i}" data-f="${f}"`,w=f==="inc"||f==="d"?' style="grid-column:1/-1"':"";
  if(f==="e")return `<label${w}>${T[f]}<select ${a}>${l==="paquetes"?`<option value="" ${r.e?"":"selected"}>Todos los eventos</option>`:""}${D.eventos.map(e=>`<option ${e===r.e?"selected":""}>${esc(e)}</option>`).join("")}</select></label>`;
  return `<label${w}>${T[f]}<input ${a} ${f==="p"?'type="number" min="0"':""} value="${esc(r[f])}"></label>`;
}
const fila=(l,i)=>`<div class="it">${L[l].map(f=>campo(l,i,f,D[l][i])).join("")}<button type="button" class="btn alt" data-del="${l}" data-i="${i}">Quitar</button></div>`;
const lista=(l,t)=>`<fieldset><legend>${t}</legend>${D[l].map((r,i)=>fila(l,i)).join("")}<div class="acts"><button type="button" class="btn alt" data-add="${l}">Agregar</button></div></fieldset>`;

function logoHtml(){return `<fieldset><legend>Logo</legend>${D.logo?`<img src="${D.logo}" alt="Logo actual" style="height:68px;max-width:200px;object-fit:contain;display:block;margin-bottom:8px">`:'<p class="note">Aún no has subido un logo desde aquí.</p>'}<label>Subir logo<input type="file" accept="image/*" data-logo="1"></label>${D.logo?'<div class="acts"><button type="button" class="btn alt" data-rmlogo="1">Quitar logo</button></div>':""}</fieldset>`}
function temaHtml(){
  const TM=D.tema||PRESETS["Morado y dorado"];
  return `<fieldset><legend>Colores de la página</legend><div class="acts" style="margin:0 0 8px">${Object.keys(PRESETS).map(k=>`<button type="button" class="btn alt" data-preset="${esc(k)}">${k}</button>`).join("")}</div><div class="it">${[["ac","Color principal (botones)"],["gold","Color de acento (precios y líneas)"],["bg","Fondo"],["ink","Texto"]].map(([k,n])=>`<label>${n}<input type="color" data-c="${k}" value="${TM[k]}" style="height:42px;padding:2px"></label>`).join("")}</div><div class="acts"><button type="button" class="btn alt" data-rmtema="1">Restablecer colores</button></div><p class="note">Se ve al instante aquí y se publica al pulsar “Guardar cambios”.</p></fieldset>`;
}
const VISTA={
 gen:()=>`<fieldset><legend>Datos generales</legend>${Object.keys(GEN).map(k=>`<label>${GEN[k]}<input data-g="${k}" value="${esc(D[k])}"></label>`).join("")}</fieldset>`,
 paq:()=>{
  const n=e=>D.paquetes.filter(p=>(p.e||"")===e).length;
  const chips=["",...D.eventos].map(e=>`<button type="button" class="chip" aria-pressed="${e===evSel}" data-ev="${esc(e)}">${e||"Todos los eventos"} (${n(e)})</button>`).join("");
  const ids=D.paquetes.map((p,i)=>i).filter(i=>(D.paquetes[i].e||"")===evSel);
  return `<p class="note">Elige un tipo de evento para ver y editar solo sus paquetes.</p><div class="chips" style="margin:10px 0 16px">${chips}</div>
  <h2 style="margin-bottom:10px">${evSel?esc(evSel):"Paquetes para todos los eventos"}</h2>
  ${ids.map(i=>`<div class="card">${fila("paquetes",i)}</div>`).join("")||'<p class="note">Este evento todavía no tiene paquetes.</p>'}
  <div class="acts"><button type="button" class="btn" data-add="paquetes">Agregar paquete a ${evSel?esc(evSel):"todos los eventos"}</button><button type="button" class="btn alt" data-ejemplo="1">Cargar paquetes de ejemplo</button></div>`},
 ext:()=>lista("extras","Extras")+lista("zonas","Traslado por zona (según el lugar del evento)"),
 est:()=>`<div class="acts" style="margin:0 0 12px"><button type="button" class="btn" data-add="montajes">Agregar estilo</button></div><p class="note">Toca un estilo para editarlo y subir sus fotos. El precio “desde” sale de los paquetes.</p>`+
  D.montajes.map((m,i)=>`<details class="card" ${m.id===openId?"open":""}><summary><b>${esc(m.i)} ${esc(m.n)}</b> <span class="note">${esc(m.e)}</span></summary><div class="it">${L.montajes.map(f=>campo("montajes",i,f,m)).join("")}<button type="button" class="btn alt" data-del="montajes" data-i="${i}">Quitar estilo</button></div><label>Fotos de este estilo<input type="file" accept="image/*" multiple data-ph="${m.id}"></label><div class="th" id="th-${m.id}"></div></details>`).join(""),
 cal:()=>`<p class="note">Toca un día para marcarlo como ocupado y vuelve a tocarlo para liberarlo. Tus clientes verán estas fechas como ocupadas, pero podrán preguntar por disponibilidad de todos modos.</p><div id="calAd"></div><p class="note" id="nOc">Fechas ocupadas: ${lstOc()}</p>`,
 col:()=>logoHtml()+temaHtml()
};
function render(){
  $("#tabs").innerHTML=TABS.map(([k,n])=>`<button type="button" class="chip" aria-pressed="${k===tab}" data-tab="${k}">${n}</button>`).join("");
  $("#ed").innerHTML=VISTA[tab]();
  if(tab==="est")D.montajes.forEach(m=>fotos(m.id));
  if(tab==="cal")calAd=calendario($("#calAd"),{ocupadas:()=>D.ocupadas||[],marcar:true,alElegir:f=>{const l=new Set(D.ocupadas||[]);l.has(f)?l.delete(f):l.add(f);D.ocupadas=[...l].sort();sucio();calAd.refrescar();$("#nOc").textContent="Fechas ocupadas: "+lstOc()}});
}
async function fotos(id){
  const el=$("#th-"+id);if(!el)return;
  const s=await getDocs(query(collection(db,"fotos"),where("m","==",id)));
  el.innerHTML=s.docs.map(d=>`<figure style="margin:0"><img src="${d.data().d}" alt=""><button type="button" class="btn alt" data-df="${d.id}" data-m="${id}" style="width:100%;margin-top:4px">Quitar</button></figure>`).join("");
}
$("#tabs").onclick=e=>{const k=e.target.dataset.tab;if(k){tab=k;render()}};
$("#ed").oninput=e=>{const t=e.target,d=t.dataset;
  if(d.g)D[d.g]=d.g==="negocio"?t.value:d.g==="tel"?t.value.replace(/\D/g,""):+t.value||0;
  if(d.l)D[d.l][d.i][d.f]=d.f==="p"?+t.value||0:t.value;
  if(d.c){D.tema={...(D.tema||PRESETS["Morado y dorado"]),[d.c]:t.value};aplicarTema(D.tema)}
  if(d.g||d.l||d.c)sucio();
  if(d.l==="paquetes"&&d.f==="e")render()};
$("#ed").onclick=async e=>{const d=e.target.dataset;
  if(d.ev!==undefined){evSel=d.ev;render()}
  if(d.rmlogo){delete D.logo;sucio();render()}
  if(d.preset){D.tema={...PRESETS[d.preset]};aplicarTema(D.tema);sucio();render()}
  if(d.rmtema){delete D.tema;aplicarTema(null);sucio();render()}
  if(d.ejemplo&&confirm("Esto reemplaza tus paquetes actuales por los de ejemplo. ¿Continuar?")){D.paquetes=structuredClone(DEF.paquetes);sucio();render()}
  if(d.add){const n=NEW[d.add]();D[d.add].push(n);if(d.add==="montajes")openId=n.id;sucio();render()}
  if(d.del&&confirm("¿Quitar este elemento?")){D[d.del].splice(+d.i,1);sucio();render()}
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
