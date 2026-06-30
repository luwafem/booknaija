// workbox-config.cjs
module.exports = {
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{js,css,json,svg,png,jpg,jpeg,webp,ico}',
    '**/*.html',
    '**/manifest.webmanifest',
  ],
  // Explicitly exclude blog HTML from precaching to avoid 404 errors
  globIgnores: [
    'blog/**/*.html',
  ],
  cacheId: 'booknaija-v1',
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    // Cache blog pages with NetworkFirst – they are not precached.
    {
      urlPattern: /^\/blog\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'blog-pages',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
  ],
};