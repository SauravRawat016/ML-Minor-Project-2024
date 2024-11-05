import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/melicious': 'http://localhost:4000',
      '/report': 'http://localhost:4000',
    },
  },
  plugins: [react()],
});
