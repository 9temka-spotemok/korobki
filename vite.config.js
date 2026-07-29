import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [react()],
  server: {
    open: '/journey.html',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        print: resolve(__dirname, 'print.html'),
        delivery: resolve(__dirname, 'delivery.html'),
        contacts: resolve(__dirname, 'contacts.html'),
        journey: resolve(__dirname, 'journey.html'),
      },
    },
  },
})
