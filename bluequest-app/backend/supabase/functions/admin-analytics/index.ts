import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization")||"";if(!auth.startsWith("Bearer "))throw new Error("Missing session");
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)throw new Error("Invalid session");
  const admin=createClient(url,service);
  const {data:e}=await admin.from("user_entitlements").select("module_key,granted_until").eq("user_id",user.id).eq("module_key","admin_dashboard").maybeSingle();
  if(!e||(e.granted_until&&new Date(e.granted_until)<=new Date()))return Response.json({error:"Forbidden"},{status:403,headers:cors});
  const {data,error}=await admin.rpc("get_bluequest_admin_analytics");if(error)throw error;
  return Response.json(data||{},{headers:cors});
 }catch(error){return Response.json({error:String(error?.message||error)},{status:401,headers:cors})}
});