// src/lib/csrf.js
export function generateCsrfToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getCsrfToken() {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCsrfToken();
    sessionStorage.setItem('csrf_token', token);
  }
  // Always set the cookie to ensure it's present and matches the token
  const isSecure = location.protocol === 'https:';
  document.cookie = `csrf_token=${token}; path=/; samesite=lax; ${isSecure ? 'secure;' : ''}`;
  return token;
}

export function setCsrfTokenHeader(headers = {}) {
  const token = getCsrfToken();
  return {
    ...headers,
    'X-CSRF-Token': token,
  };
}