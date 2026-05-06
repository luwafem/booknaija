const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  
  try {
    const { reference, slug } = JSON.parse(event.body);
    if (!reference || !slug) return { statusCode: 400, body: JSON.stringify({ error: 'Missing reference or slug' }) };

    // 1. Verify payment with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    const data = await res.json();

    if (!data.status || data.data.status !== 'success') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment not verified' }) };
    }

    // 2. Add 30 days to subscription & Reactivate page
    const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ 
        subscription_ends_at: newEndDate,
        active: true 
      })
      .eq('slug', slug);

    if (updateError) throw updateError;

    // 3. Mark Affiliate Bounty as Paid (Crucial step!)
    await supabase
      .from('businesses')
      .update({ affiliate_bounty_paid: true })
      .eq('slug', slug)
      .eq('affiliate_bounty_paid', false); // Only update if it was false

    return { statusCode: 200, body: JSON.stringify({ success: true, new_end_date: newEndDate }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};