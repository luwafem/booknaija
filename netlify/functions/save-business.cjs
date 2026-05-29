const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── DERIVE FEATURE FLAGS FROM BUSINESS TYPE ───
function getFeaturesForType(type) {
  switch (type) {
    case 'Fashion':
      return { services_enabled: true, products_enabled: true, cars_enabled: false, food_enabled: false, properties_enabled: false };
    case 'Lash Artist':
    case 'Hair Stylist':
    case 'Makeup Artist':
    case 'Nail Technician':
    case 'Skin Care':
      return { services_enabled: true, products_enabled: true, cars_enabled: false, food_enabled: false, properties_enabled: false };
    case 'Cleaner':
    case 'Tutor':
      return { services_enabled: true, products_enabled: false, cars_enabled: false, food_enabled: false, properties_enabled: false };
    case 'Restaurant':
      return { services_enabled: false, products_enabled: false, cars_enabled: false, food_enabled: true, properties_enabled: false };
    case 'Auto':
      return { services_enabled: false, products_enabled: false, cars_enabled: true, food_enabled: false, properties_enabled: false };
    case 'Real Estate':
    case 'Shortlet':
      return { services_enabled: false, products_enabled: false, cars_enabled: false, food_enabled: false, properties_enabled: true };
    default:
      return { services_enabled: true, products_enabled: true, cars_enabled: false, food_enabled: false, properties_enabled: false };
  }
}

exports.handler = async function (event) {
  console.log('=== SAVE-BUSINESS TO SUPABASE ===');

  try {
    var d = JSON.parse(event.body);
    console.log('Slug:', d.slug);

    if (!d.slug || !d.name) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or name' }) };
    }

    // ─── SPAM PROTECTION ───
    if (d._gotcha) {
      console.log('Honeypot triggered. Rejecting spam.');
      return { statusCode: 200, body: JSON.stringify({ ok: true, spam: true }) };
    }

    const { data: existingBiz } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', d.slug)
      .single();

    if (!existingBiz) {
      const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: recentSignups } = await supabase
        .from('businesses')
        .select('id')
        .eq('email', d.email)
        .gte('created_at', twoMinsAgo);
      
      if (recentSignups && recentSignups.length > 0) {
        console.log('Rate limited: email', d.email, 'already signed up recently');
        return { statusCode: 429, body: JSON.stringify({ error: 'Too many signup attempts. Please wait a minute.' }) };
      }
    } else {
      console.log('Existing business found. Skipping rate limit (this is an update).');
    }
    // ─── END SPAM PROTECTION ───

    // ─── RESOLVE FEATURE FLAGS ───
    const businessType = d.businessType || d.business_type || '';
    const derivedFeatures = getFeaturesForType(businessType);

    const servicesEnabled = (d.servicesEnabled !== undefined) 
      ? d.servicesEnabled === true 
      : (d.services_enabled !== undefined ? d.services_enabled === true : derivedFeatures.services_enabled);

    const productsEnabled = (d.productsEnabled !== undefined) 
      ? d.productsEnabled === true 
      : (d.products_enabled !== undefined ? d.products_enabled === true : derivedFeatures.products_enabled);

    const carsEnabled = (d.carsEnabled !== undefined) 
      ? d.carsEnabled === true 
      : (d.cars_enabled !== undefined ? d.cars_enabled === true : derivedFeatures.cars_enabled);

    const foodEnabled = (d.foodEnabled !== undefined) 
      ? d.foodEnabled === true 
      : (d.food_enabled !== undefined ? d.food_enabled === true : derivedFeatures.food_enabled);

    const propertiesEnabled = (d.propertiesEnabled !== undefined) 
      ? d.propertiesEnabled === true 
      : (d.properties_enabled !== undefined ? d.properties_enabled === true : derivedFeatures.properties_enabled);

    console.log('Feature flags resolved:', { businessType, servicesEnabled, productsEnabled, carsEnabled, foodEnabled, propertiesEnabled });
    // ────────────────────────────

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
      lat: d.lat || null,
      lng: d.lng || null,
      hours: d.hours || '',
      accent: d.accent || '#c8a97e',
      theme: d.theme || 'light',
      google_maps_claimed: d.googleMapsClaimed === true,
      avatar: '',
      hero: d.hero || '',
      hero_slides: d.hero_slides || [],
      team: d.team || [], // ─── ADDED: Save team members array ───
      paystack_public_key: d.paystackPublicKey || 'pk_live_2ba1413aaaf5091188571ea6f87cca34945d943c',
      subaccount_code: d.subaccountCode || '',
      calendar_id: d.calendarId || '',

      // ─── BANK DETAILS FOR OFFLINE PAYMENTS ───
      account_name: d.account_name || d.accountName || '',
      account_number: d.account_number || d.accountNumber || '',
      settlement_bank: d.settlement_bank || d.settlementBank || '',
      // ─────────────────────────────────────────────

      active: true,
      ads_enabled: d.adsEnabled !== false,
      business_type: businessType,
      
      // ─── USE RESOLVED FEATURE FLAGS ───
      services_enabled: servicesEnabled,
      products_enabled: productsEnabled,
      cars_enabled: carsEnabled,
      food_enabled: foodEnabled,
      properties_enabled: propertiesEnabled,
      // ───────────────────────────────────

      socials: d.socials || {},
      gallery: d.gallery || [],
      security_code: d.securityCode || '',
      security_question_1: d.securityQuestion1 || '',
      security_answer_1: (d.securityAnswer1 || '').toLowerCase().trim(),
      security_question_2: d.securityQuestion2 || '',
      security_answer_2: (d.securityAnswer2 || '').toLowerCase().trim(),
      
      referred_by_affiliate: (d.referredBy && d.referredBy.startsWith('aff_')) ? d.referredBy : null,
      affiliate_bounty_paid: !!(d.referredBy && d.referredBy.startsWith('aff_'))
    };

    if (!existingBiz) {
      bizPayload.subscription_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

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
    if (d.referredBy && d.referredBy !== d.slug && !d.referredBy.startsWith('aff_')) {
      try {
        console.log('Processing normal referral from slug:', d.referredBy);
        
        const { data: referrer, error: refErr } = await supabase
          .from('businesses')
          .select('id, referral_count')
          .eq('slug', d.referredBy)
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
    } else if (d.referredBy && d.referredBy.startsWith('aff_')) {
      console.log('Affiliate referral detected. Saved to database during upsert. Skipping standard referral count.');
    }

    // Clear old related data
    await supabase.from('business_services').delete().eq('business_id', businessId);
    await supabase.from('business_products').delete().eq('business_id', businessId);
    await supabase.from('business_cars').delete().eq('business_id', businessId);
    await supabase.from('business_food').delete().eq('business_id', businessId);
    await supabase.from('business_properties').delete().eq('business_id', businessId);

    // 3. Insert services
    if (d.services && d.services.length > 0) {
      var serviceRows = d.services.map(function (s, i) {
        return {
          business_id: businessId,
          service_id: s.id,
          name: s.name,
          duration: s.duration || '',
          price: parseInt(String(s.price).replace(/,/g, '')) || 0,
          discount_enabled: s.discount_enabled === true,           
          discount_price: parseInt(String(s.discount_price).replace(/,/g, '')) || 0, 
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

    // 4. Insert products
    if (d.products && d.products.length > 0) {
      var productRows = d.products.map(function (p, i) {
        return {
          business_id: businessId,
          product_id: p.id,
          name: p.name,
          price: parseInt(String(p.price).replace(/,/g, '')) || 0,
          product_code: (p.product_code || '').toUpperCase().trim(), 
          discount_enabled: p.discount_enabled === true,               
          discount_price: parseInt(String(p.discount_price).replace(/,/g, '')) || 0,
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

    // 7. Insert properties
    if (d.properties && d.properties.length > 0) {
      var propertyRows = d.properties.map(function (p, i) {
        return {
          business_id: businessId,
          property_id: p.id,
          name: p.name,
          type: p.type || 'sale',
          price: parseInt(String(p.price).replace(/,/g, '')) || 0,
          location: p.location || '',
          bedrooms: p.bedrooms || '',
          bathrooms: p.bathrooms || '',
          description: p.description || '',
          images: p.images || [],
          sort_order: i
        };
      });
      var { error: propErr } = await supabase.from('business_properties').insert(propertyRows);
      if (propErr) console.error('Properties error:', propErr);
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