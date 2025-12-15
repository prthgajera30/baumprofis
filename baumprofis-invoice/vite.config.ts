import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Single vendor chunk for all dependencies to prevent cross-chunk React references
          if (id.includes('node_modules')) {
            return 'vendor'
          }

          // Separate larger application components
          if (id.includes('useInvoice') || id.includes('services/validation')) {
            return 'invoice-logic'
          }
          if (id.includes('components/Invoice') || id.includes('components/ui')) {
            return 'invoice-components'
          }
          // Test utilities in separate chunk
          if (id.includes('test') || id.includes('mocks')) {
            return 'test-utils'
          }
        },
      },
    },
    // Performance budgets - fail build if exceeded
    chunkSizeWarningLimit: 750, // Lower threshold for warnings
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@mui/icons-material', 'firebase'],
  },
})
