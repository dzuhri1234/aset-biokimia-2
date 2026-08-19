import { css } from "../../styled-system/css";
import { STATE, canEdit } from "../lib/state";
import { card, cardHeader, tableWrap, table, thead, th, tbody, td, trHover, emptyState, badgeRecipe, statusTone, buttonRecipe, inputClass, labelClass, formGrid, formActions } from "../lib/ui";
import { escapeHTML, formatDate } from "../lib/utils";
import type { ModuleName } from "../lib/types";

export type TxModule = "movements" | "maintenance" | "damage" | "inspections" | "disposals";

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  span2?: boolean;
  sectionBefore?: string;
}

interface ModuleDef {
  title: string;
  addLabel: string;
  fields: FieldDef[];
  columns: { key: string; label: string; render: (r: any) => string }[];
  printable?: boolean;
  editable?: boolean;
}

const MODULE_DEFS: Record<TxModule, ModuleDef> = {
  movements: {
    title: "Pergerakan & Pinjaman Aset (KEW.PA-9)",
    addLabel: "+ Rekod Pergerakan",
    printable: true,
    editable: true,
    fields: [
      { name: "applicant_name", label: "Nama Pemohon", type: "text", sectionBefore: "Maklumat Permohonan" },
      { name: "applicant_position", label: "Jawatan Pemohon", type: "text" },
      { name: "division", label: "Bahagian", type: "text" },
      { name: "purpose", label: "Tujuan", type: "text", required: true, span2: true },
      { name: "used_at", label: "Tempat Digunakan", type: "text" },
      { name: "issuer_name", label: "Nama Pengeluar", type: "text" },
      { name: "from_location_id", label: "Lokasi Asal", type: "select", options: [] },
      { name: "to_location_id", label: "Lokasi Baharu", type: "select", options: [] },
      { name: "borrower_name", label: "Pegawai Peminjam", type: "text", sectionBefore: "Butiran Pergerakan" },
      { name: "out_date", label: "Tarikh Keluar", type: "date", required: true },
      { name: "expected_return_date", label: "Tarikh Dijangka Pulang", type: "date" },
      { name: "actual_return_date", label: "Tarikh Pulang Sebenar", type: "date" },
      { name: "status", label: "Status Pergerakan", type: "select", options: ["Dalam Pergerakan", "Dipulangkan"] },
      { name: "borrower_position", label: "Jawatan Peminjam", type: "text" },
      { name: "returner_name", label: "Nama Pemulang", type: "text" },
      { name: "returner_position", label: "Jawatan Pemulang", type: "text" },
      { name: "notes", label: "Catatan", type: "textarea", span2: true },
      { name: "approval_status", label: "Status Kelulusan", type: "select", options: ["Menunggu Kelulusan", "Diluluskan", "Tidak Diluluskan"], sectionBefore: "Kelulusan & Serah Terima" },
      { name: "approved_by_name", label: "Nama Pelulus", type: "text" },
      { name: "approved_by_position", label: "Jawatan Pelulus", type: "text" },
      { name: "approved_date", label: "Tarikh Kelulusan", type: "date" },
      { name: "received_by_name", label: "Nama Penerima", type: "text" },
      { name: "received_by_position", label: "Jawatan Penerima", type: "text" },
      { name: "received_date", label: "Tarikh Terima", type: "date" },
    ],
    columns: [
      { key: "asset", label: "Aset", render: (r) => assetLabel(r.asset_id) },
      { key: "purpose", label: "Tujuan", render: (r) => escapeHTML(r.purpose) },
      { key: "out_date", label: "Tarikh Keluar", render: (r) => formatDate(r.out_date) },
      { key: "approval", label: "Kelulusan", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.approval_status) })}">${escapeHTML(r.approval_status)}</span>` },
      { key: "status", label: "Status", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.status) })}">${escapeHTML(r.status)}</span>` },
    ],
  },
  maintenance: {
    title: "Penyelenggaraan Aset (KEW.PA-15)",
    addLabel: "+ Rekod Selenggara",
    printable: true,
    editable: true,
    fields: [
      { name: "type", label: "Jenis Penyelenggaraan", type: "select", options: ["Pencegahan", "Pembaikan"], required: true },
      { name: "vendor", label: "Nama Syarikat/Jabatan Menyelenggara", type: "text" },
      { name: "work_order_no", label: "No. Pesanan Kerajaan / Kontrak", type: "text" },
      { name: "cost", label: "Kos (RM)", type: "number" },
      { name: "start_date", label: "Tarikh Mula", type: "date", required: true },
      { name: "end_date", label: "Tarikh Selesai", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Dijadualkan", "Sedang Diselenggara", "Selesai"] },
      { name: "confirmed_by_name", label: "Nama Pegawai Mengesahkan", type: "text" },
      { name: "confirmed_by_position", label: "Jawatan Pegawai Mengesahkan", type: "text" },
      { name: "notes", label: "Butir-butir Kerja", type: "textarea", span2: true },
    ],
    columns: [
      { key: "asset", label: "Aset", render: (r) => assetLabel(r.asset_id) },
      { key: "type", label: "Jenis", render: (r) => escapeHTML(r.type) },
      { key: "vendor", label: "Vendor", render: (r) => escapeHTML(r.vendor || "-") },
      { key: "start_date", label: "Tarikh Mula", render: (r) => formatDate(r.start_date) },
      { key: "status", label: "Status", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.status) })}">${escapeHTML(r.status)}</span>` },
    ],
  },
  damage: {
    title: "Laporan Kerosakan Aset (KEW.PA-10)",
    addLabel: "+ Laporan Kerosakan",
    printable: true,
    editable: true,
    fields: [
      { name: "damage_type", label: "Jenis Kerosakan", type: "text", required: true, sectionBefore: "Bahagian I - Diisi oleh Pengadu" },
      { name: "last_user", label: "Pengguna Terakhir", type: "text" },
      { name: "report_date", label: "Tarikh Kerosakan", type: "date", required: true },
      { name: "reporter_name", label: "Nama Pengadu", type: "text" },
      { name: "reporter_position", label: "Jawatan Pengadu", type: "text" },
      { name: "priority", label: "Tahap Keutamaan", type: "select", options: ["Sederhana", "Tinggi"] },
      { name: "notes", label: "Perihal Kerosakan", type: "textarea", span2: true },
      { name: "repair_cost", label: "Anggaran Kos Penyelenggaraan (RM)", type: "number", sectionBefore: "Bahagian II - Pegawai Aset / Pegawai Teknikal" },
      { name: "technical_officer_name", label: "Nama Pegawai Teknikal", type: "text" },
      { name: "technical_officer_position", label: "Jawatan Pegawai Teknikal", type: "text" },
      { name: "technical_officer_date", label: "Tarikh Disahkan", type: "date" },
      { name: "technical_notes", label: "Syor Dan Ulasan", type: "textarea", span2: true },
      { name: "status", label: "Status Pembaikan", type: "select", options: ["Dilaporkan", "Dalam Pembaikan", "Selesai"] },
      { name: "resolved_date", label: "Tarikh Selesai", type: "date" },
      { name: "decision_status", label: "Keputusan Ketua Jabatan", type: "select", options: ["Belum Diputuskan", "Diluluskan", "Tidak Diluluskan"], sectionBefore: "Bahagian III - Keputusan Ketua Jabatan/Bahagian/Seksyen/Unit" },
      { name: "decision_by_name", label: "Nama Ketua Jabatan", type: "text" },
      { name: "decision_by_position", label: "Jawatan", type: "text" },
      { name: "decision_date", label: "Tarikh Keputusan", type: "date" },
      { name: "decision_notes", label: "Ulasan Keputusan", type: "textarea", span2: true },
    ],
    columns: [
      { key: "asset", label: "Aset", render: (r) => assetLabel(r.asset_id) },
      { key: "damage_type", label: "Jenis Kerosakan", render: (r) => escapeHTML(r.damage_type) },
      { key: "priority", label: "Keutamaan", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.priority) })}">${escapeHTML(r.priority)}</span>` },
      { key: "report_date", label: "Tarikh Lapor", render: (r) => formatDate(r.report_date) },
      { key: "status", label: "Status", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.status) })}">${escapeHTML(r.status)}</span>` },
    ],
  },
  inspections: {
    title: "Pemeriksaan Berkala",
    addLabel: "+ Rekod Semakan",
    fields: [
      { name: "inspection_date", label: "Tarikh Semakan", type: "date", required: true },
      { name: "condition", label: "Keadaan Aset", type: "select", options: ["BAIK", "ROSAK", "HILANG"] },
      { name: "notes", label: "Catatan", type: "textarea", span2: true },
    ],
    columns: [
      { key: "asset", label: "Aset", render: (r) => assetLabel(r.asset_id) },
      { key: "inspection_date", label: "Tarikh Semakan", render: (r) => formatDate(r.inspection_date) },
      { key: "condition", label: "Keadaan", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.condition) })}">${escapeHTML(r.condition)}</span>` },
      { key: "notes", label: "Catatan", render: (r) => escapeHTML(r.notes || "-") },
    ],
  },
  disposals: {
    title: "Pelupusan Aset",
    addLabel: "+ Cadangan Pelupusan",
    editable: true,
    fields: [
      { name: "reason", label: "Sebab Pelupusan", type: "text", required: true },
      { name: "method", label: "Kaedah Pelupusan", type: "select", options: ["E-Waste", "Jualan Sisa", "Musnah"] },
      { name: "proposal_date", label: "Tarikh Cadangan", type: "date", required: true },
      { name: "approval_date", label: "Tarikh Kelulusan", type: "date" },
      { name: "status", label: "Status Proses", type: "select", options: ["Cadangan", "Diluluskan", "Selesai", "Ditolak"] },
      { name: "notes", label: "Catatan", type: "textarea", span2: true },
    ],
    columns: [
      { key: "asset", label: "Aset", render: (r) => assetLabel(r.asset_id) },
      { key: "reason", label: "Sebab", render: (r) => escapeHTML(r.reason) },
      { key: "method", label: "Kaedah", render: (r) => escapeHTML(r.method) },
      { key: "status", label: "Status", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.status) })}">${escapeHTML(r.status)}</span>` },
    ],
  },
};

function assetLabel(assetId: string): string {
  const a = STATE.data.assets.find((x) => x.id === assetId);
  if (!a) return "-";
  return `<span style="font-weight:600;">${escapeHTML(a.registration_no || a.unique_id)}</span> <span style="color:#64748b;">${escapeHTML(a.description).substring(0, 40)}</span>`;
}

function assetSearchLabel(assetId?: string | null): string {
  if (!assetId) return "";
  const a = STATE.data.assets.find((x) => x.id === assetId);
  if (!a) return "";
  return `${a.registration_no || a.unique_id} — ${a.description}`;
}

export function renderTxModule(mod: TxModule): string {
  const def = MODULE_DEFS[mod];
  let rows = [...(STATE.data as any)[mod]];
  if (mod === "maintenance" && STATE.maintenanceStatusFilter) {
    rows = rows.filter((r: any) => r.status === STATE.maintenanceStatusFilter);
  }
  rows.sort((a: any, b: any) => {
    const da = a.out_date || a.start_date || a.report_date || a.inspection_date || a.proposal_date || a.created_at;
    const db = b.out_date || b.start_date || b.report_date || b.inspection_date || b.proposal_date || b.created_at;
    return new Date(db).getTime() - new Date(da).getTime();
  });

  return `
    <div class="${card}">
      <div class="${cardHeader}">
        <div class="${css({ display: "flex", gap: "2", alignItems: "center", flexWrap: "wrap" })}">
          <h3 class="${css({ fontWeight: "bold", color: "slate.800", fontSize: "sm" })}">${def.title} (${rows.length})</h3>
          ${mod === "maintenance" ? `
            <select data-action="maintenanceStatusFilter" class="${inputClass}" style="width:auto;">
              <option value="">Semua Status</option>
              <option value="Dijadualkan" ${STATE.maintenanceStatusFilter === "Dijadualkan" ? "selected" : ""}>Dijadualkan</option>
              <option value="Sedang Diselenggara" ${STATE.maintenanceStatusFilter === "Sedang Diselenggara" ? "selected" : ""}>Sedang Diselenggara</option>
              <option value="Selesai" ${STATE.maintenanceStatusFilter === "Selesai" ? "selected" : ""}>Selesai</option>
            </select>` : ""}
        </div>
        ${canEdit(mod as ModuleName) ? `<button data-action="openTxForm" data-mod="${mod}" class="${buttonRecipe({ variant: "primary" })}">${def.addLabel}</button>` : ""}
      </div>
      <div class="${tableWrap}">
        <table class="${table}">
          <thead class="${thead}"><tr>${def.columns.map((c) => `<th class="${th}">${c.label}</th>`).join("")}<th class="${th}" style="text-align:right;">Tindakan</th></tr></thead>
          <tbody class="${tbody}">
            ${rows.length ? rows.map((r: any) => `
              <tr class="${trHover}">
                ${def.columns.map((c) => `<td class="${td}">${c.render(r)}</td>`).join("")}
                <td class="${td}" style="text-align:right;white-space:nowrap;">
                  <button data-action="openTxView" data-mod="${mod}" data-id="${r.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "primary.500", cursor: "pointer", mr: "3" })}">Lihat</button>
                  ${def.editable && canEdit(mod as ModuleName) ? `<button data-action="openTxForm" data-mod="${mod}" data-id="${r.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "slate.500", cursor: "pointer" })}">Edit</button>` : ""}
                </td>
              </tr>`).join("")
              : `<tr><td colspan="${def.columns.length + 1}" class="${emptyState}">Tiada rekod ${def.title.toLowerCase()} lagi.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

function locationOptionsFor(_fieldName: string, selected?: string | null): string {
  return `<option value="">-- Pilih --</option>` + STATE.data.locations.map((l) => `<option value="${l.id}" ${selected === l.id ? "selected" : ""}>${escapeHTML(l.name)}</option>`).join("");
}

export function renderTxForm(mod: TxModule, presetAssetId?: string | null, record?: any | null): string {
  const def = MODULE_DEFS[mod];
  const assetId = record?.asset_id || presetAssetId || "";
  return `
    <form data-form="tx" data-mod="${mod}" data-recordid="${record?.id || ""}" class="${css({ display: "flex", flexDirection: "column", gap: "6" })}">
      <div>
        <label class="${labelClass}">Aset <span style="color:#ef4444;">*</span></label>
        <div style="position:relative;">
          <input type="text" id="txAssetSearchInput" data-action="txAssetSearch" autocomplete="off" placeholder="Taip No. Pendaftaran atau nama aset..." value="${escapeHTML(assetSearchLabel(assetId))}" class="${inputClass}" />
          <input type="hidden" name="asset_id" id="txAssetIdHidden" value="${escapeHTML(assetId)}" required />
          <div id="txAssetSearchResults" style="display:none;position:absolute;z-index:20;top:calc(100% + 4px);left:0;right:0;max-height:220px;overflow-y:auto;background:white;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,.12);"></div>
        </div>
      </div>
      <div class="${formGrid}">
        ${def.fields.map((f) => renderField(f, record)).join("")}
      </div>
      <div class="${formActions}">
        <button type="submit" class="${buttonRecipe({ variant: "primary" })}">Simpan Rekod</button>
      </div>
    </form>`;
}

function renderField(f: FieldDef, record?: any | null): string {
  const wrapStyle = f.span2 ? "grid-column:1/-1;" : "";
  const req = f.required ? `<span style="color:#ef4444;">*</span>` : "";
  const value = record ? record[f.name] : undefined;
  let control = "";

  if (f.type === "select") {
    if (f.name === "from_location_id" || f.name === "to_location_id") {
      control = `<select name="${f.name}" class="${inputClass}">${locationOptionsFor(f.name, value)}</select>`;
    } else {
      control = `<select name="${f.name}" class="${inputClass}">${(f.options || []).map((o) => `<option value="${o}" ${value === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    }
  } else if (f.type === "textarea") {
    control = `<textarea name="${f.name}" rows="3" class="${inputClass}">${escapeHTML(value)}</textarea>`;
  } else {
    control = `<input type="${f.type}" name="${f.name}" ${f.required ? "required" : ""} ${f.type === "number" ? 'step="0.01" min="0"' : ""} value="${escapeHTML(value ?? "")}" class="${inputClass}" />`;
  }

  const section = f.sectionBefore
    ? `<div style="grid-column:1/-1;" class="${css({ fontSize: "xs", fontWeight: "bold", color: "primary.500", textTransform: "uppercase", letterSpacing: "wide", borderTop: "1px solid", borderColor: "slate.200", pt: "3", mt: "1" })}">${f.sectionBefore}</div>`
    : "";

  return `${section}<div style="${wrapStyle}"><label class="${labelClass}">${f.label} ${req}</label>${control}</div>`;
}

export function renderTxView(mod: TxModule, record: any): string {
  const def = MODULE_DEFS[mod];
  const asset = STATE.data.assets.find((a) => a.id === record.asset_id);
  const row = (label: string, value: string) => `
    <div class="${css({ display: "flex", justifyContent: "space-between", gap: "4", py: "2.5", borderBottom: "1px solid", borderColor: "slate.100" })}">
      <span class="${css({ fontSize: "xs", fontWeight: "semibold", color: "slate.500" })}">${label}</span>
      <span class="${css({ fontSize: "sm", color: "slate.800", fontWeight: "medium", textAlign: "right" })}">${value || "-"}</span>
    </div>`;

  return `
    <div class="${css({ display: "flex", flexDirection: "column", gap: "4" })}">
      ${asset ? `<div class="${css({ bg: "primary.50", border: "1px solid", borderColor: "primary.100", borderRadius: "lg", p: "3" })}">
        <p class="${css({ fontSize: "xs", color: "primary.700", fontWeight: "bold" })}">${escapeHTML(asset.registration_no || asset.unique_id)}</p>
        <p class="${css({ fontSize: "sm", color: "slate.700" })}">${escapeHTML(asset.description)}</p>
      </div>` : ""}
      <div>
        ${def.fields.filter((f) => f.type !== "textarea").map((f) => {
          let val = record[f.name];
          if (f.type === "date") val = formatDate(val);
          if (f.name === "from_location_id" || f.name === "to_location_id") {
            const loc = STATE.data.locations.find((l) => l.id === val);
            val = loc ? loc.name : "-";
          }
          return row(f.label, escapeHTML(val ?? "-"));
        }).join("")}
      </div>
      ${def.fields.filter((f) => f.type === "textarea").map((f) => `
        <div>
          <p class="${css({ fontSize: "xs", fontWeight: "semibold", color: "slate.500", mb: "1" })}">${f.label}</p>
          <div class="${css({ fontSize: "sm", color: "slate.700", bg: "slate.50", p: "3", borderRadius: "lg", whiteSpace: "pre-wrap" })}">${escapeHTML(record[f.name]) || "-"}</div>
        </div>`).join("")}
      ${def.printable ? `<div class="${formActions}"><button type="button" data-action="downloadTxWord" data-mod="${mod}" data-id="${record.id}" class="${buttonRecipe({ variant: "outline" })}">&#128196; Muat Turun Word (.docx)</button><button type="button" data-action="printTxRecord" data-mod="${mod}" data-id="${record.id}" class="${buttonRecipe({ variant: "outline" })}">&#128438; Cetak Borang</button></div>` : ""}
    </div>`;
}

export function getTxModuleTitle(mod: TxModule): string {
  return MODULE_DEFS[mod].title;
}
