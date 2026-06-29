// netlify/functions/paystack-webhook.js
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only accept POST requests from Paystack
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = event.headers['x-paystack-signature'];

  // Validate webhook signature to ensure it's actually from Paystack
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

    // We only care about successful charges right now
    if (eventType === 'charge.success') {
      const data = payload.data;
      const reference = data.reference; // Paystack transaction reference
      const metadata = data.metadata || {};
      const slug = metadata.slug;
      const paymentType = metadata.payment_type;

      // ─── IDEMPOTENCY CHECK ───
      // Attempt to insert the reference. If it already exists, skip processing.
      const { error: insertError } = await supabase
        .from('processed_webhooks')
        .insert({ reference });

      if (insertError) {
        if (insertError.code === '23505') {
          // Duplicate key – webhook already processed
          console.log(`Webhook already processed for reference: ${reference}`);
          return { statusCode: 200, body: JSON.stringify({ received: true, duplicate: true }) };
        }
        // For other errors, log but still attempt to process to avoid missing events
        console.error('Error inserting processed_webhooks record:', insertError.message);
        // We'll continue processing – but note that if this fails repeatedly,
        // we might process the same event more than once. However, with
        // the unique constraint, this is unlikely to happen for duplicate events.
      }

      // ─── PROCESS THE EVENT ───
      // 1. Handle Monthly Subscription Success
      if (paymentType === 'monthly_subscription' && slug) {
        console.log(`Subscription success for slug: ${slug}`);
        
        const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { error: updateErr } = await supabase
          .from('businesses')
          .update({ 
            subscription_ends_at: newEndDate, 
            active: true 
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

    // Always return 200 OK to Paystack so they don't retry
    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook processing error:', err.message);
    // Still return 200 to prevent Paystack retries on our internal errors
    return { statusCode: 200, body: JSON.stringify({ received: true, internal_error: true }) };
  }
};