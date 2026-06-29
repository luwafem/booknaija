import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Helper to generate structured data ---
function generateBusinessSchema(biz) {
  const firstImage = biz.logo || biz.avatar || biz.hero || 
    (biz.gallery?.[0]?.images?.[0]) || biz.gallery?.[0];
  const location = biz.location;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: `Book ${biz.name} online. ${biz.bio || biz.tagline || ''} Located in ${location || 'Nigeria'}.`,
    url: `${process.env.SITE_URL || 'https://booknaija.com'}/${biz.slug}`,
    logo: biz.logo || undefined,
    image: firstImage || undefined,
    telephone: biz.phone || undefined,
    address: location ? {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'NG',
    } : undefined,
    openingHours: biz.hours || undefined,
    sameAs: [
      biz.socials?.instagram,
      biz.socials?.tiktok,
    ].filter(Boolean),
  };
}

// --- Load base index.html from dist ---
const indexHtmlPath = path.join(process.cwd(), 'dist', 'index.html');
let baseHtml = '';

// Fallback HTML (in case the file is missing)
const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BookNaija</title>
    <link rel="icon" href="/fav.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

try {
  const fileContent = fs.readFileSync(indexHtmlPath, 'utf-8');
  if (fileContent && fileContent.trim().length > 0) {
    baseHtml = fileContent;
    console.log('✅ Loaded index.html from dist');
  } else {
    console.warn('⚠️ index.html is empty, using fallback');
    baseHtml = FALLBACK_HTML;
  }
} catch (e) {
  console.warn('⚠️ Failed to read index.html, using fallback:', e.message);
  baseHtml = FALLBACK_HTML;
}

// --- Helper to extract slug from path ---
function getSlugFromPath(path) {
  if (!path || path === '/') return null;
  const segments = path.replace(/^\/+/, '').split('/');
  const first = segments[0];
  if (['blog', 'signup', 'dashboard', 'discover', 'affiliate-signup', 'privacy', 'terms', 'book'].includes(first)) {
    return null;
  }
  return first;
}

export const handler = async (event) => {
  const host = event.headers.host || event.headers['x-forwarded-host'];
  if (!host) {
    return { statusCode: 400, body: 'Missing host header' };
  }

  const domain = host.split(':')[0];

  // ---- 1. Local development – proxy to Vite ----
  const devDomains = ['localhost', '127.0.0.1'];
  if (devDomains.includes(domain)) {
    const viteBase = 'http://localhost:5173';
    let fullPath = event.path || '/';
    if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;
    let url = viteBase + fullPath;
    if (event.queryStringParameters) {
      const qs = new URLSearchParams(event.queryStringParameters).toString();
      if (qs) url += '?' + qs;
    }
    console.log('🔁 Proxying to:', url);

    try {
      const fetchOptions = {
        method: event.httpMethod || 'GET',
        headers: {
          ...event.headers,
          host: 'localhost:5173',
          'x-forwarded-host': undefined,
          'x-forwarded-proto': undefined,
        },
      };
      if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
        fetchOptions.body = event.isBase64Encoded 
          ? Buffer.from(event.body, 'base64') 
          : event.body;
      }
      const resp = await fetch(url, fetchOptions);
      const responseHeaders = {
        'Content-Type': resp.headers.get('content-type') || 'text/html',
      };
      if (resp.headers.get('cache-control')) {
        responseHeaders['Cache-Control'] = resp.headers.get('cache-control');
      }
      if (resp.headers.get('access-control-allow-origin')) {
        responseHeaders['Access-Control-Allow-Origin'] = resp.headers.get('access-control-allow-origin');
      }
      const body = await resp.text();
      return {
        statusCode: resp.status,
        headers: responseHeaders,
        body,
      };
    } catch (err) {
      console.error('Proxy to Vite dev server failed:', err.message);
      return {
        statusCode: 500,
        body: 'Error connecting to Vite dev server. Make sure it is running.',
      };
    }
  }

  // ---- 2. Main domains – serve SPA with optional injection ----
  const mainDomains = ['booknaija.com', 'www.booknaija.com', 'booknaija.netlify.app'];
  if (mainDomains.includes(domain)) {
    const slug = getSlugFromPath(event.path);
    
    // If there's a slug, try to inject business data
    if (slug) {
      try {
        const { data: biz, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (!error && biz) {
          const title = `${biz.name} | BookNaija`;
          const description = biz.tagline || `Welcome to ${biz.name}`;
          const image = biz.logo || biz.avatar || biz.hero || 'https://booknaija.com/og-image.png';
          const structuredData = generateBusinessSchema(biz);
          const serializedData = JSON.stringify(biz);

          let html = baseHtml || FALLBACK_HTML;
          html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
          html = html.replace(
            /<meta name="description" content=".*?" \/>/,
            `<meta name="description" content="${description}" />`
          );
          html = html.replace(
            /<meta property="og:title" content=".*?" \/>/,
            `<meta property="og:title" content="${title}" />`
          );
          html = html.replace(
            /<meta property="og:description" content=".*?" \/>/,
            `<meta property="og:description" content="${description}" />`
          );
          html = html.replace(
            /<meta property="og:image" content=".*?" \/>/,
            `<meta property="og:image" content="${image}" />`
          );
          html = html.replace(
            /<meta property="og:url" content=".*?" \/>/,
            `<meta property="og:url" content="https://${domain}/${slug}" />`
          );
          html = html.replace(
            /<meta name="twitter:title" content=".*?" \/>/,
            `<meta name="twitter:title" content="${title}" />`
          );
          html = html.replace(
            /<meta name="twitter:description" content=".*?" \/>/,
            `<meta name="twitter:description" content="${description}" />`
          );
          html = html.replace(
            /<meta name="twitter:image" content=".*?" \/>/,
            `<meta name="twitter:image" content="${image}" />`
          );
          html = html.replace(
            /<link rel="canonical" href=".*?" \/>/,
            `<link rel="canonical" href="https://${domain}/${slug}" />`
          );

          const ldJson = JSON.stringify(structuredData);
          const ldScript = `<script type="application/ld+json" id="json-ld-structured-data">${ldJson}</script>`;
          if (html.includes('id="json-ld-structured-data"')) {
            html = html.replace(
              /<script id="json-ld-structured-data" type="application\/ld\+json">.*?<\/script>/,
              ldScript
            );
          } else {
            html = html.replace('</head>', `${ldScript}</head>`);
          }

          const dataScript = `<script>window.__BUSINESS_DATA__ = ${serializedData};</script>`;
          html = html.replace('</head>', `${dataScript}</head>`);

          console.log(`✅ Injected data for slug: ${slug}`);
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=300',
            },
            body: html,
          };
        } else {
          console.log(`⚠️ No active business found for slug: ${slug}`);
        }
      } catch (e) {
        console.warn('Main domain injection failed for slug:', slug, e.message);
      }
    }

    // Fallback: serve plain HTML (no injection)
    const htmlToServe = baseHtml || FALLBACK_HTML;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: htmlToServe,
    };
  }

  // ---- 3. Custom domain – look up in database and inject metadata ----
  const { data: domainData, error: domainError } = await supabase
    .from('domains')
    .select('slug')
    .eq('domain', domain)
    .eq('verified', true)
    .single();

  if (domainError || !domainData) {
    return {
      statusCode: 302,
      headers: { Location: 'https://booknaija.com' },
    };
  }

  const slug = domainData.slug;

  const { data: biz, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (bizError || !biz) {
    return {
      statusCode: 404,
      body: 'Business not found',
    };
  }

  const title = `${biz.name} | BookNaija`;
  const description = biz.tagline || `Welcome to ${biz.name}`;
  const image = biz.logo || biz.avatar || biz.hero || 'https://booknaija.com/og-image.png';
  const structuredData = generateBusinessSchema(biz);
  const serializedData = JSON.stringify(biz);

  let html = baseHtml || FALLBACK_HTML;
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${description}" />`
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta property="og:image" content=".*?" \/>/,
    `<meta property="og:image" content="${image}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="https://${domain}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${description}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content=".*?" \/>/,
    `<meta name="twitter:image" content="${image}" />`
  );
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="https://${domain}" />`
  );

  const ldJson = JSON.stringify(structuredData);
  const ldScript = `<script type="application/ld+json" id="json-ld-structured-data">${ldJson}</script>`;
  if (html.includes('id="json-ld-structured-data"')) {
    html = html.replace(
      /<script id="json-ld-structured-data" type="application\/ld\+json">.*?<\/script>/,
      ldScript
    );
  } else {
    html = html.replace('</head>', `${ldScript}</head>`);
  }

  const dataScript = `<script>window.__BUSINESS_DATA__ = ${serializedData};</script>`;
  html = html.replace('</head>', `${dataScript}</head>`);

  console.log(`✅ Injected data for custom domain: ${domain}`);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300',
    },
    body: html,
  };
};