const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');

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

    // ─── Total Revenue (all time) – include webhook and manual ──
    const { data: totalData, error: totalErr } = await supabase
      .from('processed_webhooks')
      .select('amount')
      .in('source', ['webhook', 'manual']);
    if (totalErr) throw totalErr;

    // Sum amounts (in kobo) then divide by 100 to get Naira
    const totalRevenueKobo = totalData.reduce((sum, row) => sum + (row.amount || 0), 0);
    const totalRevenue = totalRevenueKobo / 100;

    // ─── Monthly Revenue (last 12 months) ──────────────────
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: monthlyData, error: monthlyErr } = await supabase
      .from('processed_webhooks')
      .select('amount, processed_at')
      .in('source', ['webhook', 'manual'])
      .gte('processed_at', twelveMonthsAgo.toISOString())
      .order('processed_at', { ascending: true });
    if (monthlyErr) throw monthlyErr;

    const monthlyRevenue = {};
    monthlyData.forEach((row) => {
      const date = new Date(row.processed_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      // Store in Naira (divide by 100)
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (row.amount || 0) / 100;
    });

    // ─── MRR (current month's revenue so far) ──────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: mrrData, error: mrrErr } = await supabase
      .from('processed_webhooks')
      .select('amount')
      .in('source', ['webhook', 'manual'])
      .gte('processed_at', startOfMonth.toISOString());
    if (mrrErr) throw mrrErr;

    const mrrKobo = mrrData.reduce((sum, row) => sum + (row.amount || 0), 0);
    const mrr = mrrKobo / 100;

    // ─── Active Subscriptions (count) ──────────────────────
    const { count: activeSubs, error: subsErr } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    if (subsErr) throw subsErr;

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalRevenue,
        monthlyRevenue,
        mrr,
        activeSubscriptions: activeSubs || 0,
        currency: 'NGN',
      }),
    };
  } catch (err) {
    console.error('Admin revenue error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};