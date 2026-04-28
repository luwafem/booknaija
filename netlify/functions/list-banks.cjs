// netlify/functions/list-banks.js
exports.handler = async (event) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured' }) };

    const res = await fetch('https://api.paystack.co/bank?currency=NGN&country=nigeria', {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await res.json();
    if (!data.status) return { statusCode: 400, body: JSON.stringify({ error: data.message }) };

    // Return simplified list: [{ code, name }, ...]
    const banks = data.data.map(b => ({ code: b.code, name: b.name }));
    return { statusCode: 200, body: JSON.stringify(banks) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};