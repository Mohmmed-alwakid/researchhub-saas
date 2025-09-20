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
        // CRITICAL FIX: Ensure React is in vendor bundle to prevent createContext errors
        manualChunks: (id: string) => {
          // Critical: Keep ALL React-related modules in vendor bundle together
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/react-hot-toast') ||
              id.includes('node_modules/@sentry/react')) {
            return 'vendor';
          }
          
          // Icons as separate bundle (small and isolated)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          // Charts and other heavy libraries
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/d3-')) {
            return 'charts';
          }
          
          // All other vendor code
          if (id.includes('node_modules/')) {
            return 'vendor';
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
