// netlify/functions/_utils/sanitize.js
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

module.exports = { sanitizeDeep };