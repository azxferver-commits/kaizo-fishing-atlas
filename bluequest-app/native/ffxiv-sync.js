(()=>{
const CFG=window.BLUEQUEST_CLOUD||null;
let character=null;

const q=s=>document.querySelector(s);
const fmtDate=v=>{if(!v)return'—';try{return new Date(v).toLocaleString([], {dateStyle:'short',timeStyle:'short'})}catch{return v}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const sets={
  combat:new Set(['Paladin','Warrior','Dark Knight','Gunbreaker','White Mage','Scholar','Astrologian','Sage','Monk','Dragoon','Ninja','Samurai','Reaper','Viper','Bard','Machinist','Dancer','Black Mage','Summoner','Red Mage','Pictomancer','Blue Mage','Beastmaster']),
  craft:new Set(['Carpenter','Blacksmith','Armorer','Goldsmith','Leatherworker','Weaver','Alchemist','Culinarian']),
  gather:new Set(['Miner','Botanist','Fisher'])
};
function session(){return window.BlueQuestCloud?.getSession?.()||null}
function maxFor(type){
  const jobs=(character?.jobs||[]).filter(j=>j.level!=null&&sets[type].has(j.name));
  return jobs.length?Math.max(...jobs.map(j=>j.level)):null;
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
  q('#ffxivJobs').innerHTML=jobs.map(j=>'<span class="ffxiv-job-chip"><b>'+esc(j.name)+'</b> Lv. '+esc(j.level)+'</span>').join('');
  q('#ffxivLodestone').href=character.source_url||'#';
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
function bind(){
  q('#ffxivLinkBtn')?.addEventListener('click',openLink);
  q('#ffxivChangeBtn')?.addEventListener('click',openLink);
  q('#ffxivSyncBtn')?.addEventListener('click',()=>sync());
  q('#ffxivUnlinkBtn')?.addEventListener('click',unlink);
  q('#ffxivLinkClose')?.addEventListener('click',()=>q('#ffxivLinkDialog').close());
  q('#ffxivLinkSubmit')?.addEventListener('click',()=>sync(q('#ffxivLodestoneInput').value));
  q('#ffxivLodestoneInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sync(e.currentTarget.value)});
  document.addEventListener('bluequest:session',load);
}
window.BlueQuestFFXIV={load,sync};
document.addEventListener('DOMContentLoaded',()=>{bind();load()});
})();