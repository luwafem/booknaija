const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

// ─── SANITISATION HELPER ───
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: [],
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeDeep);
  }
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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const raw = JSON.parse(event.body);
    const sanitized = sanitizeDeep(raw);
    const { slug } = sanitized;

    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Slug required' }) };
    }

    const { data: biz, error } = await supabase
      .from('businesses')
      .select('id, name, security_question_1, security_question_2')
      .eq('slug', slug)
      .single();

    if (error || !biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    // Generate short-lived token (5 min)
    const token = jwt.sign(
      { slug, id: biz.id },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        name: biz.name,
        security_question_1: biz.security_question_1,
        security_question_2: biz.security_question_2,
        token,
      }),
    };
  } catch (err) {
    console.error('Error in get-dashboard-questions:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};