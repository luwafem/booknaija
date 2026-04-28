// scripts/migrate-to-supabase.js
// Run once: node scripts/migrate-to-supabase.js

import { createClient } from '@supabase/supabase-js';
import businesses from '../src/data/businesses.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const entries = Object.entries(businesses);
  console.log('Migrating ' + entries.length + ' businesses...\n');

  for (const [slug, biz] of entries) {
    console.log('→ ' + slug);

    // 1. Insert business
    const { data: bizRow, error: bizErr } = await supabase
      .from('businesses')
      .insert({
        slug: biz.slug,
        name: biz.name,
        logo: biz.logo || '',
        tagline: biz.tagline || '',
        bio: biz.bio || '',
        phone: biz.phone || '',
        whatsapp: biz.whatsapp || '',
        email: biz.email || '',
        location: biz.location || '',
        hours: biz.hours || '',
        accent: biz.accent || '#c8a97e',
        avatar: biz.avatar || '',
        hero: biz.hero || '',
        paystack_public_key: biz.paystackPublicKey || '',
        subaccount_code: biz.subaccountCode || '',
        calendar_id: biz.calendarId || '',
        active: biz.active !== false,
        ads_enabled: biz.adsEnabled !== false,
        cars_enabled: biz.carsEnabled === true,
        services_enabled: biz.servicesEnabled !== false,
        products_enabled: biz.productsEnabled !== false,
        food_enabled: biz.foodEnabled === true,
        socials: biz.socials || {},
        gallery: biz.gallery || []
      })
      .select()
      .single();

    if (bizErr) {
      console.error('  ✗ Error: ' + bizErr.message);
      continue;
    }

    const bizId = bizRow.id;

    // 2. Services
    if (biz.services?.length) {
      const rows = biz.services.map((s, i) => ({
        business_id: bizId,
        service_id: s.id,
        name: s.name,
        duration: s.duration || '',
        price: s.price || 0,
        image: s.image || '',
        images: s.images || [],
        show_details: s.showDetails !== false,
        description: s.description || '',
        sort_order: i
      }));
      const { error } = await supabase.from('business_services').insert(rows);
      if (error) console.error('  ✗ Services: ' + error.message);
    }

    // 3. Products
    if (biz.products?.length) {
      const rows = biz.products.map((p, i) => ({
        business_id: bizId,
        product_id: p.id,
        name: p.name,
        price: p.price || 0,
        image: p.image || '',
        images: p.images || [],
        sizes: p.sizes || [],
        colors: p.colors || [],
        layout: p.layout || '',
        show_details: p.showDetails !== false,
        description: p.description || '',
        sort_order: i
      }));
      const { error } = await supabase.from('business_products').insert(rows);
      if (error) console.error('  ✗ Products: ' + error.message);
    }

    // 4. Cars
    if (biz.cars?.length) {
      const rows = biz.cars.map((c, i) => ({
        business_id: bizId,
        car_id: c.id,
        type: c.type || 'rent',
        name: c.name,
        year: c.year || 2024,
        price: c.price || 0,
        mileage: c.mileage || '',
        transmission: c.transmission || '',
        fuel: c.fuel || '',
        description: c.description || '',
        image: c.image || '',
        images: c.images || [],
        sort_order: i
      }));
      const { error } = await supabase.from('business_cars').insert(rows);
      if (error) console.error('  ✗ Cars: ' + error.message);
    }

    // 5. Food
    if (biz.food?.length) {
      const rows = biz.food.map((f, i) => ({
        business_id: bizId,
        food_id: f.id,
        name: f.name,
        price: f.price || 0,
        image: f.image || '',
        images: f.images || [],
        description: f.description || '',
        addons: f.addons || [],
        sort_order: i
      }));
      const { error } = await supabase.from('business_food').insert(rows);
      if (error) console.error('  ✗ Food: ' + error.message);
    }

    console.log('  ✓ Done');
  }

  console.log('\nMigration complete!');
}

migrate();