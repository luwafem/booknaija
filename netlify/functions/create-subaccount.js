// netlify/functions/create-subaccount.js
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const {
      business_name,
      settlement_bank,    // Paystack bank code e.g. "058" for GTBank
      account_number,     // 10-digit NUBAN account number
      percentage_charge,  // Platform commission e.g. 5 for 5%
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
    } = JSON.parse(event.body);

    // Validate required fields
    if (!business_name || !settlement_bank || !account_number || !percentage_charge) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing required fields: business_name, settlement_bank, account_number, percentage_charge' }) 
      };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured' }) };

    const res = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name,
        settlement_bank,
        account_number,
        percentage_charge,       // Platform takes this %, business gets the rest
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
      }),
    });

    const data = await res.json();
    if (!data.status) return { statusCode: 400, body: JSON.stringify({ error: data.message }) };

    // ✅ Save data.subaccount_code somewhere — this is what you put in businesses.js
    return {
      statusCode: 200,
      body: JSON.stringify({
        subaccount_code: data.data.subaccount_code,   // e.g. "ACCT_xytowrok4iymzgs"
        business_name: data.data.business_name,
        percentage_charge: data.data.percentage_charge,
        settlement_bank: data.data.settlement_bank,
        account_number: data.data.account_number,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};