import { css } from "../../styled-system/css";
import { modalOverlay, modalBox, modalHeader, modalBody } from "../lib/ui";
import { escapeHTML } from "../lib/utils";

export function renderModal(title: string, bodyHtml: string): string {
  return `
    <div class="${modalOverlay}" data-action="closeModal" data-overlay="1">
      <div class="${modalBox}">
        <div class="${modalHeader}">
          <h3 class="${css({ fontWeight: "bold", color: "slate.800" })}">${escapeHTML(title)}</h3>
          <button data-action="closeModal" class="${css({ color: "slate.400", _hover: { color: "slate.700" }, fontSize: "xl", cursor: "pointer", lineHeight: "1" })}">&times;</button>
        </div>
        <div class="${modalBody}">${bodyHtml}</div>
      </div>
    </div>`;
}
