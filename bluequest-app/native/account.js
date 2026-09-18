(()=>{
const CFG=window.BLUEQUEST_CLOUD||null;
const SESSION_KEY='bluequest-cloud-session-v1';
let session=null, entitlements=new Set(), mode='login';

const q=s=>document.querySelector(s);
const safeJson=async r=>{try{return await r.json()}catch{return{}}};
function loadSession(){try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{session=null}}
function saveSession(){if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));else localStorage.removeItem(SESSION_KEY)}
function authHeaders(token){return {'apikey':CFG.publishableKey,'Authorization':'Bearer '+token,'Content-Type':'application/json'}}
async function refreshIfNeeded(){
  if(!session?.refresh_token||!CFG)return false;
  if(session.expires_at && Date.now()<session.expires_at-60000)return true;
  const r=await fetch(CFG.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':CFG.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
  if(!r.ok){session=null;saveSession();return false}
  const d=await r.json();session={...session,...d,expires_at:Date.now()+(d.expires_in||3600)*1000};saveSession();return true
}
async function loadAccess(){
  entitlements=new Set();
  if(!session?.access_token||!session?.user?.id||!CFG){renderAccount();return}
  await refreshIfNeeded();
  if(!session?.access_token){renderAccount();return}
  const r=await fetch(CFG.url+'/rest/v1/user_entitlements?select=module_key,granted_until,source&user_id=eq.'+encodeURIComponent(session.user.id),{headers:authHeaders(session.access_token)});
  if(r.ok){const rows=await r.json();rows.forEach(x=>{if(!x.granted_until||new Date(x.granted_until)>new Date())entitlements.add(x.module_key)})}
  renderAccount();
}
function has(k){return entitlements.has(k)}
function moduleState(el,key){
  if(!el)return;
  const tag=el.querySelector('.module-lock');
  if(tag)tag.remove();
  const s=document.createElement('span');s.className='module-lock';
  s.textContent=has(key)?'DESBLOQUEADO ✓':'CUENTA · '+key.toUpperCase();
  if(has(key))s.style.color='#aef4d2';
  el.querySelector('div')?.appendChild(s);
}
function renderAccount(){
  const card=q('#bluequestAccountCard'); if(!card)return;
  const status=q('#accountStatus'), name=q('#accountName'), email=q('#accountEmail');
  if(session?.user){
    status.textContent='CONECTADO';
    name.textContent=session.user.user_metadata?.display_name||session.user.email?.split('@')[0]||'BlueQuest User';
    email.textContent=session.user.email||'';
    q('#accountLoginBtn').hidden=true;q('#accountLogoutBtn').hidden=false;q('#accountRefreshBtn').hidden=false;
  }else{
    status.textContent='CORE GRATIS';
    name.textContent='Cuenta BlueQuest';
    email.textContent='El Core funciona sin cuenta. Inicia sesión para beneficios online.';
    q('#accountLoginBtn').hidden=false;q('#accountLogoutBtn').hidden=true;q('#accountRefreshBtn').hidden=true;
  }
  const map={community:'accCommunity',boss_atlas:'accBoss',fishing_tools:'accFishing',gold_saucer:'accGold',cloud_sync:'accCloud',supporter:'accSupporter'};
  Object.entries(map).forEach(([k,id])=>{const e=q('#'+id);if(!e)return;e.classList.toggle('ok',has(k));e.classList.toggle('locked',!has(k));const s=e.querySelector('small');if(s)s.textContent=has(k)?'Disponible en tu cuenta':'Bloqueado'});
  moduleState(q('[data-cloud-module="boss_atlas"]'),'boss_atlas');
  moduleState(q('[data-cloud-module="fishing_tools"]'),'fishing_tools');
  moduleState(q('[data-cloud-module="gold_saucer"]'),'gold_saucer');
}
function openAuth(which='login'){
  mode=which; q('#authTitle').textContent=mode==='login'?'Iniciar sesión':'Crear cuenta';
  q('#authSubmit').textContent=mode==='login'?'Entrar':'Crear cuenta';
  q('#authSwitchText').textContent=mode==='login'?'¿No tienes cuenta?':'¿Ya tienes cuenta?';
  q('#authSwitchBtn').textContent=mode==='login'?'Crear una':'Iniciar sesión';
  q('#authMessage').textContent='';
  q('#bluequestAuthDialog').showModal();
}
async function submitAuth(){
  if(!CFG){q('#authMessage').textContent='Cloud no configurado.';return}
  const email=q('#authEmail').value.trim(), password=q('#authPassword').value;
  if(!email||password.length<6){q('#authMessage').textContent='Usa un correo válido y una contraseña de al menos 6 caracteres.';return}
  q('#authSubmit').disabled=true;q('#authMessage').textContent='Conectando…';
  try{
    const endpoint=mode==='login'?'/auth/v1/token?grant_type=password':'/auth/v1/signup';
    const body=mode==='login'?{email,password}:{email,password,data:{display_name:email.split('@')[0]}};
    const r=await fetch(CFG.url+endpoint,{method:'POST',headers:{'apikey':CFG.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await safeJson(r);
    if(!r.ok)throw new Error(d.msg||d.error_description||d.message||'No se pudo completar la operación');
    if(mode==='login'){
      session={...d,expires_at:Date.now()+(d.expires_in||3600)*1000};saveSession();q('#bluequestAuthDialog').close();await loadAccess();window.toast?.('Sesión iniciada');
    }else{
      if(d.access_token){session={...d,expires_at:Date.now()+(d.expires_in||3600)*1000};saveSession();q('#bluequestAuthDialog').close();await loadAccess();window.toast?.('Cuenta creada')}
      else q('#authMessage').textContent='Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.';
    }
  }catch(e){q('#authMessage').textContent=e.message}
  finally{q('#authSubmit').disabled=false}
}
async function logout(){
  try{if(session?.access_token)await fetch(CFG.url+'/auth/v1/logout',{method:'POST',headers:authHeaders(session.access_token)})}catch{}
  session=null;entitlements.clear();saveSession();renderAccount();window.toast?.('Sesión cerrada');
}
function bind(){
  q('#accountLoginBtn')?.addEventListener('click',()=>openAuth('login'));
  q('#accountLogoutBtn')?.addEventListener('click',logout);
  q('#accountRefreshBtn')?.addEventListener('click',loadAccess);
  q('#authClose')?.addEventListener('click',()=>q('#bluequestAuthDialog').close());
  q('#authSubmit')?.addEventListener('click',submitAuth);
  q('#authSwitchBtn')?.addEventListener('click',()=>openAuth(mode==='login'?'signup':'login'));
  q('#authPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')submitAuth()});
}
window.BlueQuestCloud={has,openAuth,refresh:loadAccess};
document.addEventListener('DOMContentLoaded',async()=>{loadSession();bind();renderAccount();if(session)await loadAccess()});
})();