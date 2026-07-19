// Run with: node scripts/generate-sitemap.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const SITE_URL = process.env.SITE_URL || 'https://five9.com.ng';

// ✅ FIX: Use full ISO 8601 datetime format (Google sitemap requirement)
// Output: "2024-05-13T00:00:00.000Z" — always valid for sitemaps
const TODAY = new Date().toISOString();

async function generateSitemap() {
  console.log('Fetching active businesses...');
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug')
    .eq('active', true);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log(`Found ${businesses.length} active businesses`);

  // NEW: Blog article slugs (must match Blog.jsx exactly)
  const blogArticles = [
    'how-to-maintain-knotless-braids-in-lagos',
    '5-best-local-ingredients-every-nigerian-restaurant-needs',
    'what-to-check-before-renting-a-car-in-lagos',
    'why-every-nigerian-small-business-needs-a-bio-link',
    'the-rise-of-cloud-kitchens-in-nigeria',
    'complete-guide-to-buying-a-used-car-in-nigeria',
    'setting-the-right-prices-for-your-beauty-services',
    'how-paystack-is-changing-online-payments-for-creatives',
    'how-to-package-food-for-delivery-in-nigeria',
    'building-client-trust-why-online-booking-beats-dms'
  ];

  const pages = [
    // --- Static Pages ---
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: TODAY },
    { url: '/signup', priority: '0.9', changefreq: 'monthly', lastmod: TODAY },
    { url: '/discover', priority: '0.9', changefreq: 'weekly', lastmod: TODAY },
    { url: '/affiliate-signup', priority: '0.7', changefreq: 'monthly', lastmod: TODAY },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
    { url: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
    
    // --- Blog Index ---
    { url: '/blog', priority: '0.8', changefreq: 'weekly', lastmod: TODAY },
    
    // --- Blog Articles ---
    ...blogArticles.map(slug => ({
      url: `/blog/${slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: TODAY,
    })),
    
    // --- Dynamic Business Pages ---
    ...businesses.map(biz => ({
      url: `/${biz.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: TODAY,
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 ${pages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.join(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  
  console.log('✅ Sitemap generated: public/sitemap.xml');
  console.log(`   Total URLs: ${pages.length}`);
}

generateSitemap();