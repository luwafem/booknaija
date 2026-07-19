const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // Fetch all relevant tables
    const tables = ['businesses', 'affiliates', 'processed_webhooks', 'failed_payouts', 'offline_bookings'];
    const backup = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      backup[table] = data;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="Five9-backup-${new Date().toISOString().slice(0,10)}.json"`,
      },
      body: JSON.stringify(backup),
    };
  } catch (err) {
    console.error('Backup error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};