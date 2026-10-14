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
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/admin/pronunciation-lessons': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/admin/grammar-lessons': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/admin/listening-lessons': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/admin/reading-passages': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/admin/exams': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/admin/ai': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
      '/admin/audit-logs': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
      '/admin/quizzes': {
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
      },
      '/admin/reports': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
      },
      '/social': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
      },
      '/content': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
      },
    },
  },
})
