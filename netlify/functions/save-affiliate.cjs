// netlify/functions/save-affiliate.cjs
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const xss = require('xss');
const { validateCsrf } = require('./_utils/csrf'); // 👈 NEW

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION ───
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

// ─── CREATE PAYSTACK TRANSFER RECIPIENT ───
async function createTransferRecipient(bankCode, accountNumber, accountName) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not set');
  }

  const res = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    }),
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || 'Paystack failed to create transfer recipient');
  }

  return data.data.recipient_code;
}

// ─── HANDLER ───
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // 1. Parse & sanitise
    let payload = JSON.parse(event.body);
    payload = sanitizeDeep(payload);

    const {
      affiliate_id,
      name,
      email,
      phone,
      subaccount_code,
      security_code,
      security_question_1,
      security_answer_1,
      security_question_2,
      security_answer_2,
      // ─── NEW FIELDS FOR TRANSFER RECIPIENT ───
      settlement_bank,   // Paystack bank code (e.g. '058')
      account_number,    // 10-digit NUBAN
      account_name,      // Account holder name
    } = payload;

    if (!affiliate_id || !subaccount_code || !security_code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    // ─── DUPLICATE CHECK ───
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAffiliate) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: 'An affiliate account with this email already exists. Please sign in instead.',
        }),
      };
    }

    // ─── CREATE TRANSFER RECIPIENT (if bank details provided) ───
    let transferRecipientCode = null;
    if (settlement_bank && account_number && account_name) {
      try {
        transferRecipientCode = await createTransferRecipient(
          settlement_bank,
          account_number,
          account_name
        );
        console.log(`✅ Transfer recipient created for ${email}: ${transferRecipientCode}`);
      } catch (err) {
        console.error('❌ Failed to create transfer recipient:', err.message);
        // We continue without it – affiliate can still be saved, but manual fix needed later.
      }
    } else {
      console.warn(`⚠️ No bank details provided for ${email}, skipping transfer recipient creation.`);
    }

    // ─── HASH SECURITY FIELDS ───
    const hashedCode = bcrypt.hashSync(security_code, 10);
    const hashedAnswer1 = security_answer_1
      ? bcrypt.hashSync(security_answer_1.toLowerCase().trim(), 10)
      : null;
    const hashedAnswer2 = security_answer_2
      ? bcrypt.hashSync(security_answer_2.toLowerCase().trim(), 10)
      : null;

    // ─── INSERT INTO SUPABASE ───
    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        id: affiliate_id,
        name,
        email,
        phone,
        subaccount_code,
        transfer_recipient_code: transferRecipientCode, // 👈 NEW
        security_code: hashedCode,
        security_question_1,
        security_answer_1: hashedAnswer1,
        security_question_2,
        security_answer_2: hashedAnswer2,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      if (error.code === '23505') {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: 'An account with this email or ID already exists.' }),
        };
      }
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, id: data.id }),
    };
  } catch (err) {
    console.error('Unhandled error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};