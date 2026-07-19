const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
const cookie = require('cookie');          // 👈 ADDED
const jwt = require('jsonwebtoken');       // 👈 ADDED

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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const raw = JSON.parse(event.body);
    const sanitized = sanitizeDeep(raw);
    const { slug, email, callback_url, referredBy } = sanitized;

    if (!slug || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or email' }) };
    }

    // ─── JWT AUTHENTICATION (NEW) ───
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.dashboard_token;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: No session token provided.' }),
      };
    }

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

    // Ensure the JWT slug matches the requested slug
    if (decoded.slug !== slug) {
      console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to renew this subscription.' }),
      };
    }

    // ─── 1. Determine subaccount for split ───
    let subaccountToUse = null;

    // a. If referral is provided directly (signup or direct affiliate link)
    if (referredBy && referredBy.startsWith('aff_')) {
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('subaccount_code')
        .eq('id', referredBy)
        .single();

      if (!affErr && affiliate && affiliate.subaccount_code) {
        subaccountToUse = affiliate.subaccount_code;
        console.log(`✅ Using affiliate subaccount from referral: ${subaccountToUse}`);
      } else {
        console.warn(`⚠️ Affiliate ${referredBy} not found or has no subaccount_code.`);
      }
    }

    // b. If no affiliate from referral, check if business exists and has a referred affiliate
    if (!subaccountToUse) {
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .select('referred_by_affiliate, affiliate_bounty_paid')
        .eq('slug', slug)
        .single();

      if (bizErr) {
        console.log(`ℹ️ Business not found (likely signup). Skipping business-based affiliate lookup.`);
      } else if (biz && biz.referred_by_affiliate && !biz.affiliate_bounty_paid) {
        const { data: affiliate, error: affErr2 } = await supabase
          .from('affiliates')
          .select('subaccount_code')
          .eq('id', biz.referred_by_affiliate)
          .single();

        if (!affErr2 && affiliate && affiliate.subaccount_code) {
          subaccountToUse = affiliate.subaccount_code;
          console.log(`✅ Using affiliate subaccount from existing business: ${subaccountToUse}`);
        }
      }
    }

    // ─── 2. Build callback URL ───
    const baseUrl = process.env.SITE_URL || process.env.URL || 'https://five9.com.ng';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const finalCallbackUrl = callback_url || `${cleanBaseUrl}/dashboard/${slug}?sub_ref=SUCCESS`;

    // ─── 3. Initialize Paystack ───
    const payload = {
      email,
      amount: 2500 * 100, // ₦2,500
      currency: 'NGN',
      callback_url: finalCallbackUrl,
      metadata: {
        slug,
        payment_type: 'monthly_subscription',
        referredBy: referredBy || null,
      },
    };

    if (subaccountToUse) {
      payload.subaccount = subaccountToUse;
      payload.bearer = 'subaccount';
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured on server.' }) };
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.status) {
      console.error('Paystack initialization error:', data.message);
      return { statusCode: 400, body: JSON.stringify({ error: data.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ authorization_url: data.data.authorization_url }),
    };
  } catch (err) {
    console.error('🔥 initialize-subscription error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};