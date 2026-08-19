import type {
  Asset, Location, Category, Personnel, Inspection, Movement, MaintenanceRecord,
  DamageRecord, DisposalRecord, AuditLog, Profile, ModuleName, AccessLevel, ViewName,
} from "./types";

export interface ModalState {
  type: string;
  id?: string | null;
  userId?: string;
  perms?: Record<string, string>;
  mod?: string;
  masterType?: string;
  presetAssetId?: string | null;
  [key: string]: unknown;
}

export interface AppState {
  session: { userId: string; email: string } | null;
  profile: Profile | null;
  authMode: "login" | "forgotPassword" | "passwordRecovery";
  permissions: Record<ModuleName, AccessLevel>;
  loading: boolean;
  view: ViewName;
  selectedAssetId: string | null;
  modal: ModalState | null;
  sidebarOpen: boolean;
  assetPage: number;
  filters: { search: string; status: string; location: string };
  maintenanceStatusFilter: string;
  data: {
    assets: Asset[];
    locations: Location[];
    categories: Category[];
    personnel: Personnel[];
    inspections: Inspection[];
    movements: Movement[];
    maintenance: MaintenanceRecord[];
    damage: DamageRecord[];
    disposals: DisposalRecord[];
    auditLogs: AuditLog[];
    users: Profile[];
  };
}

export const ASSET_PAGE_SIZE = 25;

export const STATE: AppState = {
  session: null,
  profile: null,
  authMode: "login",
  permissions: {
    assets: "none", inspections: "none", movements: "none",
    maintenance: "none", damage: "none", disposals: "none", master_data: "none",
  },
  loading: true,
  view: "dashboard",
  selectedAssetId: null,
  modal: null,
  sidebarOpen: false,
  assetPage: 1,
  filters: { search: "", status: "", location: "" },
  maintenanceStatusFilter: "",
  data: {
    assets: [], locations: [], categories: [], personnel: [],
    inspections: [], movements: [], maintenance: [], damage: [], disposals: [],
    auditLogs: [], users: [],
  },
};

export function isAdmin(): boolean {
  return STATE.profile?.role === "ADMIN";
}

export function canEdit(mod: ModuleName): boolean {
  return isAdmin() || STATE.permissions[mod] === "edit";
}

export function canRead(mod: ModuleName): boolean {
  return isAdmin() || STATE.permissions[mod] === "edit" || STATE.permissions[mod] === "read";
}

let renderFn: (() => void) | null = null;
export function bindRender(fn: () => void) {
  renderFn = fn;
}
export function rerender() {
  renderFn?.();
}
