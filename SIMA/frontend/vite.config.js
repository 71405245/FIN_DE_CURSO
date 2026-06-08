import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [OPTIMIZACIÓN 4 + 7] Code-splitting manual + Tree-shaking + Caché por vendor
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy: todas las llamadas a /api se redirigen al backend en puerto 5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // [OPTIMIZACIÓN 5] Separar vendors en chunks — el navegador reutiliza el caché
    // de react/chart cuando solo cambia el código de la app, reduciendo re-descargas.
    rollupOptions: {
      output: {
        // Vite 8 / rolldown requiere manualChunks como función
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts';
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        }
      }
    },
    // Compresión de activos CSS/JS resultantes
    cssCodeSplit: true,
    // Umbral de advertencia de chunk — 400 kB
    chunkSizeWarningLimit: 400,
  },
  // [OPTIMIZACIÓN 7] Pre-optimización de dependencias en el servidor de dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios', 'chart.js', 'react-chartjs-2', 'lucide-react']
  }
})
