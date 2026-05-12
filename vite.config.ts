import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { cpSync, existsSync } from 'fs'

function copyThemes(): Plugin {
  return {
    name: 'copy-themes',
    apply: 'build',
    closeBundle() {
      const src = resolve(__dirname, 'src/themes')
      const dest = resolve(__dirname, 'dist/themes')
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), copyThemes()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueUiSelect',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'vue-ui-select.es.js' : 'vue-ui-select.umd.cjs',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'vue-ui-select.css'
          return assetInfo.name!
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
