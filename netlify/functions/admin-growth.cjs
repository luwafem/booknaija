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

    const { data, error } = await supabase
      .from('businesses')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Aggregate by month
    const growth = {};
    data.forEach((row) => {
      const date = new Date(row.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      growth[key] = (growth[key] || 0) + 1;
    });

    // Sort keys
    const sortedKeys = Object.keys(growth).sort();
    const growthData = sortedKeys.map(key => ({ month: key, count: growth[key] }));

    return {
      statusCode: 200,
      body: JSON.stringify({ growthData }),
    };
  } catch (err) {
    console.error('Growth error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};