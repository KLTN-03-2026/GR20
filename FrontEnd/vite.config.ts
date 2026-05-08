import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig((mode : any) => {
  const env = loadEnv(mode, process.cwd(), '');;
  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      port: 3000,
      proxy: {
        '/uploads': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    },
    css: {
      devSourcemap: true
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src')
      }
    }
  }
});
