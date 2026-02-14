import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const isDevelopment = command === 'serve' || mode === 'development';
  
  return {
    plugins: [react()],
    
    // ✅ En producción (Render) usamos '/' porque está en la raíz
    // ✅ En desarrollo usamos '/' también (tu config.js maneja las URLs)
    base: '/',
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Limpiar console.log en producción
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDevelopment,
        },
      },
    },
    
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'https://unalcoholised-della-unconglutinative.ngrok-free.dev',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'https://unalcoholised-della-unconglutinative.ngrok-free.dev',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});