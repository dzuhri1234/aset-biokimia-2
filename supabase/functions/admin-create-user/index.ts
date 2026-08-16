// supabase/functions/admin-create-user/index.ts
//
// Mencipta pengguna baharu (auth + profile + kebenaran modul).
// Kunci service_role HANYA wujud di sini (persekitaran Edge Function),
// TIDAK PERNAH didedahkan kepada klien. Fungsi ini menyemak semula
// di sisi pelayan bahawa pemanggil sememangnya ADMIN aktif sebelum
// membenarkan sebarang tindakan - ini menutup jurang keselamatan
// "privilege escalation" yang dikenal pasti dalam audit sistem lama
// (di mana admin_create_user tidak dapat disahkan menyemak peranan
// pemanggil).
//
// Deploy: supabase functions deploy admin-create-user
// Perlukan secrets (auto-tersedia dalam Edge Functions Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODULES = ["assets", "inspections", "movements", "maintenance", "damage", "disposals", "master_data"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 1. Sahkan siapa yang memanggil (daripada JWT dalam header, bukan daripada payload)
    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Tidak disahkan." }, 401);
    }

    // 2. Sahkan pemanggil ialah ADMIN AKTIF - guna service role untuk baca profiles
    //    tanpa bergantung kepada RLS (kita SENDIRI yang mengesahkan di sini).
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: callerProfile, error: profErr } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", userData.user.id)
      .single();

    if (profErr || !callerProfile || callerProfile.role !== "ADMIN" || !callerProfile.is_active) {
      return json({ error: "Akses ditolak: hanya Admin aktif boleh mencipta pengguna." }, 403);
    }

    // 3. Sahkan input
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const role = body.role === "ADMIN" ? "ADMIN" : "STAFF";
    const permissions: Record<string, string> = body.permissions || {};

    if (!email || !email.includes("@")) return json({ error: "E-mel tidak sah." }, 400);
    if (password.length < 8) return json({ error: "Kata laluan mesti sekurang-kurangnya 8 aksara." }, 400);
    if (!name) return json({ error: "Nama diperlukan." }, 400);

    // 4. Cipta pengguna auth sebenar (memerlukan service role - inilah sebab
    //    fungsi ini wujud, kerana klien tidak boleh melakukan ini sendiri)
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message || "Gagal mencipta akaun." }, 400);
    }

    // 5. Cipta rekod profile
    const { error: insertProfileErr } = await adminClient.from("profiles").insert({
      id: created.user.id,
      email,
      name,
      role,
      is_active: true,
    });
    if (insertProfileErr) {
      // rollback: padam akaun auth yang baru dicipta supaya tiada akaun "yatim"
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: "Gagal simpan profil: " + insertProfileErr.message }, 400);
    }

    // 6. Simpan kebenaran modul (hanya relevan untuk STAFF; ADMIN sedia ada akses penuh)
    if (role === "STAFF") {
      const rows = MODULES.map((m) => ({
        user_id: created.user!.id,
        module: m,
        access_level: ["edit", "read", "none"].includes(permissions[m]) ? permissions[m] : "read",
      }));
      const { error: permErr } = await adminClient.from("module_permissions").insert(rows);
      if (permErr) return json({ error: "Pengguna dicipta tetapi gagal simpan kebenaran: " + permErr.message }, 207);
    }

    return json({ success: true, user_id: created.user.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
