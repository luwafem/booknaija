const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');

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
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const raw = JSON.parse(event.body);
    const sanitized = sanitizeDeep(raw);
    const { slug, email } = sanitized;

    if (!slug || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or email' }) };
    }

    // 1. Get Business Data
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('referred_by_affiliate, affiliate_bounty_paid')
      .eq('slug', slug)
      .single();

    if (bizErr || !biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    let subaccountToUse = null;

    // 2. The "Big Bounty" Check
    if (biz.referred_by_affiliate && !biz.affiliate_bounty_paid) {
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('subaccount_code')
        .eq('id', biz.referred_by_affiliate)
        .single();

      if (!affErr && affiliate) {
        subaccountToUse = affiliate.subaccount_code;
      }
    }

    // ─── HARDCODE CALLBACK URL ───
    const baseUrl = process.env.SITE_URL || process.env.URL || 'https://booknaija.netlify.app';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const callbackUrl = `${cleanBaseUrl}/dashboard/${slug}?sub_ref=SUCCESS`;

    // 3. Initialize Paystack (₦2,500 subscription fee)
    const payload = {
      email,
      amount: 2500 * 100, // 2,500 Naira = 250,000 kobo
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata: { slug, payment_type: 'monthly_subscription' },
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
      console.error('Paystack init error:', data.message);
      return { statusCode: 400, body: JSON.stringify({ error: data.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ authorization_url: data.data.authorization_url }),
    };
  } catch (err) {
    console.error('initialize-subaccount error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};