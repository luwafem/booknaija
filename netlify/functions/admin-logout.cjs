// netlify/functions/admin-logout.cjs
const cookie = require('cookie');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Clear the admin_token cookie by setting it to expire immediately
  const isSecure = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Strict',
    path: '/',
    expires: new Date(0), // already expired
    maxAge: 0,
  };

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': cookie.serialize('admin_token', '', cookieOptions),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ success: true }),
  };
};