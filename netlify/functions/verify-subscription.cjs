// netlify/functions/verify-subscription.cjs
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
const { validateCsrf } = require('./_utils/csrf');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION ───
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: [],
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeDeep);
  }
  if (input && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }
  return input;
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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Parse and sanitise input
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseErr) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }
    payload = sanitizeDeep(payload);

    const { reference, slug } = payload;

    if (!reference || !slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing reference or slug' }) };
    }

    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured' }) };
    }

    // ─── 1. Verify payment with Paystack ───
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const paystackData = await verifyRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      console.error('Paystack verification failed:', paystackData.message || paystackData.data?.gateway_response);
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment not verified' }) };
    }

    // ─── 2. IDEMPOTENCY CHECK ───
    const { data: existingRecord, error: checkError } = await supabase
      .from('processed_webhooks')
      .select('reference')
      .eq('reference', reference)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking processed_webhooks:', checkError.message);
    }

    if (existingRecord) {
      console.log(`ℹ️ Reference ${reference} already processed. Skipping duplicate.`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          new_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          duplicate: true,
          message: 'This payment was already processed.',
        }),
      };
    }

    // ─── 3. Fetch current business to get existing subscription end date ───
    const { data: existingBiz, error: fetchBizErr } = await supabase
      .from('businesses')
      .select('subscription_ends_at, referred_by_affiliate, affiliate_commission_month')
      .eq('slug', slug)
      .single();

    if (fetchBizErr) {
      console.error('Failed to fetch business:', fetchBizErr);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch business' }) };
    }

    // ─── 4. Compute new end date ───
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

    // ─── 5. Update subscription expiry and ensure business is active ───
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({
        subscription_ends_at: newEndDateISO,
        active: true,
      })
      .eq('slug', slug);

    if (updateErr) {
      console.error('Supabase update error:', updateErr);
      throw new Error('Failed to update subscription');
    }

    // ─── 6. Affiliate Commission (60% + 40% model) ───
    let commissionProcessed = false;

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
            return {
              statusCode: 200,
              body: JSON.stringify({
                success: true,
                new_end_date: newEndDateISO,
                commission_processed: false,
                warning: 'Commission month update failed; manual intervention may be needed.',
              }),
            };
          }

          if (!updatedBusiness || updatedBusiness.length === 0) {
            console.log(`ℹ️ Commission month for ${slug} already advanced by another process. Skipping.`);
            commissionProcessed = false;
          } else {
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
                { currentMonth, newMonth, source: 'verify-subscription' }
              );
              commissionProcessed = false;
            } else {
              try {
                await sendTransfer(
                  affiliateData.transfer_recipient_code,
                  payoutAmount * 100,
                  `${currentMonth === 0 ? '1st' : '2nd'} month commission for ${slug}`
                );
                console.log(`✅ Paid affiliate ${affiliateId} ₦${payoutAmount} for ${slug} (Month ${newMonth})`);
                commissionProcessed = true;
              } catch (transferErr) {
                console.error(`❌ Transfer failed for affiliate ${affiliateId}:`, transferErr.message);
                await logFailedPayout(
                  affiliateId,
                  slug,
                  payoutAmount,
                  `Transfer API error: ${transferErr.message}`,
                  { currentMonth, newMonth, source: 'verify-subscription' }
                );
                commissionProcessed = false;
              }
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

    // ─── 7. Mark as processed (idempotency) ───
    if (!existingRecord) {
      const { error: insertError } = await supabase
        .from('processed_webhooks')
        .insert({
          reference,
          processed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting into processed_webhooks:', insertError.message);
      } else {
        console.log(`✅ Marked reference ${reference} as processed.`);
      }
    }

    // ─── 8. Mark legacy Affiliate Bounty (optional) ───
    const { error: bountyErr } = await supabase
      .from('businesses')
      .update({ affiliate_bounty_paid: true })
      .eq('slug', slug)
      .eq('affiliate_bounty_paid', false);

    if (bountyErr) {
      console.error('Error marking affiliate bounty paid:', bountyErr.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        new_end_date: newEndDateISO,
        commission_processed: commissionProcessed,
      }),
    };
  } catch (err) {
    console.error('verify-subscription error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};