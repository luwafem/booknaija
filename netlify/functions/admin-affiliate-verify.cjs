// netlify/functions/admin-affiliate-verify.cjs
const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = verifyAdmin(event);
  if (!auth.valid) {
    return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
  }

  if (!validateCsrf(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Invalid CSRF token' }) };
  }

  try {
    const { affiliateId, verified } = JSON.parse(event.body);

    if (!affiliateId || typeof verified !== 'boolean') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliateId or verified flag' }) };
    }

    const { error } = await supabase
      .from('affiliates')
      .update({ verified })
      .eq('id', affiliateId);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, verified }),
    };
  } catch (err) {
    console.error('Affiliate verify error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};