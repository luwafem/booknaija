const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  return typeof str === 'string' && str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    let payload = JSON.parse(event.body);
    payload = sanitizeDeep(payload);

    const { email, securityCode, securityQuestion, securityAnswer } = payload;

    if (!email || !securityCode || !securityQuestion || !securityAnswer) {
      return { statusCode: 400, body: JSON.stringify({ error: 'All security fields are required' }) };
    }

    // Look up affiliate by email
    const { data: affiliate, error: affErr } = await supabase
      .from('affiliates')
      .select('id, security_code, security_question_1, security_answer_1, security_question_2, security_answer_2')
      .eq('email', email)
      .single();

    if (affErr || !affiliate) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No affiliate account found with this email.' }) };
    }

    // ─── 1. VERIFY 4‑DIGIT SECURITY CODE ───
    let codeValid = false;
    const storedCode = affiliate.security_code;

    if (isBcryptHash(storedCode)) {
      // New format: hashed
      codeValid = bcrypt.compareSync(securityCode, storedCode);
    } else {
      // Legacy plaintext
      codeValid = securityCode === storedCode;
    }

    if (!codeValid) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid security code.' }) };
    }

    // ─── 2. VERIFY SECURITY QUESTION & ANSWER ───
    const normalizedAnswer = securityAnswer.toLowerCase().trim();
    let isAnswerCorrect = false;

    // Helper to check answer against stored (handles both hash and plaintext)
    const checkAnswer = (storedAnswer, provided) => {
      if (!storedAnswer) return false;
      if (isBcryptHash(storedAnswer)) {
        return bcrypt.compareSync(provided, storedAnswer);
      }
      return storedAnswer === provided;
    };

    if (affiliate.security_question_1 === securityQuestion) {
      if (checkAnswer(affiliate.security_answer_1, normalizedAnswer)) {
        isAnswerCorrect = true;
      }
    }

    if (!isAnswerCorrect && affiliate.security_question_2 === securityQuestion) {
      if (checkAnswer(affiliate.security_answer_2, normalizedAnswer)) {
        isAnswerCorrect = true;
      }
    }

    if (!isAnswerCorrect) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect security question or answer.' }) };
    }

    // Success – Return affiliate ID
    return {
      statusCode: 200,
      body: JSON.stringify({ affiliateId: affiliate.id }),
    };
  } catch (err) {
    console.error('Affiliate login error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};