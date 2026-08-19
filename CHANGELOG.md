# Changelog

## v1.1.0 — Kemaskini Reka Bentuk & Borang Rasmi (Ogos 2026)

### Ditambah
- Login page dibina semula: logo Jabatan Perkhidmatan Veterinar Malaysia, latar belakang bertema, borang di kanan, pautan "Lupa Kata Laluan" (aliran set-semula kata laluan penuh).
- Dashboard: widget notifikasi "Menunggu Tindakan Admin" (pergerakan/kerosakan/pelupusan yang belum ditukar status), kad KPI dan carta status boleh diklik untuk terus ke senarai aset ditapis.
- Senarai Aset Penuh: lajur No. Unik disembunyikan (kekal sebagai ID dalaman), filter Lokasi ditambah.
- Profil Aset: No. Pendaftaran menggantikan No. Unik sebagai label utama, No. Unik disembunyikan; sejarah aktiviti diasingkan kepada 5 kotak berasingan (Penyelenggaraan, Pergerakan & Pinjaman, Kerosakan & Pembaikan, Pelupusan, Pemeriksaan); ruang gambar aset; butang "Kembali" dan "Cetak Profil".
- No. Unik ID kini **dijana automatik** oleh pangkalan data (BIO-0001, BIO-0002, ...) - tidak lagi boleh/perlu ditaip oleh pengguna.
- Kod Penempatan kini **milik Lokasi** (bukan aset secara berasingan) - auto-terisi & terkunci mengikut Tempat Penempatan yang dipilih.
- Muat naik gambar aset (Supabase Storage) pada borang Daftar/Kemaskini Aset.
- Modul Pergerakan & Pinjaman: medan diselaraskan dengan borang rasmi KEW.PA-9 (nama pemohon, jawatan, bahagian, tempat digunakan, nama pengeluar, status kelulusan, tandatangan pelulus/penerima); butang Lihat/Edit; butang Cetak Borang bergaya KEW.PA-9.
- Modul Penyelenggaraan: medan diselaraskan dengan borang rasmi KEW.PA-15 (jenis, no. pesanan/kontrak, pegawai mengesahkan); filter status; butang Lihat/Edit; butang Cetak Borang bergaya KEW.PA-15.
- Modul Kerosakan & Pelupusan: butang Lihat/Edit ditambah.
- Semua borang transaksi: medan pilih Aset ditukar daripada dropdown 440+ pilihan kepada **kotak carian** (search-as-you-type).
- Lokasi/Kategori/Personnel: butang Edit ditambah.
- Pusat Laporan: opsyen "Cetak / PDF" ditambah (selain CSV sedia ada) - guna ciri cetak pelayar dengan letterhead JPV.

### Nota Reka Bentuk
- Rekod Pergerakan kekal **1 aset = 1 rekod** (bukan 1 permohonan pelbagai aset seperti templat KEW.PA-9 asal). Borang cetak memaparkan 1 aset setiap cetakan.
- Cetakan borang & laporan guna ciri "Print to PDF" pelayar, bukan replika pixel-perfect templat DOCX rasmi.
- Tiada sistem kelulusan berbilang langkah - Admin menukar status terus (sila rujuk `sql/05_kemaskini_v2.sql` untuk butiran).

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
