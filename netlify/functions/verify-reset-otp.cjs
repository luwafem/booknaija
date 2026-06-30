const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    // Sanitise all input
    const sanitized = sanitizeDeep(body);
    const { email, otp, newCode, newQ1, newA1, newQ2, newA2 } = sanitized;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'OTP is required' }),
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Get business by email
    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (bizError || !biz) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Business not found' }),
      };
    }

    // 2. Find valid OTP
    const { data: reset, error: resetError } = await supabase
      .from('security_resets')
      .select('id, expires_at')
      .eq('business_id', biz.id)
      .eq('token', otp.trim())
      .is('used_at', null)
      .single();

    if (resetError || !reset) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or expired OTP' }),
      };
    }

    if (new Date(reset.expires_at) < new Date()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'OTP has expired' }),
      };
    }

    // 3. If new details provided, update them
    if (newCode) {
      if (!/^\d{4}$/.test(newCode)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'New security code must be exactly 4 digits' }),
        };
      }

      if (!newQ1 || !newA1 || !newQ2 || !newA2) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Both security questions and answers are required' }),
        };
      }

      const updates = {};
      updates.security_code_hash = bcrypt.hashSync(newCode, 10);
      updates.security_question_1 = newQ1;
      updates.security_answer_1_hash = bcrypt.hashSync(newA1.trim().toLowerCase(), 10);
      updates.security_question_2 = newQ2;
      updates.security_answer_2_hash = bcrypt.hashSync(newA2.trim().toLowerCase(), 10);

      const { error: updateError } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', biz.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to update security details' }),
        };
      }
    }

    // 4. Mark OTP as used
    await supabase
      .from('security_resets')
      .update({ used_at: new Date() })
      .eq('id', reset.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Unhandled error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};