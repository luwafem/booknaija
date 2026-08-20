const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Get host from query param or request header
  let hostname = event.queryStringParameters?.host || event.headers.host;
  if (!hostname) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing host header or query parameter' }),
    };
  }

  // Sanitise: remove port, www prefix, and any trailing slashes/paths
  hostname = hostname
    .replace(/:\d+$/, '')          // remove port
    .replace(/^www\./, '')         // remove www.
    .replace(/\/.*$/, '')          // remove any path
    .toLowerCase()
    .trim();

  // Validate that it looks like a domain (basic)
  if (!hostname || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(hostname)) {
    console.warn('Invalid domain format:', hostname);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid domain format' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('slug')
      .eq('custom_domain', hostname)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error' }),
      };
    }

    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Domain not mapped to any business' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ slug: data.slug }),
    };
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};