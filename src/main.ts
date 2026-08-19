import "./styles.css";
import { supabase } from "./lib/supabase";
import { STATE, rerender, bindRender, canEdit, isAdmin } from "./lib/state";
import { initAuth, handleLogin, handleLogout, handleForgotPassword, handleUpdatePasswordAfterRecovery } from "./lib/auth";
import { fetchAllData } from "./lib/data";
import { showToast, debounce } from "./lib/utils";
import { renderLogin, setLoginError, setLoginLoading, setForgotPasswordSent } from "./views/login";
import { renderShell } from "./views/shell";
import { renderDashboard } from "./views/dashboard";
import { renderAssetsList, renderAssetForm, renderAssetProfile } from "./views/assets";
import { renderTxModule, renderTxForm, renderTxView, getTxModuleTitle } from "./views/transactions";
import type { TxModule } from "./views/transactions";
import { renderMasterData, renderMasterForm, getMasterTitle } from "./views/masterData";
import type { MasterType } from "./views/masterData";
import { renderReports, runExport, runExportPdf } from "./views/reports";
import { renderUsers, renderUserForm, renderPermissionsForm, renderResetPasswordForm } from "./views/users";
import { renderAuditTrail } from "./views/auditTrail";
import { renderModal } from "./views/modal";
import { printMovementForm, printMaintenanceForm, printDamageForm } from "./lib/print";
import { callEdgeFunction } from "./lib/supabase";
import { MODULES } from "./lib/types";
import type { ViewName } from "./lib/types";

const app = document.getElementById("app")!;

function render() {
  if (STATE.loading) {
    app.innerHTML = `<div style="height:100vh;display:flex;align-items:center;justify-content:center;color:#64748b;font-family:sans-serif;">Menyambung ke pangkalan data...</div>`;
    return;
  }
  if (!STATE.session || !STATE.profile || STATE.authMode !== "login") {
    app.innerHTML = renderLogin();
    return;
  }

  let content = "";
  switch (STATE.view) {
    case "dashboard": content = renderDashboard(); break;
    case "assets": content = renderAssetsList(); break;
    case "assetProfile": content = STATE.selectedAssetId ? renderAssetProfile(STATE.selectedAssetId) : renderAssetsList(); break;
    case "movements": case "maintenance": case "damage": case "inspections": case "disposals":
      content = renderTxModule(STATE.view); break;
    case "locations": case "categories": case "personnel":
      content = renderMasterData(STATE.view); break;
    case "reports": content = renderReports(); break;
    case "users": content = isAdmin() ? renderUsers() : renderDashboard(); break;
    case "auditTrail": content = isAdmin() ? renderAuditTrail() : renderDashboard(); break;
    default: content = renderDashboard();
  }

  let html = `<div style="display:flex;height:100vh;overflow:hidden;">${renderShell(content)}</div>`;
  if (STATE.modal) html += buildModalHtml();
  app.innerHTML = html;

  if (STATE.view === "assets") {
    const el = document.getElementById("assetSearchInput") as HTMLInputElement | null;
    if (el && document.activeElement !== el && (window as any).__wasSearchFocused) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }
}

function buildModalHtml(): string {
  const m = STATE.modal!;
  switch (m.type) {
    case "assetForm":
      return renderModal(m.id ? "Kemaskini Aset" : "Daftar Aset Baharu", renderAssetForm(m.id));
    case "txForm": {
      const mod = m.mod as TxModule;
      const record = m.id ? (STATE.data as any)[mod].find((r: any) => r.id === m.id) : null;
      return renderModal((record ? "Kemaskini - " : "") + getTxModuleTitle(mod), renderTxForm(mod, m.presetAssetId, record));
    }
    case "txView": {
      const mod = m.mod as TxModule;
      const record = (STATE.data as any)[mod].find((r: any) => r.id === m.id);
      return renderModal(getTxModuleTitle(mod), record ? renderTxView(mod, record) : "Rekod tidak dijumpai.");
    }
    case "masterForm":
      return renderModal(getMasterTitle(m.masterType as MasterType, !!m.id), renderMasterForm(m.masterType as MasterType, m.id));
    case "userForm":
      return renderModal("Tambah Pengguna Baharu", renderUserForm());
    case "permissionsForm":
      return renderModal("Kebenaran Modul", renderPermissionsForm(m.userId!, m.perms || {}));
    case "resetPasswordForm":
      return renderModal("Set Semula Kata Laluan", renderResetPasswordForm(m.userId!));
    default:
      return "";
  }
}

bindRender(render);

// ============================================================
// EVENT DELEGATION
// ============================================================
document.addEventListener("click", async (e) => {
  const target = (e.target as HTMLElement).closest("[data-action]") as HTMLElement | null;
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case "navigate": {
      STATE.view = target.dataset.view as ViewName;
      STATE.modal = null;
      STATE.sidebarOpen = false;
      if (target.dataset.statusfilter !== undefined) {
        STATE.filters.status = target.dataset.statusfilter;
        STATE.assetPage = 1;
      }
      if (STATE.view === "assets" && target.dataset.statusfilter === undefined) STATE.assetPage = 1;
      rerender();
      break;
    }
    case "openSidebar": STATE.sidebarOpen = true; rerender(); break;
    case "closeSidebar": STATE.sidebarOpen = false; rerender(); break;
    case "closeModal":
      if (target.dataset.overlay && e.target !== target) return;
      STATE.modal = null; rerender();
      break;
    case "logout": await handleLogout(); break;

    case "viewAssetProfile":
      STATE.selectedAssetId = target.dataset.id || null;
      STATE.view = "assetProfile";
      rerender();
      break;
    case "backToAssetsList":
      STATE.view = "assets";
      rerender();
      break;
    case "printAssetProfile":
      window.print();
      break;
    case "openAssetForm":
      if (!canEdit("assets")) return;
      STATE.modal = { type: "assetForm", id: target.dataset.id || null };
      rerender();
      break;

    case "openTxForm":
      STATE.modal = { type: "txForm", mod: target.dataset.mod, id: target.dataset.id || null, presetAssetId: STATE.selectedAssetId };
      rerender();
      break;
    case "openTxView":
      STATE.modal = { type: "txView", mod: target.dataset.mod, id: target.dataset.id };
      rerender();
      break;
    case "printTxRecord": {
      const mod = target.dataset.mod as TxModule;
      const id = target.dataset.id!;
      const record = (STATE.data as any)[mod].find((r: any) => r.id === id);
      if (!record) return;
      if (mod === "movements") printMovementForm(record);
      else if (mod === "maintenance") printMaintenanceForm(record);
      else if (mod === "damage") printDamageForm(record);
      break;
    }
    case "downloadTxWord": {
      const mod = target.dataset.mod as TxModule;
      const id = target.dataset.id!;
      const record = (STATE.data as any)[mod].find((r: any) => r.id === id);
      if (!record) return;
      const btn = target as HTMLButtonElement;
      const original = btn.innerHTML;
      btn.innerHTML = "Menjana...";
      (btn as HTMLButtonElement).disabled = true;
      try {
        const wordExport = await import("./lib/wordExport");
        if (mod === "movements") await wordExport.downloadMovementDocx(record);
        else if (mod === "maintenance") await wordExport.downloadMaintenanceDocx(record);
        else if (mod === "damage") await wordExport.downloadDamageDocx(record);
      } catch (err: any) {
        showToast("Gagal menjana fail Word: " + (err.message || "ralat tidak diketahui"), "error");
      } finally {
        btn.innerHTML = original;
        btn.disabled = false;
      }
      break;
    }

    case "openMasterForm":
      STATE.modal = { type: "masterForm", masterType: target.dataset.type, id: target.dataset.id || null };
      rerender();
      break;

    case "assetPagePrev": STATE.assetPage--; rerender(); break;
    case "assetPageNext": STATE.assetPage++; rerender(); break;

    case "exportCsv": runExport(target.dataset.report!); break;
    case "exportPdf": runExportPdf(target.dataset.report!); break;

    case "openUserForm":
      STATE.modal = { type: "userForm" };
      rerender();
      break;

    case "openResetPasswordForm":
      STATE.modal = { type: "resetPasswordForm", userId: target.dataset.id };
      rerender();
      break;

    case "openPermissionsForm": {
      const userId = target.dataset.id!;
      const { data } = await supabase.from("module_permissions").select("module, access_level").eq("user_id", userId);
      const perms: Record<string, string> = {};
      (data || []).forEach((p: any) => (perms[p.module] = p.access_level));
      STATE.modal = { type: "permissionsForm", userId, perms };
      rerender();
      break;
    }

    case "toggleUserActive": {
      const userId = target.dataset.id!;
      const isActive = target.dataset.active === "true";
      if (!confirm(isActive ? "Nyahaktifkan pengguna ini?" : "Aktifkan semula pengguna ini?")) return;
      try {
        await callEdgeFunction("admin-set-active", { user_id: userId, is_active: !isActive });
        await fetchAllData();
        showToast("Status pengguna dikemaskini.");
        rerender();
      } catch (err: any) {
        showToast(err.message || "Gagal mengemaskini status.", "error");
      }
      break;
    }

    case "showForgotPassword":
      STATE.authMode = "forgotPassword";
      setLoginError("");
      setForgotPasswordSent(false);
      rerender();
      break;
    case "backToLogin":
      STATE.authMode = "login";
      setLoginError("");
      rerender();
      break;

    case "selectTxAsset": {
      const id = target.dataset.id!;
      const label = target.dataset.label || "";
      const input = document.getElementById("txAssetSearchInput") as HTMLInputElement | null;
      const hidden = document.getElementById("txAssetIdHidden") as HTMLInputElement | null;
      const results = document.getElementById("txAssetSearchResults") as HTMLDivElement | null;
      if (input) input.value = label;
      if (hidden) hidden.value = id;
      if (results) results.style.display = "none";
      break;
    }
  }
});

document.addEventListener("input", (e) => {
  const target = e.target as HTMLElement;
  if (target.dataset.action === "assetSearch") {
    (window as any).__wasSearchFocused = true;
    debouncedSearch((target as HTMLInputElement).value);
  }
  if (target.dataset.action === "txAssetSearch") {
    debouncedTxAssetSearch((target as HTMLInputElement).value);
  }
});
const debouncedSearch = debounce((val: string) => {
  STATE.filters.search = val;
  STATE.assetPage = 1;
  rerender();
}, 250);

const debouncedTxAssetSearch = debounce((val: string) => {
  const results = document.getElementById("txAssetSearchResults") as HTMLDivElement | null;
  const hidden = document.getElementById("txAssetIdHidden") as HTMLInputElement | null;
  if (!results) return;
  const q = val.trim().toLowerCase();
  if (!q) { results.style.display = "none"; if (hidden) hidden.value = ""; return; }
  const matches = STATE.data.assets.filter((a) =>
    (a.registration_no || "").toLowerCase().includes(q) ||
    (a.unique_id || "").toLowerCase().includes(q) ||
    (a.description || "").toLowerCase().includes(q)
  ).slice(0, 20);
  if (!matches.length) {
    results.innerHTML = `<div style="padding:10px 12px;font-size:13px;color:#94a3b8;">Tiada aset dijumpai.</div>`;
    results.style.display = "block";
    return;
  }
  results.innerHTML = matches.map((a) => {
    const label = `${a.registration_no || a.unique_id} — ${a.description}`;
    const safeLabel = label.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    return `<button type="button" data-action="selectTxAsset" data-id="${a.id}" data-label="${safeLabel}" style="display:block;width:100%;text-align:left;padding:8px 12px;font-size:13px;border:none;background:white;cursor:pointer;border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
      <span style="font-weight:600;">${(a.registration_no || a.unique_id).replace(/</g, "&lt;")}</span>
      <span style="color:#64748b;"> — ${a.description.replace(/</g, "&lt;").substring(0, 50)}</span>
    </button>`;
  }).join("");
  results.style.display = "block";
  if (hidden) hidden.value = ""; // pilihan mesti disahkan melalui klik, elak simpan tanpa memilih
}, 200);

document.addEventListener("change", (e) => {
  const target = e.target as HTMLElement;
  if (target.dataset.action === "assetStatusFilter") {
    STATE.filters.status = (target as HTMLSelectElement).value;
    STATE.assetPage = 1;
    rerender();
  }
  if (target.dataset.action === "assetLocationFilter") {
    STATE.filters.location = (target as HTMLSelectElement).value;
    STATE.assetPage = 1;
    rerender();
  }
  if (target.dataset.action === "maintenanceStatusFilter") {
    STATE.maintenanceStatusFilter = (target as HTMLSelectElement).value;
    rerender();
  }
  if (target.id === "assetLocationSelect") {
    const locId = (target as HTMLSelectElement).value;
    const loc = STATE.data.locations.find((l) => l.id === locId);
    const codeField = document.getElementById("assetPlacementCode") as HTMLInputElement | null;
    if (codeField) codeField.value = loc?.code || "";
  }
  if (target.id === "assetPhotoInput") {
    const file = (target as HTMLInputElement).files?.[0];
    if (file) {
      const preview = document.getElementById("assetPhotoPreview");
      if (preview) {
        const url = URL.createObjectURL(file);
        preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />`;
      }
    }
  }
});

// ============================================================
// FORM SUBMISSIONS
// ============================================================
document.addEventListener("submit", async (e) => {
  const form = (e.target as HTMLElement).closest("form") as HTMLFormElement | null;
  if (!form) return;
  e.preventDefault();

  if (form.id === "loginForm") return void onLoginSubmit(form);
  if (form.id === "forgotForm") return void onForgotSubmit(form);
  if (form.id === "recoveryForm") return void onRecoverySubmit(form);

  const formType = form.dataset.form;
  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  const originalLabel = submitBtn?.innerHTML || "";
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "Menyimpan..."; }

  try {
    if (formType === "asset") await onAssetSubmit(form);
    else if (formType === "tx") await onTxSubmit(form);
    else if (formType === "master") await onMasterSubmit(form);
    else if (formType === "newUser") await onNewUserSubmit(form);
    else if (formType === "permissions") await onPermissionsSubmit(form);
    else if (formType === "resetPassword") await onResetPasswordSubmit(form);
  } catch (err: any) {
    showToast(err.message || "Ralat tidak dijangka berlaku.", "error");
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalLabel; }
  }
});

async function onLoginSubmit(form: HTMLFormElement) {
  const email = (form.querySelector("#loginEmail") as HTMLInputElement).value.trim();
  const password = (form.querySelector("#loginPassword") as HTMLInputElement).value;
  const btn = form.querySelector("#loginBtn") as HTMLButtonElement;
  setLoginLoading(true); setLoginError("");
  btn.disabled = true; btn.innerText = "Log masuk...";
  rerender();
  const err = await handleLogin(email, password);
  setLoginLoading(false);
  if (err) {
    setLoginError("E-mel atau kata laluan tidak sah.");
    rerender();
  }
}

async function onForgotSubmit(form: HTMLFormElement) {
  const email = (form.querySelector("#forgotEmail") as HTMLInputElement).value.trim();
  setLoginLoading(true); setLoginError("");
  rerender();
  const err = await handleForgotPassword(email);
  setLoginLoading(false);
  if (err) { setLoginError(err); rerender(); return; }
  setForgotPasswordSent(true);
  rerender();
}

async function onRecoverySubmit(form: HTMLFormElement) {
  const password = (form.querySelector("#recoveryPassword") as HTMLInputElement).value;
  setLoginLoading(true); setLoginError("");
  rerender();
  const err = await handleUpdatePasswordAfterRecovery(password);
  setLoginLoading(false);
  if (err) { setLoginError(err); rerender(); return; }
  showToast("Kata laluan berjaya dikemaskini.");
}

async function onAssetSubmit(form: HTMLFormElement) {
  if (!canEdit("assets")) { showToast("Anda tiada kebenaran untuk tindakan ini.", "error"); return; }
  const fd = new FormData(form);
  const id = form.dataset.id || null;
  const regNo = String(fd.get("registration_no") || "").trim();

  if (regNo) {
    const dupReg = STATE.data.assets.find((a) => a.id !== id && (a.registration_no || "").toLowerCase() === regNo.toLowerCase());
    if (dupReg) { showToast(`No. Siri Pendaftaran "${regNo}" telah digunakan.`, "error"); return; }
  }

  const locationId = String(fd.get("location_id") || "") || null;
  const location = locationId ? STATE.data.locations.find((l) => l.id === locationId) : null;

  // Muat naik gambar aset jika dipilih
  let photoUrl: string | null | undefined = undefined;
  const photoInput = document.getElementById("assetPhotoInput") as HTMLInputElement | null;
  const file = photoInput?.files?.[0];
  if (file) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${id || "new"}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("asset-photos").upload(path, file, { upsert: true });
    if (uploadErr) { showToast("Gagal muat naik gambar: " + uploadErr.message, "error"); return; }
    const { data: pub } = supabase.storage.from("asset-photos").getPublicUrl(path);
    photoUrl = pub.publicUrl;
  }

  const payload: Record<string, unknown> = {
    registration_no: regNo || null,
    description: String(fd.get("description") || "").trim(),
    status: String(fd.get("status") || "MASIH DIGUNAKAN"),
    category_id: String(fd.get("category_id") || "") || null,
    location_id: locationId,
    pic_id: String(fd.get("pic_id") || "") || null,
    placement_date: String(fd.get("placement_date") || "") || null,
    placement_code: location?.code || null,
    maintenance_required: fd.get("maintenance_required") === "true",
    last_maintenance_year: fd.get("last_maintenance_year") ? Number(fd.get("last_maintenance_year")) : null,
    notes: String(fd.get("notes") || "").trim() || null,
  };
  if (photoUrl !== undefined) payload.photo_url = photoUrl;

  const { error } = id
    ? await supabase.from("assets").update(payload).eq("id", id)
    : await supabase.from("assets").insert(payload);

  if (error) { showToast("Gagal menyimpan: " + error.message, "error"); return; }
  await fetchAllData();
  STATE.modal = null;
  showToast(id ? "Aset berjaya dikemaskini." : "Aset baharu berjaya didaftarkan.");
  rerender();
}

async function onTxSubmit(form: HTMLFormElement) {
  const mod = form.dataset.mod as string;
  if (!canEdit(mod as any)) { showToast("Anda tiada kebenaran untuk tindakan ini.", "error"); return; }

  const hiddenAssetId = (document.getElementById("txAssetIdHidden") as HTMLInputElement | null)?.value || "";
  if (!hiddenAssetId) { showToast("Sila pilih aset daripada senarai cadangan carian.", "error"); return; }

  const fd = new FormData(form);
  const payload: Record<string, unknown> = { asset_id: hiddenAssetId };
  fd.forEach((value, key) => {
    if (key === "asset_id") return;
    payload[key] = value === "" ? null : value;
  });
  if ("cost" in payload && payload.cost !== null) payload.cost = Number(payload.cost);
  if ("repair_cost" in payload && payload.repair_cost !== null) payload.repair_cost = Number(payload.repair_cost);

  const recordId = form.dataset.recordid;
  const { error } = recordId
    ? await supabase.from(mod).update(payload).eq("id", recordId)
    : await supabase.from(mod).insert(payload);

  if (error) { showToast("Gagal menyimpan: " + error.message, "error"); return; }
  await fetchAllData();
  STATE.modal = null;
  showToast("Rekod berjaya disimpan.");
  rerender();
}

async function onMasterSubmit(form: HTMLFormElement) {
  if (!canEdit("master_data")) { showToast("Anda tiada kebenaran untuk tindakan ini.", "error"); return; }
  const type = form.dataset.type as "locations" | "categories" | "personnel";
  const id = form.dataset.id || null;
  const fd = new FormData(form);
  const payload: Record<string, unknown> = { name: String(fd.get("name") || "").trim() };
  if (type === "locations") payload.code = String(fd.get("code") || "").trim() || null;
  if (type === "personnel") {
    payload.position = String(fd.get("position") || "").trim() || null;
    payload.department = String(fd.get("department") || "").trim() || null;
  }
  const { error } = id
    ? await supabase.from(type).update(payload).eq("id", id)
    : await supabase.from(type).insert(payload);
  if (error) { showToast("Gagal menyimpan: " + error.message, "error"); return; }
  await fetchAllData();
  STATE.modal = null;
  showToast("Berjaya disimpan.");
  rerender();
}

async function onNewUserSubmit(form: HTMLFormElement) {
  if (!isAdmin()) { showToast("Hanya Admin boleh mencipta pengguna.", "error"); return; }
  const fd = new FormData(form);
  const role = String(fd.get("role") || "STAFF");
  const permissions: Record<string, string> = {};
  MODULES.forEach((m) => { permissions[m] = String(fd.get(`perm_${m}`) || "none"); });

  const payload = {
    name: String(fd.get("name") || "").trim(),
    email: String(fd.get("email") || "").trim().toLowerCase(),
    password: String(fd.get("password") || ""),
    role,
    permissions,
  };

  await callEdgeFunction("admin-create-user", payload);
  await fetchAllData();
  STATE.modal = null;
  showToast("Pengguna baharu berjaya dicipta.");
  rerender();
}

async function onPermissionsSubmit(form: HTMLFormElement) {
  if (!isAdmin()) return;
  const userId = form.dataset.userid!;
  const fd = new FormData(form);
  const rows = MODULES.map((m) => ({ user_id: userId, module: m, access_level: String(fd.get(`perm_${m}`) || "none") }));

  const { error: delErr } = await supabase.from("module_permissions").delete().eq("user_id", userId);
  if (delErr) { showToast("Gagal kemaskini: " + delErr.message, "error"); return; }
  const { error: insErr } = await supabase.from("module_permissions").insert(rows);
  if (insErr) { showToast("Gagal kemaskini: " + insErr.message, "error"); return; }

  STATE.modal = null;
  showToast("Kebenaran modul berjaya dikemaskini.");
  rerender();
}

async function onResetPasswordSubmit(form: HTMLFormElement) {
  if (!isAdmin()) return;
  const userId = form.dataset.userid!;
  const fd = new FormData(form);
  const newPassword = String(fd.get("new_password") || "");
  await callEdgeFunction("admin-reset-password", { user_id: userId, new_password: newPassword });
  STATE.modal = null;
  showToast("Kata laluan berjaya ditetapkan semula.");
  rerender();
}

// ============================================================
// BOOTSTRAP
// ============================================================
initAuth();
render();
