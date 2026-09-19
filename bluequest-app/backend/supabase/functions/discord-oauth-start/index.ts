import { createClient } from "npm:@supabase/supabase-js@2";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
};

function randomState(){
  const bytes=new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return Response.json({error:"Method not allowed"},{status:405,headers:cors});

  try{
    const auth=req.headers.get("Authorization")||"";
    if(!auth.startsWith("Bearer ")) throw new Error("Inicia sesión en BlueQuest primero.");

    const url=Deno.env.get("SUPABASE_URL")!;
    const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId=Deno.env.get("DISCORD_CLIENT_ID")||"";
    if(!clientId) return Response.json({error:"Discord todavía no está configurado por el administrador."},{status:503,headers:cors});

    const redirectUri=Deno.env.get("DISCORD_REDIRECT_URI") || (url+"/functions/v1/discord-oauth-callback");
    const inviteUrl=Deno.env.get("DISCORD_INVITE_URL") || "https://discord.gg/PHQHM9Xvjm";

    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user) throw new Error("Sesión BlueQuest no válida.");

    const admin=createClient(url,service);
    await admin.from("discord_oauth_states").delete().lt("expires_at",new Date().toISOString());

    const state=randomState();
    const {error:stateError}=await admin.from("discord_oauth_states").insert({
      state,
      user_id:user.id,
      expires_at:new Date(Date.now()+10*60*1000).toISOString(),
    });
    if(stateError) throw stateError;

    const authorize=new URL("https://discord.com/oauth2/authorize");
    authorize.searchParams.set("response_type","code");
    authorize.searchParams.set("client_id",clientId);
    authorize.searchParams.set("redirect_uri",redirectUri);
    authorize.searchParams.set("scope","identify guilds");
    authorize.searchParams.set("state",state);
    authorize.searchParams.set("prompt","consent");

    return Response.json({
      authorize_url:authorize.toString(),
      invite_url:inviteUrl,
      expires_in:600,
    },{headers:cors});
  }catch(error){
    return Response.json({error:String(error?.message||error)},{status:400,headers:cors});
  }
});