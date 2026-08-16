import { supabase } from "./supabase";
import { STATE, isAdmin } from "./state";

export async function fetchAllData() {
  const [assets, locations, categories, personnel, inspections, movements, maintenance, damage, disposals] =
    await Promise.all([
      supabase.from("assets").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("locations").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("personnel").select("*").order("name"),
      supabase.from("inspections").select("*").order("inspection_date", { ascending: false }),
      supabase.from("movements").select("*").order("out_date", { ascending: false }),
      supabase.from("maintenance").select("*").order("start_date", { ascending: false }),
      supabase.from("damage").select("*").order("report_date", { ascending: false }),
      supabase.from("disposals").select("*").order("proposal_date", { ascending: false }),
    ]);

  STATE.data.assets = assets.data || [];
  STATE.data.locations = locations.data || [];
  STATE.data.categories = categories.data || [];
  STATE.data.personnel = personnel.data || [];
  STATE.data.inspections = inspections.data || [];
  STATE.data.movements = movements.data || [];
  STATE.data.maintenance = maintenance.data || [];
  STATE.data.damage = damage.data || [];
  STATE.data.disposals = disposals.data || [];

  if (isAdmin()) {
    const [users, auditLogs] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    STATE.data.users = users.data || [];
    STATE.data.auditLogs = auditLogs.data || [];
  }
}

// ---- Helpers untuk mencari rekod berkaitan bagi Profil Aset ----
export function getAssetTimeline(assetId: string) {
  type TimelineItem = { date: string; kind: string; label: string; detail: string };
  const items: TimelineItem[] = [];

  STATE.data.inspections.filter((r) => r.asset_id === assetId).forEach((r) =>
    items.push({ date: r.inspection_date, kind: "Pemeriksaan", label: `Keadaan: ${r.condition}`, detail: r.notes || "" })
  );
  STATE.data.movements.filter((r) => r.asset_id === assetId).forEach((r) =>
    items.push({ date: r.out_date, kind: "Pergerakan", label: r.purpose, detail: r.status })
  );
  STATE.data.maintenance.filter((r) => r.asset_id === assetId).forEach((r) =>
    items.push({ date: r.start_date, kind: "Selenggara", label: r.type, detail: r.status })
  );
  STATE.data.damage.filter((r) => r.asset_id === assetId).forEach((r) =>
    items.push({ date: r.report_date, kind: "Kerosakan", label: r.damage_type, detail: r.status })
  );
  STATE.data.disposals.filter((r) => r.asset_id === assetId).forEach((r) =>
    items.push({ date: r.proposal_date, kind: "Pelupusan", label: r.reason, detail: r.status })
  );

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLocationName(id: string | null): string {
  if (!id) return "-";
  return STATE.data.locations.find((l) => l.id === id)?.name || "-";
}
export function getCategoryName(id: string | null): string {
  if (!id) return "-";
  return STATE.data.categories.find((c) => c.id === id)?.name || "-";
}
export function getPersonnelName(id: string | null): string {
  if (!id) return "-";
  return STATE.data.personnel.find((p) => p.id === id)?.name || "-";
}
