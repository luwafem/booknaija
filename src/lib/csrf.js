// src/lib/csrf.js
export function generateCsrfToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getCsrfToken() {
  let token = sessionStorage.getItem('csrf_token');

  // If no token in sessionStorage, generate a new one
  if (!token) {
    token = generateCsrfToken();
    sessionStorage.setItem('csrf_token', token);
  }

  // Check if the cookie already has this token
  const cookieMatch = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='));
  const existingToken = cookieMatch ? cookieMatch.split('=')[1] : null;

  // Only set the cookie if it doesn't exist or doesn't match the current token
  if (existingToken !== token) {
    const isSecure = location.protocol === 'https:';
    document.cookie = `csrf_token=${token}; path=/; samesite=lax; ${isSecure ? 'secure;' : ''}`;
  }

  return token;
}

export function setCsrfTokenHeader(headers = {}) {
  const token = getCsrfToken();
  return {
    ...headers,
    'X-CSRF-Token': token,
  };
}