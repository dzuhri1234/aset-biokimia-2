# Sistem Pengurusan Aset Alih — Seksyen Biokimia (VRI Ipoh)

Sistem pengurusan aset alih berasaskan web, dibina dengan:
- **Frontend:** Vite + TypeScript + [Panda CSS](https://panda-css.com)
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Edge Functions)
- **Hosting:** GitHub Pages (deploy automatik melalui GitHub Actions)

## Konsep Reka Bentuk

Satu **Asset ID unik** menjadi tulang belakang sistem. Setiap modul transaksi
(Pergerakan, Selenggara, Kerosakan, Pemeriksaan, Pelupusan) **hanya menyimpan
rekod transaksi** dan merujuk kepada aset melalui `asset_id` — tiada
data aset di-duplicate. Apabila **Profil Aset** dibuka, sistem
mengumpul semua rekod berkaitan secara automatik dan memaparkannya sebagai
satu **garis masa kronologi (chronological timeline)**.

Keselamatan sebenar sistem terletak pada **Row Level Security (RLS)**
di peringkat pangkalan data (`sql/02_rls_policies.sql`) — bukan pada
kod JavaScript di klien. Kod klien hanya menyembunyikan butang untuk
keselesaan pengguna; RLS-lah yang benar-benar menghalang tindakan
yang tidak dibenarkan.

## Struktur Projek

```
/
├── index.html
├── vite.config.ts
├── panda.config.ts                # tema warna & tokens Panda CSS
├── src/
│   ├── main.ts                    # render loop + event delegation + CRUD handlers
│   ├── styles.css                 # entri Panda CSS (@layer)
│   ├── lib/
│   │   ├── supabase.ts            # klien Supabase + pemanggil Edge Function
│   │   ├── auth.ts                # log masuk/keluar, muat profil & kebenaran
│   │   ├── data.ts                # fetch data + bina garis masa aset
│   │   ├── state.ts               # state global aplikasi
│   │   ├── types.ts               # jenis TypeScript
│   │   ├── utils.ts                # escapeHTML, CSV export (anti formula-injection), toast
│   │   └── ui.ts                  # resipi gaya (button, badge, kad, jadual) guna Panda CSS
│   └── views/                     # setiap fungsi render mengembalikan HTML string
│       ├── login.ts  shell.ts  dashboard.ts  assets.ts
│       ├── transactions.ts        # generik untuk 5 modul transaksi
│       ├── masterData.ts  reports.ts  users.ts  auditTrail.ts  modal.ts
├── sql/
│   ├── 01_schema.sql               # struktur jadual
│   ├── 02_rls_policies.sql         # dasar keselamatan (WAJIB dijalankan)
│   └── 03_triggers.sql             # audit log automatik + updated_at
├── supabase/functions/             # Edge Functions (Deno) - guna service role key
│   ├── admin-create-user/          # cipta pengguna (sahkan admin di sisi pelayan)
│   ├── admin-reset-password/
│   └── admin-set-active/
└── .github/workflows/deploy.yml    # build + deploy automatik ke GitHub Pages
```

## Kemaskini v1.2.0 (Ogos 2026) — Cara Pasang

1. **Jalankan SQL tambahan**: `sql/06_kemaskini_v3.sql` dalam SQL Editor Supabase (selamat, tidak memadam data).
2. **Gantikan fail projek**: sama seperti kemaskini v1.1.0 - salin semua fail dalam pakej ke atas folder projek sedia ada, commit & push melalui GitHub Desktop.

## Kemaskini v1.1.0 (Ogos 2026) — Cara Pasang

Jika anda sudah menjalankan sistem versi asal (v1.0.0), ikut langkah ini untuk naik taraf tanpa kehilangan data:

1. **Jalankan SQL tambahan**: dalam SQL Editor projek Supabase anda, jalankan `sql/05_kemaskini_v2.sql`. Fail ini **selamat** - ia hanya menambah lajur/jadual baharu, tidak memadam data sedia ada.
2. **Semak kod lokasi**: skrip di atas cuba teka Kod Penempatan setiap lokasi berdasarkan data lama. Pergi ke **Lokasi Penempatan** dalam sistem dan sahkan/betulkan kod bagi setiap lokasi (terutama mana-mana yang masih kosong atau berkongsi kod dengan lokasi lain).
3. **Gantikan fail projek**: salin SEMUA fail dalam pakej kemaskini ini ke atas folder projek sedia ada anda (folder yang disambungkan ke GitHub Desktop) - **timpa** fail lama. Jangan padam folder `.git` yang ada di dalamnya.
4. Dalam **GitHub Desktop**, semak senarai "Changes", commit, dan "Push origin" seperti biasa. GitHub Actions akan build & deploy semula secara automatik.

## Pemasangan (Setup)

### 1. Cipta projek Supabase
1. Daftar di [supabase.com](https://supabase.com) dan cipta projek baharu.
2. Dalam **SQL Editor**, jalankan fail dalam `sql/` **mengikut urutan nombor**:
   `01_schema.sql` → `02_rls_policies.sql` → `03_triggers.sql`.
3. Dapatkan `Project URL` dan `anon public key` daripada **Settings → API**.

### 2. Cipta Admin pertama (manual, sekali sahaja)
Edge Function `admin-create-user` memerlukan pemanggil yang **sudah** menjadi
Admin — jadi admin pertama mesti dicipta secara manual:
1. Supabase Dashboard → **Authentication → Users → Add user** (masukkan e-mel & kata laluan).
2. Salin `User UID` yang terhasil.
3. Dalam **SQL Editor**, jalankan:
   ```sql
   insert into profiles (id, email, name, role, is_active)
   values ('TAMPAL-USER-UID-DI-SINI', 'admin@contoh.gov.my', 'Nama Admin', 'ADMIN', true);
   ```
4. Selepas ini, admin boleh cipta pengguna lain terus dari dalam sistem (UI).

### 3. Deploy Edge Functions
Perlu [Supabase CLI](https://supabase.com/docs/guides/cli):
```bash
supabase login
supabase link --project-ref <project-ref-anda>
supabase functions deploy admin-create-user
supabase functions deploy admin-reset-password
supabase functions deploy admin-set-active
```

### 4. Pembangunan tempatan (local dev)
```bash
npm install
cp .env.example .env      # isikan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
npm run dev
```

### 5. Deploy ke GitHub Pages
1. Push kod ke repo GitHub (`node_modules`, `dist`, `.env`, `styled-system` sudah
   dikecualikan melalui `.gitignore`).
2. **Settings → Secrets and variables → Actions** — tambah:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Settings → Pages → Source** — pilih **GitHub Actions**.
4. Push ke branch `main` — workflow `.github/workflows/deploy.yml` akan
   build dan deploy secara automatik.

## Panduan Ringkas Pengguna

- **Log masuk** menggunakan e-mel & kata laluan yang diberikan oleh Admin.
- **Senarai Aset Penuh** — cari/tapis mengikut nama, no. pendaftaran, ID unik atau lokasi.
- Klik **"Profil"** pada mana-mana aset untuk lihat maklumat penuh + sejarah
  aktiviti (pergerakan, selenggara, kerosakan, pelupusan) secara kronologi.
- Modul di sidebar (Pergerakan, Selenggara dll.) hanya kelihatan jika Admin
  telah memberi anda sekurang-kurangnya akses **Baca Sahaja**.

## Panduan Ringkas Admin

- **Pengurusan Pengguna** (sidebar → Sistem Admin) — cipta pengguna baharu,
  tetapkan peranan (ADMIN/STAFF), dan tetapkan **kebenaran per-modul**
  (Tiada Akses / Baca Sahaja / Boleh Edit) untuk setiap pengguna STAFF secara
  berasingan.
- **Jejak Audit Sistem** — lihat log setiap INSERT/UPDATE/DELETE yang berlaku,
  diisi automatik oleh trigger pangkalan data (bukan oleh kod klien).
- Nyahaktifkan (bukan padam) akaun pengguna yang tidak lagi aktif, supaya
  rekod transaksi lama yang dicipta oleh mereka kekal boleh dikesan.

## Had Yang Diketahui (Known Limitations)

- Sistem ini **belum diuji end-to-end terhadap projek Supabase sebenar**
  dalam sesi pembinaan ini (dibina & disahkan melalui `tsc` + `vite build`
  sahaja). Jalankan ujian fungsian penuh sebelum digunakan secara meluas.
- Padam rekod transaksi (movements/maintenance/damage/disposals) **tidak
  dibenarkan** melalui RLS secara sengaja, untuk mengekalkan integriti
  sejarah aset — jika satu rekod tersilap dimasukkan, ia perlu dibetulkan
  melalui SQL Editor oleh Admin pangkalan data, bukan melalui UI.
- Aset yang dipadam (`is_deleted`) masih boleh dikemaskini oleh sesiapa yang
  ada akses edit `assets` — tiada kunci tambahan menghalang "un-delete"
  yang tidak disengajakan. Boleh dipertingkatkan pada versi akan datang.
- Tiada had masa tidak aktif (idle session timeout) di sisi klien.
- Notifikasi automatik untuk selenggaraan tertunggak belum dilaksanakan.

## Perubahan Ketara Daripada Versi Sebelum Ini

Lihat `CHANGELOG.md`.
