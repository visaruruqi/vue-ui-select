import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      'vue-ui-select': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
