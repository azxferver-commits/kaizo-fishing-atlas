(()=>{
const CFG=window.BLUEQUEST_CLOUD||null;
const INVITE_URL='https://discord.gg/PHQHM9Xvjm';
let connection=null,busy=false;
const q=s=>document.querySelector(s);

async function openExternal(url){
  try{
    const Browser=window.Capacitor?.Plugins?.Browser;
    if(Browser?.open){await Browser.open({url});return}
  }catch{}
  window.open(url,'_blank','noopener,noreferrer');
}
function render(){
  const card=q('#discordCommunityCard'); if(!card)return;
  const logged=!!window.BlueQuestCloud?.getSession?.()?.user;
  const community=!!window.BlueQuestCloud?.has?.('community');
  const verified=!!connection?.verified;
  const status=q('#discordCommunityStatus');
  const msg=q('#discordCommunityMessage');
  const verify=q('#discordVerifyBtn');
  const join=q('#discordJoinBtn');

  if(!logged){
    status.textContent='CUENTA REQUERIDA';
    status.classList.remove('ok');
    msg.textContent='Inicia sesión en BlueQuest. Después únete al Discord Nexus y verifica tu membresía.';
    verify.textContent='Iniciar sesión';
    verify.disabled=false;
  }else if(verified){
    status.textContent='DISCORD VERIFICADO ✓';
    status.classList.add('ok');
    msg.textContent=(connection.external_username?connection.external_username+' · ':'')+'Nexus confirmado. Community está desbloqueado.';
    verify.textContent='Verificado ✓';
    verify.disabled=true;
  }else if(community){
    status.textContent='COMMUNITY ACTIVO';
    status.classList.add('ok');
    msg.textContent='Tu cuenta ya tiene Community. Puedes vincular Discord para dejar la membresía verificada.';
    verify.textContent='Vincular Discord';
    verify.disabled=busy;
  }else{
    status.textContent='DISCORD REQUERIDO';
    status.classList.remove('ok');
    msg.textContent='Únete a Nexus y verifica tu Discord para desbloquear BlueQuest 51–100, Fishing Tools, Gold Saucer y Nexus.';
    verify.textContent=busy?'Preparando Discord…':'Verificar Discord';
    verify.disabled=busy;
  }
  join.disabled=false;
}
async function load(){
  connection=null;
  const s=window.BlueQuestCloud?.getSession?.();
  if(!s?.user||!CFG){render();return}
  await window.BlueQuestCloud?.ensureSession?.();
  const now=window.BlueQuestCloud?.getSession?.();
  if(!now?.access_token){render();return}
  try{
    const r=await fetch(CFG.url+'/rest/v1/social_connections?select=external_username,verified,verified_at,last_checked_at,metadata&user_id=eq.'+encodeURIComponent(now.user.id)+'&provider=eq.discord&limit=1',{
      headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+now.access_token}
    });
    if(r.ok){const rows=await r.json();connection=rows[0]||null}
  }catch{}
  render();
}
async function verify(){
  const logged=!!window.BlueQuestCloud?.getSession?.()?.user;
  if(!logged){window.BlueQuestCloud?.openAuth?.('login');return}
  if(busy)return;
  busy=true;render();
  try{
    await window.BlueQuestCloud?.ensureSession?.();
    const s=window.BlueQuestCloud?.getSession?.();
    if(!s?.access_token)throw new Error('Tu sesión caducó. Inicia sesión otra vez.');
    const r=await fetch(CFG.url+'/functions/v1/discord-oauth-start',{
      method:'POST',
      headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||'No pude iniciar la verificación de Discord.');
    await openExternal(d.authorize_url);
  }catch(e){
    window.toast?.(e.message||'No pude iniciar la verificación de Discord.');
  }finally{busy=false;render()}
}
function bind(){
  q('#discordJoinBtn')?.addEventListener('click',()=>openExternal(INVITE_URL));
  q('#discordVerifyBtn')?.addEventListener('click',verify);
  document.addEventListener('bluequest:session',load);
  document.addEventListener('bluequest:access',()=>{render();load()});
  document.addEventListener('bluequest:discord',()=>setTimeout(load,250));
}
window.BlueQuestDiscord={load,verify};
document.addEventListener('DOMContentLoaded',()=>{bind();load()});
})();