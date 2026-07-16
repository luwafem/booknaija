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

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { startDate, endDate, metrics } = JSON.parse(event.body);
    // metrics: array of strings like ['businesses', 'revenue', 'affiliates']

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const report = {};

    // Businesses count
    if (metrics.includes('businesses') || metrics.length === 0) {
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      report['New Businesses'] = count || 0;
    }

    // Revenue
    if (metrics.includes('revenue') || metrics.length === 0) {
      const { data } = await supabase
        .from('processed_webhooks')
        .select('amount')
        .eq('source', 'webhook')
        .gte('processed_at', start.toISOString())
        .lte('processed_at', end.toISOString());
      const total = data.reduce((sum, row) => sum + (row.amount || 0), 0);
      report['Revenue (₦)'] = total;
    }

    // New Affiliates
    if (metrics.includes('affiliates') || metrics.length === 0) {
      const { count } = await supabase
        .from('affiliates')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      report['New Affiliates'] = count || 0;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ report, startDate: start.toISOString(), endDate: end.toISOString() }),
    };
  } catch (err) {
    console.error('Report error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};