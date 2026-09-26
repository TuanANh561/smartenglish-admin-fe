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
      '/admin/pronunciation-lessons': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/admin/grammar-lessons': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/admin/ai': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
