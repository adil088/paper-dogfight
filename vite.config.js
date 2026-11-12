import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server also forwards /api and /ws to the Spring Boot backend, so a friend (or a tunnel
// such as ngrok) only needs to reach this one port: http://<your-address>:5173
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // listen on all network interfaces, not just localhost
    allowedHosts: true, // accept tunnel host names (ngrok, cloudflared...)
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': { target: 'http://localhost:8080', ws: true },
    },
  },
});
