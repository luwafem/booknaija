const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { startDate, endDate, metrics } = JSON.parse(event.body);
    // metrics: array of strings like ['businesses', 'revenue', 'affiliates']
    // Guard against a missing metrics array so .includes() below doesn't throw
    const metricList = Array.isArray(metrics) ? metrics : [];

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const report = {};

    // Businesses count
    if (metricList.includes('businesses') || metricList.length === 0) {
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      report['New Businesses'] = count || 0;
    }
 
    // Revenue
    if (metricList.includes('revenue') || metricList.length === 0) {
      // Sources that represent real money collected:
      //   • 'webhook' — Paystack charge.success webhook (primary path)
      //   • 'manual'  — admin-entered manual payment (admin-manual-payment.cjs)
      //   • 'verify'  — verify-subscription.cjs won the idempotency race
      //                 against the webhook. Same payment, different claimer.
      //                 Must be counted or that revenue is invisible.
      const { data, error } = await supabase
        .from('processed_webhooks')
        .select('amount')
        .in('source', ['webhook', 'manual', 'verify'])
        .gte('processed_at', start.toISOString())
        .lte('processed_at', end.toISOString());

      if (error) {
        console.error('Report revenue fetch error:', error.message);
        report['Revenue (₦)'] = 0;
      } else {
        // Amounts are stored in kobo (see paystack-webhook.cjs and
        // admin-manual-payment.cjs which multiply by 100 before insert).
        // Divide by 100 to match admin-revenue.cjs and display naira.
        const totalKobo = (data || []).reduce((sum, row) => sum + (row.amount || 0), 0);
        report['Revenue (₦)'] = totalKobo / 100;
      }
    }

    // New Affiliates
    if (metricList.includes('affiliates') || metricList.length === 0) {
      const { count } = await supabase
        .from('affiliates')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      report['New Affiliates'] = count || 0;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ report, startDate: start.toISOString(), endDate: end.toISOString() }),
    };
  } catch (err) {
    console.error('Report error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};