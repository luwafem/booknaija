const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  // Allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const slug = event.queryStringParameters.slug;

    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug' }) };
    }

    // Fetch pending bookings for this business, ordered by newest first
    const { data, error } = await supabase
      .from('offline_bookings')
      .select('*')
      .eq('business_slug', slug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ bookings: data || [] })
    };

  } catch (err) {
    console.error('Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};