import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://l64wmtt7-3000.euw.devtunnels.ms/',
        changeOrigin: true,
      }
    }
  }
})
