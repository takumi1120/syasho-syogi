import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") return "/";

  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [vue()],
});
