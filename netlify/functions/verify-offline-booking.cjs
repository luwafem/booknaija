const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
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

        // Sanitise strings used in calendar event (though booking fields are already sanitised on insert)
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