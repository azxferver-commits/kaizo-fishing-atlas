(()=>{
const CFG=window.BLUEQUEST_CLOUD||null;
const INSTALL_KEY='bluequest-installation-id-v1';
const APP_VERSION='1.13';
let timer=null,lastAdminLoad=0;
const q=s=>document.querySelector(s);
function installationId(){
  let id=localStorage.getItem(INSTALL_KEY);
  if(id)return id;
  const rnd=(crypto?.randomUUID?.()||(''+Date.now()+'-'+Math.random().toString(16).slice(2))).replace(/[^A-Za-z0-9._:-]/g,'');
  id='bq-'+rnd;
  localStorage.setItem(INSTALL_KEY,id);
  return id;
}
function platform(){
  try{return window.Capacitor?.getPlatform?.()||'android'}catch{return 'android'}
}
async function send(action,moduleKey=''){
  if(!CFG)return;
  const s=window.BlueQuestCloud?.getSession?.();
  const headers={'apikey':CFG.publishableKey,'Content-Type':'application/json'};
  if(s?.access_token)headers.Authorization='Bearer '+s.access_token;
  try{
    await fetch(CFG.url+'/functions/v1/app-telemetry',{
      method:'POST',headers,
      body:JSON.stringify({
        installation_id:installationId(),
        action,
        platform:platform(),
        app_version:APP_VERSION,
        module_key:moduleKey||undefined
      })
    });
  }catch{}
}
function fmt(n){return new Intl.NumberFormat('es-ES').format(Number(n||0))}
function renderAdmin(data){
  const card=q('#adminAnalyticsCard'); if(!card)return;
  card.hidden=false;
  const set=(id,v)=>{const e=q('#'+id);if(e)e.textContent=fmt(v)};
  set('anAccounts',data.accounts); set('anInstalls',data.installations); set('anOnline',data.online_now);
  set('anToday',data.active_today); set('an7d',data.active_7d); set('an30d',data.active_30d); set('anCommunity',data.community);
  const mods=data.modules_today||{};
  set('anFishing',mods.fishing_tools||0);set('anGold',mods.gold_saucer||0);set('anNexus',mods.nexus||0);
  const updated=q('#anUpdated'); if(updated)updated.textContent='Actualizado '+new Date(data.generated_at||Date.now()).toLocaleTimeString('es-CA',{hour:'2-digit',minute:'2-digit'});
}
async function loadAdmin(force=false){
  if(!window.BlueQuestCloud?.has?.('admin_dashboard'))return;
  if(!force&&Date.now()-lastAdminLoad<15000)return;
  const s=await window.BlueQuestCloud?.ensureSession?.();
  if(!s?.access_token||!CFG)return;
  lastAdminLoad=Date.now();
  try{
    const r=await fetch(CFG.url+'/functions/v1/admin-analytics',{
      headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+s.access_token}
    });
    if(!r.ok)return;
    renderAdmin(await r.json());
  }catch{}
}
function startPresence(){
  send('open');
  if(timer)clearInterval(timer);
  timer=setInterval(()=>{if(document.visibilityState==='visible')send('heartbeat')},60000);
}
function bind(){
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-module-open]');
    if(b?.dataset.moduleOpen)send('module_open',b.dataset.moduleOpen);
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')send('heartbeat')});
  document.addEventListener('bluequest:session',()=>{send('heartbeat');loadAdmin(true)});
  document.addEventListener('bluequest:access',()=>loadAdmin(true));
  q('#adminAnalyticsRefresh')?.addEventListener('click',()=>loadAdmin(true));
}
window.BlueQuestAnalytics={refresh:()=>loadAdmin(true),trackModule:key=>send('module_open',key)};
document.addEventListener('DOMContentLoaded',()=>{bind();startPresence();setTimeout(()=>loadAdmin(true),800)});
})();