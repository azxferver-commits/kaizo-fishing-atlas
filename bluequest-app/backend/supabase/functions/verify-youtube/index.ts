import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) throw new Error("Missing BlueQuest session");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const targetChannel = Deno.env.get("YOUTUBE_TARGET_CHANNEL_ID")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Invalid BlueQuest session");

    const { provider_access_token } = await req.json();
    if (!provider_access_token) throw new Error("Missing Google/YouTube OAuth token");

    const endpoint = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
    endpoint.searchParams.set("part", "id");
    endpoint.searchParams.set("mine", "true");
    endpoint.searchParams.set("forChannelId", targetChannel);
    endpoint.searchParams.set("maxResults", "1");

    const ytRes = await fetch(endpoint, {
      headers: { Authorization: "Bearer " + provider_access_token },
    });
    if (!ytRes.ok) throw new Error("YouTube subscription check failed");
    const yt = await ytRes.json();
    const verified = Array.isArray(yt.items) && yt.items.length > 0;
    if (!verified) {
      return Response.json({ verified: false, provider: "youtube" }, { headers: cors, status: 403 });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from("social_connections").upsert({
      user_id: user.id,
      provider: "youtube",
      verified: true,
      verified_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

    const { data: rewards } = await admin
      .from("social_rewards")
      .select("module_key")
      .eq("provider", "youtube")
      .eq("enabled", true);

    if (rewards?.length) {
      await admin.from("user_entitlements").upsert(
        rewards.map((r) => ({
          user_id: user.id,
          module_key: r.module_key,
          source: "youtube",
          granted_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,module_key" },
      );
    }

    return Response.json({
      verified: true,
      provider: "youtube",
      entitlements: (rewards || []).map((r) => r.module_key),
    }, { headers: cors });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { headers: cors, status: 400 });
  }
});
