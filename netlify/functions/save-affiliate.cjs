const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const xss = require('xss'); // 👈 NEW

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION HELPER (inline) ───
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    // Remove all HTML tags and attributes – keep only plain text
    return xss(input, {
      whiteList: [],             // no tags allowed
      stripIgnoreTag: true,      // strip all tags
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

  // numbers, booleans, null, undefined – return as‑is
  return input;
}
// ─── END SANITISATION ───

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // 1. Parse and sanitise all input
    let payload = JSON.parse(event.body);
    payload = sanitizeDeep(payload);

    const { 
      affiliate_id, name, email, phone, subaccount_code,
      security_code, security_question_1, security_answer_1, 
      security_question_2, security_answer_2 
    } = payload;

    if (!affiliate_id || !subaccount_code || !security_code) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // ─── SPAM / DUPLICATE PROTECTION ───
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAffiliate) {
      return { 
        statusCode: 409,
        body: JSON.stringify({ error: 'An affiliate account with this email already exists. Please sign in instead.' }) 
      };
    }
    // ─── END SPAM PROTECTION ───

    // ─── HASH SECURITY FIELDS ───
    const hashedCode = bcrypt.hashSync(security_code, 10);
    const hashedAnswer1 = security_answer_1 ? bcrypt.hashSync(security_answer_1.toLowerCase().trim(), 10) : null;
    const hashedAnswer2 = security_answer_2 ? bcrypt.hashSync(security_answer_2.toLowerCase().trim(), 10) : null;

    // ─── INSERT ───
    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        id: affiliate_id,
        name: name,
        email: email,
        phone: phone,
        subaccount_code: subaccount_code,
        // Store hashed values in the same columns (overwrites plaintext)
        security_code: hashedCode,
        security_question_1: security_question_1,
        security_answer_1: hashedAnswer1,
        security_question_2: security_question_2,
        security_answer_2: hashedAnswer2,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      if (error.code === '23505') {
         return { statusCode: 409, body: JSON.stringify({ error: 'An account with this email or ID already exists.' }) };
      }
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, id: data.id })
    };

  } catch (err) {
    console.error('Unhandled error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};