import type { Movement, MaintenanceRecord, DamageRecord } from "./types";
import { STATE } from "./state";
import { getLocationName, getCategoryName } from "./data";
import { escapeHTML, formatDate } from "./utils";


function popupShell(title: string, formCode: string, bodyHtml: string) {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) {
    alert("Sila benarkan pop-up pada pelayar untuk mencetak borang.");
    return;
  }
  win.document.write(`
    <!doctype html><html lang="ms"><head><meta charset="utf-8" />
    <title>${escapeHTML(title)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000; padding: 28px; max-width: 800px; margin: 0 auto; }
      .top-ref { text-align: right; font-size: 11px; }
      .top-ref .code { font-weight: bold; font-size: 13px; }
      .form-title { text-align: center; font-weight: bold; font-size: 14px; margin: 14px 0 18px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
      td, th { border: 1px solid #000; padding: 5px 7px; font-size: 11px; vertical-align: top; }
      th { background: #f1f1f1; text-align: left; font-weight: bold; }
      .header-table td { border: none; padding: 3px 4px; font-size: 12px; }
      .header-table .lbl { font-weight: bold; width: 130px; }
      .section-hdr { font-weight: bold; font-size: 12px; margin: 16px 0 6px; }
      .sig-row { display: flex; gap: 18px; margin-top: 28px; flex-wrap: wrap; }
      .sig-box { flex: 1; min-width: 160px; font-size: 11px; }
      .sig-dots { margin-bottom: 4px; }
      .sig-line { margin: 2px 0; }
      .nota { font-size: 10px; margin-top: 20px; border-top: 1px solid #999; padding-top: 8px; }
      .nota p { margin: 3px 0; }
      @media print { body { padding: 10px; } }
    </style></head><body>
      <div class="top-ref">
        Pekeliling Perbendaharaan Malaysia AM 2.4 Lampiran A<br/>
        <span class="code">${escapeHTML(formCode)}</span>
      </div>
      ${bodyHtml}
      <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
    </body></html>`);
  win.document.close();
}

function lulusText(status: string): string {
  if (status === "Diluluskan") return "Lulus";
  if (status === "Tidak Diluluskan") return "Tidak Lulus";
  return "-";
}

// ============================================================
// KEW.PA-9 - Borang Permohonan Pergerakan/Pinjaman Aset Alih
// ============================================================
export function printMovementForm(m: Movement) {
  const asset = STATE.data.assets.find((a) => a.id === m.asset_id);
  const body = `
    <div style="text-align:right;font-size:11px;">No. Permohonan : ${m.application_no ?? "-"}</div>
    <div class="form-title">BORANG PERMOHONAN PERGERAKAN/ PINJAMAN ASET ALIH</div>
    <table class="header-table">
      <tr><td class="lbl">Nama Pemohon :</td><td>${escapeHTML(m.applicant_name || "")}</td><td class="lbl">Tujuan :</td><td>${escapeHTML(m.purpose || "")}</td></tr>
      <tr><td class="lbl">Jawatan :</td><td>${escapeHTML(m.applicant_position || "")}</td><td class="lbl">Tempat Digunakan:</td><td>${escapeHTML(m.used_at || "")}</td></tr>
      <tr><td class="lbl">Bahagian :</td><td>${escapeHTML(m.division || "")}</td><td class="lbl">Nama Pengeluar:</td><td>${escapeHTML(m.issuer_name || "")}</td></tr>
    </table>
    <table>
      <thead>
        <tr>
          <th rowspan="2">Bil.</th>
          <th rowspan="2">No. Siri<br/>Pendaftaran</th>
          <th rowspan="2">Keterangan Aset</th>
          <th colspan="2">Tarikh</th>
          <th rowspan="2">(Lulus/<br/>Tidak Lulus)</th>
          <th colspan="2">Tarikh</th>
          <th rowspan="2">Catatan</th>
        </tr>
        <tr>
          <th>Dipinjam</th><th>Dijangka Pulang</th>
          <th>Dipulangkan</th><th>Diterima</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>${escapeHTML(asset?.registration_no || "-")}</td>
          <td>${escapeHTML(asset?.description || "-")}</td>
          <td>${formatDate(m.out_date)}</td>
          <td>${formatDate(m.expected_return_date)}</td>
          <td>${lulusText(m.approval_status)}</td>
          <td>${formatDate(m.actual_return_date)}</td>
          <td>${formatDate(m.received_date)}</td>
          <td>${escapeHTML(m.notes || "")}</td>
        </tr>
      </tbody>
    </table>
    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-dots">....................................</div>
        (Tandatangan Peminjam)
        <div class="sig-line">Nama : ${escapeHTML(m.borrower_name || "")}</div>
        <div class="sig-line">Jawatan : ${escapeHTML(m.borrower_position || "")}</div>
        <div class="sig-line">Tarikh : ${formatDate(m.out_date)}</div>
      </div>
      <div class="sig-box">
        <div class="sig-dots">....................................</div>
        (Tandatangan Pelulus)
        <div class="sig-line">Nama : ${escapeHTML(m.approved_by_name || "")}</div>
        <div class="sig-line">Jawatan : ${escapeHTML(m.approved_by_position || "")}</div>
        <div class="sig-line">Tarikh : ${formatDate(m.approved_date)}</div>
      </div>
      <div class="sig-box">
        <div class="sig-dots">....................................</div>
        (Tandatangan Pemulang)
        <div class="sig-line">Nama : ${escapeHTML(m.returner_name || "")}</div>
        <div class="sig-line">Jawatan : ${escapeHTML(m.returner_position || "")}</div>
        <div class="sig-line">Tarikh : ${formatDate(m.actual_return_date)}</div>
      </div>
      <div class="sig-box">
        <div class="sig-dots">....................................</div>
        (Tandatangan Penerima)
        <div class="sig-line">Nama : ${escapeHTML(m.received_by_name || "")}</div>
        <div class="sig-line">Jawatan : ${escapeHTML(m.received_by_position || "")}</div>
        <div class="sig-line">Tarikh : ${formatDate(m.received_date)}</div>
      </div>
    </div>`;
  popupShell("Borang KEW.PA-9", "KEW.PA-9", body);
}

// ============================================================
// KEW.PA-15 - Rekod Penyelenggaraan Aset Alih
// ============================================================
export function printMaintenanceForm(m: MaintenanceRecord) {
  const asset = STATE.data.assets.find((a) => a.id === m.asset_id);
  const body = `
    <div class="form-title">REKOD PENYELENGGARAAN ASET ALIH</div>
    <table class="header-table">
      <tr><td class="lbl">Sub Kategori :</td><td>${escapeHTML(asset ? getCategoryName(asset.category_id) : "")}</td><td class="lbl">No. Siri Pendaftaran :</td><td>${escapeHTML(asset?.registration_no || "")}</td></tr>
      <tr><td class="lbl">Jenis :</td><td>-</td><td class="lbl">Lokasi :</td><td>${escapeHTML(asset ? getLocationName(asset.location_id) : "")}</td></tr>
    </table>
    <table>
      <thead>
        <tr>
          <th>(a)<br/>Tarikh</th>
          <th>(b)<br/>Jenis Penyelenggaraan</th>
          <th>(c)<br/>Butir-butir Kerja</th>
          <th>(d)<br/>No. Pesanan Kerajaan<br/>No. Kontrak dan Tarikh</th>
          <th>(e)<br/>Nama Syarikat/ Jabatan<br/>yang Menyelenggara</th>
          <th>(f)<br/>Kos<br/>(RM)</th>
          <th>(g)<br/>Nama dan<br/>Jawatan</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${formatDate(m.start_date)}</td>
          <td>${escapeHTML(m.type)}</td>
          <td>${escapeHTML(m.notes || "")}</td>
          <td>${escapeHTML(m.work_order_no || "")}</td>
          <td>${escapeHTML(m.vendor || "")}</td>
          <td>${m.cost != null ? Number(m.cost).toFixed(2) : ""}</td>
          <td>${escapeHTML([m.confirmed_by_name, m.confirmed_by_position].filter(Boolean).join(" / "))}</td>
        </tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
    <div class="nota">
      <b>Nota :</b>
      <p>a) Tarikh pembaikan/ penyelenggaraan yang telah dilakukan bagi Aset Alih berkenaan.</p>
      <p>b) Jenis Penyelenggaraan &mdash; Penyelenggaraan Pencegahan atau Penyelenggaraan Pembaikan</p>
      <p>c) Butir-butir kerja &mdash; Keterangan mengenai kerja-kerja pembaikan termasuk alat ganti yang dibeli.</p>
      <p>d) No. Pesanan Kerajaan/ No. Kontrak dan Tarikh &mdash; No. Rujukan Pesanan Kerajaan/ Nombor Kontrak berserta tarikh.</p>
      <p>e) Nama Syarikat/Jabatan yang menyelenggara &mdash; Nama syarikat atau Jabatan yang melaksanakan kerja-kerja penyelenggaraan.</p>
      <p>f) Kos &mdash; Kos alat ganti atau kos pembaikan atau kedua-duanya sekali.</p>
      <p>g) Nama dan Jawatan &mdash; Pegawai yang mengesahkan penyelenggaraan telah dilaksanakan.</p>
    </div>`;
  popupShell("Borang KEW.PA-15", "KEW.PA 15", body);
}

// ============================================================
// KEW.PA-10 - Borang Aduan Kerosakan Aset Alih
// ============================================================
export function printDamageForm(d: DamageRecord) {
  const asset = STATE.data.assets.find((a) => a.id === d.asset_id);
  const priorMaintenanceCost = asset
    ? STATE.data.maintenance.filter((r) => r.asset_id === asset.id).reduce((sum, r) => sum + Number(r.cost || 0), 0)
    : 0;

  const body = `
    <div class="form-title">BORANG ADUAN KEROSAKAN ASET ALIH</div>

    <div class="section-hdr">Bahagian I (Untuk diisi oleh Pengadu)</div>
    <table class="header-table">
      <tr><td class="lbl">1. Jenis Aset :</td><td colspan="3">${escapeHTML(asset ? getCategoryName(asset.category_id) : "")}</td></tr>
      <tr><td class="lbl">2. Nombor Siri Pendaftaran/<br/>Komponen :</td><td colspan="3">${escapeHTML(asset?.registration_no || "")}</td></tr>
      <tr><td class="lbl">3. Pengguna Terakhir :</td><td colspan="3">${escapeHTML(d.last_user || "")}</td></tr>
      <tr><td class="lbl">4. Tarikh Kerosakan :</td><td colspan="3">${formatDate(d.report_date)}</td></tr>
      <tr><td class="lbl">5. Perihal Kerosakan :</td><td colspan="3">${escapeHTML(d.notes || d.damage_type || "")}</td></tr>
      <tr><td class="lbl">6. Nama Dan Jawatan :</td><td colspan="3">${escapeHTML([d.reporter_name, d.reporter_position].filter(Boolean).join(" / "))}</td></tr>
      <tr><td class="lbl">7. Tarikh :</td><td colspan="3">${formatDate(d.report_date)}</td></tr>
    </table>

    <div class="section-hdr">Bahagian II (Untuk diisi oleh Pegawai Aset/Pegawai Teknikal)</div>
    <table class="header-table">
      <tr><td class="lbl">8. Jumlah Kos Penyelenggaraan<br/>Terdahulu :</td><td colspan="3">RM ${priorMaintenanceCost.toFixed(2)}</td></tr>
      <tr><td class="lbl">9. Anggaran Kos<br/>Penyelenggaraan :</td><td colspan="3">${d.repair_cost != null ? "RM " + Number(d.repair_cost).toFixed(2) : ""}</td></tr>
      <tr><td class="lbl">10. Syor Dan Ulasan :</td><td colspan="3">${escapeHTML(d.technical_notes || "")}</td></tr>
      <tr><td class="lbl">11. Nama Dan Jawatan :</td><td colspan="3">${escapeHTML([d.technical_officer_name, d.technical_officer_position].filter(Boolean).join(" / "))}</td></tr>
      <tr><td class="lbl">12. Tarikh :</td><td colspan="3">${formatDate(d.technical_officer_date)}</td></tr>
    </table>

    <div class="section-hdr">Bahagian III (Keputusan Ketua Jabatan/Bahagian/Seksyen/Unit)</div>
    <p style="font-size:12px;font-weight:bold;">${d.decision_status === "Belum Diputuskan" ? "Diluluskan/Tidak Diluluskan*" : escapeHTML(d.decision_status)}</p>
    <p style="font-size:12px;">Ulasan: ${escapeHTML(d.decision_notes || "")}</p>
    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-dots">....................................</div>
        (Tandatangan)
        <div class="sig-line">Nama : ${escapeHTML(d.decision_by_name || "")}</div>
        <div class="sig-line">Jawatan : ${escapeHTML(d.decision_by_position || "")}</div>
        <div class="sig-line">Tarikh : ${formatDate(d.decision_date)}</div>
      </div>
    </div>
    <div class="nota"><p>Nota: *Potong mana yang tidak berkenaan</p></div>`;
  popupShell("Borang KEW.PA-10", "KEW.PA-10", body);
}
