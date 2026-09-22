// netlify/functions/send-reset-otp.cjs
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
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

    // ─── Find business by email ───
    const { data: biz, error: findError } = await supabase
      .from('businesses')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (findError || !biz) {
      // NOTE: Returning 404 here technically leaks whether an email is
      // registered. That's acceptable for this app since the signup flow
      // already reveals this via a duplicate-email error, and the admin
      // dashboard needs the clear error message. If you ever want to hide
      // it, return 200 with { success: true } regardless — but then the
      // user has no idea when they typo their email.
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No business found with that email' }),
      };
    }

    // ─── Generate OTP ───
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // ─── Store OTP ───
    const { error: insertError } = await supabase
      .from('security_resets')
      .insert({
        business_id: biz.id,
        token: otp,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Failed to store reset OTP:', insertError.message);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to generate reset code' }),
      };
    }

    // ─── Send email with Resend ───
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'Five9 <onboarding@resend.dev>';
    let emailSent = false;
    let emailError = null;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { error: sendError } = await resend.emails.send({
          from: emailFrom,
          to: normalizedEmail,
          subject: 'Your Five9 Password Reset OTP',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Reset your Five9 security details</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f6f6f6; margin: 0; padding: 0; }
                  .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 32px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                  .logo { text-align: center; margin-bottom: 24px; }
                  .logo img { max-height: 48px; width: auto; }
                  h2 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #111827; }
                  p { font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                  .code { background: #f3f4f6; border-radius: 12px; padding: 16px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; margin: 20px 0; font-family: 'Courier New', monospace; }
                  .footer { margin-top: 32px; font-size: 14px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px; }
                  .footer a { color: #6366f1; text-decoration: none; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">
                    <img src="https://five9.com.ng/fav-removebg.png" alt="Five9" />
                  </div>
                  <h2>Reset your security details</h2>
                  <p>We received a request to reset your security code and questions for your Five9 business account.</p>
                  <p>Use the OTP below to complete the reset. This code is valid for <strong>15 minutes</strong>.</p>
                  <div class="code">${otp}</div>
                  <p>If you did not request this, please ignore this email.</p>
                  <div class="footer">
                    &copy; ${new Date().getFullYear()} Five9 Technologies &bull; <a href="https://five9.com.ng">five9.com.ng</a>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (sendError) {
          emailError = sendError;
          console.error('Resend send error:', sendError.message || sendError);
        } else {
          emailSent = true;
        }
      } catch (err) {
        emailError = err;
        console.error('Resend exception:', err.message);
      }
    } else {
      console.warn('RESEND_API_KEY not set — OTP email not sent.');
    }

    // ─── Return response ───
    // 👈 FIXED: The `otp` field has been REMOVED. Previously this function
    // returned the OTP in the HTTP response body, which meant anyone who
    // knew a business's email could bypass the email entirely and reset
    // that business's security details directly. The OTP now only travels
    // via the Resend email — never over the wire to the caller.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        emailSent,
        emailError: emailError ? (emailError.message || String(emailError)) : null,
      }),
    };
  } catch (err) {
    console.error('Unhandled error in send-reset-otp:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};