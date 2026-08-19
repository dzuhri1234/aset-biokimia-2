import { css } from "../../styled-system/css";
import { inputClass, labelClass, buttonRecipe } from "../lib/ui";
import { escapeHTML } from "../lib/utils";
import { STATE } from "../lib/state";

let loginError = "";
let loginLoading = false;
let forgotPasswordSent = false;

export function setLoginError(msg: string) {
  loginError = msg;
}
export function setLoginLoading(v: boolean) {
  loginLoading = v;
}
export function setForgotPasswordSent(v: boolean) {
  forgotPasswordSent = v;
}

// Latar belakang guna corak CSS (bukan imej luar) - kekal profesional & tak
// bergantung kepada sambungan pihak ketiga. Warna dipetik daripada logo JPV
// (navy + kuning + merah).
const shellClass = css({
  width: "full", height: "full", minHeight: "100vh", display: "flex",
  alignItems: "center", justifyContent: { base: "center", lg: "flex-end" },
  p: { base: "4", lg: "16" },
  bg: "navy.900",
  backgroundImage:
    "radial-gradient(circle at 15% 20%, rgba(37,99,171,0.35), transparent 40%), " +
    "radial-gradient(circle at 85% 80%, rgba(220,38,38,0.25), transparent 45%), " +
    "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
  position: "relative",
  overflow: "hidden",
});

const patternOverlay = css({
  position: "absolute", inset: 0, opacity: 0.06,
  backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 16px)",
});

const panelClass = css({
  bg: "white", borderRadius: "2xl", boxShadow: "2xl", width: "full", maxWidth: "sm",
  overflow: "hidden", position: "relative", zIndex: 1,
});

function shell(inner: string): string {
  return `<div class="${shellClass}"><div class="${patternOverlay}"></div><div class="${panelClass}">${inner}</div></div>`;
}

function header(): string {
  return `
    <div class="${css({ px: "8", pt: "8", pb: "6", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderBottom: "1px solid", borderColor: "slate.100" })}">
      <img src="${import.meta.env.BASE_URL}logo-jpv.png" alt="Logo Jabatan Perkhidmatan Veterinar Malaysia" class="${css({ width: "16", height: "16", objectFit: "contain", mb: "3" })}" />
      <h1 class="${css({ fontSize: "lg", fontWeight: "bold", color: "slate.800", lineHeight: "tight" })}">Sistem Pengurusan Aset Alih</h1>
      <p class="${css({ color: "slate.500", fontSize: "xs", mt: "1", fontWeight: "medium" })}">Seksyen Biokimia &middot; Institut Penyelidikan Veterinar (VRI) Ipoh</p>
    </div>`;
}

export function renderLogin(): string {
  if (STATE.authMode === "passwordRecovery") return shell(renderRecoveryPanel());
  if (STATE.authMode === "forgotPassword") return shell(renderForgotPanel());
  return shell(renderLoginPanel());
}

function renderLoginPanel(): string {
  return `
    ${header()}
    <form id="loginForm" class="${css({ p: "8", display: "flex", flexDirection: "column", gap: "4" })}">
      ${loginError ? `<div class="${css({ bg: "danger.50", color: "danger.700", fontSize: "sm", p: "3", borderRadius: "lg", border: "1px solid", borderColor: "danger.500/30", textAlign: "center", fontWeight: "medium" })}">${escapeHTML(loginError)}</div>` : ""}
      <div>
        <label class="${labelClass}">E-mel Kakitangan</label>
        <input type="email" id="loginEmail" required class="${inputClass}" autocomplete="username" />
      </div>
      <div>
        <label class="${labelClass}">Kata Laluan</label>
        <input type="password" id="loginPassword" required class="${inputClass}" autocomplete="current-password" />
      </div>
      <button type="submit" id="loginBtn" ${loginLoading ? "disabled" : ""} class="${buttonRecipe({ variant: "primary" })}" style="width:100%;margin-top:8px;padding:12px;">
        ${loginLoading ? "Log masuk..." : "Log Masuk"}
      </button>
      <button type="button" data-action="showForgotPassword" class="${css({ fontSize: "xs", color: "primary.500", fontWeight: "semibold", cursor: "pointer", textAlign: "center", _hover: { textDecoration: "underline" } })}">
        Lupa kata laluan?
      </button>
    </form>`;
}

function renderForgotPanel(): string {
  if (forgotPasswordSent) {
    return `
      ${header()}
      <div class="${css({ p: "8", display: "flex", flexDirection: "column", gap: "4", textAlign: "center" })}">
        <div class="${css({ bg: "success.50", color: "success.700", p: "4", borderRadius: "lg", border: "1px solid", borderColor: "success.500/30", fontSize: "sm" })}">
          E-mel pautan set semula kata laluan telah dihantar. Sila semak peti masuk anda.
        </div>
        <button type="button" data-action="backToLogin" class="${buttonRecipe({ variant: "outline" })}">Kembali ke Log Masuk</button>
      </div>`;
  }
  return `
    ${header()}
    <form id="forgotForm" class="${css({ p: "8", display: "flex", flexDirection: "column", gap: "4" })}">
      <p class="${css({ fontSize: "sm", color: "slate.600" })}">Masukkan e-mel kakitangan anda. Pautan untuk menetapkan semula kata laluan akan dihantar ke e-mel tersebut.</p>
      ${loginError ? `<div class="${css({ bg: "danger.50", color: "danger.700", fontSize: "sm", p: "3", borderRadius: "lg", border: "1px solid", borderColor: "danger.500/30" })}">${escapeHTML(loginError)}</div>` : ""}
      <div>
        <label class="${labelClass}">E-mel</label>
        <input type="email" id="forgotEmail" required class="${inputClass}" />
      </div>
      <button type="submit" id="forgotBtn" ${loginLoading ? "disabled" : ""} class="${buttonRecipe({ variant: "primary" })}" style="width:100%;padding:12px;">
        ${loginLoading ? "Menghantar..." : "Hantar Pautan Set Semula"}
      </button>
      <button type="button" data-action="backToLogin" class="${css({ fontSize: "xs", color: "slate.500", fontWeight: "semibold", cursor: "pointer", textAlign: "center", _hover: { textDecoration: "underline" } })}">
        &larr; Kembali ke Log Masuk
      </button>
    </form>`;
}

function renderRecoveryPanel(): string {
  return `
    ${header()}
    <form id="recoveryForm" class="${css({ p: "8", display: "flex", flexDirection: "column", gap: "4" })}">
      <p class="${css({ fontSize: "sm", color: "slate.600" })}">Sila tetapkan kata laluan baharu untuk akaun anda.</p>
      ${loginError ? `<div class="${css({ bg: "danger.50", color: "danger.700", fontSize: "sm", p: "3", borderRadius: "lg", border: "1px solid", borderColor: "danger.500/30" })}">${escapeHTML(loginError)}</div>` : ""}
      <div>
        <label class="${labelClass}">Kata Laluan Baharu</label>
        <input type="password" id="recoveryPassword" required minlength="8" class="${inputClass}" />
      </div>
      <button type="submit" id="recoveryBtn" ${loginLoading ? "disabled" : ""} class="${buttonRecipe({ variant: "primary" })}" style="width:100%;padding:12px;">
        ${loginLoading ? "Menyimpan..." : "Simpan Kata Laluan"}
      </button>
    </form>`;
}
