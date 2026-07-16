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

    // Count queries
    const { count: totalBusinesses, error: err1 } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    if (err1) throw err1;

    const { count: activeBusinesses, error: err2 } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    if (err2) throw err2;

    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const { count: expiringSoon, error: err3 } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .lt('subscription_ends_at', fiveDaysFromNow);
    if (err3) throw err3;

    const { count: totalAffiliates, error: err4 } = await supabase
      .from('affiliates')
      .select('*', { count: 'exact', head: true });
    if (err4) throw err4;

    const { count: pendingFailedPayouts, error: err5 } = await supabase
      .from('failed_payouts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (err5) throw err5;

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalBusinesses: totalBusinesses || 0,
        activeBusinesses: activeBusinesses || 0,
        expiringSoon: expiringSoon || 0,
        totalAffiliates: totalAffiliates || 0,
        pendingFailedPayouts: pendingFailedPayouts || 0,
      }),
    };
  } catch (err) {
    console.error('Admin stats error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};