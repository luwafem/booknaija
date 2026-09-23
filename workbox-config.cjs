// workbox-config.cjs
module.exports = {
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{js,css,json,svg,png,jpg,jpeg,webp,ico}',
    // 👇 REMOVED '**/*.html' from precaching.
    // Precaching index.html (and blog HTML) is the classic SPA footgun:
    // the SW serves a stale HTML doc that references old hashed JS bundles,
    // so users on the old SW never load the new template code.
    // HTML is now handled by NetworkFirst at runtime (see navigation route below).
    '**/manifest.webmanifest',
  ],
  // Explicitly exclude blog HTML from precaching to avoid 404 errors
  globIgnores: [
    'blog/**/*.html',
  ],

  // 👇 BUMPED: v1 → v2. This forces every existing client to throw away
  // its entire cache on the next visit and refetch everything fresh.
  // Do this once now; leave it alone for future deploys.
  cacheId: 'booknaija-v2',

  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

  // 👇 NEW: Activate new SW immediately instead of waiting for all tabs
  // of the site to be closed. Works with clientsClaim below.
  skipWaiting: true,

  // 👇 NEW: New SW takes control of already-open pages on activation,
  // instead of waiting for the next full page load.
  clientsClaim: true,

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
    // Blog pages – NetworkFirst, its own cache bucket. Registered BEFORE
    // the navigation catch-all so /blog/* page loads land here, not in
    // the generic html-pages bucket.
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
    // 👇 NEW: Navigation catch-all. Any page load (i.e. a request whose
    // `mode` is 'navigate') goes NetworkFirst here. HTML is always fetched
    // fresh from Netlify when online; cached copy is used only when the
    // network is unavailable. Hashed JS/CSS assets are still served from
    // the precache for speed because their filenames change on every build.
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-pages',
        networkTimeoutSeconds: 3, // fall back to cache if network is slow
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
  ],
};