const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { slug } = JSON.parse(event.body);
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

    // Generate short-lived token (5 min) to tie the second step to this slug
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
        token, // client must send this back in the next request
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};