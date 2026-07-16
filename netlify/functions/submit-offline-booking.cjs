const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
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
    const d = JSON.parse(event.body);
    // ─── SANITISE ALL INPUT ───
    const sanitized = sanitizeDeep(d);

    const { 
      slug, 
      name, 
      email, 
      phone, 
      address, 
      date, 
      time, 
      amount, 
      proofImageUrl, 
      type, 
      items, 
      summary 
    } = sanitized;

    if (!slug || !proofImageUrl || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    const { data, error } = await supabase
      .from('offline_bookings')
      .insert({
        business_slug: slug,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_address: address || null,
        booking_date: date || null,
        booking_time: time || null,
        order_type: type,
        order_summary: summary,
        order_metadata: items || {},
        amount: parseInt(amount),
        proof_image_url: proofImageUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving offline booking:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        bookingId: data.id,
        message: 'Booking submitted for verification.' 
      })
    };

  } catch (err) {
    console.error('Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};