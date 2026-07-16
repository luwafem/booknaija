const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Helper to log actions to system_logs ────────────────
async function logSystemEvent(level, source, message, metadata = {}) {
  try {
    await supabase.from('system_logs').insert({
      level,
      source,
      message,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log system event:', err.message);
  }
}

exports.handler = async (event) => {
  console.log('📨 admin-businesses called with method:', event.httpMethod);
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) {
      return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
    }

    // ─── GET: List businesses ──────────────────────────────
    if (event.httpMethod === 'GET') {
      console.log('✅ Handling GET request');
      const params = event.queryStringParameters || {};
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
      const search = params.search || '';
      const filterActive = params.active; // 'true' or 'false'
      const businessType = params.businessType; // filter by business_type

      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (filterActive === 'true') query = query.eq('active', true);
      else if (filterActive === 'false') query = query.eq('active', false);

      if (businessType) {
        query = query.eq('business_type', businessType);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({
          businesses: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        }),
      };
    }

    // ─── POST: Perform actions ─────────────────────────────
    if (event.httpMethod === 'POST') {
      console.log('✅ Handling POST request');
      // 🔒 CSRF protection
      if (!validateCsrf(event)) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
        };
      }

      const body = JSON.parse(event.body);
      const { slug, action } = body;

      if (!slug || !action) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or action' }) };
      }

      let updatePayload = {};
      let logMessage = '';

      // ── toggle_active ──
      if (action === 'toggle_active') {
        const { data: biz } = await supabase
          .from('businesses')
          .select('active')
          .eq('slug', slug)
          .single();
        if (!biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
        updatePayload.active = !biz.active;
        logMessage = `Toggled active status for ${slug} → ${updatePayload.active}`;
      }

      // ── extend ── (30 days)
      else if (action === 'extend') {
        const { data: biz } = await supabase
          .from('businesses')
          .select('subscription_ends_at')
          .eq('slug', slug)
          .single();
        if (!biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
        const currentEnd = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : new Date();
        const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        updatePayload.subscription_ends_at = newEnd.toISOString();
        updatePayload.active = true;
        logMessage = `Extended subscription for ${slug} until ${newEnd.toISOString()}`;
      }

      // ── extend_custom ── (custom days)
      else if (action === 'extend_custom') {
        const { days } = body;
        if (!days || days <= 0) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid days' }) };
        }
        const { data: biz } = await supabase
          .from('businesses')
          .select('subscription_ends_at')
          .eq('slug', slug)
          .single();
        if (!biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
        const currentEnd = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : new Date();
        const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
        updatePayload.subscription_ends_at = newEnd.toISOString();
        updatePayload.active = true;
        logMessage = `Extended subscription for ${slug} by ${days} days until ${newEnd.toISOString()}`;
      }

      // ── override_end_date ── (specific date)
      else if (action === 'override_end_date') {
        const { endDate } = body;
        if (!endDate) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing endDate' }) };
        }
        const parsedDate = new Date(endDate);
        if (isNaN(parsedDate.getTime())) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Invalid endDate format' }) };
        }
        updatePayload.subscription_ends_at = parsedDate.toISOString();
        updatePayload.active = true;
        logMessage = `Overrode end date for ${slug} to ${parsedDate.toISOString()}`;
      }

      // ── update (edit business fields) ──
      else if (action === 'update') {
        const { data: fields } = body;
        if (!fields || typeof fields !== 'object') {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing update data' }) };
        }
        // Add business_type to allowed fields
        const allowedFields = ['name', 'email', 'phone', 'location', 'tagline', 'bio', 'logo', 'business_type'];
        const updateData = {};
        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            updateData[field] = fields[field];
          }
        }
        if (Object.keys(updateData).length === 0) {
          return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields to update' }) };
        }
        updatePayload = updateData;
        logMessage = `Updated business ${slug}: ${Object.keys(updateData).join(', ')}`;
      }

      // ── Unknown action ──
      else {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
      }

      // ─── Execute the update ──────────────────────────────
      const { error } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('slug', slug);
      if (error) throw error;

      // ─── Log the action ──────────────────────────────────
      await logSystemEvent('info', 'admin-businesses', logMessage, { slug, action, updatePayload });

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, updated: updatePayload }),
      };
    }

    // ─── Method not allowed ──────────────────────────────
    console.warn('⚠️ Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    console.error('🔥 Admin businesses error:', err);
    await logSystemEvent('error', 'admin-businesses', err.message, { event });
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};