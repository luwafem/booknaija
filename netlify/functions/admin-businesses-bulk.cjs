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

    const { slugs, action } = JSON.parse(event.body);
    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slugs array' }) };
    }

    let updatePayload = {};
    if (action === 'activate') updatePayload.active = true;
    else if (action === 'deactivate') updatePayload.active = false;
    else if (action === 'extend') {
      // Extend each by 30 days – we need to fetch individual end dates
      const { data: businesses } = await supabase
        .from('businesses')
        .select('slug, subscription_ends_at')
        .in('slug', slugs);

      if (!businesses) throw new Error('No businesses found');

      for (const biz of businesses) {
        const currentEnd = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : new Date();
        const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        await supabase
          .from('businesses')
          .update({ subscription_ends_at: newEnd.toISOString(), active: true })
          .eq('slug', biz.slug);
      }
      await logSystemEvent('info', 'admin-bulk', `Extended ${slugs.length} businesses`);
      return { statusCode: 200, body: JSON.stringify({ success: true, action: 'extend' }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    }

    // For activate/deactivate, do a single update
    const { error } = await supabase
      .from('businesses')
      .update(updatePayload)
      .in('slug', slugs);

    if (error) throw error;

    await logSystemEvent('info', 'admin-bulk', `${action} ${slugs.length} businesses`);
    return { statusCode: 200, body: JSON.stringify({ success: true, action }) };

  } catch (err) {
    console.error('Bulk action error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};