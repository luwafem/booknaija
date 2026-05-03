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
const SITE_URL = 'https://booknaija.com';

async function generateSitemap() {
  console.log('Fetching active businesses...');
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, updated_at')
    .eq('active', true);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log(`Found ${businesses.length} active businesses`);

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/signup', priority: '0.9', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    ...businesses.map(biz => ({
      url: `/${biz.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: biz.updated_at || new Date().toISOString().split('T')[0],
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