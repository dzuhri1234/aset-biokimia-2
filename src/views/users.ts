import { css } from "../../styled-system/css";
import { STATE } from "../lib/state";
import { card, tableWrap, table, thead, th, tbody, td, trHover, emptyState, badgeRecipe, buttonRecipe, inputClass, labelClass, formActions, formGrid } from "../lib/ui";
import { escapeHTML } from "../lib/utils";
import { MODULES, MODULE_LABELS } from "../lib/types";

export function renderUsers(): string {
  const users = STATE.data.users;
  return `
    <div class="${css({ display: "flex", flexDirection: "column", gap: "4" })}">
      <div class="${css({ display: "flex", justifyContent: "flex-end" })}">
        <button data-action="openUserForm" class="${buttonRecipe({ variant: "primary" })}">+ Tambah Pengguna</button>
      </div>
      <div class="${card}">
        <div class="${tableWrap}">
          <table class="${table}">
            <thead class="${thead}"><tr>
              <th class="${th}">Nama</th><th class="${th}">E-mel</th><th class="${th}">Peranan</th>
              <th class="${th}">Status</th><th class="${th}" style="text-align:right;">Tindakan</th>
            </tr></thead>
            <tbody class="${tbody}">
              ${users.length ? users.map((u) => `
                <tr class="${trHover}">
                  <td class="${td}" style="font-weight:600;">${escapeHTML(u.name)}</td>
                  <td class="${td}">${escapeHTML(u.email)}</td>
                  <td class="${td}"><span class="${badgeRecipe({ tone: u.role === "ADMIN" ? "purple" : "neutral" })}">${escapeHTML(u.role)}</span></td>
                  <td class="${td}"><span class="${badgeRecipe({ tone: u.is_active ? "success" : "danger" })}">${u.is_active ? "AKTIF" : "TIDAK AKTIF"}</span></td>
                  <td class="${td}" style="text-align:right;">
                    ${u.role !== "ADMIN" ? `<button data-action="openPermissionsForm" data-id="${u.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "primary.500", cursor: "pointer", mr: "3" })}">Kebenaran</button>` : ""}
                    <button data-action="openResetPasswordForm" data-id="${u.id}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: "slate.500", cursor: "pointer", mr: "3" })}">Set Semula Kata Laluan</button>
                    <button data-action="toggleUserActive" data-id="${u.id}" data-active="${u.is_active}" class="${css({ fontSize: "xs", fontWeight: "semibold", color: u.is_active ? "danger.500" : "success.600", cursor: "pointer" })}">${u.is_active ? "Nyahaktifkan" : "Aktifkan"}</button>
                  </td>
                </tr>`).join("") : `<tr><td colspan="5" class="${emptyState}">Tiada pengguna.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

export function renderUserForm(): string {
  return `
    <form data-form="newUser" class="${css({ display: "flex", flexDirection: "column", gap: "5" })}">
      <div class="${formGrid}">
        <div><label class="${labelClass}">Nama Penuh <span style="color:#ef4444;">*</span></label><input type="text" name="name" required class="${inputClass}" /></div>
        <div><label class="${labelClass}">E-mel <span style="color:#ef4444;">*</span></label><input type="email" name="email" required class="${inputClass}" /></div>
        <div><label class="${labelClass}">Kata Laluan Sementara <span style="color:#ef4444;">*</span></label><input type="password" name="password" required minlength="8" class="${inputClass}" /></div>
        <div><label class="${labelClass}">Peranan</label>
          <select name="role" id="newUserRole" class="${inputClass}">
            <option value="STAFF">Kakitangan (STAFF)</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div id="newUserPermissions">
        <p class="${css({ fontSize: "sm", fontWeight: "semibold", color: "slate.700", mb: "2" })}">Kebenaran Modul (untuk peranan Kakitangan)</p>
        <div class="${css({ display: "flex", flexDirection: "column", gap: "2" })}">
          ${MODULES.map((m) => permissionRow(m, "read")).join("")}
        </div>
      </div>
      <div class="${formActions}"><button type="submit" class="${buttonRecipe({ variant: "primary" })}">Cipta Pengguna</button></div>
    </form>`;
}

export function renderPermissionsForm(userId: string, perms: Record<string, string>): string {
  return `
    <form data-form="permissions" data-userid="${userId}" class="${css({ display: "flex", flexDirection: "column", gap: "5" })}">
      <div id="permissionsRows" class="${css({ display: "flex", flexDirection: "column", gap: "2" })}">
        ${MODULES.map((m) => permissionRow(m, perms[m] || "none")).join("")}
      </div>
      <div class="${formActions}"><button type="submit" class="${buttonRecipe({ variant: "primary" })}">Kemaskini Kebenaran</button></div>
    </form>`;
}

function permissionRow(mod: string, current: string): string {
  return `
    <div class="${css({ display: "flex", justifyContent: "space-between", alignItems: "center", p: "3", bg: "slate.50", borderRadius: "lg", border: "1px solid", borderColor: "slate.200" })}">
      <span class="${css({ fontSize: "sm", fontWeight: "medium", color: "slate.700" })}">${escapeHTML((MODULE_LABELS as any)[mod])}</span>
      <select name="perm_${mod}" class="${inputClass}" style="width:auto;">
        <option value="none" ${current === "none" ? "selected" : ""}>Tiada Akses</option>
        <option value="read" ${current === "read" ? "selected" : ""}>Baca Sahaja</option>
        <option value="edit" ${current === "edit" ? "selected" : ""}>Boleh Edit</option>
      </select>
    </div>`;
}

export function renderResetPasswordForm(userId: string): string {
  return `
    <form data-form="resetPassword" data-userid="${userId}" class="${css({ display: "flex", flexDirection: "column", gap: "5" })}">
      <div><label class="${labelClass}">Kata Laluan Baharu <span style="color:#ef4444;">*</span></label><input type="password" name="new_password" required minlength="8" class="${inputClass}" /></div>
      <div class="${formActions}"><button type="submit" class="${buttonRecipe({ variant: "primary" })}">Set Semula Kata Laluan</button></div>
    </form>`;
}
