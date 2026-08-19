import { css } from "../../styled-system/css";
import { card, cardTitle, buttonRecipe } from "../lib/ui";
import { STATE } from "../lib/state";
import { getLocationName, getCategoryName, getPersonnelName } from "../lib/data";
import { downloadCSV, escapeHTML } from "../lib/utils";

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
          <div class="${css({ display: "flex", gap: "2" })}">
            <button data-action="exportCsv" data-report="${r.key}" class="${buttonRecipe({ variant: "outline" })}">Muat Turun CSV</button>
            <button data-action="exportPdf" data-report="${r.key}" class="${buttonRecipe({ variant: "outline" })}">Cetak / PDF</button>
          </div>
        </div>`).join("")}
    </div>
    <p class="${css({ fontSize: "xs", color: "slate.400", mt: "4" })}">Nota: "Cetak / PDF" membuka pratonton cetak pelayar - pilih destinasi "Save as PDF" pada dialog cetak untuk simpan sebagai fail PDF.</p>`;
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

export function runExportPdf(key: string) {
  const rows = buildReportRows(key);
  const report = REPORTS.find((r) => r.key === key);
  if (!rows.length) {
    alert("Tiada data untuk dijana.");
    return;
  }
  const win = window.open("", "_blank");
  if (!win) {
    alert("Sila benarkan pop-up pada pelayar untuk menjana PDF.");
    return;
  }
  const keys = Object.keys(rows[0]);
  const dateStr = new Date().toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" });
  win.document.write(`
    <!doctype html><html lang="ms"><head><meta charset="utf-8" /><title>${report?.label || key}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #0f172a; padding: 24px; }
      .letterhead { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #1e293b; padding-bottom: 10px; margin-bottom: 16px; }
      .letterhead img { width: 44px; height: 44px; object-fit: contain; }
      .letterhead h1 { font-size: 13px; margin: 0; }
      .letterhead p { font-size: 10px; margin: 2px 0 0; color: #475569; }
      h2 { font-size: 13px; margin: 0 0 4px; }
      .meta { font-size: 10px; color: #64748b; margin-bottom: 14px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #cbd5e1; padding: 5px 7px; font-size: 10px; text-align: left; }
      th { background: #f1f5f9; }
      @media print { body { padding: 8px; } }
    </style></head><body>
      <div class="letterhead">
        <img src="${window.location.origin}${import.meta.env.BASE_URL}logo-jpv.png" />
        <div><h1>JABATAN PERKHIDMATAN VETERINAR MALAYSIA</h1><p>Seksyen Biokimia, Institut Penyelidikan Veterinar (VRI) Ipoh</p></div>
      </div>
      <h2>${report?.label || key}</h2>
      <p class="meta">Tarikh laporan dijana: ${dateStr} &middot; Jumlah rekod: ${rows.length}</p>
      <table>
        <thead><tr>${keys.map((k) => `<th>${k}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${keys.map((k) => `<td>${escapeHTML(row[k] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
      <script>window.onload = () => setTimeout(() => window.print(), 400);</script>
    </body></html>`);
  win.document.close();
}
