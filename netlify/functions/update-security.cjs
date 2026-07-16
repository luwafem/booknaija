// netlify/functions/update-security.cjs
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { validateCsrf } = require('./_utils/csrf');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── HELPER: Check if string looks like a bcrypt hash ───
function isBcryptHash(str) {
  return typeof str === 'string' && (str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$'));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    // ─── PARSE & SANITISE ───
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseErr) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }

    // Basic sanitisation (no XSS)
    const { slug, currentCode, newCode, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = payload;

    if (!slug || !currentCode || !newCode) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: slug, currentCode, newCode' }) };
    }

    // ─── JWT AUTHENTICATION ───
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.dashboard_token;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: No session token provided.' }),
      };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set in environment');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server misconfiguration.' }),
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn('JWT verification failed:', err.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired session. Please log in again.' }),
      };
    }

    if (decoded.slug !== slug) {
      console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to modify this business.' }),
      };
    }

    // ─── VALIDATE NEW CODE ───
    if (!/^\d{4}$/.test(newCode)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'New security code must be exactly 4 digits.' }) };
    }

    // ─── FETCH BUSINESS WITH CURRENT HASHES ───
    const { data: biz, error: fetchErr } = await supabase
      .from('businesses')
      .select('security_code, security_code_hash, security_question_1, security_answer_1, security_answer_1_hash, security_question_2, security_answer_2, security_answer_2_hash')
      .eq('slug', slug)
      .single();

    if (fetchErr || !biz) {
      console.error('Fetch business error:', fetchErr);
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found.' }) };
    }

    // ─── VERIFY CURRENT CODE ───
    const storedCode = biz.security_code_hash || biz.security_code;
    let codeValid = false;
    if (isBcryptHash(storedCode)) {
      codeValid = bcrypt.compareSync(currentCode, storedCode);
    } else if (biz.security_code) {
      codeValid = currentCode === biz.security_code;
    }

    if (!codeValid) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Current security code is incorrect.' }) };
    }

    // ─── PREPARE UPDATES ───
    const updates = {};

    // Always hash new code
    updates.security_code_hash = bcrypt.hashSync(newCode, 10);
    // Optionally keep plaintext for backward compatibility (but we can clear it)
    updates.security_code = null; // clear plaintext

    // If both questions and answers are provided, validate and hash them
    if (securityQuestion1 && securityAnswer1 && securityQuestion2 && securityAnswer2) {
      if (securityQuestion1 === securityQuestion2) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Security questions must be different.' }) };
      }

      const answer1 = securityAnswer1.toLowerCase().trim();
      const answer2 = securityAnswer2.toLowerCase().trim();
      if (answer1.length === 0 || answer2.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Security answers cannot be empty.' }) };
      }

      updates.security_question_1 = securityQuestion1;
      updates.security_answer_1 = null; // clear plaintext
      updates.security_answer_1_hash = bcrypt.hashSync(answer1, 10);
      updates.security_question_2 = securityQuestion2;
      updates.security_answer_2 = null;
      updates.security_answer_2_hash = bcrypt.hashSync(answer2, 10);
    } else if (securityQuestion1 || securityAnswer1 || securityQuestion2 || securityAnswer2) {
      // If any one of the security fields is provided but not all, error
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'To update security questions, both questions and answers must be provided in full.' }),
      };
    }

    // ─── UPDATE BUSINESS ───
    const { error: updateErr } = await supabase
      .from('businesses')
      .update(updates)
      .eq('slug', slug);

    if (updateErr) {
      console.error('Update error:', updateErr);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update security details.' }) };
    }

    // ─── LOG (optional) ───
    try {
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'update-security',
        message: `Security details updated for ${slug}`,
        metadata: { slug, fields_updated: Object.keys(updates) },
      });
    } catch (logErr) {
      console.error('Failed to log security update:', logErr.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Security details updated successfully.' }),
    };
  } catch (err) {
    console.error('🔥 update-security error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};