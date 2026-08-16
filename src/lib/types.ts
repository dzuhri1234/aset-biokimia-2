export type Role = "ADMIN" | "STAFF";
export type AccessLevel = "edit" | "read" | "none";
export type ModuleName =
  | "assets" | "inspections" | "movements" | "maintenance" | "damage" | "disposals" | "master_data";

export const MODULES: ModuleName[] = [
  "assets", "inspections", "movements", "maintenance", "damage", "disposals", "master_data",
];

export const MODULE_LABELS: Record<ModuleName, string> = {
  assets: "Pendaftaran / Kemaskini Aset",
  inspections: "Pemeriksaan Berkala",
  movements: "Pergerakan & Pinjaman",
  maintenance: "Penyelenggaraan",
  damage: "Laporan Kerosakan",
  disposals: "Pelupusan",
  master_data: "Data Induk (Lokasi/Kategori/PIC)",
};

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  is_active: boolean;
}

export type AssetStatus =
  | "MASIH DIGUNAKAN" | "ROSAK" | "CADANG LUPUS" | "DILUPUSKAN" | "DIPINJAM" | "DISELENGGARA";

export const ASSET_STATUSES: AssetStatus[] = [
  "MASIH DIGUNAKAN", "ROSAK", "CADANG LUPUS", "DILUPUSKAN", "DIPINJAM", "DISELENGGARA",
];

export interface Asset {
  id: string;
  unique_id: string;
  registration_no: string | null;
  description: string;
  placement_date: string | null;
  location_id: string | null;
  placement_code: string | null;
  maintenance_required: boolean;
  last_check_date: string | null;
  category_id: string | null;
  last_maintenance_year: number | null;
  notes: string | null;
  status: AssetStatus;
  pic_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location { id: string; name: string; code: string | null; }
export interface Category { id: string; name: string; }
export interface Personnel { id: string; name: string; position: string | null; department: string | null; }

export interface Inspection {
  id: string; asset_id: string; inspection_date: string;
  condition: "BAIK" | "ROSAK" | "HILANG"; notes: string | null; inspector_id: string | null;
}
export interface Movement {
  id: string; asset_id: string; from_location_id: string | null; to_location_id: string | null;
  purpose: string; borrower_name: string | null; out_date: string;
  expected_return_date: string | null; actual_return_date: string | null;
  status: "Dalam Pergerakan" | "Dipulangkan";
}
export interface MaintenanceRecord {
  id: string; asset_id: string; type: string; vendor: string | null;
  start_date: string; end_date: string | null; cost: number | null;
  status: "Dijadualkan" | "Sedang Diselenggara" | "Selesai"; notes: string | null;
}
export interface DamageRecord {
  id: string; asset_id: string; damage_type: string; report_date: string;
  priority: "Sederhana" | "Tinggi"; status: "Dilaporkan" | "Dalam Pembaikan" | "Selesai";
  repair_cost: number | null; resolved_date: string | null; notes: string | null;
}
export interface DisposalRecord {
  id: string; asset_id: string; reason: string; method: "E-Waste" | "Jualan Sisa" | "Musnah";
  proposal_date: string; approval_date: string | null;
  status: "Cadangan" | "Diluluskan" | "Selesai" | "Ditolak"; notes: string | null;
}
export interface AuditLog {
  id: string; user_email: string; action: string; table_name: string;
  record_id: string | null; description: string | null; created_at: string;
}

export type ViewName =
  | "dashboard" | "assets" | "assetProfile"
  | "movements" | "maintenance" | "damage" | "inspections" | "disposals"
  | "locations" | "categories" | "personnel"
  | "reports" | "users" | "auditTrail";
