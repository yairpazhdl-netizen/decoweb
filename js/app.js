import {db,collection,getDocs,query,where} from "./firebase.js";
import {cargar,fmt,aplicarTema} from "./datos.js";
const $=s=>document.querySelector(s);
const D=await cargar();
const folio="COT-"+new Date().toISOString().slice(2,10).replace(/-/g,"")+"-"+(Math.floor(Math.random()*900)+100);
let filtro="Todos",pre=null;
const nz=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const desde=m=>{const v=D.paquetes.filter(p=>!p.e||p.e===m.e).map(p=>p.p);return v.length?Math.min(...v):m.p};
aplicarTema(D.tema);$("#neg").textContent=D.negocio;document.title=D.negocio;
const lg=$("#logo");lg.onload=()=>{lg.hidden=false};lg.onerror=()=>lg.remove();lg.src=D.logo||"img/logo.png";
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>goto(b.dataset.v));
function goto(v){
  ["cat","cot"].forEach(k=>$("#"+k).classList.toggle("hide",k!==v));
  document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v));
  v==="cat"?rCat():rCot();scrollTo(0,0);
}
function rCat(){
  const list=D.montajes.filter(m=>filtro==="Todos"||m.e===filtro);
  $("#cat").innerHTML=`<div class="chips">${["Todos",...D.eventos].map(e=>`<button class="chip" aria-pressed="${e===filtro}" data-e="${e}">${e}</button>`).join("")}</div>
  <div class="grid">${list.map(m=>`<article class="tile"><div class="pic" style="background:linear-gradient(135deg,${m.c[0]},${m.c[1]})">${m.i}</div>
  <div class="b"><h3>${m.n}</h3><p>${m.e}. ${m.d}</p><span class="pr">Desde ${fmt(desde(m))}</span>
  <div class="acts" style="margin:0"><button class="btn alt" data-m="${D.montajes.indexOf(m)}">Ver más</button><button class="btn" data-e="${m.e}" data-go="1">Cotizar</button></div></div></article>`).join("")||'<p class="note">Aún no hay estilos para este evento.</p>'}</div>`;
  $("#cat").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{filtro=b.dataset.e;rCat()});
  $("#cat").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{pre=b.dataset.e;goto("cot")});
  $("#cat").querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>modal(+b.dataset.m));
}
async function modal(i){
  const m=D.montajes[i];
  const ph=[135,45,225,315].map(a=>`<div class="ph" style="background:linear-gradient(${a}deg,${m.c[0]},${m.c[1]})">${m.i}<small>Foto próximamente</small></div>`).join("");
  const o=document.createElement("div");o.className="ov";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label",m.n);
  o.innerHTML=`<div class="mod"><button class="btn alt cl" type="button">Cerrar</button><h2>${m.n}</h2><p class="note">${m.e}</p><p>${m.d}</p><p class="pr">Desde ${fmt(desde(m))}</p><div class="gal">${ph}</div><div class="acts"><button class="btn go" type="button">Cotizar este estilo</button></div></div>`;
  const x=()=>{o.remove();document.removeEventListener("keydown",k)},k=e=>{if(e.key==="Escape")x()};
  o.onclick=e=>{if(e.target===o)x()};o.querySelector(".cl").onclick=x;
  o.querySelector(".go").onclick=()=>{x();pre=m.e;goto("cot")};
  document.addEventListener("keydown",k);document.body.appendChild(o);o.querySelector(".cl").focus();
  try{
    const s=await getDocs(query(collection(db,"fotos"),where("m","==",m.id)));
    if(!s.empty)o.querySelector(".gal").innerHTML=s.docs.map(d=>`<img src="${d.data().d}" alt="Foto del montaje ${m.n}">`).join("");
  }catch(e){console.warn(e)}
}
function rCot(){
  $("#cot").innerHTML=`<div class="cols"><form onsubmit="return false">
  <fieldset><legend>Tu evento</legend><label for="cli">Nombre del cliente</label><input id="cli" autocomplete="off">
  <label for="bus">Buscar categoría o estilo</label><input id="bus" type="search" placeholder="Ej. boda, XV años, unicornio" autocomplete="off"><p id="busn" class="note" role="status"></p><div class="two"><div><label for="evt">Tipo de evento</label><select id="evt">${D.eventos.map(e=>`<option>${e}</option>`).join("")}</select></div>
  <div><label for="fec">Fecha</label><input id="fec" type="date"></div></div>
  <label for="zona">Lugar del evento</label><select id="zona">${D.zonas.map((z,i)=>`<option value="${i}">${z.n}</option>`).join("")}</select></fieldset>
  <fieldset><legend>Paquete</legend><div id="pq"></div></fieldset>
  <fieldset><legend>Extras</legend>${D.extras.map((x,i)=>`<label class="opt"><input type="checkbox" id="x${i}"><span>${x.n} <b>${fmt(x.p)}</b></span></label>`).join("")}</fieldset>
  </form><aside id="res" aria-live="polite"></aside></div>`;
  if(pre)$("#evt").value=pre;pre=null;paq();$("#evt").addEventListener("input",paq);
  $("#bus").addEventListener("input",()=>{
    const q=nz($("#bus").value.trim()),ev=$("#evt"),act=ev.value;
    const l=D.eventos.filter(e=>nz(e).includes(q)||D.montajes.some(m=>m.e===e&&nz(m.n).includes(q)));
    $("#busn").textContent=l.length?"":"No hay categorías con ese nombre.";
    ev.innerHTML=(l.length?l:D.eventos).map(e=>`<option${e===act?" selected":""}>${e}</option>`).join("");
    ev.dispatchEvent(new Event("input",{bubbles:true}));
  });
  $("#cot form").addEventListener("input",calc);calc();
}
function paq(){
  const ev=$("#evt").value;
  $("#pq").innerHTML=D.paquetes.map((p,i)=>(!p.e||p.e===ev)?`<label class="opt"><input type="radio" name="paq" value="${i}"><span><b>${p.n}</b> ${fmt(p.p)}<small>${p.inc}</small></span></label>`:"").join("")||'<p class="note">Aún no hay paquetes para este evento.</p>';
  const r=document.querySelector("[name=paq]");if(r)r.checked=true;
}
function calc(){
  const sel=document.querySelector("[name=paq]:checked");
  if(!sel){$("#res").innerHTML='<p class="note">Todavía no hay paquetes para este tipo de evento.</p>';return}
  const p=D.paquetes[+sel.value],z=D.zonas[+$("#zona").value];
  const L=[[`Paquete ${p.n}`,p.p]];
  D.extras.forEach((x,i)=>{if($("#x"+i).checked)L.push([x.n,x.p])});
  if(z.p)L.push([`Traslado: ${z.n}`,z.p]);
  const sub=L.reduce((a,l)=>a+l[1],0),iva=0,tot=sub+iva,ant=tot*D.anticipo/100;
  const f=$("#fec").value,fd=f?new Date(f+"T00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"}):"Por definir";
  const cli=$("#cli").value.trim()||"Cliente",evt=$("#evt").value;
  const txt=`Cotización ${folio} (${D.negocio})\nCliente: ${cli}\nEvento: ${evt}, ${fd}\n`+L.map(l=>`- ${l[0]}: ${fmt(l[1])}`).join("\n")+(iva?`\nIVA: ${fmt(iva)}`:"")+`\nTotal: ${fmt(tot)}\nAnticipo (${D.anticipo}%): ${fmt(ant)}`;
  $("#res").innerHTML=`<h2>Cotización</h2><p class="note">${folio}. Vigencia de 15 días.</p>
  <p><b>${cli}</b><br>${evt}, ${fd}</p>
  <table>${L.map(l=>`<tr><td>${l[0]}</td><td>${fmt(l[1])}</td></tr>`).join("")}
  ${iva?`<tr><td>IVA (${D.iva}%)</td><td>${fmt(iva)}</td></tr>`:""}
  <tr class="tot"><td>Total</td><td>${fmt(tot)}</td></tr>
  <tr><td>Anticipo para apartar fecha (${D.anticipo}%)</td><td>${fmt(ant)}</td></tr>
  <tr><td>Saldo a pagar el día del evento</td><td>${fmt(tot-ant)}</td></tr></table>
  <p class="note">Incluye montaje y desmontaje. Los precios pueden cambiar según el diseño final.</p>
  <div class="acts"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${D.tel}?text=${encodeURIComponent(txt)}">Enviar por WhatsApp</a>
  <button class="btn alt" id="pdf" type="button">Guardar como PDF</button><button class="btn alt" id="cp" type="button">Copiar resumen</button></div>`;
  $("#pdf").onclick=()=>print();
  $("#cp").onclick=async()=>{try{await navigator.clipboard.writeText(txt);$("#cp").textContent="Copiado"}catch(e){$("#cp").textContent="No se pudo copiar"}};
}
goto("cat");
