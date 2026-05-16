const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    const parsedBody = JSON.parse(event.body);
    const { 
      slug, amount, date, time, name, email, phone, 
      calendarId, serviceId, serviceName, type, address,
      subaccountCode,
      referredBy // --- NEW: Affiliate ID from Signup.jsx
    } = parsedBody;

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

    // --- NEW: AFFILIATE SPLIT LOGIC ---
    let finalSubaccountCode = subaccountCode || null;

    // If this is an affiliate signup (referredBy starts with 'aff_'), fetch the affiliate's subaccount code
    if (referredBy && referredBy.startsWith('aff_')) {
      console.log(`Affiliate referral detected: ${referredBy}. Looking up subaccount...`);
      
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('subaccount_code')
        .eq('id', referredBy)
        .single();

      if (affErr) {
        console.error('Error fetching affiliate:', affErr.message);
      } else if (affiliate && affiliate.subaccount_code) {
        // Override the subaccount with the AFFILIATE's subaccount code for the 60% split
        finalSubaccountCode = affiliate.subaccount_code;
        console.log(`Applying affiliate subaccount split: ${finalSubaccountCode}`);
      } else {
        console.warn('Affiliate ID provided but no subaccount code found in DB.');
      }
    }
    // --- END AFFILIATE SPLIT LOGIC ---

    // Build the transaction payload
    const payload = {
      email,
      amount: Math.round(amount * 100), // Ensure it's an integer (kobo)
      currency: 'NGN',
      callback_url: parsedBody.callback_url || `${event.headers.origin || 'https://booknaija.netlify.app'}/book/${slug}`,
      metadata: { 
        slug, serviceId, serviceName, date, time, 
        customerName: name, customerPhone: phone, 
        calendarId, type: type || 'service', 
        address: address || 'N/A',
        subaccountCode: finalSubaccountCode || null,
        referredBy: referredBy || null // Save to metadata for reference
      },
    };

    // Add subaccount split if provided (Works for both vendor bookings 5% and affiliate signups 60%)
    if (finalSubaccountCode) {
      payload.subaccount = finalSubaccountCode;         
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