// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Wharf',
      formats: ['iife', 'es'],
      fileName: (format) =>
        format === 'es' ? 'wharf.esm.js' : 'wharf.bundle.js',
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
   define: {
    'process.env': {}, 
  },
});