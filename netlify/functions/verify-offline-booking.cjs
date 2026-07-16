const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const xss = require('xss');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { validateCsrf } = require('./_utils/csrf'); // 👈 NEW

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

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    let raw = JSON.parse(event.body);
    raw = sanitizeDeep(raw);
    const { id, slug } = raw;

    if (!id || !slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing booking ID or slug' }) };
    }

    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
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

    // Ensure the JWT slug matches the requested slug
    if (decoded.slug !== slug) {
      console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to verify bookings for this business.' }),
      };
    }

    // 1. Fetch the booking details
    const { data: booking, error: fetchError } = await supabase
      .from('offline_bookings')
      .select('*')
      .eq('id', id)
      .eq('business_slug', slug)
      .single();

    if (fetchError || !booking) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Booking not found' }) };
    }

    // 2. Update status to verified
    const { error: updateError } = await supabase
      .from('offline_bookings')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
    }

    // 3. Add to Google Calendar (if applicable)
    const { data: biz } = await supabase
      .from('businesses')
      .select('calendar_id, name')
      .eq('slug', slug)
      .single();

    if (biz && biz.calendar_id && booking.booking_date && booking.booking_time && booking.order_type === 'service') {
      try {
        const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        let privateKey = process.env.GOOGLE_PRIVATE_KEY;

        if (privateKey) {
          privateKey = privateKey.replace(/^"|"$/g, '');
          privateKey = privateKey.replace(/\\n/g, '\n');
          if (!privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
            privateKey = privateKey.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
          }
          if (!privateKey.includes('\n-----END PRIVATE KEY-----')) {
            privateKey = privateKey.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
          }
        }

        const auth = new google.auth.GoogleAuth({
          credentials: { client_email: googleClientEmail, private_key: privateKey },
          scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const [h, min] = booking.booking_time.split(':').map(Number);
        const endMin = h * 60 + min + 60;
        const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

        await calendar.events.insert({
          calendarId: biz.calendar_id,
          requestBody: {
            summary: `${booking.order_summary} — ${booking.customer_name}`,
            description: `Phone: ${booking.customer_phone}\nEmail: ${booking.customer_email}\nType: Offline Bank Transfer\nAmount: ₦${booking.amount / (booking.amount > 10000 ? 1 : 100)}`,
            start: { dateTime: `${booking.booking_date}T${booking.booking_time}:00`, timeZone: 'Africa/Lagos' },
            end: { dateTime: `${booking.booking_date}T${endTime}:00`, timeZone: 'Africa/Lagos' },
            reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
          },
        });
      } catch (calErr) {
        console.error('Calendar update failed (non-fatal):', calErr.message);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Booking verified' }),
    };
  } catch (err) {
    console.error('Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};