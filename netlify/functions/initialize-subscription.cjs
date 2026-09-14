// netlify/functions/initialize-subscription.cjs
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { validateCsrf } = require('./_utils/csrf');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION ───
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
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // ─── CSRF PROTECTION ───
    // This endpoint is only ever called from the authenticated dashboard
    // (useDashboard.js → handlePaySubscription). The CSRF cookie exists
    // by then, so we can safely enforce it.
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    // ─── PARSE & SANITISE ───
    let raw;
    try {
      raw = JSON.parse(event.body);
    } catch (_) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }
    const sanitized = sanitizeDeep(raw);
    const { slug, callback_url } = sanitized;

    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug' }) };
    }

    // ─── JWT AUTHENTICATION ───
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

    if (decoded.slug !== slug) {
      console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to renew this subscription.' }),
      };
    }

    // ─── 1. Fetch business from DB ───
    // We read the owner's email here rather than trusting the client payload.
    // Otherwise a logged-in user could redirect the Paystack receipt (which
    // contains their billing info) to an arbitrary email address.
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('email, referred_by_affiliate, affiliate_bounty_paid')
      .eq('slug', slug)
      .maybeSingle();

    // Real DB error (not "no rows")
    if (bizErr && bizErr.code !== 'PGRST116') {
      console.error('Failed to fetch business:', bizErr);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch business' }) };
    }

    if (!biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    if (!biz.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Please add an email address to your business profile before renewing.',
        }),
      };
    }

    // ─── 2. Determine affiliate subaccount for split ───
    // NOTE: In practice this branch rarely fires on renewals because
    // save-business.cjs already sets affiliate_bounty_paid = true for
    // affiliate signups (the split paid month 1 at signup time). Kept here
    // for safety on legacy rows.
    let subaccountToUse = null;

    if (biz.referred_by_affiliate && !biz.affiliate_bounty_paid) {
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('subaccount_code')
        .eq('id', biz.referred_by_affiliate)
        .maybeSingle();

      if (!affErr && affiliate && affiliate.subaccount_code) {
        subaccountToUse = affiliate.subaccount_code;
        console.log(`✅ Using affiliate subaccount for split: ${subaccountToUse}`);
      } else {
        console.warn(
          `⚠️ Affiliate ${biz.referred_by_affiliate} not found or has no subaccount_code. Continuing without split.`
        );
      }
    }

    // ─── 3. Build callback URL ───
    // Paystack appends `&reference=XXX&trxref=XXX` to whatever callback_url
    // we pass. The `?sub_ref=SUCCESS` marker is just a hint that the user
    // returned from a subscription payment — the real reference is read from
    // the `reference`/`trxref` params by useDashboard.js.
    const baseUrl = process.env.SITE_URL || process.env.URL || 'https://five9.com.ng';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const finalCallbackUrl =
      callback_url || `${cleanBaseUrl}/dashboard/${slug}?sub_ref=SUCCESS`;

    // ─── 4. Initialize Paystack ───
    const payload = {
      email: biz.email,          // ← from DB, not client
      amount: 2500 * 100,        // ₦2,500 in kobo
      currency: 'NGN',
      callback_url: finalCallbackUrl,
      metadata: {
        slug,
        payment_type: 'monthly_subscription',
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