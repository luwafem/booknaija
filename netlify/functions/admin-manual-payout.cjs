const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

async function logSystemEvent(level, source, message, metadata = {}) {
  try {
    await supabase.from('system_logs').insert({ level, source, message, metadata });
  } catch (err) { console.error('Log error:', err.message); }
}

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!validateCsrf(event)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Invalid CSRF token' }) };
    }

    const { affiliateId, amount, reason } = JSON.parse(event.body);
    if (!affiliateId || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliateId or amount' }) };
    }

    // Get affiliate's transfer recipient code
    const { data: affiliate, error: affErr } = await supabase
      .from('affiliates')
      .select('transfer_recipient_code')
      .eq('id', affiliateId)
      .single();

    if (affErr || !affiliate || !affiliate.transfer_recipient_code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Affiliate has no transfer recipient code.' }),
      };
    }

    const amountKobo = amount * 100;
    const transferReason = reason || `Manual payout to affiliate ${affiliateId}`;

    let transferResult;
    try {
      transferResult = await sendTransfer(
        affiliate.transfer_recipient_code,
        amountKobo,
        transferReason
      );
    } catch (transferErr) {
      await logSystemEvent('error', 'admin-payout', `Manual payout failed: ${transferErr.message}`, { affiliateId, amount });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Transfer failed: ${transferErr.message}` }),
      };
    }

    await logSystemEvent('info', 'admin-payout', `Manual payout of ₦${amount} to affiliate ${affiliateId}`, { affiliateId, amount, transfer_ref: transferResult.reference });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Payout sent successfully',
        transfer: transferResult,
      }),
    };
  } catch (err) {
    console.error('Manual payout error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};