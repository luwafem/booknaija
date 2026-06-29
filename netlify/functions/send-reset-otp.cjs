// netlify/functions/send-reset-otp.cjs
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    let email;
    try {
      const parsed = JSON.parse(event.body);
      email = parsed.email;
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Normalize email
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
        body: JSON.stringify({ error: 'No business found with that email' })
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in security_resets table
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
        body: JSON.stringify({ error: 'Failed to generate reset code' })
      };
    }

    // Log OTP (for development)
    console.log(`🔑 OTP for ${normalizedEmail}: ${otp}`);

    // TODO: In production, send email with OTP.
    // For now, we rely on the console log for testing.

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