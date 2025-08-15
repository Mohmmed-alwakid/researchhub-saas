import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5175, // YOUR PREFERRED PORT - LOCKED!
    strictPort: true, // Fail if port is in use instead of auto-switching
    proxy: {
      '/api': {
        target: 'http://localhost:3003', // API server port (Fixed: was 3000, now 3003)
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === 'CSS_UNKNOWN_RULE') return;
        if (warning.message?.includes('bg-gray-50')) return;
        warn(warning);
      },
      output: {
        // Enhanced chunking strategy for optimal caching
        manualChunks: {
          // Core React (Most Critical) - Changes rarely
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI & Forms (Frequently Used) - Medium cache
          'ui-components': ['lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'form-handling': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Data & API (Heavy Libraries) - Long cache
          'data-fetching': ['@tanstack/react-query', '@supabase/supabase-js'],
          'charts-data': ['recharts'],
          
          // Utilities (Shared Across App) - Long cache
          'utilities': ['date-fns', 'clsx', 'tailwind-merge'],
          'motion': ['framer-motion'],
          
          // Development Tools (Dev Only)
          'dev-tools': ['axios'] // Only in development
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'chunk' : 
            'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    }
  },
  envPrefix: ['VITE_'],
  css: {
    postcss: './postcss.config.js'
  }
})
