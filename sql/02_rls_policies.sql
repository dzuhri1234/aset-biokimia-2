-- ============================================================
-- 02_rls_policies.sql : Row Level Security
-- Ini adalah lapisan keselamatan SEBENAR sistem. Kebenaran di UI
-- (butang disembunyikan dsb.) hanya untuk keselesaan pengguna -
-- ia BUKAN kawalan keselamatan. Kawalan sebenar ada di sini.
-- ============================================================

alter table profiles enable row level security;
alter table module_permissions enable row level security;
alter table locations enable row level security;
alter table categories enable row level security;
alter table personnel enable row level security;
alter table assets enable row level security;
alter table inspections enable row level security;
alter table movements enable row level security;
alter table maintenance enable row level security;
alter table damage enable row level security;
alter table disposals enable row level security;
alter table audit_logs enable row level security;

-- ------------------------------------------------------------
-- FUNGSI BANTUAN (SECURITY DEFINER supaya boleh baca profiles
-- tanpa terperangkap dalam RLS rekursif)
-- ------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'ADMIN' and is_active = true
  );
$$;

create or replace function has_module_access(p_module text, p_level text)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select
    is_admin()
    or exists (
      select 1 from module_permissions mp
      join profiles p on p.id = mp.user_id
      where mp.user_id = auth.uid()
        and mp.module = p_module
        and p.is_active = true
        and (
          (p_level = 'read' and mp.access_level in ('read','edit'))
          or (p_level = 'edit' and mp.access_level = 'edit')
        )
    );
$$;

create or replace function is_active_staff()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and is_active = true);
$$;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "profiles_update_admin_only" on profiles
  for update using (is_admin());

create policy "profiles_insert_admin_only" on profiles
  for insert with check (is_admin());

create policy "profiles_delete_admin_only" on profiles
  for delete using (is_admin());

-- ------------------------------------------------------------
-- MODULE PERMISSIONS - hanya admin boleh lihat/ubah; pengguna
-- lain tidak perlu tahu senarai kebenaran orang lain
-- ------------------------------------------------------------
create policy "perms_admin_all" on module_permissions
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- DATA INDUK - semua staf aktif boleh baca; edit perlu kebenaran
-- modul 'master_data'
-- ------------------------------------------------------------
create policy "locations_read" on locations for select using (is_active_staff());
create policy "locations_write" on locations for insert with check (has_module_access('master_data','edit'));
create policy "locations_update" on locations for update using (has_module_access('master_data','edit'));
create policy "locations_delete" on locations for delete using (has_module_access('master_data','edit'));

create policy "categories_read" on categories for select using (is_active_staff());
create policy "categories_write" on categories for insert with check (has_module_access('master_data','edit'));
create policy "categories_update" on categories for update using (has_module_access('master_data','edit'));
create policy "categories_delete" on categories for delete using (has_module_access('master_data','edit'));

create policy "personnel_read" on personnel for select using (is_active_staff());
create policy "personnel_write" on personnel for insert with check (has_module_access('master_data','edit'));
create policy "personnel_update" on personnel for update using (has_module_access('master_data','edit'));
create policy "personnel_delete" on personnel for delete using (has_module_access('master_data','edit'));

-- ------------------------------------------------------------
-- ASSETS
-- ------------------------------------------------------------
create policy "assets_read" on assets for select using (is_active_staff());
create policy "assets_insert" on assets for insert with check (has_module_access('assets','edit'));
create policy "assets_update" on assets for update using (has_module_access('assets','edit'));
-- Tiada DELETE sebenar dibenarkan pada assets langsung dari klien -
-- pelupusan mesti melalui modul 'disposals' + soft-delete (is_deleted).
-- UPDATE di atas sudah cukup untuk menanda is_deleted=true.

-- ------------------------------------------------------------
-- MODUL TRANSAKSI - baca untuk semua staf aktif; tulis ikut
-- kebenaran modul masing-masing. TIADA delete dibenarkan terus
-- dari klien supaya sejarah aset tidak boleh hilang secara
-- tidak sengaja (audit trail kekal).
-- ------------------------------------------------------------
create policy "inspections_read" on inspections for select using (is_active_staff());
create policy "inspections_insert" on inspections for insert with check (has_module_access('inspections','edit'));

create policy "movements_read" on movements for select using (is_active_staff());
create policy "movements_insert" on movements for insert with check (has_module_access('movements','edit'));
create policy "movements_update" on movements for update using (has_module_access('movements','edit'));

create policy "maintenance_read" on maintenance for select using (is_active_staff());
create policy "maintenance_insert" on maintenance for insert with check (has_module_access('maintenance','edit'));
create policy "maintenance_update" on maintenance for update using (has_module_access('maintenance','edit'));

create policy "damage_read" on damage for select using (is_active_staff());
create policy "damage_insert" on damage for insert with check (has_module_access('damage','edit'));
create policy "damage_update" on damage for update using (has_module_access('damage','edit'));

create policy "disposals_read" on disposals for select using (is_active_staff());
create policy "disposals_insert" on disposals for insert with check (has_module_access('disposals','edit'));
create policy "disposals_update" on disposals for update using (has_module_access('disposals','edit'));

-- ------------------------------------------------------------
-- AUDIT LOGS - baca oleh admin sahaja; TIADA insert/update/delete
-- dibenarkan dari klien langsung (hanya trigger SECURITY DEFINER
-- boleh menulis - lihat 03_triggers.sql)
-- ------------------------------------------------------------
create policy "audit_logs_read_admin" on audit_logs for select using (is_admin());

-- ------------------------------------------------------------
-- STORAN GAMBAR ASET (Supabase Storage)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('asset-photos', 'asset-photos', true)
on conflict (id) do nothing;

create policy "asset_photos_read" on storage.objects
  for select using (bucket_id = 'asset-photos');
create policy "asset_photos_write" on storage.objects
  for insert with check (bucket_id = 'asset-photos' and has_module_access('assets','edit'));
create policy "asset_photos_update" on storage.objects
  for update using (bucket_id = 'asset-photos' and has_module_access('assets','edit'));
