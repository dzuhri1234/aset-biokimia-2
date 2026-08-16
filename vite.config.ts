import { defineConfig } from "vite";

// Untuk GitHub Pages projek (bukan user/org page), laman akan dihost di
// https://<username>.github.io/<nama-repo>/ - jadi 'base' MESTI dipadankan
// dengan nama repo tersebut, jika tidak semua CSS/JS akan gagal dimuatkan.
//
// Tetapkan melalui environment variable semasa build (lihat
// .github/workflows/deploy.yml) supaya tidak perlu hardcode nama repo di sini.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
});
