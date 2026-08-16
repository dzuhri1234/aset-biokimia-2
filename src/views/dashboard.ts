import { css } from "../../styled-system/css";
import { STATE } from "../lib/state";
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

  return `
    <div class="${css({ display: "flex", flexDirection: "column", gap: "6" })}">
      <div class="${kpiGrid}">
        ${kpiTile("Jumlah Aset", total, "neutral")}
        ${kpiTile("Aktif Digunakan", active, "success")}
        ${kpiTile("Rosak", broken, "danger")}
        ${kpiTile("Sedang Dipinjam", borrowed, "info")}
      </div>
      <div class="${css({ display: "grid", gridTemplateColumns: { base: "1fr", lg: "1fr 1fr" }, gap: "4" })}">
        <div class="${card}">
          <div class="${cardHeader}"><h3 class="${cardTitle}">Status Aset Keseluruhan</h3></div>
          <div class="${css({ p: "5", display: "flex", flexDirection: "column", gap: "3" })}">
            ${Object.entries(counts).length ? Object.entries(counts).map(([status, count]) => `
              <div>
                <div class="${css({ display: "flex", justifyContent: "space-between", fontSize: "xs", fontWeight: "semibold", color: "slate.600", mb: "1" })}">
                  <span>${escapeHTML(status)}</span><span>${count}</span>
                </div>
                <div class="${css({ height: "2", bg: "slate.100", borderRadius: "full", overflow: "hidden" })}">
                  <div style="width:${Math.round((count / maxCount) * 100)}%" class="${css({ height: "full", bg: "primary.500", borderRadius: "full" })}"></div>
                </div>
              </div>`).join("") : `<p class="${emptyState}">Tiada data aset.</p>`}
          </div>
        </div>
        <div class="${card}">
          <div class="${cardHeader}">
            <h3 class="${cardTitle}">Jejak Audit Terkini</h3>
            <button data-action="navigate" data-view="auditTrail" class="${css({ fontSize: "xs", color: "primary.500", _hover: { textDecoration: "underline" }, cursor: "pointer" })}">Lihat Semua</button>
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

function kpiTile(label: string, value: number, tone: "neutral" | "success" | "danger" | "info"): string {
  return `
    <div class="${kpiCard({ tone })}">
      <div>
        <p class="${css({ fontSize: "xs", fontWeight: "bold", color: "slate.500", textTransform: "uppercase", letterSpacing: "wide", mb: "1" })}">${escapeHTML(label)}</p>
        <p class="${css({ fontSize: "3xl", fontWeight: "bold", color: "slate.800" })}">${value}</p>
      </div>
    </div>`;
}
