import { css } from "../../styled-system/css";
import { card, cardTitle, buttonRecipe } from "../lib/ui";
import { STATE } from "../lib/state";
import { getLocationName, getCategoryName, getPersonnelName } from "../lib/data";
import { downloadCSV } from "../lib/utils";

const REPORTS: { key: string; label: string; desc: string }[] = [
  { key: "assets", label: "Senarai Penuh Aset", desc: "Semua medan asas aset semasa" },
  { key: "movements", label: "Sejarah Pergerakan & Pinjaman", desc: "Semua rekod pergerakan aset" },
  { key: "maintenance", label: "Sejarah Penyelenggaraan", desc: "Semua rekod selenggara/pembaikan" },
  { key: "damage", label: "Sejarah Laporan Kerosakan", desc: "Semua rekod kerosakan aset" },
  { key: "disposals", label: "Sejarah Pelupusan", desc: "Semua rekod cadangan/pelupusan aset" },
];

export function renderReports(): string {
  return `
    <div class="${css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "1fr 1fr" }, gap: "4" })}">
      ${REPORTS.map((r) => `
        <div class="${card}" style="padding:20px;">
          <h3 class="${cardTitle}" style="margin-bottom:4px;">${r.label}</h3>
          <p class="${css({ fontSize: "sm", color: "slate.500", mb: "4" })}">${r.desc}</p>
          <button data-action="exportCsv" data-report="${r.key}" class="${buttonRecipe({ variant: "outline" })}">Muat Turun CSV</button>
        </div>`).join("")}
    </div>`;
}

export function buildReportRows(key: string): Record<string, unknown>[] {
  switch (key) {
    case "assets":
      return STATE.data.assets.map((a) => ({
        "No Unik ID": a.unique_id, "No Siri Pendaftaran": a.registration_no || "",
        "Keterangan Aset": a.description, "Tarikh Penempatan": a.placement_date || "",
        "Tempat Penempatan": getLocationName(a.location_id), "Kod Penempatan": a.placement_code || "",
        "Keperluan Selenggara/Kalibrasi": a.maintenance_required ? "YA" : "TIDAK",
        "Tarikh Terakhir Semakan": a.last_check_date || "", "Kategori Aset": getCategoryName(a.category_id),
        "Tahun Terakhir Selenggara": a.last_maintenance_year ?? "", "Status": a.status,
        "PIC": getPersonnelName(a.pic_id), "Catatan": a.notes || "",
      }));
    case "movements":
      return STATE.data.movements.map((m) => ({
        "No Unik Aset": STATE.data.assets.find((a) => a.id === m.asset_id)?.unique_id || "",
        "Tujuan": m.purpose, "Peminjam": m.borrower_name || "", "Tarikh Keluar": m.out_date,
        "Tarikh Dijangka Pulang": m.expected_return_date || "", "Tarikh Pulang Sebenar": m.actual_return_date || "",
        "Status": m.status,
      }));
    case "maintenance":
      return STATE.data.maintenance.map((m) => ({
        "No Unik Aset": STATE.data.assets.find((a) => a.id === m.asset_id)?.unique_id || "",
        "Jenis": m.type, "Vendor": m.vendor || "", "Tarikh Mula": m.start_date, "Tarikh Selesai": m.end_date || "",
        "Kos (RM)": m.cost ?? "", "Status": m.status, "Catatan": m.notes || "",
      }));
    case "damage":
      return STATE.data.damage.map((d) => ({
        "No Unik Aset": STATE.data.assets.find((a) => a.id === d.asset_id)?.unique_id || "",
        "Jenis Kerosakan": d.damage_type, "Keutamaan": d.priority, "Tarikh Lapor": d.report_date,
        "Status": d.status, "Kos Pembaikan (RM)": d.repair_cost ?? "", "Tarikh Selesai": d.resolved_date || "",
        "Catatan": d.notes || "",
      }));
    case "disposals":
      return STATE.data.disposals.map((d) => ({
        "No Unik Aset": STATE.data.assets.find((a) => a.id === d.asset_id)?.unique_id || "",
        "Sebab": d.reason, "Kaedah": d.method, "Tarikh Cadangan": d.proposal_date,
        "Tarikh Kelulusan": d.approval_date || "", "Status": d.status, "Catatan": d.notes || "",
      }));
    default:
      return [];
  }
}

export function runExport(key: string) {
  const rows = buildReportRows(key);
  const report = REPORTS.find((r) => r.key === key);
  downloadCSV(report ? report.label.replace(/\s+/g, "_") : key, rows);
}
