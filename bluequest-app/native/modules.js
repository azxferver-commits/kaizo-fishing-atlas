(()=>{
const q=s=>document.querySelector(s);
const modules={
  fishing_tools:{title:'Fishing Tools',src:'./modules/fishing/index.html',accent:'🎣'},
  gold_saucer:{title:'Gold Saucer',src:'./modules/gold-saucer/index.html',accent:'✦'},
  nexus:{title:'Nexus · Eorzea Codex',src:'./modules/nexus/index.html',accent:'◆'}
};
function allowed(key){return !!window.BlueQuestCloud?.hasModule?.(key)}
function fisherLevel(){
  const c=window.BlueQuestFFXIV?.getCharacter?.();
  const f=(c?.jobs||[]).find(j=>j.name==='Fisher'&&j.level!=null);
  return f?.level||null;
}
function moduleSrc(key){
  const m=modules[key]; if(!m)return null;
  if(key==='fishing_tools'){
    const lv=fisherLevel();
    return m.src+(lv?('?level='+encodeURIComponent(lv)):'');
  }
  return m.src;
}
function open(key){
  const m=modules[key]; if(!m)return;
  if(!allowed(key)){
    const logged=!!window.BlueQuestCloud?.getSession?.()?.user;
    if(!logged)window.BlueQuestCloud?.openAuth?.('signup');
    else window.toast?.('Este módulo requiere acceso Community');
    return;
  }
  const d=q('#bluequestModuleDialog'), frame=q('#bluequestModuleFrame');
  q('#bluequestModuleIcon').textContent=m.accent;
  q('#bluequestModuleTitle').textContent=m.title;
  frame.src=moduleSrc(key);
  d.dataset.module=key;
  if(!d.open)d.showModal();
}
function close(){
  const d=q('#bluequestModuleDialog'),frame=q('#bluequestModuleFrame');
  if(frame)frame.src='about:blank';
  if(d?.open)d.close();
}
function bind(){
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-module-open]');
    if(b){e.preventDefault();open(b.dataset.moduleOpen)}
  });
  q('#bluequestModuleClose')?.addEventListener('click',close);
  q('#bluequestModuleDialog')?.addEventListener('click',e=>{if(e.target===q('#bluequestModuleDialog'))close()});
}
window.BlueQuestModules={open,close};
document.addEventListener('DOMContentLoaded',bind);
})();