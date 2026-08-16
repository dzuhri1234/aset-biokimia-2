import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  exclude: [],

  theme: {
    extend: {
      tokens: {
        colors: {
          primary: {
            50: { value: "#eff6ff" },
            100: { value: "#dbeafe" },
            500: { value: "#2563AB" },
            600: { value: "#1d4ed8" },
            700: { value: "#1e40af" },
          },
          navy: {
            800: { value: "#1e293b" },
            900: { value: "#0f172a" },
          },
          success: { 50: { value: "#ecfdf5" }, 500: { value: "#10b981" }, 700: { value: "#047857" } },
          danger: { 50: { value: "#fef2f2" }, 500: { value: "#ef4444" }, 700: { value: "#b91c1c" } },
          warning: { 50: { value: "#fffbeb" }, 500: { value: "#f59e0b" }, 700: { value: "#b45309" } },
          info: { 50: { value: "#eff6ff" }, 500: { value: "#3b82f6" }, 700: { value: "#1d4ed8" } },
          slate: {
            50: { value: "#f8fafc" }, 100: { value: "#f1f5f9" }, 200: { value: "#e2e8f0" },
            300: { value: "#cbd5e1" }, 400: { value: "#94a3b8" }, 500: { value: "#64748b" },
            600: { value: "#475569" }, 700: { value: "#334155" }, 800: { value: "#1e293b" }, 900: { value: "#0f172a" },
          },
        },
        fonts: {
          sans: { value: "'Inter', system-ui, sans-serif" },
        },
      },
      semanticTokens: {
        colors: {
          bg: { canvas: { value: "{colors.slate.50}" }, surface: { value: "white" } },
          border: { default: { value: "{colors.slate.200}" } },
        },
      },
    },
  },

  outdir: "styled-system",
});
