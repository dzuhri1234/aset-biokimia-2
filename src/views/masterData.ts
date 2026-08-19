import { css } from "../../styled-system/css";
import { STATE, canEdit } from "../lib/state";
import { card, cardHeader, cardTitle, tableWrap, table, thead, th, tbody, td, trHover, emptyState, buttonRecipe, inputClass, labelClass, formActions } from "../lib/ui";
import { escapeHTML } from "../lib/utils";

export type MasterType = "locations" | "categories" | "personnel";

const TITLES: Record<MasterType, { title: string; addLabel: string }> = {
  locations: { title: "Lokasi Penempatan", addLabel: "+ Tambah Lokasi" },
  categories: { title: "Kategori Aset", addLabel: "+ Tambah Kategori" },
  personnel: { title: "Pemegang Aset (PIC)", addLabel: "+ Tambah Personel" },
};

export function renderMasterData(type: MasterType): string {
  const meta = TITLES[type];
  const rows = (STATE.data as any)[type] as any[];
  const assetCountFor = (id: string) => STATE.data.assets.filter((a) => {
    if (type === "locations") return a.location_id === id;
    if (type === "categories") return a.category_id === id;
    if (type === "personnel") return a.pic_id === id;
    return false;
  }).length;

  return `
    <div class="${card}">
      <div class="${cardHeader}">
        <h3 class="${cardTitle}">${meta.title} (${rows.length})</h3>
        ${canEdit("master_data") ? `<button data-action="openMasterForm" data-type="${type}" class="${buttonRecipe({ variant: "primary" })}">${meta.addLabel}</button>` : ""}
      </div>
      <div class="${tableWrap}">
        <table class="${table}">
          <thead class="${thead}"><tr>
            <th class="${th}">Nama</th>
            ${type === "locations" ? `<th class="${th}">Kod Penempatan</th>` : ""}
            ${type === "personnel" ? `<th class="${th}">Jawatan</th><th class="${th}">Bahagian</th>` : ""}
            <th class="${th}">Bilangan Aset</th>
            <th class="${th}" style="text-align:right;">Tindakan</th>
          </tr></thead>
          <tbody class="${tbody}">
            ${rows.length ? rows.map((r) => `
              <tr class="${trHover}">
                <td class="${td}" style="font-weight:600;">${escapeHTML(r.name)}</td>
                ${type === "locations" ? `<td class="${td}" style="font-family:monospace;">${escapeHTML(r.code || "-")}</td>` : ""}
                ${type === "personnel" ? `<td class="${td}">${escapeHTML(r.position || "-")}</td><td class="${td}">${escapeHTML(r.department || "-")}</td>` : ""}
                <td class="${td}">${assetCountFor(r.id)}</td>
                <td class="${td}" style="text-align:right;">
                  ${canEdit("master_data") ? `<button data-action="openMasterForm" data-type="${type}" data-id="${r.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "primary.500", cursor: "pointer" })}">Edit</button>` : ""}
                </td>
              </tr>`).join("") : `<tr><td colspan="5" class="${emptyState}">Tiada data.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

export function renderMasterForm(type: MasterType, id?: string | null): string {
  const record = id ? (STATE.data as any)[type].find((r: any) => r.id === id) : null;
  return `
    <form data-form="master" data-type="${type}" data-id="${id || ""}" class="${css({ display: "flex", flexDirection: "column", gap: "5" })}">
      <div>
        <label class="${labelClass}">Nama <span style="color:#ef4444;">*</span></label>
        <input type="text" name="name" required value="${escapeHTML(record?.name)}" class="${inputClass}" />
      </div>
      ${type === "locations" ? `
        <div>
          <label class="${labelClass}">Kod Penempatan</label>
          <input type="text" name="code" value="${escapeHTML(record?.code)}" placeholder="cth. 080311 / BGN / X / 02 / 009" class="${inputClass}" />
          <p class="${css({ fontSize: "xs", color: "slate.500", mt: "1" })}">Kod ini akan digunakan secara automatik untuk semua aset di lokasi ini.</p>
        </div>` : ""}
      ${type === "personnel" ? `
        <div><label class="${labelClass}">Jawatan</label><input type="text" name="position" value="${escapeHTML(record?.position)}" class="${inputClass}" /></div>
        <div><label class="${labelClass}">Bahagian</label><input type="text" name="department" value="${escapeHTML(record?.department)}" class="${inputClass}" /></div>` : ""}
      <div class="${formActions}"><button type="submit" class="${buttonRecipe({ variant: "primary" })}">Simpan</button></div>
    </form>`;
}

export function getMasterTitle(type: MasterType, isEdit: boolean): string {
  return isEdit ? `Kemaskini ${TITLES[type].title}` : TITLES[type].addLabel;
}
