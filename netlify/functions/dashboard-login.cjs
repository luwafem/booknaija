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

    // Normalise slug
    const cleanSlug = slug.trim().toLowerCase();

    console.log('🔑 Login attempt for slug:', slug);
    console.log('🔑 Cleaned slug:', cleanSlug);

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

    // Verify 4-digit security code
    let codeValid = false;
    if (biz.security_code_hash) {
      codeValid = bcrypt.compareSync(securityCode, biz.security_code_hash);
      console.log('🔑 Hash compare result:', codeValid);
    } else if (biz.security_code) {
      codeValid = securityCode === biz.security_code;
      console.log('🔑 Plaintext compare result:', codeValid);
    }
    if (!codeValid) {
      console.error('❌ Invalid security code for slug:', cleanSlug);
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid security code' }) };
    }

    // Verify security question & answer if provided
    if (securityQuestion) {
      const normalizedAnswer = securityAnswer.toLowerCase().trim();
      let answerMatch = false;
      if (biz.security_question_1 === securityQuestion) {
        if (biz.security_answer_1_hash) {
          answerMatch = bcrypt.compareSync(normalizedAnswer, biz.security_answer_1_hash);
        } else if (biz.security_answer_1) {
          answerMatch = normalizedAnswer === biz.security_answer_1.toLowerCase().trim();
        }
      }
      if (!answerMatch && biz.security_question_2 === securityQuestion) {
        if (biz.security_answer_2_hash) {
          answerMatch = bcrypt.compareSync(normalizedAnswer, biz.security_answer_2_hash);
        } else if (biz.security_answer_2) {
          answerMatch = normalizedAnswer === biz.security_answer_2.toLowerCase().trim();
        }
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