const jwt = require('jsonwebtoken');
const cookie = require('cookie');

exports.handler = async (event) => {
  const cookies = cookie.parse(event.headers.cookie || '');
  const token = cookies.dashboard_token;
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { statusCode: 200, body: JSON.stringify({ slug: decoded.slug }) };
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
  }
};