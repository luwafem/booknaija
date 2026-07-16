const jwt = require('jsonwebtoken');
const cookie = require('cookie');

function verifyAdmin(event) {
  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.admin_token;

    if (!token) {
      return { valid: false, error: 'No admin token provided' };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return { valid: false, error: 'Server misconfiguration' };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return { valid: false, error: 'Not an admin' };
    }
    return { valid: true, decoded };
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return { valid: false, error: err.message };
  }
}

module.exports = { verifyAdmin };