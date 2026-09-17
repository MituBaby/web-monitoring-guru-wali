import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/web-monitoring-guru-wali/', // Memastikan base URL mengarah ke nama repositori GitHub
  build: {
    outDir: 'dist',
  },
});