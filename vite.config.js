import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Configure React Refresh for React 19 compatibility
    fastRefresh: true,
    jsxRuntime: 'automatic'
  })],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          utils: ['./src/utils/errorHandler', './src/utils/validation', './src/utils/settings']
        }
      }
    }
  },
  // Service worker configuration
  define: {
    __SW_ENABLED__: true
  },
  assetsInclude: ['**/*.html'],
  // Additional optimizations for React 19
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime']
  }
})
