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
    // Parse and sanitise input
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseErr) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }
    payload = sanitizeDeep(payload);

    const { affiliateId } = payload;

    if (!affiliateId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliate ID' }) };
    }

    // 1. Get Affiliate Details
    const { data: affiliate, error: affErr } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', affiliateId)
      .single();

    if (affErr || !affiliate) {
      console.error('Affiliate not found:', affErr?.message || 'No affiliate');
      return { statusCode: 404, body: JSON.stringify({ error: 'Affiliate not found' }) };
    }

    // 2. Get all businesses referred by this affiliate
    const { data: referrals, error: refErr } = await supabase
      .from('businesses')
      .select('slug, name, logo, created_at, active, affiliate_bounty_paid')
      .eq('referred_by_affiliate', affiliateId)
      .order('created_at', { ascending: false });

    if (refErr) {
      console.error('Error fetching referrals:', refErr.message);
      // Still return affiliate data with empty referrals
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          phone: affiliate.phone,
          link: `https://booknaija.netlify.app/signup?ref=${affiliate.id}`,
          subaccount_code: affiliate.subaccount_code || null,
        },
        referrals: referrals || [],
      }),
    };
  } catch (err) {
    console.error('get-affiliate-data error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};