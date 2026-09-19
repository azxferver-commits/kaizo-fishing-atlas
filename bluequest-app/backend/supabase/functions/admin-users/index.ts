import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Missing session" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Cliente usando la sesión de quien está llamando.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Invalid session" }, 401);
    }

    // Comprobar que la cuenta posee el entitlement administrativo.
    const { data: adminEntitlement, error: entitlementError } =
      await userClient
        .from("user_entitlements")
        .select("module_key, granted_until")
        .eq("user_id", user.id)
        .eq("module_key", "admin_dashboard")
        .maybeSingle();

    if (entitlementError) {
      throw entitlementError;
    }

    if (!adminEntitlement) {
      return json({ error: "Forbidden" }, 403);
    }

    if (
      adminEntitlement.granted_until &&
      new Date(adminEntitlement.granted_until).getTime() < Date.now()
    ) {
      return json({ error: "Admin access expired" }, 403);
    }

    // Solo después de comprobar admin utilizamos service_role.
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    /*
      GET
      Devuelve las cuentas para el panel administrativo.
    */
    if (req.method === "GET") {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    throw error;
  }

  const { data: adminEntitlements, error: adminEntitlementsError } =
    await admin
      .from("user_entitlements")
      .select("user_id")
      .eq("module_key", "admin_dashboard");

  if (adminEntitlementsError) {
    throw adminEntitlementsError;
  }

  const adminUserIds = new Set(
    (adminEntitlements ?? []).map((item) => item.user_id)
  );

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    email_confirmed_at: u.email_confirmed_at ?? null,
    banned_until: u.banned_until ?? null,
    is_admin: adminUserIds.has(u.id),
  }));

  return json({
    users,
    total: users.length,
  });
}

    /*
      POST
      Acciones administrativas sobre una cuenta.
    */
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));

      const action = body?.action;
      const userId = body?.user_id;

      if (!action || !userId) {
        return json(
          { error: "action and user_id are required" },
          400,
        );
      }

      // Evita que accidentalmente te borres o bloquees a ti mismo.
      if (userId === user.id) {
        return json(
          { error: "You cannot perform this action on your own admin account" },
          400,
        );
      }

      if (action === "delete") {
        const { error } = await admin.auth.admin.deleteUser(userId);

        if (error) throw error;

        return json({
          ok: true,
          action: "delete",
          user_id: userId,
        });
      }

      if (action === "ban") {
        const { data, error } =
          await admin.auth.admin.updateUserById(userId, {
            ban_duration: "876000h",
          });

        if (error) throw error;

        return json({
          ok: true,
          action: "ban",
          user_id: userId,
          user: data.user,
        });
      }

      if (action === "unban") {
        const { data, error } =
          await admin.auth.admin.updateUserById(userId, {
            ban_duration: "none",
          });

        if (error) throw error;

        return json({
          ok: true,
          action: "unban",
          user_id: userId,
          user: data.user,
        });
      }

      return json({ error: "Unknown action" }, 400);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("admin-users:", error);

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      500,
    );
  }
});
