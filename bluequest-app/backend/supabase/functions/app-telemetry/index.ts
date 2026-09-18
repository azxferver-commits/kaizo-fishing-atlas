import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const clean=(v:unknown,max=80)=>String(v??"").trim().slice(0,max);
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return Response.json({error:"Method not allowed"},{status:405,headers:cors});
 try{
  const body=await req.json().catch(()=>({}));
  const installationId=clean(body.installation_id,80),action=clean(body.action,24),platform=clean(body.platform||"android",24),appVersion=clean(body.app_version,24),moduleKey=clean(body.module_key,48);
  if(!/^[A-Za-z0-9._:-]{12,80}$/.test(installationId))throw new Error("Invalid installation id");
  if(!["open","heartbeat","module_open"].includes(action))throw new Error("Invalid action");
  if(action==="module_open"&&!/^[a-z0-9_:-]{2,48}$/.test(moduleKey))throw new Error("Invalid module");
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin=createClient(url,service); let userId:string|null=null;
  const auth=req.headers.get("Authorization")||"";
  if(auth.startsWith("Bearer ")){const client=createClient(url,anon);const {data}=await client.auth.getUser(auth.slice(7));userId=data.user?.id||null}
  const {error:p}=await admin.rpc("record_app_presence",{p_installation_id:installationId,p_user_id:userId,p_platform:platform,p_app_version:appVersion,p_is_open:action==="open"});if(p)throw p;
  if(action==="module_open"){const {error:m}=await admin.rpc("record_module_usage",{p_installation_id:installationId,p_user_id:userId,p_module_key:moduleKey});if(m)throw m}
  return Response.json({ok:true},{headers:cors});
 }catch(error){return Response.json({error:String(error?.message||error)},{status:400,headers:cors})}
});