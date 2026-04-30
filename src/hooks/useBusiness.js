import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PLATFORM_PAYSTACK_KEY } from '../data/config';

/**
 * Fetches a business by slug from Supabase.
 * Returns data in the EXACT same shape as the old businesses.js object,
 * so all existing components work without modification.
 */
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
        business_food (*)
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
          // PGRST116 = no rows returned (not found)
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
    hours: row.hours || '',
    accent: row.accent || '#c8a97e',
    avatar: row.avatar || '',
    hero: row.hero || '',
    paystackPublicKey: row.paystack_public_key || PLATFORM_PAYSTACK_KEY,
    subaccountCode: row.subaccount_code || '',
    calendarId: row.calendar_id || '',
    active: row.active,
    adsEnabled: row.ads_enabled !== false, // Fixed: prevents crash if null for old users
    carsEnabled: row.cars_enabled,
    servicesEnabled: row.services_enabled,
    productsEnabled: row.products_enabled,
    foodEnabled: row.food_enabled,
    socials: row.socials || {},
    gallery: row.gallery || [],
    
    // ─── SECURITY FIELDS ───
    securityCode: row.security_code || '',
    securityQuestion1: row.security_question_1 || '',
    securityAnswer1: row.security_answer_1 || '',
    securityQuestion2: row.security_question_2 || '',
    securityAnswer2: row.security_answer_2 || '',

    // ─── REFERRAL FIELD ───
    referralCount: row.referral_count || 0,

    services: sortByOrder(row.business_services || []).map(function (s) {
      return {
        id: s.service_id,
        name: s.name,
        duration: s.duration,
        price: s.price,
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
        description: f.description || '',
        addons: f.addons || []
      };
    })
  };
}

function sortByOrder(arr) {
  return arr.slice().sort(function (a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
}