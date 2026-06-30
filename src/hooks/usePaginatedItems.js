// src/hooks/usePaginatedItems.js
import { useState, useEffect, useCallback, useRef } from 'react';

export function usePaginatedItems(slug, table, initialLimit = 12) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Prevent overlapping fetch requests (extra safety)
  const isFetching = useRef(false);

  const fetchItems = useCallback(async (pageNum) => {
    // Guard against concurrent fetches
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const res = await fetch(
        `/.netlify/functions/get-business-items?slug=${slug}&table=${table}&page=${pageNum}&limit=${initialLimit}`
      );
      const data = await res.json();

      if (res.ok) {
        if (pageNum === 1) {
          setItems(data.items);
        } else {
          setItems(prev => [...prev, ...data.items]);
        }
        setTotal(data.total);
        setHasMore(pageNum < data.totalPages);
      }
    } catch (error) {
      console.error(`Failed to fetch ${table}:`, error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [slug, table, initialLimit]);

  // `loadMore` depends on `page` and `fetchItems` – both are stable,
  // so it always uses the latest state values.
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage);
    }
  }, [loading, hasMore, page, fetchItems]);

  // Reset and fetch first page when slug or table changes
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
    fetchItems(1);
  }, [slug, table, fetchItems]);

  return { items, loading, hasMore, loadMore, total };
}