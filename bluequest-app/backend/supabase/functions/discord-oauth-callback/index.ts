import { createClient } from "npm:@supabase/supabase-js@2";

const RESULT_PAGE="https://azxferver-commits.github.io/kaizo-fishing-atlas/bluequest-discord/";
function go(status:string){
  const url=RESULT_PAGE+"?discord="+encodeURIComponent(status);
  return new Response(null,{status:302,headers:{"location":url,"cache-control":"no-store"}});
}

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
  const redirectUri=Deno.env.get("DISCORD_REDIRECT_URI") || (supabaseUrl+"/functions/v1/discord-oauth-callback");

  if(oauthError) return go("cancelled");
  if(!clientId||!clientSecret||!guildId) return go("config_error");
  if(!code||!state) return go("invalid");

  const admin=createClient(supabaseUrl,service);
  const {data:stateRow,error:stateError}=await admin.from("discord_oauth_states").select("state,user_id,expires_at").eq("state",state).maybeSingle();
  if(stateError||!stateRow||new Date(stateRow.expires_at)<=new Date()){
    if(stateRow?.state) await admin.from("discord_oauth_states").delete().eq("state",state);
    return go("expired");
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
      return go("not_member");
    }

    const {data:other}=await admin.from("social_connections")
      .select("user_id")
      .eq("provider","discord")
      .eq("external_user_id",String(me.id))
      .eq("verified",true)
      .neq("user_id",stateRow.user_id)
      .maybeSingle();
    if(other) return go("already_linked");

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

    return go("verified");
  }catch(error){
    return go("error");
  }
});