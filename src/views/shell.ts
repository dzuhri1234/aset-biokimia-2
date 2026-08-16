import { css } from "../../styled-system/css";
import { STATE, isAdmin, canRead } from "../lib/state";
import { escapeHTML } from "../lib/utils";
import type { ViewName } from "../lib/types";

const NAV_SECTIONS: { title: string; items: { key: ViewName; label: string; module?: string }[] }[] = [
  { title: "Utama", items: [
    { key: "dashboard", label: "Papan Pemuka" },
    { key: "assets", label: "Senarai Aset Penuh", module: "assets" },
  ]},
  { title: "Kitaran Hayat", items: [
    { key: "movements", label: "Pergerakan & Pinjaman", module: "movements" },
    { key: "maintenance", label: "Penyelenggaraan", module: "maintenance" },
    { key: "damage", label: "Laporan Kerosakan", module: "damage" },
    { key: "inspections", label: "Pemeriksaan Berkala", module: "inspections" },
    { key: "disposals", label: "Pelupusan", module: "disposals" },
  ]},
  { title: "Data Induk & Laporan", items: [
    { key: "locations", label: "Lokasi Penempatan", module: "master_data" },
    { key: "categories", label: "Kategori Aset", module: "master_data" },
    { key: "personnel", label: "Pemegang (PIC)", module: "master_data" },
    { key: "reports", label: "Jana Laporan CSV" },
  ]},
];

const ADMIN_ITEMS: { key: ViewName; label: string }[] = [
  { key: "users", label: "Pengurusan Pengguna" },
  { key: "auditTrail", label: "Jejak Audit Sistem" },
];

const navItem = css({
  width: "full", display: "flex", alignItems: "center", gap: "3", px: "5", py: "2.5",
  fontSize: "sm", textAlign: "left", color: "slate.300", borderLeft: "3px solid transparent",
  transition: "all .15s ease", cursor: "pointer", bg: "transparent",
  _hover: { bg: "rgba(255,255,255,0.08)", color: "white" },
});
const navItemActive = css({ bg: "rgba(255,255,255,0.08)", borderLeftColor: "info.500", color: "white", fontWeight: "semibold" });
const sectionLabel = css({ fontSize: "10px", fontWeight: "bold", color: "slate.500", textTransform: "uppercase", letterSpacing: "widest", px: "5", mt: "4", mb: "1" });

export function renderShell(content: string): string {
  const sidebarClasses = css({
    position: { base: "fixed", lg: "relative" }, zIndex: 40, width: "64", height: "full",
    bg: "navy.900", color: "slate.300", display: "flex", flexDirection: "column",
    transition: "transform .3s ease", boxShadow: "xl",
    transform: STATE.sidebarOpen ? "translateX(0)" : { base: "translateX(-100%)", lg: "translateX(0)" },
  });

  return `
    <aside class="${sidebarClasses}">
      <div class="${css({ p: "5", borderBottom: "1px solid", borderColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" })}">
        <div>
          <h2 class="${css({ color: "white", fontWeight: "bold", fontSize: "lg", lineHeight: "tight" })}">Biokimia VRI</h2>
          <p class="${css({ fontSize: "10px", color: "info.500", textTransform: "uppercase", letterSpacing: "wide", fontWeight: "semibold" })}">Pengurusan Aset</p>
        </div>
        <button data-action="closeSidebar" class="${css({ display: { lg: "none" }, color: "slate.400", _hover: { color: "white" }, fontSize: "xl", cursor: "pointer" })}">&times;</button>
      </div>
      <nav class="${css({ flex: "1", overflowY: "auto", py: "2" })}">
        ${NAV_SECTIONS.map((section) => {
          const items = section.items.filter((i) => !i.module || canRead(i.module as any));
          if (!items.length) return "";
          return `<div class="${sectionLabel}">${section.title}</div>` + items.map((i) => navLink(i.key, i.label)).join("");
        }).join("")}
        ${isAdmin() ? `<div class="${sectionLabel}">Sistem Admin</div>${ADMIN_ITEMS.map((i) => navLink(i.key, i.label)).join("")}` : ""}
      </nav>
      <div class="${css({ p: "4", bg: "navy.800", borderTop: "1px solid", borderColor: "rgba(255,255,255,0.1)" })}">
        <div class="${css({ display: "flex", alignItems: "center", gap: "3" })}">
          <div class="${css({ width: "9", height: "9", borderRadius: "full", bg: "primary.500", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "sm", flexShrink: 0 })}">
            ${escapeHTML((STATE.profile?.name || "?").substring(0, 2).toUpperCase())}
          </div>
          <div class="${css({ flex: "1", minWidth: 0 })}">
            <p class="${css({ fontSize: "sm", fontWeight: "semibold", color: "white", truncate: true })}">${escapeHTML(STATE.profile?.name)}</p>
            <p class="${css({ fontSize: "10px", color: "info.400", fontWeight: "bold", letterSpacing: "wide" })}">${escapeHTML(STATE.profile?.role)}</p>
          </div>
        </div>
      </div>
    </aside>
    <div data-action="closeSidebar" class="${css({ position: "fixed", inset: 0, bg: "rgba(15,23,42,0.6)", zIndex: 30, display: { base: STATE.sidebarOpen ? "block" : "none", lg: "none" } })}"></div>
    <main class="${css({ flex: "1", display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", bg: "slate.50" })}">
      <header class="${css({ bg: "white", borderBottom: "1px solid", borderColor: "slate.200", px: "6", py: "4", display: "flex", alignItems: "center", gap: "4", boxShadow: "sm", flexShrink: 0 })}">
        <button data-action="openSidebar" class="${css({ display: { lg: "none" }, color: "slate.500", cursor: "pointer" })}">&#9776;</button>
        <h1 class="${css({ fontSize: "lg", fontWeight: "bold", color: "slate.800" })}">${getViewTitle(STATE.view)}</h1>
        <div class="${css({ ml: "auto", display: "flex", alignItems: "center", gap: "4" })}">
          <span class="${css({ display: { base: "none", sm: "inline-flex" }, alignItems: "center", gap: "1.5", fontSize: "xs", fontWeight: "medium", bg: "success.50", color: "success.700", px: "2.5", py: "1", borderRadius: "full", border: "1px solid", borderColor: "success.500/30" })}">
            <span class="${css({ width: "1.5", height: "1.5", borderRadius: "full", bg: "success.500" })}"></span> Disambungkan
          </span>
          <button data-action="logout" class="${css({ fontSize: "xs", fontWeight: "bold", color: "slate.500", _hover: { color: "danger.500" }, cursor: "pointer" })}">Log Keluar</button>
        </div>
      </header>
      <div class="${css({ flex: "1", overflowY: "auto", p: { base: "4", sm: "6" } })}">${content}</div>
    </main>`;
}

function navLink(key: ViewName, label: string): string {
  return `<button data-action="navigate" data-view="${key}" class="${navItem} ${STATE.view === key ? navItemActive : ""}">${escapeHTML(label)}</button>`;
}

function getViewTitle(view: ViewName): string {
  const t: Record<ViewName, string> = {
    dashboard: "Papan Pemuka", assets: "Senarai Aset Penuh", assetProfile: "Profil Aset",
    movements: "Pergerakan & Pinjaman", maintenance: "Penyelenggaraan Aset", damage: "Laporan Kerosakan",
    inspections: "Pemeriksaan Berkala", disposals: "Pelupusan Aset", locations: "Lokasi Penempatan",
    categories: "Kategori Aset", personnel: "Pemegang Aset (PIC)", reports: "Pusat Laporan & Eksport CSV",
    users: "Pengurusan Pengguna", auditTrail: "Jejak Audit Pangkalan Data",
  };
  return t[view] || "Sistem Aset";
}
