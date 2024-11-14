import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    viteStaticCopy({
      targets: [
        { src: '_redirects', dest: '' },
      ],
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
