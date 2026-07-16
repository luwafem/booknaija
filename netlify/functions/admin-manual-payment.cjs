const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    const { businessSlug, amount, note } = JSON.parse(event.body);
    if (!businessSlug || !amount || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing businessSlug or invalid amount' }) };
    }

    // Check business exists
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('id, subscription_ends_at')
      .eq('slug', businessSlug)
      .single();
    if (bizErr || !biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    // Extend subscription by 30 days
    const currentEnd = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : new Date();
    const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: updateErr } = await supabase
      .from('businesses')
      .update({
        subscription_ends_at: newEnd.toISOString(),
        active: true,
      })
      .eq('slug', businessSlug);

    if (updateErr) throw updateErr;

    // Record the manual payment in processed_webhooks (for revenue tracking)
    const { error: insertErr } = await supabase
      .from('processed_webhooks')
      .insert({
        reference: `manual_${Date.now()}`,
        processed_at: new Date().toISOString(),
        source: 'manual',
        note: note || 'Manual admin entry',
        amount: amount * 100, // store in kobo to match Paystack
        currency: 'NGN',
      });
    if (insertErr) throw insertErr;

    await logSystemEvent('info', 'admin-payment', `Manual payment of ₦${amount} for ${businessSlug}`, { businessSlug, amount });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Payment recorded and subscription extended',
        new_end_date: newEnd.toISOString(),
      }),
    };
  } catch (err) {
    console.error('Manual payment error:', err);
    await logSystemEvent('error', 'admin-payment', err.message, { event });
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};