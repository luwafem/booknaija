// netlify/functions/verify-subscription.cjs
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
// NOTE: validateCsrf import removed — this endpoint is called from the public
// /onboarding page during signup, before any CSRF cookie exists. See below.

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

    // ─── CSRF PROTECTION — INTENTIONALLY OMITTED ───
    // This endpoint is called from two places:
    //
    //   1. src/pages/Onboarding.jsx — the public signup confirmation page.
    //      At this point NO authenticated session and NO CSRF cookie exist
    //      yet (getCsrfToken() is only called later, during handleSubmit).
    //      Requiring CSRF here would permanently block every signup.
    //
    //   2. src/hooks/useDashboard.js — the subscription renewal callback.
    //      Here the user IS authenticated, but the call is harmless: the only
    //      way to reach this code path is with a valid Paystack reference.
    //
    // Security model: the Paystack reference itself is the bearer token.
    // It is 16+ characters, unguessable, single-use, and verified directly
    // against the Paystack API below. A CSRF attacker without the reference
    // cannot make this endpoint do anything. Rate limiting in netlify.toml
    // provides DoS protection.

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

    const amountKobo = paystackData.data.amount || 0;

    // ─── 2. Fetch current business (may not exist yet for a brand‑new signup) ───
    // NOTE: We use .maybeSingle() instead of .single() so that PGRST116
    // ("no rows") is NOT treated as an error. During signup, the business row
    // is only created by save-business.cjs AFTER this function returns, so
    // hitting this branch with an empty result is the normal happy path.
    const { data: existingBiz, error: fetchBizErr } = await supabase
      .from('businesses')
      .select('subscription_ends_at, referred_by_affiliate, affiliate_commission_month')
      .eq('slug', slug)
      .maybeSingle();

    // A real DB error (connection, permission, etc.) – bail out
    if (fetchBizErr && fetchBizErr.code !== 'PGRST116') {
      console.error('Failed to fetch business:', fetchBizErr);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch business' }) };
    }

    // ─── 3. Brand‑new signup: business row not created yet ───
    // The user is mid‑onboarding; save-business.cjs will create the row and
    // anchor subscription_ends_at to paid_at. We just confirm the payment is
    // legit so the onboarding form is not blocked.
    if (!existingBiz) {
      console.log(
        `ℹ️ Signup flow: business "${slug}" not yet in DB. Payment verified — returning success so onboarding can proceed.`
      );
      // DO NOT claim the reference here. The webhook (or the subsequent
      // save-business call) will own that row. If we claimed now, the webhook
      // would skip its own handling for this reference.
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          signup_pending: true,
          new_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      };
    }

    // ─── 4. ATOMICALLY CLAIM the reference ───
    // This replaces the previous "check then insert" pattern, which had a
    // TOCTOU race with paystack-webhook.cjs: both functions could pass the
    // check, both extend the subscription, both try to insert — one silently
    // loses (23505) but the double extension has already happened.
    //
    // Claiming up‑front via INSERT (with 23505 as "already claimed") closes
    // that window. Only one process can win the claim, so only one process
    // performs the subscription update and affiliate payout.
    const { error: claimErr } = await supabase
      .from('processed_webhooks')
      .insert({
        reference,
        processed_at: new Date().toISOString(),
        amount: amountKobo,
        source: 'verify',
        currency: 'NGN',
        note: `Subscription renewal for ${slug}`,
      });

    if (claimErr) {
      if (claimErr.code === '23505') {
        console.log(`ℹ️ Reference ${reference} already claimed by another process. Skipping.`);
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            duplicate: true,
            new_end_date:
              existingBiz.subscription_ends_at ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            message: 'This payment was already processed.',
          }),
        };
      }
      // A real DB error (connection, permissions, missing table). Do NOT
      // proceed — without a successful claim we have no protection against
      // double‑processing if the client retries.
      console.error('❌ Failed to claim reference:', claimErr.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to claim reference. Please retry.' }),
      };
    }

    // ─── 5. We own the reference now. If work fails irrecoverably, release
    //        the claim so the caller can retry without burning the ref. ───
    let newEndDateISO = null;
    let commissionProcessed = false;

    try {
      // ─── 5a. Compute new end date ───
      let newEndDate;
      const currentEnd = existingBiz.subscription_ends_at
        ? new Date(existingBiz.subscription_ends_at)
        : null;
      const now = new Date();

      if (currentEnd && currentEnd > now) {
        // Active subscription – add 30 days to existing end date
        newEndDate = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        // Expired or no subscription – start from now
        newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      newEndDateISO = newEndDate.toISOString();

      // ─── 5b. Update subscription expiry and ensure business is active ───
      const { error: updateErr } = await supabase
        .from('businesses')
        .update({
          subscription_ends_at: newEndDateISO,
          active: true,
        })
        .eq('slug', slug);

      if (updateErr) {
        throw new Error(`Subscription update failed: ${updateErr.message}`);
      }

      // ─── 5c. Affiliate Commission (60% + 40% model) ───
      if (existingBiz.referred_by_affiliate) {
        const currentMonth = existingBiz.affiliate_commission_month || 0;

        if (currentMonth < 2) {
          let payoutAmount = 0;
          const newMonth = currentMonth + 1;

          if (currentMonth === 0) payoutAmount = 1500;
          else if (currentMonth === 1) payoutAmount = 1000;

          if (payoutAmount > 0) {
            // Atomic compare‑and‑swap on month. Guards against a race where
            // another process (e.g. the webhook) is also mid‑payout for the
            // same business.
            const { data: updatedBusiness, error: updateCommErr } = await supabase
              .from('businesses')
              .update({ affiliate_commission_month: newMonth })
              .eq('slug', slug)
              .eq('affiliate_commission_month', currentMonth)
              .select('referred_by_affiliate');

            if (updateCommErr) {
              console.error('❌ Failed to update commission month:', updateCommErr.message);
              // Non‑fatal: the sub is already extended and the reference is
              // claimed. We just don't pay commission on this run. A future
              // manual retry via admin tooling can recover.
            } else if (!updatedBusiness || updatedBusiness.length === 0) {
              console.log(`ℹ️ Commission month for ${slug} already advanced by another process. Skipping payout.`);
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

      // ─── 5d. Mark legacy Affiliate Bounty (idempotent, non‑fatal) ───
      const { error: bountyErr } = await supabase
        .from('businesses')
        .update({ affiliate_bounty_paid: true })
        .eq('slug', slug)
        .eq('affiliate_bounty_paid', false);

      if (bountyErr) {
        console.error('Error marking affiliate bounty paid:', bountyErr.message);
      }

    } catch (workErr) {
      // Release the claim so the caller can retry without burning the ref.
      console.error('❌ Work failed after claim; releasing reference:', workErr.message);
      const { error: delErr } = await supabase
        .from('processed_webhooks')
        .delete()
        .eq('reference', reference);
      if (delErr) {
        console.error('Failed to release claim:', delErr.message);
      }
      throw workErr;
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