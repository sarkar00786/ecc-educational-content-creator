import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Ensure consistent React Fast Refresh
    fastRefresh: true,
    // Include .jsx files
    include: "**/*.{jsx,tsx}",
  })],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    cors: true,
    watch: {
      usePolling: true,
      interval: 300
    },
    hmr: {
      port: 5173,
      host: 'localhost'
    }
  },
  define: {
    __SW_ENABLED__: false // Disable service worker in dev
  },
  resolve: {
    alias: {
      // Force single React instance with absolute paths - AGGRESSIVE DEDUPLICATION
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime'),
      // Block any nested React instances
      'react/index': path.resolve('./node_modules/react/index.js'),
      'react-dom/client': path.resolve('./node_modules/react-dom/client.js'),
      'react-dom/server': path.resolve('./node_modules/react-dom/server.js')
    },
    // Dedupe ALL React-related packages to prevent multiple instances
    dedupe: [
      'react', 
      'react-dom', 
      'react/jsx-runtime', 
      'react/jsx-dev-runtime',
      'react/index',
      'react-dom/client',
      'react-dom/server',
      '@types/react',
      '@types/react-dom'
    ]
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: () => {
        // Don't bundle multiple React instances
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'firebase/app', 
      'firebase/auth', 
      'firebase/firestore'
    ],
    // FORCE rebuild to ensure clean React instance
    force: true,
    // Exclude problematic packages that might cause React duplication
    exclude: [],
    // Lock dependency versions to prevent multiple instances
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  // Clear cache on each build
  clearScreen: false
})
