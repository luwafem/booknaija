const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return;

          // Split heavy node_modules into separate chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            // Supabase
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            // UI library (Helmet)
            if (id.includes('react-helmet-async')) {
              return 'ui';
            }
            // All other node_modules
            return 'vendor';
          }
          // App code – let rollup decide
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});