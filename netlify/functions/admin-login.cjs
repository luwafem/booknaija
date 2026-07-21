// netlify/functions/admin-login.cjs
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const TOKEN_EXPIRY = '24h';

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse and validate request body
    let password;
    try {
      const body = JSON.parse(event.body);
      password = body.password;
    } catch (parseErr) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    if (!password || typeof password !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password is required' }),
      };
    }

    // Check admin password
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Admin not configured' }),
      };
    }

    if (password !== adminPassword) {
      console.warn('⚠️ Failed admin login attempt');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' }),
      };
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server misconfiguration' }),
      };
    }

    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Set cookie with same attributes as logout
    const isSecure = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    };

    console.log('✅ Admin login successful');

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookie.serialize('admin_token', token, cookieOptions),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('🔥 Admin login error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};