import { STATE } from "../lib/state";
import { card, tableWrap, table, thead, th, tbody, td, trHover, emptyState, badgeRecipe } from "../lib/ui";
import { escapeHTML, formatDateTime } from "../lib/utils";

export function renderAuditTrail(): string {
  const logs = STATE.data.auditLogs;
  return `
    <div class="${card}">
      <div class="${tableWrap}">
        <table class="${table}">
          <thead class="${thead}"><tr>
            <th class="${th}">Tarikh/Masa</th><th class="${th}">Pengguna</th><th class="${th}">Tindakan</th>
            <th class="${th}">Jadual</th><th class="${th}">Keterangan</th>
          </tr></thead>
          <tbody class="${tbody}">
            ${logs.length ? logs.map((l) => `
              <tr class="${trHover}">
                <td class="${td}" style="white-space:nowrap;">${formatDateTime(l.created_at)}</td>
                <td class="${td}">${escapeHTML(l.user_email)}</td>
                <td class="${td}"><span class="${badgeRecipe({ tone: l.action === "DELETE" ? "danger" : l.action === "UPDATE" ? "warning" : "success" })}">${escapeHTML(l.action)}</span></td>
                <td class="${td}">${escapeHTML(l.table_name)}</td>
                <td class="${td}">${escapeHTML(l.description || "-")}</td>
              </tr>`).join("") : `<tr><td colspan="5" class="${emptyState}">Tiada log audit lagi.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}
