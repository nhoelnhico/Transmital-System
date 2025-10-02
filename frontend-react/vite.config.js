import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This is the new line to add
    open: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});