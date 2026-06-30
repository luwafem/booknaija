const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION HELPER ───
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return xss(str, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
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
    let email;
    try {
      const parsed = JSON.parse(event.body);
      email = parsed.email;
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    // Sanitise email
    if (typeof email === 'string') {
      email = sanitizeString(email);
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find business by email
    const { data: biz, error: findError } = await supabase
      .from('businesses')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (findError || !biz) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No business found with that email' }),
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store OTP
    const { error: insertError } = await supabase
      .from('security_resets')
      .insert({
        business_id: biz.id,
        token: otp,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to generate reset code' }),
      };
    }

    // Log OTP (for development)
    console.log(`🔑 OTP for ${normalizedEmail}: ${otp}`);

    // TODO: Send email with OTP

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