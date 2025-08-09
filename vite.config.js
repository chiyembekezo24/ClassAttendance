import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015', // Support older browsers
    polyfillModulePreload: true,
  },
  define: {
    global: 'globalThis', // Fix for some older browsers
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['core-js', 'regenerator-runtime'],
  },
});