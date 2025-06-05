import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.' // This will put manifest.json directly in 'dist/'
        },
        {
          src: 'public/icons', // Source is the 'icons' folder itself
          dest: 'icons'        // Destination is 'dist/icons'
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html')
      }
    }
  }
});