# Changelog

## v1.0.0 — Pembinaan Semula Penuh (2026)

Pembinaan semula sepenuhnya daripada versi HTML tunggal terdahulu.

### Ditambah
- Seni bina projek Vite + TypeScript + Panda CSS (menggantikan HTML/Tailwind tunggal).
- Skema pangkalan data relational penuh dengan modul transaksi berasingan
  (movements, maintenance, damage, inspections, disposals) yang semuanya
  dikaitkan kepada `assets.id` — tiada duplicate data aset.
- Profil Aset dengan garis masa aktiviti kronologi automatik.
- Kebenaran per-modul, per-pengguna (edit / baca sahaja / tiada akses),
  ditetapkan oleh Admin.
- Dasar Row Level Security (RLS) penuh untuk setiap jadual — kawalan
  keselamatan sebenar kini berada di peringkat pangkalan data.
- Edge Functions (`admin-create-user`, `admin-reset-password`,
  `admin-set-active`) yang mengesahkan peranan pemanggil di sisi pelayan
  sebelum membenarkan tindakan pentadbiran — menutup jurang "privilege
  escalation" yang dikenal pasti dalam audit versi sebelum ini.
- Jejak audit automatik melalui trigger pangkalan data (bukan kod klien).
- Pagination pada Senarai Aset Penuh.
- Eksport CSV dengan perlindungan formula-injection (`=`, `+`, `-`, `@`).
- GitHub Actions workflow untuk deploy automatik ke GitHub Pages.

### Diketahui Belum Selesai
Lihat bahagian "Had Yang Diketahui" dalam `README.md`.
