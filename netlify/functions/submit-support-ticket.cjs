// netlify/functions/submit-support-ticket.cjs
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const xss = require('xss');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { validateCsrf } = require('./_utils/csrf');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION ────────────────────────────────────────────
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

// ─── SEND EMAIL TO ADMIN ──────────────────────────────────────
async function sendAdminNotification(email, subject, message, userType, userId) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not set – skipping email notification.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@five9.com.ng';
  const from = process.env.EMAIL_FROM || 'Five9 <noreply@five9.com.ng>';
  const resend = new Resend(resendApiKey);

  const html = `
    <h2>New Support Ticket</h2>
    <p><strong>User:</strong> ${userType} (${userId})</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
    <hr>
    <p>View all tickets in the admin dashboard.</p>
  `;

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `[Support] ${subject}`,
    html,
  });
}

exports.handler = async (event) => {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // ─── CSRF PROTECTION ────────────────────────────────────────
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    // ─── PARSE & SANITISE INPUT ────────────────────────────────
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (_) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }
    payload = sanitizeDeep(payload);

    const { userType, userId, email, subject, message } = payload;

    // ─── VALIDATE REQUIRED FIELDS ─────────────────────────────
    if (!userType || !userId || !email || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields (userType, userId, email, subject, message)' }),
      };
    }

    // Validate userType
    if (!['business', 'affiliate'].includes(userType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid userType. Must be "business" or "affiliate".' }),
      };
    }

    // ─── JWT AUTHENTICATION ─────────────────────────────────────
    const cookies = cookie.parse(event.headers.cookie || '');
    let token = cookies.dashboard_token || cookies.admin_token;

    // If no token, try to get from Authorization header (for affiliate dashboard)
    const authHeader = event.headers.authorization || '';
    if (!token && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: No session token provided.' }),
      };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set');
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

    // ─── AUTHORISE ACCESS ──────────────────────────────────────
    // If userType === 'business', decoded.slug must match userId
    // If userType === 'affiliate', decoded.affiliateId must match userId
    // (Admin token has role = 'admin' and can submit on behalf of anyone – we allow it)
    if (decoded.role !== 'admin') {
      if (userType === 'business' && decoded.slug !== userId) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Forbidden: You are not authorised to submit a ticket for this business.' }),
        };
      }
      if (userType === 'affiliate' && decoded.affiliateId !== userId) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Forbidden: You are not authorised to submit a ticket for this affiliate.' }),
        };
      }
    }

    // ─── INSERT INTO SUPABASE ───────────────────────────────────
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        user_type: userType,
        email,
        subject,
        message,
        status: 'open',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error('Failed to save ticket.');
    }

    // ─── SEND EMAIL NOTIFICATION (non‑blocking) ────────────────
    try {
      await sendAdminNotification(email, subject, message, userType, userId);
    } catch (emailErr) {
      console.error('Failed to send admin notification:', emailErr.message);
      // Non‑critical – continue
    }

    // ─── RESPONSE ──────────────────────────────────────────────
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ticketId: data.id }),
    };
  } catch (err) {
    console.error('Unhandled error in submit-support-ticket:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};