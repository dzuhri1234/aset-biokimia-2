import { css } from "../../styled-system/css";
import { inputClass, labelClass, buttonRecipe } from "../lib/ui";
import { escapeHTML } from "../lib/utils";

let loginError = "";
let loginLoading = false;

export function setLoginError(msg: string) {
  loginError = msg;
}
export function setLoginLoading(v: boolean) {
  loginLoading = v;
}

export function renderLogin(): string {
  return `
    <div class="${css({ width: "full", height: "full", display: "flex", alignItems: "center", justifyContent: "center", bg: "navy.900", backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)", backgroundSize: "20px 20px" })}">
      <div class="${css({ bg: "white", borderRadius: "2xl", boxShadow: "2xl", width: "full", maxWidth: "sm", overflow: "hidden" })}">
        <div class="${css({ bg: "primary.500", px: "8", py: "6", color: "white", textAlign: "center" })}">
          <h1 class="${css({ fontSize: "2xl", fontWeight: "bold", letterSpacing: "tight" })}">Aset Alih Biokimia</h1>
          <p class="${css({ color: "primary.100", fontSize: "sm", mt: "1" })}">Institut Penyelidikan Veterinar (VRI) Ipoh</p>
        </div>
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
        </form>
      </div>
    </div>`;
}
