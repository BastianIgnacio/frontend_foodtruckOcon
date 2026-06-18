import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8000'
  const wsTarget = apiTarget.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws'))

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': apiTarget,
        '/static': apiTarget,
        '/ws': { target: wsTarget, ws: true }
      }
    }
  }
})
