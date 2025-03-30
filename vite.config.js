import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  build: {
    outDir: path.resolve(__dirname, '../server/public'), // Output directly to the backend's public folder
    emptyOutDir: true // Ensure the folder is cleared before building
  }
});