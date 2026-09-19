import { createClient } from "npm:@supabase/supabase-js@2";

function esc(v:string){
  return String(v||"").replace(/[&<>"']/g,(m)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]||m));
}
function page(opts:{title:string,message:string,status:string,invite?:string,success?:boolean}){
  const deep="bluequest://welcome?discord="+encodeURIComponent(opts.status);
  const invite=opts.invite?'<a class="secondary" href="'+esc(opts.invite)+'" target="_blank" rel="noopener">Unirme a Nexus</a>':"";
  const accent=opts.success?"#6ee7ad":"#72e8ff";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07111f"><title>BlueQuest · Discord</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 50% 0,#17344a,transparent 30rem),#050b12;color:#edf8ff;font-family:system-ui,-apple-system,Segoe UI,sans-serif}.card{width:min(460px,100%);padding:24px;border:1px solid #31556d;border-radius:22px;background:linear-gradient(155deg,#0b1a27,#08111c);box-shadow:0 24px 80px #0008}.mark{width:58px;height:58px;display:grid;place-items:center;margin:0 auto 14px;border:1px solid #46738e;border-radius:18px;background:#0e2939;color:${accent};font-size:26px;box-shadow:0 0 34px #72e8ff2c}h1{font-size:22px;margin:0 0 10px;text-align:center}p{margin:0 auto 18px;max-width:360px;color:#9fb2c1;font-size:13px;line-height:1.55;text-align:center}.actions{display:grid;gap:9px}.actions a{display:block;text-align:center;text-decoration:none;border-radius:13px;padding:12px 14px;font-weight:900}.primary{background:#123f55;border:1px solid #4d86a3;color:#e9fbff}.secondary{background:#0a1722;border:1px solid #304c60;color:#b9d2e2}.hint{margin-top:14px;color:#667f90;font-size:10px;text-align:center}</style></head><body><div class="card"><div class="mark">${opts.success?"✓":"◆"}</div><h1>${esc(opts.title)}</h1><p>${esc(opts.message)}</p><div class="actions"><a class="primary" href="${deep}">Volver a BlueQuest</a>${invite}</div><div class="hint">Puedes cerrar esta página después de volver a la app.</div></div><script>setTimeout(()=>{location.href=${JSON.stringify(deep)}},1000)</script></body></html>`;
}
function html(body:string,status=200){return new Response(body,{status,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}})}

Deno.serve(async(req)=>{
  const u=new URL(req.url);
  const code=u.searchParams.get("code")||"";
  const state=u.searchParams.get("state")||"";
  const oauthError=u.searchParams.get("error")||"";

  const supabaseUrl=Deno.env.get("SUPABASE_URL")!;
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId=Deno.env.get("DISCORD_CLIENT_ID")||"";
  const clientSecret=Deno.env.get("DISCORD_CLIENT_SECRET")||"";
  const guildId=Deno.env.get("DISCORD_GUILD_ID")||"";
  const inviteUrl=Deno.env.get("DISCORD_INVITE_URL") || "https://discord.gg/PHQHM9Xvjm";
  const redirectUri=Deno.env.get("DISCORD_REDIRECT_URI") || (supabaseUrl+"/functions/v1/discord-oauth-callback");

  if(oauthError) return html(page({title:"Verificación cancelada",message:"Discord no autorizó la verificación. Puedes intentarlo de nuevo desde BlueQuest.",status:"cancelled"}));
  if(!clientId||!clientSecret||!guildId) return html(page({title:"Discord no configurado",message:"Falta terminar la configuración privada de Discord en BlueQuest.",status:"config_error"}),503);
  if(!code||!state) return html(page({title:"Enlace no válido",message:"La verificación no contiene los datos necesarios. Vuelve a BlueQuest e inténtalo otra vez.",status:"invalid"}),400);

  const admin=createClient(supabaseUrl,service);
  const {data:stateRow,error:stateError}=await admin.from("discord_oauth_states").select("state,user_id,expires_at").eq("state",state).maybeSingle();
  if(stateError||!stateRow||new Date(stateRow.expires_at)<=new Date()){
    if(stateRow?.state) await admin.from("discord_oauth_states").delete().eq("state",state);
    return html(page({title:"Verificación expirada",message:"Este enlace ya expiró. Vuelve a BlueQuest y pulsa Verificar Discord otra vez.",status:"expired"}),400);
  }
  await admin.from("discord_oauth_states").delete().eq("state",state);

  try{
    const form=new URLSearchParams({
      client_id:clientId,
      client_secret:clientSecret,
      grant_type:"authorization_code",
      code,
      redirect_uri:redirectUri,
    });
    const tokenRes=await fetch("https://discord.com/api/oauth2/token",{
      method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded"},
      body:form,
    });
    const token=await tokenRes.json().catch(()=>({}));
    if(!tokenRes.ok||!token.access_token) throw new Error("Discord no pudo completar la autorización.");

    const headers={Authorization:"Bearer "+token.access_token};
    const [meRes,guildsRes]=await Promise.all([
      fetch("https://discord.com/api/v10/users/@me",{headers}),
      fetch("https://discord.com/api/v10/users/@me/guilds?limit=200",{headers}),
    ]);
    if(!meRes.ok||!guildsRes.ok) throw new Error("Discord no permitió comprobar tu servidor.");

    const me=await meRes.json();
    const guilds=await guildsRes.json();
    const isMember=Array.isArray(guilds)&&guilds.some((g:any)=>String(g.id)===String(guildId));

    if(!isMember){
      await admin.from("social_connections").upsert({
        user_id:stateRow.user_id,
        provider:"discord",
        external_user_id:String(me.id||""),
        external_username:me.global_name||me.username||null,
        verified:false,
        verified_at:null,
        last_checked_at:new Date().toISOString(),
        metadata:{guild_id:guildId,last_result:"not_member"},
      },{onConflict:"user_id,provider"});
      return html(page({
        title:"Aún no estás en Nexus",
        message:"Tu cuenta de Discord se verificó, pero todavía no aparece como miembro del servidor Nexus. Únete al servidor y después vuelve a BlueQuest para verificar otra vez.",
        status:"not_member",
        invite:inviteUrl,
      }));
    }

    const {data:other}=await admin.from("social_connections")
      .select("user_id")
      .eq("provider","discord")
      .eq("external_user_id",String(me.id))
      .eq("verified",true)
      .neq("user_id",stateRow.user_id)
      .maybeSingle();
    if(other) return html(page({title:"Discord ya vinculado",message:"Esta cuenta de Discord ya está vinculada a otra cuenta BlueQuest.",status:"already_linked"}),409);

    const now=new Date().toISOString();
    const {error:connError}=await admin.from("social_connections").upsert({
      user_id:stateRow.user_id,
      provider:"discord",
      external_user_id:String(me.id),
      external_username:me.global_name||me.username||null,
      verified:true,
      verified_at:now,
      last_checked_at:now,
      metadata:{guild_id:guildId,last_result:"member"},
    },{onConflict:"user_id,provider"});
    if(connError) throw connError;

    const {error:grantError}=await admin.from("user_entitlements").upsert({
      user_id:stateRow.user_id,
      module_key:"community",
      source:"discord",
      granted_at:now,
      granted_until:null,
      metadata:{discord_user_id:String(me.id),guild_id:guildId},
    },{onConflict:"user_id,module_key"});
    if(grantError) throw grantError;

    return html(page({
      title:"Community desbloqueado ✓",
      message:"BlueQuest confirmó que estás dentro de Nexus. Ya tienes acceso Community.",
      status:"verified",
      success:true,
    }));
  }catch(error){
    return html(page({title:"No pude verificar Discord",message:String(error?.message||error),status:"error"}),400);
  }
});