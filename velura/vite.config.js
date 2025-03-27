import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },
    },
    host: true,
    strictPort: true,
    port: 5173,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: ['.ngrok-free.app'], 
  },
})