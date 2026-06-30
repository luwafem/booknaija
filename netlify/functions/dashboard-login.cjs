const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}
const TOKEN_EXPIRY = '24h';

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

// ─── HELPER: Check if string looks like a bcrypt hash ───
function isBcryptHash(str) {
  return typeof str === 'string' && (str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$'));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Parse and sanitise all input
    let payload = JSON.parse(event.body);
    payload = sanitizeDeep(payload);

    const { slug, securityCode, securityQuestion, securityAnswer, token } = payload;

    // Normalise slug
    const cleanSlug = slug.trim().toLowerCase();

    console.log('🔑 Login attempt for slug:', cleanSlug);

    if (!cleanSlug || !securityCode || !token) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Verify the temporary token
    let tempPayload;
    try {
      tempPayload = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified for slug:', tempPayload.slug);
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return { statusCode: 401, body: JSON.stringify({ error: 'Session expired. Please start over.' }) };
    }
    if (tempPayload.slug !== cleanSlug) {
      console.error('❌ Token slug mismatch:', tempPayload.slug, 'vs', cleanSlug);
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    // Fetch business with both hashed and plaintext fields
    const { data: biz, error } = await supabase
      .from('businesses')
      .select('id, slug, security_code, security_code_hash, security_question_1, security_answer_1, security_answer_1_hash, security_question_2, security_answer_2, security_answer_2_hash')
      .eq('slug', cleanSlug)
      .single();

    if (error) {
      console.error('❌ Supabase query error:', error.message);
      return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
    }
    if (!biz) {
      console.error('❌ Business not found for slug:', cleanSlug);
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    console.log('✅ Business found:', biz.slug);

    // ─── VERIFY 4‑DIGIT SECURITY CODE ───
    let codeValid = false;
    const storedCode = biz.security_code_hash || biz.security_code;

    if (isBcryptHash(storedCode)) {
      codeValid = bcrypt.compareSync(securityCode, storedCode);
    } else if (biz.security_code) {
      // Legacy plaintext
      codeValid = securityCode === biz.security_code;
    }

    if (!codeValid) {
      console.error('❌ Invalid security code for slug:', cleanSlug);
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid security code' }) };
    }

    // ─── VERIFY SECURITY QUESTION & ANSWER ───
    if (securityQuestion) {
      const normalizedAnswer = securityAnswer.toLowerCase().trim();
      let answerMatch = false;

      // Helper to check answer against stored (handles both hash and plaintext)
      const checkAnswer = (storedAnswer, provided) => {
        if (!storedAnswer) return false;
        if (isBcryptHash(storedAnswer)) {
          return bcrypt.compareSync(provided, storedAnswer);
        }
        return storedAnswer === provided;
      };

      if (biz.security_question_1 === securityQuestion) {
        answerMatch = checkAnswer(biz.security_answer_1_hash || biz.security_answer_1, normalizedAnswer);
      }
      if (!answerMatch && biz.security_question_2 === securityQuestion) {
        answerMatch = checkAnswer(biz.security_answer_2_hash || biz.security_answer_2, normalizedAnswer);
      }

      if (!answerMatch) {
        console.error('❌ Invalid security question/answer for slug:', cleanSlug);
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
    console.error('🔥 dashboard-login error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};