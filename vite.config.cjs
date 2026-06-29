const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy libraries into separate chunks
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'query': ['@tanstack/react-query'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['react-helmet-async'],
          // 'googleapis': ['googleapis'], // Uncomment if needed; googleapis is large
        },
      },
    },
    // Optional: chunk size warning limit (500 kB is reasonable)
    chunkSizeWarningLimit: 500,
  },
});