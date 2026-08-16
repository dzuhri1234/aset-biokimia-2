export function escapeHTML(str: unknown): string {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.innerText = String(str);
  return div.innerHTML;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return escapeHTML(dateStr);
  return d.toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return escapeHTML(dateStr);
  return d.toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function showToast(msg: string, type: "success" | "error" | "warning" = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  const bg = type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#10b981";
  toast.style.cssText = `background:${bg};color:white;padding:12px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);font-size:14px;font-weight:500;transition:all .3s ease;transform:translateY(8px);opacity:0;max-width:340px;`;
  toast.innerText = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = "translateY(0)"; toast.style.opacity = "1"; });
  setTimeout(() => {
    toast.style.opacity = "0"; toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Menyahaktifkan suntikan formula CSV (=, +, -, @ pada permulaan medan)
// supaya laporan yang dibuka dalam Excel tidak menjalankan formula tanpa disedari.
function csvSafe(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.replace(/"/g, '""');
}

export function downloadCSV(filenamePrefix: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) {
    showToast("Tiada data untuk dieksport.", "warning");
    return;
  }
  const keys = Object.keys(rows[0]);
  let csv = keys.join(",") + "\n";
  rows.forEach((row) => {
    csv += keys.map((k) => `"${csvSafe(row[k])}"`).join(",") + "\n";
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Laporan CSV berjaya dimuat turun.");
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  }) as T;
}
