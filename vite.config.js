import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth': {
        target: 'http://172.20.227.227:8080',
        changeOrigin: true,
      },
      '/admin/words': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/pronunciation-lessons': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/grammar-lessons': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/listening-lessons': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/reading-passages': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/exams': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/ai': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/audit-logs': {
        target: 'http://172.20.227.227:8081',
        changeOrigin: true,
      },
      '/admin/quizzes': {
        target: 'http://172.20.227.227:8083',
        changeOrigin: true,
      },
      '/admin/reports': {
        target: 'http://172.20.227.227:8088',
        changeOrigin: true,
      },
      '/social': {
        target: 'http://172.20.227.227:8088',
        changeOrigin: true,
      },
      '/content': {
        target: 'http://172.20.227.227:8082',
        changeOrigin: true,
      },
      '/admin/users': {
        target: 'http://172.20.227.227:8081',
        changeOrigin: true,
      },
      '/admin/teacher-registrations': {
        target: 'http://172.20.227.227:8081',
        changeOrigin: true,
      },
      '/admin/transactions': {
        target: 'http://172.20.227.227:8085',
        changeOrigin: true,
      },
      '/admin/sepay-transactions': {
        target: 'http://172.20.227.227:8085',
        changeOrigin: true,
      },
      '/admin/revenue': {
        target: 'http://172.20.227.227:8085',
        changeOrigin: true,
      },
      '/payment': {
        target: 'http://172.20.227.227:8085',
        changeOrigin: true,
      },
      '/api/v1/notifications': {
        target: 'http://172.20.227.227:8086',
        changeOrigin: true,
      },
      '/api/v1/teacher': {
        target: 'http://172.20.227.227:8087',
        changeOrigin: true,
      },
    },
  },
})
