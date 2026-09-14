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
    if (eventType !== 'charge.success') {
      return { statusCode: 200, body: JSON.stringify({ received: true, ignored: true }) };
    }

    const paystackData = payload.data;
    const reference = sanitizeString(paystackData.reference);
    const amountInKobo = paystackData.amount || 0;
    const metadata = paystackData.metadata || {};
    const slug = sanitizeString(metadata.slug);
    const paymentType = sanitizeString(metadata.payment_type);

    console.log(`📩 Webhook received: ref=${reference} type=${paymentType || 'unknown'} slug=${slug || 'none'}`);

    // ─── IDEMPOTENCY CLAIM ───
    // Claim the reference up-front so concurrent deliveries can't double-process.
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
        console.log(`ℹ️ Reference ${reference} already processed (duplicate webhook).`);
        return { statusCode: 200, body: JSON.stringify({ received: true, duplicate: true }) };
      }
      console.error('⚠️ Could not claim reference in processed_webhooks:', insertError.message);
      // Continue processing — losing a payment is worse than a possible double
    }

    // ─── HANDLE SIGNUP (first payment) ──────────────────────
    // With the current architecture, the business row is created by
    // save-business.cjs AFTER the user finishes the onboarding form.
    // The affiliate split was already paid by Paystack at payment time.
    // This handler is a safety net for edge cases only.
    if (paymentType === 'signup' && slug) {
      console.log(`📦 Signup payment confirmed for slug: ${slug}`);

      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .select('referred_by_affiliate, affiliate_commission_month')
        .eq('slug', slug)
        .maybeSingle();

      // Real DB error (not "no rows")
      if (bizErr && bizErr.code !== 'PGRST116') {
        console.error('❌ Failed to fetch business for signup:', bizErr.message);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // Normal case: user is mid-onboarding; save-business will create the row
      // with the correct subscription window and month=1 for affiliate signups.
      if (!biz) {
        console.log(`ℹ️ Business ${slug} not yet in DB — save-business will handle the rest.`);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // Safety net: business exists with a referrer but month is still 0.
      // The affiliate was already paid ₦1,500 via the split, so mark month 1 done.
      if (biz.referred_by_affiliate && biz.affiliate_commission_month === 0) {
        const { error: updateErr } = await supabase
          .from('businesses')
          .update({ affiliate_commission_month: 1 })
          .eq('slug', slug)
          .eq('affiliate_commission_month', 0);

        if (updateErr) {
          console.error('❌ Failed to set commission month for signup:', updateErr.message);
        } else {
          console.log(`✅ Safety net: set affiliate_commission_month to 1 for ${slug} (signup)`);
        }
      } else {
        console.log(`ℹ️ No month update needed for ${slug} (month=${biz.affiliate_commission_month})`);
      }

      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    // ─── HANDLE MONTHLY SUBSCRIPTION (renewals) ────────────
    if (paymentType === 'monthly_subscription' && slug) {
      console.log(`📦 Subscription renewal confirmed for slug: ${slug}`);

      // ─── 1. Fetch current business ───
      const { data: existingBiz, error: fetchBizErr } = await supabase
        .from('businesses')
        .select('subscription_ends_at, referred_by_affiliate, affiliate_commission_month')
        .eq('slug', slug)
        .maybeSingle();

      // Real DB error (not "no rows")
      if (fetchBizErr && fetchBizErr.code !== 'PGRST116') {
        console.error('❌ Failed to fetch business for renewal:', fetchBizErr.message);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // Unexpected: user paid a renewal but the business doesn't exist.
      // Log prominently so this shows up in Netlify function logs.
      if (!existingBiz) {
        console.error(
          `🚨 RENEWAL for unknown business "${slug}" — ref ${reference}. MANUAL INTERVENTION REQUIRED.`
        );
        return { statusCode: 200, body: JSON.stringify({ received: true, business_missing: true }) };
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

      // ─── 3. Update subscription expiry ───
      const { error: updateErr } = await supabase
        .from('businesses')
        .update({
          subscription_ends_at: newEndDateISO,
          active: true,
        })
        .eq('slug', slug);

      if (updateErr) {
        console.error('❌ Subscription update error:', updateErr.message);
        // Continue to commission logic — the payment is confirmed
      } else {
        console.log(`✅ Extended subscription for ${slug} to ${newEndDateISO}`);
      }

      // ─── 4. Affiliate commission ───
      if (!existingBiz.referred_by_affiliate) {
        console.log(`ℹ️ No affiliate referral for ${slug}, skipping commission.`);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      const currentMonth = existingBiz.affiliate_commission_month || 0;

      if (currentMonth >= 2) {
        console.log(`ℹ️ Affiliate commission already fully paid for ${slug}`);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // Month 0 → 1 pays ₦1,500 (handled by save-business for new signups now)
      // Month 1 → 2 pays ₦1,000
      let payoutAmount = 0;
      let newMonth = currentMonth + 1;

      if (currentMonth === 0) payoutAmount = 1500;
      else if (currentMonth === 1) payoutAmount = 1000;

      if (payoutAmount === 0) {
        console.log(`ℹ️ No payout due for ${slug} (month=${currentMonth})`);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // ─── 4a. Atomic month increment (compare-and-swap) ───
      const { data: updatedBusiness, error: updateCommErr } = await supabase
        .from('businesses')
        .update({ affiliate_commission_month: newMonth })
        .eq('slug', slug)
        .eq('affiliate_commission_month', currentMonth)
        .select('referred_by_affiliate');

      if (updateCommErr) {
        console.error('❌ Failed to update commission month:', updateCommErr.message);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      if (!updatedBusiness || updatedBusiness.length === 0) {
        // Another process won the race — no payout from this delivery
        console.log(`ℹ️ Commission month for ${slug} already advanced by another process. Skipping.`);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      const affiliateId = updatedBusiness[0].referred_by_affiliate;
      const { data: affiliateData, error: affErr } = await supabase
        .from('affiliates')
        .select('transfer_recipient_code')
        .eq('id', affiliateId)
        .maybeSingle();

      if (affErr || !affiliateData || !affiliateData.transfer_recipient_code) {
        console.error(`❌ Affiliate ${affiliateId} has no transfer recipient code. Logging failed payout.`);
        await logFailedPayout(
          affiliateId,
          slug,
          payoutAmount,
          'Missing transfer_recipient_code after month update',
          { currentMonth, newMonth }
        );
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // ─── 4b. Send the transfer ───
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

      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    // ─── OTHER PAYMENT TYPES (bookings, products, food, cars) ───
    // No subscription action required. The reference is still claimed in
    // processed_webhooks so revenue reporting sees it, but we do nothing else.
    console.log(`ℹ️ Payment type "${paymentType || 'unknown'}" — no subscription action needed.`);
    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('🔥 Webhook processing error:', err.message);
    // Always return 200 so Paystack doesn't retry indefinitely.
    // The reference (if claimed) prevents re-processing on retries.
    return { statusCode: 200, body: JSON.stringify({ received: true, internal_error: true }) };
  }
};