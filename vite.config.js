import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { appUpdatePlugin } from './vite.appUpdatePlugin.js'

export default defineConfig({
  plugins: [react(), appUpdatePlugin()],
  base: '/deck-builder/',
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
