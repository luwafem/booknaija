const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');
const Prerender = require('vite-plugin-prerender');

module.exports = defineConfig({
  plugins: [
    react(),
    Prerender({
      // Required - Routes to prerender
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
      
      // Required - The path to the vite output directory
      staticDir: path.join(__dirname, 'dist'),
      
      // Required - Renderer options
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        // Wait for the event we dispatch in our React components
        renderAfterDocumentEvent: 'prerender-ready',
        // Maximum time to wait for React to load (30 seconds)
        renderAfterTime: 30000,
      },
      
      // Optional - Clean up URLs
      postProcess(renderedRoute) {
        renderedRoute.html = renderedRoute.html
          .replace(/http://localhost:[0-9]+/g, 'https://booknaija.netlify.app');
      },
    }),
  ],
});