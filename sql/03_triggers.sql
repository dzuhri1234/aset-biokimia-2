-- ============================================================
-- 03_triggers.sql : Automasi peringkat pangkalan data
-- ============================================================

-- ------------------------------------------------------------
-- updated_at automatik untuk assets
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_assets_updated_at on assets;
create trigger trg_assets_updated_at
  before update on assets
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Jejak Audit automatik - berjalan sebagai SECURITY DEFINER supaya
-- ia boleh menulis ke audit_logs walaupun klien sendiri tiada
-- kebenaran INSERT terus ke jadual itu (lihat dasar RLS audit_logs).
-- Ini memastikan setiap INSERT/UPDATE/DELETE pada jadual operasi
-- direkodkan tanpa bergantung kepada JavaScript sisi klien memanggilnya.
-- ------------------------------------------------------------
create or replace function log_audit_event()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_email text;
  v_record_id text;
  v_description text;
begin
  select email into v_email from profiles where id = auth.uid();

  if (tg_op = 'DELETE') then
    v_record_id := old.id::text;
    v_description := tg_table_name || ' dipadam';
    insert into audit_logs (user_id, user_email, action, table_name, record_id, description)
    values (auth.uid(), coalesce(v_email, 'system'), 'DELETE', tg_table_name, v_record_id, v_description);
    return old;
  else
    v_record_id := new.id::text;
    v_description := tg_table_name || ' ' || lower(tg_op);
    insert into audit_logs (user_id, user_email, action, table_name, record_id, description)
    values (auth.uid(), coalesce(v_email, 'system'), tg_op, tg_table_name, v_record_id, v_description);
    return new;
  end if;
end;
$$;

drop trigger if exists trg_audit_assets on assets;
create trigger trg_audit_assets after insert or update or delete on assets
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_movements on movements;
create trigger trg_audit_movements after insert or update or delete on movements
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_maintenance on maintenance;
create trigger trg_audit_maintenance after insert or update or delete on maintenance
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_damage on damage;
create trigger trg_audit_damage after insert or update or delete on damage
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_disposals on disposals;
create trigger trg_audit_disposals after insert or update or delete on disposals
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_inspections on inspections;
create trigger trg_audit_inspections after insert or update or delete on inspections
  for each row execute function log_audit_event();

-- Aset ROSAK terkini secara automatik menyegerakkan last_check_date
-- daripada rekod pemeriksaan terkini
create or replace function sync_asset_last_check()
returns trigger language plpgsql as $$
begin
  update assets set last_check_date = new.inspection_date where id = new.asset_id;
  return new;
end;
$$;

drop trigger if exists trg_sync_last_check on inspections;
create trigger trg_sync_last_check after insert on inspections
  for each row execute function sync_asset_last_check();

-- ------------------------------------------------------------
-- No. Unik ID (unique_id) dijana automatik (BIO-0001, BIO-0002, ...)
-- supaya pengguna tidak perlu - dan tidak boleh - taip sendiri.
-- ------------------------------------------------------------
create sequence if not exists asset_unique_id_seq;

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
-- No. Permohonan (application_no) untuk borang KEW.PA-9, dijana
-- automatik secara berjujukan (1, 2, 3, ...).
-- ------------------------------------------------------------
create sequence if not exists movement_application_no_seq;

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
