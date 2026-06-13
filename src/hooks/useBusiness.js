import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PLATFORM_PAYSTACK_KEY } from '../data/config';

export function useBusiness(slug) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function () {
    if (!slug) return;

    var cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from('businesses')
      .select(
        `
        *,
        business_services (*),
        business_products (*),
        business_cars (*),
        business_food (*),
        business_properties (*),
        business_estates (*)
        `
      )
      .eq('slug', slug)
      .eq('active', true)
      .single()
      .then(function (result) {
        if (cancelled) return;
        var data = result.data;
        var err = result.error;

        if (err) {
          setError(err.code === 'PGRST116' ? 'not_found' : err.message);
          setBusiness(null);
        } else if (data) {
          setBusiness(transformBusiness(data));
        }
        setLoading(false);
      });

    return function () {
      cancelled = true;
    };
  }, [slug]);

  return { business: business, loading: loading, error: error };
}

// ─── Transform Supabase rows → existing component shape ───

function transformBusiness(row) {
  return {
    name: row.name,
    slug: row.slug,
    logo: row.logo || '',
    tagline: row.tagline || '',
    bio: row.bio || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    location: row.location || '',
    lat: row.lat || null,
    lng: row.lng || null,
    hours: row.hours || '',
    accent: row.accent || '#c8a97e',
    theme: row.theme || 'light',
    googleMapsClaimed: row.google_maps_claimed || false,
    avatar: row.avatar || '',
    hero: row.hero || '',
    paystackPublicKey: row.paystack_public_key || PLATFORM_PAYSTACK_KEY,
    subaccountCode: row.subaccount_code || '',
    calendarId: row.calendar_id || '',
    
    // ─── BANK DETAILS ───
    accountName: row.account_name || '',
    accountNumber: row.account_number || '',
    settlementBank: row.settlement_bank || '',
    
    active: row.active,
    adsEnabled: row.ads_enabled !== false,
    carsEnabled: row.cars_enabled,
    servicesEnabled: row.services_enabled,
    productsEnabled: row.products_enabled,
    foodEnabled: row.food_enabled,
    propertiesEnabled: row.properties_enabled || false,
    estatesEnabled: row.estates_enabled || false,
    businessType: row.business_type || '',
    socials: row.socials || {},
    gallery: row.gallery || [],
    
    // ─── SECURITY ───
    SecurityCode: row.security_code || '',
    securityQuestion1: row.security_question_1 || '',
    securityAnswer1: row.security_answer_1 || '',
    securityQuestion2: row.security_question_2 || '',
    securityAnswer2: row.security_answer_2 || '',

    referralCount: row.referral_count || 0,

    heroSlides: (row.hero_slides && typeof row.hero_slides === 'string') 
      ? JSON.parse(row.hero_slides) 
      : (Array.isArray(row.hero_slides) ? row.hero_slides : []),

    // ─── TEAM MEMBERS ───
    team: (row.team && typeof row.team === 'string') 
      ? JSON.parse(row.team) 
      : (Array.isArray(row.team) ? row.team : []),

    services: sortByOrder(row.business_services || []).map(function (s) {
      return {
        id: s.service_id,
        name: s.name,
        duration: s.duration,
        price: s.price,
        discount_enabled: s.discount_enabled || false,
        discount_price: s.discount_price || 0,
        image: s.image || '',
        images: s.images || [],
        showDetails: s.show_details !== false,
        description: s.description || ''
      };
    }),

    products: sortByOrder(row.business_products || []).map(function (p) {
      return {
        id: p.product_id,
        name: p.name,
        price: p.price,
        product_code: p.product_code || '',
        discount_enabled: p.discount_enabled || false,
        discount_price: p.discount_price || 0,
        image: p.image || '',
        images: p.images || [],
        sizes: p.sizes || [],
        colors: p.colors || [],
        layout: p.layout || '',
        showDetails: p.show_details !== false,
        description: p.description || ''
      };
    }),

    cars: sortByOrder(row.business_cars || []).map(function (c) {
      return {
        id: c.car_id,
        type: c.type,
        name: c.name,
        year: c.year,
        price: c.price,
        mileage: c.mileage || '',
        transmission: c.transmission || '',
        fuel: c.fuel || '',
        description: c.description || '',
        image: c.image || '',
        images: c.images || []
      };
    }),

    food: sortByOrder(row.business_food || []).map(function (f) {
      return {
        id: f.food_id,
        name: f.name,
        price: f.price,
        image: f.image || '',
        images: f.images || [],
        description: f.description || '',
        addons: f.addons || []
      };
    }),

    properties: sortByOrder(row.business_properties || []).map(function (p) {
      return {
        id: p.property_id,
        name: p.name,
        type: p.type,
        price: p.price,
        location: p.location || '',
        bedrooms: p.bedrooms || '',
        bathrooms: p.bathrooms || '',
        description: p.description || '',
        images: p.images || []
      };
    }),

    // ─── ESTATES (With Featured Sorting) ───
    estates: sortByOrder(row.business_estates || [])
      .map(function (e) {
        return {
          id: e.estate_id,
          name: e.name,
          tagline: e.tagline || '',
          location: e.location || '',
          description: e.description || '',
          heroImage: e.hero_image || '',
          images: e.images || [],
          priceRange: e.price_range || { min: 0, max: 0 },
          totalUnits: e.total_units || 0,
          availableUnits: e.available_units || 0,
          completionDate: e.completion_date || '',
          amenities: e.amenities || [],
          unitTypes: e.unit_types || [],
          featured: e.featured || false
        };
      })
      .sort(function (a, b) {
        // Always push the "Featured" estate to the very top (index 0)
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0; // Keep original sort_order for the rest
      })
  };
}

function sortByOrder(arr) {
  return arr.slice().sort(function (a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
}