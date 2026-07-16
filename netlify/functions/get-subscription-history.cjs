// netlify/functions/get-subscription-history.cjs
const { createClient } = require('@supabase/supabase-js');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const slug = event.queryStringParameters?.slug;
    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug' }) };
    }

    // ─── JWT AUTHENTICATION ───
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.dashboard_token;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: No session token provided.' }),
      };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set in environment');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server misconfiguration.' }),
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn('JWT verification failed:', err.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired session. Please log in again.' }),
      };
    }

    if (decoded.slug !== slug) {
      console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to view this business.' }),
      };
    }

    // ─── FETCH PAYMENT HISTORY ───
    // We filter by the `note` field which contains the slug in the format:
    // "Payment for {slug} - {payment_type}"
    // This is reliable as long as we maintain that format.
    // If you want to add a `metadata` JSONB column for more structured filtering,
    // you can add it with: ALTER TABLE processed_webhooks ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    // Then update your inserts to include metadata.slug = slug.
    const { data, error } = await supabase
      .from('processed_webhooks')
      .select('*')
      .ilike('note', `%${slug}%`)
      .order('processed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching subscription history:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ history: data || [] }),
    };
  } catch (err) {
    console.error('get-subscription-history error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};