const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  console.log('=== SAVE-BUSINESS TO SUPABASE ===');

  try {
    var d = JSON.parse(event.body);
    console.log('Slug:', d.slug);

    if (!d.slug || !d.name) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or name' }) };
    }

    // 1. Upsert the business row
    var bizPayload = {
      slug: d.slug,
      name: d.name,
      logo: d.logo || '',
      tagline: d.tagline || '',
      bio: d.bio || '',
      phone: d.phone || '',
      whatsapp: d.whatsapp || '',
      email: d.email || '',
      location: d.location || '',
      hours: d.hours || '',
      accent: d.accent || '#c8a97e',
      avatar: '',
      hero: d.hero || '',
      paystack_public_key: d.paystackPublicKey || 'pk_live_2ba1413aaaf5091188571ea6f87cca34945d943c',
      subaccount_code: d.subaccountCode || '',
      calendar_id: d.calendarId || '',
      active: true,
      ads_enabled: d.adsEnabled !== false,
      cars_enabled: d.carsEnabled === true,
      services_enabled: d.servicesEnabled !== false,
      products_enabled: d.productsEnabled !== false,
      food_enabled: d.foodEnabled === true,
      socials: d.socials || {},
      gallery: d.gallery || [],
      security_code: d.securityCode || '',
      security_question_1: d.securityQuestion1 || '',
      security_answer_1: (d.securityAnswer1 || '').toLowerCase().trim(),
      security_question_2: d.securityQuestion2 || '',
      security_answer_2: (d.securityAnswer2 || '').toLowerCase().trim()
    };

    var { data: bizRow, error: bizErr } = await supabase
      .from('businesses')
      .upsert(bizPayload, { onConflict: 'slug' })
      .select()
      .single();

    if (bizErr) {
      console.error('Business upsert error:', bizErr);
      throw bizErr;
    }

    var businessId = bizRow.id;
    console.log('Business ID:', businessId);

    // ─── REFERRAL TRACKING ───
    if (d.referredBy && d.referredBy !== d.slug) {
      try {
        console.log('Processing referral from slug:', d.referredBy);
        
        const { data: referrer, error: refErr } = await supabase
          .from('businesses')
          .select('id, referral_count')
          .eq('slug', d.referredKey)
          .single();

        if (!refErr && referrer) {
          const newCount = (referrer.referral_count || 0) + 1;
          
          const { error: updateRefErr } = await supabase
            .from('businesses')
            .update({ referral_count: newCount })
            .eq('id', referrer.id);

          if (updateRefErr) {
            console.error('Failed to update referral count:', updateRefErr.message);
          } else {
            console.log('Successfully updated referral count for', d.referredBy, 'to', newCount);
          }
        } else {
          console.log('Referrer not found in database. Ignoring referral code.');
        }
      } catch (refCatchErr) {
        console.error('Referral processing error:', refCatchErr.message);
      }
    }

    // 2. Clear old related data
    await supabase.from('business_services').delete().eq('business_id', businessId);
    await supabase.from('business_products').delete().eq('business_id', businessId);
    await supabase.from('business_cars').delete().eq('business_id', businessId);
    await supabase.from('business_food').delete().eq('business_id', businessId);

    // 3. Insert services (UPDATED WITH DISCOUNTS)
    if (d.services && d.services.length > 0) {
      var serviceRows = d.services.map(function (s, i) {
        return {
          business_id: businessId,
          service_id: s.id,
          name: s.name,
          duration: s.duration || '',
          price: parseInt(String(s.price).replace(/,/g, '')) || 0,
          discount_enabled: s.discount_enabled === true,           // NEW
          discount_price: parseInt(String(s.discount_price).replace(/,/g, '')) || 0, // NEW
          image: s.image || '',
          images: s.images || [],
          show_details: s.showDetails !== false,
          description: s.description || '',
          sort_order: i
        };
      });
      var { error: sErr } = await supabase.from('business_services').insert(serviceRows);
      if (sErr) console.error('Services error:', sErr);
    }

    // 4. Insert products (UPDATED WITH CODE & DISCOUNTS)
    if (d.products && d.products.length > 0) {
      var productRows = d.products.map(function (p, i) {
        return {
          business_id: businessId,
          product_id: p.id,
          name: p.name,
          price: parseInt(String(p.price).replace(/,/g, '')) || 0,
          product_code: (p.product_code || '').toUpperCase().trim(), // NEW
          discount_enabled: p.discount_enabled === true,               // NEW
          discount_price: parseInt(String(p.discount_price).replace(/,/g, '')) || 0, // NEW
          image: p.image || '',
          images: p.images || [],
          sizes: p.sizes || [],
          colors: p.colors || [],
          layout: p.layout || '',
          show_details: p.showDetails !== false,
          description: p.description || '',
          sort_order: i
        };
      });
      var { error: pErr } = await supabase.from('business_products').insert(productRows);
      if (pErr) console.error('Products error:', pErr);
    }

    // 5. Insert cars
    if (d.cars && d.cars.length > 0) {
      var carRows = d.cars.map(function (c, i) {
        var img = c.images && c.images.length > 0 ? c.images[0] : (c.image || '');
        return {
          business_id: businessId,
          car_id: c.id,
          type: c.type || 'rent',
          name: c.name,
          year: parseInt(c.year) || new Date().getFullYear(),
          price: parseInt(String(c.price).replace(/,/g, '')) || 0,
          mileage: c.mileage || '',
          transmission: c.transmission || '',
          fuel: c.fuel || '',
          description: c.description || '',
          image: img,
          images: c.images || [],
          sort_order: i
        };
      });
      var { error: cErr } = await supabase.from('business_cars').insert(carRows);
      if (cErr) console.error('Cars error:', cErr);
    }

    // 6. Insert food items
    if (d.food && d.food.length > 0) {
      var foodRows = d.food.map(function (f, i) {
        return {
          business_id: businessId,
          food_id: f.id,
          name: f.name,
          price: parseInt(String(f.price).replace(/,/g, '')) || 0,
          image: f.image || '',
          images: f.images || [],
          description: f.description || '',
          addons: f.addons || [],
          sort_order: i
        };
      });
      var { error: fErr } = await supabase.from('business_food').insert(foodRows);
      if (fErr) console.error('Food error:', fErr);
    }

    console.log('=== DONE: ' + d.slug + ' ===');

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, slug: d.slug })
    };

  } catch (err) {
    console.error('=== UNCAUGHT ERROR ===');
    console.error(err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};