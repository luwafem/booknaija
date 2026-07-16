// src/hooks/useSEO.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://booknaija.netlify.app';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  structuredData = null,
  location
}) {
  const routeLocation = useLocation();

  const fullUrl = `${SITE_URL}${routeLocation.pathname}`;
  const fullTitle = title ? `${title} | BookNaija` : 'BookNaija - Your Business, One Simple Link';
  
  // DYNAMIC META DESCRIPTION WITH "NEAR ME" – safe location handling
  const fullDescription = description || 
    (location 
      ? `Book ${title} near me in ${location}. Secure Paystack payments, instant booking. Stop the DM to book cycle with BookNaija.`
      : 'Book services, buy products, and pay upfront. Stop the DM to book cycle with BookNaija.');
      
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
 * @param {Object} biz - The business object
 * @param {Object} options - Options object
 * @param {boolean} options.skipOffers - If true, omit the OfferCatalog (use when children data is not loaded)
 */
export function generateBusinessSchema(biz, options = {}) {
  const { skipOffers = false } = options;

  const firstImage = biz.logo || biz.avatar || biz.hero || 
    (biz.gallery?.[0]?.images?.[0]) || biz.gallery?.[0];

  const location = biz.location || '';
  const hasLocation = !!location;

  // Build description parts safely
  const descriptionParts = [`Book ${biz.name} online.`];
  if (biz.bio) descriptionParts.push(biz.bio);
  else if (biz.tagline) descriptionParts.push(biz.tagline);
  if (hasLocation) descriptionParts.push(`Located in ${location}.`);
  descriptionParts.push('Browse services, buy products, and pay securely via Paystack.');
  const description = descriptionParts.join(' ');

  // Helper: append location to string only if location exists
  const withLocation = (str) => hasLocation ? `${str} in ${location}` : str;

  // Base schema (always present)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description,
    url: `${SITE_URL}/${biz.slug}`,
    logo: biz.logo || undefined,
    image: firstImage || undefined,
    telephone: biz.phone || undefined,
    address: hasLocation ? {
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

  // Only add OfferCatalog and priceRange if we have children data
  if (!skipOffers) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `${biz.name} Services & Products`,
      itemListElement: [
        // --- SERVICES ---
        ...(biz.services || []).slice(0, 10).map((s, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: withLocation(s.name),
            description: s.description 
              ? (hasLocation ? `${s.description} Located in ${location}.` : s.description)
              : `Book ${withLocation(s.name)} securely on BookNaija.`,
          },
          price: s.discount_enabled ? s.discount_price : s.price,
          priceCurrency: 'NGN',
          position: i + 1,
        })),
        // --- PRODUCTS ---
        ...(biz.products || []).slice(0, 10).map((p, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: withLocation(p.name),
            description: p.description 
              ? (hasLocation ? `${p.description} Available in ${location}.` : p.description)
              : `Buy ${withLocation(p.name)} on BookNaija.`,
            image: p.image || p.images?.[0] || undefined,
          },
          price: p.discount_enabled ? p.discount_price : p.price,
          priceCurrency: 'NGN',
          position: (biz.services?.length || 0) + i + 1,
        })),
        // --- FOOD ---
        ...(biz.food || []).slice(0, 10).map((f, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: withLocation(f.name),
            description: hasLocation 
              ? `Order ${f.name} in ${location} for delivery or pickup.`
              : `Order ${f.name} for delivery or pickup.`,
            image: f.image || undefined,
          },
          price: f.price,
          priceCurrency: 'NGN',
          position: (biz.services?.length || 0) + (biz.products?.length || 0) + i + 1,
        })),
        // --- CARS ---
        ...(biz.cars || []).slice(0, 10).map((c, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: withLocation(c.name),
            description: c.description 
              ? (hasLocation ? `${c.description} Available in ${location}.` : c.description)
              : `${c.type === 'rent' ? 'Rent' : 'Buy'} ${withLocation(c.name)} on BookNaija.`,
            image: c.image || c.images?.[0] || undefined,
          },
          price: c.price,
          priceCurrency: 'NGN',
          position: (biz.services?.length || 0) + (biz.products?.length || 0) + (biz.food?.length || 0) + i + 1,
        })),
        // --- PROPERTIES ---
        ...(biz.properties || []).slice(0, 10).map((p, i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': p.type === 'shortlet' ? 'LodgingBusiness' : 'Product',
            name: withLocation(p.name),
            description: p.description 
              ? (hasLocation ? `${p.description} Available in ${location}.` : p.description)
              : `${p.type === 'sale' ? 'Buy' : (p.type === 'rent' ? 'Rent' : 'Book shortlet for')} ${withLocation(p.name)} on BookNaija.`,
            image: p.images?.[0] || undefined,
          },
          price: p.price,
          priceCurrency: 'NGN',
          position: (biz.services?.length || 0) + (biz.products?.length || 0) + (biz.food?.length || 0) + (biz.cars?.length || 0) + i + 1,
        })),
      ],
    };
    // priceRange is only meaningful when we have offers
    const priceRange = getPriceRange(biz);
    if (priceRange) schema.priceRange = priceRange;
  }

  return schema;
}

function getPriceRange(biz) {
  const allPrices = [
    ...(biz.services || []).map(s => s.discount_enabled ? s.discount_price : s.price),
    ...(biz.products || []).map(p => p.discount_enabled ? p.discount_price : p.price),
    ...(biz.food || []).map(f => f.price),
    ...(biz.cars || []).map(c => c.price),
    ...(biz.properties || []).map(p => p.price),
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