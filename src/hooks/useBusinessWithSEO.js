import { useMemo } from 'react';
import { useBusiness } from './useBusiness';
import { generateBusinessSchema, generateBreadcrumbSchema } from './useSEO';

export function useBusinessWithSEO(slug) {
  const { business: biz, loading, error } = useBusiness(slug);

  // Generate SEO-optimized description
  const seoDescription = useMemo(() => {
    if (!biz) return null;
    
    const parts = [];
    if (biz.tagline) parts.push(biz.tagline);
    if (biz.location) parts.push(`Located in ${biz.location}`);
    
    const serviceCount = biz.services?.length || 0;
    const productCount = biz.products?.length || 0;
    const foodCount = biz.food?.length || 0;
    const carCount = biz.cars?.length || 0;
    
    const offerings = [];
    if (serviceCount > 0) offerings.push(`${serviceCount} service${serviceCount > 1 ? 's' : ''}`);
    if (productCount > 0) offerings.push(`${productCount} product${productCount > 1 ? 's' : ''}`);
    if (foodCount > 0) offerings.push(`${foodCount} menu item${foodCount > 1 ? 's' : ''}`);
    if (carCount > 0) offerings.push(`${carCount} vehicle${carCount > 1 ? 's' : ''}`);
    
    if (offerings.length > 0) {
      parts.push(`Browse ${offerings.join(', ')}. Book and pay securely via Paystack.`);
    }
    
    return parts.join('. ') || `${biz.name} - Book services and buy products on BookNaija`;
  }, [biz]);

  // Get the best image for social sharing
  const seoImage = useMemo(() => {
    if (!biz) return null;
    return biz.logo || biz.avatar || biz.hero || 
      (biz.gallery?.[0]?.images?.[0]) || biz.gallery?.[0] || null;
  }, [biz]);

  // Generate structured data
  const structuredData = useMemo(() => {
    if (!biz || !biz.active) return null;
    return {
      ...generateBusinessSchema(biz),
      ...generateBreadcrumbSchema(biz),
    };
  }, [biz]);

  // Return everything needed for the <SEO> component
  return { 
    business: biz, 
    loading, 
    error, 
    seoDescription, 
    seoImage, 
    structuredData 
  };
}