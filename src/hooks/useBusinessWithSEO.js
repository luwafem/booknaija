// src/hooks/useBusinessWithSEO.js
import { useMemo } from 'react';
import { useBusiness } from './useBusiness';
import { generateBusinessSchema, generateBreadcrumbSchema } from './useSEO';

export function useBusinessWithSEO(slug) {
  // ✅ Include children (services, products, cars, food, properties, estates)
  // This is required for property pages, and the additional payload is minimal.
  const { business: biz, loading, error } = useBusiness(slug, { includeChildren: true });

  // Generate SEO-optimized description using feature flags (no counts needed)
  const seoDescription = useMemo(() => {
    if (!biz) return null;

    const parts = [];
    if (biz.tagline) parts.push(biz.tagline);
    if (biz.location) parts.push(`Located in ${biz.location}`);

    // Build offering summary from enabled feature flags
    const offerings = [];
    if (biz.servicesEnabled) offerings.push('services');
    if (biz.productsEnabled) offerings.push('products');
    if (biz.foodEnabled) offerings.push('food menu');
    if (biz.carsEnabled) offerings.push('vehicles');
    if (biz.propertiesEnabled) offerings.push('properties');
    if (biz.estatesEnabled) offerings.push('estates');

    if (offerings.length > 0) {
      parts.push(`Browse ${offerings.join(', ')}. Book and pay securely via Paystack.`);
    } else {
      parts.push('Book and pay securely via Paystack.');
    }

    return parts.join('. ') || `${biz.name} – Book services and buy products on BookNaija`;
  }, [biz]);

  // Get the best image for social sharing (unchanged)
  const seoImage = useMemo(() => {
    if (!biz) return null;
    return biz.logo || biz.avatar || biz.hero ||
      (biz.gallery?.[0]?.images?.[0]) || biz.gallery?.[0] || null;
  }, [biz]);

  // Generate structured data – we now use a simplified version
  // that does NOT require children. The schema will still be valid
  // for Google and provides the essential business info.
  const structuredData = useMemo(() => {
    if (!biz || !biz.active) return null;
    return [
      generateBusinessSchema(biz, { skipOffers: true }),
      generateBreadcrumbSchema(biz)
    ];
  }, [biz]);

  return {
    business: biz,
    loading,
    error,
    seoDescription,
    seoImage,
    structuredData
  };
}