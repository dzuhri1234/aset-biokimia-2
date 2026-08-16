// supabase/functions/admin-set-active/index.ts
// Admin sahaja boleh aktif/nyahaktifkan akaun pengguna lain (bukan padam
// terus - supaya rekod created_by dalam sejarah transaksi tidak putus).

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Tidak disahkan." }, 401);

    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: callerProfile } = await adminClient.from("profiles").select("role, is_active").eq("id", userData.user.id).single();
    if (!callerProfile || callerProfile.role !== "ADMIN" || !callerProfile.is_active) {
      return json({ error: "Akses ditolak: hanya Admin aktif boleh mengubah status pengguna." }, 403);
    }

    const body = await req.json();
    const targetUserId = String(body.user_id || "");
    const isActive = Boolean(body.is_active);
    if (!targetUserId) return json({ error: "user_id diperlukan." }, 400);
    if (targetUserId === userData.user.id && !isActive) {
      return json({ error: "Anda tidak boleh menyahaktifkan akaun sendiri." }, 400);
    }

    const { error } = await adminClient.from("profiles").update({ is_active: isActive }).eq("id", targetUserId);
    if (error) return json({ error: error.message }, 400);

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
