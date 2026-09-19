(()=>{
const CFG=window.BLUEQUEST_CLOUD||null;
const SESSION_KEY='bluequest-cloud-session-v1';
const BLUEQUEST_WELCOME_URL='https://azxferver-commits.github.io/kaizo-fishing-atlas/bluequest-welcome/';
const PASSWORD_MIN_LENGTH=8;
let session=null, entitlements=new Set(), mode='login';

const q=s=>document.querySelector(s);
const safeJson=async r=>{try{return await r.json()}catch{return{}}};
function loadSession(){try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{session=null}}
function saveSession(){if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));else localStorage.removeItem(SESSION_KEY)}
function authHeaders(token){return {'apikey':CFG.publishableKey,'Authorization':'Bearer '+token,'Content-Type':'application/json'}}
async function acceptAuthUrl(rawUrl){
  if(!rawUrl||!CFG)return false;
  try{
    const u=new URL(rawUrl);
    const qs=new URLSearchParams(u.search||'');
    const hs=new URLSearchParams((u.hash||'').replace(/^#/,''));
    const pick=k=>qs.get(k)||hs.get(k);
    const discordStatus=pick('discord');
    const authType=pick('type')||'';
    if(discordStatus){
      try{await window.Capacitor?.Plugins?.Browser?.close?.()}catch{}
      if(discordStatus==='verified'){
        await loadAccess();
        window.toast?.('Discord verificado · Community desbloqueado ✓');
      }else if(discordStatus==='not_member'){
        window.toast?.('Únete a Nexus y vuelve a verificar Discord.');
      }else if(discordStatus==='already_linked'){
        window.toast?.('Esa cuenta de Discord ya está vinculada a otra cuenta BlueQuest.');
      }else if(discordStatus==='cancelled'){
        window.toast?.('Verificación de Discord cancelada.');
      }else{
        window.toast?.('No se pudo completar la verificación de Discord.');
      }
      document.dispatchEvent(new CustomEvent('bluequest:discord',{detail:{status:discordStatus}}));
      return true;
    }
    const access_token=pick('access_token'), refresh_token=pick('refresh_token');
    if(!access_token||!refresh_token)return false;
    const expires_in=Number(pick('expires_in')||3600);
    const token_type=pick('token_type')||'bearer';
    const ur=await fetch(CFG.url+'/auth/v1/user',{headers:{'apikey':CFG.publishableKey,'Authorization':'Bearer '+access_token}});
    if(!ur.ok)throw new Error('La sesión de confirmación ya no es válida.');
    const user=await ur.json();
    session={access_token,refresh_token,token_type,expires_in,expires_at:Date.now()+expires_in*1000,user};
    saveSession();
    await loadAccess();
    if(authType==='recovery'){
      setTimeout(()=>openPasswordReset(),80);
      window.toast?.('Enlace de recuperación válido ✓');
    }else{
      window.toast?.('Cuenta confirmada · sesión iniciada ✓');
    }
    return true;
  }catch(e){
    console.error('BlueQuest auth deeplink',e);
    window.toast?.('La cuenta fue confirmada, pero no pude iniciar la sesión automáticamente.');
    return false;
  }
}
async function bindNativeAuthLinks(){
  const App=window.Capacitor?.Plugins?.App;
  if(!App)return;
  try{
    App.addListener('appUrlOpen',ev=>{if(ev?.url)acceptAuthUrl(ev.url)});
    const launch=await App.getLaunchUrl();
    if(launch?.url)await acceptAuthUrl(launch.url);
  }catch(e){console.warn('BlueQuest App deeplink unavailable',e)}
}
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
function hasModule(k){return has(k)||(['fishing_tools','gold_saucer','nexus'].includes(k)&&has('community'))}
function moduleState(el,key){
  if(!el)return;
  const tag=el.querySelector('.module-lock');
  if(tag)tag.remove();
  const s=document.createElement('span');s.className='module-lock';
  s.textContent=hasModule(key)?'COMMUNITY ✓':'COMMUNITY 🔒';
  if(hasModule(key))s.style.color='#aef4d2';
  el.querySelector('div')?.appendChild(s);
}
function emitSession(){document.dispatchEvent(new CustomEvent('bluequest:session',{detail:{loggedIn:!!session?.user}}))}
function renderAccount(){
  const card=q('#bluequestAccountCard'); if(!card)return;
  const status=q('#accountStatus'), name=q('#accountName'), email=q('#accountEmail');
  if(session?.user){
    status.textContent='CONECTADO';
    name.textContent=session.user.user_metadata?.display_name||session.user.email?.split('@')[0]||'BlueQuest User';
    email.textContent=session.user.email||'';
    q('#accountLoginBtn').hidden=true;q('#accountLogoutBtn').hidden=false;q('#accountRefreshBtn').hidden=false;q('#accountPasswordBtn').hidden=false;
  }else{
    status.textContent='CORE GRATIS';
    name.textContent='Cuenta BlueQuest';
    email.textContent='El Core funciona sin cuenta. Inicia sesión para beneficios online.';
    q('#accountLoginBtn').hidden=false;q('#accountLogoutBtn').hidden=true;q('#accountRefreshBtn').hidden=true;q('#accountPasswordBtn').hidden=true;
  }
  const map={community:'accCommunity',boss_atlas:'accBoss',fishing_tools:'accFishing',gold_saucer:'accGold',nexus:'accNexus',cloud_sync:'accCloud',supporter:'accSupporter'};
  Object.entries(map).forEach(([k,id])=>{const e=q('#'+id);if(!e)return;e.classList.toggle('ok',hasModule(k));e.classList.toggle('locked',!hasModule(k));const s=e.querySelector('small');if(s)s.textContent=hasModule(k)?(k==='community'?'Disponible en tu cuenta':'Incluido con Community'):'Bloqueado'});
  moduleState(q('[data-cloud-module="boss_atlas"]'),'boss_atlas');
  moduleState(q('[data-cloud-module="fishing_tools"]'),'fishing_tools');
  moduleState(q('[data-cloud-module="gold_saucer"]'),'gold_saucer');
  moduleState(q('[data-cloud-module="nexus"]'),'nexus');
  emitSession();
  document.dispatchEvent(new CustomEvent('bluequest:access',{detail:{community:has('community')}}));
}
function openAuth(which='login'){
  mode=which; q('#authTitle').textContent=mode==='login'?'Iniciar sesión':'Crear cuenta';
  q('#authSubmit').textContent=mode==='login'?'Entrar':'Crear cuenta';
  q('#authSwitchText').textContent=mode==='login'?'¿No tienes cuenta?':'¿Ya tienes cuenta?';
  q('#authSwitchBtn').textContent=mode==='login'?'Crear una':'Iniciar sesión';
  const lead=q('#authLead');if(lead)lead.textContent=mode==='login'?'Continúa tu aventura desde cualquier dispositivo.':'Crea tu cuenta. Confirma el correo y BlueQuest abrirá tu sesión automáticamente.';
  const forgot=q('#authForgotBtn');if(forgot)forgot.hidden=mode!=='login';
  q('#authMessage').textContent='';
  q('#bluequestAuthDialog').showModal();
}
async function submitAuth(){
  if(!CFG){q('#authMessage').textContent='Cloud no configurado.';return}
  const email=q('#authEmail').value.trim(), password=q('#authPassword').value;
  if(!email||password.length<6){q('#authMessage').textContent='Usa un correo válido y una contraseña de al menos 6 caracteres.';return}
  q('#authSubmit').disabled=true;q('#authMessage').textContent='Conectando…';
  try{
    const endpoint=mode==='login'?'/auth/v1/token?grant_type=password':'/auth/v1/signup?redirect_to='+encodeURIComponent(BLUEQUEST_WELCOME_URL);
    const body=mode==='login'?{email,password}:{email,password,data:{display_name:email.split('@')[0]}};
    const r=await fetch(CFG.url+endpoint,{method:'POST',headers:{'apikey':CFG.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await safeJson(r);
    if(!r.ok)throw new Error(d.msg||d.error_description||d.message||'No se pudo completar la operación');
    if(mode==='login'){
      session={...d,expires_at:Date.now()+(d.expires_in||3600)*1000};saveSession();q('#bluequestAuthDialog').close();await loadAccess();window.toast?.('Sesión iniciada');
    }else{
      if(d.access_token){session={...d,expires_at:Date.now()+(d.expires_in||3600)*1000};saveSession();q('#bluequestAuthDialog').close();await loadAccess();window.toast?.('Cuenta creada')}
      else q('#authMessage').textContent='Cuenta creada. Revisa tu correo. Al confirmar, pulsa “Comenzar mi aventura” para volver con la sesión iniciada.';
    }
  }catch(e){q('#authMessage').textContent=e.message}
  finally{q('#authSubmit').disabled=false}
}

async function requestPasswordReset(){
  if(!CFG)return;
  const email=q('#authEmail')?.value.trim()||'';
  if(!email||!email.includes('@')){q('#authMessage').textContent='Escribe primero el correo de tu cuenta.';return}
  const btn=q('#authForgotBtn'); if(btn)btn.disabled=true;
  q('#authMessage').textContent='Enviando enlace seguro…';
  try{
    const r=await fetch(CFG.url+'/auth/v1/recover?redirect_to='+encodeURIComponent(BLUEQUEST_WELCOME_URL),{
      method:'POST',
      headers:{'apikey':CFG.publishableKey,'Content-Type':'application/json'},
      body:JSON.stringify({email})
    });
    const d=await safeJson(r);
    if(!r.ok)throw new Error(d.msg||d.error_description||d.message||'No pude enviar el correo de recuperación.');
    q('#authMessage').textContent='Si ese correo pertenece a una cuenta BlueQuest, recibirás un enlace para cambiar la contraseña.';
  }catch(e){
    q('#authMessage').textContent=e.message||'No pude enviar el correo de recuperación.';
  }finally{if(btn)btn.disabled=false}
}
function openPasswordReset(){
  const d=q('#bluequestPasswordDialog');if(!d)return;
  const p1=q('#newPassword'),p2=q('#newPasswordConfirm'),msg=q('#passwordResetMessage');
  if(p1)p1.value='';if(p2)p2.value='';if(msg)msg.textContent='Elige una contraseña nueva de al menos '+PASSWORD_MIN_LENGTH+' caracteres.';
  if(!d.open)d.showModal();
}
async function updateRecoveredPassword(){
  const p1=q('#newPassword')?.value||'',p2=q('#newPasswordConfirm')?.value||'',msg=q('#passwordResetMessage'),btn=q('#passwordResetSubmit');
  if(p1.length<PASSWORD_MIN_LENGTH){msg.textContent='Usa al menos '+PASSWORD_MIN_LENGTH+' caracteres.';return}
  if(p1!==p2){msg.textContent='Las contraseñas no coinciden.';return}
  if(!session?.access_token){msg.textContent='El enlace de recuperación ya no es válido. Solicita uno nuevo.';return}
  btn.disabled=true;msg.textContent='Actualizando contraseña…';
  try{
    const r=await fetch(CFG.url+'/auth/v1/user',{
      method:'PUT',
      headers:authHeaders(session.access_token),
      body:JSON.stringify({password:p1})
    });
    const d=await safeJson(r);
    if(!r.ok)throw new Error(d.msg||d.error_description||d.message||'No pude cambiar la contraseña.');
    // Recovery is also treated as a security event: revoke all refresh-token sessions.
    try{
      await fetch(CFG.url+'/auth/v1/logout',{
        method:'POST',
        headers:authHeaders(session.access_token)
      });
    }catch{}
    q('#bluequestPasswordDialog').close();
    session=null;entitlements.clear();saveSession();renderAccount();
    window.toast?.('Contraseña actualizada · sesiones cerradas ✓');
    setTimeout(()=>openAuth('login'),250);
  }catch(e){msg.textContent=e.message||'No pude cambiar la contraseña.'}
  finally{btn.disabled=false}
}


function openChangePassword(){
  if(!session?.user){openAuth('login');return}
  const d=q('#bluequestChangePasswordDialog');if(!d)return;
  ['#currentPassword','#changeNewPassword','#changeNewPasswordConfirm'].forEach(id=>{const e=q(id);if(e)e.value=''});
  const msg=q('#changePasswordMessage');if(msg)msg.textContent='Usa al menos '+PASSWORD_MIN_LENGTH+' caracteres.';
  if(!d.open)d.showModal();
}
async function changePassword(){
  if(!CFG||!session?.user?.email)return;
  const current=q('#currentPassword')?.value||'';
  const next=q('#changeNewPassword')?.value||'';
  const confirm=q('#changeNewPasswordConfirm')?.value||'';
  const msg=q('#changePasswordMessage');
  const btn=q('#changePasswordSubmit');
  if(!current){msg.textContent='Escribe tu contraseña actual.';return}
  if(next.length<PASSWORD_MIN_LENGTH){msg.textContent='La nueva contraseña debe tener al menos '+PASSWORD_MIN_LENGTH+' caracteres.';return}
  if(next!==confirm){msg.textContent='Las contraseñas nuevas no coinciden.';return}
  if(current===next){msg.textContent='La contraseña nueva debe ser diferente de la actual.';return}
  btn.disabled=true;msg.textContent='Verificando contraseña actual…';
  try{
    const loginRes=await fetch(CFG.url+'/auth/v1/token?grant_type=password',{
      method:'POST',
      headers:{'apikey':CFG.publishableKey,'Content-Type':'application/json'},
      body:JSON.stringify({email:session.user.email,password:current})
    });
    const fresh=await safeJson(loginRes);
    if(!loginRes.ok||!fresh.access_token)throw new Error('La contraseña actual no es correcta.');

    msg.textContent='Actualizando contraseña…';
    const updateRes=await fetch(CFG.url+'/auth/v1/user',{
      method:'PUT',
      headers:authHeaders(fresh.access_token),
      body:JSON.stringify({password:next})
    });
    const updated=await safeJson(updateRes);
    if(!updateRes.ok)throw new Error(updated.msg||updated.error_description||updated.message||'No pude cambiar la contraseña.');

    // Revoke every refresh-token session after a security-sensitive password change.
    // Existing short-lived access tokens may remain usable only until they expire.
    try{
      await fetch(CFG.url+'/auth/v1/logout',{
        method:'POST',
        headers:authHeaders(fresh.access_token)
      });
    }catch{}

    q('#bluequestChangePasswordDialog').close();
    session=null;entitlements.clear();saveSession();renderAccount();
    window.toast?.('Contraseña cambiada · sesiones cerradas ✓');
    setTimeout(()=>openAuth('login'),250);
  }catch(e){
    msg.textContent=e.message||'No pude cambiar la contraseña.';
  }finally{btn.disabled=false}
}

async function logout(){
  try{if(session?.access_token)await fetch(CFG.url+'/auth/v1/logout',{method:'POST',headers:authHeaders(session.access_token)})}catch{}
  session=null;entitlements.clear();saveSession();renderAccount();window.toast?.('Sesión cerrada');
}
function bind(){
  q('#accountLoginBtn')?.addEventListener('click',()=>openAuth('login'));
  q('#accountLogoutBtn')?.addEventListener('click',logout);
  q('#accountRefreshBtn')?.addEventListener('click',loadAccess);
  q('#accountPasswordBtn')?.addEventListener('click',openChangePassword);
  q('#authClose')?.addEventListener('click',()=>q('#bluequestAuthDialog').close());
  q('#authSubmit')?.addEventListener('click',submitAuth);
  q('#authForgotBtn')?.addEventListener('click',requestPasswordReset);
  q('#passwordResetClose')?.addEventListener('click',()=>q('#bluequestPasswordDialog').close());
  q('#passwordResetSubmit')?.addEventListener('click',updateRecoveredPassword);
  q('#changePasswordClose')?.addEventListener('click',()=>q('#bluequestChangePasswordDialog').close());
  q('#changePasswordSubmit')?.addEventListener('click',changePassword);
  q('#changeNewPasswordConfirm')?.addEventListener('keydown',e=>{if(e.key==='Enter')changePassword()});
  q('#newPasswordConfirm')?.addEventListener('keydown',e=>{if(e.key==='Enter')updateRecoveredPassword()});
  q('#authSwitchBtn')?.addEventListener('click',()=>openAuth(mode==='login'?'signup':'login'));
  q('#authPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')submitAuth()});
}
window.BlueQuestCloud={has,hasModule,openAuth,refresh:loadAccess,getSession:()=>session,ensureSession:async()=>{await refreshIfNeeded();return session;},acceptAuthUrl,requestPasswordReset,openChangePassword};
document.addEventListener('DOMContentLoaded',async()=>{loadSession();bind();renderAccount();await bindNativeAuthLinks();if(session)await loadAccess()});
})();