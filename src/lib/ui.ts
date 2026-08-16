import { css, cva } from "../../styled-system/css";

export const card = css({
  bg: "white", borderRadius: "xl", border: "1px solid", borderColor: "slate.200",
  boxShadow: "sm", display: "flex", flexDirection: "column",
});

export const cardHeader = css({
  p: "4", borderBottom: "1px solid", borderColor: "slate.200",
  display: "flex", justifyContent: "space-between", alignItems: "center",
  bg: "slate.50", borderTopRadius: "xl", gap: "3", flexWrap: "wrap",
});

export const cardTitle = css({ fontWeight: "bold", color: "slate.800", fontSize: "sm" });

export const buttonRecipe = cva({
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "1.5",
    fontWeight: "semibold", fontSize: "sm", borderRadius: "lg", px: "4", py: "2",
    cursor: "pointer", transition: "all .15s ease", border: "1px solid transparent",
    _disabled: { opacity: 0.5, cursor: "not-allowed" },
  },
  variants: {
    variant: {
      primary: { bg: "primary.500", color: "white", _hover: { bg: "primary.600" } },
      danger: { bg: "danger.50", color: "danger.700", borderColor: "danger.500/30", _hover: { bg: "danger.100" } },
      ghost: { bg: "transparent", color: "slate.500", _hover: { color: "slate.800", bg: "slate.100" } },
      outline: { bg: "white", color: "slate.700", borderColor: "slate.300", _hover: { bg: "slate.50" } },
    },
    size: {
      sm: { fontSize: "xs", px: "3", py: "1.5" },
      md: {},
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export const inputClass = css({
  width: "full", px: "4", py: "2", fontSize: "sm", border: "1px solid", borderColor: "slate.300",
  borderRadius: "lg", outline: "none", bg: "white",
  _focus: { borderColor: "primary.500", boxShadow: "0 0 0 3px rgba(37,99,171,0.15)" },
});

export const labelClass = css({ display: "block", fontSize: "sm", fontWeight: "semibold", color: "slate.700", mb: "1.5" });

export const badgeRecipe = cva({
  base: {
    display: "inline-block", px: "2.5", py: "1", fontSize: "10px", fontWeight: "bold",
    borderRadius: "full", border: "1px solid", whiteSpace: "nowrap", textTransform: "uppercase",
    letterSpacing: "wide",
  },
  variants: {
    tone: {
      success: { bg: "success.50", color: "success.700", borderColor: "success.500/30" },
      danger: { bg: "danger.50", color: "danger.700", borderColor: "danger.500/30" },
      warning: { bg: "warning.50", color: "warning.700", borderColor: "warning.500/30" },
      info: { bg: "info.50", color: "info.700", borderColor: "info.500/30" },
      neutral: { bg: "slate.100", color: "slate.600", borderColor: "slate.200" },
      purple: { bg: "#f5f3ff", color: "#6d28d9", borderColor: "#c4b5fd" },
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function statusTone(status: string): "success" | "danger" | "warning" | "neutral" | "info" | "purple" {
  switch ((status || "").toUpperCase()) {
    case "MASIH DIGUNAKAN": case "SELESAI": case "BAIK": case "DILULUSKAN": return "success";
    case "ROSAK": case "DILAPORKAN": case "TINGGI": case "DITOLAK": return "danger";
    case "CADANG LUPUS": case "CADANGAN": case "SEDERHANA": return "warning";
    case "DILUPUSKAN": return "neutral";
    case "DIPINJAM": case "DALAM PERGERAKAN": return "info";
    case "DISELENGGARA": case "SEDANG DISELENGGARA": case "DIJADUALKAN": return "purple";
    default: return "neutral";
  }
}

export const tableWrap = css({ overflowX: "auto" });
export const table = css({ width: "full", textAlign: "left", borderCollapse: "collapse" });
export const thead = css({
  bg: "slate.50", borderBottom: "1px solid", borderColor: "slate.200",
  fontSize: "xs", fontWeight: "semibold", color: "slate.500", textTransform: "uppercase", letterSpacing: "wide",
});
export const th = css({ p: "4" });
export const tbody = css({ "& > tr": { borderBottom: "1px solid", borderColor: "slate.100" } });
export const td = css({ p: "4", fontSize: "sm", color: "slate.700" });
export const trHover = css({ _hover: { bg: "slate.50" } });

export const emptyState = css({ p: "8", textAlign: "center", color: "slate.500", fontSize: "sm" });

export const pageWrap = css({ maxWidth: "7xl", mx: "auto", display: "flex", flexDirection: "column", gap: "6" });

export const kpiGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: "4" });

export const kpiCard = cva({
  base: { bg: "white", borderRadius: "xl", border: "1px solid", p: "5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  variants: {
    tone: {
      neutral: { borderColor: "slate.200" },
      success: { borderColor: "success.500/30", bg: "success.50/40" },
      danger: { borderColor: "danger.500/30", bg: "danger.50/40" },
      info: { borderColor: "info.500/30", bg: "info.50/40" },
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const modalOverlay = css({
  position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
  p: "4", bg: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)",
});
export const modalBox = css({
  bg: "white", borderRadius: "2xl", boxShadow: "2xl", width: "full", maxWidth: "3xl",
  maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden",
});
export const modalHeader = css({
  px: "6", py: "4", borderBottom: "1px solid", borderColor: "slate.200",
  display: "flex", justifyContent: "space-between", alignItems: "center", bg: "slate.50",
});
export const modalBody = css({ p: "6", overflowY: "auto", flex: "1" });

export const formGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "5" });
export const formActions = css({ pt: "4", borderTop: "1px solid", borderColor: "slate.100", display: "flex", justifyContent: "flex-end", gap: "3" });
