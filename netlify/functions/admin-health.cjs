const { verifyAdmin } = require('./_utils/admin-utils.cjs');

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const statuses = {};

    // Check Supabase
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { error } = await supabase.from('businesses').select('id').limit(1);
      statuses.supabase = error ? { status: 'error', message: error.message } : { status: 'ok' };
    } catch (err) {
      statuses.supabase = { status: 'error', message: err.message };
    }

    // Check Paystack
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY not set');
      const res = await fetch('https://api.paystack.co/transaction?perPage=1', {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      if (res.status === 200) {
        statuses.paystack = { status: 'ok' };
      } else {
        statuses.paystack = { status: 'error', message: `HTTP ${res.status}` };
      }
    } catch (err) {
      statuses.paystack = { status: 'error', message: err.message };
    }

    // Check Cloudinary (optional)
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/deexaiik4/ping', { method: 'GET' });
      if (res.ok) {
        statuses.cloudinary = { status: 'ok' };
      } else {
        statuses.cloudinary = { status: 'error', message: `HTTP ${res.status}` };
      }
    } catch (err) {
      statuses.cloudinary = { status: 'error', message: err.message };
    }

    return { statusCode: 200, body: JSON.stringify(statuses) };
  } catch (err) {
    console.error('Health check error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};