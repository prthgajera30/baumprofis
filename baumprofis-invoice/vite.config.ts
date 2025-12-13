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
          // Large vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('material')) {
              return 'mui-vendor'
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor'
            }
            if (id.includes('date-fns') || id.includes('zod') || id.includes('lucide')) {
              return 'utils-vendor'
            }
            if (id.includes('html2canvas') || id.includes('jspdf')) {
              return 'pdf-vendor'
            }
            // Group smaller node_modules together
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
