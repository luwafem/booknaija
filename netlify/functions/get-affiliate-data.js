const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { affiliateId } = JSON.parse(event.body);
    
    if (!affiliateId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliate ID' }) };
    }

    // 1. Get Affiliate Details
    const { data: affiliate, error: affErr } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', affiliateId)
      .single();

    if (affErr || !affiliate) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Affiliate not found' }) };
    }

    // 2. Get all businesses referred by this affiliate
    const { data: referrals, error: refErr } = await supabase
      .from('businesses')
      .select('slug, name, logo, created_at, active')
      .eq('referred_by_affiliate', affiliateId)
      .order('created_at', { ascending: false });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          link: `https://booknaija.netlify.app/signup?ref=${affiliate.id}`
        },
        referrals: referrals || [] 
      })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};