import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import Prerender from 'vite-plugin-prerender'

export default defineConfig({
  plugins: [
    react(),
    Prerender({
      // Required - The path to the output directory
      staticDir: path.join(__dirname, 'dist'),
      
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
      
      // Optional - Wait for prerenderReady
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        renderAfterDocumentEvent: 'prerender-ready',
        // Wait up to 30 seconds for React to load
        renderAfterTime: 15000,
      },
      
      // Optional - Minify the rendered HTML
      postProcess(renderedRoute) {
        // Handle trailing slashes
        renderedRoute.route = renderedRoute.originalRoute
      },
    }),
  ],
})