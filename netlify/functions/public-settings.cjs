const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Include disabled_business_types so the affiliate dashboard can filter its list
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [
        'hero_title',
        'hero_description',
        'hero_image',
        'disabled_business_types' // 👈 ADDED
      ]);

    if (error) throw error;

    const settings = {};
    data.forEach(row => { settings[row.key] = row.value; });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    };
  } catch (err) {
    console.error('Public settings error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};