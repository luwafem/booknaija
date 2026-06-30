// netlify/functions/get-offline-bookings.cjs
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION HELPER ───
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return xss(str, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
}

exports.handler = async function (event) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Sanitise the slug query parameter
    const rawSlug = event.queryStringParameters?.slug;
    const slug = sanitizeString(rawSlug);

    if (!slug || slug.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid slug' }) };
    }

    // Optional: additional validation – slug should only contain safe characters
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid slug format' }) };
    }

    // Fetch pending bookings for this business, ordered by newest first
    const { data, error } = await supabase
      .from('offline_bookings')
      .select('*')
      .eq('business_slug', slug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings for slug:', slug, error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ bookings: data || [] }),
    };
  } catch (err) {
    console.error('Unexpected error in get-offline-bookings:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};