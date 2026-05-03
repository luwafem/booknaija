import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://booknaija.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  structuredData = null,
}) {
  const location = useLocation();

  const fullUrl = `${SITE_URL}${location.pathname}`;
  const fullTitle = title ? `${title} | BookNaija` : 'BookNaija - Your Business, One Simple Link';
  const fullDescription = description ||
    'Book services, buy products, and pay upfront. Stop the DM to book cycle with BookNaija.';
  const fullImage = image || DEFAULT_IMAGE;
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';

  // Structured Data (JSON-LD)
  useEffect(() => {
    if (!structuredData) return;

    const scriptId = 'json-ld-structured-data';
    let script = document.getElementById(scriptId);

    if (script) {
      script.textContent = JSON.stringify(structuredData);
    } else {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [structuredData]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="BookNaija" />
      <meta property="og:locale" content="en_NG" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Robots */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}

/**
 * Generate LocalBusiness structured data for Google rich snippets
 */
export function generateBusinessSchema(biz) {
  const firstImage = biz.logo || biz.avatar || biz.hero || 
    (biz.gallery?.[0]?.images?.[0]) || biz.gallery?.[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.bio || biz.tagline || `${biz.name} on BookNaija`,
    url: `${SITE_URL}/${biz.slug}`,
    logo: biz.logo || undefined,
    image: firstImage || undefined,
    telephone: biz.phone || undefined,
    
    address: biz.location ? {
      '@type': 'PostalAddress',
      addressLocality: biz.location,
      addressCountry: 'NG',
    } : undefined,
    
    openingHours: biz.hours || undefined,
    
    sameAs: [
      biz.socials?.instagram,
      biz.socials?.tiktok,
    ].filter(Boolean),
    
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${biz.name} Services & Products`,
      itemListElement: [
        ...(biz.services || []).slice(0, 10).map((s, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.name,
            description: s.description || undefined,
          },
          price: s.discount_enabled ? s.discount_price : s.price,
          priceCurrency: 'NGN',
          position: i + 1,
        })),
        ...(biz.products || []).slice(0, 10).map((p, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: p.name,
            description: p.description || undefined,
            image: p.image || p.images?.[0] || undefined,
          },
          price: p.discount_enabled ? p.discount_price : p.price,
          priceCurrency: 'NGN',
          position: (biz.services?.length || 0) + i + 1,
        })),
      ],
    },
    
    priceRange: getPriceRange(biz),
  };
}

function getPriceRange(biz) {
  const allPrices = [
    ...(biz.services || []).map(s => s.discount_enabled ? s.discount_price : s.price),
    ...(biz.products || []).map(p => p.discount_enabled ? p.discount_price : p.price),
    ...(biz.food || []).map(f => f.price),
    ...(biz.cars || []).map(c => c.price),
  ].filter(p => p > 0);

  if (allPrices.length === 0) return undefined;
  
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  
  if (min === max) return `₦${min.toLocaleString()}`;
  return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(biz) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: biz.name,
        item: `${SITE_URL}/${biz.slug}`,
      },
    ],
  };
}