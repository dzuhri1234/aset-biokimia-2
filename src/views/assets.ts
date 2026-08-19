import { css } from "../../styled-system/css";
import { STATE, ASSET_PAGE_SIZE, canEdit } from "../lib/state";
import { getLocationName, getCategoryName, getPersonnelName, getAssetTimeline } from "../lib/data";
import { card, cardHeader, tableWrap, table, thead, th, tbody, td, trHover, emptyState, badgeRecipe, statusTone, buttonRecipe, inputClass, labelClass, formGrid, formActions } from "../lib/ui";
import { escapeHTML, formatDate } from "../lib/utils";
import type { Asset } from "../lib/types";
import { ASSET_STATUSES } from "../lib/types";

export function renderAssetsList(): string {
  const search = STATE.filters.search.toLowerCase();
  const filtered = STATE.data.assets.filter((a) => {
    const matchesSearch = !search ||
      (a.description || "").toLowerCase().includes(search) ||
      (a.registration_no || "").toLowerCase().includes(search) ||
      (a.unique_id || "").toLowerCase().includes(search) ||
      getLocationName(a.location_id).toLowerCase().includes(search);
    const matchesStatus = !STATE.filters.status || a.status === STATE.filters.status;
    const matchesLocation = !STATE.filters.location || a.location_id === STATE.filters.location;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ASSET_PAGE_SIZE));
  if (STATE.assetPage > totalPages) STATE.assetPage = totalPages;
  if (STATE.assetPage < 1) STATE.assetPage = 1;
  const start = (STATE.assetPage - 1) * ASSET_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + ASSET_PAGE_SIZE);

  return `
    <div class="${card}">
      <div class="${cardHeader}">
        <div class="${css({ display: "flex", gap: "2", flex: "1", flexWrap: "wrap" })}">
          <input type="text" id="assetSearchInput" data-action="assetSearch" placeholder="Cari nama, no. pendaftaran, lokasi..." value="${escapeHTML(STATE.filters.search)}"
            class="${inputClass}" style="max-width:280px;" />
          <select data-action="assetLocationFilter" class="${inputClass}" style="width:auto;">
            <option value="">Semua Lokasi</option>
            ${STATE.data.locations.map((l) => `<option value="${l.id}" ${STATE.filters.location === l.id ? "selected" : ""}>${escapeHTML(l.name)}</option>`).join("")}
          </select>
          <select data-action="assetStatusFilter" class="${inputClass}" style="width:auto;">
            <option value="">Semua Status</option>
            ${ASSET_STATUSES.map((s) => `<option value="${s}" ${STATE.filters.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        ${canEdit("assets") ? `<button data-action="openAssetForm" class="${buttonRecipe({ variant: "primary" })}">+ Daftar Aset</button>` : ""}
      </div>
      <div class="${tableWrap}">
        <table class="${table}">
          <thead class="${thead}">
            <tr>
              <th class="${th}">No. Pendaftaran</th>
              <th class="${th}">Keterangan Aset</th>
              <th class="${th}">Lokasi</th>
              <th class="${th}">Status</th>
              <th class="${th}" style="text-align:right;">Tindakan</th>
            </tr>
          </thead>
          <tbody class="${tbody}">
            ${pageItems.length ? pageItems.map(rowHtml).join("") : `<tr><td colspan="5" class="${emptyState}">Tiada aset dijumpai.</td></tr>`}
          </tbody>
        </table>
      </div>
      ${filtered.length ? `
      <div class="${css({ display: "flex", justifyContent: "space-between", alignItems: "center", px: "6", py: "3", borderTop: "1px solid", borderColor: "slate.200", bg: "slate.50", flexWrap: "wrap", gap: "2" })}">
        <p class="${css({ fontSize: "xs", color: "slate.500" })}">Memaparkan <b>${start + 1}-${Math.min(start + ASSET_PAGE_SIZE, filtered.length)}</b> daripada <b>${filtered.length}</b> aset</p>
        <div class="${css({ display: "flex", alignItems: "center", gap: "2" })}">
          <button data-action="assetPagePrev" ${STATE.assetPage <= 1 ? "disabled" : ""} class="${buttonRecipe({ variant: "outline", size: "sm" })}">&laquo; Sebelum</button>
          <span class="${css({ fontSize: "xs", fontWeight: "medium", color: "slate.600" })}">Muka ${STATE.assetPage} / ${totalPages}</span>
          <button data-action="assetPageNext" ${STATE.assetPage >= totalPages ? "disabled" : ""} class="${buttonRecipe({ variant: "outline", size: "sm" })}">Seterusnya &raquo;</button>
        </div>
      </div>` : ""}
    </div>`;
}

function rowHtml(a: Asset): string {
  return `
    <tr class="${trHover}">
      <td class="${td}" style="font-family:monospace;font-weight:600;">${escapeHTML(a.registration_no || "-")}</td>
      <td class="${td}"><p style="font-weight:600;color:#1e293b;">${escapeHTML(a.description)}</p><p style="font-size:12px;color:#64748b;">${escapeHTML(getCategoryName(a.category_id))}</p></td>
      <td class="${td}">${escapeHTML(getLocationName(a.location_id))}</td>
      <td class="${td}"><span class="${badgeRecipe({ tone: statusTone(a.status) })}">${escapeHTML(a.status)}</span></td>
      <td class="${td}" style="text-align:right;">
        <button data-action="viewAssetProfile" data-id="${a.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "primary.500", _hover: { textDecoration: "underline" }, cursor: "pointer", mr: "3" })}">Profil</button>
        ${canEdit("assets") ? `<button data-action="openAssetForm" data-id="${a.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "slate.500", _hover: { color: "slate.800" }, cursor: "pointer" })}">Edit</button>` : ""}
      </td>
    </tr>`;
}

export function renderAssetForm(id?: string | null): string {
  const a = id ? STATE.data.assets.find((x) => x.id === id) : null;
  const selectedLocation = a?.location_id ? STATE.data.locations.find((l) => l.id === a.location_id) : null;

  return `
    <form data-form="asset" data-id="${id || ""}" class="${css({ display: "flex", flexDirection: "column", gap: "6" })}">
      <div>
        <label class="${labelClass}">Gambar Aset</label>
        <div class="${css({ display: "flex", alignItems: "center", gap: "4" })}">
          <div id="assetPhotoPreview" class="${css({ width: "24", height: "24", borderRadius: "lg", bg: "slate.100", border: "1px solid", borderColor: "slate.200", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 })}">
            ${a?.photo_url ? `<img src="${escapeHTML(a.photo_url)}" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:#94a3b8;font-size:11px;">Tiada gambar</span>`}
          </div>
          <input type="file" id="assetPhotoInput" accept="image/*" class="${css({ fontSize: "sm" })}" />
        </div>
      </div>

      ${id ? "" : `<div class="${css({ bg: "info.50", border: "1px solid", borderColor: "info.500/30", borderRadius: "lg", p: "3", fontSize: "xs", color: "info.700" })}">No. Unik ID akan dijana secara automatik oleh sistem selepas disimpan.</div>`}

      <div class="${formGrid}">
        <div style="grid-column:1/-1;">
          <label class="${labelClass}">Keterangan Aset <span style="color:#ef4444;">*</span></label>
          <input type="text" name="description" required value="${escapeHTML(a?.description)}" class="${inputClass}" />
        </div>
        <div>
          <label class="${labelClass}">No. Siri Pendaftaran</label>
          <input type="text" name="registration_no" value="${escapeHTML(a?.registration_no)}" class="${inputClass}" />
        </div>
        <div>
          <label class="${labelClass}">Status</label>
          <select name="status" class="${inputClass}">
            ${ASSET_STATUSES.map((s) => `<option value="${s}" ${a?.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="${labelClass}">Kategori</label>
          <select name="category_id" class="${inputClass}"><option value="">-- Pilih --</option>${STATE.data.categories.map((c) => `<option value="${c.id}" ${a?.category_id === c.id ? "selected" : ""}>${escapeHTML(c.name)}</option>`).join("")}</select>
        </div>
        <div>
          <label class="${labelClass}">Tempat Penempatan</label>
          <select name="location_id" id="assetLocationSelect" class="${inputClass}"><option value="">-- Pilih --</option>${STATE.data.locations.map((l) => `<option value="${l.id}" ${a?.location_id === l.id ? "selected" : ""}>${escapeHTML(l.name)}</option>`).join("")}</select>
        </div>
        <div>
          <label class="${labelClass}">Pegawai / PIC</label>
          <select name="pic_id" class="${inputClass}"><option value="">-- Pilih --</option>${STATE.data.personnel.map((p) => `<option value="${p.id}" ${a?.pic_id === p.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("")}</select>
        </div>
        <div>
          <label class="${labelClass}">Tarikh Penempatan</label>
          <input type="date" name="placement_date" value="${a?.placement_date || ""}" class="${inputClass}" />
        </div>
        <div>
          <label class="${labelClass}">Kod Penempatan <span class="${css({ fontWeight: "normal", color: "slate.400" })}">(ikut lokasi)</span></label>
          <input type="text" id="assetPlacementCode" readonly value="${escapeHTML(selectedLocation?.code || a?.placement_code || "")}" placeholder="-- Pilih lokasi dahulu --" class="${inputClass}" style="background:#f1f5f9;color:#64748b;cursor:not-allowed;" />
        </div>
        <div>
          <label class="${labelClass}">Keperluan Selenggara/Kalibrasi?</label>
          <select name="maintenance_required" class="${inputClass}">
            <option value="false" ${!a?.maintenance_required ? "selected" : ""}>TIDAK</option>
            <option value="true" ${a?.maintenance_required ? "selected" : ""}>YA</option>
          </select>
        </div>
        <div>
          <label class="${labelClass}">Tahun Terakhir Selenggara/Pembaikan</label>
          <input type="number" name="last_maintenance_year" min="1990" max="2100" value="${a?.last_maintenance_year ?? ""}" class="${inputClass}" />
        </div>
        <div style="grid-column:1/-1;">
          <label class="${labelClass}">Catatan</label>
          <textarea name="notes" rows="3" class="${inputClass}">${escapeHTML(a?.notes)}</textarea>
        </div>
      </div>
      <div class="${formActions}">
        <button type="submit" class="${buttonRecipe({ variant: "primary" })}">Simpan Rekod Aset</button>
      </div>
    </form>`;
}

export function renderAssetProfile(id: string): string {
  const a = STATE.data.assets.find((x) => x.id === id);
  if (!a) return `<p>Aset tidak dijumpai.</p>`;
  const timeline = getAssetTimeline(id);

  const field = (label: string, value: string) => `
    <div>
      <p class="${css({ fontSize: "10px", fontWeight: "bold", color: "slate.400", textTransform: "uppercase", letterSpacing: "wide", mb: "1" })}">${label}</p>
      <p class="${css({ fontWeight: "medium", color: "slate.800", fontSize: "sm" })}">${value || "-"}</p>
    </div>`;

  const historyBox = (title: string, kind: string, icon: string) => {
    const items = timeline.filter((t) => t.kind === kind);
    return `
      <div class="${card}">
        <div class="${cardHeader}"><h3 class="${css({ fontWeight: "bold", color: "slate.800", fontSize: "sm" })}">${icon} ${title} (${items.length})</h3></div>
        <div class="${css({ maxHeight: "72", overflowY: "auto" })}">
          ${items.length ? items.map((it) => `
            <div class="${css({ px: "4", py: "3", borderBottom: "1px solid", borderColor: "slate.100" })}">
              <div class="${css({ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "2" })}">
                <span class="${css({ fontSize: "sm", fontWeight: "medium", color: "slate.800" })}">${escapeHTML(it.label)}</span>
                <span class="${css({ fontSize: "xs", color: "slate.400", flexShrink: 0 })}">${formatDate(it.date)}</span>
              </div>
              ${it.detail ? `<p class="${css({ fontSize: "xs", color: "slate.500", mt: "0.5" })}">${escapeHTML(it.detail)}</p>` : ""}
            </div>`).join("") : `<p class="${emptyState}">Tiada rekod.</p>`}
        </div>
      </div>`;
  };

  return `
    <div id="assetProfilePrintArea" class="${css({ display: "flex", flexDirection: "column", gap: "6" })}">
      <div class="${css({ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2" })} print-hide">
        <button data-action="backToAssetsList" class="${css({ fontSize: "sm", fontWeight: "semibold", color: "primary.500", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "1", _hover: { textDecoration: "underline" } })}">&larr; Kembali ke Senarai Aset</button>
        <button data-action="printAssetProfile" class="${buttonRecipe({ variant: "outline", size: "sm" })}">&#128438; Cetak Profil</button>
      </div>

      <div class="${css({ display: "flex", gap: "5", flexWrap: "wrap", alignItems: "flex-start" })}">
        <div class="${css({ flex: "1", minWidth: "200px" })}">
          <h2 class="${css({ fontSize: "xl", fontWeight: "bold", color: "slate.900" })}">${escapeHTML(a.description)}</h2>
          <div class="${css({ display: "flex", gap: "2", mt: "1", alignItems: "center", flexWrap: "wrap" })}">
            <span class="${css({ fontFamily: "mono", fontWeight: "bold", fontSize: "sm", color: "primary.500", bg: "primary.50", px: "2", py: "0.5", borderRadius: "md" })}">${escapeHTML(a.registration_no || "Tiada No. Pendaftaran")}</span>
            <span class="${badgeRecipe({ tone: statusTone(a.status) })}">${escapeHTML(a.status)}</span>
          </div>
        </div>
        <div class="${css({ width: "32", height: "32", borderRadius: "xl", bg: "slate.100", border: "1px solid", borderColor: "slate.200", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}">
          ${a.photo_url ? `<img src="${escapeHTML(a.photo_url)}" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:#94a3b8;font-size:11px;">Tiada gambar</span>`}
        </div>
      </div>

      <div class="${css({ display: "grid", gridTemplateColumns: { base: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: "4", bg: "slate.50", p: "5", borderRadius: "xl", border: "1px solid", borderColor: "slate.200" })}">
        ${field("Kategori", escapeHTML(getCategoryName(a.category_id)))}
        ${field("Tempat Penempatan", escapeHTML(getLocationName(a.location_id)))}
        ${field("Kod Penempatan", escapeHTML(a.placement_code))}
        ${field("Pegawai / PIC", escapeHTML(getPersonnelName(a.pic_id)))}
        ${field("Tarikh Penempatan", formatDate(a.placement_date))}
        ${field("Keperluan Selenggara/Kalibrasi?", a.maintenance_required ? "YA" : "TIDAK")}
        ${field("Tarikh Terakhir Semakan", formatDate(a.last_check_date))}
        ${field("Tahun Terakhir Selenggara", escapeHTML(a.last_maintenance_year ?? "-"))}
      </div>

      <div>
        <p class="${css({ fontSize: "10px", fontWeight: "bold", color: "slate.500", textTransform: "uppercase", letterSpacing: "wide", mb: "2" })}">Catatan</p>
        <div class="${css({ fontSize: "sm", color: "slate.700", bg: "white", border: "1px solid", borderColor: "slate.200", p: "4", borderRadius: "xl", minHeight: "12", whiteSpace: "pre-wrap" })}">${escapeHTML(a.notes) || `<span style="color:#94a3b8;font-style:italic;">Tiada catatan.</span>`}</div>
      </div>

      <div>
        <h3 class="${css({ fontSize: "sm", fontWeight: "bold", color: "slate.800", textTransform: "uppercase", letterSpacing: "wide", mb: "3" })}">Jejak Aktiviti / Sejarah Aset</h3>
        <div class="${css({ display: "grid", gridTemplateColumns: { base: "1fr", lg: "1fr 1fr" }, gap: "4" })}">
          ${historyBox("Sejarah Penyelenggaraan", "Selenggara", "&#128295;")}
          ${historyBox("Sejarah Pergerakan &amp; Pinjaman", "Pergerakan", "&#128230;")}
          ${historyBox("Sejarah Kerosakan &amp; Pembaikan", "Kerosakan", "&#9888;")}
          ${historyBox("Sejarah Pelupusan", "Pelupusan", "&#128465;")}
          ${historyBox("Sejarah Pemeriksaan", "Pemeriksaan", "&#128269;")}
        </div>
      </div>
    </div>`;
}
