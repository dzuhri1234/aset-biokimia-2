import { createClient } from "@supabase/supabase-js";

// Nilai ini disuntik semasa build (lihat .env.example) - anon key
// Supabase MEMANG direka untuk didedahkan kepada klien; keselamatan
// sebenar datang daripada dasar RLS (lihat sql/02_rls_policies.sql),
// bukan daripada menyembunyikan kunci ini.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Konfigurasi Supabase tiada. Salin .env.example ke .env dan isikan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export async function callEdgeFunction(name: string, payload: unknown) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Ralat tidak diketahui.");
  return json;
}
