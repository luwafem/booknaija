const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const TOKEN_EXPIRY = '24h';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { slug, securityCode, securityQuestion, securityAnswer, token } = JSON.parse(event.body);

    if (!slug || !securityCode || !token) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Verify the temporary token from step 1
    let tempPayload;
    try {
      tempPayload = jwt.verify(token, JWT_SECRET);
    } catch {
      return { statusCode: 401, body: JSON.stringify({ error: 'Session expired. Please start over.' }) };
    }
    if (tempPayload.slug !== slug) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    // Fetch business with hashed fields
    const { data: biz, error } = await supabase
      .from('businesses')
      .select('id, slug, security_code_hash, security_question_1, security_answer_1_hash, security_question_2, security_answer_2_hash')
      .eq('slug', slug)
      .single();

    if (error || !biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    // Verify 4-digit code
    if (!biz.security_code_hash || !bcrypt.compareSync(securityCode, biz.security_code_hash)) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid security code' }) };
    }

    // Verify security question & answer if provided
    if (securityQuestion) {
      const normalizedAnswer = securityAnswer.toLowerCase().trim();
      let answerMatch = false;
      if (biz.security_question_1 === securityQuestion && biz.security_answer_1_hash) {
        answerMatch = bcrypt.compareSync(normalizedAnswer, biz.security_answer_1_hash);
      }
      if (!answerMatch && biz.security_question_2 === securityQuestion && biz.security_answer_2_hash) {
        answerMatch = bcrypt.compareSync(normalizedAnswer, biz.security_answer_2_hash);
      }
      if (!answerMatch) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid security question or answer' }) };
      }
    }

    // Generate final JWT session
    const sessionToken = jwt.sign(
      { slug: biz.slug, id: biz.id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    };

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookie.serialize('dashboard_token', sessionToken, cookieOptions),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true, slug: biz.slug }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};