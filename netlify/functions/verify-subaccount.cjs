const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
const { validateCsrf } = require('./_utils/csrf'); // 👈 NEW

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

    const { reference, slug } = payload;

    if (!reference || !slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing reference or slug' }) };
    }

    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured' }) };
    }

    // 1. Verify payment with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await res.json();

    if (!data.status || data.data.status !== 'success') {
      console.error('Paystack verification failed:', data.message || data.data?.gateway_response || 'Unknown error');
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment not verified' }) };
    }

    // 2. Add 30 days to subscription & Reactivate page
    const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        subscription_ends_at: newEndDate,
        active: true,
      })
      .eq('slug', slug);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw new Error('Failed to update subscription status');
    }

    // 3. Mark Affiliate Bounty as Paid (Crucial step!)
    const { error: bountyError } = await supabase
      .from('businesses')
      .update({ affiliate_bounty_paid: true })
      .eq('slug', slug)
      .eq('affiliate_bounty_paid', false); // Only update if it was false

    if (bountyError) {
      console.error('Failed to mark affiliate bounty as paid:', bountyError.message);
      // Non‑critical, so we don't throw.
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, new_end_date: newEndDate }),
    };
  } catch (err) {
    console.error('verify-subaccount error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};