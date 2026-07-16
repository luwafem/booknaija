// netlify/functions/send-expiry-reminders.cjs
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // Only allow scheduled invocations
  if (event.headers['x-netlify-schedule'] !== 'true') {
    return { statusCode: 403, body: 'Forbidden' };
  }

  try {
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

    // Find active businesses that expire in exactly 5 days
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, name, email')
      .eq('active', true)
      .gte('subscription_ends_at', now.toISOString()) // not expired yet
      .lt('subscription_ends_at', fiveDaysFromNow)
      .order('subscription_ends_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch expiring businesses:', error);
      return { statusCode: 500, body: 'Fetch failed' };
    }

    let sent = 0;
    for (const biz of businesses) {
      if (!biz.email) continue;

      const subject = `Your BookNaija subscription expires in 5 days`;
      const html = `
        <h2>Renew your subscription</h2>
        <p>Hi ${biz.name},</p>
        <p>Your BookNaija page (<strong>${biz.slug}</strong>) will expire on <strong>${new Date(biz.subscription_ends_at).toLocaleDateString()}</strong>.</p>
        <p>To keep your page live and continue receiving bookings, please renew now:</p>
        <a href="${process.env.SITE_URL}/dashboard/${biz.slug}" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Renew for ₦2,500</a>
        <p>If you've already renewed, please ignore this message.</p>
        <p>– The BookNaija Team</p>
      `;

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'BookNaija <noreply@booknaija.com>',
          to: biz.email,
          subject,
          html,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder to ${biz.email}:`, err.message);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent }),
    };
  } catch (err) {
    console.error('Scheduled function error:', err);
    return { statusCode: 500, body: err.message };
  }
};