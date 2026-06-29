// netlify/functions/initialize-payment.cjs
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── HELPER: Compute total from items ───
async function computeTotal(slug, items) {
  // Get business ID from slug
  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single();

  if (bizErr || !biz) throw new Error('Business not found');

  const businessId = biz.id;
  let total = 0;

  // 1. Service
  if (items.service) {
    const { data: service, error } = await supabase
      .from('business_services')
      .select('price, discount_enabled, discount_price')
      .eq('service_id', items.service.id)
      .eq('business_id', businessId)
      .single();

    if (error) throw new Error(`Service ${items.service.id} not found`);
    const price = service.discount_enabled ? service.discount_price : service.price;
    total += price * (items.service.quantity || 1);
  }

  // 2. Products
  if (items.products && items.products.length > 0) {
    for (const p of items.products) {
      const { data: product, error } = await supabase
        .from('business_products')
        .select('price, discount_enabled, discount_price')
        .eq('product_id', p.id)
        .eq('business_id', businessId)
        .single();

      if (error) throw new Error(`Product ${p.id} not found`);
      const price = product.discount_enabled ? product.discount_price : product.price;
      total += price * (p.quantity || 1);
    }
  }

  // 3. Food items (including addons)
  if (items.food && items.food.length > 0) {
    for (const f of items.food) {
      const { data: food, error } = await supabase
        .from('business_food')
        .select('price, addons')
        .eq('food_id', f.id)
        .eq('business_id', businessId)
        .single();

      if (error) throw new Error(`Food item ${f.id} not found`);

      // Base price
      let itemTotal = food.price * (f.quantity || 1);

      // Add addons – we need to look up each addon price from the DB
      const dbAddons = food.addons || [];
      const clientAddons = f.addons || {};

      // clientAddons is an object: { groupId: { name, price } or [{ name, price }] }
      for (const groupId in clientAddons) {
        const selected = clientAddons[groupId];
        const group = dbAddons.find(g => g.id === groupId);
        if (!group) continue; // ignore unknown group

        // Determine if it's single or multiple
        const selectedOptions = Array.isArray(selected) ? selected : [selected];
        for (const opt of selectedOptions) {
          // Find matching option in DB by name (or id if we had it)
          const dbOpt = group.options.find(o => o.name === opt.name);
          if (dbOpt) {
            itemTotal += dbOpt.price * (f.quantity || 1); // multiply by quantity if addons are per item
            // Note: depending on business logic, addon price might be per item or per order.
            // We'll assume addon price is per unit of the food item.
          }
          // If not found, we might want to reject, but we'll trust client for now
        }
      }

      total += itemTotal;
    }
  }

  // 4. Car
  if (items.car) {
    const { data: car, error } = await supabase
      .from('business_cars')
      .select('price, type')
      .eq('car_id', items.car.id)
      .eq('business_id', businessId)
      .single();

    if (error) throw new Error(`Car ${items.car.id} not found`);

    if (items.car.type === 'rent') {
      // Calculate days
      const start = new Date(items.car.startDate);
      const end = new Date(items.car.endDate);
      const diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 1) diffDays = 1;
      total += car.price * diffDays;
    } else {
      // For sale/viewing – use a fixed viewing fee (5000) or car price? We'll use client's base price but we can validate.
      // Since we don't have a separate viewing fee in DB, we'll trust the client for the amount.
      // However, we can check that the price matches the car's price (if they are buying)
      // For simplicity, we'll add the car.price (assuming it's the asking price)
      total += car.price;
    }
  }

  return total;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing request body' }) };
    }

    const parsedBody = JSON.parse(event.body);
    const {
      slug,
      items,          // New: structured cart items
      amount: clientAmount,
      name, email, phone,
      date, time, address,
      calendarId,
      type,
      subaccountCode,
      referredBy,
    } = parsedBody;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured on server.' }) };
    }

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required.' }) };
    }

    // ─── SERVER-SIDE PRICE COMPUTATION ───
    let serverTotal = 0;
    try {
      serverTotal = await computeTotal(slug, items || {});
    } catch (err) {
      console.error('Price computation error:', err.message);
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid items in cart' }) };
    }

    const clientTotalKobo = Math.round(parseFloat(clientAmount || 0) * 100);
    const serverTotalKobo = Math.round(serverTotal * 100);

    // Allow 1 kobo rounding difference
    if (Math.abs(clientTotalKobo - serverTotalKobo) > 1) {
      console.warn(`Price mismatch: client ${clientTotalKobo}, server ${serverTotalKobo}`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Price validation failed. Please refresh and try again.',
          server_total: serverTotal,
        }),
      };
    }

    // ─── AFFILIATE SPLIT LOGIC ───
    let finalSubaccountCode = subaccountCode || null;
    if (referredBy && referredBy.startsWith('aff_')) {
      console.log(`Affiliate referral detected: ${referredBy}. Looking up subaccount...`);
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('subaccount_code')
        .eq('id', referredBy)
        .single();

      if (affErr) {
        console.error('Error fetching affiliate:', affErr.message);
      } else if (affiliate && affiliate.subaccount_code) {
        finalSubaccountCode = affiliate.subaccount_code;
        console.log(`Applying affiliate subaccount split: ${finalSubaccountCode}`);
      } else {
        console.warn('Affiliate ID provided but no subaccount code found in DB.');
      }
    }

    // ─── HARDCODE CALLBACK URL ───
    const baseUrl = process.env.SITE_URL || process.env.URL || 'https://booknaija.netlify.app';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const callbackUrl = `${cleanBaseUrl}/book/${slug}`;

    // Build payload with server-computed total
    const payload = {
      email,
      amount: serverTotalKobo, // Use server‑computed total
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata: {
        slug,
        serviceId: items?.service?.id || null,
        serviceName: type || 'booking',
        date,
        time,
        customerName: name,
        customerPhone: phone,
        calendarId,
        type: type || 'service',
        address: address || 'N/A',
        subaccountCode: finalSubaccountCode || null,
        referredBy: referredBy || null,
      },
    };

    if (finalSubaccountCode) {
      payload.subaccount = finalSubaccountCode;
      payload.bearer = 'subaccount';
    }

    console.log('Sending to Paystack:', JSON.stringify(payload));

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Paystack Response:', JSON.stringify(data));

    if (!data.status) {
      console.error('Paystack Error:', data.message);
      return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Paystack initialization failed.' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      }),
    };
  } catch (err) {
    console.error('🔥 Function Crash:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }) };
  }
};