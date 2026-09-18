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

for (const file of ["cloud-config.js", "account.css", "account.js"]) {
  fs.copyFileSync(path.join(nativeDir, file), path.join(www, file));
}

let html = fs.readFileSync(sourceHtml, "utf8");

html = html
  .replace(/<title>[^<]*<\/title>/, "<title>BlueQuest Atlas</title>")
  .replace(/V4\.\d+(?:\.\d+)?[^<]*/g, "APP 1.3 · CONFIRM FLOW")
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

const moreNeedle = '<section class="view" id="view-more" data-view="more">\n      <div class="screen-head"><p class="eyebrow">BLUEQUEST NEXO</p><h2>Más herramientas</h2><p>La base móvil está preparada para crecer con el resto del ecosistema.</p></div>\n      <div class="module-grid">';
const moreReplacement = '<section class="view" id="view-more" data-view="more">\n      <div class="screen-head"><p class="eyebrow">BLUEQUEST NEXO</p><h2>Más herramientas</h2><p>La base móvil está preparada para crecer con el resto del ecosistema.</p></div>\n      <section class="account-card" id="bluequestAccountCard">\n        <div class="account-head">\n          <div><h3 id="accountName">Cuenta BlueQuest</h3><p id="accountEmail">El Core funciona sin cuenta. Inicia sesión para beneficios online.</p></div>\n          <span class="account-badge" id="accountStatus">CORE GRATIS</span>\n        </div>\n        <div class="account-actions">\n          <button id="accountLoginBtn">Iniciar sesión / Crear cuenta</button>\n          <button id="accountRefreshBtn" class="secondary" hidden>Actualizar acceso</button>\n          <button id="accountLogoutBtn" class="secondary" hidden>Cerrar sesión</button>\n        </div>\n        <div class="access-grid">\n          <div class="access-item locked" id="accCommunity"><b>Community</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accBoss"><b>Boss Atlas</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accFishing"><b>Fishing Tools</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accGold"><b>Gold Saucer</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accCloud"><b>Cloud Sync</b><small>Bloqueado</small></div>\n          <div class="access-item locked" id="accSupporter"><b>Supporter</b><small>Bloqueado</small></div>\n        </div>\n      </section>\n      <div class="module-grid">';

if (!html.includes('id="bluequestAccountCard"')) {
  html = html.replace(moreNeedle, moreReplacement);
}

html = html
  .replace(
    '<article class="module-card future"><span>🎣</span><div><small>SIGUIENTE</small><h3>Fishing Atlas</h3><p>Preparado para integrarlo.</p></div></article>',
    '<article class="module-card future" data-cloud-module="fishing_tools"><span>🎣</span><div><small>SIGUIENTE</small><h3>Fishing Atlas</h3><p>Preparado para integrarlo.</p></div></article>'
  )
  .replace(
    '<article class="module-card future"><span>⚔</span><div><small>SIGUIENTE</small><h3>Boss Atlas</h3><p>Raids, roles y mecánicas.</p></div></article>',
    '<article class="module-card future" data-cloud-module="boss_atlas"><span>⚔</span><div><small>SIGUIENTE</small><h3>Boss Atlas</h3><p>Raids, roles y mecánicas.</p></div></article>'
  )
  .replace(
    '<article class="module-card future"><span>✦</span><div><small>SIGUIENTE</small><h3>Gold Saucer</h3><p>Rutas y Fashion Report.</p></div></article>',
    '<article class="module-card future" data-cloud-module="gold_saucer"><span>✦</span><div><small>SIGUIENTE</small><h3>Gold Saucer</h3><p>Rutas y Fashion Report.</p></div></article>'
  );

if (!html.includes('id="bluequestAuthDialog"')) {
  html = html.replace(
    '  <div id="toast" class="toast" role="status"></div>',
    '  <dialog id="bluequestAuthDialog" class="quest-dialog">\n    <div class="dialog-sheet auth-sheet">\n      <div class="dialog-grab"></div>\n      <button class="dialog-close" id="authClose" aria-label="Cerrar">×</button>\n      <p class="eyebrow">BLUEQUEST ACCOUNT</p>\n      <h2 id="authTitle">Iniciar sesión</h2>\n      <div class="auth-fields">\n        <input id="authEmail" type="email" inputmode="email" autocomplete="email" placeholder="Correo electrónico" />\n        <input id="authPassword" type="password" autocomplete="current-password" placeholder="Contraseña" />\n      </div>\n      <button class="auth-submit" id="authSubmit">Entrar</button>\n      <p class="auth-note" id="authMessage"></p>\n      <div class="auth-switch"><span id="authSwitchText">¿No tienes cuenta?</span> <button id="authSwitchBtn">Crear una</button></div>\n    </div>\n  </dialog>\n  <div id="toast" class="toast" role="status"></div>'
  );
}

html = html.replace(
  "init();\n</script>",
  "document.documentElement.dataset.runtime=(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())?'native':'web';\ninit();\n</script>"
);

if (!html.includes('src="./cloud-config.js"')) {
  html = html.replace(
    "</body>",
    '  <script src="./cloud-config.js"></script>\n  <script src="./account.js"></script>\n</body>'
  );
}

fs.writeFileSync(path.join(www, "index.html"), html);

console.log("BlueQuest native web bundle ready");
console.log("Atlas 1-80:", atlas180.length);
console.log("Atlas 80-100:", atlas80100.length);
console.log("Total:", atlas180.length + atlas80100.length);
