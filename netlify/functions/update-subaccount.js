const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { slug, business_name, settlement_bank, account_number, account_name, email, phone } = JSON.parse(event.body);

    if (!slug || !settlement_bank || !account_number) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // 1. Try creating a new subaccount on Paystack
    const subRes = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        business_name: business_name,
        settlement_bank: settlement_bank,
        account_number: account_number,
        percentage_charge: 5,
        primary_contact_name: account_name || business_name,
        primary_contact_email: email,
        primary_contact_phone: phone,
      })
    });

    const subData = await subRes.json();

    if (!subRes.ok || !subData.subaccount_code) {
      return { statusCode: 400, body: JSON.stringify({ error: subData.message || 'Failed to verify bank details. Please check your account number and bank.' }) };
    }

    // 2. Update the business record in Supabase with the valid subaccount code
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({ subaccount_code: subData.subaccount_code })
      .eq('slug', slug);

    if (updateErr) {
      console.error('Supabase update error:', updateErr);
      return { statusCode: 500, body: JSON.stringify({ error: 'Verified, but failed to save. Please contact support.' }) };
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ ok: true, subaccount_code: subData.subaccount_code }) 
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};