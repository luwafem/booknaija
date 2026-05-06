const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  
  try {
    const { slug, email } = JSON.parse(event.body);
    if (!slug || !email) return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or email' }) };

    // 1. Get Business Data
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('referred_by_affiliate, affiliate_bounty_paid')
      .eq('slug', slug)
      .single();

    if (bizErr || !biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };

    let subaccountToUse = null;

    // 2. The "Big Bounty" Check
    if (biz.referred_by_affiliate && !biz.affiliate_bounty_paid) {
      // Get the affiliate's subaccount code
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('subaccount_code')
        .eq('id', biz.referred_by_affiliate)
        .single();

      if (!affErr && affiliate) {
        subaccountToUse = affiliate.subaccount_code; // Give affiliate 60% (1,500 Naira)
      }
    }

    // 3. Initialize Paystack (NO subaccount = You keep 100% of the 2,500 Naira)
    const payload = {
      email,
      amount: 2500 * 1000, // 2,500 Naira in kobo
      currency: 'NGN',
      callback_url: `${process.env.URL || 'https://booknaija.netlify.app'}/dashboard/${slug}?sub_ref=SUCCESS`,
      metadata: { slug, payment_type: 'monthly_subscription' }
    };

    if (subaccountToUse) {
      payload.subaccount = subaccountToUse;
      payload.bearer = 'subaccount';
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.status) return { statusCode: 400, body: JSON.stringify({ error: data.message }) };

    return { statusCode: 200, body: JSON.stringify({ authorization_url: data.data.authorization_url }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};