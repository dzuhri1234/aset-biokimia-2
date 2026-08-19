-- ============================================================
-- SISTEM PENGURUSAN ASET ALIH - SEKSYEN BIOKIMIA VRI
-- 01_schema.sql : Struktur jadual teras
-- Jalankan dalam Supabase SQL Editor mengikut urutan fail (01, 02, 03...)
-- ============================================================

create extension if not exists "pgcrypto"; -- untuk gen_random_uuid()

-- ------------------------------------------------------------
-- DATA INDUK (Master Data)
-- ------------------------------------------------------------
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists personnel (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text,
  department text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PENGGUNA & KEBENARAN
-- profiles.id == auth.users.id (dicipta oleh Edge Function admin-create-user)
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'STAFF' check (role in ('ADMIN','STAFF')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Modul yang boleh diberi kebenaran berasingan
-- ('assets' meliputi pendaftaran/kemaskini aset asas)
create table if not exists module_permissions (
  user_id uuid not null references profiles(id) on delete cascade,
  module text not null check (module in
    ('assets','inspections','movements','maintenance','damage','disposals','master_data')),
  access_level text not null default 'read' check (access_level in ('edit','read','none')),
  primary key (user_id, module)
);

-- ------------------------------------------------------------
-- ASET (rekod induk - satu baris = satu aset fizikal)
-- ------------------------------------------------------------
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  unique_id text not null unique,              -- No Unik ID (cth. BIO-0001)
  registration_no text unique,                  -- No Siri Pendaftaran
  description text not null,                    -- Keterangan Aset
  placement_date date,                           -- Tarikh Penempatan
  location_id uuid references locations(id),     -- Tempat Penempatan
  placement_code text,                           -- Kod Penempatan
  maintenance_required boolean not null default false, -- Keperluan Selenggara/Kalibrasi?
  last_check_date date,                          -- Tarikh Terakhir Semakan
  category_id uuid references categories(id),    -- Kategori Aset
  last_maintenance_year int,                     -- Tahun Terakhir Selenggara/Pembaikan
  notes text,                                    -- Catatan
  photo_url text,                                -- Gambar aset (Supabase Storage)
  status text not null default 'MASIH DIGUNAKAN' check (status in
    ('MASIH DIGUNAKAN','ROSAK','CADANG LUPUS','DILUPUSKAN','DIPINJAM','DISELENGGARA')),
  pic_id uuid references personnel(id),          -- Pegawai/PIC semasa
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_assets_status on assets(status);
create index if not exists idx_assets_location on assets(location_id);
create index if not exists idx_assets_category on assets(category_id);

-- ------------------------------------------------------------
-- MODUL TRANSAKSI - semua rujuk assets(id), TIADA salinan data aset
-- ------------------------------------------------------------
create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  inspection_date date not null default current_date,
  condition text not null check (condition in ('BAIK','ROSAK','HILANG')),
  notes text,
  inspector_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists movements (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  from_location_id uuid references locations(id),
  to_location_id uuid references locations(id),
  purpose text not null,
  borrower_name text,
  out_date date not null default current_date,
  expected_return_date date,
  actual_return_date date,
  status text not null default 'Dalam Pergerakan' check (status in ('Dalam Pergerakan','Dipulangkan')),
  -- Medan selaras borang rasmi KEW.PA-9
  application_no bigint,
  applicant_name text,
  applicant_position text,
  division text,
  used_at text,
  issuer_name text,
  borrower_position text,
  returner_name text,
  returner_position text,
  notes text,
  approval_status text not null default 'Menunggu Kelulusan' check (approval_status in ('Menunggu Kelulusan','Diluluskan','Tidak Diluluskan')),
  approved_by_name text,
  approved_by_position text,
  approved_date date,
  received_by_name text,
  received_by_position text,
  received_date date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists maintenance (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  type text not null check (type in ('Pencegahan','Pembaikan')),  -- Jenis Penyelenggaraan (KEW.PA-15)
  vendor text,                                    -- Nama Syarikat/Jabatan yang Menyelenggara
  work_order_no text,                             -- No. Pesanan Kerajaan / No. Kontrak dan Tarikh
  start_date date not null default current_date,
  end_date date,
  cost numeric(12,2) default 0,
  status text not null default 'Dijadualkan' check (status in ('Dijadualkan','Sedang Diselenggara','Selesai')),
  notes text,                                     -- Butir-butir Kerja
  confirmed_by_name text,                         -- Nama pegawai mengesahkan
  confirmed_by_position text,                     -- Jawatan pegawai mengesahkan
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists damage (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  damage_type text not null,
  report_date date not null default current_date,
  priority text not null default 'Sederhana' check (priority in ('Sederhana','Tinggi')),
  status text not null default 'Dilaporkan' check (status in ('Dilaporkan','Dalam Pembaikan','Selesai')),
  repair_cost numeric(12,2),
  resolved_date date,
  notes text,
  -- Medan selaras borang rasmi KEW.PA-10
  last_user text,                                  -- Bahagian I: Pengguna Terakhir
  reporter_name text,                               -- Bahagian I: Nama Pengadu
  reporter_position text,                           -- Bahagian I: Jawatan Pengadu
  technical_officer_name text,                      -- Bahagian II: Nama Pegawai Teknikal
  technical_officer_position text,                  -- Bahagian II: Jawatan Pegawai Teknikal
  technical_officer_date date,                      -- Bahagian II: Tarikh
  technical_notes text,                             -- Bahagian II: Syor Dan Ulasan
  decision_status text not null default 'Belum Diputuskan' check (decision_status in ('Belum Diputuskan','Diluluskan','Tidak Diluluskan')), -- Bahagian III
  decision_notes text,                              -- Bahagian III: Ulasan
  decision_by_name text,                            -- Bahagian III: Nama Ketua Jabatan
  decision_by_position text,                        -- Bahagian III: Jawatan
  decision_date date,                               -- Bahagian III: Tarikh
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists disposals (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  reason text not null,
  method text not null default 'E-Waste' check (method in ('E-Waste','Jualan Sisa','Musnah')),
  proposal_date date not null default current_date,
  approval_date date,
  status text not null default 'Cadangan' check (status in ('Cadangan','Diluluskan','Selesai','Ditolak')),
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- JEJAK AUDIT - diisi HANYA melalui trigger (lihat 03_triggers.sql),
-- bukan ditulis terus oleh klien
-- ------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text not null,        -- INSERT / UPDATE / DELETE / LOGIN
  table_name text not null,
  record_id text,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_created on audit_logs(created_at desc);
