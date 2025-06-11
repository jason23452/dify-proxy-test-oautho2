// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') }
    },
    server: {
      port:"3000",
      proxy: {
        '/dify': {
          target: env.VITE_DIFY_BASE_URL, // e.g. https://api.dify.ai/v1
          changeOrigin: true,
          // 把 /dify 開頭全都去掉，保留後面路徑
          rewrite: path => path.replace(/^\/dify/, '')
        }
      }
    }
  })
}
