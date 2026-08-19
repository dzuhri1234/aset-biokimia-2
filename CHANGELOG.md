# Changelog

## v1.3.0 — Muat Turun Word (.docx) Boleh Sunting (Ogos 2026)

### Ditambah
- Butang **"Muat Turun Word (.docx)"** ditambah pada paparan Lihat bagi Pergerakan (KEW.PA-9), Penyelenggaraan (KEW.PA-15) dan Kerosakan (KEW.PA-10) - menjana fail .docx sebenar (bukan PDF) yang boleh terus dibuka dan disunting dalam Microsoft Word, dengan semua medan auto-isi daripada data transaksi/aset (sama seperti versi cetak pelayar).
- Fail Word turut menyertakan logo Jabatan Perkhidmatan Veterinar Malaysia di bahagian atas.
- Library penjanaan Word (`docx`) dimuat secara "lazy" (hanya bila butang diklik) supaya saiz muat turun awal sistem tidak terjejas untuk pengguna yang tidak menggunakan ciri ini.

## v1.2.0 — Borang Rasmi KEW.PA-9/10/15 Replika Tepat (Ogos 2026)

### Ditambah
- Borang cetak Pergerakan (KEW.PA-9), Penyelenggaraan (KEW.PA-15) dan Kerosakan (KEW.PA-10) dibina semula supaya **mengikut struktur borang rasmi sebenar** - susunan lajur, jadual bertingkat (Tarikh Dipinjam/Dijangka Pulang, Dipulangkan/Diterima), 4 blok tandatangan KEW.PA-9, seksyen Nota (a)-(g) KEW.PA-15, dan struktur 3 Bahagian (Pengadu / Pegawai Teknikal / Keputusan Ketua Jabatan) KEW.PA-10.
- Modul Kerosakan diperluas dengan medan penuh KEW.PA-10: Pengguna Terakhir, Nama/Jawatan Pengadu, Nama/Jawatan/Tarikh Pegawai Teknikal, Syor & Ulasan, dan Keputusan Ketua Jabatan (Diluluskan/Tidak Diluluskan) berserta tandatangan.
- Modul Pergerakan: No. Permohonan dijana automatik secara berjujukan; medan Jawatan Peminjam dan Nama/Jawatan Pemulang ditambah untuk lengkapkan 4 blok tandatangan KEW.PA-9.
- "Jumlah Kos Penyelenggaraan Terdahulu" pada borang KEW.PA-10 dikira **automatik** daripada jumlah kos semua rekod penyelenggaraan aset berkenaan - tidak perlu ditaip manual.

### Had Diketahui
- Medan "Jenis" pada KEW.PA-15 (jenis/model peralatan) tiada dalam struktur data aset semasa - dipaparkan kosong pada cetakan. Boleh ditambah pada kemaskini akan datang jika diperlukan.
- Rekod Pergerakan kekal 1 aset = 1 rekod (lihat nota v1.1.0).

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
