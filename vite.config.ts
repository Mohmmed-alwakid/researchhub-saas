import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Fix React createContext issues in production
    jsxRuntime: 'automatic',
    jsxImportSource: 'react',
    babel: {
      plugins: []
    }
  })],
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
  resolve: {
    alias: {
      // Ensure consistent React resolution
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  define: {
    // Ensure React is available globally in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    // Enhanced bundle optimization
    rollupOptions: {
      // External dependencies that can be loaded from CDN (optional)
      external: [],
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === 'CSS_UNKNOWN_RULE') return;
        if (warning.message?.includes('bg-gray-50')) return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          // Log circular dependencies for debugging but don't fail build
          console.warn('Circular dependency detected:', warning.message);
          return;
        }
        warn(warning);
      },
      output: {
        // More stable chunk names to prevent dynamic import failures
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // PHASE 4B: ENHANCED VENDOR BUNDLE SPLITTING - September 14, 2025
        // Split large vendor bundle (485kB → ~290kB target) with optimized caching strategy
        manualChunks: (id: string) => {
          // CRITICAL: React and its ecosystem MUST be together and load first
          // This prevents circular dependencies that cause "Cannot read properties of undefined (reading 'memo')"
          // Fixed August 27, 2025 - DO NOT CHANGE without thorough testing
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-jsx-runtime') ||
              id.includes('node_modules/scheduler')) {
            return 'react-core';
          }
          
          // React ecosystem that depends on react-core - load after React core is available
          if (id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform')) {
            return 'react-ecosystem';
          }
          
          // PHASE 4B: Split large UI libraries for better caching
          // Chart libraries (often >100kB) - lazy load when needed
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory')) {
            return 'charts';
          }
          
          // Drag & Drop libraries - only needed in study builder
          if (id.includes('node_modules/@dnd-kit') ||
              id.includes('node_modules/react-beautiful-dnd')) {
            return 'drag-drop';
          }
          
          // Icon libraries - frequently cached, separate for stability
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/@heroicons') ||
              id.includes('node_modules/react-icons')) {
            return 'icons';
          }
          
          // Animation libraries - optional features
          if (id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/@react-spring') ||
              id.includes('node_modules/react-transition-group')) {
            return 'animations';
          }
          
          // Supabase and data libraries - independent of React initialization
          if (id.includes('node_modules/@supabase')) {
            return 'data-services';
          }
          
          // Form validation - can load independently
          if (id.includes('node_modules/zod')) {
            return 'validation';
          }
          
          // Utilities that don't depend on React - safe to load anytime
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/lodash')) {
            return 'utilities';
          }
          
          // PHASE 4B: Split vendor into size-based chunks for better caching
          // Large vendor libraries (>50kB) - separate for better cache invalidation
          if (id.includes('node_modules/@tanstack/') ||
              id.includes('node_modules/@emotion/') ||
              id.includes('node_modules/styled-components')) {
            return 'vendor-large';
          }
          
          // Medium vendor libraries (10-50kB) - group together
          if (id.includes('node_modules/axios') ||
              id.includes('node_modules/uuid') ||
              id.includes('node_modules/crypto-js')) {
            return 'vendor-medium';
          }
          
          // Handle app pages as separate chunks for code splitting
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0];
            return `page-${pageName}`;
          }
          
          // Small vendor libraries (<10kB) - group together for efficiency
          if (id.includes('node_modules/')) {
            return 'vendor-small';
          }
          
          return undefined;
        }
      }
    }
  },
  envPrefix: ['VITE_'],
  css: {
    postcss: './postcss.config.js'
  }
})
