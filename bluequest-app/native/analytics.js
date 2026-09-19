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
})();async function adminUsersRequest(method = "GET", body = null) {
  const session = await window.BlueQuestCloud?.getSession?.();

  if (!session?.access_token) {
    throw new Error("No hay sesión activa.");
  }

  const options = {
    method,
    headers: {
      apikey: window.BlueQuestCloud.anonKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${window.BlueQuestCloud.url}/functions/v1/admin-users`,
    options
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}`);
  }

  return data;
}

async function loadAdminUsers() {
  const container = document.querySelector("#adminUsersList");

  if (!container) return;

  container.innerHTML = `<div class="admin-users-loading">Cargando cuentas...</div>`;

  try {
    const data = await adminUsersRequest("GET");
    const users = Array.isArray(data?.users) ? data.users : [];

    if (!users.length) {
      container.innerHTML =
        `<div class="admin-users-empty">No hay cuentas registradas.</div>`;
      return;
    }

    container.innerHTML = users.map((user) => {
      const banned =
        user.banned_until &&
        new Date(user.banned_until).getTime() > Date.now();

      const created = user.created_at
        ? new Date(user.created_at).toLocaleString()
        : "—";

      const lastLogin = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString()
        : "Nunca";

      return `
        <div class="admin-user-card" data-user-id="${user.id}">
          <div class="admin-user-main">
            <strong>${escapeAdminHtml(user.email || "Sin email")}</strong>
            <span class="admin-user-status ${banned ? "is-banned" : "is-active"}">
              ${banned ? "BLOQUEADA" : "ACTIVA"}
            </span>
          </div>

          <div class="admin-user-info">
            <div>Creada: ${created}</div>
            <div>Último acceso: ${lastLogin}</div>
          </div>

          <div class="admin-user-actions">
            ${
              banned
                ? `<button type="button" data-admin-action="unban">Reactivar</button>`
                : `<button type="button" data-admin-action="ban">Bloquear</button>`
            }

            <button
              type="button"
              class="admin-user-delete"
              data-admin-action="delete">
              Eliminar
            </button>
          </div>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("BlueQuest admin users:", error);

    container.innerHTML = `
      <div class="admin-users-error">
        No se pudieron cargar las cuentas.
        <br>
        ${escapeAdminHtml(error?.message || "Error desconocido")}
      </div>
    `;
  }
}

function escapeAdminHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-admin-action]");

  if (!button) return;

  const card = button.closest(".admin-user-card");
  const userId = card?.dataset?.userId;
  const action = button.dataset.adminAction;

  if (!userId || !action) return;

  if (action === "delete") {
    const confirmed = confirm(
      "¿Seguro que quieres eliminar esta cuenta? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;
  }

  if (action === "ban") {
    const confirmed = confirm(
      "¿Quieres bloquear esta cuenta?"
    );

    if (!confirmed) return;
  }

  try {
    button.disabled = true;

    await adminUsersRequest("POST", {
      action,
      user_id: userId
    });

    await loadAdminUsers();

  } catch (error) {
    alert(error?.message || "No se pudo completar la acción.");
    button.disabled = false;
  }
});

document
  .querySelector("#adminUsersRefresh")
  ?.addEventListener("click", loadAdminUsers);

window.BlueQuestAdminUsers = {
  load: loadAdminUsers
};
