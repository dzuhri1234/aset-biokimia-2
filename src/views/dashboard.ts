import { css } from "../../styled-system/css";
import { STATE, isAdmin } from "../lib/state";
import { kpiGrid, kpiCard, card, cardHeader, cardTitle, emptyState } from "../lib/ui";
import { escapeHTML, formatDate } from "../lib/utils";

export function renderDashboard(): string {
  const assets = STATE.data.assets;
  const total = assets.length;
  const active = assets.filter((a) => a.status === "MASIH DIGUNAKAN").length;
  const broken = assets.filter((a) => a.status === "ROSAK").length;
  const borrowed = assets.filter((a) => a.status === "DIPINJAM").length;

  const counts: Record<string, number> = {};
  assets.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
  const maxCount = Math.max(1, ...Object.values(counts));

  const recentLogs = STATE.data.auditLogs.slice(0, 6);

  const pendingMovements = STATE.data.movements.filter((m) => m.approval_status === "Menunggu Kelulusan");
  const pendingDamage = STATE.data.damage.filter((d) => d.status === "Dilaporkan");
  const pendingDisposals = STATE.data.disposals.filter((d) => d.status === "Cadangan");
  const totalPending = pendingMovements.length + pendingDamage.length + pendingDisposals.length;

  return `
    <div class="${css({ display: "flex", flexDirection: "column", gap: "6" })}">
      ${isAdmin() && totalPending > 0 ? renderNotifications(pendingMovements, pendingDamage, pendingDisposals) : ""}
      <div class="${kpiGrid}">
        ${kpiTile("Jumlah Aset", total, "neutral", "")}
        ${kpiTile("Aktif Digunakan", active, "success", "MASIH DIGUNAKAN")}
        ${kpiTile("Rosak", broken, "danger", "ROSAK")}
        ${kpiTile("Sedang Dipinjam", borrowed, "info", "DIPINJAM")}
      </div>
      <div class="${css({ display: "grid", gridTemplateColumns: { base: "1fr", lg: "1fr 1fr" }, gap: "4" })}">
        <div class="${card}">
          <div class="${cardHeader}"><h3 class="${cardTitle}">Status Aset Keseluruhan</h3></div>
          <div class="${css({ p: "5", display: "flex", flexDirection: "column", gap: "3" })}">
            ${Object.entries(counts).length ? Object.entries(counts).map(([status, count]) => `
              <button data-action="navigate" data-view="assets" data-statusfilter="${escapeHTML(status)}" class="${css({ display: "block", width: "full", textAlign: "left", cursor: "pointer" })}">
                <div class="${css({ display: "flex", justifyContent: "space-between", fontSize: "xs", fontWeight: "semibold", color: "slate.600", mb: "1" })}">
                  <span>${escapeHTML(status)}</span><span>${count}</span>
                </div>
                <div class="${css({ height: "2", bg: "slate.100", borderRadius: "full", overflow: "hidden" })}">
                  <div style="width:${Math.round((count / maxCount) * 100)}%" class="${css({ height: "full", bg: "primary.500", borderRadius: "full" })}"></div>
                </div>
              </button>`).join("") : `<p class="${emptyState}">Tiada data aset.</p>`}
          </div>
        </div>
        <div class="${card}">
          <div class="${cardHeader}">
            <h3 class="${cardTitle}">Jejak Audit Terkini</h3>
            ${isAdmin() ? `<button data-action="navigate" data-view="auditTrail" class="${css({ fontSize: "xs", color: "primary.500", _hover: { textDecoration: "underline" }, cursor: "pointer" })}">Lihat Semua</button>` : ""}
          </div>
          <ul class="${css({ maxHeight: "64", overflowY: "auto" })}">
            ${recentLogs.length ? recentLogs.map((log) => `
              <li class="${css({ p: "3", borderBottom: "1px solid", borderColor: "slate.100", display: "flex", gap: "3" })}">
                <span class="${css({ width: "2", height: "2", borderRadius: "full", mt: "1.5", flexShrink: 0, bg: log.action === "DELETE" ? "danger.500" : log.action === "UPDATE" ? "warning.500" : "success.500" })}"></span>
                <div class="${css({ flex: "1", minWidth: 0 })}">
                  <p class="${css({ fontSize: "sm", color: "slate.800", truncate: true })}"><b>${escapeHTML(log.user_email)}</b> ${escapeHTML(log.action)} pada ${escapeHTML(log.table_name)}</p>
                  <p class="${css({ fontSize: "xs", color: "slate.400" })}">${formatDate(log.created_at)}</p>
                </div>
              </li>`).join("") : `<li class="${emptyState}">Tiada aktiviti.</li>`}
          </ul>
        </div>
      </div>
    </div>`;
}

function renderNotifications(movements: any[], damage: any[], disposals: any[]): string {
  const items: { mod: string; label: string; sub: string; id: string; date: string }[] = [];
  movements.forEach((m) => items.push({ mod: "movements", label: "Permohonan Pergerakan/Pinjaman", sub: m.purpose, id: m.id, date: m.out_date }));
  damage.forEach((d) => items.push({ mod: "damage", label: "Laporan Kerosakan Baharu", sub: d.damage_type, id: d.id, date: d.report_date }));
  disposals.forEach((d) => items.push({ mod: "disposals", label: "Cadangan Pelupusan", sub: d.reason, id: d.id, date: d.proposal_date }));
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return `
    <div class="${css({ bg: "warning.50", border: "1px solid", borderColor: "warning.500/40", borderRadius: "xl", overflow: "hidden" })}">
      <div class="${css({ px: "5", py: "3", bg: "warning.500/15", display: "flex", alignItems: "center", gap: "2" })}">
        <span class="${css({ fontSize: "sm", fontWeight: "bold", color: "warning.700" })}">&#128276; Menunggu Tindakan Admin (${items.length})</span>
      </div>
      <div class="${css({ display: "flex", flexDirection: "column" })}">
        ${items.slice(0, 8).map((it) => `
          <button data-action="navigate" data-view="${it.mod}" class="${css({ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", width: "full", px: "5", py: "3", borderTop: "1px solid", borderColor: "warning.500/20", cursor: "pointer", _hover: { bg: "warning.500/10" } })}">
            <div>
              <p class="${css({ fontSize: "sm", fontWeight: "semibold", color: "slate.800" })}">${escapeHTML(it.label)}</p>
              <p class="${css({ fontSize: "xs", color: "slate.500" })}">${escapeHTML(it.sub)}</p>
            </div>
            <span class="${css({ fontSize: "xs", color: "slate.400" })}">${formatDate(it.date)}</span>
          </button>`).join("")}
      </div>
    </div>`;
}

function kpiTile(label: string, value: number, tone: "neutral" | "success" | "danger" | "info", statusFilter: string): string {
  return `
    <button data-action="navigate" data-view="assets" data-statusfilter="${escapeHTML(statusFilter)}" class="${kpiCard({ tone })}" style="cursor:pointer;text-align:left;width:100%;">
      <div>
        <p class="${css({ fontSize: "xs", fontWeight: "bold", color: "slate.500", textTransform: "uppercase", letterSpacing: "wide", mb: "1" })}">${escapeHTML(label)}</p>
        <p class="${css({ fontSize: "3xl", fontWeight: "bold", color: "slate.800" })}">${value}</p>
      </div>
    </button>`;
}
