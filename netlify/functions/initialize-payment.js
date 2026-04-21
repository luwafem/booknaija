exports.handler = async (event) => {
  try {
    // Added address to destructuring
    const { slug, amount, date, time, name, email, phone, calendarId, serviceId, serviceName, type, address } = JSON.parse(event.body);
    
    const envKey = `PAYSTACK_SECRET_${slug.replace(/-/g, '_').toUpperCase()}`;
    const secretKey = process.env[envKey];

    if (!secretKey) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid business' }) };

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: 'NGN',
        callback_url: `${event.headers.origin || 'https://yoursite.netlify.app'}/${slug}`,
        // Added address here so it shows up on the Paystack receipt
        metadata: { slug, serviceId, serviceName, date, time, customerName: name, customerPhone: phone, calendarId, type: type || 'service', address: address || 'N/A' },
      }),
    });

    const data = await res.json();
    if (!data.status) return { statusCode: 400, body: JSON.stringify({ error: data.message }) };

    return { statusCode: 200, body: JSON.stringify({ authorization_url: data.data.authorization_url, reference: data.data.reference }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};