import type { Asset, Movement, MaintenanceRecord } from "./types";
import { STATE } from "./state";
import { getLocationName } from "./data";
import { escapeHTML, formatDate } from "./utils";

const BASE_URL = import.meta.env.BASE_URL;

function popupShell(title: string, bodyHtml: string) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    alert("Sila benarkan pop-up pada pelayar untuk mencetak borang.");
    return;
  }
  win.document.write(`
    <!doctype html><html lang="ms"><head><meta charset="utf-8" />
    <title>${escapeHTML(title)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #0f172a; padding: 32px; max-width: 800px; margin: 0 auto; }
      .letterhead { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px; }
      .letterhead img { width: 56px; height: 56px; object-fit: contain; }
      .letterhead h1 { font-size: 15px; margin: 0; }
      .letterhead p { font-size: 11px; margin: 2px 0 0; color: #475569; }
      .form-title { text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin: 16px 0 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      td, th { border: 1px solid #94a3b8; padding: 6px 8px; font-size: 12px; vertical-align: top; }
      th { background: #f1f5f9; text-align: left; width: 34%; }
      .section-title { font-weight: bold; font-size: 12px; background: #1e293b; color: white; padding: 5px 8px; margin-top: 18px; }
      .sig-row { display: flex; gap: 24px; margin-top: 30px; }
      .sig-box { flex: 1; text-align: center; }
      .sig-line { border-top: 1px solid #0f172a; margin-top: 40px; padding-top: 4px; font-size: 11px; }
      @media print { body { padding: 12px; } }
    </style></head><body>
      <div class="letterhead">
        <img src="${window.location.origin}${BASE_URL}logo-jpv.png" />
        <div>
          <h1>JABATAN PERKHIDMATAN VETERINAR MALAYSIA</h1>
          <p>Seksyen Biokimia, Institut Penyelidikan Veterinar (VRI) Ipoh</p>
        </div>
      </div>
      ${bodyHtml}
      <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
    </body></html>`);
  win.document.close();
}

function assetInfoRows(asset: Asset | undefined) {
  if (!asset) return "";
  return `
    <tr><th>No. Siri Pendaftaran</th><td>${escapeHTML(asset.registration_no || "-")}</td></tr>
    <tr><th>Keterangan Aset</th><td>${escapeHTML(asset.description)}</td></tr>`;
}

export function printMovementForm(m: Movement) {
  const asset = STATE.data.assets.find((a) => a.id === m.asset_id);
  const body = `
    <div class="form-title">BORANG PERMOHONAN PERGERAKAN / PINJAMAN ASET ALIH<br/><span style="font-weight:normal;font-size:11px;">(Rujukan Ringkas: KEW.PA-9)</span></div>
    <table>
      ${assetInfoRows(asset)}
      <tr><th>Nama Pemohon</th><td>${escapeHTML(m.applicant_name || "-")}</td></tr>
      <tr><th>Jawatan</th><td>${escapeHTML(m.applicant_position || "-")}</td></tr>
      <tr><th>Bahagian</th><td>${escapeHTML(m.division || "-")}</td></tr>
      <tr><th>Tujuan</th><td>${escapeHTML(m.purpose)}</td></tr>
      <tr><th>Tempat Digunakan</th><td>${escapeHTML(m.used_at || "-")}</td></tr>
      <tr><th>Nama Pengeluar</th><td>${escapeHTML(m.issuer_name || "-")}</td></tr>
      <tr><th>Lokasi Asal &rarr; Baharu</th><td>${escapeHTML(getLocationName(m.from_location_id))} &rarr; ${escapeHTML(getLocationName(m.to_location_id))}</td></tr>
      <tr><th>Peminjam</th><td>${escapeHTML(m.borrower_name || "-")}</td></tr>
      <tr><th>Tarikh Keluar</th><td>${formatDate(m.out_date)}</td></tr>
      <tr><th>Tarikh Dijangka Pulang</th><td>${formatDate(m.expected_return_date)}</td></tr>
      <tr><th>Tarikh Pulang Sebenar</th><td>${formatDate(m.actual_return_date)}</td></tr>
      <tr><th>Status Pergerakan</th><td>${escapeHTML(m.status)}</td></tr>
    </table>
    <div class="section-title">KELULUSAN</div>
    <table>
      <tr><th>Status Kelulusan</th><td>${escapeHTML(m.approval_status)}</td></tr>
      <tr><th>Tarikh Kelulusan</th><td>${formatDate(m.approved_date)}</td></tr>
    </table>
    <div class="sig-row">
      <div class="sig-box"><div class="sig-line">Pelulus<br/>${escapeHTML(m.approved_by_name || "")}<br/>${escapeHTML(m.approved_by_position || "")}</div></div>
      <div class="sig-box"><div class="sig-line">Penerima<br/>${escapeHTML(m.received_by_name || "")}<br/>${escapeHTML(m.received_by_position || "")}</div></div>
    </div>`;
  popupShell("Borang Pergerakan Aset", body);
}

export function printMaintenanceForm(m: MaintenanceRecord) {
  const asset = STATE.data.assets.find((a) => a.id === m.asset_id);
  const body = `
    <div class="form-title">REKOD PENYELENGGARAAN ASET ALIH<br/><span style="font-weight:normal;font-size:11px;">(Rujukan Ringkas: KEW.PA-15)</span></div>
    <table>
      ${assetInfoRows(asset)}
      <tr><th>Jenis Penyelenggaraan</th><td>${escapeHTML(m.type)}</td></tr>
      <tr><th>Butir-butir Kerja</th><td>${escapeHTML(m.notes || "-")}</td></tr>
      <tr><th>No. Pesanan Kerajaan / Kontrak</th><td>${escapeHTML(m.work_order_no || "-")}</td></tr>
      <tr><th>Nama Syarikat / Jabatan Menyelenggara</th><td>${escapeHTML(m.vendor || "-")}</td></tr>
      <tr><th>Tarikh Mula</th><td>${formatDate(m.start_date)}</td></tr>
      <tr><th>Tarikh Selesai</th><td>${formatDate(m.end_date)}</td></tr>
      <tr><th>Kos (RM)</th><td>${m.cost != null ? Number(m.cost).toFixed(2) : "-"}</td></tr>
      <tr><th>Status</th><td>${escapeHTML(m.status)}</td></tr>
    </table>
    <div class="sig-row">
      <div class="sig-box"><div class="sig-line">Disahkan oleh<br/>${escapeHTML(m.confirmed_by_name || "")}<br/>${escapeHTML(m.confirmed_by_position || "")}</div></div>
    </div>`;
  popupShell("Rekod Penyelenggaraan Aset", body);
}
