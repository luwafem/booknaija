// hooks/usePaginatedItems.js
import { useState, useEffect, useCallback } from 'react';

export function usePaginatedItems(slug, table, initialLimit = 12) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async (pageNum) => {
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
    }
  }, [slug, table, initialLimit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage);
    }
  }, [loading, hasMore, page, fetchItems]);

  // Initial load
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchItems(1);
  }, [slug, table, fetchItems]);

  return { items, loading, hasMore, loadMore, total };
}