// netlify/functions/_utils/sanitize.cjs
//
// Shared XSS sanitization helpers for Netlify Functions.
//
// ⚠️ This file exists but is currently UNUSED. Every function that
// needs sanitization still defines its own inline copy — 18 files
// for sanitizeDeep, 4 files for sanitizeString. This file is the
// intended eventual single source of truth; it just hasn't been
// wired up yet.
//
// When the dedup session happens, each inline copy gets replaced with:
//
//   const { sanitizeDeep } = require('./_utils/sanitize.cjs');
//
// and the local function definition is deleted. Nothing else about
// this file needs to change for that to work.
//
// ─── WHY .cjs AND NOT .js ──────────────────────────────────────────
// The package.json at the repo root has `"type": "module"`. Under
// that setting, Node treats any `.js` file as an ES module, and
// `require()` on it throws ERR_REQUIRE_ESM at load time. Every
// Netlify function in this codebase is CommonJS (uses `require` and
// `module.exports`), so the utility they import must also be
// CommonJS. The `.cjs` extension forces that, regardless of what
// package.json says.

const xss = require('xss');

/**
 * Recursively sanitise all string values in an object or array.
 * Removes any potentially malicious HTML/JS.
 */
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    // Remove all HTML tags and attributes (keeps plain text only)
    return xss(input, {
      whiteList: [],        // no tags allowed
      stripIgnoreTag: true, // strip all tags
      stripIgnoreTagBody: ['script', 'style'], // remove content inside these
    });
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeDeep);
  }

  if (input && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }

  // For numbers, booleans, null, undefined, etc.
  return input;
}

/**
 * Sanitise a single string.
 *
 * Same policy as sanitizeDeep. Non-string inputs pass through
 * unchanged, so this is safe to call on a value that might be
 * undefined or a number.
 *
 * Used by functions that handle a single scalar value rather than
 * an object body (create-booking, paystack-webhook, send-reset-otp,
 * get-offline-bookings).
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return xss(str, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
}

module.exports = { sanitizeDeep, sanitizeString };