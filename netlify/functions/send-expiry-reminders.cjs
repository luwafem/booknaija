// netlify/functions/send-expiry-reminders.cjs
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only allow scheduled invocations
  if (event.headers['x-netlify-schedule'] !== 'true') {
    return { statusCode: 403, body: 'Forbidden' };
  }

  // Lazy-init Resend so a missing key doesn't crash the function at require time.
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is not set — cannot send expiry reminders.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Email not configured' }) };
  }
  const resend = new Resend(resendApiKey);

  const siteUrl = (process.env.SITE_URL || 'https://five9.com.ng').replace(/\/$/, '');

  try {
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

    // Find active businesses whose subscription ends within the next 5 days.
    // We select subscription_ends_at explicitly so the email body can render
    // the actual expiry date. Previously this field was missing from the
    // .select() clause, which caused every reminder email to say
    // "expires on Invalid Date".
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, name, email, subscription_ends_at')
      .eq('active', true)
      .gte('subscription_ends_at', now.toISOString()) // not expired yet
      .lt('subscription_ends_at', fiveDaysFromNow)
      .order('subscription_ends_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch expiring businesses:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Fetch failed' }) };
    }

    let sent = 0;
    let skipped = 0;
    for (const biz of businesses || []) {
      if (!biz.email) {
        skipped++;
        continue;
      }

      const expiryDate = new Date(biz.subscription_ends_at);
      const expiryText = isNaN(expiryDate.getTime())
        ? 'soon'
        : expiryDate.toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

      const subject = `Your Five9 subscription expires soon`;
      const html = `
        <h2>Renew your subscription</h2>
        <p>Hi ${biz.name},</p>
        <p>Your Five9 page (<strong>${biz.slug}</strong>) will expire on <strong>${expiryText}</strong>.</p>
        <p>To keep your page live and continue receiving bookings, please renew now:</p>
        <a href="${siteUrl}/dashboard/${biz.slug}" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Renew for ₦2,500</a>
        <p>If you've already renewed, please ignore this message.</p>
        <p>– The Five9 Team</p>
      `;

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Five9 <noreply@five9.com.ng>',
          to: biz.email,
          subject,
          html,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder to ${biz.email}:`, err.message);
      }
    }

    console.log(`📧 Expiry reminders: sent=${sent}, skipped(no email)=${skipped}, total candidates=${(businesses || []).length}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent, skipped }),
    };
  } catch (err) {
    console.error('Scheduled function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};