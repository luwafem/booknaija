const { createClient } = require('@supabase/supabase-js');
const { validateCsrf } = require('./_utils/csrf.cjs');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const xss = require('xss');
const { Resend } = require('resend');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, { whiteList: [], stripIgnoreTag: true });
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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!validateCsrf(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Invalid CSRF token' }) };
  }

  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.dashboard_token;
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    const body = JSON.parse(event.body);
    const sanitized = sanitizeDeep(body);
    const { slug, custom_domain, action } = sanitized;

    if (!slug || slug !== decoded.slug) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    // action: 'request' (submit domain) or 'remove'
    if (action === 'request') {
      if (!custom_domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(custom_domain)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid domain format' }) };
      }

      // Check if domain already taken
      const { data: existing, error: checkErr } = await supabase
        .from('businesses')
        .select('slug')
        .eq('custom_domain', custom_domain.toLowerCase())
        .neq('slug', slug)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        return { statusCode: 409, body: JSON.stringify({ error: 'Domain already taken by another business' }) };
      }

      // Update business: set domain and status to 'pending'
      const { error: updateErr } = await supabase
        .from('businesses')
        .update({
          custom_domain: custom_domain.toLowerCase(),
          custom_domain_status: 'pending',
          custom_domain_notes: null,
          dns_records: null,
        })
        .eq('slug', slug);

      if (updateErr) throw updateErr;

      // ─── NOTIFY ADMIN ──────────────────────────────
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@five9.com.ng';
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Five9 <noreply@five9.com.ng>',
          to: adminEmail,
          subject: `Custom domain request from ${slug}`,
          text: `Business "${slug}" has requested to use custom domain: ${custom_domain}\n\nPlease review and take action in the admin dashboard.`,
          html: `<p>Business <strong>${slug}</strong> has requested to use custom domain: <strong>${custom_domain}</strong>.</p>
                 <p>Please review and take action in the admin dashboard.</p>`,
        });
      } catch (notifyErr) {
        console.error('Failed to send admin notification:', notifyErr.message);
        // Non‑critical – continue
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, status: 'pending' }),
      };
    }

    if (action === 'remove') {
      const { error: updateErr } = await supabase
        .from('businesses')
        .update({
          custom_domain: null,
          custom_domain_status: 'none',
          custom_domain_notes: null,
          dns_records: null,
        })
        .eq('slug', slug);

      if (updateErr) throw updateErr;
      return { statusCode: 200, body: JSON.stringify({ success: true, status: 'none' }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
  } catch (err) {
    console.error('business-domain error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};