import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

function devAdminGatePlugin() {
  return {
    name: 'dev-admin-gate-plugin',
    transformIndexHtml(html, ctx) {
      if (ctx?.originalUrl) {
        const adminRoute = (process.env.ADMIN_ROUTE_PATH || '/administrator-b11905a0faa5adf0a8d6023bdb7b37da').trim()
        const urlPath = ctx.originalUrl.split('?')[0].replace(/\/$/, '')
        if (urlPath === adminRoute) {
          return html.replace('</head>', '<meta name="nc-admin-gate" content="active"></head>')
        }
      }
      return html
    }
  }
}

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true
    }),
    devAdminGatePlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  }
})
