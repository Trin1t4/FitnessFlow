import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the monorepo root (contains package.json with workspaces)
function findMonorepoRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.workspaces) {
          return dir;
        }
      } catch (e) {}
    }
    dir = path.dirname(dir);
  }
  return startDir;
}

const monorepoRoot = findMonorepoRoot(__dirname);
const sharedPath = path.join(monorepoRoot, 'packages', 'shared', 'src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.join(monorepoRoot, 'packages', 'shared'),
      "@trainsmart/shared": sharedPath,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries (animations + icons)
          'vendor-ui': ['framer-motion', 'lucide-react'],

          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],

          // Exercise data (heavy, loaded on-demand)
          'exercise-data': [
            './src/utils/exerciseDescriptions',
            './src/utils/correctiveExerciseDescriptions'
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase warning threshold slightly
  },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
