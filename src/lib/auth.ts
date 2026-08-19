import { supabase } from "./supabase";
import { STATE, rerender } from "./state";
import type { ModuleName, AccessLevel } from "./types";
import { MODULES } from "./types";
import { fetchAllData } from "./data";
import { showToast } from "./utils";

export async function initAuth() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      if (session) STATE.session = { userId: session.user.id, email: session.user.email || "" };
      STATE.authMode = "passwordRecovery";
      STATE.loading = false;
      rerender();
      return;
    }
    if (session) {
      STATE.session = { userId: session.user.id, email: session.user.email || "" };
      if (STATE.authMode === "passwordRecovery") return; // tunggu pengguna tetapkan kata laluan baharu dulu
      await completeLogin();
    } else {
      STATE.session = null;
      STATE.profile = null;
      STATE.loading = false;
      rerender();
    }
  });
}

async function completeLogin() {
  const ok = await loadProfileAndPermissions();
  if (!ok) {
    await supabase.auth.signOut();
    return;
  }
  await fetchAllData();
  STATE.loading = false;
  STATE.authMode = "login";
  rerender();
}

async function loadProfileAndPermissions(): Promise<boolean> {
  if (!STATE.session) return false;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", STATE.session.userId)
    .single();

  if (error || !profile) {
    showToast("Akaun anda tidak berdaftar dalam sistem. Sila hubungi Admin.", "error");
    return false;
  }
  if (!profile.is_active) {
    showToast("Akaun anda telah dinyahaktifkan. Sila hubungi Admin.", "error");
    return false;
  }
  STATE.profile = profile;

  // reset lalai
  const perms: Record<ModuleName, AccessLevel> = {
    assets: "none", inspections: "none", movements: "none",
    maintenance: "none", damage: "none", disposals: "none", master_data: "none",
  };

  if (profile.role !== "ADMIN") {
    const { data: modulePerms } = await supabase
      .from("module_permissions")
      .select("module, access_level")
      .eq("user_id", profile.id);
    (modulePerms || []).forEach((p: { module: ModuleName; access_level: AccessLevel }) => {
      perms[p.module] = p.access_level;
    });
  } else {
    MODULES.forEach((m) => (perms[m] = "edit"));
  }
  STATE.permissions = perms;
  return true;
}

export async function handleLogin(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return error.message;
  return null;
}

export async function handleForgotPassword(email: string): Promise<string | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) return error.message;
  return null;
}

export async function handleUpdatePasswordAfterRecovery(newPassword: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return error.message;
  await completeLogin();
  return null;
}

export async function handleLogout() {
  await supabase.auth.signOut();
}
