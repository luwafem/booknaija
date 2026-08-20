const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Only admins can log errors
  const auth = verifyAdmin(event);
  if (!auth.valid) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { level, source, message, metadata } = JSON.parse(event.body);
    await supabase.from('system_logs').insert({
      level: level || 'error',
      source: source || 'admin-dashboard',
      message,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Failed to log error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Logging failed' }) };
  }
};