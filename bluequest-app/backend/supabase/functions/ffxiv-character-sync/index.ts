import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { parseHTML } from "npm:linkedom@0.18.12";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });

const clean = (v?: string | null) =>
  (v || "").replace(/\s+/g, " ").replace(/&nbsp;/g, " ").trim();

const absolute = (src?: string | null) => {
  if (!src) return null;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) return "https://na.finalfantasyxiv.com" + src;
  return src;
};

function lodestoneId(value: unknown): string | null {
  const s = String(value || "").trim();
  if (/^\d{1,12}$/.test(s)) return s;
  const m = s.match(/\/lodestone\/character\/(\d{1,12})(?:\/|$)/i);
  return m ? m[1] : null;
}

function parseJobs(html: string) {
  const { document } = parseHTML(html);
  const jobs: Array<{ name: string; level: number | null; exp: string | null }> = [];
  const seen = new Set<string>();

  for (const row of Array.from(document.querySelectorAll("ul.character__job li"))) {
    const children = Array.from(row.children);
    const levelRaw = clean(children[1]?.textContent);
    const nameRaw = clean(children[2]?.textContent);
    const expRaw = clean(children[3]?.textContent);

    const level = /^\d+$/.test(levelRaw) ? Number(levelRaw) : null;
    const name = nameRaw.replace(/^[-–—]+$/, "").trim();

    if (!name || seen.has(name.toLowerCase())) continue;
    if (!(levelRaw === "-" || /^\d+$/.test(levelRaw))) continue;

    seen.add(name.toLowerCase());
    jobs.push({
      name,
      level,
      exp: expRaw && expRaw !== "- / -" && expRaw !== "-- / --" ? expRaw : null,
    });
  }

  return jobs;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Inicia sesión en BlueQuest." }, 401);

  const url = Deno.env.get("SUPABASE_URL") || "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Sesión BlueQuest no válida." }, 401);

  let payload: Record<string, unknown> = {};
  try { payload = await req.json(); } catch { return json({ error: "Solicitud inválida." }, 400); }

  const id = lodestoneId(payload.lodestone);
  if (!id) {
    return json({
      error: "Pega el enlace de tu personaje en Lodestone o su ID numérico.",
      example: "https://na.finalfantasyxiv.com/lodestone/character/12345678/",
    }, 400);
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: existing } = await admin
    .from("ffxiv_characters")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (
    existing &&
    String(existing.lodestone_id) === id &&
    Date.now() - new Date(existing.synced_at).getTime() < 5 * 60 * 1000
  ) {
    return json({ character: existing, cached: true, message: "Sincronización reciente." });
  }

  const base = `https://na.finalfantasyxiv.com/lodestone/character/${id}/`;
  const headers = {
    "User-Agent": "BlueQuest/1.4 (+https://azxferver-commits.github.io/kaizo-fishing-atlas/)",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const [profileRes, jobsRes] = await Promise.all([
    fetch(base, { headers, redirect: "follow" }),
    fetch(base + "class_job/", { headers, redirect: "follow" }),
  ]);

  if (profileRes.status === 404 || jobsRes.status === 404) {
    return json({ error: "No encontré ese personaje en Lodestone." }, 404);
  }
  if (!profileRes.ok || !jobsRes.ok) {
    return json({ error: "Lodestone no respondió correctamente. Inténtalo más tarde." }, 502);
  }

  const [profileHtml, jobsHtml] = await Promise.all([profileRes.text(), jobsRes.text()]);
  const { document } = parseHTML(profileHtml);

  const name = clean(document.querySelector(".frame__chara__name")?.textContent);
  const worldLine = clean(document.querySelector(".frame__chara__world")?.textContent);
  const worldMatch = worldLine.match(/^(.+?)\s*\[([^\]]+)\]/);
  const world = worldMatch?.[1]?.trim() || worldLine || null;
  const dataCenter = worldMatch?.[2]?.trim() || null;
  const title = clean(document.querySelector(".frame__chara__title")?.textContent) || null;
  const avatarUrl = absolute(document.querySelector(".frame__chara__face img")?.getAttribute("src"));
  const portraitUrl = absolute(document.querySelector(".js__image_popup img")?.getAttribute("src"));
  const activeIcon = document.querySelector(".character__class_icon img");
  const activeJob = clean(activeIcon?.getAttribute("alt")) || null;
  const activeLevelText = clean(document.querySelector(".character__class__data p")?.textContent);
  const activeLevelMatch = activeLevelText.match(/(\d+)/);
  const activeJobLevel = activeLevelMatch ? Number(activeLevelMatch[1]) : null;
  const jobs = parseJobs(jobsHtml);

  if (!name) return json({ error: "No pude leer el perfil público de Lodestone." }, 422);
  if (!jobs.length) return json({ error: "El perfil existe, pero no pude leer los niveles de Class/Job." }, 422);

  const row = {
    user_id: userData.user.id,
    lodestone_id: Number(id),
    name,
    world,
    data_center: dataCenter,
    title,
    avatar_url: avatarUrl,
    portrait_url: portraitUrl,
    active_job: activeJob,
    active_job_level: activeJobLevel,
    jobs,
    source_url: base,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("ffxiv_characters")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) return json({ error: "No pude guardar el personaje en BlueQuest." }, 500);

  return json({
    character: data,
    cached: false,
    notice: "Datos públicos obtenidos desde The Lodestone.",
  });
});