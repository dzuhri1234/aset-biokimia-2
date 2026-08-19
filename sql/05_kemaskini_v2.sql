-- ============================================================
-- 05_kemaskini_v2.sql
-- Kemaskini TAMBAHAN untuk projek Supabase SEDIA ADA anda.
-- SELAMAT dijalankan - tidak memadam sebarang data sedia ada,
-- hanya menambah lajur/jadual/logik baharu.
--
-- Jalankan SEKALI SAHAJA dalam SQL Editor, SELEPAS 01-04.
-- ============================================================

-- ------------------------------------------------------------
-- 1. GAMBAR ASET
-- ------------------------------------------------------------
alter table assets add column if not exists photo_url text;

-- ------------------------------------------------------------
-- 2. NO. UNIK ID - AUTO GENERATE (BIO-0001, BIO-0002, ...)
-- Admin/Staf tidak lagi perlu taip No. Unik ID sendiri.
-- Sambung nombor daripada 443 rekod yang sudah diimport.
-- ------------------------------------------------------------
create sequence if not exists asset_unique_id_seq;
select setval('asset_unique_id_seq', greatest(443,
  coalesce((select max(substring(unique_id from 'BIO-(\d+)')::int) from assets where unique_id ~ '^BIO-\d+$'), 0)
));

create or replace function assign_unique_id()
returns trigger language plpgsql as $$
begin
  if new.unique_id is null or trim(new.unique_id) = '' then
    new.unique_id := 'BIO-' || lpad(nextval('asset_unique_id_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_unique_id on assets;
create trigger trg_assign_unique_id
  before insert on assets
  for each row execute function assign_unique_id();

-- ------------------------------------------------------------
-- 3. KOD PENEMPATAN kini milik LOKASI (bukan aset secara berasingan)
-- Isikan kod sedia ada berdasarkan data 443 aset yang diimport.
-- SILA SEMAK & BETULKAN selepas ini melalui skrin "Lokasi Penempatan"
-- dalam sistem (terutama BILIK MESYUARAT BIOKIMIA yang belum
-- mempunyai kod, dan BILIK PANTRY / MAKMAL PROTEOMIK yang kongsi
-- kod sama buat sementara).
-- ------------------------------------------------------------
update locations set code = '080311 / BGN / X / 02 / 019' where name = 'BILIK BASUHAN';
update locations set code = '080311 / BGN / X / 02 / 017' where name = 'BILIK DIGESTION';
update locations set code = '080311 / BGN / X / 02 / 004' where name = 'BILIK INKUBATOR';
update locations set code = '080311 / BGN / X / 02 / 016' where name = 'BILIK KISAR MAKANAN';
update locations set code = '080311 / BGN / X / 02 / 035' where name = 'BILIK MESYUARAT';
update locations set code = '080311 / BGN / X / 02 / 015' where name = 'BILIK OVEN';
update locations set code = '080311 / BGN / X / 02 / 010' where name = 'BILIK PANTRY';
update locations set code = '080311 / BGN / X / 02 / 008' where name = 'BILIK PEGAWAI SEKSYEN BIOKIMIA';
update locations set code = '080311 / BGN / X / 02 / 012' where name = 'BILIK PENYIMPANAN BAHAN KIMIA';
update locations set code = '080311 / BGN / X / 02 / 034' where name = 'BILIK SEJUK';
update locations set code = '080311 / BGN / X / 02 / 020' where name = 'BK STAF BIOKIMIA';
update locations set code = '080311 / BGN / X / 02 / 033' where name = 'MAKMAL ANTIGEN & ELISA';
update locations set code = '080311 / BGN / X / 02 / 031' where name = 'MAKMAL BIOLOGI MOLEKUL';
update locations set code = '080311 / BGN / X / 02 / 011' where name = 'MAKMAL KIMIA KLINIKAL';
update locations set code = '080311 / BGN / X / 02 / 018' where name = 'MAKMAL KUALITI MAKANAN';
update locations set code = '080311 / BGN / X / 02 / 009' where name = 'MAKMAL KUALITI SUSU & TOKSIKOLOGI';
update locations set code = '080311 / BGN / X / 02 / 005' where name = 'MAKMAL KULTURA';
update locations set code = '080311 / BGN / X / 02 / 010' where name = 'MAKMAL PROTEOMIK';
update locations set code = '080311 / BGN / X / 02 / 002' where name = 'RUANG LEGAR 1';
update locations set code = '080311 / BGN / X / 02 / 003' where name = 'RUANG LEGAR 2';
update locations set code = '080311 / BGN / X / 02 / 021' where name = 'RUANG LEGAR 4';
update locations set code = '080311 / BGN / X / 02 / 037' where name = 'STOR BANGUNAN BIOLOGIK';
-- BILIK MESYUARAT BIOKIMIA sengaja dibiarkan kosong - kod asal tidak sah ('0')

-- ------------------------------------------------------------
-- 4. PERGERAKAN & PINJAMAN - medan tambahan selaras borang KEW.PA-9
-- ------------------------------------------------------------
alter table movements add column if not exists applicant_name text;
alter table movements add column if not exists applicant_position text;
alter table movements add column if not exists division text;
alter table movements add column if not exists used_at text;
alter table movements add column if not exists issuer_name text;
alter table movements add column if not exists approval_status text not null default 'Menunggu Kelulusan';
alter table movements drop constraint if exists movements_approval_status_check;
alter table movements add constraint movements_approval_status_check
  check (approval_status in ('Menunggu Kelulusan','Diluluskan','Tidak Diluluskan'));
alter table movements add column if not exists approved_by_name text;
alter table movements add column if not exists approved_by_position text;
alter table movements add column if not exists approved_date date;
alter table movements add column if not exists received_by_name text;
alter table movements add column if not exists received_by_position text;
alter table movements add column if not exists received_date date;

-- ------------------------------------------------------------
-- 5. PENYELENGGARAAN - medan tambahan selaras borang KEW.PA-15
-- ------------------------------------------------------------
alter table maintenance add column if not exists work_order_no text;
alter table maintenance add column if not exists confirmed_by_name text;
alter table maintenance add column if not exists confirmed_by_position text;
-- 'type' kini terhad kepada 2 kategori rasmi KEW.PA-15
alter table maintenance drop constraint if exists maintenance_type_check;
alter table maintenance add constraint maintenance_type_check
  check (type in ('Pencegahan','Pembaikan'));
-- NOTA: jika arahan di atas gagal sebab ada rekod 'type' sedia ada yang
-- bukan 'Pencegahan'/'Pembaikan', kemaskini rekod tersebut dahulu melalui
-- Table Editor, kemudian jalankan semula 2 baris di atas.

-- ------------------------------------------------------------
-- 6. STORAN GAMBAR ASET (Supabase Storage)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('asset-photos', 'asset-photos', true)
on conflict (id) do nothing;

drop policy if exists "asset_photos_read" on storage.objects;
create policy "asset_photos_read" on storage.objects
  for select using (bucket_id = 'asset-photos');

drop policy if exists "asset_photos_write" on storage.objects;
create policy "asset_photos_write" on storage.objects
  for insert with check (bucket_id = 'asset-photos' and has_module_access('assets','edit'));

drop policy if exists "asset_photos_update" on storage.objects;
create policy "asset_photos_update" on storage.objects
  for update using (bucket_id = 'asset-photos' and has_module_access('assets','edit'));
