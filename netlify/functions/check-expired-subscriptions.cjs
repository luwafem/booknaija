// netlify/functions/check-expired-subscriptions.cjs
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only allow scheduled invocations (Netlify internal)
  if (event.headers['x-netlify-schedule'] !== 'true') {
    return { statusCode: 403, body: 'Forbidden' };
  }

  try {
    const now = new Date().toISOString();

    // 1. Deactivate expired subscriptions
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({ active: false })
      .eq('active', true)
      .lt('subscription_ends_at', now);

    if (updateErr) {
      console.error('Failed to deactivate expired subscriptions:', updateErr);
      return { statusCode: 500, body: 'Update failed' };
    }

    // 2. Send reminder emails for subscriptions expiring in 5 days (optional – separate function)
    // We'll handle reminders in a separate function to keep it clean

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Expired subscriptions deactivated' }),
    };
  } catch (err) {
    console.error('Scheduled function error:', err);
    return { statusCode: 500, body: err.message };
  }
};