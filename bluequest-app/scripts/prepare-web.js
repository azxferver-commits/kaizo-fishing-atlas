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
for (const file of ["cloud-config.js","account.css","account.js"]) {
  fs.copyFileSync(path.join(appRoot, "native", file), path.join(www, file));
}

const atlas180 = JSON.parse(fs.readFileSync(source180, "utf8"));
const atlas80100 = JSON.parse(fs.readFileSync(source80100, "utf8"));

if (atlas180.length !== 274) throw new Error("Atlas 1-80 incompleto: " + atlas180.length);
if (atlas80100.length !== 159) throw new Error("Atlas 80-100 incompleto: " + atlas80100.length);

fs.writeFileSync(path.join(dataDir, "atlas-1-80.json"), JSON.stringify(atlas180, null, 2));
fs.writeFileSync(path.join(dataDir, "atlas-80-100.json"), JSON.stringify(atlas80100, null, 2));

let html = fs.readFileSync(sourceHtml, "utf8");

html = html
  .replace(/<title>[^<]*<\/title>/, "<title>BlueQuest Atlas</title>")
  .replace(/V4\.\d+(?:\.\d+)?[^<]*/g, "APP 1.1 · ACCOUNT READY")
  .replace(/<link rel="manifest"[^>]*>/g, "")
  .replace(/<link rel="icon"[^>]*>/g, "")
  .replace(/<link rel="apple-touch-icon"[^>]*>/g, "")
  .replace("</head>", '<link rel="stylesheet" href="./account.css" /></head>')
  .replace(
    /const DATA_FILES=\[[^\]]*\];/,
    "const DATA_FILES=['./data/atlas-1-80.json','./data/atlas-80-100.json'];"
  );

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

html = html.replace(
  /if\('serviceWorker'in navigator\)[^;]*;/g,
  ""
);

html = html.replace(
  "init();\n</script>",
  "document.documentElement.dataset.runtime=(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())?'native':'web';\ninit();\n</script>"
);

html = html.replace(
  "</head>",
  '<link rel="stylesheet" href="./account.css">\n</head>'
);
html = html.replace(
  "  <script src="./cloud-config.js"></script>
  <script src="./account.js"></script>
</body>",
  '<script src="./account-config.js"></script>\n<script src="./account.js"></script>\n</body>'
);

fs.copyFileSync(path.join(nativeDir, "account.css"), path.join(www, "account.css"));
fs.copyFileSync(path.join(nativeDir, "account.js"), path.join(www, "account.js"));

const accountConfig = {
  supabaseUrl: process.env.BLUEQUEST_SUPABASE_URL || "",
  supabaseAnonKey: process.env.BLUEQUEST_SUPABASE_ANON_KEY || "",
  functionsBase: process.env.BLUEQUEST_FUNCTIONS_BASE || "",
  discordOAuthStart: process.env.BLUEQUEST_DISCORD_OAUTH_START || "",
  youtubeOAuthStart: process.env.BLUEQUEST_YOUTUBE_OAUTH_START || ""
};
fs.writeFileSync(
  path.join(www, "account-config.js"),
  "window.BLUEQUEST_ACCOUNT_CONFIG=" + JSON.stringify(accountConfig) + ";\n"
);

fs.writeFileSync(path.join(www, "index.html"), html);

console.log("BlueQuest native web bundle ready");
console.log("Atlas 1-80:", atlas180.length);
console.log("Atlas 80-100:", atlas80100.length);
console.log("Total:", atlas180.length + atlas80100.length);
