import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel, VerticalAlign, ImageRun,
} from "docx";
import type { Movement, MaintenanceRecord, DamageRecord } from "./types";
import { STATE } from "./state";
import { getLocationName, getCategoryName } from "./data";
import { formatDate } from "./utils";

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function cell(text: string, opts: { bold?: boolean; shaded?: boolean; width?: number; colSpan?: number; rowSpan?: number } = {}) {
  return new TableCell({
    borders: CELL_BORDERS,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    columnSpan: opts.colSpan,
    rowSpan: opts.rowSpan,
    shading: opts.shaded ? { fill: "F1F1F1" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: !!opts.bold, size: 18 })] })],
  });
}

function labelValueRow(label: string, value: string, label2?: string, value2?: string) {
  const cells = [cell(label, { bold: true, width: 2200 }), cell(value, { width: 2900 })];
  if (label2 !== undefined) {
    cells.push(cell(label2, { bold: true, width: 2200 }), cell(value2 || "", { width: 2900 }));
  }
  return new TableRow({ children: cells });
}

async function loadLogoBuffer(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`${window.location.origin}${import.meta.env.BASE_URL}logo-jpv.png`);
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function sanitizeFilename(s: string): string {
  return s.replace(/[\\/:*?"<>|]+/g, "-");
}

function saveDoc(doc: Document, filename: string) {
  Packer.toBlob(doc).then((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = sanitizeFilename(filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function letterheadParagraphs(logo: ArrayBuffer | null): Paragraph[] {
  const parts: Paragraph[] = [];
  if (logo) {
    parts.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new ImageRun({ data: logo, transformation: { width: 40, height: 40 }, type: "png" })],
    }));
  }
  parts.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: "Pekeliling Perbendaharaan Malaysia AM 2.4 Lampiran A", size: 16, italics: true })],
  }));
  return parts;
}

function lulusText(status: string): string {
  if (status === "Diluluskan") return "Lulus";
  if (status === "Tidak Diluluskan") return "Tidak Lulus";
  return "-";
}

// ============================================================
// KEW.PA-9
// ============================================================
export async function downloadMovementDocx(m: Movement) {
  const asset = STATE.data.assets.find((a) => a.id === m.asset_id);
  const logo = await loadLogoBuffer();

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...letterheadParagraphs(logo),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "KEW.PA-9", bold: true, size: 22 })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `No. Permohonan : ${m.application_no ?? "-"}`, size: 18 })] }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "BORANG PERMOHONAN PERGERAKAN/ PINJAMAN ASET ALIH", bold: true, size: 24 })],
        }),
        new Table({
          width: { size: 10200, type: WidthType.DXA },
          rows: [
            labelValueRow("Nama Pemohon :", m.applicant_name || "", "Tujuan :", m.purpose || ""),
            labelValueRow("Jawatan :", m.applicant_position || "", "Tempat Digunakan :", m.used_at || ""),
            labelValueRow("Bahagian :", m.division || "", "Nama Pengeluar :", m.issuer_name || ""),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 100 } }),
        new Table({
          width: { size: 10200, type: WidthType.DXA },
          rows: [
            new TableRow({ children: [
              cell("Bil.", { bold: true, shaded: true, width: 500 }),
              cell("No. Siri Pendaftaran", { bold: true, shaded: true, width: 1600 }),
              cell("Keterangan Aset", { bold: true, shaded: true, width: 1800 }),
              cell("Tarikh Dipinjam", { bold: true, shaded: true, width: 1100 }),
              cell("Tarikh Dijangka Pulang", { bold: true, shaded: true, width: 1100 }),
              cell("(Lulus/Tidak Lulus)", { bold: true, shaded: true, width: 1000 }),
              cell("Tarikh Dipulangkan", { bold: true, shaded: true, width: 1100 }),
              cell("Tarikh Diterima", { bold: true, shaded: true, width: 1000 }),
              cell("Catatan", { bold: true, shaded: true, width: 1000 }),
            ] }),
            new TableRow({ children: [
              cell("1", { width: 500 }),
              cell(asset?.registration_no || "-", { width: 1600 }),
              cell(asset?.description || "-", { width: 1800 }),
              cell(formatDate(m.out_date), { width: 1100 }),
              cell(formatDate(m.expected_return_date), { width: 1100 }),
              cell(lulusText(m.approval_status), { width: 1000 }),
              cell(formatDate(m.actual_return_date), { width: 1100 }),
              cell(formatDate(m.received_date), { width: 1000 }),
              cell(m.notes || "", { width: 1000 }),
            ] }),
          ],
        }),
        new Paragraph({ text: "", spacing: { before: 400 } }),
        ...signatureBlock("Peminjam", m.borrower_name, m.borrower_position, formatDate(m.out_date)),
        ...signatureBlock("Pelulus", m.approved_by_name, m.approved_by_position, formatDate(m.approved_date)),
        ...signatureBlock("Pemulang", m.returner_name, m.returner_position, formatDate(m.actual_return_date)),
        ...signatureBlock("Penerima", m.received_by_name, m.received_by_position, formatDate(m.received_date)),
      ],
    }],
  });

  saveDoc(doc, `KEW.PA-9_${asset?.registration_no || asset?.unique_id || "aset"}.docx`);
}

function signatureBlock(role: string, name: string | null, position: string | null, date: string): Paragraph[] {
  const label = role ? `(Tandatangan ${role})` : "(Tandatangan)";
  return [
    new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: "…………………………………….", size: 18 })] }),
    new Paragraph({ children: [new TextRun({ text: label, size: 18 })] }),
    new Paragraph({ children: [new TextRun({ text: `Nama : ${name || ""}`, size: 18 })] }),
    new Paragraph({ children: [new TextRun({ text: `Jawatan : ${position || ""}`, size: 18 })] }),
    new Paragraph({ children: [new TextRun({ text: `Tarikh : ${date}`, size: 18 })] }),
  ];
}

// ============================================================
// KEW.PA-15
// ============================================================
export async function downloadMaintenanceDocx(m: MaintenanceRecord) {
  const asset = STATE.data.assets.find((a) => a.id === m.asset_id);
  const logo = await loadLogoBuffer();

  const notaLines = [
    "a) Tarikh pembaikan/ penyelenggaraan yang telah dilakukan bagi Aset Alih berkenaan.",
    "b) Jenis Penyelenggaraan — Penyelenggaraan Pencegahan atau Penyelenggaraan Pembaikan",
    "c) Butir-butir kerja — Keterangan mengenai kerja-kerja pembaikan termasuk alat ganti yang dibeli.",
    "d) No. Pesanan Kerajaan/ No. Kontrak dan Tarikh — No. Rujukan Pesanan Kerajaan/ Nombor Kontrak berserta tarikh.",
    "e) Nama Syarikat/Jabatan yang menyelenggara — Nama syarikat atau Jabatan yang melaksanakan kerja-kerja penyelenggaraan.",
    "f) Kos — Kos alat ganti atau kos pembaikan atau kedua-duanya sekali.",
    "g) Nama dan Jawatan — Pegawai yang mengesahkan penyelenggaraan telah dilaksanakan.",
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...letterheadParagraphs(logo),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "KEW.PA 15", bold: true, size: 22 })] }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "REKOD PENYELENGGARAAN ASET ALIH", bold: true, size: 24 })],
        }),
        new Table({
          width: { size: 10200, type: WidthType.DXA },
          rows: [
            labelValueRow("Sub Kategori :", asset ? getCategoryName(asset.category_id) : "", "No. Siri Pendaftaran :", asset?.registration_no || ""),
            labelValueRow("Jenis :", "-", "Lokasi :", asset ? getLocationName(asset.location_id) : ""),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 100 } }),
        new Table({
          width: { size: 10200, type: WidthType.DXA },
          rows: [
            new TableRow({ children: [
              cell("(a) Tarikh", { bold: true, shaded: true, width: 1000 }),
              cell("(b) Jenis Penyelenggaraan", { bold: true, shaded: true, width: 1400 }),
              cell("(c) Butir-butir Kerja", { bold: true, shaded: true, width: 1800 }),
              cell("(d) No. Pesanan Kerajaan/No. Kontrak dan Tarikh", { bold: true, shaded: true, width: 1600 }),
              cell("(e) Nama Syarikat/Jabatan yang Menyelenggara", { bold: true, shaded: true, width: 1600 }),
              cell("(f) Kos (RM)", { bold: true, shaded: true, width: 900 }),
              cell("(g) Nama dan Jawatan", { bold: true, shaded: true, width: 1600 }),
            ] }),
            new TableRow({ children: [
              cell(formatDate(m.start_date), { width: 1000 }),
              cell(m.type, { width: 1400 }),
              cell(m.notes || "", { width: 1800 }),
              cell(m.work_order_no || "", { width: 1600 }),
              cell(m.vendor || "", { width: 1600 }),
              cell(m.cost != null ? Number(m.cost).toFixed(2) : "", { width: 900 }),
              cell([m.confirmed_by_name, m.confirmed_by_position].filter(Boolean).join(" / "), { width: 1600 }),
            ] }),
          ],
        }),
        new Paragraph({ text: "", spacing: { before: 300 } }),
        new Paragraph({ children: [new TextRun({ text: "Nota :", bold: true, size: 18 })] }),
        ...notaLines.map((l) => new Paragraph({ children: [new TextRun({ text: l, size: 16 })] })),
      ],
    }],
  });

  saveDoc(doc, `KEW.PA-15_${asset?.registration_no || asset?.unique_id || "aset"}.docx`);
}

// ============================================================
// KEW.PA-10
// ============================================================
export async function downloadDamageDocx(d: DamageRecord) {
  const asset = STATE.data.assets.find((a) => a.id === d.asset_id);
  const priorMaintenanceCost = asset
    ? STATE.data.maintenance.filter((r) => r.asset_id === asset.id).reduce((sum, r) => sum + Number(r.cost || 0), 0)
    : 0;
  const logo = await loadLogoBuffer();

  const infoTable = (rows: [string, string][]) => new Table({
    width: { size: 10200, type: WidthType.DXA },
    rows: rows.map(([label, value]) => new TableRow({ children: [cell(label, { bold: true, width: 3200 }), cell(value, { width: 7000 })] })),
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...letterheadParagraphs(logo),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "KEW.PA-10", bold: true, size: 22 })] }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "BORANG ADUAN KEROSAKAN ASET ALIH", bold: true, size: 24 })],
        }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Bahagian I (Untuk diisi oleh Pengadu)", bold: true, size: 20 })] }),
        infoTable([
          ["1. Jenis Aset :", asset ? getCategoryName(asset.category_id) : ""],
          ["2. Nombor Siri Pendaftaran/Komponen :", asset?.registration_no || ""],
          ["3. Pengguna Terakhir :", d.last_user || ""],
          ["4. Tarikh Kerosakan :", formatDate(d.report_date)],
          ["5. Perihal Kerosakan :", d.notes || d.damage_type || ""],
          ["6. Nama Dan Jawatan :", [d.reporter_name, d.reporter_position].filter(Boolean).join(" / ")],
          ["7. Tarikh :", formatDate(d.report_date)],
        ]),
        new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "Bahagian II (Untuk diisi oleh Pegawai Aset/Pegawai Teknikal)", bold: true, size: 20 })] }),
        infoTable([
          ["8. Jumlah Kos Penyelenggaraan Terdahulu :", `RM ${priorMaintenanceCost.toFixed(2)}`],
          ["9. Anggaran Kos Penyelenggaraan :", d.repair_cost != null ? `RM ${Number(d.repair_cost).toFixed(2)}` : ""],
          ["10. Syor Dan Ulasan :", d.technical_notes || ""],
          ["11. Nama Dan Jawatan :", [d.technical_officer_name, d.technical_officer_position].filter(Boolean).join(" / ")],
          ["12. Tarikh :", formatDate(d.technical_officer_date)],
        ]),
        new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "Bahagian III (Keputusan Ketua Jabatan/Bahagian/Seksyen/Unit)", bold: true, size: 20 })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: d.decision_status === "Belum Diputuskan" ? "Diluluskan/Tidak Diluluskan*" : d.decision_status, bold: true, size: 20 })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Ulasan: ${d.decision_notes || ""}`, size: 18 })] }),
        ...signatureBlock("", d.decision_by_name, d.decision_by_position, formatDate(d.decision_date)),
        new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: "Nota: *Potong mana yang tidak berkenaan", italics: true, size: 16 })] }),
      ],
    }],
  });

  saveDoc(doc, `KEW.PA-10_${asset?.registration_no || asset?.unique_id || "aset"}.docx`);
}
