-- ============================================================
-- 06_kemaskini_v3.sql
-- Medan tambahan supaya borang cetak PERGERAKAN (KEW.PA-9),
-- KEROSAKAN (KEW.PA-10) boleh diisi & dicetak SEBIJIK templat rasmi.
-- SELAMAT dijalankan - tidak memadam sebarang data sedia ada.
--
-- Jalankan SEKALI SAHAJA dalam SQL Editor, SELEPAS 01-05.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PERGERAKAN & PINJAMAN (KEW.PA-9) - medan yang masih tiada
-- ------------------------------------------------------------
alter table movements add column if not exists application_no bigint;
alter table movements add column if not exists notes text;
alter table movements add column if not exists borrower_position text;
alter table movements add column if not exists returner_name text;
alter table movements add column if not exists returner_position text;

create sequence if not exists movement_application_no_seq;
select setval('movement_application_no_seq', greatest(1, coalesce((select max(application_no) from movements), 0)));

create or replace function assign_movement_application_no()
returns trigger language plpgsql as $$
begin
  if new.application_no is null then
    new.application_no := nextval('movement_application_no_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_movement_application_no on movements;
create trigger trg_assign_movement_application_no
  before insert on movements
  for each row execute function assign_movement_application_no();

-- ------------------------------------------------------------
-- 2. LAPORAN KEROSAKAN (KEW.PA-10) - Bahagian I, II, III
-- ------------------------------------------------------------
-- Bahagian I (diisi oleh Pengadu)
alter table damage add column if not exists last_user text;
alter table damage add column if not exists reporter_name text;
alter table damage add column if not exists reporter_position text;

-- Bahagian II (diisi oleh Pegawai Aset/Pegawai Teknikal)
alter table damage add column if not exists technical_officer_name text;
alter table damage add column if not exists technical_officer_position text;
alter table damage add column if not exists technical_officer_date date;
alter table damage add column if not exists technical_notes text; -- Bahagian II: Syor Dan Ulasan (berasingan drpd Perihal Kerosakan Bahagian I)

-- Bahagian III (Keputusan Ketua Jabatan/Bahagian/Seksyen/Unit)
alter table damage add column if not exists decision_status text not null default 'Belum Diputuskan';
alter table damage drop constraint if exists damage_decision_status_check;
alter table damage add constraint damage_decision_status_check
  check (decision_status in ('Belum Diputuskan','Diluluskan','Tidak Diluluskan'));
alter table damage add column if not exists decision_notes text;
alter table damage add column if not exists decision_by_name text;
alter table damage add column if not exists decision_by_position text;
alter table damage add column if not exists decision_date date;
