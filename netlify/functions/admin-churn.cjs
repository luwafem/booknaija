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

    // Get monthly active count for last 12 months
    const { data: businesses } = await supabase
      .from('businesses')
      .select('created_at, subscription_ends_at, active');

    // Calculate monthly churn: active at start vs active at end
    // We'll aggregate by month
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key: monthKey, date });
    }

    // For each month, count active businesses at start and end
    const churnData = months.map(({ key, date }) => {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      // Active at start: active=true AND subscription_ends_at > monthStart
      const startActive = businesses.filter(b => 
        b.active && b.subscription_ends_at && new Date(b.subscription_ends_at) > monthStart
      ).length;
      
      // Active at end: active=true AND subscription_ends_at > monthEnd
      const endActive = businesses.filter(b => 
        b.active && b.subscription_ends_at && new Date(b.subscription_ends_at) > monthEnd
      ).length;
      
      // Churned = startActive - endActive (if positive)
      const churned = Math.max(0, startActive - endActive);
      const churnRate = startActive > 0 ? (churned / startActive) * 100 : 0;
      
      return { month: key, startActive, endActive, churned, churnRate: Math.round(churnRate * 100) / 100 };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ churnData }),
    };
  } catch (err) {
    console.error('Churn error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};