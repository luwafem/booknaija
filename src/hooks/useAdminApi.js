import { useCallback } from 'react';
import { getCsrfToken } from '../lib/csrf';

export function useAdminApi() {
  // ✅ Memoize safeFetch so it has a stable reference
  const safeFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
          ...(options.headers || {}),
        },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
      }
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      throw err;
    }
  }, []); // ✅ empty dependency array → created once

  // ✅ Memoize exportCSV as well for consistency
  const exportCSV = useCallback((data, filename) => {
    if (!data?.length) {
      alert('No data to export.');
      return;
    }
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { safeFetch, exportCSV };
}