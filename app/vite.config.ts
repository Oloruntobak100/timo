import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
// Merge `VITE_*` from repository root and `app/` (app wins). Fixes `.env` living in the wrong folder.
// Other `VITE_*` keys still come from `envDir` (app). Vercel injects `VITE_*` via process.env at build.
export default defineConfig(({ mode }) => {
  const appDir = __dirname
  const repoRoot = path.resolve(appDir, "..")
  const merged = {
    ...loadEnv(mode, repoRoot, "VITE_"),
    ...loadEnv(mode, appDir, "VITE_"),
  }

  return {
    // Root URL so deep links (/login, /sign-up) load JS/CSS from /assets/* on Vercel (not /sign-up/assets/*).
    base: "/",
    envDir: appDir,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(appDir, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(merged.VITE_SUPABASE_URL ?? ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        merged.VITE_SUPABASE_ANON_KEY ?? ""
      ),
    },
  }
})
