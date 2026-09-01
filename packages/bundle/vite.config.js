// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    sourcemap: true,
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
        // Without this the ESM output is a 6 KB shell importing sibling chunks.
        inlineDynamicImports: true,
      },
    },
  },
   define: {
    'process.env': {},
  },
});
