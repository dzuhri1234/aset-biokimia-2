import { css } from "../../styled-system/css";
import { STATE, canEdit } from "../lib/state";
import { card, cardHeader, cardTitle, tableWrap, table, thead, th, tbody, td, trHover, emptyState, buttonRecipe, inputClass, labelClass, formActions } from "../lib/ui";
import { escapeHTML } from "../lib/utils";

type MasterType = "locations" | "categories" | "personnel";

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
            ${type === "locations" ? `<th class="${th}">Kod</th>` : ""}
            ${type === "personnel" ? `<th class="${th}">Jawatan</th><th class="${th}">Bahagian</th>` : ""}
            <th class="${th}">Bilangan Aset</th>
          </tr></thead>
          <tbody class="${tbody}">
            ${rows.length ? rows.map((r) => `
              <tr class="${trHover}">
                <td class="${td}" style="font-weight:600;">${escapeHTML(r.name)}</td>
                ${type === "locations" ? `<td class="${td}">${escapeHTML(r.code || "-")}</td>` : ""}
                ${type === "personnel" ? `<td class="${td}">${escapeHTML(r.position || "-")}</td><td class="${td}">${escapeHTML(r.department || "-")}</td>` : ""}
                <td class="${td}">${assetCountFor(r.id)}</td>
              </tr>`).join("") : `<tr><td colspan="4" class="${emptyState}">Tiada data.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

export function renderMasterForm(type: MasterType): string {
  return `
    <form data-form="master" data-type="${type}" class="${css({ display: "flex", flexDirection: "column", gap: "5" })}">
      <div>
        <label class="${labelClass}">Nama <span style="color:#ef4444;">*</span></label>
        <input type="text" name="name" required class="${inputClass}" />
      </div>
      ${type === "locations" ? `<div><label class="${labelClass}">Kod Lokasi</label><input type="text" name="code" class="${inputClass}" /></div>` : ""}
      ${type === "personnel" ? `
        <div><label class="${labelClass}">Jawatan</label><input type="text" name="position" class="${inputClass}" /></div>
        <div><label class="${labelClass}">Bahagian</label><input type="text" name="department" class="${inputClass}" /></div>` : ""}
      <div class="${formActions}"><button type="submit" class="${buttonRecipe({ variant: "primary" })}">Simpan</button></div>
    </form>`;
}

export function getMasterTitle(type: MasterType): string {
  return TITLES[type].addLabel;
}
