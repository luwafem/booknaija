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

    const { affiliateId } = event.queryStringParameters;
    if (!affiliateId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliateId' }) };
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('slug, name, created_at, active, affiliate_commission_month')
      .eq('referred_by_affiliate', affiliateId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ referrals: data || [] }),
    };
  } catch (err) {
    console.error('Affiliate referrals error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};