import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const isDevelopment = command === 'serve' || mode === 'development';
  
  return {
    plugins: [react()],
    base: isDevelopment ? '/' : '/pruebabrokfrontend/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'https://unalcoholised-della-unconglutinative.ngrok-free.dev',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy) => { // 👈 Eliminamos _options
            proxy.on('error', (err) => { // 👈 Eliminamos _req, _res
              console.log('❌ Proxy Error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req) => { // 👈 Eliminamos _res
              console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req) => { // 👈 Eliminamos _res
              console.log('✅ Proxy Response:', req.url, '→', proxyRes.statusCode);
            });
          }
        },
        '/uploads': {
          target: 'https://unalcoholised-della-unconglutinative.ngrok-free.dev',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/uploads/, '/uploads'),
        }
      }
    }
  };
});