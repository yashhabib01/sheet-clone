import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Ensure relative path resolution
  build: {
    outDir: "dist", // Default Vite output directory
  },
});
