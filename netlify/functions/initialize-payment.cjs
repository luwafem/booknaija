// netlify/functions/initialize-payment.js
exports.handler = async (event) => {
  // 1. Ensure it's a POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // 2. Safely parse the body
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing request body' }) };
    }

    const { 
      slug, amount, date, time, name, email, phone, 
      calendarId, serviceId, serviceName, type, address,
      subaccountCode    
    } = JSON.parse(event.body);

    // 3. Check environment variables
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing from Netlify Environment Variables!');
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured on server.' }) };
    }

    // 4. Validate required Paystack fields
    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and amount are required.' }) };
    }

    // Build the transaction payload
    const payload = {
      email,
      amount: Math.round(amount * 100), // Ensure it's an integer (kobo)
      currency: 'NGN',
      callback_url: `${event.headers.origin || 'https://yoursite.netlify.app'}/${slug}`,
      metadata: { 
        slug, serviceId, serviceName, date, time, 
        customerName: name, customerPhone: phone, 
        calendarId, type: type || 'service', 
        address: address || 'N/A',
        subaccountCode: subaccountCode || null,   
      },
    };

    // Add subaccount split if provided
    if (subaccountCode) {
      payload.subaccount = subaccountCode;         
      payload.bearer = 'subaccount';               
    }

    console.log('Sending to Paystack:', JSON.stringify(payload));

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Paystack Response:', JSON.stringify(data));

    if (!data.status) {
      console.error('Paystack Error:', data.message);
      return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Paystack initialization failed.' }) };
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        authorization_url: data.data.authorization_url, 
        reference: data.data.reference 
      }) 
    };
  } catch (err) {
    console.error('🔥 Function Crash:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }) };
  }
};