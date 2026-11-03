// src/hooks/useLocalAds.js
import { useState, useEffect } from 'react';

// Module-scoped cache so a user navigating between multiple pages in
// the same tab doesn't refetch the same list on each page load. Keyed
// by businessType, and only valid for 5 minutes (same TTL as the
// server's Cache-Control header).
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(businessType) {
  const entry = cache.get(businessType);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL) {
    cache.delete(businessType);
    return null;
  }
  return entry.ads;
}

function setCached(businessType, ads) {
  cache.set(businessType, { ads, at: Date.now() });
}

/**
 * Fetches local ads that match this business page.
 *
 * @param {string} businessType — e.g. 'Lash Artist'. If empty, only
 *   'all'-targeted ads are returned.
 * @returns {{ ads: Array, loading: boolean }}
 */
export function useLocalAds(businessType) {
  const [ads, setAds] = useState(() => getCached(businessType || '') || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = businessType || '';
    const cached = getCached(key);
    if (cached) {
      setAds(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const url = `/.netlify/functions/get-local-ads?businessType=${encodeURIComponent(key)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const result = Array.isArray(data.ads) ? data.ads : [];
        setCached(key, result);
        setAds(result);
      })
      .catch(() => {
        if (!cancelled) setAds([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [businessType]);

  return { ads, loading };
}