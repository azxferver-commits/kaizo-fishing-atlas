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
    const guildId = Deno.env.get("DISCORD_GUILD_ID")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Invalid BlueQuest session");

    const { provider_access_token } = await req.json();
    if (!provider_access_token) throw new Error("Missing Discord OAuth token");

    const meRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: "Bearer " + provider_access_token },
    });
    if (!meRes.ok) throw new Error("Discord identity verification failed");
    const discordUser = await meRes.json();

    const memberRes = await fetch(
      "https://discord.com/api/v10/users/@me/guilds/" + guildId + "/member",
      { headers: { Authorization: "Bearer " + provider_access_token } },
    );
    const verified = memberRes.ok;
    if (!verified) {
      return Response.json({ verified: false, provider: "discord" }, { headers: cors, status: 403 });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from("social_connections").upsert({
      user_id: user.id,
      provider: "discord",
      external_user_id: discordUser.id,
      external_username: discordUser.global_name || discordUser.username,
      verified: true,
      verified_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

    const { data: rewards } = await admin
      .from("social_rewards")
      .select("module_key")
      .eq("provider", "discord")
      .eq("enabled", true);

    if (rewards?.length) {
      await admin.from("user_entitlements").upsert(
        rewards.map((r) => ({
          user_id: user.id,
          module_key: r.module_key,
          source: "discord",
          granted_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,module_key" },
      );
    }

    return Response.json({
      verified: true,
      provider: "discord",
      entitlements: (rewards || []).map((r) => r.module_key),
    }, { headers: cors });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { headers: cors, status: 400 });
  }
});
