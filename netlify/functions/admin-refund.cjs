const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function logSystemEvent(level, source, message, metadata = {}) {
  try {
    await supabase.from('system_logs').insert({ level, source, message, metadata });
  } catch (err) { console.error('Log error:', err.message); }
}

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!validateCsrf(event)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Invalid CSRF token' }) };
    }

    const { transactionReference, amount, reason } = JSON.parse(event.body);
    if (!transactionReference) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing transaction reference' }) };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY not set');

    // Initiate refund with Paystack
    const res = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: transactionReference,
        amount: amount ? amount * 100 : undefined, // optional amount in kobo
        merchant_note: reason || 'Admin initiated refund',
      }),
    });

    const data = await res.json();
    if (!data.status) {
      throw new Error(data.message || 'Refund failed');
    }

    await logSystemEvent('info', 'admin-refund', `Refund processed for ${transactionReference}`, { transactionReference, amount, reason });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, refund: data.data }),
    };
  } catch (err) {
    console.error('Refund error:', err);
    await logSystemEvent('error', 'admin-refund', err.message, { event });
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};