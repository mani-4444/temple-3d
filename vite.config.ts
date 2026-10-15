import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The only chunk above Vite's 500 kB default is the lazily loaded three.js / R3F / Drei vendor
    // chunk (~980 kB, ~260 kB gzip); the landing UI ships in a separate ~250 kB entry chunk.
    chunkSizeWarningLimit: 1100,
  },
})
