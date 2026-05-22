const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const d = JSON.parse(event.body);
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
    } = d;

    if (!slug || !proofImageUrl || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Insert into offline_bookings table
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
        order_metadata: items || {}, // Stores full cart details
        amount: parseInt(amount), // Ensure integer
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