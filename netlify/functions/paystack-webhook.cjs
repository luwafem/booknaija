// netlify/functions/paystack-webhook.js
const crypto = require('crypto');
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
  // Only accept POST requests from Paystack
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('❌ PAYSTACK_SECRET_KEY is missing');
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook secret not configured' }) };
  }

  const signature = event.headers['x-paystack-signature'];

  // Validate webhook signature
  if (!signature) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing signature' }) };
  }

  const hash = crypto.createHmac('sha512', secret).update(event.body).digest('hex');
  if (hash !== signature) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  try {
    const payload = JSON.parse(event.body);
    const eventType = payload.event;

    // We only care about successful charges
    if (eventType === 'charge.success') {
      const data = payload.data;
      const reference = sanitizeString(data.reference);
      const metadata = data.metadata || {};
      const slug = sanitizeString(metadata.slug);
      const paymentType = sanitizeString(metadata.payment_type);

      // ─── IDEMPOTENCY CHECK ───
      const { error: insertError } = await supabase
        .from('processed_webhooks')
        .insert({ reference });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`Webhook already processed for reference: ${reference}`);
          return { statusCode: 200, body: JSON.stringify({ received: true, duplicate: true }) };
        }
        console.error('Error inserting processed_webhooks record:', insertError.message);
        // Continue processing – idempotency is best-effort
      }

      // ─── PROCESS THE EVENT ───
      if (paymentType === 'monthly_subscription' && slug) {
        console.log(`Subscription success for slug: ${slug}`);

        const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: updateErr } = await supabase
          .from('businesses')
          .update({
            subscription_ends_at: newEndDate,
            active: true,
          })
          .eq('slug', slug);

        if (updateErr) console.error('Webhook DB update error:', updateErr);

        // Mark affiliate bounty as paid if applicable
        const { error: bountyErr } = await supabase
          .from('businesses')
          .update({ affiliate_bounty_paid: true })
          .eq('slug', slug)
          .eq('affiliate_bounty_paid', false);

        if (bountyErr) console.error('Error marking affiliate bounty paid:', bountyErr);
      }
    }

    // Always return 200 OK to prevent Paystack retries
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    // Still return 200 to avoid Paystack retries on our internal errors
    return { statusCode: 200, body: JSON.stringify({ received: true, internal_error: true }) };
  }
};