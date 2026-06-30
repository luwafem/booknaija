// netlify/functions/create-subaccount.js
const xss = require('xss');

// ─── SANITISATION HELPER ───
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: [],
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeDeep);
  }
  if (input && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }
  return input;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Parse and sanitise input
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseErr) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }

    payload = sanitizeDeep(payload);

    const {
      business_name,
      settlement_bank,    // Paystack bank code e.g. "058" for GTBank
      account_number,     // 10-digit NUBAN account number
      percentage_charge,  // Platform commission e.g. 5 for 5%
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
    } = payload;

    // Validate required fields
    if (!business_name || !settlement_bank || !account_number || percentage_charge === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: business_name, settlement_bank, account_number, percentage_charge',
        }),
      };
    }

    // Validate percentage_charge is a number between 0 and 100
    const charge = Number(percentage_charge);
    if (isNaN(charge) || charge < 0 || charge > 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'percentage_charge must be a number between 0 and 100' }),
      };
    }

    // Validate account_number is exactly 10 digits (NUBAN)
    if (!/^\d{10}$/.test(account_number)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'account_number must be exactly 10 digits' }),
      };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured' }) };
    }

    const res = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name,
        settlement_bank,
        account_number,
        percentage_charge: charge,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
      }),
    });

    const data = await res.json();

    if (!data.status) {
      console.error('Paystack subaccount creation error:', data.message);
      return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Failed to create subaccount' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        subaccount_code: data.data.subaccount_code,
        business_name: data.data.business_name,
        percentage_charge: data.data.percentage_charge,
        settlement_bank: data.data.settlement_bank,
        account_number: data.data.account_number,
      }),
    };
  } catch (err) {
    console.error('create-subaccount error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};