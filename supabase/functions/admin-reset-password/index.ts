// supabase/functions/admin-reset-password/index.ts
// Admin sahaja boleh set semula kata laluan pengguna lain (caller role
// disahkan di sisi pelayan, sama seperti admin-create-user).

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
      return json({ error: "Akses ditolak: hanya Admin aktif boleh menetapkan semula kata laluan." }, 403);
    }

    const body = await req.json();
    const targetUserId = String(body.user_id || "");
    const newPassword = String(body.new_password || "");
    if (!targetUserId) return json({ error: "user_id diperlukan." }, 400);
    if (newPassword.length < 8) return json({ error: "Kata laluan mesti sekurang-kurangnya 8 aksara." }, 400);

    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, { password: newPassword });
    if (error) return json({ error: error.message }, 400);

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
