// netlify/functions/paystack-webhook.cjs
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION ───
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return xss(str, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
}

// ─── PAYSTACK TRANSFER HELPER ───
async function sendTransfer(recipientCode, amountKobo, reason) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY not set');

  const res = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: amountKobo,
      recipient: recipientCode,
      reason,
      currency: 'NGN',
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || 'Transfer failed');
  }
  return data.data;
}

// ─── LOG FAILED PAYOUT ───
async function logFailedPayout(affiliateId, slug, amount, reason, details = {}) {
  const { error } = await supabase
    .from('failed_payouts')
    .insert({
      affiliate_id: affiliateId,
      business_slug: slug,
      amount,
      reason,
      details,
      created_at: new Date().toISOString(),
      status: 'pending',
    });
  if (error) {
    console.error('❌ Failed to log failed payout:', error.message);
  } else {
    console.log(`📝 Logged failed payout for affiliate ${affiliateId} on ${slug}`);
  }
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
      const paystackData = payload.data;
      const reference = sanitizeString(paystackData.reference);
      const amountInKobo = paystackData.amount || 0; // Paystack amount is in kobo
      const metadata = paystackData.metadata || {};
      const slug = sanitizeString(metadata.slug);
      const paymentType = sanitizeString(metadata.payment_type);

      // ─── IDEMPOTENCY CHECK ───
      const { error: insertError } = await supabase
        .from('processed_webhooks')
        .insert({
          reference,
          processed_at: new Date().toISOString(),
          amount: amountInKobo,
          source: 'webhook',
          note: `Payment for ${slug || 'unknown'} - ${paymentType || 'subscription'}`,
          currency: 'NGN',
        });

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
        console.log(`📦 Subscription success for slug: ${slug}`);

        // ─── 1. Fetch current business to get existing subscription end date ───
        const { data: existingBiz, error: fetchBizErr } = await supabase
          .from('businesses')
          .select('subscription_ends_at, referred_by_affiliate, affiliate_commission_month')
          .eq('slug', slug)
          .single();

        if (fetchBizErr) {
          console.error('❌ Failed to fetch business:', fetchBizErr);
          // If we can't fetch the business, we still want to mark the webhook as processed
          return { statusCode: 200, body: JSON.stringify({ received: true, error: 'Business fetch failed' }) };
        }

        // ─── 2. Compute new end date ───
        let newEndDate;
        const currentEnd = existingBiz.subscription_ends_at ? new Date(existingBiz.subscription_ends_at) : null;
        const now = new Date();

        if (currentEnd && currentEnd > now) {
          // Active subscription – add 30 days to existing end date
          newEndDate = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else {
          // Expired or no subscription – start from now
          newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        const newEndDateISO = newEndDate.toISOString();

        // ─── 3. Update subscription expiry and ensure business is active ───
        const { error: updateErr } = await supabase
          .from('businesses')
          .update({
            subscription_ends_at: newEndDateISO,
            active: true,
          })
          .eq('slug', slug);

        if (updateErr) {
          console.error('❌ Subscription update error:', updateErr);
          // Continue to process commission anyway – the payment is confirmed
        }

        // ─── 4. AFFILIATE COMMISSION (60% + 40% MODEL) ───
        // Use existingBiz data we already fetched
        if (existingBiz.referred_by_affiliate) {
          const currentMonth = existingBiz.affiliate_commission_month || 0;

          if (currentMonth < 2) {
            let payoutAmount = 0;
            let newMonth = currentMonth + 1;

            if (currentMonth === 0) payoutAmount = 1500;
            else if (currentMonth === 1) payoutAmount = 1000;

            if (payoutAmount > 0) {
              // ─── 1. Attempt to increment the month atomically ───
              const { data: updatedBusiness, error: updateCommErr } = await supabase
                .from('businesses')
                .update({ affiliate_commission_month: newMonth })
                .eq('slug', slug)
                .eq('affiliate_commission_month', currentMonth)
                .select('referred_by_affiliate');

              if (updateCommErr) {
                console.error('❌ Failed to update commission month:', updateCommErr);
                return;
              }

              if (!updatedBusiness || updatedBusiness.length === 0) {
                console.log(`ℹ️ Commission month for ${slug} already advanced by another process. Skipping.`);
                return;
              }

              const affiliateId = updatedBusiness[0].referred_by_affiliate;
              const { data: affiliateData, error: affErr } = await supabase
                .from('affiliates')
                .select('transfer_recipient_code')
                .eq('id', affiliateId)
                .single();

              if (affErr || !affiliateData || !affiliateData.transfer_recipient_code) {
                console.error(`❌ Affiliate ${affiliateId} has no transfer recipient code. Logging failed payout.`);
                await logFailedPayout(
                  affiliateId,
                  slug,
                  payoutAmount,
                  'Missing transfer_recipient_code after month update',
                  { currentMonth, newMonth }
                );
              } else {
                try {
                  await sendTransfer(
                    affiliateData.transfer_recipient_code,
                    payoutAmount * 100,
                    `${currentMonth === 0 ? '1st' : '2nd'} month commission for ${slug}`
                  );
                  console.log(`✅ Paid affiliate ${affiliateId} ₦${payoutAmount} for ${slug} (Month ${newMonth})`);
                } catch (transferErr) {
                  console.error(`❌ Transfer failed for affiliate ${affiliateId}:`, transferErr.message);
                  await logFailedPayout(
                    affiliateId,
                    slug,
                    payoutAmount,
                    `Transfer API error: ${transferErr.message}`,
                    { currentMonth, newMonth }
                  );
                }
              }
            } else {
              console.log(`ℹ️ No payout due for ${slug} (commission month already ${currentMonth})`);
            }
          } else {
            console.log(`ℹ️ Affiliate commission already fully paid for ${slug}`);
          }
        } else {
          console.log(`ℹ️ No affiliate referral for ${slug}, skipping commission.`);
        }
      }
    }

    // Always return 200 OK to prevent Paystack retries
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('🔥 Webhook processing error:', err.message);
    return { statusCode: 200, body: JSON.stringify({ received: true, internal_error: true }) };
  }
};