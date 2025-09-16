// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy pour toutes les routes /auth/**
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Proxy pour ton endpoint /pokemon
      "/pokemon": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Si tu as d’autres endpoints FastAPI, fais de même :
      // "/autre": { target: "http://localhost:8000", changeOrigin: true }
    },
  },
});
