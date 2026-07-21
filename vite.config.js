import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        print: resolve(__dirname, 'print.html'),
        delivery: resolve(__dirname, 'delivery.html'),
        contacts: resolve(__dirname, 'contacts.html'),
      },
    },
  },
})
