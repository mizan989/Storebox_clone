import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        ecommerce: resolve(__dirname, 'ecommerce.html'),
        aeoGeoSeo: resolve(__dirname, 'aeo-geo-seo.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
