import { css } from "../../styled-system/css";
import { STATE, canEdit } from "../lib/state";
import { card, cardHeader, cardTitle, tableWrap, table, thead, th, tbody, td, trHover, emptyState, badgeRecipe, statusTone, buttonRecipe, inputClass, labelClass, formGrid, formActions } from "../lib/ui";
import { escapeHTML, formatDate } from "../lib/utils";
import type { ModuleName } from "../lib/types";

type TxModule = "movements" | "maintenance" | "damage" | "inspections" | "disposals";

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea" | "assetSelect" | "locationSelect";
  required?: boolean;
  options?: string[];
  span2?: boolean;
}

interface ModuleDef {
  title: string;
  addLabel: string;
  fields: FieldDef[];
  columns: { key: string; label: string; render: (r: any) => string }[];
}

const MODULE_DEFS: Record<TxModule, ModuleDef> = {
  movements: {
    title: "Pergerakan & Pinjaman Aset",
    addLabel: "+ Rekod Pergerakan",
    fields: [
      { name: "asset_id", label: "Aset", type: "assetSelect", required: true, span2: true },
      { name: "from_location_id", label: "Lokasi Asal", type: "locationSelect" },
      { name: "to_location_id", label: "Lokasi Baharu", type: "locationSelect" },
      { name: "borrower_name", label: "Pegawai Peminjam", type: "text" },
      { name: "purpose", label: "Tujuan / Sebab", type: "text", required: true },
      { name: "out_date", label: "Tarikh Keluar", type: "date", required: true },
      { name: "expected_return_date", label: "Tarikh Dijangka Pulang", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Dalam Pergerakan", "Dipulangkan"] },
    ],
    columns: [
      { key: "asset", label: "Aset", render: (r) => assetLabel(r.asset_id) },
      { key: "purpose", label: "Tujuan", render: (r) => escapeHTML(r.purpose) },
      { key: "out_date", label: "Tarikh Keluar", render: (r) => formatDate(r.out_date) },
      { key: "status", label: "Status", render: (r) => `<span class="${badgeRecipe({ tone: statusTone(r.status) })}">${escapeHTML(r.status)}</span>` },
    ],
  },
  maintenance: {
    title: "Penyelenggaraan Aset",
    addLabel: "+ Rekod Selenggara",
    fields: [
      { name: "asset_id", label: "Aset", type: "assetSelect", required: true, span2: true },
      { name: "type", label: "Jenis Selenggaraan", type: "text", required: true },
      { name: "vendor", label: "Vendor / Kontraktor", type: "text" },
      { name: "cost", label: "Kos (RM)", type: "number" },
      { name: "start_date", label: "Tarikh Mula", type: "date", required: true },
      { name: "end_date", label: "Tarikh Selesai", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Dijadualkan", "Sedang Diselenggara", "Selesai"] },
      { name: "notes", label: "Catatan", type: "textarea", span2: true },
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
    title: "Laporan Kerosakan Aset",
    addLabel: "+ Laporan Kerosakan",
    fields: [
      { name: "asset_id", label: "Aset", type: "assetSelect", required: true, span2: true },
      { name: "damage_type", label: "Jenis Kerosakan", type: "text", required: true },
      { name: "priority", label: "Tahap Keutamaan", type: "select", options: ["Sederhana", "Tinggi"] },
      { name: "report_date", label: "Tarikh Dilaporkan", type: "date", required: true },
      { name: "status", label: "Status Pembaikan", type: "select", options: ["Dilaporkan", "Dalam Pembaikan", "Selesai"] },
      { name: "repair_cost", label: "Kos Pembaikan (RM)", type: "number" },
      { name: "notes", label: "Catatan", type: "textarea", span2: true },
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
      { name: "asset_id", label: "Aset", type: "assetSelect", required: true, span2: true },
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
    fields: [
      { name: "asset_id", label: "Aset", type: "assetSelect", required: true, span2: true },
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
  return `<span style="font-weight:600;">${escapeHTML(a.unique_id)}</span> <span style="color:#64748b;">${escapeHTML(a.description).substring(0, 40)}</span>`;
}

export function renderTxModule(mod: TxModule): string {
  const def = MODULE_DEFS[mod];
  const rows = [...(STATE.data as any)[mod]].sort((a: any, b: any) => {
    const da = a.out_date || a.start_date || a.report_date || a.inspection_date || a.proposal_date || a.created_at;
    const db = b.out_date || b.start_date || b.report_date || b.inspection_date || b.proposal_date || b.created_at;
    return new Date(db).getTime() - new Date(da).getTime();
  });

  return `
    <div class="${card}">
      <div class="${cardHeader}">
        <h3 class="${cardTitle}">${def.title} (${rows.length} rekod)</h3>
        ${canEdit(mod as ModuleName) ? `<button data-action="openTxForm" data-mod="${mod}" class="${buttonRecipe({ variant: "primary" })}">${def.addLabel}</button>` : ""}
      </div>
      <div class="${tableWrap}">
        <table class="${table}">
          <thead class="${thead}"><tr>${def.columns.map((c) => `<th class="${th}">${c.label}</th>`).join("")}</tr></thead>
          <tbody class="${tbody}">
            ${rows.length ? rows.map((r: any) => `<tr class="${trHover}">${def.columns.map((c) => `<td class="${td}">${c.render(r)}</td>`).join("")}</tr>`).join("")
              : `<tr><td colspan="${def.columns.length}" class="${emptyState}">Tiada rekod ${def.title.toLowerCase()} lagi.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

export function renderTxForm(mod: TxModule, presetAssetId?: string | null): string {
  const def = MODULE_DEFS[mod];
  return `
    <form data-form="tx" data-mod="${mod}" class="${css({ display: "flex", flexDirection: "column", gap: "6" })}">
      <div class="${formGrid}">
        ${def.fields.map((f) => renderField(f, presetAssetId)).join("")}
      </div>
      <div class="${formActions}">
        <button type="submit" class="${buttonRecipe({ variant: "primary" })}">Simpan Rekod</button>
      </div>
    </form>`;
}

function renderField(f: FieldDef, presetAssetId?: string | null): string {
  const wrapStyle = f.span2 ? "grid-column:1/-1;" : "";
  const req = f.required ? `<span style="color:#ef4444;">*</span>` : "";
  let control = "";
  if (f.type === "select") {
    control = `<select name="${f.name}" class="${inputClass}">${(f.options || []).map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`;
  } else if (f.type === "assetSelect") {
    control = `<select name="asset_id" required class="${inputClass}">
      <option value="">-- Pilih Aset --</option>
      ${STATE.data.assets.map((a) => `<option value="${a.id}" ${presetAssetId === a.id ? "selected" : ""}>${escapeHTML(a.unique_id)} — ${escapeHTML(a.description).substring(0, 50)}</option>`).join("")}
    </select>`;
  } else if (f.type === "locationSelect") {
    control = `<select name="${f.name}" class="${inputClass}"><option value="">-- Pilih --</option>${STATE.data.locations.map((l) => `<option value="${l.id}">${escapeHTML(l.name)}</option>`).join("")}</select>`;
  } else if (f.type === "textarea") {
    control = `<textarea name="${f.name}" rows="3" class="${inputClass}"></textarea>`;
  } else {
    control = `<input type="${f.type}" name="${f.name}" ${f.required ? "required" : ""} ${f.type === "number" ? 'step="0.01" min="0"' : ""} class="${inputClass}" />`;
  }
  return `<div style="${wrapStyle}"><label class="${labelClass}">${f.label} ${req}</label>${control}</div>`;
}

export function getTxModuleTitle(mod: TxModule): string {
  return MODULE_DEFS[mod].title;
}
