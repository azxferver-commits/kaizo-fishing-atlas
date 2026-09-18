(()=>{
const CFG=window.BLUEQUEST_ACCOUNT_CONFIG||{};
const SESSION_KEY='bluequest-account-session-v1';
const modules=[
  {key:'core',name:'BlueQuest Core',desc:'Blue Quests, búsqueda, favoritos y progreso',free:true},
  {key:'boss_atlas',name:'Boss Atlas',desc:'Mecánicas y roles'},
  {key:'fishing_tools',name:'Fishing Tools',desc:'Pesca y herramientas'},
  {key:'gold_saucer',name:'Gold Saucer',desc:'Rutas y Fashion Report'},
  {key:'cloud_sync',name:'Cloud Sync',desc:'Sincronización entre dispositivos'}
];
let mode='login';
let session=readSession();
let entitlements=new Set();

function configured(){return !!(CFG.supabaseUrl&&CFG.supabaseAnonKey)}
function base(){return String(CFG.supabaseUrl||'').replace(/\/$/,'')}
function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function saveSession(s){session=s||null;if(s)localStorage.setItem(SESSION_KEY,JSON.stringify(s));else localStorage.removeItem(SESSION_KEY);updateButton()}
function authHeaders(token=session?.access_token){return {'apikey':CFG.supabaseAnonKey,'Authorization':'Bearer '+token,'Content-Type':'application/json'}}
function updateButton(){const b=document.getElementById('bqAccountBtn');if(!b)return;b.classList.toggle('signed',!!session);b.textContent=session?'✓':'♙';b.title=session?'Cuenta BlueQuest conectada':'Cuenta BlueQuest'}

async function request(path,options={}){
  const r=await fetch(base()+path,{...options,headers:{...authHeaders(options.token),...(options.headers||{})}});
  let body=null;try{body=await r.json()}catch{}
  if(!r.ok)throw new Error(body?.msg||body?.message||body?.error_description||body?.error||('HTTP '+r.status));
  return body;
}
async function signIn(email,password){
  const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password}),token:CFG.supabaseAnonKey});
  saveSession(data);await refreshEntitlements();render();
}
async function signUp(email,password){
  const data=await request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password}),token:CFG.supabaseAnonKey});
  if(data?.access_token){saveSession(data);await refreshEntitlements();render();return}
  document.getElementById('bqAccountError').textContent='Cuenta creada. Revisa tu correo para confirmar y después inicia sesión.';
}
async function signOut(){saveSession(null);entitlements=new Set();render();applyLocks()}
async function refreshToken(){
  if(!session?.refresh_token||!configured())return false;
  try{
    const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token}),token:CFG.supabaseAnonKey});
    saveSession(data);return true;
  }catch{return false}
}
async function refreshEntitlements(){
  entitlements=new Set();
  if(!session||!configured())return;
  try{
    const uid=session.user?.id;
    if(!uid)return;
    const rows=await request('/rest/v1/user_entitlements?select=module_key,source,granted_until&user_id=eq.'+encodeURIComponent(uid));
    (rows||[]).forEach(x=>{if(!x.granted_until||new Date(x.granted_until)>new Date())entitlements.add(x.module_key)});
  }catch(e){
    if(String(e.message).includes('401')){if(await refreshToken())return refreshEntitlements()}
    console.warn('BlueQuest entitlements',e);
  }
}
function has(key){return key==='core'||entitlements.has(key)||entitlements.has('supporter')}
function applyLocks(){
  document.querySelectorAll('[data-entitlement]').forEach(el=>{
    const key=el.dataset.entitlement;
    const ok=has(key);
    el.classList.toggle('bq-locked',!ok);
    el.classList.toggle('bq-unlocked',ok);
    if(!ok)el.setAttribute('aria-disabled','true'); else el.removeAttribute('aria-disabled');
  });
}
function accountHtml(){
  const online=configured();
  const email=session?.user?.email||'Cuenta BlueQuest';
  const cards=modules.map(m=>'<div class="bq-access-card '+(has(m.key)?'on':'')+'"><b>'+m.name+'</b><small>'+m.desc+'</small><div class="state">'+(has(m.key)?'✓ DISPONIBLE':(m.free?'✓ GRATIS':'🔒 BLOQUEADO'))+'</div></div>').join('');
  if(!session){
    return '<div class="bq-account-head"><p class="eyebrow">BLUEQUEST ID</p><h2>Tu cuenta BlueQuest</h2><p>El APK puede compartirse. Tus accesos no.</p></div>'+
      '<div class="bq-status '+(online?'good':'warn')+'"><b>'+(online?'Servidor de cuentas conectado':'Core offline activo')+'</b><small>'+(online?'Inicia sesión para consultar tus desbloqueos.':'La app funciona gratis; el backend de cuentas todavía no está enlazado a este build.')+'</small></div>'+
      '<div class="bq-auth-tabs"><button id="bqTabLogin" class="'+(mode==='login'?'active':'')+'">Entrar</button><button id="bqTabSignup" class="'+(mode==='signup'?'active':'')+'">Crear cuenta</button></div>'+
      '<form class="bq-form" id="bqAuthForm"><input id="bqEmail" type="email" autocomplete="email" placeholder="Correo" required><input id="bqPassword" type="password" minlength="6" autocomplete="'+(mode==='login'?'current-password':'new-password')+'" placeholder="Contraseña" required><button class="bq-primary" '+(online?'':'disabled')+'>'+(mode==='login'?'Entrar':'Crear cuenta')+'</button><div id="bqAccountError" class="bq-account-error"></div></form>'+
      '<h3 class="bq-access-title">Acceso</h3><div class="bq-entitlements">'+cards+'</div>'+
      '<p class="bq-note">Las funciones protegidas se validan contra el servidor. Compartir el APK no concede esos permisos.</p>';
  }
  return '<div class="bq-account-head"><p class="eyebrow">BLUEQUEST ID</p><h2>Cuenta conectada</h2><p>Tu acceso vive en tu cuenta, no en el APK.</p></div>'+
    '<div class="bq-account-user"><div><strong>'+escapeHtml(email)+'</strong><small>ID '+escapeHtml(String(session.user?.id||'').slice(0,8))+'…</small></div><button class="bq-secondary" id="bqSignOut">Salir</button></div>'+
    '<h3 class="bq-access-title">Tus módulos</h3><div class="bq-entitlements">'+cards+'</div>'+
    '<h3 class="bq-access-title">Desbloqueos de comunidad</h3>'+
    '<div class="bq-social"><div class="bq-social-card"><span class="bq-social-icon">D</span><div><b>Discord</b><small>Verificar membresía del servidor</small></div><button id="bqDiscord" '+(CFG.discordOAuthStart?'':'disabled')+'>Conectar</button></div>'+
    '<div class="bq-social-card"><span class="bq-social-icon">▶</span><div><b>YouTube</b><small>Verificar suscripción al canal</small></div><button id="bqYouTube" '+(CFG.youtubeOAuthStart?'':'disabled')+'>Conectar</button></div></div>'+
    '<p class="bq-note">La verificación social se realiza con OAuth y en el servidor. BlueQuest nunca debe pedirte la contraseña de Discord o Google.</p>';
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){
  const content=document.getElementById('bqAccountContent');if(!content)return;
  content.innerHTML=accountHtml();
  const login=document.getElementById('bqTabLogin'),signup=document.getElementById('bqTabSignup');
  if(login)login.onclick=()=>{mode='login';render()};
  if(signup)signup.onclick=()=>{mode='signup';render()};
  const form=document.getElementById('bqAuthForm');
  if(form)form.onsubmit=async e=>{
    e.preventDefault();
    const err=document.getElementById('bqAccountError');err.textContent='';
    try{
      const email=document.getElementById('bqEmail').value.trim();
      const password=document.getElementById('bqPassword').value;
      if(mode==='login')await signIn(email,password);else await signUp(email,password);
    }catch(x){err.textContent=x.message}
  };
  const out=document.getElementById('bqSignOut');if(out)out.onclick=signOut;
  const d=document.getElementById('bqDiscord');if(d)d.onclick=()=>openSocial('discord');
  const y=document.getElementById('bqYouTube');if(y)y.onclick=()=>openSocial('youtube');
  applyLocks();
}
function openSocial(provider){
  const url=provider==='discord'?CFG.discordOAuthStart:CFG.youtubeOAuthStart;
  if(!url)return;
  window.open(url,'_blank');
}
async function fetchProtectedContent(moduleKey,contentKey){
  if(!session||!has(moduleKey))throw new Error('Este módulo no está desbloqueado');
  const path='/rest/v1/protected_content?select=payload,content_version&module_key=eq.'+encodeURIComponent(moduleKey)+'&content_key=eq.'+encodeURIComponent(contentKey)+'&limit=1';
  const rows=await request(path);
  if(!rows?.length)throw new Error('Contenido no disponible');
  return rows[0];
}
function buildUI(){
  const top=document.querySelector('.top-actions');
  if(top&&!document.getElementById('bqAccountBtn')){
    const b=document.createElement('button');b.id='bqAccountBtn';b.className='bq-account-btn';b.type='button';b.title='Cuenta BlueQuest';b.textContent='♙';b.onclick=()=>open();top.prepend(b);
  }
  if(!document.getElementById('bqAccountOverlay')){
    const wrap=document.createElement('div');wrap.id='bqAccountOverlay';wrap.className='bq-account-overlay';
    wrap.innerHTML='<div class="bq-account-sheet"><div class="bq-account-grab"></div><button class="bq-account-close" id="bqAccountClose">×</button><div id="bqAccountContent"></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)close()});
    document.getElementById('bqAccountClose').onclick=close;
  }
  document.querySelectorAll('.module-card.future').forEach(el=>{
    const title=el.querySelector('h3')?.textContent||'';
    if(/Boss Atlas/i.test(title))el.dataset.entitlement='boss_atlas';
    if(/Fishing Atlas/i.test(title))el.dataset.entitlement='fishing_tools';
    if(/Gold Saucer/i.test(title))el.dataset.entitlement='gold_saucer';
  });
  updateButton();render();
}
function open(){document.getElementById('bqAccountOverlay')?.classList.add('open');render()}
function close(){document.getElementById('bqAccountOverlay')?.classList.remove('open')}
async function init(){buildUI();if(session&&configured())await refreshEntitlements();render();applyLocks()}
window.BlueQuestAccount={open,close,has,refresh:refreshEntitlements,fetchProtectedContent,get session(){return session},get entitlements(){return [...entitlements]}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
