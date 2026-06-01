import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'react-query': ['@tanstack/react-query']
        }
      }
    }
  }
});
