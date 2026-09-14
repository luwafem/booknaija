// netlify/functions/_utils/csrf.cjs
const cookie = require('cookie');
const crypto = require('crypto');

/**
 * Constant-time string comparison. Falls back to length-check + timingSafeEqual.
 * Never throws.
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  // timingSafeEqual requires equal-length buffers
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (_) {
    return false;
  }
}

/**
 * Validates a CSRF token by comparing the cookie value against the header value.
 *
 * Both must be present, correctly formatted (64 lowercase hex chars), and match.
 *
 * @param {object} event         — Netlify Lambda event
 * @param {object} [options]     — Optional configuration
 * @param {boolean} [options.required=true] — If false, missing token is treated
 *   as valid (returns true). Useful for endpoints reachable from public,
 *   pre-auth pages where no CSRF cookie has been issued yet. The caller is
 *   responsible for ensuring an alternative anti-abuse mechanism (rate limits,
 *   unguessable references, etc.) is in place.
 * @returns {boolean}
 */
function validateCsrf(event, options = {}) {
  const { required = true } = options;

  // Netlify normalises header names to lowercase, but be defensive in case a
  // proxy or test harness sends them differently.
  const headers = event?.headers || {};
  const rawHeader =
    headers['x-csrf-token'] ||
    headers['X-CSRF-Token'] ||
    headers['X-Csrf-Token'];

  let csrfCookie = null;
  try {
    const cookies = cookie.parse(headers.cookie || '');
    csrfCookie = cookies.csrf_token || null;
  } catch (err) {
    console.warn('CSRF validation failed: could not parse cookie header —', err.message);
    // If we can't parse the cookie and CSRF isn't required, allow through.
    return !required;
  }

  const csrfHeader = rawHeader || null;

  // ─── Nothing present at all ───
  if (!csrfCookie && !csrfHeader) {
    if (!required) {
      // Caller opted out and no tokens were sent — treat as valid.
      return true;
    }
    console.warn('CSRF validation failed: missing cookie and header');
    return false;
  }

  // ─── One side missing ───
  if (!csrfCookie || !csrfHeader) {
    console.warn(
      `CSRF validation failed: missing ${!csrfCookie ? 'cookie' : 'header'}`
    );
    return false;
  }

  // ─── Format check (64 lowercase hex chars) ───
  const hexRegex = /^[a-f0-9]{64}$/;
  if (!hexRegex.test(csrfCookie)) {
    console.warn('CSRF validation failed: invalid cookie token format');
    return false;
  }
  if (!hexRegex.test(csrfHeader)) {
    console.warn('CSRF validation failed: invalid header token format');
    return false;
  }

  // ─── Constant-time equality check ───
  if (!safeEqual(csrfCookie, csrfHeader)) {
    console.warn('CSRF validation failed: cookie and header mismatch');
    return false;
  }

  return true;
}

module.exports = { validateCsrf };