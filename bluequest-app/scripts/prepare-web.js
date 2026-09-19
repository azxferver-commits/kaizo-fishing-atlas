const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..");
const sourceHtml = path.join(repoRoot, "bluequest-mobile-v4", "index.html");
const source180 = path.join(repoRoot, "blue-quest-atlas-1-80", "data.json");
const source80100 = path.join(repoRoot, "blue-quest-atlas-80-100", "data.json");
const www = path.join(appRoot, "www");
const dataDir = path.join(www, "data");
const nativeDir = path.join(appRoot, "native");

fs.mkdirSync(dataDir, { recursive: true });

const atlas180 = JSON.parse(fs.readFileSync(source180, "utf8"));
const atlas80100 = JSON.parse(fs.readFileSync(source80100, "utf8"));

if (atlas180.length !== 274) throw new Error("Atlas 1-80 incompleto: " + atlas180.length);
if (atlas80100.length !== 159) throw new Error("Atlas 80-100 incompleto: " + atlas80100.length);

fs.writeFileSync(path.join(dataDir, "atlas-1-80.json"), JSON.stringify(atlas180, null, 2));
fs.writeFileSync(path.join(dataDir, "atlas-80-100.json"), JSON.stringify(atlas80100, null, 2));

// BlueQuest integrated ecosystem modules.
const modulesRoot = path.join(www, "modules");
fs.mkdirSync(modulesRoot, { recursive: true });

const fishingDir = path.join(modulesRoot, "fishing");
fs.rmSync(fishingDir, { recursive: true, force: true });
fs.mkdirSync(fishingDir, { recursive: true });
for (const file of ["index.html", "fish.js", "quests.js", "ocean-mini.js"]) {
  fs.copyFileSync(path.join(repoRoot, file), path.join(fishingDir, file));
}
// When a synced Fisher exists, modules.js passes ?level=N.
const fishingHtmlPath = path.join(fishingDir, "index.html");
let fishingHtml = fs.readFileSync(fishingHtmlPath, "utf8");
fishingHtml = fishingHtml.replace("</body>", `<script>
(() => {
  const lv = Number(new URLSearchParams(location.search).get('level'));
  if (!Number.isFinite(lv) || lv < 1) return;
  const el = document.querySelector('#lvl');
  if (!el) return;
  el.value = Math.min(100, Math.max(1, lv));
  el.dispatchEvent(new Event('input', { bubbles: true }));
})();
</script></body>`);
fs.writeFileSync(fishingHtmlPath, fishingHtml);

const goldDir = path.join(modulesRoot, "gold-saucer");
fs.rmSync(goldDir, { recursive: true, force: true });
fs.cpSync(path.join(repoRoot, "gold-saucer"), goldDir, { recursive: true });

const nexusDir = path.join(modulesRoot, "nexus");
fs.rmSync(nexusDir, { recursive: true, force: true });
fs.cpSync(path.join(repoRoot, "eorzea-codex"), nexusDir, { recursive: true });


for (const file of ["cloud-config.js", "account.css", "account.js", "ffxiv-sync.js", "modules.js", "analytics.js", "discord.js"]) {
  fs.copyFileSync(path.join(nativeDir, file), path.join(www, file));
}

let html = fs.readFileSync(sourceHtml, "utf8");

html = html
  .replace(/<title>[^<]*<\/title>/, "<title>BlueQuest Atlas</title>")
  .replace(/V4\.\d+(?:\.\d+)?[^<]*/g, "APP 1.12 · RECOVERY")
  .replace(/<link rel="manifest"[^>]*>/g, "")
  .replace(/<link rel="icon"[^>]*>/g, "")
  .replace(/<link rel="apple-touch-icon"[^>]*>/g, "")
  .replace(
    /const DATA_FILES=\[[^\]]*\];/,
    "const DATA_FILES=['./data/atlas-1-80.json','./data/atlas-80-100.json'];"
  );

if (!html.includes('href="./account.css"')) {
  html = html.replace("</head>", '<link rel="stylesheet" href="./account.css" />\n</head>');
}

html = html.replace(
  /<a class="quick-card" href="\.\.\/blue-quest-atlas-1-80\/"[^>]*>([\s\S]*?<em>274<\/em>)\s*<\/a>/,
  '<button class="quick-card" data-range="1-80" data-nav="explore">$1</button>'
);
html = html.replace(
  /<a class="quick-card" href="\.\.\/blue-quest-atlas-80-100\/"[^>]*>([\s\S]*?<em>159<\/em>)\s*<\/a>/,
  '<button class="quick-card" data-range="80-100" data-nav="explore">$1</button>'
);

html = html.replace(
  /<a class="module-card live" href="\.\.\/blue-quest-atlas-1-80\/"[^>]*>([\s\S]*?)<\/a>/,
  '<button class="module-card live" data-range="1-80" data-nav="explore" style="color:inherit;text-decoration:none;text-align:left">$1</button>'
);
html = html.replace(
  /<a class="module-card live" href="\.\.\/blue-quest-atlas-80-100\/"[^>]*>([\s\S]*?)<\/a>/,
  '<button class="module-card live" data-range="80-100" data-nav="explore" style="color:inherit;text-decoration:none;text-align:left">$1</button>'
);

html = html.replace(
  /<button class="icon-btn" id="installBtn"[^>]*>[\s\S]*?<\/button>/,
  '<button class="icon-btn" id="installBtn" hidden aria-label="App nativa">✓</button>'
);

html = html.replace(
  /<section class="install-card">[\s\S]*?<\/section>/,
  '<section class="install-card"><div><p class="eyebrow">MODO NATIVO</p><h3>Datos disponibles sin conexión</h3><p>BlueQuest incluye 433 desbloqueos dentro de la aplicación.</p></div><button type="button" disabled>OFFLINE ✓</button></section>'
);

html = html.replace(
  /function installAction\(\)\{[\s\S]*?\}\nfunction connectionState/,
  "function installAction(){toast('BlueQuest ya está instalada como app nativa')}\nfunction connectionState"
);

html = html.replace(
  "$('#installBtn').onclick=installAction;$('#installBtn2').onclick=installAction;$('#installClose').onclick=()=>$('#installDialog').close();",
  "const ib=$('#installBtn');if(ib)ib.onclick=installAction;const ib2=$('#installBtn2');if(ib2)ib2.onclick=installAction;const ic=$('#installClose');if(ic)ic.onclick=()=>$('#installDialog').close();"
);

html = html.replace(/if\('serviceWorker'in navigator\)[^;]*;/g, "");

// Community access gate: Lv. 1-50 free; Lv. 51+ requires the server-backed "community" entitlement.
html = html.replace(/function card\(q\)\{[\s\S]*?\}\nfunction renderQuestList/, "function hasCommunityAccess(){return !!window.BlueQuestCloud?.has?.('community')}\nfunction isCommunityLocked(q){return Number(q?.level||0)>50&&!hasCommunityAccess()}\nfunction card(q){const k=key(q),done=!!state.done[k],fav=!!state.favorites[k],locked=isCommunityLocked(q);return `<article class=\"quest-card ${locked?'community-locked':''}\" data-key=\"${esc(k)}\" tabindex=\"0\"><span class=\"level-pill\">Lv ${q.level}</span><div class=\"quest-main\"><h3>${esc(q.name)}</h3><p>${locked?'🔒 Contenido Community':esc(q.location||q.unlock||'')}</p><div class=\"quest-tags\"><span class=\"tag\">${esc(q.type||'Quest')}</span><span class=\"tag high\">${rangeOf(q)}</span>${locked?'<span class=\"tag community-lock\">🔒 Community</span>':''}${done?'<span class=\"tag done\">✓ Hecha</span>':''}</div></div><button class=\"fav-btn ${fav?'on':''}\" data-fav=\"${esc(k)}\" aria-label=\"Favorito\">${fav?'★':'☆'}</button></article>`}\nfunction renderQuestList");
html = html.replace(/function openQuest\(q\)\{[\s\S]*?\}\nfunction toggleFavorite/, "function openQuest(q){if(!q)return;if(isCommunityLocked(q)){pushRecent(q);const logged=!!window.BlueQuestCloud?.getSession?.()?.user;$('#dialogContent').innerHTML=`<span class=\"dialog-level\">Lv ${q.level}</span><h2 class=\"dialog-title\">${esc(q.name)}</h2><div class=\"dialog-tags\"><span class=\"tag\">${esc(q.type||'Quest')}</span><span class=\"tag community-lock\">🔒 Community</span></div><div class=\"community-gate\"><div class=\"community-gate-icon\">◆</div><h3>Contenido de comunidad</h3><p>BlueQuest Lv. 1–50 es gratis. Desde Lv. 51, los detalles completos requieren acceso <b>Community</b>.</p><p class=\"community-gate-sub\">${logged?'Tu cuenta está conectada, pero aún no tiene el acceso Community.':'Crea o inicia sesión con tu cuenta BlueQuest para continuar con el desbloqueo Community.'}</p><button class=\"complete-action\" data-community-cta>${logged?'Ver acceso Community':'Crear cuenta / Iniciar sesión'}</button></div>`;$('#questDialog').showModal();return}pushRecent(q);const k=key(q),done=!!state.done[k],fav=!!state.favorites[k], source=q.source||'KAIZO BlueQuest Atlas';$('#dialogContent').innerHTML=`<span class=\"dialog-level\">Lv ${q.level}</span><h2 class=\"dialog-title\">${esc(q.name)}</h2><div class=\"dialog-tags\"><span class=\"tag\">${esc(q.type||'Quest')}</span><span class=\"tag high\">${rangeOf(q)}</span>${q.expansion?`<span class=\"tag\">${esc(q.expansion)}</span>`:''}</div><div class=\"detail-grid\"><div class=\"detail-card\"><small>Dónde / inicio</small><p>${esc(q.location||'—')}</p></div><div class=\"detail-card\"><small>Desbloquea</small><p>${esc(q.unlock||'—')}</p></div><div class=\"detail-card\"><small>Qué abre</small><p>${esc(q.opens||'—')}</p></div><div class=\"detail-card\"><small>Requisitos / notas</small><p>${esc(q.requirements||'Sin requisito adicional documentado.')}</p></div></div><div class=\"dialog-actions\"><button class=\"complete-action ${done?'done':''}\" data-complete=\"${esc(k)}\">${done?'✓ Completada':'Marcar completada'}</button><button class=\"favorite-action ${fav?'on':''}\" data-favorite=\"${esc(k)}\">${fav?'★ Guardada':'☆ Guardar'}</button></div><p class=\"source-line\">Fuente: ${esc(source)} · Estado: ${esc(q.status||'verified')}</p>`;$('#questDialog').showModal()}\nfunction toggleFavorite");
html = html.replace(
  "$('#dialogContent').addEventListener('click',e=>{const c=e.target.closest('[data-complete]');if(c)toggleDone(c.dataset.complete);const f=e.target.closest('[data-favorite]');if(f)toggleFavorite(f.dataset.favorite)});",
  "$('#dialogContent').addEventListener('click',e=>{const u=e.target.closest('[data-community-cta]');if(u){$('#questDialog').close();const logged=!!window.BlueQuestCloud?.getSession?.()?.user;if(!logged)window.BlueQuestCloud?.openAuth?.('signup');else{navigate('more');toast('Tu cuenta necesita acceso Community')}return}const c=e.target.closest('[data-complete]');if(c)toggleDone(c.dataset.complete);const f=e.target.closest('[data-favorite]');if(f)toggleFavorite(f.dataset.favorite)});"
);

html = html.replace(
  "function saveState(){localStorage.setItem(STATE_KEY,JSON.stringify(state));updateGlobalStats()}",
  "function saveState(){localStorage.setItem(STATE_KEY,JSON.stringify(state));updateGlobalStats();document.dispatchEvent(new CustomEvent('bluequest:progress'))}"
);

const moreNeedle = '<section class="view" id="view-more" data-view="more">\n      <div class="screen-head"><p class="eyebrow">BLUEQUEST NEXO</p><h2>Más herramientas</h2><p>La base móvil está preparada para crecer con el resto del ecosistema.</p></div>\n      <div class="module-grid">';
const moreReplacement = '<section class="view" id="view-more" data-view="more">\n      <div class="screen-head"><p class="eyebrow">BLUEQUEST NEXO</p><h2>Más herramientas</h2><p>La base móvil está preparada para crecer con el resto del ecosistema.</p></div>\n      <section class="account-card" id="bluequestAccountCard">\n        <div class="account-head">\n          <div><h3 id="accountName">Cuenta BlueQuest</h3><p id="accountEmail">El Core funciona sin cuenta. Inicia sesión para beneficios online.</p></div>\n          <span class="account-badge" id="accountStatus">CORE GRATIS</span>\n        </div>\n        <div class="account-actions">\n          <button id="accountLoginBtn">Iniciar sesión / Crear cuenta</button>\n          <button id="accountRefreshBtn" class="secondary" hidden>Actualizar acceso</button>\n          <button id="accountLogoutBtn" class="secondary" hidden>Cerrar sesión</button>\n        </div>\n        <div class="access-grid">\n          <div class="access-item locked" id="accCommunity"><b>Community</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accBoss"><b>Boss Atlas</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accFishing"><b>Fishing Tools</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accGold"><b>Gold Saucer</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accNexus"><b>Nexus</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accCloud"><b>Cloud Sync</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accSupporter"><b>Supporter</b><small>Bloqueado</small></div>\n        </div>\n      </section>\n      <div class="module-grid">';

if (!html.includes('id="bluequestAccountCard"')) {
  html = html.replace(moreNeedle, moreReplacement);
}

if (!html.includes('id="discordCommunityCard"')) {
  const discordCard = `
      <section class="discord-card" id="discordCommunityCard">
        <div class="discord-head">
          <div><p class="eyebrow">NEXUS COMMUNITY</p><h3>Desbloquea con Discord</h3></div>
          <span class="discord-status" id="discordCommunityStatus">DISCORD REQUERIDO</span>
        </div>
        <p id="discordCommunityMessage">Únete al servidor Nexus y verifica tu Discord para desbloquear Community.</p>
        <div class="discord-actions">
          <button id="discordJoinBtn" type="button">Unirme a Nexus</button>
          <button id="discordVerifyBtn" class="primary" type="button">Verificar Discord</button>
        </div>
        <div class="discord-unlocks"><span>◆ BlueQuest 51–100</span><span>🎣 Fishing Tools</span><span>✦ Gold Saucer</span><span>◆ Nexus</span></div>
      </section>`;
  html = html.replace(/(<section class="account-card" id="bluequestAccountCard">[\s\S]*?<\/section>)/, '$1' + discordCard);
}

if (!html.includes('id="adminAnalyticsCard"')) {
  const analyticsCard = `
      <section class="analytics-card" id="adminAnalyticsCard" hidden>
        <div class="analytics-head">
          <div><p class="eyebrow">SOLO ADMINISTRADOR</p><h3>BlueQuest Analytics</h3><p id="anUpdated">Esperando datos…</p></div>
          <button id="adminAnalyticsRefresh" type="button">↻</button>
        </div>
        <div class="analytics-grid">
          <div><small>CUENTAS</small><b id="anAccounts">0</b></div>
          <div><small>INSTALACIONES</small><b id="anInstalls">0</b></div>
          <div class="online"><small>ONLINE AHORA</small><b><i></i><span id="anOnline">0</span></b></div>
          <div><small>ACTIVOS HOY</small><b id="anToday">0</b></div>
          <div><small>ACTIVOS 7 DÍAS</small><b id="an7d">0</b></div>
          <div><small>ACTIVOS 30 DÍAS</small><b id="an30d">0</b></div>
          <div><small>COMMUNITY</small><b id="anCommunity">0</b></div>
        </div>
        <div class="analytics-modules">
          <span>Uso hoy</span>
          <div><b>🎣 <i id="anFishing">0</i></b><small>Fishing</small></div>
          <div><b>✦ <i id="anGold">0</i></b><small>Gold Saucer</small></div>
          <div><b>◆ <i id="anNexus">0</i></b><small>Nexus</small></div>
        </div>
        <p class="analytics-note">Online = instalación con señal recibida en los últimos 2 minutos. Las instalaciones usan un identificador aleatorio; no se recopila ubicación.</p>
      </section>`;
  html = html.replace(/(<section class="account-card" id="bluequestAccountCard">[\s\S]*?<\/section>)/, '$1' + analyticsCard);
}

if (!html.includes('id="ffxivCharacterCard"')) {
  const ffxivCard = `
      <section class="ffxiv-card" id="ffxivCharacterCard">
        <div class="ffxiv-head">
          <div><h3>Mi personaje FFXIV</h3><p>Sincronización pública con The Lodestone</p></div>
          <span class="account-badge" id="ffxivStatus">SIN VINCULAR</span>
        </div>
        <div class="ffxiv-empty" id="ffxivEmpty">
          <span id="ffxivEmptyText">Inicia sesión en BlueQuest para vincular tu personaje.</span>
          <button id="ffxivLinkBtn" type="button">Vincular personaje</button>
        </div>
        <div id="ffxivLinked" hidden>
          <div class="ffxiv-profile">
            <img class="ffxiv-avatar" id="ffxivAvatar" alt="" hidden />
            <div><h4 id="ffxivName">Personaje FFXIV</h4><p id="ffxivWorld"></p><p id="ffxivSynced"></p></div>
          </div>
          <div class="ffxiv-summary">
            <div class="ffxiv-stat"><small>COMBATE MÁX.</small><b id="ffxivCombat">—</b></div>
            <div class="ffxiv-stat"><small>CRAFTEO MÁX.</small><b id="ffxivCraft">—</b></div>
            <div class="ffxiv-stat"><small>RECOLECCIÓN MÁX.</small><b id="ffxivGather">—</b></div>
            <div class="ffxiv-stat"><small>JOBS CON NIVEL</small><b id="ffxivUnlocked">—</b></div>
          </div>
          <div class="ffxiv-jobs" id="ffxivJobs"></div>
          <div class="ffxiv-atlas-progress" id="ffxivAtlasProgress" hidden>
            <div><div><b>Progreso conocido BlueQuest</b><small id="ffxivAtlasCount">0 / 433 conocidas</small></div><strong id="ffxivAtlasPct">0%</strong></div>
            <div class="sync-track"><span class="manual" id="ffxivAtlasManualBar"></span><span class="detected" id="ffxivAtlasDetectedBar"></span></div>
            <div class="sync-legend">
              <span><i class="manual"></i><b id="ffxivManualCount">0</b> marcadas por ti</span>
              <span><i class="detected"></i><b id="ffxivDetectedCount">0</b> detectadas por FFXIV</span>
            </div>
          </div>
          <div class="ffxiv-actions">
            <button id="ffxivSyncBtn" type="button">Sincronizar</button>
            <button id="ffxivChangeBtn" class="secondary" type="button">Cambiar personaje</button>
            <a id="ffxivLodestone" class="secondary" target="_blank" rel="noopener">Lodestone ↗</a>
            <button id="ffxivUnlinkBtn" class="danger" type="button">Desvincular</button>
          </div>
        </div>
      </section>`;
  html = html.replace(/(<section class="account-card" id="bluequestAccountCard">[\s\S]*?<\/section>)/, '$1' + ffxivCard);
}

html = html
  .replace(
    '<article class="module-card future"><span>🎣</span><div><small>SIGUIENTE</small><h3>Fishing Atlas</h3><p>Preparado para integrarlo.</p></div></article>',
    '<button class="module-card live" type="button" data-cloud-module="fishing_tools" data-module-open="fishing_tools" style="color:inherit;text-decoration:none;text-align:left"><span>🎣</span><div><small>COMMUNITY</small><h3>Fishing Tools</h3><p>Misiones, peces, carnadas y Ocean Fishing →</p></div></button>'
  )
  .replace(
    '<article class="module-card future"><span>⚔</span><div><small>SIGUIENTE</small><h3>Boss Atlas</h3><p>Raids, roles y mecánicas.</p></div></article>',
    '<article class="module-card future" data-cloud-module="boss_atlas"><span>⚔</span><div><small>SIGUIENTE</small><h3>Boss Atlas</h3><p>Raids, roles y mecánicas.</p></div></article>'
  )
  .replace(
    '<article class="module-card future"><span>✦</span><div><small>SIGUIENTE</small><h3>Gold Saucer</h3><p>Rutas y Fashion Report.</p></div></article>',
    '<button class="module-card live" type="button" data-cloud-module="gold_saucer" data-module-open="gold_saucer" style="color:inherit;text-decoration:none;text-align:left"><span>✦</span><div><small>COMMUNITY</small><h3>Gold Saucer</h3><p>Mapa, MGP y Fashion Report semanal →</p></div></button>'
  );

html = html.replace(
  '<article class="module-card future"><span>☰</span><div><small>SIGUIENTE</small><h3>MSQ / Gear</h3><p>Progreso y equipo.</p></div></article>',
  '<button class="module-card live" type="button" data-cloud-module="nexus" data-module-open="nexus" style="color:inherit;text-decoration:none;text-align:left"><span>◆</span><div><small>COMMUNITY</small><h3>Nexus</h3><p>Historia, progresión, mundo y Eorzea Codex →</p></div></button>'
);

if (!html.includes('id="ffxivJobDialog"')) {
  html = html.replace(
    '  <div id="toast" class="toast" role="status"></div>',
    '  <dialog id="ffxivJobDialog" class="quest-dialog">\n    <div class="dialog-sheet ffxiv-sheet">\n      <div class="dialog-grab"></div>\n      <button class="dialog-close" id="ffxivJobClose" aria-label="Cerrar">×</button>\n      <div class="route-head"><div><p class="eyebrow" id="jobRouteEyebrow">RUTA BLUEQUEST</p><h2 id="jobRouteTitle">Job</h2></div><div class="route-flag"><strong id="jobRouteFlag">●</strong><small id="jobRouteFlagLabel">REVISAR</small></div></div>\n      <div class="route-meter"><p id="jobRouteSummary">0 conocidas · 0 pendientes</p></div>\n      <div class="route-stats"><div class="route-stat"><b id="jobRouteManual">0</b><small>Marcadas por ti</small></div><div class="route-stat"><b id="jobRouteDetected">0</b><small>Detectadas por sync</small></div><div class="route-stat"><b id="jobRoutePending">0</b><small>Pendientes</small></div></div>\n      <section class="route-section"><h3>✦ BlueQuest recomienda ahora</h3><p>Prioriza desbloqueos útiles que ya puedes hacer con tu nivel.</p><div class="route-list" id="jobRouteRecommended"></div></section>\n      <section class="route-section"><h3>Próximos desbloqueos</h3><div class="route-list" id="jobRouteFuture"></div></section>\n      <section class="route-section"><h3>Ruta disponible a tu nivel</h3><div class="route-list" id="jobRouteAll"></div></section>\n      <p class="route-note">✓ Hecha = la marcaste en BlueQuest. ◆ Detectada = la sincronización demuestra ese desbloqueo. El aviso azul significa que BlueQuest encontró pendientes para revisar; no representa un porcentaje del Job.</p>\n    </div>\n  </dialog>\n  <div id="toast" class="toast" role="status"></div>'
  );
}

if (!html.includes('id="ffxivLinkDialog"')) {
  html = html.replace(
    '  <div id="toast" class="toast" role="status"></div>',
    '  <dialog id="ffxivLinkDialog" class="quest-dialog">\n    <div class="dialog-sheet ffxiv-sheet">\n      <div class="dialog-grab"></div>\n      <button class="dialog-close" id="ffxivLinkClose" aria-label="Cerrar">×</button>\n      <p class="eyebrow">FINAL FANTASY XIV</p>\n      <h2>Vincular personaje</h2>\n      <p class="hint">Abre tu perfil público en The Lodestone y pega aquí la URL del personaje. BlueQuest nunca te pedirá tu contraseña de Square Enix.</p>\n      <div class="auth-fields"><input id="ffxivLodestoneInput" type="url" inputmode="url" placeholder="https://na.finalfantasyxiv.com/lodestone/character/..." /></div>\n      <p class="hint"><a href="https://na.finalfantasyxiv.com/lodestone/character/" target="_blank" rel="noopener">Buscar mi personaje en Lodestone ↗</a></p>\n      <button class="auth-submit" id="ffxivLinkSubmit">Vincular y sincronizar</button>\n      <p class="auth-note" id="ffxivLinkMessage"></p>\n    </div>\n  </dialog>\n  <div id="toast" class="toast" role="status"></div>'
  );
}

if (!html.includes('id="bluequestAuthDialog"')) {
  html = html.replace(
    '  <div id="toast" class="toast" role="status"></div>',
    '  <dialog id="bluequestAuthDialog" class="quest-dialog">\n    <div class="dialog-sheet auth-sheet">\n      <div class="dialog-grab"></div>\n      <button class="dialog-close" id="authClose" aria-label="Cerrar">×</button>\n      <div class="auth-brand"><img src="./bluequest_icon.webp" alt=""><span>BLUEQUEST</span></div>\n      <p class="eyebrow">BLUEQUEST ACCOUNT</p>\n      <h2 id="authTitle">Iniciar sesión</h2>\n      <p class="auth-lead" id="authLead">Continúa tu aventura desde cualquier dispositivo.</p>\n      <div class="auth-fields">\n        <input id="authEmail" type="email" inputmode="email" autocomplete="email" placeholder="Correo electrónico" />\n        <input id="authPassword" type="password" autocomplete="current-password" placeholder="Contraseña" />\n      </div>\n      <button class="auth-submit" id="authSubmit">Entrar</button>\n      <button class="auth-forgot" id="authForgotBtn" type="button">¿Olvidaste tu contraseña?</button>\n      <p class="auth-note" id="authMessage"></p>\n      <div class="auth-switch"><span id="authSwitchText">¿No tienes cuenta?</span> <button id="authSwitchBtn">Crear una</button></div>\n    </div>\n  </dialog>\n  <div id="toast" class="toast" role="status"></div>'
  );
}

if (!html.includes('id="bluequestPasswordDialog"')) {
  html = html.replace(
    '  <div id="toast" class="toast" role="status"></div>',
    '  <dialog id="bluequestPasswordDialog" class="quest-dialog">\n    <div class="dialog-sheet auth-sheet">\n      <div class="dialog-grab"></div>\n      <button class="dialog-close" id="passwordResetClose" aria-label="Cerrar">×</button>\n      <div class="auth-brand"><img src="./bluequest_icon.webp" alt=""><span>BLUEQUEST</span></div>\n      <p class="eyebrow">RECUPERAR CUENTA</p>\n      <h2>Nueva contraseña</h2>\n      <p class="auth-lead">El enlace de recuperación fue validado. Elige una contraseña nueva para tu cuenta.</p>\n      <div class="auth-fields">\n        <input id="newPassword" type="password" autocomplete="new-password" placeholder="Nueva contraseña" />\n        <input id="newPasswordConfirm" type="password" autocomplete="new-password" placeholder="Repite la contraseña" />\n      </div>\n      <button class="auth-submit" id="passwordResetSubmit" type="button">Guardar nueva contraseña</button>\n      <p class="auth-note" id="passwordResetMessage">Usa al menos 8 caracteres.</p>\n    </div>\n  </dialog>\n  <div id="toast" class="toast" role="status"></div>'
  );
}

// Integrated ecosystem module viewer.
if (!html.includes('id="bluequestModuleDialog"')) {
  html = html.replace(
    '  <div id="toast" class="toast" role="status"></div>',
    '  <dialog id="bluequestModuleDialog" class="module-dialog">\n    <div class="module-shell">\n      <header class="module-topbar"><div><span id="bluequestModuleIcon">◆</span><b id="bluequestModuleTitle">BlueQuest Module</b></div><button id="bluequestModuleClose" type="button" aria-label="Cerrar">×</button></header>\n      <iframe id="bluequestModuleFrame" title="BlueQuest module" src="about:blank"></iframe>\n    </div>\n  </dialog>\n  <div id="toast" class="toast" role="status"></div>'
  );
}

html = html.replace(
  "init();\n</script>",
  "document.documentElement.dataset.runtime=(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())?'native':'web';\nwindow.BlueQuestAtlas={getData:()=>DATA,getState:()=>state,key:q=>key(q),isDone:q=>!!state.done[key(q)],findByKey:k=>findByKey(k),openQuest:q=>openQuest(q)};\ndocument.addEventListener('bluequest:access',()=>{renderExplore();renderFavorites();renderRecent();renderProgress()});\ninit().then(()=>document.dispatchEvent(new CustomEvent('bluequest:ready')));\n</script>"
);

if (!html.includes('src="./cloud-config.js"')) {
  html = html.replace(
    "</body>",
    '  <script src="./cloud-config.js"></script>\n  <script src="./account.js"></script>\n  <script src="./ffxiv-sync.js"></script>\n  <script src="./modules.js"></script>\n  <script src="./analytics.js"></script>\n  <script src="./discord.js"></script>\n</body>'
  );
}

fs.writeFileSync(path.join(www, "index.html"), html);

console.log("BlueQuest native web bundle ready");
console.log("Atlas 1-80:", atlas180.length);
console.log("Atlas 80-100:", atlas80100.length);
console.log("Total:", atlas180.length + atlas80100.length);
