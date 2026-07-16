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

    const { affiliateId, commissionRate } = JSON.parse(event.body);
    if (!affiliateId || commissionRate === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliateId or commissionRate' }) };
    }

    if (commissionRate < 0 || commissionRate > 100) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Commission rate must be between 0 and 100' }) };
    }

    const { error } = await supabase
      .from('affiliates')
      .update({ override_commission_rate: commissionRate })
      .eq('id', affiliateId);

    if (error) throw error;

    await logSystemEvent('info', 'admin-commission', `Updated commission rate for affiliate ${affiliateId} to ${commissionRate}%`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, commissionRate }),
    };
  } catch (err) {
    console.error('Commission update error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};