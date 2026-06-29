// workbox-config.js
module.exports = {
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{html,js,css,json,svg,png,jpg,jpeg,webp,ico}',
    '**/manifest.webmanifest', // if you have one
  ],
  // Use a cache name that includes the version of your app
  cacheId: 'booknaija-v1',
  // Where to write the generated service worker
  swDest: 'dist/sw.js',
  // Source service worker file (we'll create this next)
  swSrc: 'src/sw.js',
  // Maximum size of the precache (in bytes) – 10MB
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  // Runtime caching strategies for different routes
  runtimeCaching: [
    {
      // Cache Supabase API responses (if needed)
      urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
    {
      // Cache Cloudinary images
      urlPattern: /^https:\/\/res\.cloudinary\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Cache Google Fonts
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
      // Cache Google Fonts webfont files
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
  ],
};