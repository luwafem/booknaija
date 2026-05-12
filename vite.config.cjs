const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');
const Prerender = require('vite-plugin-prerender');

module.exports = defineConfig({
  plugins: [
    react(),
    Prerender({
      routes: [
        '/',
        '/blog',
        '/blog/how-to-maintain-knotless-braids-in-lagos',
        '/blog/5-best-local-ingredients-every-nigerian-restaurant-needs',
        '/blog/what-to-check-before-renting-a-car-in-lagos',
        '/blog/why-every-nigerian-small-business-needs-a-bio-link',
        '/blog/the-rise-of-cloud-kitchens-in-nigeria',
        '/blog/complete-guide-to-buying-a-used-car-in-nigeria',
        '/blog/setting-the-right-prices-for-your-beauty-services',
        '/blog/how-paystack-is-changing-online-payments-for-creatives',
        '/blog/how-to-package-food-for-delivery-in-nigeria',
        '/blog/building-client-trust-why-online-booking-beats-dms',
        '/privacy',
        '/terms',
      ],
      
      staticDir: path.join(__dirname, 'dist'),
      
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        renderAfterDocumentEvent: 'prerender-ready',
        renderAfterTime: 30000,
      },
    }),
  ],
});