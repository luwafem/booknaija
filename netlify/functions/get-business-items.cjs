// netlify/functions/get-business-items.cjs
const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, { whiteList: [], stripIgnoreTag: true, stripIgnoreTagBody: ['script','style'] });
  }
  if (Array.isArray(input)) return input.map(sanitizeDeep);
  if (input && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }
  return input;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const slug = sanitizeDeep(params.slug);
    const table = sanitizeDeep(params.table);
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));

    if (!slug || !table) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or table' }) };
    }

    // Map frontend table names to database table names
    const tableMap = {
      services: 'business_services',
      products: 'business_products',
      cars: 'business_cars',
      food: 'business_food',
      properties: 'business_properties',
      estates: 'business_estates',
    };

    const dbTable = tableMap[table];
    if (!dbTable) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid table name' }) };
    }

    // Get business ID from slug
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (bizErr || !biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    const businessId = biz.id;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Query items with pagination
    const { data, error, count } = await supabase
      .from(dbTable)
      .select('*', { count: 'exact' })
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Pagination error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }),
    };
  } catch (err) {
    console.error('get-business-items error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};