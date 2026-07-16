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

    // We can track payment failures by checking businesses that are active but have no subscription_ends_at in future
    // or those that have recently expired.
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Find businesses that were active recently but now inactive (possible payment failure)
    const { data: failedRecent } = await supabase
      .from('businesses')
      .select('slug, name, subscription_ends_at, active')
      .eq('active', false)
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Also check for any failed webhooks (by checking processed_webhooks for source='webhook' and maybe we don't have a reference)
    // For now we'll rely on the above.

    return {
      statusCode: 200,
      body: JSON.stringify({
        failures: failedRecent || [],
        count: (failedRecent || []).length,
      }),
    };
  } catch (err) {
    console.error('Payment failure check error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};