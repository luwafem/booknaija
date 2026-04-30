// netlify/functions/list-banks.js
exports.handler = async (event) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    
    // This will log in your terminal where you ran "netlify dev"
    console.log("Checking for Paystack Key...");
    if (!secretKey) {
      console.error("MISSING: PAYSTACK_SECRET_KEY is not set in .env");
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Payment not configured' }) 
      };
    }

    console.log("Fetching banks from Paystack...");
    const response = await fetch('https://api.paystack.co/bank?currency=NGN&country=nigeria', {
      headers: { 
        Authorization: `Bearer ${secretKey}`
      },
    });

    const data = await response.json();
    
    if (!data.status) {
      console.error("Paystack API Error:", data.message);
      return { statusCode: 400, body: JSON.stringify({ error: data.message }) };
    }

    if (!Array.isArray(data.data)) {
      console.error("Unexpected Paystack response format:", JSON.stringify(data).substring(0, 200));
      return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected data format from Paystack' }) };
    }

    // Return simplified list: [{ code, name }, ...]
    const banks = data.data.map(b => ({ code: b.code, name: b.name }));
    
    console.log(`Successfully loaded ${banks.length} banks.`);
    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banks) 
    };
  } catch (err) {
    // This is the exact error causing your 500
    console.error("FUNCTION CRASH:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};