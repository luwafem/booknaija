const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) {
      return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const params = event.queryStringParameters || {};
    const level = params.level; // 'info', 'warn', 'error'
    const limit = Math.min(100, parseInt(params.limit) || 50);
    const page = Math.max(1, parseInt(params.page) || 1);

    let query = supabase
      .from('system_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (level) {
      query = query.eq('level', level);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        logs: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }),
    };
  } catch (err) {
    console.error('Admin logs error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};