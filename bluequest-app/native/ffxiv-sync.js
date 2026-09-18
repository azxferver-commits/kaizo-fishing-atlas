(()=>{
const CFG=window.BLUEQUEST_CLOUD||null;
let character=null;
let activeJob=null;

const q=s=>document.querySelector(s);
const fmtDate=v=>{if(!v)return'—';try{return new Date(v).toLocaleString([], {dateStyle:'short',timeStyle:'short'})}catch{return v}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const JOBS={
  'Paladin':{kind:'combat',role:'tank',aliases:['Gladiator']},
  'Warrior':{kind:'combat',role:'tank',aliases:['Marauder']},
  'Dark Knight':{kind:'combat',role:'tank',aliases:[]},
  'Gunbreaker':{kind:'combat',role:'tank',aliases:[]},
  'White Mage':{kind:'combat',role:'healer',aliases:['Conjurer']},
  'Scholar':{kind:'combat',role:'healer',aliases:['Arcanist']},
  'Astrologian':{kind:'combat',role:'healer',aliases:[]},
  'Sage':{kind:'combat',role:'healer',aliases:[]},
  'Monk':{kind:'combat',role:'melee',aliases:['Pugilist']},
  'Dragoon':{kind:'combat',role:'melee',aliases:['Lancer']},
  'Ninja':{kind:'combat',role:'melee',aliases:['Rogue']},
  'Samurai':{kind:'combat',role:'melee',aliases:[]},
  'Reaper':{kind:'combat',role:'melee',aliases:[]},
  'Viper':{kind:'combat',role:'melee',aliases:[]},
  'Bard':{kind:'combat',role:'physical',aliases:['Archer']},
  'Machinist':{kind:'combat',role:'physical',aliases:[]},
  'Dancer':{kind:'combat',role:'physical',aliases:[]},
  'Black Mage':{kind:'combat',role:'magical',aliases:['Thaumaturge']},
  'Summoner':{kind:'combat',role:'magical',aliases:['Arcanist']},
  'Red Mage':{kind:'combat',role:'magical',aliases:[]},
  'Pictomancer':{kind:'combat',role:'magical',aliases:[]},
  'Blue Mage':{kind:'combat',role:'limited',aliases:[]},
  'Beastmaster':{kind:'combat',role:'limited',aliases:[]},
  'Carpenter':{kind:'craft',aliases:[]},
  'Blacksmith':{kind:'craft',aliases:[]},
  'Armorer':{kind:'craft',aliases:[]},
  'Goldsmith':{kind:'craft',aliases:[]},
  'Leatherworker':{kind:'craft',aliases:[]},
  'Weaver':{kind:'craft',aliases:[]},
  'Alchemist':{kind:'craft',aliases:[]},
  'Culinarian':{kind:'craft',aliases:[]},
  'Miner':{kind:'gather',aliases:[]},
  'Botanist':{kind:'gather',aliases:[]},
  'Fisher':{kind:'gather',aliases:[]}
};
const sets={
  combat:new Set(Object.entries(JOBS).filter(([,v])=>v.kind==='combat').map(([k])=>k)),
  craft:new Set(Object.entries(JOBS).filter(([,v])=>v.kind==='craft').map(([k])=>k)),
  gather:new Set(Object.entries(JOBS).filter(([,v])=>v.kind==='gather').map(([k])=>k))
};

function session(){return window.BlueQuestCloud?.getSession?.()||null}
function atlas(){return window.BlueQuestAtlas||null}
function allQuests(){return atlas()?.getData?.()||[]}
function isManual(qst){return !!atlas()?.isDone?.(qst)}
function questKey(qst){return atlas()?.key?.(qst)||((qst.level||0)+'|'+(qst.name||''))}
function textOf(qst){return [qst.name,qst.type,qst.location,qst.unlock,qst.opens,qst.requirements,qst.expansion].filter(Boolean).join(' ').toLowerCase()}
function metaFor(name){return JOBS[name]||{kind:'combat',role:null,aliases:[]}}
function maxFor(type){
  const jobs=(character?.jobs||[]).filter(j=>j.level!=null&&sets[type].has(j.name));
  return jobs.length?Math.max(...jobs.map(j=>j.level)):null;
}
function roleMatches(type,role){
  const t=String(type||'').toLowerCase();
  if(role==='tank')return t.includes('role quest')&&t.includes('tank');
  if(role==='healer')return t.includes('role quest')&&t.includes('healer');
  if(role==='melee')return t.includes('role quest')&&t.includes('melee');
  if(role==='physical')return t.includes('role quest')&&(t.includes('physical ranged')||t.includes('physical dps'));
  if(role==='magical')return t.includes('role quest')&&(t.includes('magical ranged')||t.includes('magical'));
  return false;
}
function directMatch(qst,job){
  const meta=metaFor(job.name);
  const names=[job.name,...(meta.aliases||[])].map(x=>x.toLowerCase());
  const t=[qst.name,qst.type,qst.unlock,qst.opens].filter(Boolean).join(' ').toLowerCase();
  return names.some(n=>n&&t.includes(n));
}
function isRouteQuest(qst,job){
  const meta=metaFor(job.name);
  if(directMatch(qst,job))return true;
  if(meta.kind==='combat')return roleMatches(qst.type,meta.role);
  if(meta.kind==='gather'){
    if(qst.type==='Gathering')return !/^Way of the /i.test(String(qst.name||''));
    return ['Crafting / Gathering','Collectables','Custom Deliveries','Studium'].includes(qst.type);
  }
  if(meta.kind==='craft'){
    if(qst.type==='Crafting')return !/^Way of the /i.test(String(qst.name||''));
    return ['Crafting / Gathering','Collectables','Custom Deliveries','Studium'].includes(qst.type);
  }
  return false;
}
function detectedBySync(qst,job){
  if(!job||job.level==null)return false;
  const meta=metaFor(job.name);
  const t=textOf(qst);
  const unlock=String(qst.unlock||'').toLowerCase();
  const name=String(qst.name||'').toLowerCase();
  const aliases=[job.name,...(meta.aliases||[])].map(x=>x.toLowerCase());

  if(meta.kind==='gather'||meta.kind==='craft'){
    return qst.level<=1 && aliases.some(a=>unlock.includes('desbloquea '+a)||name.includes('way of the '+a));
  }

  if(meta.kind==='combat'){
    if((qst.type==='Clase'||qst.type==='Job') && aliases.some(a=>unlock.includes('desbloquea '+a)))return true;
    if(qst.type==='Clase' && (meta.aliases||[]).some(a=>name.includes('way of the '+a.toLowerCase())))return true;
  }
  return false;
}
function detectedByAnySync(qst){
  return (character?.jobs||[]).some(job=>job.level!=null&&detectedBySync(qst,job));
}
function statusOf(qst,job){
  if(isManual(qst))return'manual';
  if(detectedBySync(qst,job))return'detected';
  return'pending';
}
function routeFor(job){
  const matched=allQuests().filter(x=>isRouteQuest(x,job));
  const all=[...new Map(matched.map(x=>[questKey(x),x])).values()];
  const eligible=all.filter(x=>Number(x.level||0)<=Number(job.level||0));
  const future=all.filter(x=>Number(x.level||0)>Number(job.level||0));
  const currentDone=eligible.filter(x=>statusOf(x,job)!=='pending');
  const manual=eligible.filter(x=>statusOf(x,job)==='manual');
  const detected=eligible.filter(x=>statusOf(x,job)==='detected');
  const pending=eligible.filter(x=>statusOf(x,job)==='pending');
  const pct=eligible.length?Math.round(currentDone.length/eligible.length*100):0;
  return {all,eligible,future,currentDone,manual,detected,pending,pct};
}
function priority(qst,job){
  let p=0;
  if(directMatch(qst,job))p+=140;
  if(roleMatches(qst.type,metaFor(job.name).role))p+=130;
  const map={
    'Crafting / Gathering':115,'Gathering':110,'Crafting':110,'Collectables':105,
    'Custom Deliveries':95,'Studium':92,'Grand Company':90,'Chocobo':90,
    'Retainers':88,'Materia':84,'Glamour':78,'Wondrous Tails':76,'Hunt':70
  };
  p+=map[qst.type]||40;
  p+=Math.max(0,30-Math.abs(Number(job.level||0)-Number(qst.level||0)));
  return p;
}
function recommended(route,job){
  return [...route.pending].sort((a,b)=>priority(b,job)-priority(a,job)||Number(b.level)-Number(a.level)).slice(0,4);
}
function nextUp(route){
  return [...route.future].sort((a,b)=>Number(a.level)-Number(b.level)||String(a.name).localeCompare(String(b.name))).slice(0,3);
}
function statusBadge(qst,job){
  const s=statusOf(qst,job);
  if(s==='manual')return'<span class="route-status manual">✓ HECHA</span>';
  if(s==='detected')return'<span class="route-status detected">◆ DETECTADA</span>';
  return'<span class="route-status pending">PENDIENTE</span>';
}
function questRow(qst,job,reason=''){
  return '<button class="route-quest" type="button" data-route-key="'+esc(questKey(qst))+'">'+
    '<span class="route-lv">Lv '+esc(qst.level)+'</span>'+
    '<span class="route-copy"><b>'+esc(qst.name)+'</b><small>'+esc(reason||qst.unlock||qst.location||qst.type||'Blue Quest')+'</small></span>'+
    statusBadge(qst,job)+
  '</button>';
}
function routeLabel(job){
  const m=metaFor(job.name);
  if(m.kind==='gather')return'Ruta de recolección';
  if(m.kind==='craft')return'Ruta de crafteo';
  const labels={tank:'Ruta de tanque',healer:'Ruta de healer',melee:'Ruta de melee DPS',physical:'Ruta de physical ranged',magical:'Ruta de magical ranged',limited:'Ruta de job limitado'};
  return labels[m.role]||'Ruta de combate';
}
function renderGlobalProgress(){
  const el=q('#ffxivAtlasProgress');
  if(!el)return;
  const a=atlas(),data=allQuests();
  if(!a||!data.length){el.hidden=true;return}
  const manual=data.filter(x=>a.isDone?.(x));
  const manualKeys=new Set(manual.map(questKey));
  const detected=data.filter(x=>!manualKeys.has(questKey(x))&&detectedByAnySync(x));
  const known=manual.length+detected.length;
  const pct=Math.round(known/data.length*100);
  const manualPct=(manual.length/data.length)*100;
  const detectedPct=(detected.length/data.length)*100;
  q('#ffxivAtlasPct').textContent=pct+'%';
  q('#ffxivAtlasCount').textContent=known+' / '+data.length+' conocidas';
  q('#ffxivManualCount').textContent=manual.length;
  q('#ffxivDetectedCount').textContent=detected.length;
  q('#ffxivAtlasManualBar').style.width=manualPct+'%';
  q('#ffxivAtlasDetectedBar').style.width=detectedPct+'%';
  el.hidden=false;
}
function render(){
  const box=q('#ffxivCharacterCard'); if(!box)return;
  const s=session();
  const status=q('#ffxivStatus'), empty=q('#ffxivEmpty'), linked=q('#ffxivLinked');
  if(!s?.user){
    status.textContent='REQUIERE CUENTA';
    empty.hidden=false;linked.hidden=true;
    q('#ffxivEmptyText').textContent='Inicia sesión en BlueQuest para vincular tu personaje de FINAL FANTASY XIV.';
    q('#ffxivLinkBtn').hidden=true;
    return;
  }
  if(!character){
    status.textContent='SIN VINCULAR';
    empty.hidden=false;linked.hidden=true;
    q('#ffxivEmptyText').textContent='Vincula tu perfil público de The Lodestone para ver tus niveles dentro de BlueQuest.';
    q('#ffxivLinkBtn').hidden=false;
    return;
  }
  status.textContent='SINCRONIZADO';
  empty.hidden=true;linked.hidden=false;
  const avatar=q('#ffxivAvatar');
  if(character.avatar_url){avatar.src=character.avatar_url;avatar.hidden=false}else avatar.hidden=true;
  q('#ffxivName').textContent=character.name||'Personaje FFXIV';
  q('#ffxivWorld').textContent=[character.world,character.data_center?('['+character.data_center+']'):null].filter(Boolean).join(' ');
  q('#ffxivSynced').textContent='Última sincronización: '+fmtDate(character.synced_at);
  const combat=maxFor('combat'),craft=maxFor('craft'),gather=maxFor('gather');
  q('#ffxivCombat').textContent=combat??'—';
  q('#ffxivCraft').textContent=craft??'—';
  q('#ffxivGather').textContent=gather??'—';
  q('#ffxivUnlocked').textContent=(character.jobs||[]).filter(j=>j.level!=null).length;
  const jobs=(character.jobs||[]).filter(j=>j.level!=null).sort((a,b)=>(b.level||0)-(a.level||0)||a.name.localeCompare(b.name));
  q('#ffxivJobs').innerHTML=jobs.map(j=>{
    const r=routeFor(j), pending=r.pending.length;
    const alert='<span class="job-alert" aria-label="'+esc(pending?pending+' pendientes detectados':'Revisar ruta')+'"><i></i>'+(pending?esc(pending>99?'99+':pending):'')+'</span>';
    return '<button class="ffxiv-job-chip" type="button" data-ffxiv-job="'+esc(j.name)+'">'+
      '<b>'+esc(j.name)+'</b> Lv. '+esc(j.level)+alert+
    '</button>';
  }).join('');
  q('#ffxivLodestone').href=character.source_url||'#';
  renderGlobalProgress();
}
function openJob(name){
  const job=(character?.jobs||[]).find(j=>j.name===name&&j.level!=null);
  if(!job)return;
  activeJob=job;
  const route=routeFor(job), recs=recommended(route,job), future=nextUp(route);
  const combined=route.currentDone.length;
  const pending=route.pending.length;
  q('#jobRouteEyebrow').textContent=routeLabel(job).toUpperCase();
  q('#jobRouteTitle').textContent=job.name+' · Lv. '+job.level;
  q('#jobRouteFlag').textContent=pending?('● '+pending):'●';
  q('#jobRouteFlag').classList.add('has-pending');
  q('#jobRouteFlagLabel').textContent=pending?'PENDIENTES':'REVISAR';
  q('#jobRouteSummary').textContent=combined+' conocidas · '+pending+' pendientes · '+route.eligible.length+' relacionadas con esta ruta';
  q('#jobRouteManual').textContent=route.manual.length;
  q('#jobRouteDetected').textContent=route.detected.length;
  q('#jobRoutePending').textContent=pending;
  q('#jobRouteRecommended').innerHTML=recs.length
    ?recs.map((x,i)=>questRow(x,job,(i===0?'Recomendación principal · ':'')+(x.unlock||x.opens||x.location||''))).join('')
    :'<div class="route-empty">BlueQuest no detectó pendientes concretos en las entradas mapeadas, pero esta ruta todavía puede ser parcial. Revisa la lista.</div>';
  q('#jobRouteFuture').innerHTML=future.length
    ?future.map(x=>questRow(x,job,'Disponible a partir de nivel '+x.level)).join('')
    :'<div class="route-empty">No hay próximos desbloqueos documentados en el Atlas para esta ruta.</div>';
  q('#jobRouteAll').innerHTML=route.eligible.length
    ?[...route.eligible].sort((a,b)=>Number(a.level)-Number(b.level)||String(a.name).localeCompare(String(b.name))).map(x=>questRow(x,job)).join('')
    :'<div class="route-empty">Todavía no hay misiones de esta ruta documentadas para tu nivel.</div>';
  if(!q('#ffxivJobDialog').open)q('#ffxivJobDialog').showModal();
}
async function load(){
  character=null;
  const s=session(); if(!s?.user||!CFG){render();return}
  await window.BlueQuestCloud?.ensureSession?.();
  const now=session(); if(!now?.access_token){render();return}
  try{
    const r=await fetch(CFG.url+'/rest/v1/ffxiv_characters?select=*&user_id=eq.'+encodeURIComponent(now.user.id)+'&limit=1',{
      headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+now.access_token}
    });
    if(r.ok){const rows=await r.json();character=rows[0]||null}
  }catch{}
  render();
}
function openLink(){
  if(!session()?.user){window.BlueQuestCloud?.openAuth?.('login');return}
  q('#ffxivLinkMessage').textContent='';
  q('#ffxivLodestoneInput').value=character?.source_url||'';
  q('#ffxivLinkDialog').showModal();
}
async function sync(value){
  const input=String(value||character?.source_url||character?.lodestone_id||'').trim();
  if(!input){q('#ffxivLinkMessage').textContent='Pega el enlace de tu personaje en Lodestone.';return}
  await window.BlueQuestCloud?.ensureSession?.();
  const s=session();
  if(!s?.access_token){q('#ffxivLinkMessage').textContent='Tu sesión caducó. Inicia sesión otra vez.';return}
  const btn=q('#ffxivLinkSubmit'); if(btn)btn.disabled=true;
  q('#ffxivLinkMessage').textContent='Sincronizando con The Lodestone…';
  try{
    const r=await fetch(CFG.url+'/functions/v1/ffxiv-character-sync',{
      method:'POST',
      headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({lodestone:input})
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||'No se pudo sincronizar con Lodestone.');
    character=d.character||null;
    q('#ffxivLinkDialog').close();
    render();
    window.toast?.(d.cached?'Personaje ya estaba actualizado':'Personaje FFXIV sincronizado ✓');
  }catch(e){q('#ffxivLinkMessage').textContent=e.message||'No se pudo sincronizar.'}
  finally{if(btn)btn.disabled=false}
}
async function unlink(){
  if(!character||!confirm('¿Desvincular este personaje de tu cuenta BlueQuest?'))return;
  await window.BlueQuestCloud?.ensureSession?.();
  const s=session(); if(!s?.access_token)return;
  try{
    const r=await fetch(CFG.url+'/rest/v1/ffxiv_characters?user_id=eq.'+encodeURIComponent(s.user.id),{
      method:'DELETE',
      headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+s.access_token}
    });
    if(!r.ok)throw new Error();
    character=null;render();window.toast?.('Personaje desvinculado');
  }catch{window.toast?.('No pude desvincular el personaje')}
}
function openAtlasQuest(k){
  const a=atlas(); if(!a)return;
  const quest=a.findByKey?.(k);
  if(!quest)return;
  q('#ffxivJobDialog')?.close();
  setTimeout(()=>a.openQuest?.(quest),80);
}
function bind(){
  q('#ffxivLinkBtn')?.addEventListener('click',openLink);
  q('#ffxivChangeBtn')?.addEventListener('click',openLink);
  q('#ffxivSyncBtn')?.addEventListener('click',()=>sync());
  q('#ffxivUnlinkBtn')?.addEventListener('click',unlink);
  q('#ffxivLinkClose')?.addEventListener('click',()=>q('#ffxivLinkDialog').close());
  q('#ffxivLinkSubmit')?.addEventListener('click',()=>sync(q('#ffxivLodestoneInput').value));
  q('#ffxivLodestoneInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sync(e.currentTarget.value)});
  q('#ffxivJobClose')?.addEventListener('click',()=>q('#ffxivJobDialog').close());
  q('#ffxivJobs')?.addEventListener('click',e=>{const b=e.target.closest('[data-ffxiv-job]');if(b)openJob(b.dataset.ffxivJob)});
  q('#ffxivJobDialog')?.addEventListener('click',e=>{const b=e.target.closest('[data-route-key]');if(b)openAtlasQuest(b.dataset.routeKey)});
  document.addEventListener('bluequest:session',load);
  document.addEventListener('bluequest:ready',render);
  document.addEventListener('bluequest:progress',()=>{renderGlobalProgress();if(activeJob&&q('#ffxivJobDialog')?.open)openJob(activeJob.name);else render()});
}
window.BlueQuestFFXIV={load,sync,openJob,getCharacter:()=>character};
document.addEventListener('DOMContentLoaded',()=>{bind();load()});
})();