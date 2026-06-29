// netlify/functions/verify-reset-otp.cjs
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    const { email, otp, newCode, newQ1, newA1, newQ2, newA2 } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'OTP is required' })
      };
    }

    // Normalize email
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
        body: JSON.stringify({ error: 'Business not found' })
      };
    }

    // 2. Find valid OTP for this business
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
        body: JSON.stringify({ error: 'Invalid or expired OTP' })
      };
    }

    // Check expiration
    if (new Date(reset.expires_at) < new Date()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'OTP has expired' })
      };
    }

    // 3. If new details are provided, update them
    if (newCode) {
      // Validate newCode is 4 digits
      if (!/^\d{4}$/.test(newCode)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'New security code must be exactly 4 digits' })
        };
      }

      // Validate that both questions and answers are provided
      if (!newQ1 || !newA1 || !newQ2 || !newA2) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Both security questions and answers are required' })
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
          body: JSON.stringify({ error: 'Failed to update security details' })
        };
      }
    }

    // 4. Mark OTP as used
    const { error: markError } = await supabase
      .from('security_resets')
      .update({ used_at: new Date() })
      .eq('id', reset.id);

    if (markError) {
      console.error('Mark used error:', markError);
      // Non‑critical, but we log it.
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Unhandled error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};