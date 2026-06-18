import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/sb": {
        target: "https://pekulnmfxyxqyusnhhfn.supabase.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sb/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — loaded on every page
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Supabase — only needed when data is fetched
          "vendor-supabase": ["@supabase/supabase-js"],
          // UI primitives
          "vendor-ui": [
            "@radix-ui/react-progress",
            "@radix-ui/react-slot",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],
        },
      },
    },
  },
});
