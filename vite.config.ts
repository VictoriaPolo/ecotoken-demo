import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: el build funciona igual en GitHub Pages, Render o abriéndolo desde una carpeta.
export default defineConfig({
  base: './',
  plugins: [react()],
});
