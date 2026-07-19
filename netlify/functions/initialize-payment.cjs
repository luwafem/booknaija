// netlify/functions/initialize-payment.cjs
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION HELPER ───
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: [],
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeDeep);
  }
  if (input && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }
  return input;
}

// ─── HELPER: Compute total from items (only for existing businesses) ───
async function computeTotal(slug, items) {
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

      let itemTotal = food.price * (f.quantity || 1);
      const dbAddons = food.addons || [];
      const clientAddons = f.addons || {};

      for (const groupId in clientAddons) {
        const selected = clientAddons[groupId];
        const group = dbAddons.find(g => g.id === groupId);
        if (!group) continue;

        const selectedOptions = Array.isArray(selected) ? selected : [selected];
        for (const opt of selectedOptions) {
          const dbOpt = group.options.find(o => o.name === opt.name);
          if (dbOpt) {
            itemTotal += dbOpt.price * (f.quantity || 1);
          }
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
      const start = new Date(items.car.startDate);
      const end = new Date(items.car.endDate);
      const diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 1) diffDays = 1;
      total += car.price * diffDays;
    } else {
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
    const sanitized = sanitizeDeep(parsedBody);

    const {
      slug,
      items,
      amount: clientAmount,
      name, email, phone,
      date, time, address,
      calendarId,
      type,
      subaccountCode,
      referredBy,
      callback_url,
    } = sanitized;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured on server.' }) };
    }

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required.' }) };
    }

    // ─── DETECT SIGNUP: no items or empty items ───
    const isSignup = !items || Object.keys(items).length === 0;

    // ─── CONDITIONAL JWT AUTH ───
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.dashboard_token;

    if (token) {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('JWT_SECRET not set in environment');
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Server misconfiguration.' }),
        };
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        console.warn('JWT verification failed:', err.message);
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid or expired session. Please log in again.' }),
        };
      }

      if (decoded.slug !== slug) {
        console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Forbidden: You do not have permission to initiate payment for this business.' }),
        };
      }
    }

    let finalAmountKobo = 0;

    if (isSignup) {
      // Signup flow – amount must be ₦2,500 (250,000 kobo)
      const expectedAmount = 2500;
      const clientAmountNumber = parseFloat(clientAmount || 0);
      if (Math.abs(clientAmountNumber - expectedAmount) > 0.01) {
        console.warn(`Signup amount mismatch: client ${clientAmountNumber}, expected ${expectedAmount}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid amount for signup. Please refresh and try again.' }),
        };
      }
      finalAmountKobo = expectedAmount * 100;

      // ─── AFFILIATE COMMISSION TRACKING FOR SIGNUPS ───
      // If this signup came via an affiliate, we store the referredBy in metadata.
      // The actual affiliate_commission_month will be set to 0 in save-business.cjs.
      // We also validate that the affiliate exists and has a valid subaccount_code.
      if (referredBy && referredBy.startsWith('aff_')) {
        console.log(`🔍 Affiliate referral detected for signup: ${referredBy}`);
        const { data: affiliate, error: affErr } = await supabase
          .from('affiliates')
          .select('subaccount_code')
          .eq('id', referredBy)
          .single();

        if (affErr) {
          console.warn(`⚠️ Affiliate ${referredBy} not found or invalid:`, affErr.message);
          // We do NOT block signup – we just log the warning.
        } else if (affiliate && affiliate.subaccount_code) {
          console.log(`✅ Affiliate ${referredBy} has subaccount: ${affiliate.subaccount_code}`);
          // We will use this subaccount for the Paystack split.
          // The subaccount will be set in the payload below.
        } else {
          console.warn(`⚠️ Affiliate ${referredBy} has no subaccount_code.`);
        }
      }
    } else {
      // ─── BOOKING / PRODUCT FLOW – server-side price computation ───
      let serverTotal = 0;
      try {
        serverTotal = await computeTotal(slug, items);
      } catch (err) {
        console.error('Price computation error:', err.message);
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid items in cart' }) };
      }

      const clientTotalKobo = Math.round(parseFloat(clientAmount || 0) * 100);
      const serverTotalKobo = Math.round(serverTotal * 100);

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
      finalAmountKobo = serverTotalKobo;
    }

    // ─── AFFILIATE SPLIT LOGIC (for both signup and booking) ───
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

    // ─── BUILD CALLBACK URL ───
    const baseUrl = process.env.SITE_URL || process.env.URL || 'https://five9.com.ng';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    let callbackUrl;
    if (callback_url) {
      callbackUrl = callback_url;
    } else if (isSignup) {
      callbackUrl = `${cleanBaseUrl}/onboarding?slug=${slug}`;
    } else {
      callbackUrl = `${cleanBaseUrl}/book/${slug}`;
    }

    // ─── PAYLOAD ───
    const payload = {
      email,
      amount: finalAmountKobo,
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata: {
        slug,
        serviceId: items?.service?.id || null,
        serviceName: type || (isSignup ? 'signup' : 'booking'),
        date,
        time,
        customerName: name,
        customerPhone: phone,
        calendarId,
        type: type || (isSignup ? 'signup' : 'service'),
        address: address || 'N/A',
        subaccountCode: finalSubaccountCode || null,
        referredBy: referredBy || null,
        isSignup: isSignup,
        // ─── NEW: Explicit flag for affiliate commission tracking ───
        affiliateCommissionMonth: isSignup && referredBy ? 0 : null,
      },
    };

    if (finalSubaccountCode) {
      payload.subaccount = finalSubaccountCode;
      payload.bearer = 'subaccount';
    }

    console.log('Sending to Paystack (sanitised):', JSON.stringify(payload));

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