// netlify/functions/admin-support-tickets.cjs
const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only admins can access
  const auth = verifyAdmin(event);
  if (!auth.valid) {
    return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
  }

  // ─── GET: List tickets ──────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const params = event.queryStringParameters || {};
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.min(100, parseInt(params.limit) || 20);
      const statusFilter = params.status; // 'open', 'in-progress', 'closed', or undefined

      let query = supabase
        .from('support_tickets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({
          tickets: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        }),
      };
    } catch (err) {
      console.error('Admin support tickets GET error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ─── POST: Update ticket status ────────────────────────────
  if (event.httpMethod === 'POST') {
    // CSRF protection
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    try {
      const { ticketId, status } = JSON.parse(event.body);
      if (!ticketId || !status) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing ticketId or status' }),
        };
      }

      // Validate status
      const validStatuses = ['open', 'in-progress', 'closed'];
      if (!validStatuses.includes(status)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid status. Must be open, in-progress, or closed.' }),
        };
      }

      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (err) {
      console.error('Admin support tickets POST error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ─── Method not allowed ─────────────────────────────────────
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};