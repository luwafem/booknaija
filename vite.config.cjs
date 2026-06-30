// vite.config.cjs
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return;

          // Granular splitting of node_modules
          if (id.includes('node_modules')) {
            // React ecosystem (core + DOM + router)
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react';
            }

            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }

            // Supabase client
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }

            // React Helmet Async (used on almost all pages)
            if (id.includes('react-helmet-async')) {
              return 'vendor-helmet';
            }

            // Payment & security libraries (only needed on booking/dashboard)
            if (
              id.includes('paystack') ||
              id.includes('cloudinary') ||
              id.includes('xss') ||
              id.includes('bcryptjs') ||
              id.includes('jsonwebtoken')
            ) {
              return 'vendor-payment';
            }

            // Leaflet (only used in LocationPicker – lazy loaded)
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }

            // All other node_modules
            return 'vendor-other';
          }

          // App code – let rollup decide (may create shared chunks)
        },
      },
    },
    chunkSizeWarningLimit: 500,
    // Optional: disable source maps in production to reduce size
    sourcemap: false,
  },
});