const jwt = require('jsonwebtoken');
const cookie = require('cookie');

exports.handler = async (event) => {
  // Only POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { password } = JSON.parse(event.body);
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is not set');
      return { statusCode: 500, body: JSON.stringify({ error: 'Admin not configured' }) };
    }

    if (password !== adminPassword) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid password' }) };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
    }

    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    };

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookie.serialize('admin_token', token, cookieOptions),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Admin login error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};